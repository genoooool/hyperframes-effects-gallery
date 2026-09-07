import React, {createRef} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {Player, PlayerRef} from '@remotion/player';
import {AbsoluteFill} from 'remotion';
import {CaptionTheme} from '../../assets/community/remotion-captions-themes/src/CaptionTheme';
import * as Kit from '../../assets/community/remotion-captions-kit/src/index';

const words = [
  {word:'Every',start:0.15,end:0.6},{word:'great',start:0.6,end:1.0},
  {word:'video',start:1.0,end:1.5},{word:'starts',start:1.5,end:1.95},
  {word:'with',start:1.95,end:2.35},{word:'a',start:2.35,end:2.55},
  {word:'story',start:2.55,end:3.1},{word:'worth',start:3.1,end:3.5},
  {word:'telling.',start:3.5,end:3.95},
];
const data={lines:[words.slice(0,4),words.slice(4)].map(line=>({words:line.map(w=>({text:w.word,start:w.start,end:w.end}))}))};
const {captions}=Kit.captionsFromWords({words});
const {pages}=Kit.createCaptionPages({captions,maxDurationMs:1800});
function Preview({library,variant}:{library:string;variant:string}) {
  const Preset=Kit[variant as keyof typeof Kit] as React.ComponentType<any>;
  return <AbsoluteFill style={{background:'linear-gradient(145deg,#0d1d2b,#222238 65%,#163a35)',display:'flex',alignItems:'center',justifyContent:'center'}}>
    {library==='themes'
      ? <CaptionTheme data={data} theme={variant} primaryColor="#FFFFFF" secondaryColor="#D2F99D" fontSize={72}/>
      : <Kit.CaptionTrack pages={pages}>{page=><Preset page={page} theme={{position:'center',fontSize:72,activeColor:'#D2F99D'}}/>}</Kit.CaptionTrack>}
  </AbsoluteFill>;
}
const root=createRoot(document.querySelector('#root')!);
const ref=createRef<PlayerRef>();
(window as any).prepare=async(props:any)=>{
  flushSync(()=>root.render(<Player key={props.library+props.variant} ref={ref} component={Preview} inputProps={props}
    durationInFrames={96} fps={24} compositionWidth={1280} compositionHeight={720}
    style={{width:640,height:360}} controls={false} autoPlay={false} showVolumeControls={false} />));
  await document.fonts.ready;
};
(window as any).seek=async(frame:number)=>{
  if(!ref.current)throw new Error('Player not ready');
  flushSync(()=>ref.current!.seekTo(frame));
  await new Promise(requestAnimationFrame);
  if(ref.current.getCurrentFrame()!==frame)throw new Error('Frame did not seek');
};
