'use strict';

// Visual style demo only. These original Canvas studies are not official registry previews.
// A single deterministic draw(effect, time) function powers thumbnails and the seekable player.
const effects = [
  { id:'iris', title:'光圈揭幕', en:'IRIS REVEAL', category:'转场', duration:5, desc:'让下一幕从画面中心生长。圆形遮罩缓缓展开，再利落地打开整个画面。', use:'章节切换 · 产品亮相 · 片头开场', tags:'圆形 遮罩 开场 简洁' },
  { id:'type', title:'文字重击', en:'KINETIC TYPE', category:'文字', duration:4, desc:'文字逐个弹入、短暂停留，再一起收束。用清晰的节奏，让一句话有了重音。', use:'短视频标题 · 重点强调 · 音乐卡点', tags:'字幕 弹性 标题 节奏' },
  { id:'zoom', title:'无限推进', en:'INFINITE ZOOM', category:'镜头', duration:6, desc:'镜头穿过层叠的空间，保持连续的透视变化，制造向画面深处前进的感觉。', use:'概念开场 · 空间穿梭 · 情绪推进', tags:'缩放 透视 深度' },
  { id:'ribbon', title:'空间环绕', en:'ORBITAL MOTION', category:'图形', duration:8, desc:'细密线条围成一枚立体圆环，在光线中缓缓转向。结构、体积与高光一起变化。', use:'品牌片头 · 科技概念 · 抽象主视觉', tags:'3D 环形 金属 科技' },
  { id:'blur', title:'失焦切换', en:'SOFT FOCUS', category:'转场', duration:5, desc:'前一幕逐渐失焦，后一幕从柔和的光斑中浮现。适合不想打断情绪的场景切换。', use:'生活方式 · 氛围叙事 · 柔和转场', tags:'模糊 柔和 溶解' },
  { id:'grain', title:'胶片微光', en:'FILM ATMOSPHERE', category:'氛围', duration:6, desc:'落日般的光晕与轻微颗粒叠在一起，让干净的画面多一层温暖、流动的质感。', use:'情绪短片 · 复古包装 · 画面质感', tags:'光晕 复古 噪点 漏光' },
  { id:'split', title:'错位分屏', en:'SPLIT & SLIDE', category:'编排', duration:5, desc:'同一个画面被切成多个区域，再以错开的时间推入，让简单的版面也有节奏。', use:'多图展示 · 前后对比 · 图文节奏', tags:'布局 分屏 滑动 错位' },
  { id:'morph', title:'字形变奏', en:'TYPE IN MOTION', category:'文字', duration:5, desc:'通过字距、纵向拉伸和字符错位，给静态标题一段舒展与聚拢的表演。', use:'设计感标题 · 段落开场 · 品牌文案', tags:'字体 拉伸 字距 标题' },
  { id:'particles', title:'流星粒子', en:'PARTICLE FIELD', category:'氛围', duration:8, desc:'细小光点以不同的速度穿过视野。远处缓慢，近处迅速，让平面多一层空间感。', use:'梦境场景 · 科技氛围 · 背景叠加', tags:'星空 光点 速度 拖尾' },
  { id:'wipe', title:'色块推幕', en:'COLOR WIPE', category:'转场', duration:4, desc:'几层色块依次扫过画面，用时间差串起前后两幕。节奏干脆，方向明确。', use:'信息切换 · 节奏剪辑 · 图形包装', tags:'滑动 覆盖 推入' },
  { id:'parallax', title:'景深漫游', en:'DEPTH & PARALLAX', category:'镜头', duration:7, desc:'近景、中景和远景以不同速度移动。轻轻推动镜头，就能看出层次之间的距离。', use:'风景叙事 · 插画动态化 · 场景建立', tags:'视差 风景 山脉 运镜' },
  { id:'spring', title:'弹性阵列', en:'SPRING SYSTEM', category:'图形', duration:5, desc:'一组圆点依次聚合、展开，再恢复秩序。弹性与延迟让几何图形有了呼吸感。', use:'品牌动效 · 信息提示 · 节奏点缀', tags:'弹簧 几何 阵列 错峰' },
];
const categories=['全部','转场','文字','镜头','氛围','图形','编排'];
const $=s=>document.querySelector(s);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let running=!reduced, category='全部', savedOnly=false, query='', selected=null;
let favorites=new Set();
try{const stored=JSON.parse(localStorage.getItem('hf-atelier-favorites')||'[]');if(Array.isArray(stored))favorites=new Set(stored.filter(id=>effects.some(e=>e.id===id)));}catch{}
let previews=[], globalTime=1.2, detailTime=0, detailRunning=false, last=0, toastTimer;
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{e.target.visible=e.isIntersecting;}),{rootMargin:'80px'});

function buildFilters(){
  $('#filters').innerHTML=categories.map(c=>`<button class="filter${category===c?' active':''}" aria-pressed="${category===c}" data-category="${c}">${c}<span class="number">${c==='全部'?effects.length:effects.filter(e=>e.category===c).length}</span></button>`).join('');
  $('#filters').querySelectorAll('button').forEach(b=>b.onclick=()=>{category=b.dataset.category;buildFilters();renderCards();});
}
function renderCards(){
  previews.forEach(p=>observer.unobserve(p.canvas));
  const list=effects.filter(e=>(category==='全部'||e.category===category)&&(!savedOnly||favorites.has(e.id))&&`${e.title} ${e.en} ${e.category} ${e.tags} ${e.use}`.toLowerCase().includes(query.toLowerCase().trim()));
  $('#grid').innerHTML=list.map(e=>`<article class="card"><div class="card-visual"><button class="open-card" data-open="${e.id}" aria-label="预览${e.title}"><canvas data-effect="${e.id}" aria-label="${e.title}动态示例"></canvas></button><button class="card-save${favorites.has(e.id)?' saved':''}" data-save="${e.id}" aria-label="${favorites.has(e.id)?'取消收藏':'收藏'}${e.title}" aria-pressed="${favorites.has(e.id)}">${favorites.has(e.id)?'★':'☆'}</button><div class="card-bottom"><span>↗ 放大预览</span><span>${e.duration}.0s · 循环</span></div></div><div class="card-meta"><h3 class="card-title">${e.title}</h3><span class="card-tag">${e.category}</span></div><p class="card-subtitle">${e.en}</p></article>`).join('');
  previews=[...$('#grid').querySelectorAll('canvas')].map(canvas=>({canvas,effect:effects.find(e=>e.id===canvas.dataset.effect)}));
  previews.forEach(p=>{observer.observe(p.canvas);draw(p.canvas,p.effect.id,globalTime%p.effect.duration);});
  $('#grid').querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openEffect(b.dataset.open));
  $('#grid').querySelectorAll('[data-save]').forEach(b=>b.onclick=()=>toggleSave(b.dataset.save));
  $('#resultCount').textContent=`${list.length} 个效果`;
  $('#empty').hidden=!!list.length;
  $('#emptyCopy').textContent=savedOnly?'点击效果卡片上的星标，把喜欢的效果留在这里。':'换个关键词，或试试其他分类。';
  updateSaved();
}
function updateSaved(){
  $('#savedCount').textContent=favorites.size;
  if(selected)$('#saveDetail').textContent=favorites.has(selected.id)?'★ 已收藏':'☆ 收藏效果';
}
function toggleSave(id){
  const active=!favorites.has(id);active?favorites.add(id):favorites.delete(id);
  try{localStorage.setItem('hf-atelier-favorites',JSON.stringify([...favorites]));}catch{toast('浏览器未允许存储，收藏仅在本次打开期间保留');}
  if(savedOnly){renderCards();}else{
    const b=$(`[data-save="${id}"]`);if(b){b.classList.toggle('saved',active);b.textContent=active?'★':'☆';b.setAttribute('aria-pressed',active);b.setAttribute('aria-label',`${active?'取消收藏':'收藏'}${effects.find(e=>e.id===id).title}`);}updateSaved();
  }
}
function view(mode){savedOnly=mode==='saved';$('#exploreNav').classList.toggle('active',!savedOnly);$('#savedNav').classList.toggle('active',savedOnly);$('#libraryTitle').textContent=savedOnly?'留住喜欢的灵感':'挑一个，让画面动起来';renderCards();$('#library').scrollIntoView({behavior:reduced?'instant':'smooth'});}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2300);}
function openEffect(id){
  selected=effects.find(e=>e.id===id);detailTime=0;detailRunning=!reduced;
  $('#detailCategory').textContent=`${selected.category} / 网页动效示例`;
  $('#detailTitle').textContent=selected.title;$('#detailEnglish').textContent=selected.en;$('#detailDesc').textContent=selected.desc;$('#detailUse').textContent=selected.use;
  $('#speed').value='1';updateSaved();$('#previewDialog').showModal();document.body.classList.add('modal-open');updateDetail();
}
function updateDetail(){
  if(!selected)return;
  draw($('#detailCanvas'),selected.id,detailTime);
  $('#scrub').value=detailTime/selected.duration*1000;
  $('#timeLabel').textContent=`${detailTime.toFixed(1)} / ${selected.duration.toFixed(1)}s`;
  $('#detailPlay').textContent=detailRunning?'Ⅱ':'▶';$('#detailPlay').setAttribute('aria-label',detailRunning?'暂停':'播放');
}
$('#exploreNav').onclick=()=>view('explore');$('#savedNav').onclick=()=>view('saved');$('#search').oninput=e=>{query=e.target.value;renderCards();};
$('#resetFilters').onclick=()=>{savedOnly=false;category='全部';query='';$('#search').value='';buildFilters();view('explore');};
function updateGlobalPlay(){$('#globalPlay').setAttribute('aria-pressed',running);$('#globalPlay .label').textContent=running?'暂停预览':'播放预览';$('#globalPlay .play-symbol').textContent=running?'Ⅱ':'▶';}
$('#globalPlay').onclick=()=>{running=!running;updateGlobalPlay();};
$('#heroOpen').onclick=()=>openEffect('ribbon');
$('#closeDialog').onclick=()=>$('#previewDialog').close();
$('#previewDialog').addEventListener('close',()=>{selected=null;detailRunning=false;document.body.classList.remove('modal-open');});
$('#previewDialog').addEventListener('click',e=>{if(e.target===$('#previewDialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('#detailPlay').onclick=()=>{detailRunning=!detailRunning;updateDetail();};
$('#scrub').oninput=e=>{detailRunning=false;detailTime=Number(e.target.value)/1000*selected.duration;updateDetail();};
$('#replay').onclick=()=>{detailTime=0;detailRunning=true;updateDetail();};
$('#saveDetail').onclick=()=>{if(selected)toggleSave(selected.id);};
$('#copyBrief').onclick=async()=>{if(!selected)return;const text=`效果：${selected.title} (${selected.en})\n分类：${selected.category}\n视觉描述：${selected.desc}\n适用场景：${selected.use}\n示例循环：${selected.duration} 秒\n备注：这是网页样式示例，非官方 HyperFrames 模板。`;try{await navigator.clipboard.writeText(text);toast('效果描述已复制');}catch{toast('复制不可用，请选中页面中的描述复制');}};
document.addEventListener('keydown',e=>{if(e.key==='/'&&!$('#previewDialog').open&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();$('#search').focus();}if(e.code==='Space'&&$('#previewDialog').open&&!['INPUT','SELECT','BUTTON'].includes(document.activeElement.tagName)){e.preventDefault();$('#detailPlay').click();}});

// All scenes share a 900 x 600 coordinate system. Rendering is independent of playback order.
const TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
function round(ctx,x,y,w,h,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function label(ctx,text,x,y,size,color='#fff',weight=600,align='center'){ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';ctx.font=`${weight} ${size}px "Helvetica Neue", Arial, "PingFang SC", sans-serif`;ctx.fillText(text,x,y);}
function backdrop(ctx,a,b){const g=ctx.createLinearGradient(0,0,900,600);g.addColorStop(0,a);g.addColorStop(1,b);ctx.fillStyle=g;ctx.fillRect(0,0,900,600);}
function circle(ctx,x,y,r,color){ctx.beginPath();ctx.arc(x,y,Math.max(0,r),0,TAU);ctx.fillStyle=color;ctx.fill();}
function grain(ctx,t,alpha=.08,n=420){ctx.fillStyle=`rgba(255,245,213,${alpha})`;const k=Math.floor(t*10);for(let i=0;i<n;i++){const x=((i*197.37+k*13.1)%900+900)%900,y=(i*89.83+k*31.5)%600;ctx.fillRect(x,y,i%3===0?2:1,1);}}
function ring(ctx,t,hero=false){
  backdrop(ctx,hero?'#242e1b':'#c2cbb0',hero?'#101b15':'#65785c');
  if(hero){const halo=ctx.createRadialGradient(475,260,20,450,300,430);halo.addColorStop(0,'#66754455');halo.addColorStop(1,'#101b1500');ctx.fillStyle=halo;ctx.fillRect(0,0,900,600);label(ctx,'FORM / 004',42,43,10,'#acb997',400,'left');label(ctx,'MOTION STUDY',855,43,10,'#acb997',400,'right');}
  ctx.save();ctx.translate(450,hero?290:300);
  const theta=.43+Math.sin(t*TAU/8)*.45,phi=-.5+Math.cos(t*TAU/8)*.25;
  const paths=[];
  for(let i=0;i<100;i++){
    const u=i/100*TAU;const pts=[];let depth=0;
    for(let j=0;j<=50;j++){
      const v=j/50*TAU,r=159+62*Math.cos(v);let x=r*Math.cos(u),y=r*Math.sin(u),z=62*Math.sin(v);
      const y1=y*Math.cos(theta)-z*Math.sin(theta),z1=y*Math.sin(theta)+z*Math.cos(theta);
      const x2=x*Math.cos(phi)+z1*Math.sin(phi),z2=-x*Math.sin(phi)+z1*Math.cos(phi);
      const p=740/(740-z2);pts.push([x2*p,y1*p]);depth+=z2;
    }paths.push({pts,depth:depth/pts.length,u});
  }
  paths.sort((a,b)=>a.depth-b.depth);
  paths.forEach(({pts,depth,u})=>{const light=clamp((depth+210)/400);const hue=hero?91:89;ctx.strokeStyle=`hsla(${hue},${hero?30:16}%,${25+light*66}%,${.45+light*.5})`;ctx.lineWidth=hero?2.2:2;ctx.beginPath();pts.forEach((p,j)=>j?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();});
  ctx.restore();grain(ctx,t,.035);
}
function scene(ctx,id,t){
  switch(id){
  case 'ribbon':ring(ctx,t);break;
  case 'iris':{
    backdrop(ctx,'#aa432b','#ef9161');const cycle=t/5;const p=ease(cycle<.55?(cycle-.08)/.42:(1-cycle)/.32);
    for(let i=0;i<6;i++){ctx.strokeStyle='#70200c22';ctx.lineWidth=1;ctx.beginPath();ctx.arc(450,300,70+i*64,0,TAU);ctx.stroke();}
    label(ctx,'OPEN',450,300,112,'#542514');ctx.save();ctx.beginPath();ctx.arc(450,300,Math.max(48,p*600),0,TAU);ctx.clip();backdrop(ctx,'#1e221c','#080c08');
    for(let i=0;i<16;i++){const a=i/16*TAU+t*.2;ctx.strokeStyle='#cad4b31a';ctx.beginPath();ctx.moveTo(450+Math.cos(a)*85,300+Math.sin(a)*85);ctx.lineTo(450+Math.cos(a)*420,300+Math.sin(a)*420);ctx.stroke();}
    label(ctx,'NEXT',450,300,112,'#f0c5a5');label(ctx,'A NEW PERSPECTIVE',450,390,12,'#b69076',400);ctx.restore();break;
  }
  case 'type':{
    backdrop(ctx,'#d8f7a9','#b5d684');const word='MAKE';const p=t%4;
    label(ctx,'EVERY FRAME COUNTS',450,135,13,'#415a2b',500);
    for(let i=0;i<4;i++){const q=clamp((p-i*.11)/.7),bounce=1-Math.pow(1-q,3)*Math.cos(q*8);ctx.save();ctx.translate(214+i*154,268+(1-bounce)*-150);ctx.scale(1,.65+.35*bounce);ctx.globalAlpha=clamp(q*4);label(ctx,word[i],0,0,157,'#263a1c',800);ctx.restore();}
    ctx.save();ctx.translate(450,409);const sc=.94+.06*Math.sin(Math.min(p,1)*Math.PI/2);ctx.scale(sc,sc);label(ctx,'IT MOVE.',0,0,103,'#263a1c',800);ctx.restore();break;
  }
  case 'zoom':{
    backdrop(ctx,'#462630','#21171d');ctx.save();ctx.translate(450,300);ctx.rotate(.18);
    const colors=['#e8b4c2','#b9718c','#7b415c','#472439','#241826'];
    for(let i=0;i<14;i++){const size=1800*Math.pow(.67,i-(t%6)/6);round(ctx,-size/2,-size/2,size,size,Math.max(5,size*.06),colors[i%5]);}
    ctx.restore();break;
  }
  case 'blur':{
    backdrop(ctx,'#738eab','#bdc8cc');const p=.5-.5*Math.cos(t/5*TAU);ctx.save();ctx.filter=`blur(${2+20*Math.sin(p*Math.PI)}px)`;
    for(let i=0;i<4;i++){const x=230+i*155+Math.sin(t*.7+i)*35,y=300+Math.cos(t*.8+i)*60;const g=ctx.createRadialGradient(x-30,y-40,5,x,y,150);g.addColorStop(0,i%2?'#f7f0dc':'#dceff6');g.addColorStop(.45,i%2?'#d9c6b4':'#b8d9e1');g.addColorStop(1,'#637c9966');circle(ctx,x,y,125,g);}
    ctx.restore();ctx.globalAlpha=.72;label(ctx,p<.5?'slow.':'flow.',450,305,109,'#f4f6f1',500);ctx.globalAlpha=1;break;
  }
  case 'grain':{
    backdrop(ctx,'#291e22','#211918');const x=450+Math.sin(t/6*TAU)*90;
    const g=ctx.createRadialGradient(x,365,0,x,365,340);g.addColorStop(0,'#ffddb8');g.addColorStop(.12,'#f9a759');g.addColorStop(.36,'#b24f35');g.addColorStop(.64,'#633334');g.addColorStop(1,'#211a2100');ctx.fillStyle=g;ctx.fillRect(0,0,900,600);
    ctx.fillStyle='#17121765';ctx.fillRect(0,387,900,213);label(ctx,'AFTER HOURS',450,180,34,'#f3d6be',400);label(ctx,'A LITTLE LIGHT. A LITTLE GRAIN.',450,231,11,'#e4b493',400);grain(ctx,t,.19,2500);break;
  }
  case 'split':{
    backdrop(ctx,'#f0ebe1','#d3c8b9');const colors=['#c0c7ad','#555b44','#d1a477'];
    for(let i=0;i<3;i++){const x=50+i*267,off=Math.sin(t/5*TAU-i*.65)*42;ctx.save();round(ctx,x,65,246,470,8,colors[i]);ctx.beginPath();ctx.roundRect(x,65,246,470,8);ctx.clip();ctx.translate(x+123,300+off);ctx.rotate(-.4+i*.3);ctx.strokeStyle=i===1?'#dbe0c8':'#faf3dd';ctx.lineWidth=28;for(let j=0;j<4;j++){ctx.beginPath();ctx.ellipse(0,0,55+j*33,110+j*25,0,0,TAU);ctx.stroke();}ctx.restore();}break;
  }
  case 'morph':{
    backdrop(ctx,'#9a9bea','#6669bc');const text='FLOW';const p=Math.sin(t/5*TAU);label(ctx,'LET THE LETTERS BREATHE',450,126,12,'#242747',500);
    for(let i=0;i<4;i++){ctx.save();ctx.translate(225+i*150+p*(i-1.5)*13,300+Math.sin(t/5*TAU+i*.4)*12);ctx.scale(.9,1.1+.25*Math.sin(t/5*TAU+i*.6));label(ctx,text[i],0,0,166,'#24233e',700);ctx.restore();}ctx.fillStyle='#363552';ctx.fillRect(85,464,730,1);break;
  }
  case 'particles':{
    backdrop(ctx,'#112c34','#07171d');
    for(let i=0;i<150;i++){const z=(i%11+2)/12,x=((i*173.7+t*(14+z*48))%1150)-100,y=((i*73.31-t*z*20)%800+800)%800-100;
      ctx.strokeStyle=`rgba(177,225,230,${.1+z*.6})`;ctx.lineWidth=z*2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+8+z*18,y-2-z*5);ctx.stroke();circle(ctx,x,y,z*1.4,'#e0fcf5');}
    label(ctx,'somewhere',450,278,58,'#d0e4df',400);label(ctx,'BEYOND THE ORDINARY',450,345,11,'#7fadb1',400);break;
  }
  case 'wipe':{
    backdrop(ctx,'#262d22','#181f17');label(ctx,'THIS',450,300,128,'#dbe5c9',700);
    const p=t/4;for(let i=0;i<3;i++){const start=ease((p-.12-i*.07)/.3),end=ease((p-.58-i*.07)/.3);const x=-950+start*950+end*950;ctx.fillStyle=['#788b5b','#d7fba5','#e8eedc'][i];ctx.fillRect(x,0,950,600);if(i===2){ctx.save();ctx.beginPath();ctx.rect(x,0,950,600);ctx.clip();label(ctx,'THAT',450,300,128,'#303d22',700);ctx.restore();}}break;
  }
  case 'parallax':{
    backdrop(ctx,'#c2c8bc','#e2d9bd');circle(ctx,615+Math.sin(t/7*TAU)*10,165,48,'#f4e6c3');
    const colors=['#9ba891','#788d79','#4d6b5b','#284d41'];
    for(let layer=0;layer<4;layer++){ctx.beginPath();ctx.moveTo(-80,650);const move=Math.sin(t/7*TAU)*(layer+1)*17;for(let x=-80;x<=980;x+=8){const y=275+layer*69+Math.sin((x+move)/(140-layer*18)+layer*2)*48+Math.cos((x+move)/75+layer)*20;ctx.lineTo(x,y);}ctx.lineTo(980,650);ctx.closePath();ctx.fillStyle=colors[layer];ctx.fill();}
    grain(ctx,t,.035);break;
  }
  case 'spring':{
    backdrop(ctx,'#e5cba1','#d1ae7e');for(let y=0;y<6;y++)for(let x=0;x<10;x++){const d=Math.hypot(x-4.5,y-2.5),a=t/5*TAU-d*.5,scale=.7+.3*Math.sin(a);circle(ctx,180+x*60+Math.sin(a)*9,145+y*60+Math.cos(a)*9,17*scale,'#63452e');}break;
  }
  }
}
function draw(canvas,id,t,hero=false){
  const rect=canvas.getBoundingClientRect();if(!rect.width)return;
  const dpr=Math.min(devicePixelRatio||1,1.5);const w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  const ctx=canvas.getContext('2d',{alpha:false});ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h);
  // Uniform cover keeps text and circles undistorted on mobile crops.
  const scale=Math.max(w/900,h/600);ctx.setTransform(scale,0,0,scale,(w-900*scale)/2,(h-600*scale)/2);
  ctx.save();hero?ring(ctx,t,true):scene(ctx,id,t);ctx.restore();
}
const hero=$('#heroCanvas');observer.observe(hero);
function frame(now){
  const delta=last?Math.min((now-last)/1000,.08):0;last=now;
  if(!document.hidden){
    if(selected){if(detailRunning){detailTime=(detailTime+delta*Number($('#speed').value))%selected.duration;updateDetail();}}
    else if(running){globalTime+=delta;if(hero.visible)draw(hero,'ribbon',globalTime%8,true);previews.forEach(p=>{if(p.canvas.visible)draw(p.canvas,p.effect.id,globalTime%p.effect.duration);});}
  }
  requestAnimationFrame(frame);
}
new ResizeObserver(()=>{draw(hero,'ribbon',globalTime%8,true);previews.forEach(p=>draw(p.canvas,p.effect.id,globalTime%p.effect.duration));if(selected)updateDetail();}).observe(document.body);
buildFilters();renderCards();updateGlobalPlay();draw(hero,'ribbon',globalTime%8,true);requestAnimationFrame(frame);
