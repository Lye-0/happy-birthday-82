/* Small column-major vector/matrix library. No external runtime dependencies. */
(function (W) {
  'use strict';
  const v3 = (x=0,y=0,z=0) => [x,y,z];
  const add = (a,b) => a.map((x,i)=>x+b[i]);
  const sub = (a,b) => a.map((x,i)=>x-b[i]);
  const mul = (a,k) => a.map(x=>x*k);
  const dot = (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const norm = a => mul(a,1/(Math.hypot(...a)||1));
  const identity = () => new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
  function multiply(a,b) { const m=new Float32Array(16); for(let j=0;j<4;j++) for(let i=0;i<4;i++) for(let k=0;k<4;k++) m[j*4+i]+=a[k*4+i]*b[j*4+k]; return m; }
  function compose(p=[0,0,0],s=[1,1,1],r=[0,0,0]) {
    const [a,b,c]=r,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b),cc=Math.cos(c),sc=Math.sin(c);
    const rx=new Float32Array([1,0,0,0,0,ca,sa,0,0,-sa,ca,0,0,0,0,1]);
    const ry=new Float32Array([cb,0,-sb,0,0,1,0,0,sb,0,cb,0,0,0,0,1]);
    const rz=new Float32Array([cc,sc,0,0,-sc,cc,0,0,0,0,1,0,0,0,0,1]);
    const m=multiply(ry,multiply(rx,rz));
    for(let i=0;i<3;i++) for(let j=0;j<3;j++) m[i*4+j]*=s[i];
    m[12]=p[0];m[13]=p[1];m[14]=p[2];return m;
  }
  function lookAt(eye,target,up=[0,1,0]) { const z=norm(sub(eye,target)),x=norm(cross(up,z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]); }
  function perspective(fov,aspect,near=.1,far=100,shift=0) {const f=1/Math.tan(fov/2),nf=1/(near-far);return new Float32Array([f/aspect,0,0,0,0,f,0,0,shift,0,(far+near)*nf,-1,0,0,2*far*near*nf,0]);}
  function ortho(l,r,b,t,n,f) {return new Float32Array([2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1]);}
  function transform(m,p) {return [m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];}
  const color = s => { s=s.replace('#',''); return [parseInt(s.slice(0,2),16)/255,parseInt(s.slice(2,4),16)/255,parseInt(s.slice(4,6),16)/255]; };
  W.M={v3,add,sub,mul,dot,cross,norm,identity,multiply,compose,lookAt,perspective,ortho,transform,color};
})(window.Wishes);
