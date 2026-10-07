#!/usr/bin/env node
// Rebuilds public/index.html and binary assets (fonts, icons) from ./bundle.
// GitHub upload tooling only accepts text up to ~1 MB per file, so the 9 MB single-file app
// and the binary assets are stored as text parts. Run once after cloning: `npm run restore`
// (it also runs automatically before `npm start` / `npm test` and in the Docker build).
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const R=path.join(__dirname,'..'),M=JSON.parse(fs.readFileSync(path.join(R,'bundle','manifest.json'),'utf8'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const force=process.argv.includes('--force');let n=0;
const ok=(p,h)=>{try{return sha(fs.readFileSync(p))===h}catch{return false}};
const ix=path.join(R,M.index.path);
if(force||!ok(ix,M.index.sha256)){const b=Buffer.concat(Array.from({length:M.index.parts},(_,k)=>fs.readFileSync(path.join(R,'bundle','index',`part-${String(k).padStart(2,'0')}.txt`))));
 if(sha(b)!==M.index.sha256){console.error('restore: index.html checksum mismatch');process.exit(1)}fs.mkdirSync(path.dirname(ix),{recursive:true});fs.writeFileSync(ix,b);n++}
for(const x of M.binaries){const p=path.join(R,x.path);if(!force&&ok(p,x.sha256))continue;const b=Buffer.from(fs.readFileSync(path.join(R,x.file),'utf8').trim(),'base64');
 if(sha(b)!==x.sha256){console.error('restore: checksum mismatch for '+x.path);process.exit(1)}fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,b);n++}
console.log(n?`restore: ${n} file(s) rebuilt from bundle/`:'restore: assets already up to date');
