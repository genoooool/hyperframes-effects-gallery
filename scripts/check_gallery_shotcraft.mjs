// Focused integration check for the new source batch. Own and close the test
// server/browser, leaving the user's existing browser and favourites untouched.
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const root=path.resolve(import.meta.dirname,'..');
const puppeteer=require(path.join(root,'tools/community-render/node_modules/puppeteer-core'));
const batch=JSON.parse(fs.readFileSync(path.join(root,'data/shotcraft-effects.json')));
const catalog=JSON.parse(fs.readFileSync(path.join(root,'data/gallery-effects.json')));
const qa=path.join(root,'data/qa/shotcraft');
fs.mkdirSync(qa,{recursive:true});
const log=fs.openSync(path.join(qa,'server.log'),'a');
const server=spawn('python3',['-u','scripts/serve.py','--port','4187'],{cwd:root,stdio:['ignore','pipe',log]});
let browser;
try {
 await Promise.race([once(server.stdout,'data'),once(server,'exit').then(()=>{throw new Error('Test server exited');})]);
 browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const page=await browser.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.setViewport({width:1440,height:1000});
 await page.goto('http://127.0.0.1:4187/#library');
 await page.waitForFunction(n=>effects.length===n,{},catalog.effects.length);
 const report=await page.evaluate(async({ids,rawCount})=>{
  const assert=(v,m)=>{if(!v)throw new Error(m);};
  assert(sourceEffects.size===rawCount,'Raw source count');
  assert(document.querySelectorAll('video').length===0,'No idle video');
  const result={count:effects.length,sourceCount:sourceEffects.size,loaded:[],variants:[],categories:{},maxVideos:0};
  const ready=async()=>{
   const v=active.player;
   await new Promise((resolve,reject)=>{
    if(v.readyState>=2)return resolve();
    const timer=setTimeout(()=>reject(new Error('Media timeout '+selected.id)),8000);
    v.addEventListener('loadeddata',()=>{clearTimeout(timer);resolve();},{once:true});
    v.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('Media error'));},{once:true});
   });
   v.pause();result.maxVideos=Math.max(result.maxVideos,document.querySelectorAll('video').length);
   assert(v.videoWidth>0&&v.duration>0,'Decoded video');
   return v;
  };
  const close=()=>new Promise(resolve=>{dialog.addEventListener('close',resolve,{once:true});dialog.close();});
  for(const id of ids){
   openEffect(id);const v=await ready();
   assert(selected.id===id,'Exact source selected');
   const brief=buildUsageBrief(selected);
   assert(!brief.includes('undefined')&&brief.includes('待适配')&&brief.includes('Remotion'),'Usage brief '+id);
   assert(selected.previewNote.includes('作者原始 MP4'),'Preview provenance '+id);
   v.currentTime=Math.min(v.duration*.6,v.duration-.1);
   await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Seek timeout '+id)),8000);
    v.addEventListener('seeked',()=>{clearTimeout(timer);resolve();},{once:true});
   });
   result.loaded.push(id);await close();
  }
  for(const canonical of effects.filter(e=>e.alternatives?.some(a=>ids.includes(a.id)))){
   openEffect(canonical.id);await ready();
   for(const alt of canonical.alternatives.filter(a=>ids.includes(a.id))){
    document.querySelector('#sourceVariants').open=true;
    document.querySelector(`[data-variant="${alt.id}"]`).click();await ready();
    assert(selected.id===alt.id,'Source switch');result.variants.push(alt.id);
   }
   await close();
  }
  query='shotcraft';category='全部';renderCards();
  result.searchCount=document.querySelectorAll('#grid .card').length;
  assert(result.searchCount===ids.length,'Search includes merged aliases');
  for(const cat of categories){category=cat;buildFilters();renderCards();result.categories[cat]=document.querySelectorAll('#grid .card').length;assert(result.categories[cat]>0,'Category '+cat);}
  category='素材展示';buildFilters();renderCards();
  assert(document.querySelectorAll('video').length===0&&result.maxVideos===1,'Player lifecycle');
  assert(document.documentElement.scrollWidth<=innerWidth,'Desktop overflow');
  return result;
 },{ids:batch.map(e=>e.id),rawCount:catalog.rawCount});
 await page.screenshot({path:path.join(qa,'gallery-desktop.png')});
 await page.evaluate(()=>openEffect('shotcraft-card-stack'));
 await page.waitForFunction(()=>active?.player?.readyState>=2);
 await page.evaluate(()=>{active.player.currentTime=active.player.duration*.8;});
 await page.waitForFunction(()=>active?.player&&!active.player.seeking);
 await page.screenshot({path:path.join(qa,'detail-desktop.png')});
 const playback=await page.evaluate(async()=>{
  const v=active.player;v.currentTime=.1;v.playbackRate=2;await v.play();
  await new Promise(resolve=>setTimeout(resolve,450));v.pause();return {time:v.currentTime,speed:v.playbackRate};
 });
 if(playback.time<.4||playback.speed!==2)throw new Error('Playback/speed check failed');
 report.playback=playback;
 await page.evaluate(()=>dialog.close());
 await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
 await page.reload();await page.waitForFunction(n=>effects.length===n,{},catalog.effects.length);
 await page.evaluate(()=>{query='shotcraft';category='素材展示';buildFilters();renderCards();});
 await page.screenshot({path:path.join(qa,'gallery-mobile.png')});
 await page.click('[data-preview="shotcraft-card-stack"]');
 await page.waitForFunction(()=>selected?.id==='shotcraft-card-stack'&&active?.player?.readyState>=2);
 await page.screenshot({path:path.join(qa,'detail-mobile.png')});
 report.mobile=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,selected:selected.id,videos:document.querySelectorAll('video').length}));
 if(report.mobile.scrollWidth>report.mobile.width||report.mobile.videos!==1)throw new Error('Mobile layout/player failure');
 await page.evaluate(()=>dialog.close());
 if(errors.length)throw new Error(errors.join('\n'));
 report.errors=errors;
 fs.writeFileSync(path.join(qa,'browser.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({...report,loaded:report.loaded.length}));
} finally {
 if(browser)await browser.close();
 if(server.exitCode===null&&server.signalCode===null){server.kill('SIGTERM');await once(server,'exit');}
 fs.closeSync(log);
}
