/* Atelier knowledge motion v1. Independently authored; see reference-map.json. */
(() => {
 'use strict';
 const config=JSON.parse(document.getElementById('template-config').textContent);
 const supplied=window.__hyperframes?.getVariables?.()||{};
 const v={...config.defaults,...supplied};
 const scene=document.getElementById('scene'),host=document.getElementById('content');
 const color=(value,fallback)=>/^#[0-9a-f]{6}$/i.test(value)?value:fallback;
 host.style.setProperty('--accent',color(v.accent,'#176957'));
 document.getElementById('paper').style.background=v.transparent?'transparent':color(v.background,'#f3eee3');
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const labels=String(v.labels).split('|').map(s=>s.trim());
 const values=String(v.values).split(',').filter(s=>s.trim()).map(Number);
 if(values.some(n=>!Number.isFinite(n)||n<0))throw new Error('values must be finite nonnegative numbers');
 const text=(s,n=70)=>{if(String(s).length>n)throw new Error('Text exceeds template capacity: '+n);return esc(s);};
 text(v.title,24);labels.forEach(s=>text(s,38));
 const tl=gsap.timeline({paused:true});
 const enter=(els,at=.4,extra={})=>tl.from(els,{y:18,opacity:0,duration:.55,stagger:.16,ease:'power3.out',...extra},at);
 const draw=(el,at,duration=1)=>{const len=el.getTotalLength();tl.fromTo(el,{strokeDasharray:len,strokeDashoffset:len},{strokeDashoffset:0,duration,ease:'power2.inOut'},at);};
 const q=s=>host.querySelectorAll(s);
 const shell=()=>{host.innerHTML=`<h1>${text(v.title)}</h1><div class="body"></div><p class="note">${text(v.note,85)}</p>`;enter(q('h1'),.1);enter(q('.note'),4);return host.querySelector('.body');};
 const nums=n=>{if(values.length!==n||labels.length!==n)throw new Error('Matching labels and values required: '+n);};
 const unit=`<span class="unit">${text(v.unit,8)}</span>`;
 const svg=(s)=>`<svg width="832" height="310" viewBox="0 0 832 310">${s}</svg>`;
 const kind=config.kind;
 if(['bars','line','turn'].includes(kind)){
  if(labels.length<3||labels.length>7)throw new Error('Charts accept 3 to 7 points');nums(labels.length);
  const body=shell(),max=Math.max(...values,1),top=Math.ceil(max/10)*10,n=values.length;
  const xs=values.map((_,i)=>80+i*660/(n-1)),ys=values.map(x=>252-x/top*205);
  let markup=[0,.5,1].map(f=>`<line class="grid" x1="52" y1="${252-f*205}" x2="806" y2="${252-f*205}"/><text x="40" y="${258-f*205}" text-anchor="end">${top*f}</text>`).join('');
  if(kind==='bars')markup+=values.map((num,i)=>`<g class="series"><rect class="bar" x="${xs[i]-28}" y="${ys[i]}" width="56" height="${252-ys[i]}" rx="3" fill="${i===values.indexOf(max)?'#a14730':'var(--accent)'}"/><text class="datum" x="${xs[i]}" y="${ys[i]-14}" text-anchor="middle">${num}</text></g>`).join('');
  else {markup+=`<path class="draw trend" d="M ${xs.map((x,i)=>x+','+ys[i]).join(' L ')}"/>`;markup+=values.map((num,i)=>`<g class="point"><circle class="dot" cx="${xs[i]}" cy="${ys[i]}" r="6"/><text x="${xs[i]}" y="${ys[i]-18}" text-anchor="middle">${num}</text></g>`).join('');}
  markup+=labels.map((l,i)=>`<text x="${xs[i]}" y="286" text-anchor="middle">${text(l,8)}</text>`).join('');
  markup+=`<text x="806" y="12" text-anchor="end">${text(v.unit,8)}</text>`;body.innerHTML=svg(markup);
  if(kind==='bars'){tl.from(q('.bar'),{scaleY:0,svgOrigin:'0 252',duration:1.2,stagger:.22,ease:'power3.out'},.65);enter(q('.datum'),1.3);}
  else {const line=q('.trend')[0];draw(line,.6,2.5);q('.point').forEach((p,i)=>enter(p,.7+i*2.4/(n-1),{y:0,duration:.25}));}
  if(kind==='turn'){
   const focus=Math.max(0,Math.min(n-1,Math.floor(Number(v.focus)||0))),x=xs[focus],y=ys[focus];
   const annotation=document.createElementNS('http://www.w3.org/2000/svg','g');annotation.innerHTML=`<path class="draw leader" d="M${x},${y+10} L${x},235"/><rect x="${Math.max(100,Math.min(570,x-100))}" y="195" width="220" height="40" rx="6" fill="#deebdf"/><text x="${Math.max(100,Math.min(570,x-100))+110}" y="221" text-anchor="middle">${text(v.explanation,10)}</text>`;
   body.querySelector('svg').append(annotation);enter(annotation,3.2,{y:0});
  }
 } else if(['compare','choice','state'].includes(kind)){
  const body=shell();if(labels.length!==2)throw new Error('Two labels required');
  if(kind==='compare')nums(2);
  body.innerHTML=`<div class="pair">${labels.map((l,i)=>`<div class="tile"><p class="label">${text(l,14)}</p>${kind==='compare'?`<p class="value">${values[i]}${unit}</p>`:kind==='choice'?`<p class="copy muted">${text(i?v.detailB:v.detailA,30)}</p>`:''}</div>`).join('')}</div>`;
  if(kind==='state'){body.querySelectorAll('.label').forEach(e=>e.style.fontSize='46px');const el=document.createElement('span');el.className='arrow';el.style.cssText='left:394px;top:140px';el.textContent='→';body.append(el);enter(q('.tile'),.4,{x:-30,y:0,stagger:1.4});enter(el,1.4);}
  else {enter(q('.tile'),.5,{x:kind==='choice'?25:0,stagger:kind==='choice'?0:.8});enter(q('.value,.copy'),1.15);}
 } else if(kind==='hbars'){
  nums(2);const body=shell(),max=Math.max(...values,1);
  body.innerHTML=labels.map((l,i)=>`<div style="margin:30px 0 48px"><p class="label">${text(l,16)}</p><div style="height:36px;background:#d7ddcf;margin-top:18px;position:relative;width:670px"><div class="measure" style="height:36px;width:${values[i]/max*670}px;background:${i?'#a14730':'var(--accent)'};transform-origin:left"></div><span style="position:absolute;left:695px;top:-6px;font-size:32px">${values[i]}<small style="font-size:16px">${text(v.unit,8)}</small></span></div></div>`).join('');
  enter(q('.label'),.4);tl.from(q('.measure'),{scaleX:0,duration:1.6,stagger:.7,ease:'power3.out'},.7);
 } else if(kind==='rank'){
  nums(3);const body=shell(),order=values.map((n,i)=>({n,label:labels[i]})).sort((a,b)=>b.n-a.n);
  body.innerHTML=order.map((item,i)=>`<div class="rank-row"><span class="order">${i+1}</span><span class="name">${text(item.label,16)}</span><span class="score">${item.n}<small>${text(v.unit,8)}</small></span></div>`).join('');
  enter(q('.rank-row'),.5,{x:-35,y:0,stagger:.55});
 } else if(['citation','concept','duel','timeline'].includes(kind)){
  if(kind==='duel')nums(2);const wrap=document.createElement('div');wrap.className='overlay';
  wrap.style.cssText=kind==='concept'?'left:64px;top:210px;width:620px;min-height:245px':'left:64px;bottom:55px;width:832px;min-height:155px';
  host.append(wrap);
  if(kind==='citation')wrap.innerHTML=`<p class="muted">${text(labels[0])}</p><div class="rule" style="margin:16px 0"></div><h2>${text(v.title)}</h2><p>${text(labels[1])}</p>`;
  if(kind==='concept')wrap.innerHTML=`<h2 style="font-size:42px">${text(labels[0],14)}</h2><p class="definition">${text(labels[1],38)}</p><div class="rule" style="margin-top:22px"></div>`;
  if(kind==='duel')wrap.innerHTML=`<h2>${text(v.title)}</h2><div style="display:flex;gap:80px">${labels.map((l,i)=>`<p class="duo"><span class="muted">${text(l,12)}</span> <strong style="font-size:58px">${values[i]}</strong>${unit}</p>`).join('')}</div>`;
  if(kind==='timeline'){if(labels.length!==3)throw new Error('Three timeline labels required');wrap.innerHTML=`<h2>${text(v.title)}</h2><svg width="730" height="70"><path class="draw rail" d="M20,20 H710"/>${labels.map((l,i)=>`<g class="milestone"><circle class="dot" cx="${20+i*345}" cy="20" r="7"/><text x="${20+i*345}" y="60" text-anchor="${i===0?'start':i===2?'end':'middle'}">${text(l,10)}</text></g>`).join('')}</svg>`;draw(q('.rail')[0],.8,2);q('.milestone').forEach((el,i)=>enter(el,.8+i,{y:0}));}
  wrap.insertAdjacentHTML('beforeend',`<p class="note">${text(v.note,70)}</p>`);enter(wrap,.25,{x:-24,y:0});
  if(kind==='citation'||kind==='concept'){tl.from(q('.rule'),{scaleX:0,duration:.7},1);enter(q('h2,.definition'),1.25);}
  if(kind==='duel')enter(q('.duo'),.8,{stagger:.6});
 } else if(kind==='meter'){
  if(values.length!==1||values[0]>100)throw new Error('Percentage must be between 0 and 100');const body=shell();
  body.innerHTML=`<p class="label">${text(labels[0],20)}</p><p class="value" style="margin:15px 0 25px">${values[0]}${unit}</p><div style="display:flex;gap:6px">${Array.from({length:20},(_,i)=>`<span class="tick"><i style="width:${Math.max(0,Math.min(1,values[0]/5-i))*100}%"></i></span>`).join('')}</div>`;
  enter(q('.label,.value'),.5);tl.from(q('.tick i'),{scaleX:0,duration:.18,stagger:.09,ease:'none'},1);
 } else if(['steps','cause'].includes(kind)){
  if(labels.length!==3)throw new Error('Three steps required');const body=shell();
  body.innerHTML=`<div class="steps">${labels.map((l,i)=>`<div class="step tile" style="${kind==='steps'?`margin-top:${(2-i)*28}px`:''}"><span class="index">${kind==='steps'?'0'+(i+1):['因','经','果'][i]}</span><h2>${text(l,16)}</h2></div>`).join('')}</div>${[0,1].map(i=>`<span class="arrow" style="left:${266+i*288}px;top:148px">→</span>`).join('')}`;
  q('.step').forEach((el,i)=>enter(el,.4+i*.9));q('.arrow').forEach((el,i)=>enter(el,1+i*.9,{x:-10,y:0}));
 } else if(kind==='myth'){
  if(labels.length!==2)throw new Error('Two statements required');const body=shell();
  body.innerHTML=`<div class="old" style="position:relative;font-size:35px;margin:30px 0 60px;width:fit-content">${text(labels[0],23)}<span class="strike"></span></div><div class="new" style="font-size:41px;line-height:1.5;font-weight:650;max-width:820px">${text(labels[1],30)}</div>`;
  enter(q('.old'),.35);tl.from(q('.strike'),{scaleX:0,duration:.45,ease:'power2.inOut'},1.7);tl.to(q('.old'),{opacity:.5,duration:.5},2.2);enter(q('.new'),2.3,{y:35});
 } else if(kind==='loop'){
  if(labels.length!==4)throw new Error('Four loop steps required');const body=shell();
  body.innerHTML=svg('<path class="draw circuit" d="M180,65 H650 Q700,65 700,115 V205 Q700,255 650,255 H180 Q130,255 130,205 V115 Q130,65 180,65"/>')+labels.map((l,i)=>`<div class="loop-node" style="left:${[70,500,500,70][i]}px;top:${[15,15,205,205][i]}px"><b>${i+1}</b>${text(l,6)}</div>`).join('');
  draw(q('.circuit')[0],.65,3.1);q('.loop-node').forEach((el,i)=>enter(el,.4+i*.8,{y:0,scale:.94}));
 } else throw new Error('Unknown template kind');
 // A finite hold prevents render-duration inference from shortening readable states.
 tl.to(scene,{opacity:1,duration:.01},5.99);
 window.__timelines=window.__timelines||{};
 window.__timelines[config.id]=tl;
})();
