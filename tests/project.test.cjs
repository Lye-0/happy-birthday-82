'use strict';const{test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
test('HTML・CSS・JavaScriptが別ファイルに分離されている',()=>{const scripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]);assert.equal(scripts.length,7);for(const p of scripts)assert.ok(fs.existsSync(path.join(root,p)));assert.ok(fs.existsSync(path.join(root,'css/style.css')));});
test('外部CDN・画像・フォントの参照がない',()=>{assert.ok(!/<(?:script|link|img)[^>]+(?:src|href)="https?:/i.test(html));for(const file of fs.readdirSync(path.join(root,'src'))){const s=fs.readFileSync(path.join(root,'src',file),'utf8');assert.ok(!/\bfetch\s*\(|XMLHttpRequest|navigator\.mediaDevices|new WebSocket/.test(s));}});
test('吹き消す・本数確認・再点火用の操作が存在する',()=>{for(const id of ['blow','lit-count','count-view','view-top','view-reset','sound','quality','announcement'])assert.ok(html.includes(`id="${id}"`));});
test('設定の既定品質は標準、音は初期オフ',()=>{assert.ok(html.includes('value="standard" selected'));assert.ok(/id="sound"[^>]+aria-pressed="false"/.test(html));});
