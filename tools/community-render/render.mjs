import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import crypto from 'node:crypto';
import {build} from 'esbuild';
const root=path.resolve(import.meta.dirname,'../..');
await build({entryPoints:[path.join(import.meta.dirname,'preview.tsx')],bundle:true,outfile:path.join(import.meta.dirname,'bundle.js'),jsx:'automatic',nodePaths:[path.join(import.meta.dirname,'node_modules')],define:{'process.env.NODE_ENV':'"production"'},minify:true});
const require=createRequire(import.meta.url);
const puppeteer=require(process.env.ATELIER_PUPPETEER || 'puppeteer-core');
const browser=await puppeteer.launch({executablePath:process.env.ATELIER_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const completed=[],failures=[];
try {
  const page=await browser.newPage();await page.setViewport({width:640,height:360,deviceScaleFactor:1});
  const errors=[];page.on('pageerror',error=>errors.push(String(error)));
  await page.goto('http://127.0.0.1:4173/tools/community-render/index.html');
  await page.waitForFunction('typeof window.prepare === "function"');
  for(const item of JSON.parse(fs.readFileSync(path.join(root,'data/native-caption-candidates.json')))){
    try {
      const video=path.join(root,item.videoPreview),poster=path.join(root,item.poster);
      if(!fs.existsSync(video)) {
        errors.length=0;await page.evaluate(props=>window.prepare(props),item.renderProps);
        const child=spawn('ffmpeg',['-v','error','-f','image2pipe','-framerate','24','-vcodec','mjpeg','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',video],{stdio:['pipe','ignore','pipe']});
        let error='';child.stderr.on('data',x=>error+=x);const closed=once(child,'close');
        for(let frame=0;frame<96;frame++){
          await page.evaluate(f=>window.seek(f),frame);
          const image=await page.screenshot({type:'jpeg',quality:90});
          if(frame===30)fs.writeFileSync(poster,image);
          if(!child.stdin.write(image))await once(child.stdin,'drain');
        }
        child.stdin.end();const [code]=await closed;if(code)throw new Error(error);
        if(errors.length)throw new Error(errors.join('\n'));
      }
      item.videoProvenance.sha256=crypto.createHash('sha256').update(fs.readFileSync(video)).digest('hex');
      completed.push(item);console.log('NATIVE READY',item.id);
    }catch(error){failures.push({id:item.id,error:String(error)});console.log('FAILED',item.id,String(error));}
  }
  fs.writeFileSync(path.join(root,'data/native-caption-effects.json'),JSON.stringify(completed,null,2));
  fs.writeFileSync(path.join(root,'data/research/native-caption-render-results.json'),JSON.stringify({completed:completed.length,failures},null,2));
}finally{await browser.close();}
if(failures.length)process.exitCode=1;
