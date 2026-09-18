'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../src/core.js');
const W=require('../src/confetti.js');
const particles=W.makeConfettiParticles();
const active=age=>particles.filter(p=>W.sampleConfetti(p,age).visible).length;

test('紙吹雪は115枚から6倍の690枚に増加',()=>{
 assert.equal(W.CONFETTI.count,115*6);
 assert.equal(particles.length,W.CONFETTI.count);
});
test('同じseedで紙吹雪の配置と時間差を再現できる',()=>{
 assert.deepEqual(particles,W.makeConfettiParticles());
 assert.notDeepEqual(particles,W.makeConfettiParticles(1));
});
test('最初の345枚と、時間差で降る345枚に分かれる',()=>{
 assert.equal(particles.filter(p=>p.delay<.3).length,345);
 assert.equal(particles.filter(p=>p.delay>=.65).length,345);
 assert.ok(particles.every(p=>p.delay<4.05));
});
test('開始前は非表示、初動から大量に舞い、長く残る',()=>{
 assert.equal(active(-1),0);
 assert.equal(active(-Infinity),0);
 assert.equal(active(0),0);
 assert.ok(active(.5)>=340);
 assert.ok(active(4.2)>=600);
 assert.ok(active(8)>115);
 assert.ok(active(10)>0);
});
test('13.5秒で全紙吹雪が消える',()=>{
 assert.equal(W.CONFETTI.duration,13.5);
 for(const age of [13.5,14,60,Infinity,NaN])assert.equal(active(age),0);
});
test('全時刻で行列用の値が有限・スケールが正',()=>{
 for(const age of [-Infinity,-1,0,.01,.5,2,4.2,8,11.9,13.49,13.5,NaN]){
  for(const p of particles){
   const s=W.sampleConfetti(p,age);
   assert.ok([...s.position,...s.scale,...s.rotation].every(Number.isFinite));
   assert.ok(s.scale.every(v=>v>0));
  }
 }
});
test('時間サンプリングで紙吹雪の元データを変更しない',()=>{
 const snapshot=JSON.stringify(particles);
 for(let run=0;run<20;run++)for(const p of particles)W.sampleConfetti(p,run*.7);
 assert.equal(JSON.stringify(particles),snapshot);
 assert.equal(particles.length,690);
});
