/* Original WebGL 2 renderer: instancing, microfacet lighting, soft shadows, HDR glow.
   All shaders and rendering code are included locally; no CDN or network requests. */
(function(W){
'use strict';
const {M,G}=W;
const MESH_VERTEX=`#version 300 es
precision highp float; precision highp int;
layout(location=0) in vec3 a_position;
layout(location=1) in vec3 a_normal;
layout(location=2) in vec2 a_uv;
layout(location=3) in mat4 a_model;
layout(location=7) in vec4 a_tint;
uniform mat4 u_vp; uniform mat4 u_lightVP;
out vec3 v_world; out vec3 v_normal; out vec2 v_uv; out vec4 v_shadow; out vec4 v_tint;
void main(){
 vec4 p=a_model*vec4(a_position,1.);v_world=p.xyz;
 mat3 m=mat3(a_model);vec3 scale2=vec3(dot(m[0],m[0]),dot(m[1],m[1]),dot(m[2],m[2]));
 v_normal=normalize(m*(a_normal/max(scale2,vec3(.000001))));
 v_uv=a_uv;v_tint=a_tint;v_shadow=u_lightVP*p;gl_Position=u_vp*p;
}`;
const MESH_FRAGMENT=`#version 300 es
precision highp float; precision highp int;
in vec3 v_world;in vec3 v_normal;in vec2 v_uv;in vec4 v_shadow;in vec4 v_tint;
uniform vec3 u_camera;uniform vec3 u_base;uniform float u_rough;uniform float u_metal;
uniform int u_kind;uniform sampler2D u_map;uniform sampler2D u_shadowMap;uniform float u_hasMap;
uniform float u_candlePower;uniform float u_exposureLight;uniform float u_shadowTexel;
out vec4 fragColor;
const float PI=3.14159265;
float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float shadow(vec3 N){vec3 q=v_shadow.xyz/v_shadow.w*.5+.5;if(q.x<0.||q.x>1.||q.y<0.||q.y>1.||q.z>1.)return 1.;float s=0.;float bias=max(.00024*(1.-dot(N,normalize(vec3(-5,9,6)))),.00009);for(int x=-2;x<=2;x++)for(int y=-2;y<=2;y++){float d=texture(u_shadowMap,q.xy+vec2(float(x),float(y))*u_shadowTexel*2.4).r;s+=q.z-bias>d?.13:1.;}return s/25.;}
vec3 fresnel(float cosTheta,vec3 F0){return F0+(1.-F0)*pow(clamp(1.-cosTheta,0.,1.),5.);}
vec3 brdf(vec3 N,vec3 V,vec3 L,vec3 albedo,float rough,float metal,vec3 radiance){
 vec3 H=normalize(V+L);float nl=max(dot(N,L),0.),nv=max(dot(N,V),.001),nh=max(dot(N,H),0.),vh=max(dot(V,H),0.);
 float a=rough*rough,a2=a*a,d=nh*nh*(a2-1.)+1.;float D=a2/max(PI*d*d,.00001);
 float k=(rough+1.)*(rough+1.)/8.;float geom=nv/(nv*(1.-k)+k)*nl/(nl*(1.-k)+k);
 vec3 F0=mix(vec3(.042),albedo,metal),F=fresnel(vh,F0);vec3 spec=D*geom*F/max(4.*nv*nl,.001);
 return ((1.-F)*(1.-metal)*albedo/PI+spec)*radiance*nl;
}
void main(){
 vec4 tex=u_hasMap>.5?texture(u_map,v_uv):vec4(1.);if(tex.a<.15)discard;
 vec3 N=normalize(v_normal);if(!gl_FrontFacing)N=-N;
 vec3 V=normalize(u_camera-v_world),base=u_base*v_tint.rgb*tex.rgb;
 float rough=u_rough;float noise=hash(floor(v_world*110.));
 if(u_kind==1){base*=.981+noise*.035;rough+=.035*noise;}
 if(u_kind==2){base*=.94+.06*sin(v_uv.y*50.)*sin(v_uv.x*83.)+.035*noise;rough+=.045*noise;}
 if(u_kind==3){float stripe=1.-smoothstep(.05,.095,abs(fract(v_uv.x*3.+v_uv.y*3.4)-.5));base=mix(base,base*vec3(.89,.80,.65),stripe*.4);}
 if(u_kind==4){float vein=pow(abs(sin(v_uv.x*3.14159265)),35.);float small=pow(abs(sin(v_uv.y*57.+abs(v_uv.x-.5)*18.)),24.);base*=.78+.18*vein+.10*small;}
 if(u_kind==5){float bloom=.5+.5*sin(v_world.x*46.+v_world.z*37.)*sin(v_world.y*39.);base=mix(base,vec3(.34,.40,.55),bloom*.23);rough+=bloom*.1;}
 if(u_kind==7){base*=.96+.075*noise;}
 vec3 albedo=pow(max(base,vec3(0.)),vec3(2.2));rough=clamp(rough,.08,.96);
 vec3 keyDir=normalize(vec3(-5.,9.,6.));float sh=shadow(N);
 vec3 col=brdf(N,V,keyDir,albedo,rough,u_metal,vec3(3.6,3.22,2.74))*sh;
 col+=brdf(N,V,normalize(vec3(4.,5.,-7.)),albedo,rough,u_metal,vec3(1.25,1.40,1.72));
 col+=brdf(N,V,normalize(vec3(4.,3.,7.)),albedo,rough,u_metal,vec3(.52,.43,.34));
 vec3 ambient=mix(vec3(.15,.105,.073),vec3(.48,.46,.44),N.y*.5+.5);
 col+=albedo*ambient*.56*(1.-u_metal*.8);
 vec3 R=reflect(-V,N);float spec1=pow(max(dot(R,normalize(vec3(-3,5,4))),0.),22.*(1.-rough)+2.);
 float spec2=pow(max(dot(R,normalize(vec3(3,3,-5))),0.),30.*(1.-rough)+2.);
 vec3 F=fresnel(max(dot(N,V),0.),mix(vec3(.042),albedo,u_metal));
 col+=(vec3(1.8,1.55,1.3)*spec1+vec3(.8,.95,1.3)*spec2)*F*(1.-rough*.72);
 for(int i=0;i<5;i++){float a=float(i)*1.256637;vec3 cp=vec3(cos(a)*1.48,2.95,sin(a)*1.48);vec3 d=cp-v_world;float dist=dot(d,d);vec3 L=normalize(d);col+=brdf(N,V,L,albedo,rough,u_metal,vec3(1.,.38,.075)*u_candlePower*2.6/(.4+dist));}
 if(u_kind==1||u_kind==2||u_kind==3){float wrap=max(0.,dot(-N,keyDir)*.5+.2);col+=albedo*vec3(.14,.055,.021)*wrap;}
 if(u_kind==9)col+=vec3(5.,.55,.035)*v_tint.a;
 if(u_kind==7){float pool=.40+.60*exp(-dot(v_world.xz,v_world.xz)*.017);col*=pool;}
 col*=u_exposureLight;
 fragColor=vec4(col,1.);
}`;
const SHADOW_VERTEX=`#version 300 es
precision highp float; precision highp int;layout(location=0)in vec3 a_position;layout(location=3)in mat4 a_model;uniform mat4 u_vp;void main(){gl_Position=u_vp*a_model*vec4(a_position,1.);}`;
const SHADOW_FRAGMENT=`#version 300 es
precision highp float; precision highp int;void main(){}`;
const QUAD_VERTEX=`#version 300 es
precision highp float; precision highp int;out vec2 v_uv;void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);v_uv=p;gl_Position=vec4(p*2.-1.,0.,1.);}`;
const BLUR_FRAGMENT=`#version 300 es
precision highp float; precision highp int;in vec2 v_uv;uniform sampler2D u_image;uniform vec2 u_step;uniform float u_bright;out vec4 fragColor;
vec3 readColor(vec2 uv){vec3 c=texture(u_image,uv).rgb;if(u_bright>.5){float v=max(c.r,max(c.g,c.b));c*=max(v-.95,0.)/max(v,.0001);}return c;}
void main(){vec3 c=readColor(v_uv)*.227027;c+=readColor(v_uv+u_step*1.384615)*.316216;c+=readColor(v_uv-u_step*1.384615)*.316216;c+=readColor(v_uv+u_step*3.230769)*.070270;c+=readColor(v_uv-u_step*3.230769)*.070270;fragColor=vec4(c,1.);}`;
const FINAL_FRAGMENT=`#version 300 es
precision highp float; precision highp int;in vec2 v_uv;uniform sampler2D u_image;uniform sampler2D u_glow;uniform vec2 u_pixel;uniform float u_time;uniform float u_glowPower;out vec4 fragColor;
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
float luma(vec3 c){return dot(c,vec3(.299,.587,.114));}
void main(){vec3 c=texture(u_image,v_uv).rgb;vec3 a=texture(u_image,v_uv+vec2(u_pixel.x,0)).rgb,b=texture(u_image,v_uv-vec2(u_pixel.x,0)).rgb,d=texture(u_image,v_uv+vec2(0,u_pixel.y)).rgb,e=texture(u_image,v_uv-vec2(0,u_pixel.y)).rgb;float edge=max(max(luma(a),luma(b)),max(luma(d),luma(e)))-min(min(luma(a),luma(b)),min(luma(d),luma(e)));c=mix(c,(c*2.+a+b+d+e)/6.,smoothstep(.11,.6,edge)*.34);c+=texture(u_glow,v_uv).rgb*u_glowPower;float vig=1.-.18*pow(length((v_uv-.5)*vec2(1.15,1.)),1.6);c=pow(aces(c*1.08*vig),vec3(1./2.2));float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);c+=(grain-.5)/255.;fragColor=vec4(c,1.);}`;
const EFFECT_VERTEX=`#version 300 es
precision highp float; precision highp int;layout(location=0)in vec3 a_position;layout(location=2)in vec2 a_uv;layout(location=3)in vec4 a_origin;layout(location=4)in vec4 a_params;
uniform mat4 u_vp;uniform vec3 u_right;uniform vec3 u_wind;uniform float u_time;uniform int u_type;
out vec2 v_uv;out vec4 v_params;out float v_phase;
void main(){vec3 p=a_origin.xyz;float phase=a_origin.w;v_uv=a_uv;v_params=a_params;v_phase=phase;
 if(u_type==0){float fuel=a_params.x,gust=a_params.y,s=a_params.w;float y=a_position.y*1.55-.20;float x=a_position.x*2.8;float h=.30*s*fuel*(1.+.055*sin(u_time*15.+phase)+.035*sin(u_time*27.+phase*4.));float wobble=(sin(u_time*9.+phase)+.45*sin(u_time*18.+phase*1.7))*.012;p+=u_right*(x*.060*s*(.8+.2*fuel)+wobble*max(y,0.)*max(y,0.));p.y+=y*h;p+=u_wind*(gust*.54*pow(max(y,0.),1.6));v_uv=vec2(x,y);}
 else{float age=max(a_params.z,0.),t=a_position.y;float length=min(age*(1.10+.23*sin(phase*2.1)),1.46+.26*sin(phase));float drift=.13*age*(.35+t);float wave=(sin(t*8.-age*2.8+phase)*.065+sin(t*18.-age*1.1+phase*3.)*.018)*t;float width=.006+.042*t*t+.013*age*t;p+=u_right*(a_position.x*width+wave);p.y+=.018+t*length;p+=u_wind*(drift+.08*sin(t*6.+phase)*t);}
 gl_Position=u_vp*vec4(p,1.);
}`;
const EFFECT_FRAGMENT=`#version 300 es
precision highp float; precision highp int;in vec2 v_uv;in vec4 v_params;in float v_phase;uniform int u_type;uniform float u_time;out vec4 fragColor;
void main(){if(u_type==0){if(v_params.x<.005)discard;float x=abs(v_uv.x),y=v_uv.y;float inside=step(0.,y)*(1.-step(1.,y));float radius=pow(max(sin(clamp(y,0.,1.)*3.14159265),0.),.77)*(.68-.24*y);float shape=(1.-smoothstep(radius*.65,radius+.065,x))*inside;float core=(1.-smoothstep(radius*.15,radius*.60+.002,x))*inside*(1.-smoothstep(.3,.78,y));vec3 hot=mix(vec3(2.8,.79,.055),vec3(6.,4.6,1.9),core);float blue=exp(-y*y*380.)*exp(-x*x*16.);hot=mix(hot,vec3(.1,.55,1.9),blue*.7);float halo=exp(-x*x*.78-(y-.38)*(y-.38)*2.8)*.11;vec3 col=hot*shape+vec3(1.,.32,.037)*halo;fragColor=vec4(col*v_params.x,1.);}
 else{float age=v_params.z;if(age<0.||age>5.)discard;float x=v_uv.x*2.-1.,t=v_uv.y;float alpha=exp(-x*x*3.)*(1.-smoothstep(.6,1.,t))*smoothstep(0.,.12,t)*smoothstep(0.,.13,age)*exp(-age*.66)*.18;alpha*=.8+.2*sin(t*29.-u_time*4.+v_phase);fragColor=vec4(.58,.61,.65,alpha);}}
`;
class Batch {
 constructor(geometry,material={},options={}){this.geometry=geometry;this.material=Object.assign({base:M.color('#ffffff'),rough:.48,metal:0,kind:0},material);this.matrices=[];this.colors=[];this.castShadow=options.castShadow!==false;this.visible=true;this.dynamic=!!options.dynamic;this.name=options.name||'';this.gpu=null;}
 add(p=[0,0,0],s=[1,1,1],r=[0,0,0],color=[1,1,1,0],parent=null){let mat=M.compose(p,s,r);if(parent)mat=M.multiply(parent,mat);this.matrices.push(mat);this.colors.push(color);return this.matrices.length-1;}
 setMatrix(i,m){this.matrices[i]=m;this.dirty=true;}
 setColor(i,c){this.colors[i]=c;this.dirty=true;}
}
class Renderer{
 constructor(canvas){
  this.canvas=canvas;this.gl=canvas.getContext('webgl2',{alpha:false,antialias:false,powerPreference:'high-performance',preserveDrawingBuffer:true});
  if(!this.gl)throw new Error('このブラウザではWebGL 2を利用できません。通常のブラウザで開き直してください。');
  const gl=this.gl;this.hdr=!!gl.getExtension('EXT_color_buffer_float');gl.getExtension('OES_texture_float_linear');
  this.program=this.compile(MESH_VERTEX,MESH_FRAGMENT);this.shadowProgram=this.compile(SHADOW_VERTEX,SHADOW_FRAGMENT);
  this.blurProgram=this.compile(QUAD_VERTEX,BLUR_FRAGMENT);this.finalProgram=this.compile(QUAD_VERTEX,FINAL_FRAGMENT);this.effectProgram=this.compile(EFFECT_VERTEX,EFFECT_FRAGMENT);
  this.quadVAO=gl.createVertexArray();this.textureCache=new WeakMap();this.geometryCache=new WeakMap();this.emptyTexture=this.texture(null);this.batchCount=0;this.triangleCount=0;
  this.lightVP=M.multiply(M.ortho(-5.9,5.9,-5.9,5.9,.2,30),M.lookAt([-7,12,8],[0,.8,0]));this.shadowSize=1536;this.setupShadow();this.targets=[];this.shadowDirty=true;this.quality='standard';
 }
 compile(vs,fs){const gl=this.gl;function shader(type,src){const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh));return sh;}const p=gl.createProgram(),v=shader(gl.VERTEX_SHADER,vs),f=shader(gl.FRAGMENT_SHADER,fs);gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));gl.deleteShader(v);gl.deleteShader(f);const uniforms={};for(let i=0;i<gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);i++){const info=gl.getActiveUniform(p,i);uniforms[info.name]=gl.getUniformLocation(p,info.name);}return{p,u:uniforms};}
 use(p){this.gl.useProgram(p.p);return p.u;}
 texture(source){if(source&&this.textureCache.has(source))return this.textureCache.get(source);const gl=this.gl,t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);if(source)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);else gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,255,255,255]));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);if(source)this.textureCache.set(source,t);return t;}
 setupShadow(){const gl=this.gl;if(this.shadowTexture)gl.deleteTexture(this.shadowTexture);if(this.shadowFBO)gl.deleteFramebuffer(this.shadowFBO);this.shadowTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.shadowTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT24,this.shadowSize,this.shadowSize,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);for(const p of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,p,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);this.shadowFBO=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,this.shadowFBO);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,this.shadowTexture,0);gl.drawBuffers([gl.NONE]);gl.readBuffer(gl.NONE);if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw new Error('影用の描画領域を確保できません。');gl.bindFramebuffer(gl.FRAMEBUFFER,null);this.shadowDirty=true;}
 target(w,h,depth=false){const gl=this.gl,tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,this.hdr?gl.RGBA16F:gl.RGBA8,w,h,0,gl.RGBA,this.hdr?gl.HALF_FLOAT:gl.UNSIGNED_BYTE,null);for(const p of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,p,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);const fbo=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);let rb=null;if(depth){rb=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,rb);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT24,w,h);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,rb);}if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw new Error('描画領域を確保できません。画質を下げて再読み込みしてください。');return{tex,fbo,rb,w,h};}
 resize(width,height,quality='standard'){this.quality=quality;const dpr=window.devicePixelRatio||1;const ratio=quality==='high'?Math.min(dpr,2):quality==='low'?Math.min(dpr,.85):Math.min(dpr,1.4);let w=Math.round(width*ratio),h=Math.round(height*ratio);if(w>2200){h=Math.round(h*2200/w);w=2200;}if(this.canvas.width===w&&this.canvas.height===h&&this.targets.length)return;this.canvas.width=w;this.canvas.height=h;const gl=this.gl;for(const t of this.targets){gl.deleteTexture(t.tex);gl.deleteFramebuffer(t.fbo);if(t.rb)gl.deleteRenderbuffer(t.rb);}this.targets=[this.target(w,h,true),this.target(Math.ceil(w/3),Math.ceil(h/3)),this.target(Math.ceil(w/3),Math.ceil(h/3))];this.shadowDirty=true;gl.bindFramebuffer(gl.FRAMEBUFFER,null);}
 geometry(g){if(this.geometryCache.has(g))return this.geometryCache.get(g);const gl=this.gl,result={buffers:[],count:g.indices.length};for(const [name,loc,size]of[['pos',0,3],['normal',1,3],['uv',2,2]]){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,g[name],gl.STATIC_DRAW);result.buffers.push({b,loc,size});}result.index=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,result.index);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,g.indices,gl.STATIC_DRAW);this.geometryCache.set(g,result);return result;}
 prepare(batch){const gl=this.gl;if(!batch.gpu){const vao=gl.createVertexArray();gl.bindVertexArray(vao);const geo=this.geometry(batch.geometry);for(const {b,loc,size} of geo.buffers){gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,0,0);}gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,geo.index);const mb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,mb);for(let i=0;i<4;i++){gl.enableVertexAttribArray(3+i);gl.vertexAttribPointer(3+i,4,gl.FLOAT,false,64,i*16);gl.vertexAttribDivisor(3+i,1);}const cb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,cb);gl.enableVertexAttribArray(7);gl.vertexAttribPointer(7,4,gl.FLOAT,false,16,0);gl.vertexAttribDivisor(7,1);batch.gpu={vao,mb,cb,count:geo.count};batch.dirty=true;}
 if(batch.dirty){const data=new Float32Array(batch.matrices.length*16);batch.matrices.forEach((m,i)=>data.set(m,i*16));gl.bindBuffer(gl.ARRAY_BUFFER,batch.gpu.mb);gl.bufferData(gl.ARRAY_BUFFER,data,batch.dynamic?gl.DYNAMIC_DRAW:gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,batch.gpu.cb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(batch.colors.flat()),batch.dynamic?gl.DYNAMIC_DRAW:gl.STATIC_DRAW);batch.dirty=false;}}
 draw(batch){const gl=this.gl;this.prepare(batch);gl.bindVertexArray(batch.gpu.vao);gl.drawElementsInstanced(gl.TRIANGLES,batch.gpu.count,gl.UNSIGNED_INT,0,batch.matrices.length);this.batchCount++;this.triangleCount+=batch.gpu.count/3*batch.matrices.length;}
 setupEffects(candles){const gl=this.gl;this.effectCandles=candles;const vao=gl.createVertexArray();gl.bindVertexArray(vao);const geo=this.geometry(G.ribbon(28));for(const {b,loc,size}of geo.buffers){gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,0,0);}gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,geo.index);const origins=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,origins);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(candles.flatMap(c=>[c.x,c.y,c.z,c.phase])),gl.STATIC_DRAW);gl.enableVertexAttribArray(3);gl.vertexAttribPointer(3,4,gl.FLOAT,false,16,0);gl.vertexAttribDivisor(3,1);const params=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,params);gl.enableVertexAttribArray(4);gl.vertexAttribPointer(4,4,gl.FLOAT,false,16,0);gl.vertexAttribDivisor(4,1);this.effects={vao,params,count:geo.count,data:new Float32Array(candles.length*4)};}
 effectsPass(vp,camera,state,time,type){const gl=this.gl,e=this.effects;if(!e)return;const u=this.use(this.effectProgram);gl.uniformMatrix4fv(u.u_vp,false,vp);gl.uniform3fv(u.u_right,camera.right);gl.uniform3fv(u.u_wind,state.wind);gl.uniform1f(u.u_time,time);gl.uniform1i(u.u_type,type);for(let i=0;i<this.effectCandles.length;i++){const c=state.candle(i);e.data.set([c.fuel,c.gust,Number.isFinite(c.smokeAge)?c.smokeAge:-10,this.effectCandles[i].scale],i*4);}gl.bindBuffer(gl.ARRAY_BUFFER,e.params);gl.bufferData(gl.ARRAY_BUFFER,e.data,gl.DYNAMIC_DRAW);gl.bindVertexArray(e.vao);gl.enable(gl.BLEND);gl.blendFunc(type===0?gl.ONE:gl.SRC_ALPHA,type===0?gl.ONE:gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.drawElementsInstanced(gl.TRIANGLES,e.count,gl.UNSIGNED_INT,0,this.effectCandles.length);gl.depthMask(true);gl.disable(gl.BLEND);}
 render(batches,camera,state,time){const gl=this.gl;this.batchCount=0;this.triangleCount=0;
  gl.enable(gl.DEPTH_TEST);gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);gl.depthMask(true);gl.depthFunc(gl.LEQUAL);
  if(this.shadowDirty){gl.bindFramebuffer(gl.FRAMEBUFFER,this.shadowFBO);gl.viewport(0,0,this.shadowSize,this.shadowSize);gl.clear(gl.DEPTH_BUFFER_BIT);const u=this.use(this.shadowProgram);gl.uniformMatrix4fv(u.u_vp,false,this.lightVP);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1.2,2.0);for(const b of batches)if(b.visible&&b.castShadow&&b.matrices.length)this.draw(b);gl.disable(gl.POLYGON_OFFSET_FILL);this.shadowDirty=false;}
  const [scene,bloomA,bloomB]=this.targets;if(!scene)return;
  gl.bindFramebuffer(gl.FRAMEBUFFER,scene.fbo);gl.viewport(0,0,scene.w,scene.h);gl.clearColor(.011,.007,.006,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  const u=this.use(this.program);gl.uniformMatrix4fv(u.u_vp,false,camera.vp);gl.uniformMatrix4fv(u.u_lightVP,false,this.lightVP);gl.uniform3fv(u.u_camera,camera.position);gl.uniform1f(u.u_candlePower,state.litCount/82);gl.uniform1f(u.u_exposureLight,1.+(1.-state.litCount/82)*.08);gl.uniform1f(u.u_shadowTexel,1/this.shadowSize);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,this.shadowTexture);gl.uniform1i(u.u_shadowMap,1);gl.uniform1i(u.u_map,0);
  for(const b of batches){if(!b.visible||!b.matrices.length)continue;const mat=b.material;gl.uniform3fv(u.u_base,mat.base);gl.uniform1f(u.u_rough,mat.rough);gl.uniform1f(u.u_metal,mat.metal);gl.uniform1i(u.u_kind,mat.kind);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,mat.texture?this.texture(mat.texture):this.emptyTexture);gl.uniform1f(u.u_hasMap,mat.texture?1:0);this.draw(b);}
  this.effectsPass(camera.vp,camera,state,time,1);this.effectsPass(camera.vp,camera,state,time,0);
  gl.disable(gl.DEPTH_TEST);gl.bindVertexArray(this.quadVAO);
  let bu=this.use(this.blurProgram);gl.uniform1i(bu.u_image,0);gl.activeTexture(gl.TEXTURE0);gl.bindFramebuffer(gl.FRAMEBUFFER,bloomA.fbo);gl.viewport(0,0,bloomA.w,bloomA.h);gl.bindTexture(gl.TEXTURE_2D,scene.tex);gl.uniform2f(bu.u_step,2.4/scene.w,0);gl.uniform1f(bu.u_bright,1);gl.drawArrays(gl.TRIANGLES,0,3);
  gl.bindFramebuffer(gl.FRAMEBUFFER,bloomB.fbo);gl.bindTexture(gl.TEXTURE_2D,bloomA.tex);gl.uniform2f(bu.u_step,0,1.7/bloomA.h);gl.uniform1f(bu.u_bright,0);gl.drawArrays(gl.TRIANGLES,0,3);
  const fu=this.use(this.finalProgram);gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,scene.w,scene.h);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,scene.tex);gl.uniform1i(fu.u_image,0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,bloomB.tex);gl.uniform1i(fu.u_glow,1);gl.uniform2f(fu.u_pixel,1/scene.w,1/scene.h);gl.uniform1f(fu.u_time,time);gl.uniform1f(fu.u_glowPower,.30);gl.drawArrays(gl.TRIANGLES,0,3);
 }
 dispose(){const gl=this.gl;for(const target of this.targets){gl.deleteFramebuffer(target.fbo);gl.deleteTexture(target.tex);if(target.rb)gl.deleteRenderbuffer(target.rb);}gl.deleteFramebuffer(this.shadowFBO);gl.deleteTexture(this.shadowTexture);}
}
W.Batch=Batch;W.Renderer=Renderer;
})(window.Wishes);
