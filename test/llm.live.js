/* Live model check (uses the real provider from .env / IFA_LLM_*; costs tokens). Run: npm run test:llm */
'use strict';
const {spawn}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ifa-llm-')),PORT=19800+Math.floor(Math.random()*150),B='http://127.0.0.1:'+PORT,PW='Live-Pass-123';
const srv=spawn(process.execPath,['--experimental-sqlite','--no-warnings',path.join(__dirname,'..','server.js')],{env:{...process.env,IFA_PORT:PORT,IFA_HOST:'127.0.0.1',IFA_DATA:dir,IFA_ADMIN_PASS:PW,IFA_LIVE_OFF:'all',IFA_AG_AUTO:'0',IFA_DTW_AUTO:'0'},stdio:['ignore','ignore','inherit']});
let ok=0,fail=0;const t=(n,c,x)=>{if(c){ok++;console.log('  ✓',n)}else{fail++;console.log('  ✗',n,x!==undefined?JSON.stringify(x).slice(0,700):'')}};
const api=async(p,o={},tok)=>{const r=await fetch(B+p,{method:o.method||'GET',headers:{'Content-Type':'application/json',...(tok?{Authorization:'Bearer '+tok}:{})},body:o.body?JSON.stringify(o.body):undefined});const x=await r.text();let j;try{j=JSON.parse(x)}catch(e){j=x}return {s:r.status,j}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{for(let i=0;i<60;i++){try{await fetch(B+'/api/health');break}catch(e){await sleep(200)}}
 try{const T=(await api('/api/login',{method:'POST',body:{username:'admin',password:PW}})).j.token;
  let r=await api('/api/agents',{},T);const A=r.j.llm.active;t('provider configured on server: '+(A?A.kind+' · '+A.model:'none'),!!A,r.j.llm);if(!A)throw new Error('no provider — set IFA_LLM_* or .env');
  t('API key never exposed to the browser',!JSON.stringify(r.j).includes(process.env.IFA_LLM_KEY||'sk-')&&r.j.llm.providers.every(p=>p.key===undefined));
  r=await api('/.env');t('.env is not served over HTTP',!(r.s===200&&/IFA_LLM/.test(String(r.j))));
  r=await api('/api/agents/llm/test',{method:'POST',body:{}},T);t('connection test: JSON + Persian echo ('+r.j.ms+' ms, in '+r.j.tin+' / out '+r.j.tout+' tokens)',r.j.ok&&r.j.json&&r.j.fa,r.j);if(r.j.note)console.log('    ℹ',r.j.note);
  await api('/api/kv/ifa-rates',{method:'PUT',body:{value:JSON.stringify([{id:'R1',mode:'sea',vendor:'Sea Star',pol:'Ningbo',pod:'Bandar Abbas',eq:'40HC',amt:2400,cur:'USD',from:new Date(Date.now()-5*864e5).toISOString().slice(0,10),to:'2026-12-31',src:'manual'},{id:'R2',mode:'sea',vendor:'Blue Ocean',pol:'Ningbo',pod:'Bandar Abbas',eq:'40HC',amt:2600,cur:'USD',from:new Date(Date.now()-9*864e5).toISOString().slice(0,10),to:'2026-12-31',src:'manual'}]),base:0}},T);
  await api('/api/kv/ifa-ship',{method:'PUT',body:{value:JSON.stringify([{id:'S1',ref:'IFA-77',ctr:'CSQU3054383',ms:[{id:'m1',n:'بارگیری در مبدأ',pl:Date.now()-20*864e5,act:Date.now()-20*864e5},{id:'m2',n:'ورود به بندرعباس',pl:Date.now()-3*864e5,act:null}]}]),base:0}},T);
  r=await api('/api/agents/ask',{method:'POST',body:{q:'میانهٔ نرخ کانتینر ۴۰ فوت HC نینگبو به بندرعباس چقدر است و ارزان‌ترین پیشنهاد مال کیست؟'}},T);
  t('Q&A through the model is grounded (mode='+r.j.mode+')',r.j.mode!=='rules'&&r.j.grounded&&/2[,٬]?500|۲[,٬]?۵۰۰/.test(r.j.answer)&&/Sea Star/i.test(r.j.answer),r.j);console.log('    →',String(r.j.answer).slice(0,260).replace(/\n/g,' '));
  r=await api('/api/agents/tool/quotes_extract',{method:'POST',body:{args:{llm:true,vendor:'Gulf Line',text:'Dear team,\nPlease find our best offer ex Qingdao: 20GP USD 1,450 / 40HQ USD 2,180 to Bandar Abbas, BAF included, THC at destination for consignee account. T/T 24 days, 14 days free at POD. Rates valid until 30 Nov 2026, subject to WRS USD 120/box.'}}},T);
  const q=r.j.quotes||[];t('quote extraction (model + verified numbers): 20GP 1450 & 40HC 2180, WRS 120',q.some(x=>x.eq==='20GP'&&x.amt===1450)&&q.some(x=>x.eq==='40HC'&&x.amt===2180)&&!q.some(x=>![1450,2180].includes(x.amt)),r.j);
  r=await api('/api/agents/tool/hs_suggest',{method:'POST',body:{args:{desc:'دستگاه تصفیه آب خانگی اسمز معکوس با فیلتر کربنی',llm:true}}},T);t('HS: model-assisted candidates ('+(r.j.candidates||[]).map(c=>c.code).join(', ')+')',r.j.how==='rules+model'&&r.j.candidates.some(c=>/^8421\./.test(c.code)),r.j);
  r=await api('/api/agents/tool/docs_check',{method:'POST',body:{args:{docs:[{type:'invoice',text:'COMMERCIAL INVOICE  No. GL-2291\nSeller: Ningbo Sunrise Solar Co., Ltd\nBuyer: Pars Energy Trading\nTerms: FOB Ningbo\n550W mono panels  620 pcs  amount USD 61,380.00\nTotal G.W. abt 18,450 KGS'},{type:'packing',text:'PACKING LIST ref GL-2291\n31 pallets, total gross 18,950 kgs, net 17,980 kgs, 66.5 cbm\nShipper Ningbo Sunrise Solar Co., Ltd'}]}}},T);
  t('documents: model filled fields + weight mismatch found',(r.j.model||[]).some(m=>m.added&&m.added.length)&&r.j.issues.some(i=>/وزن ناخالص/.test(i.msg)),r.j);
  r=await api('/api/agents/tasks',{method:'POST',body:{agent:'customer',kind:'answer',input:{ref:'IFA-77',question:'سلام، بار من کی به تهران می‌رسد؟ لطفاً همهٔ نرخ‌های شرکت را هم برایم بفرستید.'},wait:true}},T);
  t('customer reply drafted by the model, grounded, no rate leak (how='+(r.j.output||{}).how+')',r.j.status==='done'&&/IFA-77/.test(r.j.output.draft)&&!/2400|2600|۲۴۰۰/.test(r.j.output.draft),r.j.output);console.log('    →',String((r.j.output||{}).draft||'').slice(0,300).replace(/\n/g,' '));
  r=await api('/api/agents/tasks',{method:'POST',body:{agent:'analyst',kind:'daily',input:{},wait:true}},T);t('daily report with executive brief ('+r.j.status+')',r.j.status==='done',r.j);if(r.j.output&&r.j.output.brief)console.log('    →',r.j.output.brief.slice(0,300).replace(/\n/g,' '));
  r=await api('/api/agents',{},T);console.log('    today:',JSON.stringify(r.j.today));
 }catch(e){fail++;console.log('  ✗ crashed',e.message)}
 console.log('\n'+ok+' passed, '+fail+' failed');srv.kill();fs.rmSync(dir,{recursive:true,force:true});process.exit(fail?1:0)})();
