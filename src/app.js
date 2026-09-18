/* Interaction, camera, accessible UI and deterministic capture hooks. */
(function(W){
'use strict';
const $=id=>document.getElementById(id),{M,G,Batch}=W;
const params=new URLSearchParams(location.search),capture=params.get('capture')==='1';
let renderer,model,celebration,candles,audio,time=0,lastTime=performance.now(),quality=params.get('quality')||'standard',paused=false,autoRotate=false,topView=false,announced=false,lastCount=-1,lastState='',ready=false;
let raf=0,visible=!document.hidden,dragging=false;const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let width=innerWidth,height=innerHeight;
const camera={theta:.27,elevation:.54,radius:13.0,targetTheta:.27,targetElevation:.54,targetRadius:13.0,position:[0,0,13],right:[1,0,0],vp:M.identity()};
const pointerMap=new Map();let pinchDistance=0;
let confetti=null,confettiSeeds=[],activeConfettiCount=0;
function isNarrow(){return width<=800&&height>500;}
function defaultRadius(){const aspect=width/height;return isNarrow()?Math.max(14.5,7.65/(2*Math.tan(39*Math.PI/360)*aspect)):14.5;}
function updateCamera(dt){
 const damping=1-Math.exp(-Math.max(dt,.001)*9);
 camera.theta=W.lerp(camera.theta,camera.targetTheta,damping);camera.elevation=W.lerp(camera.elevation,camera.targetElevation,damping);camera.radius=W.lerp(camera.radius,camera.targetRadius,damping);
 const e=camera.elevation,r=camera.radius,th=camera.theta;
 const target=[0,isNarrow()?1.12:.84,0];
 camera.position=[Math.sin(th)*Math.cos(e)*r,target[1]+Math.sin(e)*r,Math.cos(th)*Math.cos(e)*r];
 const view=M.lookAt(camera.position,target);camera.right=[view[0],view[4],view[8]];
 const shift=isNarrow()?0:-.34;
 const proj=M.perspective(39*Math.PI/180,width/height,.15,180,shift);
 // A little more breathing room above the controls on tall screens.
 proj[9]=isNarrow()?.055:.015;
 camera.vp=M.multiply(proj,view);
}
function resize(){width=innerWidth;height=innerHeight;const old=camera.targetRadius;const base=defaultRadius();if(!dragging){camera.targetRadius=base;camera.radius=base;}if(renderer)renderer.resize(width,height,quality);updateCamera(.2);if(ready)render();}
function setView(overhead){topView=overhead;camera.targetElevation=overhead?1.49:.54;camera.targetTheta=.27;camera.targetRadius=defaultRadius()*(overhead?(isNarrow()?1.04:1.23):1);$('view-top').setAttribute('aria-pressed',String(overhead));}
function resetCamera(){setView(false);autoRotate=false;$('auto-rotate').checked=false;}
function syncUI(){
 if(lastCount!==celebration.litCount){lastCount=celebration.litCount;$('lit-count').textContent=String(lastCount);}
 if(lastState===celebration.state)return;lastState=celebration.state;document.body.dataset.state=lastState;
 if(lastState==='lit'){
  $('status-text').textContent='CANDLES ALIGHT';$('eyebrow-text').textContent='MAKE A LITTLE WISH';$('greeting').innerHTML='<h2>82年分の、<br>ありがとう。</h2><p>ひとつの願いを、82の灯りに。</p>';$('story-note').innerHTML='目を閉じて、願いごとを。<br>準備ができたら、ふうっとひと息。';$('ritual-hint').innerHTML='<span class="tiny-star" aria-hidden="true">✧</span> ONE BREATH. EIGHTY-TWO LIGHTS.';$('blow-label').textContent='願いを込めて、吹き消す';$('ritual-note').textContent=isNarrow()?'ボタンをタップして、ふうっとひと息。':'クリック、またはスペースキーでひと息。';$('blow').disabled=!ready;$('button-arrow').textContent='↗';
 }else if(lastState==='blowing'){
  $('status-text').textContent='MAKE YOUR WISH';$('blow').disabled=true;$('blow-label').textContent='ふうっ…';$('button-arrow').textContent='';$('ritual-note').textContent='82の灯りに、願いをのせて。';$('announcement').textContent='息を吹きかけています。82本のろうそくの炎が、手前から消えていきます。';
 }else{
  $('status-text').textContent='A WISH TAKES FLIGHT';$('eyebrow-text').textContent='HERE’S TO YOUR BEAUTIFUL LIFE';$('greeting').innerHTML='<h2>お誕生日、<br>おめでとう。</h2><p>これからの日々も、<br>あたたかな光で満ちますように。</p>';$('story-note').innerHTML='82歳のお誕生日、おめでとうございます。<br>何度でも、心を込めて。';$('ritual-hint').innerHTML='<span class="tiny-star" aria-hidden="true">✧</span> HAPPY 82ND BIRTHDAY.';$('blow-label').textContent='もう一度、灯す';$('button-arrow').textContent='↻';$('ritual-note').textContent='またひとつ、願いごとを。';$('blow').disabled=false;$('announcement').textContent='82本すべての炎が消えました。82歳のお誕生日、おめでとうございます。';if(!announced){announced=true;audio.celebrate();}
 }
}
function makeConfetti(){
 const colors=['#e6c78b','#ecded0','#ac705e','#d3b981','#a9a287'].map(M.color);
 confetti=new Batch(G.plane(),{base:[1,1,1],rough:.37,metal:.28},{castShadow:false,dynamic:true,name:'celebration confetti'});
 confettiSeeds=W.makeConfettiParticles();
 for(let i=0;i<confettiSeeds.length;i++){
  // Reserve the whole pool once; replay never allocates more paper instances.
  confetti.add([0,-5,0],[.00001,.00001,.00001],[0,0,0],[...colors[i%colors.length],0]);
 }
 confetti.visible=false;model.batches.push(confetti);
}
function updateModel(){
 for(let i=0;i<candles.length;i++){const s=celebration.candle(i);model.wicks.setColor(i,[1,1,1,s.ember*.72]);}
 const age=celebration.elapsed-celebration.finishedAt-W.CONFETTI.startDelay;
 activeConfettiCount=0;
 confetti.visible=!reduceMotion&&celebration.state==='celebrating'&&age>=0&&age<W.CONFETTI.duration;
 if(confetti.visible){
  confettiSeeds.forEach((p,i)=>{
   const sample=W.sampleConfetti(p,age);
   if(sample.visible)activeConfettiCount++;
   confetti.setMatrix(i,M.compose(sample.position,sample.scale,sample.rotation));
  });
  confetti.visible=activeConfettiCount>0;
 }
}
function advance(dt){
 if(!paused){time+=dt;celebration.update(dt);if(autoRotate&&!dragging)camera.targetTheta-=dt*.065;}
 updateCamera(dt);updateModel();syncUI();
}
function render(){if(renderer&&ready)renderer.render(model.batches,camera,celebration,time);}
function frame(now){raf=0;if(!ready||capture||!visible)return;const dt=Math.max(0,(now-lastTime)/1000);lastTime=now;advance(dt);render();raf=requestAnimationFrame(frame);}
function startFrames(){lastTime=performance.now();if(!raf&&!capture&&visible&&ready)raf=requestAnimationFrame(frame);}
function setPaused(value){paused=value;$('pause').checked=value;document.body.dataset.paused=String(value);}
function blow(){if(!ready)return false;if(celebration.state==='celebrating'){reset();return true;}if(celebration.state!=='lit')return false;setPaused(false);if(celebration.blow(camera.position)){lastTime=performance.now();audio.breath();syncUI();render();return true;}return false;}
function reset(){if(!ready)return;audio.stop();celebration.reset();announced=false;lastState='';lastCount=-1;setPaused(false);updateModel();syncUI();render();$('announcement').textContent='82本すべてに、もう一度灯りをともしました。';}
function onPointerDown(e){if(!ready)return;e.preventDefault();$('scene').setPointerCapture(e.pointerId);pointerMap.set(e.pointerId,{x:e.clientX,y:e.clientY});dragging=true;pinchDistance=0;}
function onPointerMove(e){const previous=pointerMap.get(e.pointerId);if(!previous)return;e.preventDefault();pointerMap.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointerMap.size===1){const dx=e.clientX-previous.x,dy=e.clientY-previous.y;camera.targetTheta-=dx*.0055;camera.targetElevation=W.clamp(camera.targetElevation+dy*.0045,.14,1.50);topView=false;$('view-top').setAttribute('aria-pressed','false');}
 else if(pointerMap.size===2){const [a,b]=[...pointerMap.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinchDistance>0)camera.targetRadius=W.clamp(camera.targetRadius*pinchDistance/Math.max(d,1),6.8,defaultRadius()*1.5);pinchDistance=d;}if(capture){updateCamera(1);render();}}
function onPointerEnd(e){pointerMap.delete(e.pointerId);dragging=pointerMap.size>0;pinchDistance=0;}
function showError(error){console.error(error);$('loading').classList.add('ready');$('error').hidden=false;$('error-message').textContent=error instanceof Error?error.message:String(error);$('blow').disabled=true;}
function bindEvents(){
 const scene=$('scene');scene.addEventListener('pointerdown',onPointerDown);scene.addEventListener('pointermove',onPointerMove);scene.addEventListener('pointerup',onPointerEnd);scene.addEventListener('pointercancel',onPointerEnd);scene.addEventListener('lostpointercapture',onPointerEnd);scene.addEventListener('contextmenu',e=>e.preventDefault());scene.addEventListener('wheel',e=>{e.preventDefault();camera.targetRadius=W.clamp(camera.targetRadius*Math.exp(e.deltaY*.001),6.8,defaultRadius()*1.5);if(capture){updateCamera(1);render();}},{passive:false});
 $('blow').addEventListener('click',blow);$('view-top').addEventListener('click',()=>setView(!topView));$('view-reset').addEventListener('click',resetCamera);
 $('sound').addEventListener('click',async()=>{const on=await audio.enable(!audio.enabled);$('sound').setAttribute('aria-pressed',String(on));$('sound').setAttribute('aria-label',on?'音をオフにする':'音をオンにする');$('sound').title=on?'音をオフにする':'音をオンにする';if(!on&&!(window.AudioContext||window.webkitAudioContext))$('announcement').textContent='このブラウザでは音声機能を利用できません。';});
 $('settings-button').addEventListener('click',()=>{$('settings').showModal();});$('settings-close').addEventListener('click',()=>$('settings').close());$('settings').addEventListener('click',e=>{if(e.target===$('settings')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
 $('quality').value=quality;$('quality').addEventListener('change',e=>{quality=e.target.value;renderer.shadowSize=quality==='high'?2048:quality==='low'?1024:1536;renderer.setupShadow();resize();});$('auto-rotate').addEventListener('change',e=>{autoRotate=e.target.checked;});$('pause').addEventListener('change',e=>setPaused(e.target.checked));$('volume').addEventListener('input',e=>{audio.volume=Number(e.target.value)/100;});
 document.addEventListener('keydown',e=>{if($('settings').open||['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;if(e.code==='Space'&&e.target.tagName!=='BUTTON'){e.preventDefault();blow();}else if(e.code==='KeyR'){e.preventDefault();reset();}else if(e.code==='KeyV'){e.preventDefault();setView(!topView);}else if(e.code==='Escape'){resetCamera();}});
 addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{visible=!document.hidden;if(!visible){if(raf)cancelAnimationFrame(raf);raf=0;}else startFrames();});
 scene.addEventListener('webglcontextlost',e=>{e.preventDefault();ready=false;if(raf)cancelAnimationFrame(raf);showError(new Error('3D描画が一時的に停止しました。「もう一度」で開き直してください。'));});

}
function init(){try{
 if(!['low','standard','high'].includes(quality))quality='standard';
 candles=W.makeCandles();celebration=new W.Celebration(candles);audio=new W.Audio();
 renderer=new W.Renderer($('scene'));model=W.buildCake(candles);makeConfetti();renderer.setupEffects(candles);bindEvents();resize();camera.radius=camera.targetRadius=defaultRadius();updateCamera(1);ready=true;document.body.dataset.ready='true';syncUI();render();$('loading').classList.add('ready');startFrames();
 // Explicit inspection interface: used by the included browser checks and preview capture.
 window.__WISHES__={
  get ready(){return ready;},get state(){return celebration.state;},get litCount(){return celebration.litCount;},get elapsed(){return celebration.elapsed;},get camera(){return{theta:camera.theta,elevation:camera.elevation,radius:camera.radius,position:[...camera.position]};},
  inspect(){return{...model.counts,renderedCandleInstances:model.wax.matrices.length,renderedWickInstances:model.wicks.matrices.length,flameOrigins:renderer.effectCandles.length,uniqueCandleIds:new Set(candles.map(c=>c.id)).size,litCount:celebration.litCount,state:celebration.state,quality,paused,sound:audio.enabled,confettiInstances:confettiSeeds.length,activeConfetti:activeConfettiCount,confettiVisible:confetti.visible,confettiDuration:W.CONFETTI.duration,reducedMotion:reduceMotion,hdr:renderer.hdr,triangles:renderer.triangleCount,drawCalls:renderer.batchCount,webgl:renderer.gl.getParameter(renderer.gl.VERSION)};},
  blow,reset,setView,advance(seconds){let remaining=Math.max(0,Math.min(60,seconds));while(remaining>.00001){const dt=Math.min(remaining,1/60);advance(dt);remaining-=dt;}render();return this.inspect();},render,
  candlePositions(){return candles.map(c=>({...c}));}
 };
}catch(e){showError(e);}}
$('retry').addEventListener('click',()=>{const url=new URL(location.href);url.searchParams.set('quality','low');location.href=url.href;});
requestAnimationFrame(init);
})(window.Wishes);
