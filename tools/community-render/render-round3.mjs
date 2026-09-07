import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import crypto from 'node:crypto';
import {build} from 'esbuild';
const root=path.resolve(import.meta.dirname,'../..');
const items=JSON.parse(fs.readFileSync(path.join(root,'data/round3-candidates.json')));
const imports=items.filter(e=>e.renderProps.library==='remotion-ui');
fs.writeFileSync(path.join(import.meta.dirname,'round3-imports.ts'),imports.map((e,i)=>`import {${e.en} as C${i}} from ${JSON.stringify('../../'+e.renderProps.file)};`).join('\n')+'\nexport const components:Record<string,any>={'+imports.map((e,i)=>`${JSON.stringify(e.renderProps.variant)}:C${i}`).join(',')+'};');
await build({entryPoints:[path.join(import.meta.dirname,'round3.tsx')],bundle:true,outfile:path.join(import.meta.dirname,'round3-bundle.js'),jsx:'automatic',nodePaths:[path.join(import.meta.dirname,'node_modules')],alias:{'@/remotion':path.join(root,'assets/community/remotion-ui/apps/web/registry/bases/default'),'@remotion/google-fonts/Inter':path.join(import.meta.dirname,'local-inter.ts'),'@remotion/google-fonts/NotoColorEmoji':path.join(import.meta.dirname,'local-emoji.ts')},define:{'process.env.NODE_ENV':'"production"'},minify:true});
const require=createRequire(import.meta.url);
const puppeteer=require(process.env.ATELIER_PUPPETEER || 'puppeteer-core');
const browser=await puppeteer.launch({executablePath:process.env.ATELIER_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const completed=[],failures=[];
try{
 const page=await browser.newPage();await page.setViewport({width:640,height:360,deviceScaleFactor:1});
 // Fixed seed only for rough path generation in the capture page; no library code edits.
 await page.evaluateOnNewDocument(()=>{let s=1421;Math.random=()=>((s=Math.imul(1664525,s)+1013904223>>>0)/4294967296)});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>errors.push(r.url()+': '+r.failure()?.errorText));
 await page.goto('http://127.0.0.1:4173/tools/community-render/round3.html');await page.waitForFunction('typeof window.prepare === "function"');
 for(const item of items){
  try{
   const video=path.join(root,item.videoPreview),poster=path.join(root,item.poster);
   if(!fs.existsSync(video)){
    errors.length=0;await page.evaluate(p=>window.prepare(p),{...item.renderProps,frames:item.duration*24});
    const child=spawn('ffmpeg',['-v','error','-f','image2pipe','-framerate','24','-vcodec','mjpeg','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',video],{stdio:['pipe','ignore','pipe']});
    let error='';child.stderr.on('data',x=>error+=x);const closed=once(child,'close');
    for(let f=0;f<item.duration*24;f++){
     await page.evaluate(f=>window.seek(f),f);const frame=await page.screenshot({type:'jpeg',quality:90});
     if(f===Math.round(item.duration*24*(item.id==='rui-depth-of-field-blur'?.85:.55)))fs.writeFileSync(poster,frame);
     if(!child.stdin.write(frame))await once(child.stdin,'drain');
    }
    child.stdin.end();const [code]=await closed;if(code)throw new Error(error);
    if(errors.length)throw new Error(errors.join('\n'));
   }
   item.videoProvenance.sha256=crypto.createHash('sha256').update(fs.readFileSync(video)).digest('hex');
   if(item.id==='rui-reaction-burst')item.previewNote+=' 表情按原组件允许的后备字体使用本机 Apple Color Emoji。';
   completed.push(item);console.log('READY',completed.length,items.length,item.id);
  }catch(e){failures.push({id:item.id,error:String(e)});console.log('FAILED',item.id,String(e));}
 }
 const folder=path.join(root,'data/qa/round3');fs.mkdirSync(folder,{recursive:true});
 fs.writeFileSync(path.join(root,'data/round3-effects.json'),JSON.stringify(completed,null,2));
 fs.writeFileSync(path.join(folder,'render.json'),JSON.stringify({completed:completed.length,failures},null,2));
}finally{await browser.close();}
if(failures.length)process.exitCode=1;
