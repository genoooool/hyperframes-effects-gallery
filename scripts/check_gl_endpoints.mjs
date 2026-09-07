import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const root=path.resolve(import.meta.dirname,'..');
const puppeteer=require(process.env.ATELIER_PUPPETEER || path.join(root,'tools/community-render/node_modules/puppeteer-core'));
const browser=await puppeteer.launch({executablePath:process.env.ATELIER_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
 const page=await browser.newPage();await page.goto('http://127.0.0.1:4173/scripts/gl-preview.html');
 const records=JSON.parse(fs.readFileSync(path.join(root,'data/research/gl-transitions-1.71.0.json')));
 const results=await page.evaluate(records=>{
   function pixels(){const p=new Uint8Array(640*360*4);gl.readPixels(0,0,640,360,gl.RGBA,gl.UNSIGNED_BYTE,p);return p;}
   window.prepare(records.find(r=>r.name==='fade'));window.draw(0);const a=pixels();window.draw(1);const b=pixels();
   function delta(expected){const actual=pixels();let changed=0;for(let i=0;i<actual.length;i+=4)if(Math.max(...[0,1,2].map(j=>Math.abs(actual[i+j]-expected[i+j])))>12)changed++;return changed/(640*360);}
   return records.map(r=>{window.prepare(r);window.draw(0);const start=delta(a);window.draw(1);const end=delta(b);return {name:r.name,startDifferentFraction:start,endDifferentFraction:end,pass:start<0.01&&end<0.01};});
 },records);
 fs.writeFileSync(path.join(root,'data/qa/community-expansion/gl-endpoints.json'),JSON.stringify(results,null,2));
 console.log(JSON.stringify({checked:results.length,endpointDifferences:results.filter(r=>!r.pass)},null,2));
}finally{await browser.close();}
