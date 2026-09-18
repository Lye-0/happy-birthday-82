/* Hand-built pâtisserie: genoise, Chantilly, glazed fruit, 82 real wax candles. */
(function(W){
'use strict';
const {M,G,Batch,TAU,random}=W;
function canvas(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return c;}
function creamTexture(){return canvas(1536,512,(ctx,w,h)=>{const rng=random(214);ctx.fillStyle='#f9edd6';ctx.fillRect(0,0,w,h);
 const image=ctx.getImageData(0,0,w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=(y*w+x)*4;let grain=(rng()-.5)*7;let band=Math.sin(y*.71)*.7+Math.sin(y*.099)*1.4;image.data[k]+=grain+band;image.data[k+1]+=grain+band;image.data[k+2]+=grain+band;}ctx.putImageData(image,0,0);
 for(const y of [169,343]){ctx.fillStyle='rgba(183,137,83,.28)';ctx.beginPath();ctx.moveTo(0,y);for(let x=0;x<=w;x+=12)ctx.lineTo(x,y+Math.sin(x*.033)*2+rng()*4);for(let x=w;x>=0;x-=12)ctx.lineTo(x,y+14+Math.sin(x*.028)*3);ctx.fill();
  for(let i=0;i<1050;i++){const x=rng()*w,yy=y+rng()*19;ctx.fillStyle=`rgba(${135+Math.floor(rng()*45)},${83+Math.floor(rng()*58)},${37+Math.floor(rng()*42)},${rng()*.35})`;ctx.beginPath();ctx.ellipse(x,yy,.35+rng()*1.8,.4+rng()*1.5,0,0,TAU);ctx.fill();}
  for(let i=0;i<90;i++){const x=rng()*w;ctx.fillStyle=`rgba(169,47,58,${.13+rng()*.3})`;ctx.beginPath();ctx.ellipse(x,y-3+rng()*5,4+rng()*14,1+rng()*2,0,0,TAU);ctx.fill();}}
 for(let i=0;i<230;i++){const y=rng()*h;ctx.strokeStyle=`rgba(255,255,248,${rng()*.28})`;ctx.lineWidth=.5+rng()*1.5;ctx.beginPath();const x=rng()*w;ctx.moveTo(x,y);ctx.bezierCurveTo(x+60,y+2,x+160,y-2,x+40+rng()*350,y);ctx.stroke();}
 });}
function strawberryTexture(seed=98){const rng=random(seed),seeds=[];for(let row=0;row<12;row++){let v=.10+row*.066,n=Math.round(11+Math.sin(v*Math.PI)*9);for(let i=0;i<n;i++)seeds.push({u:(i+.45*(row%2)+rng()*.15)/n%1,v:v+(rng()-.5)*.018});}
 const tex=canvas(768,768,(ctx,w,h)=>{const im=ctx.createImageData(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=x/w,v=1-y/h,n=(rng()-.5)*15,s=Math.sin(u*31+v*18)*3;const j=(y*w+x)*4;im.data[j]=175+n+s+28*Math.sin(v*Math.PI);im.data[j+1]=20+n*.2+13*v;im.data[j+2]=25+n*.25+7*v;im.data[j+3]=255;}ctx.putImageData(im,0,0);
  seeds.forEach(({u,v})=>{const x=u*w,y=(1-v)*h;const grd=ctx.createRadialGradient(x,y,1,x,y,9);grd.addColorStop(0,'rgba(58,3,7,.7)');grd.addColorStop(.45,'rgba(92,6,12,.36)');grd.addColorStop(1,'rgba(107,13,16,0)');ctx.fillStyle=grd;ctx.fillRect(x-10,y-10,20,20);ctx.strokeStyle='rgba(251,133,83,.24)';ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(x,y+1,4,6,0,0,Math.PI);ctx.stroke();});});return{tex,seeds};}
function kiwiTexture(){return canvas(512,512,(ctx,w,h)=>{const rng=random(745),x=w/2,y=h/2;const grd=ctx.createRadialGradient(x,y,10,x,y,w/2);grd.addColorStop(0,'#e9edb1');grd.addColorStop(.16,'#e2e8a1');grd.addColorStop(.33,'#b7cc5c');grd.addColorStop(.69,'#8cac3c');grd.addColorStop(.92,'#779537');grd.addColorStop(.975,'#b3bf5d');grd.addColorStop(1,'#8b6c36');ctx.fillStyle=grd;ctx.fillRect(0,0,w,h);
 for(let i=0;i<500;i++){const a=rng()*TAU,r=38+rng()*32,R=155+rng()*97;ctx.strokeStyle=rng()>.5?'rgba(223,238,128,.26)':'rgba(64,114,26,.18)';ctx.lineWidth=.5+rng()*1.7;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);ctx.lineTo(x+Math.cos(a+.007)*R,y+Math.sin(a+.007)*R);ctx.stroke();}
 for(let i=0;i<62;i++){const a=i/62*TAU+rng()*.025,r=94+rng()*26;ctx.fillStyle='#25351b';ctx.beginPath();ctx.ellipse(x+Math.cos(a)*r,y+Math.sin(a)*r,2.5+rng()*1.4,6+rng()*3,-a+Math.PI/2,0,TAU);ctx.fill();}ctx.fillStyle='rgba(244,241,190,.55)';ctx.beginPath();ctx.ellipse(x,y,37,51,.13,0,TAU);ctx.fill();});}
function chocolateTexture(){return canvas(768,768,(ctx,w,h)=>{ctx.fillStyle='#3a2019';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#b79960';ctx.lineWidth=4;ctx.beginPath();ctx.arc(w/2,h/2,335,0,TAU);ctx.stroke();ctx.textAlign='center';ctx.fillStyle='#e9cf90';ctx.font='italic 280px Georgia, serif';ctx.fillText('82',w/2,h*.62);ctx.font='24px Georgia, serif';ctx.letterSpacing='8px';ctx.fillText('HAPPY BIRTHDAY',w/2,h*.77);});}
function floorTexture(){return canvas(512,512,(ctx,w,h)=>{const rng=random(340);const im=ctx.createImageData(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,g=128+(rng()-.5)*9+Math.sin(x*.15+Math.sin(y*.011)*3)*1.7;im.data[i]=g;im.data[i+1]=g-4;im.data[i+2]=g-7;im.data[i+3]=255;}ctx.putImageData(im,0,0);});}
function buildCake(candles){
 const batches=[],rng=random(82),sphere=G.sphere(24,16),tinySphere=G.sphere(8,6),cyl=G.cylinder(1,1,1,64),smallCyl=G.cylinder(1,1,1,20),disc=G.disc(64),leaf=G.leaf();
 const batch=(geo,mat,opt)=>{const b=new Batch(geo,mat,opt);batches.push(b);return b;};
 const cream={base:M.color('#fff6e4'),rough:.59,kind:1};
 const gold={base:M.color('#c8a56b'),rough:.24,metal:.77};
 const porcelain={base:M.color('#f1e9db'),rough:.23,metal:.08};
 const table=batch(G.plane(),{base:M.color('#55403a'),rough:.57,kind:7,texture:floorTexture()},{castShadow:false,name:'table'});table.add([0,-.39,0],[75,1,75]);
 // Low porcelain cake stand, with a fine brushed-gold rim.
 const foot=batch(G.lathe(t=>{const points=[[0,-.35],[1.45,-.35],[1.59,-.30],[1.54,-.21],[.81,-.12],[.67,.10],[.8,.16],[0,.17]];const k=Math.min(points.length-2,Math.floor(t*(points.length-1))),f=t*(points.length-1)-k;return[W.lerp(points[k][0],points[k+1][0],f),W.lerp(points[k][1],points[k+1][1],f)];},112,42),porcelain,{name:'porcelain foot'});foot.add();
 const plate=batch(G.lathe(t=>{const pts=[[0,.15],[3.35,.15],[3.62,.19],[3.75,.27],[3.70,.32],[3.5,.32],[3.25,.275],[0,.275]],k=Math.min(pts.length-2,Math.floor(t*(pts.length-1))),f=t*(pts.length-1)-k;return[W.lerp(pts[k][0],pts[k+1][0],f),W.lerp(pts[k][1],pts[k+1][1],f)];},144,56),porcelain,{name:'porcelain plate'});plate.add();
 batch(G.torus(3.72,.016,144,8),gold).add([0,.292,0]);batch(G.torus(3.35,.008,128,6),gold).add([0,.29,0]);batch(G.torus(1.55,.012,96,6),gold).add([0,-.275,0]);
 // Vanilla genoise under delicate, imperfect hand-spread cream.
 batch(G.lathe(t=>[2.994+.0016*Math.sin(t*72)+.0025*Math.sin(t*39),.37+t*1.52],144,70),{base:M.color('#ffffff'),rough:.66,kind:1,texture:creamTexture()},{name:'cake sponge and cream'}).add();
 batch(sphere,cream,{name:'smooth cream top'}).add([0,1.884,0],[3.015,.058,3.015]);
 batch(G.torus(2.998,.044,144,12),cream).add([0,1.876,0]);
 const frosting=batch(G.surface((u,v)=>{const a=u*TAU;const drips=.03+.055*(.5+.5*Math.sin(a*17+.7))**5+.045*(.5+.5*Math.sin(a*11))**7;return[(3.012+.012*Math.sin(v*Math.PI))*Math.cos(a),1.88-v*(.082+drips),(3.012+.012*Math.sin(v*Math.PI))*Math.sin(a)];},180,8),cream);frosting.add();
 const pearls=batch(sphere,cream,{name:'piped lower border'});for(let i=0;i<104;i++){const a=i/104*TAU;pearls.add([3.005*Math.cos(a),.412,3.005*Math.sin(a)],[.065,.084,.078],[0,-a,0]);}
 const rosettes=batch(G.rosette(),cream,{name:'Chantilly rosettes'});
 for(let i=0;i<22;i++){const a=i/22*TAU+.095;const nearKiwi=[.40,1.43,2.54,3.63,4.66,5.70].some(k=>Math.abs(Math.atan2(Math.sin(a-k),Math.cos(a-k)))<.18);rosettes.add([2.77*Math.cos(a),1.916,2.77*Math.sin(a)],[.89,nearKiwi?.30:.89,.89],[0,-a+.3,0]);}
 const {tex:strawberryMap,seeds}=strawberryTexture();
 const strawberries=batch(G.strawberry(),{base:M.color('#ffffff'),rough:.30,kind:2,texture:strawberryMap},{name:'glazed strawberries'});
 const seedBatch=batch(tinySphere,{base:M.color('#b89b61'),rough:.40,kind:0},{name:'strawberry achenes'});
 const leafBatch=batch(leaf,{base:M.color('#3d6829'),rough:.58,kind:4},{name:'strawberry calyx'});
 const berryShadow=batch(G.disc(36),{base:M.color('#b7a58b'),rough:1},{castShadow:false,name:'fruit contact shadows'});
 const strawberryAngles=[.12,.65,1.17,1.68,2.24,2.79,3.33,3.84,4.37,4.94,5.49,5.95];
 for(let index=0;index<strawberryAngles.length;index++){
  const a=strawberryAngles[index],r=2.79,s=.62+rng()*.12;
  const parent=M.compose([r*Math.cos(a),1.925,r*Math.sin(a)],[s,s,s],[.11+ rng()*.20,-a+Math.PI/2,.12*(rng()-.5)]);
  strawberries.add([0,0,0],[1,1,1],[0,0,0],[.97+rng()*.055,1,1,0],parent);
  seeds.forEach(({u,v})=>{const th=u*TAU,t=.005+v*.99,rr=.40*Math.sin(Math.PI*t)**.66*(1.27-.60*t);const eps=.001,rad=q=>.40*Math.sin(Math.PI*q)**.66*(1.27-.60*q);const slope=(rad(t+eps)-rad(t-eps))/(2*eps*.94);const pos=[(rr+.001)*Math.cos(th),t*.94,(rr+.001)*Math.sin(th)];seedBatch.add(pos,[.008,.014,.005],[Math.atan(slope),-th+Math.PI/2,0],[.85+rng()*.20,.86+rng()*.12,.7+rng()*.18,0],parent);});
  // Fine five-point calyx, not a bulky plastic stem.
  for(let i=0;i<3;i++)leafBatch.add([0,.055,0],[.34,.35,.30],[.08,i/3*TAU+.1,0],[1,1,1,0],parent);
 }
 const blueberry=batch(sphere,{base:M.color('#303d66'),rough:.47,kind:5},{name:'blueberries with natural bloom'});
 const blueberryEye=batch(G.torus(.041,.012,20,6),{base:M.color('#202a44'),rough:.70},{name:'blueberry calyx rings'});
 const blueberryCrown=batch(leaf,{base:M.color('#273047'),rough:.67},{name:'blueberry calyx petals'});
 const berryPositions=[];
 const kiwiAngles=[.40,1.43,2.54,3.63,4.66,5.70];
 for(let attempt=0;attempt<4500&&berryPositions.length<36;attempt++){
  const a=rng()*TAU,r=2.48+rng()*.46,s=.105+rng()*.036,x=Math.cos(a)*r,z=Math.sin(a)*r;
  if(kiwiAngles.some(k=>Math.hypot(x-2.82*Math.cos(k),z-2.82*Math.sin(k))<.45+s*.25))continue;
  if(strawberryAngles.some(k=>Math.hypot(x-2.79*Math.cos(k),z-2.79*Math.sin(k))<.30+s*.65))continue;
  if(berryPositions.some(k=>Math.hypot(x-k.x,z-k.z)<(s+k.s)*.94))continue;
  berryPositions.push({x,z,s});const parent=M.compose([x,1.948+s*.72,z],[s,s*.91,s],[rng()*.5,a,rng()*.5]);
  blueberry.add([0,0,0],[1,1,1],[0,0,0],[.91+rng()*.16,.94+rng()*.1,1,0],parent);blueberryEye.add([0,1,0],[4.4,2,4.4],[0,0,0],[1,1,1,0],parent);
  for(let k=0;k<5;k++)blueberryCrown.add([0,.99,0],[.27,.35,.29],[.20,k/5*TAU,0],[1,1,1,0],parent);
 }
 // Fresh kiwi slices: visible radial fibres, irregular dark seeds, thin skin.
 const kiwiSide=batch(cyl,{base:M.color('#7d843e'),rough:.55},{name:'kiwi skin'});
 const kiwiFace=batch(disc,{base:M.color('#ffffff'),rough:.29,kind:2,texture:kiwiTexture()},{name:'kiwi cut faces'});
 for(const a of [.40,1.43,2.54,3.63,4.66,5.70]){const parent=M.compose([2.82*Math.cos(a),2.12,2.82*Math.sin(a)],[.42,.42,.42],[.43,-a,.2]);kiwiSide.add([0,0,0],[1,.19,1],[0,0,0],[1,1,1,0],parent);kiwiFace.add([0,.10,0],[1,1,1],[0,0,0],[1,1,1,0],parent);kiwiFace.add([0,-.10,0],[1,1,1],[Math.PI,0,0],[1,1,1,0],parent);}
 const raspberry=batch(tinySphere,{base:M.color('#b91f39'),rough:.46,kind:2},{name:'raspberry drupelets'});
 for(const a of [.91,2.0,3.04,4.13,5.2]){const p=[2.67*Math.cos(a),1.94,2.67*Math.sin(a)];for(let row=0;row<6;row++){const t=row/5,r=.17*Math.sin(Math.PI*(.21+t*.72));const n=Math.max(4,Math.round(15*Math.sin(Math.PI*(.21+t*.72))));for(let j=0;j<n;j++){const ang=j/n*TAU+.26*(row%2);raspberry.add([p[0]+r*Math.cos(ang),p[1]+.035+row*.046,p[2]+r*Math.sin(ang)],[.039,.041,.037],[0,0,0],[.90+rng()*.17,.95,1,0]);}}}
 const mint=batch(leaf,{base:M.color('#537636'),rough:.56,kind:4},{name:'fresh mint leaves'});
 for(const a of [.36,1.73,3.42,4.80]){for(let j=0;j<3;j++){mint.add([2.90*Math.cos(a),2.07,2.90*Math.sin(a)],[.53,.8,.51],[.12,-a+j*1.9,.07],[1,1,1,0]);}}
 // One small chocolate plaque: decorative, never counted as a candle.
 batch(cyl,{base:M.color('#42271e'),rough:.31},{name:'chocolate birthday plaque'}).add([0,1.986,0],[.465,.064,.465]);
 batch(disc,{base:M.color('#ffffff'),rough:.36,texture:chocolateTexture()},{name:'82 chocolate lettering'}).add([0,2.020,0],[.455,1,.455],[0,0,0]);
 // Exactly 82 independent candles, 82 black wicks, 82 flame origins.
 const wax=batch(G.cylinder(.94,1,1,20),{base:M.color('#fff5de'),rough:.34,kind:3},{name:'82 wax candles'});
 const waxTops=batch(G.torus(.025,.007,16,6),{base:M.color('#ebd8b7'),rough:.27},{name:'82 wax rims'});
 const wicks=batch(smallCyl,{base:M.color('#261c15'),rough:.87,kind:9},{name:'82 cotton wicks',dynamic:true});
 const palette=['#fff5df','#ecd4b5','#f1d2c5','#d9d9bb'].map(M.color);
 candles.forEach((c,i)=>{const col=palette[(i+c.ring)%palette.length];wax.add([c.x,c.base+c.height*.5,c.z],[.034,c.height,.034],[0,c.phase,0],[...col,0]);waxTops.add([c.x,c.base+c.height,c.z]);wicks.add([c.x,c.y-.025,c.z],[.006,.067,.006],[.06*Math.sin(c.phase),0,.04],[1,1,1,0]);});
 // Tiny crumbs on the plate create a grounded, edible finish.
 const crumbs=batch(tinySphere,{base:M.color('#cda876'),rough:.85},{name:'cake crumbs'});for(let i=0;i<25;i++){const a=rng()*TAU,r=3.08+rng()*.25,s=.005+rng()*.012;crumbs.add([r*Math.cos(a),.293,r*Math.sin(a)],[s,s*.65,s*1.4],[rng(),rng(),rng()]);}
 if(wax.matrices.length!==82||wicks.matrices.length!==82)throw new Error('ろうそくは必ず82本でなければなりません。');
 return{batches,wicks,wax,counts:{candles:wax.matrices.length,wicks:wicks.matrices.length,flames:candles.length,rings:W.RINGS.map(x=>x.count),strawberries:strawberries.matrices.length,blueberries:blueberry.matrices.length}};
}
W.buildCake=buildCake;
})(window.Wishes);
