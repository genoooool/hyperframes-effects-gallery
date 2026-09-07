// Offline author-shader preview capture. The gallery only consumes resulting MP4s.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import crypto from 'node:crypto';
const require=createRequire(import.meta.url);
const root=path.resolve(import.meta.dirname,'..');
const puppeteer=require(process.env.ATELIER_PUPPETEER || path.join(root,'tools/community-render/node_modules/puppeteer-core'));
const browser=await puppeteer.launch({executablePath: process.env.ATELIER_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const failures=[], completed=[];
try {
  const page=await browser.newPage();await page.setViewport({width:640,height:360});
  await page.goto('http://127.0.0.1:4173/scripts/gl-preview.html');
  const records=JSON.parse(fs.readFileSync(path.join(root,'data/research/gl-transitions-1.71.0.json')));
  const only=process.argv.includes('--only')?process.argv[process.argv.indexOf('--only')+1]:null;
  const items=JSON.parse(fs.readFileSync(path.join(root,only?'data/gl-effects.json':'data/gl-candidates.json')));
  for(const item of items) {
    if(only && item.en!==only){completed.push(item);continue;}
    try {
      if(item.en==='burn'){
        item.videoPreview='assets/community/gl-transitions/burn/preview-color.mp4';
        item.poster='assets/community/gl-transitions/burn/poster-color.jpg';
        item.videoProvenance.parameterOverride={color:[0.9,0.4,0.2],reason:'Original GLSL inline default, omitted from npm 1.71.0 metadata'};
        item.usageCaveat='npm 参数索引漏掉 color；须按源码注释显式设置 color=vec3(0.9,0.4,0.2)，否则退化为普通交叉淡化。';
        item.previewNote='原始 GLSL 实渲，显式使用作者源码注释中的暖色参数；修正了上游 npm 参数索引遗漏导致的无染色预览。未接入 HyperFrames。';
      }
      const video=path.join(root,item.videoPreview), poster=path.join(root,item.poster);
      if(process.argv.includes('--posters-only')) {
        await page.evaluate(record=>window.prepare(record),records.find(r=>r.name===item.en));
        fs.writeFileSync(poster,Buffer.from(await page.evaluate(p=>window.draw(p),item.posterProgress ?? 0.38),'base64'));
      }
      if(!fs.existsSync(video)) {
        await page.evaluate(record=>window.prepare(record),records.find(r=>r.name===item.en));
        const frames=await page.evaluate(()=>Array.from({length:60},(_,i)=>window.draw(Math.max(0,Math.min(1,(i-8)/36)))));
        fs.writeFileSync(poster,Buffer.from(await page.evaluate(p=>window.draw(p),item.posterProgress ?? 0.38),'base64'));
        const child=spawn('ffmpeg',['-v','error','-f','image2pipe','-framerate','24','-vcodec','mjpeg','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',video],{stdio:['pipe','ignore','pipe']});
        let error='';child.stderr.on('data',x=>error+=x);const closed=once(child,'close');
        for(const frame of frames)if(!child.stdin.write(Buffer.from(frame,'base64')))await once(child.stdin,'drain');
        child.stdin.end();const [code]=await closed;if(code)throw new Error(error);
      }
      item.videoProvenance.sha256=crypto.createHash('sha256').update(fs.readFileSync(video)).digest('hex');
      completed.push(item);console.log(`READY ${completed.length}/${items.length} ${item.en}`);
    } catch(error) { failures.push({id:item.id,error:String(error)});console.log(`FAILED ${item.en}: ${error}`); }
  }
  fs.writeFileSync(path.join(root,'data/gl-effects.json'),JSON.stringify(completed,null,2));
  fs.writeFileSync(path.join(root,'data/research/gl-render-results.json'),JSON.stringify({completed:completed.length,failures},null,2));
} finally {await browser.close();}
if(failures.length)process.exitCode=1;
