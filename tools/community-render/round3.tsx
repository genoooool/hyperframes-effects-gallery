import React,{createRef} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {Player,PlayerRef} from '@remotion/player';
import {AbsoluteFill,Sequence} from 'remotion';
import {components} from './round3-imports';

const Card=({label='MAKE IT MOVE',style={}}:{label?:string,style?:React.CSSProperties})=><div style={{padding:'35px 45px',border:'1px solid #b9eeb94a',borderRadius:28,background:'linear-gradient(145deg,#213e50,#233c35)',color:'#dafaad',font:'700 40px Inter',...style}}>{label}</div>;
const Dot=({color='#d8f99d'})=><div style={{width:90,height:90,borderRadius:'50%',background:color,boxShadow:'inset -10px -12px 22px #0003'}}/>;
function Preview({variant}:{variant:string}){
 const C=components[variant];
 const center={display:'flex',alignItems:'center',justifyContent:'center'};
 let content:React.ReactNode;
 switch(variant){
  case 'confetti-burst':content=<><Card label="NICE WORK"/><Sequence from={8} layout="none"><C originY={78} gravity={100} count={65} durationInFrames={88}/></Sequence></>;break;
  case 'squash-stretch':content=<div style={{paddingTop:200}}><C travel={160} periodInFrames={40}><Dot/></C></div>;break;
  case 'reaction-burst':content=<><Card label="THAT MOMENT"/><C size={75} ratePerSecond={6} align="right"/></>;break;
  case 'scanline-crt':content=<C lineCount={140} lineOpacity={.4}><AbsoluteFill style={{...center,background:'linear-gradient(145deg,#355451,#122d45)'}}><Card label="PLAY / REC"/></AbsoluteFill></C>;break;
  case 'depth-of-field-blur':content=<C focusFrom={0} focusTo={1} maxBlur={23} layers={[{depth:1,content:<Card label="BACKGROUND" style={{position:'absolute',left:640,top:140}}/>},{depth:0,content:<Card label="FOREGROUND" style={{position:'absolute',left:100,top:370}}/>}]}/>;break;
  case 'caustics-bg':content=<><C/><div style={{zIndex:1,font:'600 42px Inter',letterSpacing:8,color:'#f3fbf4'}}>SLOW TIDE</div></>;break;
  case 'orbit-motion':content=<C showPath radiusX={310} radiusY={95} periodInFrames={96} center={<Card label="CENTER"/>}><Dot/><Dot color="#fcaa89"/><Dot color="#b3b3fa"/></C>;break;
  case 'progress-bar':content=<div style={{width:850}}><div style={{font:'500 24px Inter',color:'#d9e8ce',marginBottom:35}}>PROGRESS / DEMO</div><C showValue progress={.82} durationInFrames={72} height={22}/></div>;break;
  case 'countdown-timer':content=<C from={4} label="NEXT ROUND" zeroLabel="LET’S GO"/>;break;
  case 'comment-callout':content=<C body="How did you make that move?" highlight="that move" reply="Here is the process, step by step." author="Demo Viewer" handle="@example" likes={24}/>;break;
  case 'poll-overlay':content=<C question="Which shot comes next?" badge="DEMO POLL" align="center" options={[{label:'Close-up',votes:62},{label:'Wide shot',votes:38}]} totalLabel="Demo votes"/>;break;
  default:throw new Error('Unknown variant '+variant);
 }
 return <AbsoluteFill style={{...center,background:'radial-gradient(ellipse at 25% 20%,#263d3b,#101826 70%)',overflow:'hidden'}}>{content}</AbsoluteFill>;
}
const root=createRoot(document.querySelector('#root')!);const ref=createRef<PlayerRef>();let rough:any;let mode='';
(window as any).prepare=async(props:any)=>{
 rough?.remove();rough=null;mode=props.library;
 if(mode==='rough'){
  flushSync(()=>root.render(<div style={{width:640,height:360,display:'flex',alignItems:'center',justifyContent:'center',background:'#eee9dd',color:'#283c36',font:'600 28px Inter'}}><div style={{width:470,lineHeight:1.6,textAlign:'center'}}>Small details.<br/><span id="annotation-target">A clearer story.</span><br/>Make the point visible.</div></div>));
  await document.fonts.ready;
  rough=(window as any).RoughNotation.annotate(document.querySelector('#annotation-target'),{type:props.variant,color:props.variant==='highlight'?'#c2e583':'#e06b45',strokeWidth:3,padding:7,animationDuration:1000,brackets:['left','right'],iterations:2});rough.show();
  document.getAnimations().forEach(a=>{a.pause();a.currentTime=0});
 }else{
  flushSync(()=>root.render(<Player key={props.variant} ref={ref} component={Preview} inputProps={props} durationInFrames={props.frames} fps={24} compositionWidth={1280} compositionHeight={720} style={{width:640,height:360}} autoPlay={false} controls={false}/>));
  await document.fonts.ready;
 }
};
(window as any).seek=async(frame:number)=>{
 if(mode==='rough')document.getAnimations().forEach(a=>{a.pause();a.currentTime=Math.max(0,frame/24*1000-300)});
 else flushSync(()=>ref.current!.seekTo(frame));
 await new Promise(requestAnimationFrame);
};
