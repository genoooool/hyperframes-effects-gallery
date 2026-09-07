"use strict";var HyperframesPlayer=(()=>{var ee=Object.defineProperty;var et=Object.getOwnPropertyDescriptor;var tt=Object.getOwnPropertyNames;var it=Object.prototype.hasOwnProperty;var rt=(r,e)=>{for(var t in e)ee(r,t,{get:e[t],enumerable:!0})},nt=(r,e,t,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of tt(e))!it.call(r,n)&&n!==t&&ee(r,n,{get:()=>e[n],enumerable:!(i=et(e,n))||i.enumerable});return r};var ot=r=>nt(ee({},"__esModule",{value:!0}),r);var Ht={};rt(Ht,{HyperframesPlayer:()=>K,SPEED_PRESETS:()=>re,formatSpeed:()=>O,formatTime:()=>q});function we(r){return r.hasRuntime||r.runtimeInjected?!1:!!(r.hasNestedCompositions||r.hasTimelines&&r.attempts>=5)}function P(r){return typeof r=="object"&&r!==null}function Ae(r){return P(r)&&typeof r.getDuration=="function"}function Ce(r){return P(r)&&typeof r.duration=="function"&&typeof r.time=="function"&&typeof r.seek=="function"&&typeof r.play=="function"&&typeof r.pause=="function"}var k="https://cdn.jsdelivr.net/npm/@hyperframes/core@0.8.30/dist/hyperframe.runtime.iife.js";function N(r){if(r===null)return null;let e=Number.parseInt(r,10);return Number.isFinite(e)&&e>0?e:null}function at(r){let e=r?.querySelector("[data-composition-id][data-width][data-height]")??r?.querySelector("[data-width][data-height]");if(!e)return null;let t=N(e.getAttribute("data-width")),i=N(e.getAttribute("data-height"));return t!==null&&i!==null?{width:t,height:i}:null}var W=class{constructor(e,t){this._iframe=e;this._callbacks=t}_iframe;_callbacks;_interval=null;_runtimeInjected=!1;get runtimeInjected(){return this._runtimeInjected}start(){this.stop(),this._runtimeInjected=!1;let e=0;this._interval=setInterval(()=>{e++;try{let t=this._iframe.contentWindow;if(!t)return;let i=!!(t.__hf||t.__player),n=!!(t.__timelines&&Object.keys(t.__timelines).length>0),o=!!this._iframe.contentDocument?.querySelector("[data-composition-src]");if(we({hasRuntime:i,hasTimelines:n,hasNestedCompositions:o,runtimeInjected:this._runtimeInjected,attempts:e})){this._injectRuntime();return}if(this._runtimeInjected&&!i)return;let d=this._resolvePlaybackDurationAdapter(t);if(d&&d.getDuration()>0){this.stop();let s=at(this._iframe.contentDocument);this._callbacks.onReady({duration:d.getDuration(),adapter:d,compositionSize:s});return}}catch{}e>=40&&(this.stop(),this._callbacks.onError("Composition timeline not found after 8s"))},200)}stop(){this._interval!==null&&(clearInterval(this._interval),this._interval=null)}resolveDirectTimelineAdapter(){try{let e=this._iframe.contentWindow;return e?this._resolveDirectTimelineAdapterFromWindow(e):null}catch{return null}}resolveDirectTimelineAdapterFromWindow(e){return this._resolveDirectTimelineAdapterFromWindow(e)}hasRuntimeBridge(e){return Reflect.get(e,"__hf")!==void 0||P(Reflect.get(e,"__player"))}_injectRuntime(){this._runtimeInjected=!0;try{let e=this._iframe.contentDocument;if(!e)return;let t=e.createElement("script");t.src=k,(e.head||e.documentElement).appendChild(t),this._callbacks.onRuntimeInjected?.()}catch{}}_resolveDirectTimelineAdapterFromWindow(e){if(this.hasRuntimeBridge(e))return null;let t=Reflect.get(e,"__timelines");if(!P(t))return null;let i=Object.keys(t);if(i.length===0)return null;let n=this._iframe.contentDocument?.querySelector("[data-composition-id]")?.getAttribute("data-composition-id"),o=n&&n in t?n:i[i.length-1],d=t[o];return Ce(d)?d:null}_resolvePlaybackDurationAdapter(e){let t=Reflect.get(e,"__player");if(Ae(t))return{kind:"runtime",getDuration:()=>t.getDuration()};let i=this._resolveDirectTimelineAdapterFromWindow(e);return i?{kind:"direct-timeline",timeline:i,getDuration:()=>i.duration()}:null}};var Re=`
  :host {
    display: block;
    position: relative;
    overflow: hidden;
    background: #000;
    contain: layout style;
  }

  .hfp-container {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }


  .hfp-iframe {
    position: absolute;
    top: 50%;
    left: 50%;
    border: none;
    pointer-events: none;
  }

  /* Opt-in: an interactive composition (e.g. a live slideshow/app with playable
     media or controls) \u2014 let pointer events reach the iframe content. */
  :host([interactive]) .hfp-container,
  :host([interactive]) .hfp-iframe {
    pointer-events: auto;
  }

  .hfp-poster {
    position: absolute;
    inset: 0;
    object-fit: contain;
    z-index: 1;
    pointer-events: none;
  }

  .hfp-shader-loader {
    position: absolute;
    inset: 0;
    z-index: 20;
    display: grid;
    place-items: center;
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
    background: #030504;
    color: #f4f7fb;
    cursor: default;
    user-select: none;
    -webkit-user-select: none;
    transition: opacity 420ms ease-out, visibility 420ms ease-out;
  }

  .hfp-shader-loader.hfp-visible,
  .hfp-shader-loader.hfp-hiding {
    visibility: visible;
  }

  .hfp-shader-loader.hfp-visible {
    opacity: 1;
    pointer-events: auto;
  }

  .hfp-shader-loader.hfp-hiding {
    opacity: 0;
    pointer-events: none;
  }

  .hfp-shader-loader-panel {
    display: grid;
    grid-template-rows: 86px 40px 26px 12px 44px;
    justify-items: center;
    align-items: center;
    gap: 8px;
    width: min(620px, 82%);
    text-align: center;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .hfp-shader-loader-mark {
    width: 86px;
    height: 86px;
    display: grid;
    place-items: center;
    overflow: visible;
  }

  .hfp-shader-loader-mark svg {
    display: block;
    overflow: visible;
    filter: drop-shadow(0 0 5px rgba(79, 219, 94, 0.16));
    pointer-events: none;
  }

  .hfp-shader-loader-title {
    width: 100%;
    height: 40px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 26px;
    line-height: 40px;
    font-weight: 700;
    letter-spacing: 0;
  }

  .hfp-shader-loader-title-text {
    color: transparent;
    background: linear-gradient(
      90deg,
      rgba(244, 247, 251, 0.84) 0%,
      #ffffff 42%,
      #80efe4 52%,
      #ffffff 62%,
      rgba(244, 247, 251, 0.84) 100%
    );
    background-size: 220% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    animation: hfp-shader-loader-sheen 1.9s linear infinite;
  }

  .hfp-shader-loader-detail {
    width: 100%;
    height: 26px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: rgba(244, 247, 251, 0.62);
    font-size: 15px;
    line-height: 26px;
    font-weight: 500;
  }

  .hfp-shader-loader-track {
    width: min(360px, 100%);
    height: 8px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.1);
  }

  .hfp-shader-loader-fill {
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #06e3fa, #4fdb5e);
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 160ms ease;
  }

  .hfp-shader-loader-progress {
    width: min(420px, 100%);
    height: 44px;
    display: grid;
    grid-template-rows: repeat(2, 22px);
    color: rgba(244, 247, 251, 0.48);
    font: 600 13px/22px "IBM Plex Mono", "SF Mono", "Fira Code", "Courier New", monospace;
    font-variant-numeric: tabular-nums;
  }

  .hfp-shader-loader-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 74px;
    align-items: center;
    column-gap: 20px;
    width: 100%;
    white-space: nowrap;
  }

  .hfp-shader-loader-label {
    min-width: 0;
    overflow: hidden;
    text-align: left;
    text-overflow: ellipsis;
  }

  .hfp-shader-loader-value {
    text-align: right;
  }

  @keyframes hfp-shader-loader-sheen {
    from {
      background-position: 140% 0;
    }
    to {
      background-position: -140% 0;
    }
  }

  /* \u2500\u2500 Theming via CSS custom properties \u2500\u2500
   *
   * Override from outside the shadow DOM:
   *   hyperframes-player {
   *     --hfp-controls-bg: linear-gradient(transparent, rgba(0,0,0,0.9));
   *     --hfp-accent: #ff6b6b;
   *     --hfp-font: "Inter", sans-serif;
   *   }
   */

  .hfp-controls {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: var(--hfp-controls-gap, 12px);
    padding: var(--hfp-controls-padding, 8px 16px);
    background: var(--hfp-controls-bg, linear-gradient(transparent, rgba(0, 0, 0, 0.7)));
    color: var(--hfp-color, #fff);
    font-family: var(--hfp-font, system-ui, -apple-system, sans-serif);
    font-size: var(--hfp-font-size, 13px);
    z-index: 10;
    pointer-events: auto;
    opacity: 1;
    transition: opacity 0.3s ease;
    user-select: none;
  }

  .hfp-controls.hfp-hidden {
    opacity: 0;
    pointer-events: none;
  }

  .hfp-play-btn {
    position: relative;
    background: none;
    border: none;
    color: var(--hfp-color, #fff);
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    z-index: 10;
  }

  .hfp-play-btn:hover {
    opacity: 0.8;
  }

  /* Stacked play/pause glyphs that crossfade-morph on toggle (rotate + scale). */
  .hfp-play-btn .hfp-ico {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      opacity 200ms ease,
      transform 220ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  .hfp-play-btn .hfp-ico-play {
    opacity: 1;
    transform: rotate(0) scale(1);
  }
  .hfp-play-btn .hfp-ico-pause {
    opacity: 0;
    transform: rotate(-90deg) scale(0.4);
  }
  .hfp-play-btn.hfp-playing .hfp-ico-play {
    opacity: 0;
    transform: rotate(90deg) scale(0.4);
  }
  .hfp-play-btn.hfp-playing .hfp-ico-pause {
    opacity: 1;
    transform: rotate(0) scale(1);
  }
  @media (prefers-reduced-motion: reduce) {
    .hfp-play-btn .hfp-ico {
      transition-duration: 0ms;
      transform: none;
    }
  }

  .hfp-play-btn svg,
  .hfp-play-btn svg * {
    pointer-events: none;
  }

  .hfp-scrubber {
    flex: 1;
    min-width: 0;
    height: var(--hfp-scrubber-height, 4px);
    background: var(--hfp-scrubber-bg, rgba(255, 255, 255, 0.3));
    border-radius: var(--hfp-scrubber-radius, 2px);
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .hfp-scrubber:hover {
    height: var(--hfp-scrubber-height-hover, 6px);
  }

  .hfp-progress {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: var(--hfp-accent, #fff);
    pointer-events: none;
  }

  .hfp-time {
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
    opacity: 0.9;
  }

  .hfp-speed-wrap {
    position: relative;
    flex-shrink: 0;
  }

  .hfp-speed-btn {
    background: var(--hfp-speed-btn-bg, rgba(255, 255, 255, 0.15));
    border: none;
    border-radius: var(--hfp-speed-btn-radius, 4px);
    color: var(--hfp-color, #fff);
    cursor: pointer;
    font-family: var(--hfp-font, system-ui, -apple-system, sans-serif);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    padding: 4px 8px;
    min-width: 40px;
    text-align: center;
    transition: background 0.15s ease;
  }

  .hfp-speed-btn:hover {
    background: var(--hfp-speed-btn-bg-hover, rgba(255, 255, 255, 0.3));
  }

  .hfp-speed-menu {
    position: absolute;
    bottom: calc(100% + 8px);
    right: 0;
    background: var(--hfp-menu-bg, rgba(20, 20, 20, 0.95));
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--hfp-menu-border, rgba(255, 255, 255, 0.1));
    border-radius: var(--hfp-menu-radius, 8px);
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 80px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(4px);
    transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s;
    box-shadow: var(--hfp-menu-shadow, 0 8px 24px rgba(0, 0, 0, 0.4));
  }

  .hfp-speed-menu.hfp-open {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .hfp-speed-option {
    background: none;
    border: none;
    border-radius: 4px;
    color: var(--hfp-menu-color, rgba(255, 255, 255, 0.7));
    cursor: pointer;
    font-family: var(--hfp-font, system-ui, -apple-system, sans-serif);
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    padding: 6px 12px;
    text-align: left;
    transition: background 0.1s ease, color 0.1s ease;
    white-space: nowrap;
  }

  .hfp-speed-option:hover {
    background: var(--hfp-menu-hover-bg, rgba(255, 255, 255, 0.1));
    color: var(--hfp-color, #fff);
  }

  .hfp-speed-option.hfp-active {
    color: var(--hfp-accent, #fff);
    font-weight: 600;
  }

  .hfp-volume-wrap {
    position: relative;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 0;
  }

  .hfp-mute-btn {
    background: none;
    border: none;
    color: var(--hfp-color, #fff);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  .hfp-mute-btn:hover {
    opacity: 0.8;
  }

  .hfp-mute-btn svg,
  .hfp-mute-btn svg * {
    pointer-events: none;
  }

  .hfp-volume-slider-wrap {
    width: 0;
    overflow: hidden;
    transition: width 0.2s ease;
    display: flex;
    align-items: center;
  }

  .hfp-volume-wrap:hover .hfp-volume-slider-wrap {
    width: 64px;
  }

  .hfp-volume-slider {
    width: 56px;
    height: var(--hfp-scrubber-height, 4px);
    background: var(--hfp-scrubber-bg, rgba(255, 255, 255, 0.3));
    border-radius: var(--hfp-scrubber-radius, 2px);
    cursor: pointer;
    position: relative;
    overflow: hidden;
    margin-left: 4px;
    margin-right: 4px;
  }

  .hfp-volume-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: var(--hfp-accent, #fff);
    pointer-events: none;
  }
`,ke='<svg width="24" height="24" viewBox="46 21 54 56" fill="currentColor"><path d="M87.5129 57.5141L56.9696 73.5433C52.8371 75.7098 48.7046 73.2553 49.6688 69.2104L58.9483 30.1391C59.9125 26.0942 65.2097 23.6397 68.3154 25.8062L91.2447 41.8354C96.4668 45.4796 94.4631 53.8699 87.5129 57.5141Z"/></svg>',xe='<svg width="24" height="24" viewBox="0 0 18 18" fill="currentColor"><rect x="3" y="2" width="4" height="14"/><rect x="11" y="2" width="4" height="14"/></svg>',te='<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',ie='<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>',Me='<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" opacity="0.3"/><line x1="18" y1="7" x2="14" y2="17" stroke="currentColor" stroke-width="2"/></svg>';var re=[.25,.5,1,1.5,2,4];function O(r){return Number.isInteger(r)?`${r}x`:`${r}x`}function q(r){if(!Number.isFinite(r)||r<0)return"0:00";let e=Math.floor(r),t=Math.floor(e/60),i=e%60;return`${t}:${i.toString().padStart(2,"0")}`}function De(r,e,t={}){let i=t.speedPresets??re,n=document.createElement("div");n.className="hfp-controls",n.addEventListener("click",a=>{a.stopPropagation()});let o=document.createElement("button");o.className="hfp-play-btn",o.type="button",o.innerHTML=`<span class="hfp-ico hfp-ico-play">${ke}</span><span class="hfp-ico hfp-ico-pause">${xe}</span>`,o.setAttribute("aria-label","Play");let d=document.createElement("div");d.className="hfp-scrubber";let s=document.createElement("div");s.className="hfp-progress",s.style.width="0%",d.appendChild(s);let u=document.createElement("span");u.className="hfp-time",u.textContent="0:00 / 0:00";let c=document.createElement("div");c.className="hfp-speed-wrap";let p=document.createElement("button");p.className="hfp-speed-btn",p.type="button",p.textContent="1x",p.setAttribute("aria-label","Playback speed");let b=document.createElement("div");b.className="hfp-speed-menu",b.setAttribute("role","menu");for(let a of i){let l=document.createElement("button");l.className="hfp-speed-option",l.type="button",l.setAttribute("role","menuitem"),l.dataset.speed=String(a),l.textContent=O(a),a===1&&l.classList.add("hfp-active"),b.appendChild(l)}c.appendChild(b),c.appendChild(p);let y=document.createElement("div");y.className="hfp-volume-wrap";let f=document.createElement("button");f.className="hfp-mute-btn",f.type="button",f.innerHTML=te,f.setAttribute("aria-label","Mute");let S=document.createElement("div");S.className="hfp-volume-slider-wrap";let h=document.createElement("div");h.className="hfp-volume-slider",h.setAttribute("role","slider"),h.setAttribute("aria-label","Volume"),h.setAttribute("aria-valuemin","0"),h.setAttribute("aria-valuemax","100"),h.setAttribute("aria-valuenow","100"),h.tabIndex=0;let E=document.createElement("div");E.className="hfp-volume-fill",E.style.width="100%",h.appendChild(E),S.appendChild(h),y.appendChild(S),y.appendChild(f),t.audioLocked&&(y.style.display="none"),n.appendChild(o),n.appendChild(d),n.appendChild(u),n.appendChild(y),n.appendChild(c),r.appendChild(n);let U=!1,C=!1,w=1,I=null,V=i.indexOf(1);V===-1&&(V=0);let j=(a,l)=>a?Me:l===0?ie:l<.5?ie:te;o.addEventListener("click",a=>{a.stopPropagation(),U?e.onPause():e.onPlay()}),f.addEventListener("click",a=>{a.stopPropagation(),e.onMuteToggle()});let R=!1,z=a=>{let l=h.getBoundingClientRect(),g=Math.max(0,Math.min(1,(a-l.left)/l.width));w=g,E.style.width=`${g*100}%`,h.setAttribute("aria-valuenow",String(Math.round(g*100))),C&&g>0&&e.onMuteToggle(),f.innerHTML=j(C,g),e.onVolumeChange(g)};h.addEventListener("mousedown",a=>{a.stopPropagation(),R=!0,z(a.clientX)});let ue=a=>{R&&z(a.clientX)},ce=()=>{R=!1};document.addEventListener("mousemove",ue),document.addEventListener("mouseup",ce),h.addEventListener("touchstart",a=>{R=!0;let l=a.touches[0];l&&z(l.clientX)},{passive:!0});let pe=a=>{if(R){let l=a.touches[0];l&&z(l.clientX)}},me=()=>{R=!1};document.addEventListener("touchmove",pe,{passive:!0}),document.addEventListener("touchend",me);let he=.05;h.addEventListener("keydown",a=>{let l=w;if(a.key==="ArrowRight"||a.key==="ArrowUp")l=Math.min(1,w+he);else if(a.key==="ArrowLeft"||a.key==="ArrowDown")l=Math.max(0,w-he);else return;a.preventDefault(),a.stopPropagation(),w=l,E.style.width=`${l*100}%`,h.setAttribute("aria-valuenow",String(Math.round(l*100))),C&&l>0&&e.onMuteToggle(),f.innerHTML=j(C,l),e.onVolumeChange(l)});let fe=a=>{for(let l of b.querySelectorAll(".hfp-speed-option"))l.classList.toggle("hfp-active",l.dataset.speed===String(a))};p.addEventListener("click",a=>{a.stopPropagation();let l=b.classList.toggle("hfp-open");p.setAttribute("aria-expanded",String(l))}),b.addEventListener("click",a=>{a.stopPropagation();let l=a.target.closest(".hfp-speed-option");if(!l)return;let g=parseFloat(l.dataset.speed);V=i.indexOf(g),p.textContent=O(g),fe(g),b.classList.remove("hfp-open"),p.setAttribute("aria-expanded","false"),e.onSpeedChange(g)});let ge=()=>{b.classList.remove("hfp-open"),p.setAttribute("aria-expanded","false")};document.addEventListener("click",ge);let $=a=>{let l=d.getBoundingClientRect(),g=Math.max(0,Math.min(1,(a-l.left)/l.width));e.onSeek(g)},T=!1;d.addEventListener("mousedown",a=>{a.stopPropagation(),T=!0,e.onScrubStart?.(),$(a.clientX)});let ve=a=>{T&&$(a.clientX)},be=()=>{T&&(T=!1,e.onScrubEnd?.())};document.addEventListener("mousemove",ve),document.addEventListener("mouseup",be),d.addEventListener("touchstart",a=>{T=!0,e.onScrubStart?.();let l=a.touches[0];l&&$(l.clientX)},{passive:!0});let _e=a=>{if(T){let l=a.touches[0];l&&$(l.clientX)}},ye=()=>{T&&(T=!1,e.onScrubEnd?.())};document.addEventListener("touchmove",_e,{passive:!0}),document.addEventListener("touchend",ye);let Ee=()=>{I&&clearTimeout(I),I=setTimeout(()=>{U&&n.classList.add("hfp-hidden")},3e3)},B=r instanceof ShadowRoot?r.host:r,Se=()=>{n.classList.remove("hfp-hidden"),Ee()},Te=()=>{U&&n.classList.add("hfp-hidden")};return B.addEventListener("mousemove",Se),B.addEventListener("mouseleave",Te),{updateTime(a,l){let g=l>0?Math.min(a,l):a,Ke=l>0?g/l*100:0;s.style.width=`${Ke}%`,u.textContent=`${q(g)} / ${q(l)}`},updatePlaying(a){U=a,o.classList.toggle("hfp-playing",a),o.setAttribute("aria-label",a?"Pause":"Play"),a?Ee():n.classList.remove("hfp-hidden")},updateSpeed(a){let l=i.indexOf(a);l!==-1&&(V=l),p.textContent=O(a),fe(a)},updateMuted(a){C=a,f.innerHTML=j(a,w),f.setAttribute("aria-label",a?"Unmute":"Mute")},updateVolume(a){w=a,E.style.width=`${a*100}%`,h.setAttribute("aria-valuenow",String(Math.round(a*100))),f.innerHTML=j(C,a)},setVolumeControlsHidden(a){y.style.display=a?"none":""},show(){n.style.display=""},hide(){n.style.display="none"},destroy(){document.removeEventListener("mousemove",ve),document.removeEventListener("mouseup",be),document.removeEventListener("touchmove",_e),document.removeEventListener("touchend",ye),document.removeEventListener("mousemove",ue),document.removeEventListener("mouseup",ce),document.removeEventListener("touchmove",pe),document.removeEventListener("touchend",me),document.removeEventListener("click",ge),B.removeEventListener("mousemove",Se),B.removeEventListener("mouseleave",Te),I&&clearTimeout(I),n.remove()}}}function Le(r,e,t,i,n,o=!1){let d=i?i.split(",").map(Number).filter(c=>!isNaN(c)&&c>0):void 0,s={...d?{speedPresets:d}:{},audioLocked:o},u=De(r,n,s);return u.updateMuted(e),u.updateVolume(t),u}function ne(r,e,t){return e?(t||(t=document.createElement("img"),t.className="hfp-poster",r.appendChild(t)),t.src=e,t):(t?.remove(),null)}function Ie(r){return r.composedPath().some(e=>e instanceof HTMLElement&&e.classList.contains("hfp-controls"))}var G=null;function Pe(r,e){if(typeof CSSStyleSheet<"u")try{G||(G=new CSSStyleSheet,G.replaceSync(e)),r.adoptedStyleSheets=[G];return}catch{}let t=document.createElement("style");t.textContent=e,r.appendChild(t)}function Ne(){let r=document.createElement("div");r.className="hfp-container";let e=document.createElement("iframe");return e.className="hfp-iframe",e.sandbox.add("allow-scripts","allow-same-origin"),e.allow="autoplay; fullscreen",e.referrerPolicy="no-referrer",e.title="HyperFrames Composition",r.appendChild(e),{container:r,iframe:e}}function Oe(r,e,t,i){let n=r.offsetWidth,o=r.offsetHeight;if(n===0||o===0)return!1;let d=Math.min(n/t,o/i);return e.style.width=`${t}px`,e.style.height=`${i}px`,e.style.transform=`translate(-50%, -50%) scale(${d})`,!0}var Y=class{constructor(e){this._callbacks=e}_callbacks;_raf=null;_lastUpdateMs=0;start(e,t,i,n){this.stop();let o=()=>{if(n()){this._raf=null;return}let d;try{d=e.time()}catch{this._raf=null;return}let s=i();s>0&&(d=Math.min(d,s));let u=s>0&&d>=s,c=performance.now();if((c-this._lastUpdateMs>100||u)&&(this._lastUpdateMs=c,this._callbacks.onTimeUpdate(d,s)),u){if(this._callbacks.getLoop()){this._callbacks.restart();return}try{e.pause()}catch{}this._callbacks.onPaused(),this._raf=null;return}this._raf=requestAnimationFrame(o)};this._raf=requestAnimationFrame(o)}stop(){this._raf!==null&&(cancelAnimationFrame(this._raf),this._raf=null)}get isRunning(){return this._raf!==null}};function Fe(r){let e=Array.from(r.querySelectorAll("[data-composition-id]"));if(e.length===0)return r.body?[r.body]:[];let t=[];for(let i of e)dt(i)||t.push(i);return st(r),t}function st(r){let e=r.body;if(!e||typeof console>"u"||typeof console.warn!="function")return;let t=e.querySelectorAll("audio[data-start], video[data-start]");if(t.length===0)return;let i=[];for(let n of t)n.closest("[data-composition-id]")||i.push(n);i.length!==0&&console.warn(`[hyperframes-player] selectMediaObserverTargets: composition hosts are present, but ${i.length} body-level timed media element(s) sit outside every [data-composition-id] subtree and will not be observed. Move them inside a composition host or the parent-frame proxy will never adopt them.`,i)}function dt(r){let e=r.parentElement;for(;e;){if(e.hasAttribute("data-composition-id"))return!0;e=e.parentElement}return!1}function X(r){let e=r.ownerDocument?.defaultView;return e&&r instanceof e.Element?!0:r instanceof Element}function _(r){if(!X(r)||r.tagName!=="AUDIO"&&r.tagName!=="VIDEO")return!1;let e=r.ownerDocument?.defaultView;return e&&r instanceof e.HTMLMediaElement?!0:r instanceof HTMLMediaElement}var m=Object.freeze({start:"data-start",duration:"data-duration",trackIndex:"data-track-index",derivedEnd:"data-end",legacyTrack:"data-layer"}),ri=Object.freeze([m.start,m.duration,m.trackIndex]),ni=Object.freeze([m.derivedEnd]),oi=Object.freeze([m.derivedEnd,m.legacyTrack]);function x(r){if(r==null||r.trim()==="")return null;let e=Number(r);return Number.isFinite(e)?e:null}var Ve=/^[A-Za-z0-9_.:-]+$/;function je(r,e){let t=r.charCodeAt(e);return t>=48&&t<=57}function He(r,e){let t=e;for(;t>=0&&je(r,t);)t--;return t}function lt(r,e){let t=e;for(;t>=0&&(r[t]??"").trim()==="";)t--;return t}function ut(r){let e=r.length-1;if(!je(r,e))return null;let t=He(r,e);return r[t]==="."&&(t=He(r,t-1)),t+1}function ct(r){let e=ut(r);if(e==null)return null;let t=lt(r,e-1),i=r[t];if(i!=="+"&&i!=="-")return null;let n=r.slice(0,t).trim();if(!Ve.test(n))return null;let o=Number(r.slice(e));return Number.isFinite(o)?{refId:n,operator:i,magnitude:o}:null}function pt(r){let e=(r??"").trim();if(!e)return null;let t=x(e);if(t!=null)return{kind:"absolute",value:t};if(Ve.test(e))return{kind:"reference",refId:e,offset:0};let i=ct(e);return i?{kind:"reference",refId:i.refId,offset:i.operator==="-"?-i.magnitude:i.magnitude}:null}function v(r,e,t,i){r.push({code:e,attribute:t,value:i})}function mt(r,e,t,i){if(e==null||e.trim()==="")return t.defaultStart===void 0?0:t.defaultStart;if(!r)return v(i,"invalid-start",m.start,e),null;if(r.kind==="absolute")return Math.max(0,r.value);let n=t.resolveReferenceEnd?.(r.refId);return n==null||!Number.isFinite(n)?(v(i,"unresolved-start-reference",m.start,e),null):Math.max(0,n+r.offset)}var ht=1e-9;function ft(r,e){return Math.abs(r-e)<=ht}function gt(r,e,t){let i=x(r);if(i==null){v(t,"deprecated-end",m.derivedEnd,r),v(t,"invalid-end",m.derivedEnd,r);return}if(e==null){v(t,"deprecated-end",m.derivedEnd,r);return}ft(i,e)||(v(t,"deprecated-end",m.derivedEnd,r),v(t,"conflicting-end",m.derivedEnd,r))}function vt(r,e,t){let i=x(r);return i==null||i<0?(v(t,"invalid-duration",m.duration,r),{duration:null,end:null,durationSource:"invalid"}):{duration:i,end:e==null?null:e+i,durationSource:"duration"}}function bt(r,e,t){v(t,"deprecated-end",m.derivedEnd,r);let i=x(r);return i==null?(v(t,"invalid-end",m.derivedEnd,r),{duration:null,end:null,durationSource:"invalid"}):e==null?{duration:null,end:i,durationSource:"legacy-end"}:i<e?(v(t,"end-before-start",m.derivedEnd,r),{duration:null,end:null,durationSource:"invalid"}):{duration:i-e,end:i,durationSource:"legacy-end"}}function _t(r,e,t){let i=r.getAttribute(m.duration),n=r.getAttribute(m.derivedEnd);if(i==null)return n==null?{duration:null,end:null,durationSource:"missing"}:bt(n,e,t);let o=vt(i,e,t);return n!=null&&gt(n,o.end,t),o}function Ue(r,e,t,i){let n=x(r);return n==null||!Number.isInteger(n)?(v(i,"invalid-track-index",e,r),{trackIndex:0,trackSource:"invalid"}):{trackIndex:n,trackSource:t}}function yt(r,e){let t=r.getAttribute(m.trackIndex),i=r.getAttribute(m.legacyTrack);if(t==null&&i==null)return{trackIndex:0,trackSource:"default"};if(t==null&&i!=null)return v(e,"deprecated-layer",m.legacyTrack,i),Ue(i,m.legacyTrack,"legacy-layer",e);let n=Ue(t??"",m.trackIndex,"track-index",e);if(i==null)return n;v(e,"deprecated-layer",m.legacyTrack,i);let o=x(i);return o!=null&&o!==n.trackIndex&&v(e,"conflicting-layer",m.legacyTrack,i),n}function oe(r,e={}){let t=[],i=r.getAttribute(m.start),n=pt(i),o=mt(n,i,e,t),d=_t(r,o,t),s=yt(r,t);return{startExpression:n,start:o,...d,...s,diagnostics:t}}var Et=.05,St=2,Z=class{_entries=[];_mediaObserver;_playbackErrorPosted=!1;_audioOwner="runtime";_urlAudioEntry=null;_urlAudioSrc=null;_dispatchEvent;_getMuted;_getVolume;_getPlaybackRate;_getCurrentTime;_isPaused;constructor(e){this._dispatchEvent=e.dispatchEvent,this._getMuted=e.getMuted,this._getVolume=e.getVolume,this._getPlaybackRate=e.getPlaybackRate,this._getCurrentTime=e.getCurrentTime,this._isPaused=e.isPaused}get audioOwner(){return this._audioOwner}get entries(){return this._entries}resetForIframeLoad(){this._playbackErrorPosted=!1;let e=this._audioOwner==="parent";this._audioOwner="runtime",this.pauseAll(),this.teardownObserver(),e&&this._dispatchEvent(new CustomEvent("audioownershipchange",{detail:{owner:"runtime",reason:"iframe-reload"}}))}destroy(){this.teardownObserver();for(let e of this._entries)e.el.pause(),e.el.src="";this._entries=[],this._urlAudioEntry=null,this._urlAudioSrc=null,this._audioOwner="runtime",this._playbackErrorPosted=!1}updateMuted(e){for(let t of this._entries)t.el.muted=e}updateVolume(e){for(let t of this._entries)t.el.volume=e}updatePlaybackRate(e){for(let t of this._entries)t.el.playbackRate=e}_playEntry(e){e.el.src&&e.el.play().catch(t=>this._reportPlaybackError(t))}_playEntryIfActive(e){this._refreshEntryBounds(e);let t=this._getCurrentTime()-e.start;t<0||t>=e.duration||this._playEntry(e)}_refreshEntryBounds(e){if(!e.source?.isConnected)return;let t=oe(e.source);e.start=t.start??0,e.duration=t.duration!=null&&t.duration>0?t.duration:Number.POSITIVE_INFINITY}_gateEntryPlayback(e,t){return t<0||t>=e.duration?(e.el.paused||e.el.pause(),e.driftSamples=0,!1):(this._audioOwner==="parent"&&!this._isPaused()&&e.el.paused&&this._playEntry(e),!0)}playAll(){for(let e of this._entries)this._playEntryIfActive(e)}pauseAll(){for(let e of this._entries)e.el.pause()}stopAdoptedMedia(){for(let e of this._entries)e.source&&e.el.pause()}seekAll(e){for(let t of this._entries){this._refreshEntryBounds(t);let i=e-t.start;i>=0&&i<t.duration&&(t.el.currentTime=i)}}scrubAll(e){for(let t of this._entries){this._refreshEntryBounds(t);let i=e-t.start;i>=0&&i<t.duration?(t.el.currentTime=i,this._playEntry(t)):t.el.paused||t.el.pause()}}mirrorTime(e,t){let i=t?.force===!0;for(let n of this._entries){this._refreshEntryBounds(n);let o=e-n.start;this._gateEntryPlayback(n,o)&&(Math.abs(n.el.currentTime-o)>Et?(n.driftSamples+=1,(i||n.driftSamples>=St)&&(n.el.currentTime=o,n.driftSamples=0)):n.driftSamples=0)}}promoteToParentProxy(e,t){if(this._audioOwner==="parent")return;if(this._audioOwner="parent",e)for(let n of e.querySelectorAll("video, audio"))_(n)&&(n.muted=!0);let i=this._getCurrentTime();t?t(i,{force:!0}):this.mirrorTime(i,{force:!0}),this._isPaused()||this.playAll(),this._dispatchEvent(new CustomEvent("audioownershipchange",{detail:{owner:"parent",reason:"autoplay-blocked"}}))}setupFromIframe(e){let t=e.querySelectorAll("audio[data-start], video[data-start]");for(let i of t)_(i)&&this._adoptIframeMedia(i);this._observeDynamicMedia(e)}setupFromUrl(e){if(this._urlAudioSrc===e&&this._urlAudioEntry)return;this.teardownUrlAudio();let t=this._createEntry(e,"audio",0,1/0);this._urlAudioEntry=t,this._urlAudioSrc=t?e:null,t&&this._audioOwner==="parent"&&!this._isPaused()&&(this.mirrorTime(this._getCurrentTime(),{force:!0}),this.playAll())}teardownUrlAudio(){let e=this._urlAudioEntry;if(this._urlAudioEntry=null,this._urlAudioSrc=null,!e)return;e.el.pause(),e.el.src="";let t=this._entries.indexOf(e);t!==-1&&this._entries.splice(t,1)}teardownObserver(){this._mediaObserver?.disconnect(),this._mediaObserver=void 0}_reportPlaybackError(e){this._playbackErrorPosted||(this._playbackErrorPosted=!0,this._dispatchEvent(new CustomEvent("playbackerror",{detail:{source:"parent-proxy",error:e}})))}_createEntry(e,t,i,n,o){if(this._entries.some(c=>c.el.src===e))return null;let d=t==="video"?document.createElement("video"):new Audio;d.preload="auto",d.src=e,d.load(),d.muted=this._getMuted(),d.volume=this._getVolume();let s=this._getPlaybackRate();s!==1&&(d.playbackRate=s);let u={el:d,start:i,duration:n,driftSamples:0,source:o};return this._entries.push(u),u}_resolveIframeMediaSrc(e){let t=e.getAttribute("src")||e.querySelector("source")?.getAttribute("src");return t?new URL(t,e.ownerDocument.baseURI).href:null}_adoptIframeMedia(e){if(e.preload==="metadata"||e.preload==="none")return;let t=this._resolveIframeMediaSrc(e);if(!t)return;let i=oe(e),n=i.start??0,o=i.duration??Number.POSITIVE_INFINITY,d=e.tagName==="VIDEO"?"video":"audio",s=this._createEntry(t,d,n,o,e);s&&this._audioOwner==="parent"&&(this.mirrorTime(this._getCurrentTime(),{force:!0}),this._isPaused()||this._playEntryIfActive(s))}_detachIframeMedia(e){let t=this._resolveIframeMediaSrc(e);if(!t)return;let i=this._entries.findIndex(o=>o.el.src===t);if(i===-1)return;let n=this._entries[i];n.el.pause(),n.el.src="",this._entries.splice(i,1)}_observeDynamicMedia(e){if(this.teardownObserver(),typeof MutationObserver>"u"||!e.body)return;let t=new MutationObserver(o=>{for(let d of o){if(d.type==="attributes"&&d.attributeName==="preload"){let s=d.target;_(s)&&s.matches("audio[data-start], video[data-start]")&&s.preload==="auto"&&this._adoptIframeMedia(s);continue}for(let s of d.addedNodes){if(!X(s))continue;let u=[];_(s)&&s.matches("audio[data-start], video[data-start]")&&u.push(s);let c=s.querySelectorAll("audio[data-start], video[data-start]");for(let p of c)_(p)&&u.push(p);for(let p of u)this._adoptIframeMedia(p)}for(let s of d.removedNodes){if(!X(s))continue;let u=[];_(s)&&s.matches("audio[data-start], video[data-start]")&&u.push(s);let c=s.querySelectorAll("audio[data-start], video[data-start]");for(let p of c)_(p)&&u.push(p);for(let p of u)this._detachIframeMedia(p)}}}),i={childList:!0,subtree:!0,attributes:!0,attributeFilter:["preload"]},n=Fe(e);for(let o of n)t.observe(o,i);this._mediaObserver=t}};function ze(r,e,t,i){let n=(r.frame??0)/e,o=t.duration>0?Math.min(n,t.duration):n,d=!t.paused,s=!r.isPlaying,u=t.duration>0&&o>=t.duration&&(d||r.isPlaying);if(u&&i.getLoop())return i.media.audioOwner==="parent"&&i.media.pauseAll(),i.seek(0),i.play(),{...t,currentTime:o,paused:!1};let c={...t,currentTime:o,paused:s};i.media.audioOwner==="parent"&&(d&&s?i.media.pauseAll():!d&&!s&&i.media.playAll(),i.media.mirrorTime(o));let p=performance.now(),b=s!==t.paused;return(p-t.lastUpdateMs>100||b)&&(c.lastUpdateMs=p,i.updateControlsTime(o,t.duration),i.updateControlsPlaying(!s),i.dispatchEvent(new CustomEvent("timeupdate",{detail:{currentTime:o}}))),u&&(i.media.audioOwner==="parent"&&i.media.pauseAll(),c.paused=!0,i.updateControlsPlaying(!1),i.dispatchEvent(new Event("ended"))),c}var Tt=["seconds-time","rational-fps","seek-keep-playing","composition-manifest-v1","runtime-data"];function wt(r,e){let t=Math.abs(r),i=Math.abs(e);for(;i!==0;){let n=t%i;t=i,i=n}return t||1}function At(r){let e=Number.isFinite(r)&&r>0?r:30,t=Number.isInteger(e)?1:1e6,i=Math.round(e*t),n=wt(i,t);return{numerator:i/n,denominator:t/n}}function Ct(r){if(typeof r!="object"||r===null)return null;let e=r;return!Number.isFinite(e.numerator)||!Number.isFinite(e.denominator)||(e.numerator??0)<=0||(e.denominator??0)<=0?null:Number(e.numerator)/Number(e.denominator)}function $e(r){return{protocolVersion:1,capabilities:Tt,fps:At(r)}}function Rt(r){return Array.isArray(r)&&r.every(e=>typeof e=="string")}function Be(r,e=30){if(typeof r!="object"||r===null)return{status:"legacy",fps:e};let t=r;if(t.protocolVersion===void 0)return{status:"legacy",fps:e};if(t.protocolVersion!==1)return{status:"unsupported",code:"unsupported_protocol_version",receivedVersion:t.protocolVersion};let i=Ct(t.fps);return i===null||!Rt(t.capabilities)?{status:"unsupported",code:"invalid_protocol_metadata",receivedVersion:t.protocolVersion}:{status:"supported",fps:i,metadata:t}}function kt(r){return Array.isArray(r)?r.filter(e=>typeof e=="object"&&e!==null&&typeof e.id=="string"&&typeof e.start=="number"&&typeof e.duration=="number"):[]}function We(r,e,t){if(r.source!==e)return;let i=r.data;if(!i||i.source!=="hf-preview")return;let n=Be(i);if(n.status==="unsupported"){t.dispatchEvent(new CustomEvent("runtimeprotocolerror",{detail:{code:n.code,receivedVersion:n.receivedVersion}}));return}if(t.setRuntimeFps?.(n.fps),i.type==="shader-transition-state"){let o=i.state&&typeof i.state=="object"?i.state:{};t.shaderLoader.update(o,t.getShaderLoadingMode()),t.dispatchEvent(new CustomEvent("shadertransitionstate",{detail:{compositionId:i.compositionId,state:o}}));return}if(i.type==="ready"){t.onRuntimeReady();return}if(i.type==="runtime-data-error"){t.onRuntimeDataError?.(i.channel,i.requestId,i.message);return}if(i.type==="runtime-data-applied"){t.onRuntimeDataApplied?.(i.channel,i.requestId);return}if(i.type==="state"){t.setPlaybackState(ze({frame:i.frame??0,isPlaying:!!i.isPlaying},n.fps,t.getPlaybackState(),t));return}if(i.type==="media-autoplay-blocked"){if(t.shouldPromoteMediaAutoplayFallback?.()===!1)return;let o=null;try{o=t.getIframeDoc()}catch{}t.media.promoteToParentProxy(o,(d,s)=>t.media.mirrorTime(d,s)),t.sendControl("set-media-output-muted",{muted:!0});return}if(i.type==="timeline"&&i.durationInFrames>0){let o=Number(i.durationSeconds),d=Number(i.durationInFrames),s=Number.isFinite(o)&&o>0?o:d/n.fps;if(Number.isFinite(s)&&s>0){let u=t.getPlaybackState();t.setPlaybackState({...u,duration:s}),t.updateControlsTime(u.currentTime,s),t.onRuntimeTimelineReady(s)}Number.isFinite(i.compositionWidth)&&i.compositionWidth>0&&Number.isFinite(i.compositionHeight)&&i.compositionHeight>0&&t.setCompositionSize(i.compositionWidth,i.compositionHeight),t.setScenes(kt(i.scenes));return}i.type==="stage-size"&&Number.isFinite(i.width)&&i.width>0&&Number.isFinite(i.height)&&i.height>0&&t.setCompositionSize(i.width,i.height)}function xt(r,e){return r.includes(e)?!0:/hyperframe\.runtime\.iife\.js|__hyperframes\s*=/.test(r)}var Mt=new Set([">"," ","	",`
`,"\r","\f"]);function ae(r,e){let t=r.toLowerCase(),i=`<${e}`,n=0;for(;n<t.length;){let o=t.indexOf(i,n);if(o<0)return null;let d=t[o+i.length];if(Mt.has(d)){let s=t.indexOf(">",o+i.length);return s<0?null:{index:o,end:s+1}}n=o+i.length}return null}function qe(r,e){if(!r||xt(r,e))return r;let t=`<script src="${e}"></script>`,i=ae(r,"head");if(i)return r.slice(0,i.end)+t+r.slice(i.end);let n=ae(r,"body");if(n)return r.slice(0,n.index)+t+r.slice(n.index);let o=ae(r,"html");return o?r.slice(0,o.end)+t+r.slice(o.end):t+r}var A="shader-capture-scale",M="shader-loading",Q="runtime-src",Ge="__hf_shader_capture_scale",Ye="__hf_shader_loading",D=["Preparing scene transitions","Sampling outgoing scene motion","Sampling incoming scene motion","Caching transition frames","Finalizing transition preview"];function se(r){if(r===null)return null;let e=Number(r);return!Number.isFinite(e)||e<=0?null:String(Math.min(1,Math.max(.25,e)))}function Dt(r){if(r===null||r.trim()==="")return"composition";let e=r.trim().toLowerCase();return e==="none"||e==="false"||e==="0"||e==="off"?"none":e==="player"||e==="true"||e==="1"||e==="on"?"player":"composition"}function Xe(r,e){return r.filter(t=>t!==""&&t.split("=")[0]!==e)}function Lt(r,e,t){let i=r.indexOf("#"),n=i>=0?r.slice(0,i):r,o=i>=0?r.slice(i):"",d=n.indexOf("?"),s=d>=0?n.slice(0,d):n,u=d>=0?n.slice(d+1):"",c=Xe(u.split("&"),Ge);c=Xe(c,Ye),e!==null&&c.push(`${Ge}=${encodeURIComponent(e)}`),t!=="composition"&&c.push(`${Ye}=${encodeURIComponent(t)}`);let p=c.join("&");return`${s}${p?`?${p}`:""}${o}`}function It(r,e,t){if(e===null&&t==="composition")return r;let i=[];e!==null&&i.push(`window.__HF_SHADER_CAPTURE_SCALE=${JSON.stringify(e)};`),t!=="composition"&&i.push(`window.__HF_SHADER_LOADING=${JSON.stringify(t)};`);let n=`<script data-hyperframes-player-shader-options>${i.join("")}</script>`;return/<head\b[^>]*>/i.test(r)?r.replace(/<head\b[^>]*>/i,o=>`${o}${n}`):/<html\b[^>]*>/i.test(r)?r.replace(/<html\b[^>]*>/i,o=>`${o}${n}`):`${n}${r}`}function L(r){return Dt(r.getAttribute(M))}function Ze(r){return Number(se(r.getAttribute(A))??"1")}function F(r,e){return Lt(e,se(r.getAttribute(A)),L(r))}function H(r,e){return qe(It(e,se(r.getAttribute(A)),L(r)),Pt(r))}function Pt(r){let e=r.getAttribute(Q)?.trim();if(!e)return k;try{let t=new URL(e,document.baseURI),i=t.protocol==="http:"||t.protocol==="https:",n=t.hostname==="127.0.0.1"||t.hostname==="localhost"||t.hostname==="[::1]";return i&&(n||t.origin===location.origin)?t.href:k}catch{return k}}function Qe(){let r=document.createElement("div");r.className="hfp-shader-loader",r.setAttribute("role","status"),r.setAttribute("aria-live","polite"),r.setAttribute("aria-label","Preparing scene transitions"),r.setAttribute("data-hyperframes-ignore",""),r.draggable=!1;let e=f=>{f.preventDefault(),f.stopPropagation()};for(let f of["selectstart","dragstart","pointerdown","mousedown","click","dblclick","contextmenu","touchstart"])r.addEventListener(f,e,{capture:!0});let t=document.createElement("div");t.className="hfp-shader-loader-panel",t.draggable=!1;let i=document.createElement("div");i.className="hfp-shader-loader-mark",i.draggable=!1,i.innerHTML=['<svg width="78" height="78" viewBox="0 0 100 100" fill="none" aria-hidden="true" draggable="false">','<path d="M10.1851 57.8021L33.1145 73.8313C36.2202 75.9978 41.5173 73.5433 42.4816 69.4984L51.7611 30.4271C52.7253 26.3822 48.5802 23.9277 44.4602 26.0942L13.917 42.1235C6.96677 45.7676 4.97564 54.1579 10.1851 57.8021Z" fill="url(#hfp-shader-loader-grad-left)"/>','<path d="M87.5129 57.5141L56.9696 73.5433C52.8371 75.7098 48.7046 73.2553 49.6688 69.2104L58.9483 30.1391C59.9125 26.0942 65.2097 23.6397 68.3154 25.8062L91.2447 41.8354C96.4668 45.4796 94.4631 53.8699 87.5129 57.5141Z" fill="url(#hfp-shader-loader-grad-right)"/>',"<defs>",'<linearGradient id="hfp-shader-loader-grad-left" x1="48.5676" y1="25" x2="44.7804" y2="71.9384" gradientUnits="userSpaceOnUse">','<stop stop-color="#06E3FA"/>','<stop offset="1" stop-color="#4FDB5E"/>',"</linearGradient>",'<linearGradient id="hfp-shader-loader-grad-right" x1="54.8282" y1="73.8392" x2="72.0989" y2="32.8932" gradientUnits="userSpaceOnUse">','<stop stop-color="#06E3FA"/>','<stop offset="1" stop-color="#4FDB5E"/>',"</linearGradient>","</defs>","</svg>"].join("");let n=document.createElement("div");n.className="hfp-shader-loader-title";let o=document.createElement("span");o.className="hfp-shader-loader-title-text",o.textContent=D[0]||"Preparing scene transitions",n.appendChild(o);let d=document.createElement("div");d.className="hfp-shader-loader-detail",d.textContent="Rendering animated scene samples for shader transitions.";let s=document.createElement("div");s.className="hfp-shader-loader-track",s.setAttribute("aria-hidden","true");let u=document.createElement("div");u.className="hfp-shader-loader-fill",s.appendChild(u);let c=document.createElement("div");c.className="hfp-shader-loader-progress";let p=f=>{let S=document.createElement("div");S.className="hfp-shader-loader-row";let h=document.createElement("span");h.className="hfp-shader-loader-label",h.textContent=f;let E=document.createElement("span");return E.className="hfp-shader-loader-value",S.appendChild(h),S.appendChild(E),c.appendChild(S),{row:S,label:h,value:E}},b=p("transition"),y=p("transition frame");return t.appendChild(i),t.appendChild(n),t.appendChild(d),t.appendChild(s),t.appendChild(c),r.appendChild(t),{root:r,fill:u,title:o,detail:d,transitionValue:b.value,frameLabel:y.label,frameValue:y.value,frameRow:y.row}}var Nt=420,J=class{_el;_hideTimeout=null;constructor(e){this._el=e}show(){this._hideTimeout&&(clearTimeout(this._hideTimeout),this._hideTimeout=null),this._el.root.classList.remove("hfp-hiding"),this._el.root.classList.add("hfp-visible")}hide(){if(this._el.root.classList.contains("hfp-hiding")){this._hideTimeout||this._scheduleCleanup();return}this._el.root.classList.contains("hfp-visible")&&(this._el.root.classList.add("hfp-hiding"),this._el.root.classList.remove("hfp-visible"),this._scheduleCleanup())}reset(){this._hideTimeout&&(clearTimeout(this._hideTimeout),this._hideTimeout=null),this._el.root.classList.remove("hfp-visible","hfp-hiding"),this._el.fill.style.transform="scaleX(0)",this._el.transitionValue.textContent="",this._el.frameValue.textContent="",this._el.frameRow.style.visibility="hidden"}update(e,t){if(t!=="player"){this.reset();return}if(e.ready||!e.loading){this.hide();return}let i=typeof e.progress=="number"&&Number.isFinite(e.progress)?e.progress:0,n=typeof e.total=="number"&&Number.isFinite(e.total)?e.total:0,o=n>0?Math.min(1,Math.max(0,i/n)):0,d=Math.min(D.length-1,Math.floor(o*D.length));this._el.title.textContent=D[d]||"Preparing scene transitions",this._el.detail.textContent=e.phase==="cached"?"Loading cached transition frames before playback.":e.phase==="finalizing"?"Uploading transition textures for smooth playback.":"Rendering animated scene samples for shader transitions.",this._el.fill.style.transform=`scaleX(${o})`,this._el.transitionValue.textContent=e.currentTransition!==void 0&&e.transitionTotal!==void 0?`${e.currentTransition}/${e.transitionTotal}`:n>0?`${i}/${n}`:"";let s=e.transitionFrame!==void 0&&e.transitionFrames!==void 0?`${e.transitionFrame}/${e.transitionFrames}`:"";this._el.frameLabel.textContent=e.phase==="cached"?"cached transition frames":e.phase==="finalizing"?"finalizing transition frames":"rendering transition frames",this._el.frameValue.textContent=s,this._el.frameRow.style.visibility=s?"visible":"hidden",this._el.root.setAttribute("aria-valuenow",String(Math.round(o*100))),this.show()}get hideTimeout(){return this._hideTimeout}destroy(){this._hideTimeout&&(clearTimeout(this._hideTimeout),this._hideTimeout=null)}_scheduleCleanup(){this._hideTimeout&&clearTimeout(this._hideTimeout),this._hideTimeout=setTimeout(()=>{this._el.root.classList.remove("hfp-hiding"),this._hideTimeout=null},Nt)}};var Ot=.1,Ft=5,de="sandbox-origin",Je=1e4;function le(r){return!Number.isFinite(r)||r<=0?1:Math.max(Ot,Math.min(Ft,r))}var K=class extends HTMLElement{static get observedAttributes(){return["src","srcdoc","width","height","controls","muted","audio-locked","volume","poster","playback-rate","audio-src",de,Q,A,M]}shadow;container;iframe;posterEl=null;controlsApi=null;resizeObserver;shaderLoader;probe;_ready=!1;_currentTime=0;_duration=0;_paused=!0;_scrubbing=!1;_lastUpdateMs=0;_volume=1;_compositionWidth=1920;_compositionHeight=1080;_rescaleWarned=!1;_directTimelineAdapter=null;_directTimelineClock;_parentTickRaf=null;_media;_scenes=[];_runtimeFps=30;_runtimeBridgeReady=!1;_runtimeData=new Map;_runtimeDataRequestId=0;_pendingRuntimeData=new Map;constructor(){super(),this.shadow=this.attachShadow({mode:"open"}),Pe(this.shadow,Re),{container:this.container,iframe:this.iframe}=Ne(),this.shadow.appendChild(this.container);let e=Qe();this.shadow.appendChild(e.root),this.shaderLoader=new J(e),this._media=new Z({dispatchEvent:t=>this.dispatchEvent(t),getMuted:()=>this.muted,getVolume:()=>this._volume,getPlaybackRate:()=>this.playbackRate,getCurrentTime:()=>this._currentTime,isPaused:()=>this._paused}),this._directTimelineClock=new Y({onTimeUpdate:(t,i)=>{this._currentTime=t,this.controlsApi?.updateTime(t,i),this.dispatchEvent(new CustomEvent("timeupdate",{detail:{currentTime:t}}))},getLoop:()=>this.loop,restart:()=>{this.seek(0),this.play()},onPaused:()=>{this._media.audioOwner==="parent"&&this._media.pauseAll(),this._paused=!0,this.controlsApi?.updatePlaying(!1),this.dispatchEvent(new Event("ended"))},onEnded:()=>this.loop}),this.probe=new W(this.iframe,{onReady:t=>this._onProbeReady(t),onError:t=>this.dispatchEvent(new CustomEvent("error",{detail:{message:t}}))}),this.addEventListener("click",t=>{Ie(t)||(this._paused?this.play():this.pause())}),this.resizeObserver=new ResizeObserver(()=>this._rescale()),this._onMessage=this._onMessage.bind(this),this._onIframeLoad=this._onIframeLoad.bind(this)}connectedCallback(){this._applySandboxOriginPolicy(),this.resizeObserver.observe(this),window.addEventListener("message",this._onMessage),this.iframe.addEventListener("load",this._onIframeLoad),this.hasAttribute("controls")&&this._setupControls(),this.hasAttribute("poster")&&(this.posterEl=ne(this.shadow,this.getAttribute("poster"),this.posterEl)),this.hasAttribute("audio-src")&&this._media.setupFromUrl(this.getAttribute("audio-src")),this.hasAttribute("srcdoc")&&(this.iframe.srcdoc=H(this,this.getAttribute("srcdoc"))),this.hasAttribute("src")&&(this.iframe.src=F(this,this.getAttribute("src"))),!this.hasAttribute("audio-locked")&&this._isLockedHostEnvironment()&&this._applyAudioLock(!0)}disconnectedCallback(){this._sendControl("pause"),this._stopIframeMedia(),this.resizeObserver.disconnect(),window.removeEventListener("message",this._onMessage),this.iframe.removeEventListener("load",this._onIframeLoad),this.probe.stop(),this._directTimelineClock.stop(),this._stopParentTickClock(),this._directTimelineAdapter=null,this.shaderLoader.destroy(),this._media.destroy(),this.controlsApi?.destroy(),this.controlsApi=null,this._paused=!0,this._ready=!1,this._runtimeBridgeReady=!1,this._rejectAllRuntimeDataDeliveries("Player disconnected before runtime data was applied")}attributeChangedCallback(e,t,i){switch(e){case"src":if(!this.isConnected)break;i&&(this._ready=!1,this._runtimeBridgeReady=!1,this._rejectAllRuntimeDataDeliveries("Composition navigated before runtime data was applied"),this.iframe.src=F(this,i));break;case"srcdoc":if(!this.isConnected)break;this._ready=!1,this._runtimeBridgeReady=!1,this._rejectAllRuntimeDataDeliveries("Composition navigated before runtime data was applied"),i!==null?this.iframe.srcdoc=H(this,i):this.iframe.removeAttribute("srcdoc");break;case de:this._applySandboxOriginPolicy(this.isConnected&&t!==i);break;case"width":this._compositionWidth=N(i)??1920,this._rescale();break;case"height":this._compositionHeight=N(i)??1080,this._rescale();break;case"controls":i!==null?this._setupControls():(this.controlsApi?.destroy(),this.controlsApi=null);break;case"poster":this.posterEl=ne(this.shadow,i,this.posterEl);break;case"playback-rate":{let n=le(parseFloat(i||"1"));this._media.updatePlaybackRate(n),this._sendControl("set-playback-rate",{playbackRate:n}),this._directTimelineAdapter?.timeScale?.(n),this.controlsApi?.updateSpeed(n),this.dispatchEvent(new Event("ratechange"));break}case"muted":this._handleMutedChange(i);break;case"audio-locked":this._applyAudioLock(i!==null);break;case"volume":{let n=Math.max(0,Math.min(1,parseFloat(i||"1")));this._volume=n,this._media.updateVolume(n),this._sendControl("set-volume",{volume:n}),this.controlsApi?.updateVolume(n),this.dispatchEvent(new Event("volumechange"));break}case"audio-src":i?this._media.setupFromUrl(i):this._media.teardownUrlAudio();break;case A:case M:case Q:if(!this.isConnected)break;this._reloadShaderOptions();break}}_applySandboxOriginPolicy(e=!1){this.hasAttribute(de)?this.iframe.sandbox.remove("allow-same-origin"):this.iframe.sandbox.add("allow-same-origin"),e&&this._reloadForSandboxOriginPolicy()}_reloadForSandboxOriginPolicy(){this._ready=!1,this._runtimeBridgeReady=!1,this._rejectAllRuntimeDataDeliveries("Sandbox policy changed before runtime data was applied");let e=this.getAttribute("srcdoc");if(e!==null){this.iframe.srcdoc=H(this,e);return}let t=this.getAttribute("src");this.iframe.src=t===null?"about:blank":F(this,t)}get iframeElement(){return this.iframe}get scenes(){return this._scenes}play(){this.posterEl?.remove(),this.posterEl=null,this._duration>0&&this._currentTime>=this._duration&&this.seek(0),this._paused=!1;let e=this._tryDirectTimelinePlay();e||(this._sendControl("play"),this._ready&&!this._directTimelineAdapter&&this._startParentTickClock()),this._media.audioOwner==="parent"&&this._media.playAll(),this.controlsApi?.updatePlaying(!0),this.dispatchEvent(new Event("play")),e&&this._directTimelineAdapter&&this._directTimelineClock.start(this._directTimelineAdapter,()=>this._currentTime,()=>this._duration,()=>this._paused)}pause(){this._tryDirectTimelinePause()||this._sendControl("pause"),this._directTimelineClock.stop(),this._stopParentTickClock(),this._media.audioOwner==="parent"&&this._media.pauseAll(),this._paused=!0,this.controlsApi?.updatePlaying(!1),this.dispatchEvent(new Event("pause"))}stopMedia(){this._sendControl("stop-media"),this._stopIframeMedia(),this._media.stopAdoptedMedia()}seek(e){!this._trySyncSeek(e)&&!this._tryDirectTimelineSeek(e)&&this._sendControl("seek",{timeSeconds:e,frame:Math.round(e*this._runtimeFps)}),this._directTimelineClock.stop(),this._stopParentTickClock(),this._currentTime=e,this._media.audioOwner==="parent"&&(this._scrubbing?this._media.scrubAll(e):(this._media.pauseAll(),this._media.seekAll(e))),this._paused=!0,this.controlsApi?.updatePlaying(!1),this.controlsApi?.updateTime(this._currentTime,this._duration)}setColorGrading(e,t){this._sendControl("set-color-grading",{target:e,grading:t})}clearColorGrading(e){this._sendControl("set-color-grading",{target:e,grading:null})}setColorGradingCompare(e,t){this._sendControl("set-color-grading-compare",{target:e,compare:t})}clearColorGradingCompare(e){this._sendControl("set-color-grading-compare",{target:e,compare:{enabled:!1}})}setRuntimeData(e,t){if(!/^[a-z][a-z0-9-]{0,63}$/.test(e))throw new Error(`Invalid HyperFrames runtime-data channel: ${e}`);if(typeof structuredClone!="function")throw new Error("HyperFrames runtime data requires structuredClone support; refusing an unverified payload");let i=structuredClone(t);this._runtimeData.set(e,i),this._deliverRuntimeData(e,i)}clearRuntimeData(e){if(!/^[a-z][a-z0-9-]{0,63}$/.test(e))throw new Error(`Invalid HyperFrames runtime-data channel: ${e}`);this._runtimeData.delete(e),this._deliverRuntimeDataClear(e)}get currentTime(){return this._currentTime}set currentTime(e){this.seek(e)}get duration(){return this._duration}get paused(){return this._paused}get ready(){return this._ready}get playbackRate(){return le(parseFloat(this.getAttribute("playback-rate")||"1"))}set playbackRate(e){this.setAttribute("playback-rate",String(le(e)))}get shaderCaptureScale(){return Ze(this)}set shaderCaptureScale(e){this.setAttribute(A,String(e))}get shaderLoading(){return L(this)}set shaderLoading(e){e==="composition"?this.removeAttribute(M):this.setAttribute(M,e)}get muted(){return this.hasAttribute("muted")}set muted(e){e?this.setAttribute("muted",""):this.removeAttribute("muted")}get audioLocked(){return this.hasAttribute("audio-locked")}set audioLocked(e){e?this.setAttribute("audio-locked",""):this.removeAttribute("audio-locked")}_isLockedHostEnvironment(){if(typeof navigator>"u")return!1;let e=navigator.userAgent||"";return/\bClaude\/\d/.test(e)&&/\bElectron\b/.test(e)}_isAudioLocked(){return this.hasAttribute("audio-locked")||this._isLockedHostEnvironment()}_isSlideshowPlayer(){return this.closest("hyperframes-slideshow")!==null}_handleMutedChange(e){if(e===null&&this._isAudioLocked()){this.setAttribute("muted","");return}this._media.updateMuted(e!==null),this._setIframeMediaMuted(e!==null),this._sendControl("set-muted",{muted:e!==null}),this.controlsApi?.updateMuted(e!==null),this.dispatchEvent(new Event("volumechange"))}_applyAudioLock(e){e&&(this.muted=!0),this.controlsApi?.setVolumeControlsHidden(e)}get volume(){return this._volume}set volume(e){this.setAttribute("volume",String(Math.max(0,Math.min(1,e))))}get loop(){return this.hasAttribute("loop")}set loop(e){e?this.setAttribute("loop",""):this.removeAttribute("loop")}_sendControl(e,t={}){try{let i=this.iframe.contentWindow;return i?(i.postMessage({...t,source:"hf-parent",type:"control",action:e,...$e(this._runtimeFps)},"*"),!0):((e==="set-runtime-data"||e==="clear-runtime-data")&&this._rejectRuntimeDataDelivery(t.channel,t.requestId,"Composition iframe is unavailable"),!1)}catch(i){return(e==="set-runtime-data"||e==="clear-runtime-data")&&this._rejectRuntimeDataDelivery(t.channel,t.requestId,i instanceof Error?i.message:String(i)),!1}}_deliverRuntimeData(e,t){if(!this.isConnected||!this._runtimeBridgeReady)return;let i=this._beginRuntimeDataDelivery(e);this._trySetRuntimeDataDirect(e,t,i)||this._sendControl("set-runtime-data",{channel:e,payload:t,requestId:i})}_deliverRuntimeDataClear(e){if(!this.isConnected||!this._runtimeBridgeReady)return;let t=this._beginRuntimeDataDelivery(e);this._tryClearRuntimeDataDirect(e,t)||this._sendControl("clear-runtime-data",{channel:e,requestId:t})}_trySetRuntimeDataDirect(e,t,i){try{let n=this.iframe.contentWindow?.__hyperframes;return typeof n?.setRuntimeData!="function"?!1:(n.setRuntimeData(e,t,i),!0)}catch{return!1}}_tryClearRuntimeDataDirect(e,t){try{let i=this.iframe.contentWindow?.__hyperframes;return typeof i?.clearRuntimeData!="function"?!1:(i.clearRuntimeData(e,t),!0)}catch{return!1}}_replayRuntimeData(){for(let[e,t]of this._runtimeData)this._deliverRuntimeData(e,t)}_beginRuntimeDataDelivery(e){let t=this._pendingRuntimeData.get(e);t&&window.clearTimeout(t.timeoutId),this._runtimeDataRequestId+=1;let i=this._runtimeDataRequestId,n=window.setTimeout(()=>{this._rejectRuntimeDataDelivery(e,i,`Runtime data delivery timed out after ${Je}ms`)},Je);return this._pendingRuntimeData.set(e,{requestId:i,timeoutId:n}),i}_resolveRuntimeDataDelivery(e,t){let i=this._takeRuntimeDataDelivery(e,t);i&&this.dispatchEvent(new CustomEvent("runtimedataapplied",{detail:{channel:e,requestId:i.requestId}}))}_rejectRuntimeDataDelivery(e,t,i){let n=this._takeRuntimeDataDelivery(e,t);n&&this.dispatchEvent(new CustomEvent("runtimedataerror",{detail:{channel:e,requestId:n.requestId,message:typeof i=="string"?i:String(i)}}))}_takeRuntimeDataDelivery(e,t){if(typeof e!="string"||typeof t!="number"||!Number.isSafeInteger(t))return null;let i=this._pendingRuntimeData.get(e);return!i||i.requestId!==t?null:(window.clearTimeout(i.timeoutId),this._pendingRuntimeData.delete(e),i)}_rejectAllRuntimeDataDeliveries(e){for(let[t,i]of[...this._pendingRuntimeData])this._rejectRuntimeDataDelivery(t,i.requestId,e)}_getSameOriginIframeDocument(){try{return this.iframe.contentDocument}catch{return null}}_setIframeMediaMuted(e){let t=this._getSameOriginIframeDocument();if(t)for(let i of t.querySelectorAll("video, audio"))_(i)&&(i.muted=e||i.defaultMuted)}_stopIframeMedia(){let e=this._getSameOriginIframeDocument();if(e)for(let t of e.querySelectorAll("video, audio"))_(t)&&t.pause()}_replayBridgeState(){this._sendControl("set-muted",{muted:this.muted}),this._sendControl("set-volume",{volume:this._volume}),this._sendControl("set-playback-rate",{playbackRate:this.playbackRate}),this._sendControl("set-native-media-sync-disabled",{disabled:this._isSlideshowPlayer()}),this._sendControl("set-web-audio-media-disabled",{disabled:this._isSlideshowPlayer()})}_reloadShaderOptions(){if(this._ready=!1,this._runtimeBridgeReady=!1,this._rejectAllRuntimeDataDeliveries("Shader options changed before runtime data was applied"),L(this)!=="player"&&this.shaderLoader.reset(),this.hasAttribute("srcdoc")){this.iframe.srcdoc=H(this,this.getAttribute("srcdoc")||"");return}this.hasAttribute("src")&&(this.iframe.src=F(this,this.getAttribute("src")||""))}_trySyncSeek(e){try{let i=this.iframe.contentWindow?.__player;return typeof i?.seek!="function"?!1:(i.seek.call(i,e),!0)}catch{return!1}}_withDirectTimeline(e){let t=this.probe.resolveDirectTimelineAdapter(),i=t||this._directTimelineAdapter;if(!i)return!1;try{if(e(i),t&&t!==this._directTimelineAdapter){let n=t.duration();Number.isFinite(n)&&n>0&&(this._duration=n,this.controlsApi?.updateTime(this._currentTime,n))}return this._directTimelineAdapter=i,!0}catch{return!1}}_tryDirectTimelineSeek(e){return this._withDirectTimeline(t=>{t.seek(e,!1),t.pause()})}_tryDirectTimelinePlay(){return this._withDirectTimeline(e=>{e.play()})}_tryDirectTimelinePause(){return this._withDirectTimeline(e=>{e.pause()})}_startParentTickClock(){this._stopParentTickClock();let e=()=>{if(this._paused){this._parentTickRaf=null;return}this._sendControl("tick"),this._parentTickRaf=requestAnimationFrame(e)};this._parentTickRaf=requestAnimationFrame(e)}_stopParentTickClock(){this._parentTickRaf!==null&&(cancelAnimationFrame(this._parentTickRaf),this._parentTickRaf=null)}_onMessage(e){We(e,this.iframe.contentWindow,{getPlaybackState:()=>({currentTime:this._currentTime,duration:this._duration,paused:this._paused,lastUpdateMs:this._lastUpdateMs}),setPlaybackState:({currentTime:t,duration:i,paused:n,lastUpdateMs:o})=>{this._currentTime=t,this._duration=i,this._paused=n,this._lastUpdateMs=o},getShaderLoadingMode:()=>L(this),shaderLoader:this.shaderLoader,setCompositionSize:(t,i)=>{this._compositionWidth=t,this._compositionHeight=i,this._rescale()},sendControl:(t,i)=>this._sendControl(t,i),getIframeDoc:()=>this.iframe.contentDocument,onRuntimeReady:()=>{this._runtimeBridgeReady=!0,this._replayBridgeState(),this._replayRuntimeData()},onRuntimeDataApplied:(t,i)=>this._resolveRuntimeDataDelivery(t,i),onRuntimeDataError:(t,i,n)=>this._rejectRuntimeDataDelivery(t,i,n),onRuntimeTimelineReady:t=>this._onRuntimeTimelineReady(t),setRuntimeFps:t=>{this._runtimeFps=t},shouldPromoteMediaAutoplayFallback:()=>!this._isSlideshowPlayer(),setScenes:t=>{this._scenes=t,this.dispatchEvent(new CustomEvent("scenes",{detail:{scenes:t}}))},updateControlsTime:(t,i)=>this.controlsApi?.updateTime(t,i),updateControlsPlaying:t=>this.controlsApi?.updatePlaying(t),dispatchEvent:t=>this.dispatchEvent(t),seek:t=>this.seek(t),play:()=>this.play(),getLoop:()=>this.loop,media:this._media})}_onRuntimeTimelineReady(e){if(this._ready)return;this.probe.stop(),this._duration=e,this._directTimelineAdapter=null,this._ready=!0,this.controlsApi?.updateTime(this._currentTime,e),this.dispatchEvent(new CustomEvent("ready",{detail:{duration:e}})),this._rescale();let t=this._getSameOriginIframeDocument();t&&this._media.setupFromIframe(t),this._replayBridgeState(),this._setIframeMediaMuted(this.muted),this.hasAttribute("autoplay")&&this.play()}_onProbeReady({duration:e,adapter:t,compositionSize:i}){this._duration=e,this._directTimelineAdapter=t.kind==="direct-timeline"?t.timeline:null,this._ready=!0,this.controlsApi?.updateTime(0,e),this.dispatchEvent(new CustomEvent("ready",{detail:{duration:e}})),i&&(this._compositionWidth=i.width,this._compositionHeight=i.height,this._rescale());try{let n=this.iframe.contentDocument;n&&this._media.setupFromIframe(n)}catch{}this._setIframeMediaMuted(this.muted),this.hasAttribute("autoplay")&&this.play()}_rescale(){!Oe(this,this.iframe,this._compositionWidth,this._compositionHeight)&&this._ready&&!this._rescaleWarned&&(this._rescaleWarned=!0,console.warn("[hyperframes-player] rescale no-op after ready \u2014 zero-size player element",{src:this.getAttribute("src"),offsetWidth:this.offsetWidth,offsetHeight:this.offsetHeight,compositionWidth:this._compositionWidth,compositionHeight:this._compositionHeight}))}_onIframeLoad(){this._ready=!1,this._directTimelineAdapter=null,this._directTimelineClock.stop(),this._stopParentTickClock(),this.shaderLoader.reset(),this._media.resetForIframeLoad(),this.probe.start()}_setupControls(){this.controlsApi||(this.controlsApi=Le(this.shadow,this.muted,this._volume,this.getAttribute("speed-presets"),{onPlay:()=>this.play(),onPause:()=>this.pause(),onSeek:e=>this.seek(e*this._duration),onScrubStart:()=>{this._scrubbing=!0},onScrubEnd:()=>{this._scrubbing=!1,this.seek(this._currentTime)},onSpeedChange:e=>{this.playbackRate=e},onMuteToggle:()=>{this.muted=!this.muted},onVolumeChange:e=>{this.volume=e}},this._isAudioLocked()))}get _audioOwner(){return this._media.audioOwner}get _parentMedia(){return this._media.entries}_mirrorParentMediaTime(e,t){this._media.mirrorTime(e,t)}_promoteToParentProxy(){let e=null;try{e=this.iframe.contentDocument}catch{}this._media.promoteToParentProxy(e,(t,i)=>this._mirrorParentMediaTime(t,i)),this._sendControl("set-media-output-muted",{muted:!0})}_observeDynamicMedia(e){this._media.setupFromIframe(e)}};customElements.get("hyperframes-player")||customElements.define("hyperframes-player",K);return ot(Ht);})();
//# sourceMappingURL=hyperframes-player.global.js.map