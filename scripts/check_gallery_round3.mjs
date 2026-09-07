import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const root=path.resolve(import.meta.dirname,'..');
const puppeteer=require(process.env.ATELIER_PUPPETEER || path.join(root,'tools/community-render/node_modules/puppeteer-core'));
const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
 const page=await browser.newPage();await page.setViewport({width:1440,height:1000});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:4173/#library');await page.waitForFunction('effects.length===255');
 // Fresh isolated browser storage: exercise the old saved IDs without touching user favourites.
 await page.evaluate(()=>localStorage.setItem('hf-atelier-official-favorites',JSON.stringify(['kit-pill-karaoke','rough-bracket','gl-wiperight'])));
 await page.reload();await page.waitForFunction('effects.length===255');
 const report=await page.evaluate(async()=>{
  const assert=(ok,message)=>{if(!ok)throw new Error(message)};
  assert(favorites.has('caption-pill-karaoke')&&favorites.has('hw-underline')&&favorites.has('gl-wipeleft'),'Favourite migration');
  assert(favorites.size===3,'Favourite count');
  const out={count:effects.length,sourceCount:sourceEffects.size,migrated:[...favorites],maxVideos:0,loaded:[],variants:[],filters:{}};
  const ready=async()=>{const v=active.player;await new Promise((resolve,reject)=>{if(v.readyState>=2)return resolve();const timer=setTimeout(()=>reject(new Error('Media timeout')),4000);v.addEventListener('loadeddata',()=>{clearTimeout(timer);resolve()},{once:true});v.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('Media error'))},{once:true})});out.maxVideos=Math.max(out.maxVideos,document.querySelectorAll('video').length);};
  const close=()=>new Promise(resolve=>{dialog.addEventListener('close',resolve,{once:true});dialog.close()});
  const ids=[...sourceEffects.keys()].filter(id=>/^(rui-|rough-)/.test(id)||['hw-underline','marker-highlight','confetti','gl-burn'].includes(id));
  for(const id of ids){openEffect(id);await ready();assert(buildUsageBrief(selected).includes('undefined')===false,'Invalid brief '+id);out.loaded.push(id);await close();}
  for(const canonical of effects.filter(e=>e.alternatives?.length)){
   openEffect(canonical.id);await ready();
   for(const alt of canonical.alternatives){document.querySelector('#sourceVariants').open=true;document.querySelector('[data-variant="'+alt.id+'"]').click();await ready();assert(selected.id===alt.id,'Variant switching');out.variants.push(alt.id);}
   await close();
  }
  assert(document.querySelectorAll('video').length===0,'Video release');
  for(const origin of ['all','official','remotion','glsl','web']){setOrigin(origin);out.filters[origin]=document.querySelectorAll('#grid .card').length;assert(out.filters[origin]>0,'Empty source filter');}
  setOrigin('all');query='rough-bracket';renderCards();assert(document.querySelector('#grid [data-preview]')?.dataset.preview==='hw-underline','Alias search');query='';category='信息提示';buildFilters();renderCards();
  window.scrollTo({top:1300,behavior:'instant'});
  out.stickyTop=document.querySelector('.library-toolbar').getBoundingClientRect().top;out.headerHeight=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height'));out.overflow=document.documentElement.scrollWidth>innerWidth;
  assert(out.maxVideos===1&&!out.overflow,'Resource/layout invariant');
  return out;
 });
 if(errors.length)throw new Error(errors.join('\n'));
 fs.writeFileSync(path.join(root,'data/qa/round3/browser.json'),JSON.stringify(report,null,2));
 await page.screenshot({path:path.join(root,'data/qa/round3/gallery-desktop.png')});console.log(JSON.stringify(report));
}finally{await browser.close();}
