/* Parametric geometry, shared between physical objects and instances. */
(function(W){
  'use strict';
  const {TAU,M}=W;
  function surface(fn,nu=48,nv=24,flip=false) {
    const pos=[],normal=[],uv=[],indices=[];const e=.0001;
    for(let v=0;v<=nv;v++) for(let u=0;u<=nu;u++) {
      const x=u/nu,y=v/nv,p=fn(x,y);
      const yy=Math.max(e,Math.min(1-e,y));
      const du=M.sub(fn(x+e,yy),fn(x-e,yy)),dv=M.sub(fn(x,Math.min(1,yy+e)),fn(x,Math.max(0,yy-e)));
      let n=M.norm(M.cross(dv,du));if(flip)n=M.mul(n,-1);
      pos.push(...p);normal.push(...n);uv.push(x,y);
    }
    for(let j=0;j<nv;j++) for(let i=0;i<nu;i++) {const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1; indices.push(...(flip?[a,b,c,b,d,c]:[a,c,b,b,c,d]));}
    return {pos:new Float32Array(pos),normal:new Float32Array(normal),uv:new Float32Array(uv),indices:new Uint32Array(indices)};
  }
  function lathe(profile,segments=80,levels=40) {return surface((u,v)=>{const [r,y]=profile(v);return [r*Math.cos(u*TAU),y,r*Math.sin(u*TAU)];},segments,levels);}
  function sphere(n=24,m=16) {return surface((u,v)=>{const a=u*TAU,b=(.00001+v*.99998)*Math.PI;return [Math.cos(a)*Math.sin(b),-Math.cos(b),Math.sin(a)*Math.sin(b)];},n,m);}
  function cylinder(rt=1,rb=1,height=1,n=48) {
    const p=[],nm=[],uv=[],ix=[],slope=(rb-rt)/height;
    for(let j=0;j<2;j++)for(let i=0;i<=n;i++){const a=i/n*TAU,r=j?rt:rb;const normal=M.norm([Math.cos(a),slope,Math.sin(a)]);p.push(r*Math.cos(a),(j-.5)*height,r*Math.sin(a));nm.push(...normal);uv.push(i/n,j);}
    for(let i=0;i<n;i++){const a=i,b=i+1,c=i+n+1,d=c+1;ix.push(a,c,b,b,c,d);}
    for(let j=0;j<2;j++){const base=p.length/3,r=j?rt:rb;p.push(0,(j-.5)*height,0);nm.push(0,j?1:-1,0);uv.push(.5,.5);for(let i=0;i<=n;i++){const a=i/n*TAU;p.push(r*Math.cos(a),(j-.5)*height,r*Math.sin(a));nm.push(0,j?1:-1,0);uv.push(.5+.5*Math.cos(a),.5+.5*Math.sin(a));}for(let i=0;i<n;i++)ix.push(...(j?[base,base+i+2,base+i+1]:[base,base+i+1,base+i+2]));}
    return{pos:new Float32Array(p),normal:new Float32Array(nm),uv:new Float32Array(uv),indices:new Uint32Array(ix)};
  }
  function disc(n=64) {const g=surface((u,v)=>[v*Math.cos(u*TAU),0,v*Math.sin(u*TAU)],n,1);for(let i=0;i<g.pos.length/3;i++){g.normal[i*3]=0;g.normal[i*3+1]=-1;g.normal[i*3+2]=0;g.uv[i*2]=.5+g.pos[i*3]*.5;g.uv[i*2+1]=.5-g.pos[i*3+2]*.5;}return g;}
  function torus(R=1,r=.05,n=96,m=12) {return surface((u,v)=>{const a=u*TAU,b=v*TAU;return [(R+r*Math.cos(b))*Math.cos(a),r*Math.sin(b),(R+r*Math.cos(b))*Math.sin(a)];},n,m);}
  function plane(){return {pos:new Float32Array([-1,0,-1,-1,0,1,1,0,-1,1,0,1]),normal:new Float32Array([0,1,0,0,1,0,0,1,0,0,1,0]),uv:new Float32Array([0,0,0,1,1,0,1,1]),indices:new Uint32Array([0,1,2,2,1,3])};}
  function rosette() {
    return surface((u,v)=>{const a=u*TAU+v*2.3;const radius=(.24*(1-v)**.67+.004)*(1+.2*Math.cos(u*TAU*8));return [radius*Math.cos(a)+.09*v**4,.36*v,radius*Math.sin(a)];},48,22);
  }
  function leaf(){return surface((u,v)=>{const t=u*2-1;const w=Math.sin(Math.PI*v)**.8*.28*(1+.035*Math.sin(v*85));return [t*w,.08*Math.sin(v*Math.PI)+.07*t*t*Math.sin(v*Math.PI),v*.78];},16,24,true);}
  function strawberry() {return lathe(v=>{const t=.005+v*.99;const r=.40*Math.sin(Math.PI*t)**.66*(1.27-.60*t);return [r,t*.94];},48,40);}
  function ribbon(rows=22){const p=[],n=[],uv=[],ix=[];for(let j=0;j<=rows;j++){for(let i=0;i<2;i++){p.push(i*2-1,j/rows,0);n.push(0,0,1);uv.push(i,j/rows);}if(j<rows){const a=j*2;ix.push(a,a+1,a+2,a+1,a+3,a+2);}}return{pos:new Float32Array(p),normal:new Float32Array(n),uv:new Float32Array(uv),indices:new Uint32Array(ix)};}
  W.G={surface,lathe,sphere,cylinder,disc,torus,plane,rosette,leaf,strawberry,ribbon};
})(window.Wishes);
