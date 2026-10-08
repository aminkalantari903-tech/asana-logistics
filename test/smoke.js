/* End-to-end smoke test: boots the server on a temp data dir and exercises every core API. */
'use strict';
const {spawn}=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),zlib=require('node:zlib');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ifa-')),PORT=18000+Math.floor(Math.random()*1000),B='http://127.0.0.1:'+PORT,PW='Test-Pass-123';
/* fake SMTP server to verify e-mail delivery end-to-end (no network needed) */
const net=require('node:net');const MAILS=[];const SMTP_PORT=PORT+1;
const smtp=net.createServer(c=>{let data=false,buf='',cur={};c.write('220 fake ESMTP\r\n');c.on('data',d=>{buf+=d;let i;while((i=buf.indexOf('\r\n'))>=0){const l=buf.slice(0,i);buf=buf.slice(i+2);
 if(data){if(l==='.'){data=false;MAILS.push(cur);cur={};c.write('250 queued\r\n')}else cur.body=(cur.body||'')+l+'\n';continue}
 if(/^EHLO/i.test(l))c.write('250-fake\r\n250 AUTH LOGIN\r\n');else if(/^AUTH LOGIN/i.test(l))c.write('334 VXNlcm5hbWU6\r\n');else if(/^MAIL FROM/i.test(l))c.write('250 ok\r\n');else if(/^RCPT TO:<(.*)>/i.test(l)){cur.to=l.match(/<(.*)>/)[1];c.write('250 ok\r\n')}
 else if(/^DATA/i.test(l)){data=true;c.write('354 go\r\n')}else if(/^QUIT/i.test(l)){c.write('221 bye\r\n');c.end()}else if(cur.authStep===undefined){cur.authStep=1;c.write('334 UGFzc3dvcmQ6\r\n')}else c.write('235 ok\r\n')}})}).listen(SMTP_PORT,'127.0.0.1');

/* fake IMAP server (rate e-mail inbox) */
const IMAP_PORT=PORT+2;const subj='=?UTF-8?B?'+Buffer.from('نرخ هفتگی شانگهای','utf8').toString('base64')+'?=';
const RAW=['Message-ID: <rate-1@agent.cn>','From: "Sea Star" <ali@seastar.cn>','Subject: '+subj,'Date: Mon, 5 Oct 2026 10:00:00 +0000','MIME-Version: 1.0','Content-Type: multipart/mixed; boundary="BB"','','--BB','Content-Type: text/plain; charset=utf-8','Content-Transfer-Encoding: quoted-printable','','Shanghai - Bandar Abbas 40HQ USD 1,9=','50 all in, valid till 31 Oct','--BB','Content-Type: text/csv; name="rates.csv"','Content-Disposition: attachment; filename="rates.csv"','Content-Transfer-Encoding: base64','',Buffer.from('POL,POD,40HC\nNingbo,Bandar Abbas,1880\n').toString('base64'),'--BB--',''].join('\r\n');
const imapS=net.createServer(c=>{c.write('* OK fake IMAP ready\r\n');let buf='';c.on('data',d=>{buf+=d;let i;while((i=buf.indexOf('\r\n'))>=0){const l=buf.slice(0,i);buf=buf.slice(i+2);const [tag,...r]=l.split(' ');const cmd=r.join(' ');
 if(/^LOGIN/i.test(cmd))c.write(/"imapuser" "imappass"/.test(cmd)?tag+' OK logged in\r\n':tag+' NO bad\r\n');else if(/^SELECT/i.test(cmd))c.write('* 1 EXISTS\r\n'+tag+' OK [READ-WRITE] done\r\n');
 else if(/^UID SEARCH/i.test(cmd))c.write('* SEARCH 7\r\n'+tag+' OK search\r\n');else if(/^UID FETCH 7/i.test(cmd))c.write('* 1 FETCH (UID 7 BODY[] {'+Buffer.byteLength(RAW)+'}\r\n'+RAW+')\r\n'+tag+' OK fetch\r\n');
 else if(/^UID STORE/i.test(cmd))c.write(tag+' OK store\r\n');else if(/^LOGOUT/i.test(cmd)){c.write('* BYE\r\n'+tag+' OK\r\n');c.end()}else c.write(tag+' BAD\r\n')}})}).listen(IMAP_PORT,'127.0.0.1');
/* fake news feed (domestic tariff watch) */
const http=require('node:http');const FEED_PORT=PORT+3,FB='http://127.0.0.1:'+FEED_PORT;
const FEED=`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>test</title>
<item><title>افزایش ۲۶.۵ درصدی شاخص تن-کیلومتر از ۱۵ خرداد اجرایی می‌شود</title><link>${FB}/a1</link><description><![CDATA[سازمان راهداری اعلام کرد نرخ حمل کالا افزایش می‌یابد]]></description><pubDate>Wed, 03 Jun 2026 05:54:00 GMT</pubDate></item>
<item><title>نرخ جدید حق توقف ناوگان حمل‌ونقل کالا ابلاغ شد</title><link>${FB}/a2</link><description>کامیون‌ها</description><pubDate>Sat, 01 Aug 2026 08:00:00 GMT</pubDate></item>
<item><title>کاظمیان: پهنه‌های بلندمرتبه‌سازی گرگان به‌زودی ابلاغ می‌شود</title><link>${FB}/a3</link><description>شهرسازی</description></item></channel></rss>`;
const ART={'/a1':'<html><body><script>var x=1</script><article><p>سازمان راهداری اعلام کرد: نرخ شاخص تن-کیلومتر در بخش حمل‌ونقل جاده‌ای کالا از روز جمعه ۱۵ خرداد ۱۴۰۵ به میزان ۲۶.۵ درصد افزایش خواهد یافت.</p><p>نرخ شاخص تن-کیلومتر که پیش از این ۱۳ هزار و ۱۹۰ ریال بود، از زمان اجرای مصوبه جدید به ۱۶ هزار و ۶۸۰ ریال معادل ۲۶.۵ درصد افزایش خواهد رسید.</p></article></body></html>',
 '/a2':'<html><body><p>طبق مصوبه جدید، نرخ حق توقف کامیون‌ها از اول مرداد ۱۴۰۵ اعلام شد. کامیون تک: ۷,۱۰۸,۱۰۰ تومان. کامیون جفت، تریلی و کمرشکن: ۸,۴۰۳,۳۰۰ تومان.</p></body></html>'};
const feedS=http.createServer((q,r)=>{if(q.url==='/rss.xml'){r.writeHead(200,{'Content-Type':'application/rss+xml; charset=utf-8'});r.end(FEED)}else if(ART[q.url]){r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});r.end(ART[q.url])}else{r.writeHead(404);r.end()}}).listen(FEED_PORT,'127.0.0.1');
const LIVE=process.env.IFA_TEST_LIVE==='1';
const srv=spawn(process.execPath,['--experimental-sqlite','--no-warnings',path.join(__dirname,'..','server.js')],{env:{...process.env,IFA_PORT:PORT,IFA_ENV_FILE:'',IFA_HOST:'127.0.0.1',IFA_DATA:dir,IFA_ADMIN_PASS:PW,IFA_SMTP_HOST:'127.0.0.1',IFA_SMTP_PORT:SMTP_PORT,IFA_SMTP_SECURE:'0',IFA_SMTP_USER:'u',IFA_SMTP_PASS:'p',IFA_SMTP_FROM:'atlas@example.ir',IFA_SMTP_NOTLS:'1',IFA_IMAP_HOST:'127.0.0.1',IFA_IMAP_PORT:IMAP_PORT,IFA_IMAP_TLS:'0',IFA_IMAP_USER:'imapuser',IFA_IMAP_PASS:'imappass',IFA_DTW_FEEDS:FB+'/rss.xml',IFA_DTW_AUTO:'0',...(LIVE?{}:{IFA_LIVE_OFF:'weather,sanctions,holidays,market,ext',IFA_FX_MARKET:'none'})},stdio:['ignore','pipe','inherit']});
let ok=0,fail=0;const t=(n,c)=>{if(c){ok++;console.log('  ✓',n)}else{fail++;console.log('  ✗',n)}};
const api=async(p,o={},tok)=>{const r=await fetch(B+p,{method:o.method||'GET',headers:{'Content-Type':'application/json',...(tok?{Authorization:'Bearer '+tok}:{})},body:o.body?JSON.stringify(o.body):undefined});let j;const x=await r.text();try{j=JSON.parse(x)}catch(e){j=x}return {s:r.status,j,h:r.headers}};
(async()=>{for(let i=0;i<50;i++){try{await fetch(B+'/api/health');break}catch(e){await new Promise(r=>setTimeout(r,200))}}
 try{
  let r=await api('/api/health');t('health',r.s===200&&r.j.ok);
  r=await fetch(B+'/',{headers:{'Accept-Encoding':'br'}});const html=await r.text();t('app served ('+r.headers.get('content-encoding')+', '+r.headers.get('content-length')+' B)',r.status===200&&html.includes('سامانه لجستیک آسانا')&&html.includes('Asana Logistics'));
  const et=r.headers.get('etag');r=await fetch(B+'/',{headers:{'If-None-Match':et}});t('ETag 304',r.status===304);
  for(const f of ['/sw.js','/manifest.webmanifest','/fonts/fonts.css','/icons/icon-192.png','/favicon.ico'])t('static '+f,(await fetch(B+f)).status===200);
  t('path traversal blocked',(await fetch(B+'/..%2fserver.js')).status===404);
  r=await api('/api/login',{method:'POST',body:{username:'admin',password:'bad'}});t('bad login 401',r.s===401);
  r=await api('/api/login',{method:'POST',body:{username:'admin',password:PW}});const T=r.j.token;t('admin login',r.s===200&&!!T);
  t('auth required',(await api('/api/me')).s===401);
  {const h=(await api('/api/health')).j;t('open auth mode advertised',h.auth==='open'&&h.openScope==='lan');
   const D='dev_TEST_abcdefghijklmn';let o=await api('/api/auth/open',{method:'POST',body:{device:D,label:'Chrome/Linux'}});t('open connect without password',o.s===200&&!!o.j.token&&o.j.user.role==='admin'&&o.j.user.username.startsWith('dev-'));
   const o2=await api('/api/auth/open',{method:'POST',body:{device:D}});t('same device → same identity',o2.j.user.id===o.j.user.id);
   const o3=await api('/api/auth/open',{method:'POST',body:{device:'dev_OTHER_abcdefghijklm'}});t('other device → separate identity',o3.s===200&&o3.j.user.id!==o.j.user.id);
   t('open token works',(await api('/api/me',{},o.j.token)).s===200);t('bad device id 400',(await api('/api/auth/open',{method:'POST',body:{device:'x'}})).s===400);
   t('rename device',(await api('/api/me/name',{method:'PATCH',body:{name:'میز عملیات'}},o3.j.token)).j.user.name==='میز عملیات');
   t('device password login refused',(await api('/api/login',{method:'POST',body:{username:o.j.user.username,password:''}})).s===401);
   await api('/api/users/'+o3.j.user.id,{method:'PATCH',body:{active:false}},T);t('disabled device blocked',(await api('/api/auth/open',{method:'POST',body:{device:'dev_OTHER_abcdefghijklm'}})).s===403);
   t('spoofed public X-Forwarded-For blocked (lan scope)',(await fetch(B+'/api/auth/open',{method:'POST',headers:{'Content-Type':'application/json','X-Forwarded-For':'8.8.8.8'},body:JSON.stringify({device:D})})).status===403)}
  r=await api('/api/users',{method:'POST',body:{username:'ops1',name:'Ops',role:'ops',password:'Ops-Pass-123'}},T);t('create user',r.s===200);
  r=await api('/api/kv/ifa-ship',{method:'PUT',body:{value:JSON.stringify([{id:'S1',ref:'IFA-1'}]),base:0}},T);t('kv write v1',r.j.version===1);
  r=await api('/api/kv/ifa-ship',{method:'PUT',body:{value:'[]',base:0}},T);t('kv conflict 409',r.s===409&&r.j.conflict);
  r=await api('/api/kv?keys=ifa-ship,ifa-jobs',{},T);t('kv read',r.j['ifa-ship'].version===1&&r.j['ifa-jobs'].version===0);
  const ops=(await api('/api/login',{method:'POST',body:{username:'ops1',password:'Ops-Pass-123'}})).j.token;
  t('role ACL (ops cannot write ifa-pfx)',(await api('/api/kv/ifa-pfx',{method:'PUT',body:{value:'{}'}},ops)).s===403);
  r=await api('/api/files',{method:'POST',body:{job:'J-1',name:'bl.txt',mime:'text/plain',data:Buffer.from('hello').toString('base64'),public:true}},T);t('file upload',r.s===200);
  const fr=await fetch(B+'/api/files/'+r.j.id+'/raw',{headers:{Authorization:'Bearer '+T}});t('file download',(await fr.text())==='hello');
  r=await api('/api/portal',{method:'POST',body:{job:'J-1',days:7}},T);t('portal link',r.s===200);
  t('portal page',(await fetch(B+'/p/'+r.j.token)).status===200);
  r=await api('/api/notify/rules',{method:'POST',body:{event:'*',channel:'log',target:'',template:'{{type}} {{ref}}'}},T);t('notify rule',r.s===200);
  r=await api('/api/events',{method:'POST',body:{type:'shipment.created',data:{ref:'IFA-1'}}},T);t('event queued',r.j.queued===1);
  r=await api('/api/einv/taxid',{method:'POST',body:{memoryId:'A1B2C3',serial:1}},T);t('moadian taxid (22 chars)',r.j.taxid&&r.j.taxid.length===22);
  r=await api('/api/audit/verify',{},T);t('audit chain intact ('+r.j.checked+')',r.j.ok);
  r=await api('/api/backup',{},T);t('backup',r.s===200&&r.j.kv.length>=1);
  /* RFQ: online quotation links + e-mail + response flows into the shared «ifa-quotes» dataset */
  r=await api('/api/rfq',{method:'POST',body:{title:'RFQ Shanghai → Tehran',text:'40HC x1, FOB Shanghai → Tehran',route:'TEST-ROUTE',model:7500,days:30,recipients:[{name:'Forwarder A',email:'a@fwd.test'}],send:true}},T);
  t('rfq created + emailed',r.s===200&&r.j.invites.length===1&&r.j.emailed===1);const inv=r.j.invites[0].url.replace(/^https?:\/\/[^/]+/,'');
  await new Promise(x=>setTimeout(x,1500));t('SMTP delivered with reply link',MAILS.length===1&&MAILS[0].to==='a@fwd.test'&&Buffer.from(MAILS[0].body.split('\n\n').slice(1).join('').replace(/\s/g,''),'base64').toString().includes('/q/'));
  t('rfq form page',(await (await fetch(B+inv)).text()).includes('Request for Quotation'));
  let fr2=await fetch(B+inv,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'price=7100&cur=USD&days=28&free=14&note=all-in'});t('vendor submits quote',fr2.status===200);
  r=await api('/api/kv?keys=ifa-quotes',{},T);const qs=JSON.parse(r.j['ifa-quotes'].value||'[]');t('quote synced into ifa-quotes',qs.length===1&&qs[0].c===7100&&qs[0].route==='TEST-ROUTE'&&qs[0].p==='Forwarder A');
  r=await api('/api/rfq',{},T);t('rfq list with response',r.j[0].responses.length===1);
  r=await api('/api/live/status');t('live status',r.s===200&&r.j.config.smtp===true);
  r=await api('/api/live/connectors');t('live connectors registry (v1.10)',r.s===200&&Array.isArray(r.j.connectors)&&r.j.connectors.some(c=>c.id==='hsOfficial')&&r.j.connectors.some(c=>c.id==='neshan'));
  /* v1.11 actual costs + calibration */
  t('actuals parse needs login',(await api('/api/actuals/parse',{method:'POST',body:{text:'Ocean freight 1850 USD'}})).s===401);
  r=await api('/api/actuals/parse',{method:'POST',body:{text:'Ocean freight 1,850 USD\nTHC 4,200,000 تومان\nTotal 2,000 USD'}},T);t('actuals parse invoice text',r.s===200&&r.j.lines.length===2&&r.j.lines[0].comp==='freight'&&r.j.lines[1].cur==='IRR'&&r.j.lines[1].amt===42000000);
  r=await api('/api/actuals',{method:'POST',body:{ref:'JOB-T',lane:'CN_SHA>IR_THR',mode:'sea',date:'2026-09-20',lines:[{comp:'freight',amt:2400,cur:'USD',est:2000},{comp:'thc',amt:260,cur:'USD',est:200}]}},T);t('actuals saved',r.s===200&&r.j.n===2);
  r=await api('/api/actuals/calib?lane=CN_SHA%3EIR_THR&mode=sea',{},T);t('actuals calibration factor',r.s===200&&r.j.components.freight&&r.j.components.freight.factor>1&&r.j.components.freight.factor<1.2);
  r=await api('/api/actuals/accuracy',{},T);t('actuals accuracy',r.s===200&&r.j.n===2&&r.j.byComp.freight.n===1);
  /* v1.12 Iran data: customs tariff book + customs FX, PMO port tariffs, rate channels */
  const TBC='ردیف تعرفه,شرح کالا,حقوق ورودی,SUQ,اولویت\n8429.5200,ماشین‌آلات با روبنای گردان,10,u,2\n8471.3000,رایانهٔ قابل حمل,۱۵,u,4\n';
  t('tariff import needs login',(await api('/api/tariff/ir/import',{method:'POST',body:{text:TBC}})).s===401);
  r=await api('/api/tariff/ir/import',{method:'POST',body:{text:TBC,label:'test'}},T);t('tariff book import (CSV, Persian digits)',r.s===200&&r.j.imported===2&&r.j.sample[1].duty===15&&r.j.sample[0].desc.includes('\u200c'));
  r=await api('/api/tariff/ir?hs=84295200',{},T);t('tariff lookup exact',r.s===200&&r.j.result.match==='exact'&&r.j.result.duty===10);
  r=await api('/api/tariff/ir?hs=847130',{},T);t('tariff lookup by 6-digit prefix',r.j.result&&r.j.result.hs==='84713000');
  r=await api('/api/tariff/fx',{method:'PUT',body:{rates:{USD:285000},vat:10,hl:1}},T);t('customs FX saved',r.s===200&&r.j.rates.USD===285000);
  r=await api('/api/tariff/ir/calc',{method:'POST',body:{hs:'84295200',cif:10000}},T);t('customs duty calc with book rate + customs FX',r.s===200&&r.j.rate===10&&r.j.customsValueIRR===2850000000&&r.j.dutyIRR===285000000&&r.j.vatIRR===313500000);
  const PTC='بندر,خدمت,کانتینر,واحد,مبلغ,ارز,از روز,تا روز,روز آزاد\nSHR,تخلیه و بارگیری,40,کانتینر,38000000,IRR,,,\nSHR,انبارداری,40,روز,4000000,IRR,6,12,5\nSHR,انبارداری,40,روز,10000000,IRR,13,,5\n';
  r=await api('/api/ports/tariff/import',{method:'POST',body:{text:PTC,label:'test'}},T);t('port tariff import (+ storage tiers synced)',r.s===200&&r.j.imported===3&&r.j.ddSynced===1);
  r=await api('/api/ports/tariff/calc',{method:'POST',body:{port:'IR_BND',eq:'40HC',qty:2,days:15}},T);t('port charges calc (handling + tiered storage)',r.s===200&&r.j.totalIRR===2*38000000+2*(7*4000000+3*10000000));
  r=await api('/api/ratech/cfg',{method:'PUT',body:{sources:[{kind:'tg',handle:'https://t.me/s/test_rates',name:'test',trust:true,auto:true}]}},T);t('rate channel source saved',r.s===200&&r.j.sources[0].handle==='test_rates');
  r=await api('/api/ratech/ingest',{method:'POST',body:{source:r.j.sources[0].id,text:'شانگهای به بندرعباس 40HC 2450 دلار'}},T);t('channel message → rate auto-added',r.s===200&&r.j.auto===1&&r.j.items[0].amt===2450);
  r=await api('/api/ratech/ingest',{method:'POST',body:{text:'Qingdao - Bandar Abbas 40HC USD 2600'}},T);t('untrusted message queued for review',r.j.pending===1);
  r=await api('/api/ratech/items/'+r.j.items[0].id,{method:'POST',body:{action:'approve'}},T);t('queued rate approved',r.s===200&&r.j.status==='approved');
  r=await api('/api/live/hs/verify?code=12');t('hs verify validates input',r.s===400||r.s===501);
  r=await api('/api/live/matrix',{method:'POST',body:{points:[[35.69,51.39]]}});t('matrix validates input',r.s===400);
  /* v15.4 market indices: endpoint + manual entry (offline) and parsers on fixtures */
  r=await api('/api/live/indices');t('indices endpoint (sources listed)',r.s===200&&r.j.sources&&r.j.sources.ccfi&&r.j.sources.bunker&&typeof r.j.hist==='object');
  t('manual index needs admin',(await api('/api/live/indices/manual',{method:'POST',body:{series:'ccfi',line:'PERSIAN_GULF_RED_SEA',date:'2026-09-24',value:4000}},ops)).s===403);
  r=await api('/api/live/indices/manual',{method:'POST',body:{series:'ccfi',line:'PERSIAN_GULF_RED_SEA',date:'2026-09-24',value:4000}},T);await api('/api/live/indices/manual',{method:'POST',body:{series:'ccfi',line:'PERSIAN_GULF_RED_SEA',date:'2026-10-01',value:4200}},T);
  r=await api('/api/live/indices');const hp=r.j.hist['ccfi|PERSIAN_GULF_RED_SEA']||[];t('manual index stored in history',hp.length===2&&hp[1][1]===4200);
  t('manual index validates input',(await api('/api/live/indices/manual',{method:'POST',body:{series:'xx',line:'A',date:'bad',value:-1}},T)).s===400);
  {process.env.IFA_DATA=fs.mkdtempSync(path.join(os.tmpdir(),'ifa-p-'));process.env.IFA_ADMIN_PASS=PW;const M=require('../server.js').market;
   const sse=M.parseSSE({data:{currentDate:'2026-09-30',lastDate:'2026-09-24',lineDataList:[{properties:{lineName_EN:'PERSIAN GULF/RED SEA'},currentContent:'4068.55',lastContent:'3900.1'},{properties:{lineName_EN:'COMPOSITE INDEX'},currentContent:1923.93,lastContent:1917.68},{properties:{lineName_EN:'X'},currentContent:null}]}});
   t('parser: CCFI (SSE JSON)',sse.date==='2026-09-30'&&sse.lines.length===2&&sse.lines[0].k==='PERSIAN_GULF_RED_SEA'&&sse.lines[0].v===4068.55&&sse.lines[0].n==='خلیج فارس/دریای سرخ');
   const fbx=M.parseFBX(`<script>window.frProductIntroTickerData['x'] = [{"label":"FBX","value":"$3,343","change":"-1.11%"},{"label":"FBX11","value":"$3,260","change":"-3.44%"},{"label":"XSI","value":"$1"}];</script>`);
   t('parser: Freightos FBX ticker',fbx.lines.length===2&&fbx.lines[1].k==='FBX11'&&fbx.lines[1].v===3260&&Math.abs(fbx.lines[1].prev-3376)<2);
   const wci=M.parseWCI('<p>Our detailed assessment for Thursday, 01 Oct 2026 indicates the composite WCI decreased 2% to $4,434 per 40ft container.</p><p>Spot rates from Shanghai to Rotterdam fell 2% to $3,399 per 40ft and from Shanghai to New York rose 1% to $10,428 per 40ft.</p>');
   t('parser: Drewry WCI commentary',wci.date==='2026-10-01'&&wci.lines.find(l=>l.k==='COMP').v===4434&&wci.lines.find(l=>l.k==='ROTTERDAM').v===3399&&wci.lines.find(l=>l.k==='NEW_YORK').prev===10325);
   const bk=M.parseBunker('<table class="price-table VLSFO x"><tr><th>Date</th><th>Price</th></tr><tr class="row"><th class="date"><span class="day">F</span> Oct 2</th><td><span>951.50</span></td><td>-8.50</td></tr><tr><th><span class="day">Th</span> Oct 1</th><td>960.00</td></tr></table><table class="price-table MGO"><tr><th><span>F</span> Oct 2</th><td>1,663.50</td></tr></table>',2026);
   t('parser: Ship & Bunker table',bk.VLSFO.length===2&&bk.VLSFO[1][0]==='2026-10-02'&&bk.VLSFO[1][1]===951.5&&bk.MGO[0][1]===1663.5)
   {const C=['Iran','Turkey*','UAE','China','Kazakhstan','Germany','Russia','Pakistan','Iraq','Oman','India','Georgia','Armenia','Azerbaijan','Uzbekistan','Turkmenistan','Afghanistan','Belarus','Poland','Netherlands','Atlantis'];const html='<title>Diesel prices around the world,  28-Sep-2026 | X</title>'+C.map((c,i)=>`<a class='graph_outside_link'>${c}&nbsp;</a>`).join('')+C.map((c,i)=>`<div style="color: #000000;">${(0.5+i/10).toFixed(3)}</div>`).join('');
    const D=M.parseDiesel(html);t('parser: diesel prices by country (USD/L)',D.date==='2026-09-28'&&D.lines.length===20&&D.lines[0].k==='IR'&&D.lines[1].k==='TR'&&D.lines[1].v===0.6&&!D.lines.some(l=>l.n==='Atlantis'))}}

  /* v15.8 domestic tariff: official tonne-km index & tariff watch */
  {r=await api('/api/domestic/tariff',{},T);t('domestic tariff: official index 16,680 rial (5 verified versions)',r.s===200&&r.j.current.tkm===16680&&r.j.current.from==='2026-06-05'&&r.j.versions.length===5);
   r=await api('/api/domestic/watch/poll',{method:'POST'},T);t('tariff watch: feed polled, 2 relevant of 3 items',r.s===200&&r.j.checked===1&&r.j.new===2);
   r=await api('/api/domestic/watch',{},T);const it=r.j.items||[];const tk=it.find(x=>x.kind==='tkm'),sp=it.find(x=>x.kind==='stop');
   t('tariff watch: tonne-km 16,680 rial, +26.5%, effective 2026-06-05 extracted from article',tk&&tk.vals.tkm===16680&&tk.vals.pct===26.5&&tk.vals.eff==='2026-06-05');
   t('tariff watch: detention amounts (toman→rial) extracted',sp&&sp.vals.amounts.includes(71081000)&&sp.vals.amounts.includes(84033000));
   r=await api('/api/domestic/watch/poll',{method:'POST'},T);t('tariff watch: re-poll de-duplicated',r.j.new===0);
   const today=new Date().toISOString().slice(0,10);r=await api('/api/domestic/watch/'+tk.id,{method:'POST',body:{status:'ok',tkm:17000,from:today}},T);t('tariff watch: approve → new index version',r.s===200&&r.j.applied&&r.j.applied.tkm===17000);
   r=await api('/api/domestic/tariff',{},T);t('domestic tariff: approved version is current',r.j.current.tkm===17000&&r.j.versions.length===6);
   r=await api('/api/domestic/watch/'+sp.id,{method:'POST',body:{status:'ok',stop:{sgl:71081000,dbl:84033000,from:'2026-08-01'}}},T);r=await api('/api/kv?keys=ifa-dtar',{},T);const kv=JSON.parse(r.j['ifa-dtar'].value);t('tariff watch: detention stored in shared kv ifa-dtar',kv.stop.dbl===84033000&&kv.v.length===1);
   r=await api('/api/domestic/watch?status=new',{},T);t('tariff watch: no pending items after review',r.j.items.length===0)}
  /* v15.7 phase 3: partner rate panel, weekly report, external quote refs, IMAP inbox */
  {r=await api('/api/partners',{method:'POST',body:{name:'Sea Star Logistics',email:'rates@seastar.cn',lanes:[{mode:'sea',pol:'Shanghai',pod:'Bandar Abbas',eq:'40HC'},{mode:'sea',pol:'Ningbo',pod:'Jebel Ali',eq:'20DV'}]}},T);const PT=r.j.token;t('partner panel: invite created + e-mailed',r.s===200&&/\/r\//.test(r.j.url)&&r.j.emailed===true);
   let h=await fetch(B+'/r/'+PT);let tx=await h.text();t('partner panel: public page lists lanes',h.status===200&&tx.includes('Shanghai → Bandar Abbas'));
   t('partner panel: bad token 404',(await fetch(B+'/r/'+'x'.repeat(22))).status===404);
   h=await fetch(B+'/r/'+PT,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({a0:'1850',c0:'USD',i0:'all-in',v0:'2026-12-01',d0:'18',xpol:'Qingdao',xpod:'Bandar Abbas',xmode:'sea',xeq:'40HC',ax:'1990',cx:'USD',ix:'base+baf'}).toString()});tx=await h.text();t('partner panel: submission accepted',h.status===200&&/2 نرخ ثبت شد/.test(tx));
   r=await api('/api/partners/rates?status=new',{},T);const ids=r.j.map(x=>x.id);t('partner rates queued for review',r.s===200&&r.j.length===2&&r.j.some(x=>x.pol==='Qingdao'&&x.usd===1990));
   r=await api('/api/partners/rates',{method:'POST',body:{ids,status:'ok'}},T);const kv=(await api('/api/kv?keys=ifa-rates',{},T)).j['ifa-rates'];const A=JSON.parse(kv.value||'[]');t('approved partner rates → shared rate bank (src partner)',r.j.added===2&&A.filter(x=>x.src==='partner'&&/^PR-/.test(x.id)).length===2);
   r=await api('/api/partners',{},T);t('partners list with counts',r.j[0].n===2&&r.j[0].pending===0&&r.j[0].lanes.length===2);
   await new Promise(r=>setTimeout(r,16500));t('partner invite e-mail delivered (SMTP)',MAILS.some(m=>m.to==='rates@seastar.cn'&&Buffer.from((m.body||'').split('\n\n').slice(1).join('').replace(/[^A-Za-z0-9+/=]/g,''),'base64').toString('utf8').includes('/r/'+PT)));}
  {for(const [d,v] of [['2026-09-18',4200],['2026-09-25',4100],['2026-10-02',4000]])await api('/api/live/indices/manual',{method:'POST',body:{series:'ccfi',line:'PERSIAN_GULF_RED_SEA',date:d,value:v}},T);
   r=await api('/api/reports/market',{},T);const pg=(r.j.rows||[]).find(x=>x.line==='PERSIAN_GULF_RED_SEA');t('weekly report: index rows with weekly change',r.s===200&&pg&&pg.value===4000&&pg.w===-2.44&&/CCFI خلیج فارس/.test(r.j.text));
   t('weekly report: partner lane medians',r.j.lanes.some(l=>l.pol==='Shanghai'&&l.median===1850));
   const hr=await fetch(B+'/api/reports/market?format=html&t='+T);const ht=await hr.text();t('weekly report: HTML version',hr.status===200&&/text\/html/.test(hr.headers.get('content-type'))&&ht.includes('گزارش هفتگی بازار حمل'));
   await api('/api/notify/rules',{method:'POST',body:{event:'market.weekly',channel:'log',target:'-',template:'{{text}}'}},T);r=await api('/api/reports/market/send',{method:'POST'},T);const ob=(await api('/api/notify/outbox',{},T)).j;t('weekly report: sent via notification rules',r.j.queued>=1&&ob.some(o=>o.event==='market.weekly'&&/CCFI/.test(o.text)))}
  {r=await api('/api/live/quote-ref?o=Shanghai&oc=CN&d=Bandar%20Abbas&dc=IR&eq=40HC',{},T);t('quote-ref: connectors respect config (offline)',r.s===200&&Array.isArray(r.j.providers)&&r.j.available.freightos===false);
   const M=require('../server.js');const F=M.p3.parseFreightos({response:{estimatedFreightRates:{mode:{mode:'FCL',price:{min:{moneyAmount:{amount:1500,currency:'USD'}},max:{moneyAmount:{amount:1800,currency:'USD'}}},transitTimes:{unit:'days',min:20,max:30}},numQuotes:1}}});t('parser: Freightos estimator',F.length===1&&F[0].min===1500&&F[0].days[1]===30);
   t('parser: RFC2047 + quoted-printable MIME',M.p3.rfc2047(subj)==='نرخ هفتگی شانگهای'&&M.p3.mailExtract(RAW).text.includes('USD 1,950'))}
  {r=await api('/api/rates/inbox/poll',{method:'POST'},T);t('IMAP inbox: unseen mail fetched',r.s===200&&r.j.new===1);r=await api('/api/rates/inbox/poll',{method:'POST'},T);t('IMAP inbox: de-duplicated by Message-ID',r.j.new===0);
   r=await api('/api/rates/inbox',{},T);const m=r.j[0];t('IMAP inbox: subject decoded + attachment listed',m&&m.subject==='نرخ هفتگی شانگهای'&&m.atts[0].name==='rates.csv');
   r=await api('/api/rates/inbox/'+m.id,{},T);t('IMAP inbox: body + CSV attachment text',r.j.text.includes('Shanghai - Bandar Abbas 40HQ USD 1,950')&&r.j.atts[0].text.includes('Ningbo,Bandar Abbas,1880'));
   await api('/api/rates/inbox/'+m.id,{method:'POST',body:{status:'done'}},T);t('IMAP inbox: mark processed',(await api('/api/rates/inbox',{},T)).j.length===0)}
  if(LIVE){r=await api('/api/live/fx');t('live fx (official + market)',r.s===200&&r.j.rates.EUR>0);
   r=await api('/api/live/roads');t('live road weather ('+(r.j.points||[]).length+' points)',r.s===200&&r.j.points.length>20);
   r=await api('/api/live/matrix',{method:'POST',body:{points:[[35.69,51.39],[27.18,56.27]]}});t('live road distance Tehran→Bandar Abbas '+(r.j.km&&r.j.km[0][1])+' km',r.s===200&&r.j.km[0][1]>1000);
   r=await api('/api/live/indices/refresh',{method:'POST'},T);const sr=r.j.series||{};t('live indices: '+Object.keys(sr).map(k=>k+' '+(sr[k].date||'')).join(', ')+(Object.keys(r.j.errors||{}).length?' · errors: '+Object.keys(r.j.errors).join(','):''),r.s===200&&sr.ccfi&&sr.ccfi.lines.some(l=>l.k==='PERSIAN_GULF_RED_SEA')&&Object.keys(sr).length>=3)}
 }catch(e){fail++;console.error(e)}
 {const h=fs.readFileSync(path.join(__dirname,'..','public','index.html'),'utf8');t('domestic tariff client embedded (v15.8)',['function dtCalc(','function rDomOld(','function dmCalc0(','get domestic(){return dtApi}',"'domestic.tariff':['",'function dtImp('].every(x=>h.includes(x))&&/const IFA=\{version:'15\.(?:[8-9]|1\d)(?:\.\d+)?'/.test(h));
  const a=h.indexOf('const DTKT='),b=h.indexOf('const dtStore=');const dtK=new Function(h.slice(a,b)+';return dtK')();
  t('official distance factors reproduce 1405 & 1404 tables',Math.abs(dtK(150)*16680/10-654300)<1&&Math.abs(dtK(1000)*16680/10-2069800)<1&&Math.abs(dtK(100)*11040/10-315450)/315450<.002&&dtK(1025)>dtK(1000)&&dtK(2100)>dtK(2000))}
 {const h=fs.readFileSync(path.join(__dirname,'..','public','index.html'),'utf8');t('market module embedded',h.includes('function rMkt(')&&/const IFA=\{version:'15\.(?:[5-9]|1\d)(?:\.\d+)?'/.test(h)&&h.includes("{k:'mkt',"));t('phase-2 market tools embedded (surcharges, forecast, thresholds, D&D, land)',['function mkSurCalc(','function mkForecast(','function mkWatchRun(','function mkLand(','landed=function(C,src,P)',"'rate.threshold':["].every(x=>h.includes(x)));t('live O→D quote module embedded',h.includes('function rLq(')&&/const IFA=\{version:'15\.(?:[6-9]|1\d)(?:\.\d+)?'/.test(h)&&h.includes('window.__IFA_LF?window.__IFA_LF(e,t,r,n,o,')&&h.includes('window.__IFA_RATES=[i,s]')&&h.includes('F=(window.__IFA_LD=L.from,ZR(')&&h.includes("{k:'lq',"));t('phase-3 client embedded (v15.7: partners, weekly report, inbox, quote refs)',/const IFA=\{version:'15\.(?:[7-9]|1\d)(?:\.\d+)?'/.test(h)&&['async function mkPrt(','async function mkRep(','async function mkInbox(','async function lqRef(',"prt:mkPrt","'market.weekly':["].every(x=>h.includes(x)));const m=h.match(/const EKO_B64='([^']+)'/);t('china ecosystem dataset embedded',!!m);
  if(m){const J=JSON.parse(zlib.gunzipSync(Buffer.from(m[1],'base64')).toString('utf8'));const c={};J.d.forEach(r=>c[r[1]]=(c[r[1]]||0)+1);
   t('china ecosystem: 6981 entities / 12 layers',J.d.length===6981&&Object.keys(c).length===12&&c.FF===4507&&c.RT===666&&c.RG===81);
   t('china ecosystem: verification 1129/5652/200, corridor 447',J.d.filter(r=>r[15]==='V').length===1129&&J.d.filter(r=>r[15]==='P').length===5652&&J.d.filter(r=>r[15]==='U').length===200&&J.d.filter(r=>r[17]).length===447);
   t('china ecosystem: sources on every row, 7 corridor claims',J.d.every(r=>r[12].length>0)&&J.claims.length===7&&J.d.some(r=>r[0]==='IN-0104'))}}
 srv.kill("SIGTERM");smtp.close();imapS.close();feedS.close();console.log(`\n${ok} passed, ${fail} failed`);fs.rmSync(dir,{recursive:true,force:true});process.exit(fail?1:0)})();
