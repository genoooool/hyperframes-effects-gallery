/* Atelier knowledge motion v2. Independently authored; see DESIGN.md. */
(() => {
 'use strict';
 const config=JSON.parse(document.getElementById('template-config').textContent);
 const v={...config.defaults,...(window.__hyperframes?.getVariables?.()||{})};
 const scene=document.getElementById('scene'),host=document.getElementById('content');
 const color=(value,fallback)=>/^#[0-9a-f]{6}$/i.test(value)?value:fallback;
 host.style.setProperty('--accent',color(v.accent,'#dce8e0'));
 const alpha=Number(v.panelOpacity??82);
 if(!Number.isFinite(alpha)||alpha<70||alpha>96)throw new Error('panelOpacity must be between 70 and 96');
 document.documentElement.style.setProperty('--panel-alpha',alpha/100);
 document.getElementById('paper').style.background=v.transparent?'transparent':color(v.background,'#111214');
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const text=(s,n=70)=>{if(String(s).length>n)throw new Error('Text exceeds template capacity: '+n);return esc(s);};
 const labels=String(v.labels).split('|').map(s=>s.trim());
 const values=String(v.values).split(',').filter(s=>s.trim()).map(Number);
 if(values.some(n=>!Number.isFinite(n)||n<0))throw new Error('values must be finite nonnegative numbers');
 text(v.title,24);labels.forEach(s=>text(s,38));
 const nums=n=>{if(values.length!==n||labels.length!==n)throw new Error('Matching labels and values required: '+n);};
 const tl=gsap.timeline({paused:true});
 const enter=(els,at=.4,extra={})=>tl.fromTo(els,{y:12,opacity:0,...extra},{y:0,x:0,scale:1,opacity:1,duration:.5,stagger:.16,ease:'power3.out'},at);
 const draw=(el,at,duration=1)=>{const len=el.getTotalLength();tl.fromTo(el,{strokeDasharray:len,strokeDashoffset:len},{strokeDashoffset:0,duration,ease:'power2.inOut'},at);};
 const q=s=>host.querySelectorAll(s);
 const shell=(floating=false)=>{host.innerHTML=`<section class="${floating?'float-shell':'card'}"><header class="heading"><h1>${text(v.title)}</h1></header><div class="body"></div><p class="note">${text(v.note,85)}</p></section>`;if(!floating)enter(q('.card'),0);enter(q('.heading'),.15);enter(q('.note'),3.6);return host.querySelector('.body');};
 const unit=`<span class="unit">${text(v.unit,8)}</span>`;
 const kind=config.kind;
 if(['bars','line','turn'].includes(kind)){
  if(labels.length<3||labels.length>7)throw new Error('Charts accept 3 to 7 points');nums(labels.length);
  const body=shell(),n=values.length,max=Math.max(...values,1),top=Math.ceil(max/10)*10;
  const base=kind==='turn'?158:205,span=kind==='turn'?105:153;
  const xs=values.map((_,i)=>64+i*640/(n-1)),ys=values.map(value=>base-value/top*span);
  let markup=`<line class="grid" x1="22" y1="${base}" x2="746" y2="${base}"/>`;
  if(kind!=='bars')markup+=`<line class="grid" x1="22" y1="${base-span}" x2="746" y2="${base-span}"/><text x="0" y="${base+5}">0</text>`;
  if(kind==='bars')markup+=values.map((num,i)=>`<g class="series"><rect class="bar" x="${xs[i]-34}" y="${ys[i]}" width="68" height="${base-ys[i]}" rx="9" fill="${i===n-1?'var(--accent)':'var(--secondary)'}"/><text class="datum" x="${xs[i]}" y="${ys[i]-13}" text-anchor="middle">${num}</text></g>`).join('');
  else {
   markup+=xs.slice(1).map((x,i)=>`<path class="trend segment" d="M${xs[i]},${ys[i]} L${x},${ys[i+1]}"/>`).join('');
   markup+=values.map((num,i)=>`<g class="point"><circle class="dot" cx="${xs[i]}" cy="${ys[i]}" r="5"/><text class="datum" x="${xs[i]}" y="${ys[i]-16}" text-anchor="middle">${num}</text></g>`).join('');
  }
  markup+=labels.map((l,i)=>`<text x="${xs[i]}" y="${base+30}" text-anchor="middle">${text(l,8)}</text>`).join('');
  markup+=`<text x="746" y="8" text-anchor="end">单位：${text(v.unit,8)}</text>`;
  body.innerHTML=`<svg class="chart" width="768" height="${kind==='turn'?201:254}" viewBox="0 0 768 ${kind==='turn'?201:254}" style="height:${kind==='turn'?201:254}px">${markup}</svg>`;
  if(kind==='bars')q('.series').forEach((series,i)=>{
   const at=.6+i*.2,height=base-ys[i];
   tl.fromTo(series.querySelector('.bar'),{scaleY:0,svgOrigin:`0 ${base}`},{scaleY:1,duration:1,ease:'power3.out'},at);
   tl.fromTo(series.querySelector('.datum'),{y:height,opacity:0},{y:0,opacity:1,duration:1,ease:'power3.out'},at);
  });
  else {
   const interval=2.1/(n-1);enter(q('.point')[0],.55,{y:0});
   q('.segment').forEach((path,i)=>draw(path,.65+i*interval,interval));
   q('.point').forEach((p,i)=>{if(i)enter(p,.65+i*interval,{y:0});});
  }
  if(kind==='turn'){
   const focus=Math.max(0,Math.min(n-1,Math.floor(Number(v.focus)||0)));
   body.insertAdjacentHTML('beforeend',`<p class="turn-caption"><span class="tag">${text(labels[focus],8)}</span>${text(v.explanation,18)}</p>`);enter(q('.turn-caption'),3.1,{y:6});
   const ring=document.createElementNS('http://www.w3.org/2000/svg','circle');ring.setAttribute('cx',xs[focus]);ring.setAttribute('cy',ys[focus]);ring.setAttribute('r','11');ring.setAttribute('fill','none');ring.setAttribute('stroke','var(--accent)');ring.setAttribute('stroke-width','1.5');body.querySelector('svg').append(ring);enter(ring,3.05,{y:0});
  }
 } else if(['compare','choice'].includes(kind)){
  const body=shell();if(labels.length!==2)throw new Error('Two labels required');if(kind==='compare')nums(2);
  body.innerHTML=`<div class="pair">${labels.map((l,i)=>`<div class="tile"><p class="label muted">${text(l,14)}</p>${kind==='compare'?`<p class="value">${values[i]}${unit}</p>`:`<p class="copy">${text(i?v.detailB:v.detailA,30)}</p>`}</div>`).join('')}</div>`;
  enter(q('.tile'),.5,{x:kind==='choice'?12:0});enter(q('.value,.copy'),1);
 } else if(kind==='state'){
  if(labels.length!==2)throw new Error('Two labels required');const body=shell(true);
  body.innerHTML=`<div class="state-pair">${labels.map((l,i)=>`${i?'<span class="arrow">→</span>':''}<div class="node"><span class="eyebrow">${i?'下一步':'当前'}</span><h2>${text(l,14)}</h2></div>`).join('')}</div>`;
  enter(q('.node')[0],.4);enter(q('.arrow'),1.3,{x:-10,y:0});enter(q('.node')[1],1.8);
 } else if(kind==='hbars'){
  nums(2);const body=shell(),max=Math.max(...values,1);
  body.innerHTML=labels.map((l,i)=>`<div class="measure-row"><div class="measure-head"><span class="label">${text(l,16)}</span><strong>${values[i]}${unit}</strong></div><div class="measure-track"><div class="measure" style="width:${values[i]/max*100}%"></div></div></div>`).join('');
  enter(q('.measure-head'),.4);tl.fromTo(q('.measure'),{scaleX:0},{scaleX:1,duration:1.3,stagger:.6,ease:'power3.out'},.7);
 } else if(kind==='rank'){
  nums(3);const body=shell(),order=values.map((n,i)=>({n,label:labels[i]})).sort((a,b)=>b.n-a.n);
  body.innerHTML=order.map((item,i)=>`<div class="rank-row"><span class="order">0${i+1}</span><span class="name">${text(item.label,16)}</span><span class="score">${item.n}<small>${text(v.unit,8)}</small></span></div>`).join('');enter(q('.rank-row'),.45,{x:-12,y:0});
 } else if(['citation','concept','duel'].includes(kind)){
  const wrap=document.createElement('section');wrap.className='overlay';host.append(wrap);
  if(kind==='citation'){if(labels.length!==2)throw new Error('Two source lines required');wrap.innerHTML=`<div class="source-line"><span class="source-icon">↗</span><span>${text(labels[0])}</span></div><h2>${text(v.title)}</h2><p class="muted" style="margin-top:12px">${text(labels[1])}</p>`;}
  if(kind==='concept'){if(labels.length!==2)throw new Error('Term and definition required');wrap.style.cssText='left:120px;width:720px';wrap.innerHTML=`<p class="muted" style="font-size:15px;margin-bottom:15px">术语解释</p><h2 class="term" style="font-size:38px">${text(labels[0],14)}</h2><p class="definition">${text(labels[1],38)}</p>`;}
  if(kind==='duel'){
   nums(2);const total=values.reduce((a,b)=>a+b,0);
   wrap.innerHTML=`<div class="duo-header"><h2>${text(v.title)}</h2><span class="muted" style="font-size:14px">合计与分类</span></div><div class="duo-grid"><div class="duo-total"><span class="value">${total}</span>${unit}</div>${labels.map((l,i)=>`<div class="duo"><p class="label">${text(l,12)}</p><span class="value">${values[i]}</span>${unit}</div>`).join('')}</div><div class="distribution">${values.map(n=>`<span style="width:${total?n/total*100:0}%"></span>`).join('')}</div>`;
  }
  wrap.insertAdjacentHTML('beforeend',`<p class="note">${text(v.note,70)}</p>`);enter(wrap,.15,{y:16});enter(q('h2,.definition,.duo,.duo-total'),.65);if(kind==='duel')tl.fromTo(q('.distribution span'),{scaleX:0},{scaleX:1,duration:.7,stagger:.15,ease:'power3.out'},1.5);
 } else if(kind==='timeline'){
  if(labels.length!==3)throw new Error('Three timeline labels required');
  host.innerHTML=`<section class="timeline-wrap"><h2 class="timeline-title">${text(v.title)}</h2><svg width="800" height="100" viewBox="0 0 800 100"><path class="rail" d="M70,16 H730" fill="none" stroke="var(--accent)" stroke-width="2"/>${labels.map((l,i)=>`<g class="milestone"><circle cx="${70+i*330}" cy="16" r="6" fill="var(--accent)"/><rect x="${i*330}" y="40" width="140" height="44" rx="13" fill="rgb(28 29 32 / var(--panel-alpha,.82))"/><text class="milestone-label" x="${70+i*330}" y="69" text-anchor="middle">${text(l,6)}</text></g>`).join('')}</svg><p class="note">${text(v.note,70)}</p></section>`;
  enter(q('h2,.note'),.2);draw(q('.rail')[0],.7,2.2);q('.milestone').forEach((el,i)=>enter(el,.7+i*1.1,{y:0}));
 } else if(kind==='meter'){
  if(values.length!==1||values[0]>100)throw new Error('Percentage must be between 0 and 100');const body=shell();
  body.innerHTML=`<div class="meter-head"><p class="label muted">${text(labels[0],20)}</p><p class="value">${values[0]}${unit}</p></div><div class="ticks">${Array.from({length:20},(_,i)=>`<span class="tick"><i style="width:${Math.max(0,Math.min(1,values[0]/5-i))*100}%"></i></span>`).join('')}</div>`;
  enter(q('.meter-head'),.5);tl.fromTo(q('.tick i'),{scaleX:0},{scaleX:1,duration:.2,stagger:.09,ease:'none'},.9);
 } else if(['steps','cause'].includes(kind)){
  if(labels.length!==3)throw new Error('Three steps required');const body=shell(true);
  body.innerHTML=`<div class="step-flow ${kind==='cause'?'cause-flow':''}">${labels.map((l,i)=>`${i?'<span class="arrow">→</span>':''}<div class="step node"><span class="index">${kind==='steps'?'0'+(i+1):['原因','机制','结果'][i]}</span><h2>${text(l,16)}</h2></div>`).join('')}</div>`;
  q('.step').forEach((el,i)=>enter(el,.4+i*.85));q('.arrow').forEach((el,i)=>enter(el,1+i*.85,{x:-8,y:0}));
 } else if(kind==='myth'){
  if(labels.length!==2)throw new Error('Two statements required');const body=shell();
  body.innerHTML=`<div class="old">${text(labels[0],23)}<span class="strike"></span></div><div class="new"><p class="new-label">使用前，先确认</p>${text(labels[1],30)}</div>`;
  enter(q('.old'),.4);tl.fromTo(q('.strike'),{scaleX:0},{scaleX:1,duration:.45,ease:'power2.inOut'},1.65);tl.to(q('.old'),{opacity:.65,duration:.4},2.1);enter(q('.new'),2.25,{y:16});
 } else if(kind==='loop'){
  if(labels.length!==4)throw new Error('Four loop steps required');const body=shell(true);body.style.top='75px';body.style.height='270px';
  body.innerHTML=`<svg class="loop-links" width="832" height="270"><path class="circuit" d="M316,48 H516 M770,48 Q804,48 804,90 V156 Q804,198 770,198 M516,198 H316 M62,198 Q28,198 28,156 V90 Q28,48 62,48" stroke="var(--accent)" stroke-width="2" fill="none"/></svg>`+labels.map((l,i)=>`<div class="loop-node node" style="left:${[62,516,516,62][i]}px;top:${[4,4,154,154][i]}px"><b>0${i+1}</b>${text(l,6)}</div>`).join('');
  draw(q('.circuit')[0],.6,3.1);q('.loop-node').forEach((el,i)=>enter(el,.4+i*.8,{y:0,scale:.96}));
 } else throw new Error('Unknown template kind');
 tl.to(scene,{opacity:1,duration:.01},5.99);
 window.__timelines=window.__timelines||{};window.__timelines[config.id]=tl;
})();
