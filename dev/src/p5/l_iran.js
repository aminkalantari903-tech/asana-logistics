/* =====================================================================
   v1.12 IRAN DATA — کانال‌های نرخ (تلگرام/بله)، کتاب تعرفهٔ گمرک ایران + نرخ ارز گمرکی، تعرفه‌های بندری سازمان بنادر
   ===================================================================== */
PERM['tariff.manage']=['admin','manager','finance','ops'];PERM['rates.channels']=['admin','manager','ops','sales'];
db.exec(`CREATE TABLE IF NOT EXISTS rc_items(id INTEGER PRIMARY KEY,src TEXT,srcname TEXT,msgid TEXT,date TEXT,text TEXT,pol TEXT,pod TEXT,eq TEXT,amt REAL,cur TEXT,usd REAL,valid TEXT,days INTEGER,free INTEGER,conf REAL,dev REAL,status TEXT,why TEXT,rate TEXT,ts INTEGER,by TEXT);
CREATE UNIQUE INDEX IF NOT EXISTS ux_rc ON rc_items(msgid,eq,amt);CREATE INDEX IF NOT EXISTS ix_rc_st ON rc_items(status,ts);
CREATE TABLE IF NOT EXISTS tariff_ir(hs TEXT PRIMARY KEY,desc TEXT,duty REAL,suq TEXT,prio TEXT);
CREATE TABLE IF NOT EXISTS port_tariff(id INTEGER PRIMARY KEY,port TEXT,item TEXT,name TEXT,eq TEXT,unit TEXT,amt REAL,cur TEXT,d_from INTEGER,d_to INTEGER,free INTEGER,note TEXT);
CREATE INDEX IF NOT EXISTS ix_pt_port ON port_tariff(port);`);
const irOff=k=>/(^|,)(all|iran|chan)(,|$)/.test(String(process.env.IFA_LIVE_OFF||''))&&(k==='net');
/* ---------- table readers: CSV/TSV and a minimal XLSX (zip + sheet XML) without dependencies ---------- */
const xDec=s=>String(s).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&#x([0-9a-f]+);/gi,(_,h)=>String.fromCodePoint(parseInt(h,16))).replace(/&#(\d+);/g,(_,d)=>String.fromCodePoint(+d)).replace(/&nbsp;/g,' ').replace(/&amp;/g,'&');
function unzipX(buf){const z=require('zlib');let e=buf.length-22;while(e>=0&&buf.readUInt32LE(e)!==0x06054b50)e--;if(e<0)throw E(422,'فایل xlsx معتبر نیست (ساختار zip یافت نشد)');const n=buf.readUInt16LE(e+10);let p=buf.readUInt32LE(e+16);const out={};
 for(let i=0;i<n&&p+46<=buf.length;i++){if(buf.readUInt32LE(p)!==0x02014b50)break;const m=buf.readUInt16LE(p+10),cs=buf.readUInt32LE(p+20),fl=buf.readUInt16LE(p+28),xl=buf.readUInt16LE(p+30),cl=buf.readUInt16LE(p+32),lo=buf.readUInt32LE(p+42);const name=buf.toString('utf8',p+46,p+46+fl);p+=46+fl+xl+cl;
  out[name]=()=>{const ln=buf.readUInt16LE(lo+26),lx=buf.readUInt16LE(lo+28);const d=buf.subarray(lo+30+ln+lx,lo+30+ln+lx+cs);return m===0?d:z.inflateRawSync(d)}}return out}
function xlsxRows(buf){const Z=unzipX(buf);const rd=n=>Z[n]?Z[n]().toString('utf8'):'';const ss=[];for(const m of rd('xl/sharedStrings.xml').matchAll(/<si>([\s\S]*?)<\/si>/g))ss.push(xDec([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(x=>x[1]).join('')));
 const sheets=Object.keys(Z).filter(n=>/^xl\/worksheets\/sheet\d+\.xml$/.test(n)).sort((a,b)=>+a.match(/(\d+)\.xml/)[1]-+b.match(/(\d+)\.xml/)[1]);if(!sheets.length)throw E(422,'برگه‌ای در فایل xlsx یافت نشد');const rows=[];
 for(const sh of sheets){const x=rd(sh);for(const rm of x.matchAll(/<row\b[^>]*?(?:\/>|>([\s\S]*?)<\/row>)/g)){const row=[];for(const cm of String(rm[1]||'').matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)){const at=cm[1],inner=cm[2]||'';const r=(at.match(/\br="([A-Z]+)\d+"/)||[])[1];const t=(at.match(/\bt="(\w+)"/)||[])[1];
   let v=(inner.match(/<v>([\s\S]*?)<\/v>/)||[])[1];if(t==='s')v=ss[+v];else if(t==='inlineStr')v=xDec([...inner.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(y=>y[1]).join(''));else if(v!=null)v=xDec(v);const ci=r?[...r].reduce((a,c)=>a*26+c.charCodeAt(0)-64,0)-1:row.length;row[ci]=v==null?'':String(v)}
  rows.push(Array.from(row,y=>y==null?'':y))}rows.push([])}return rows}
function csvRows(t){t=String(t||'').replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');const L=t.split('\n').slice(0,6).join('\n');const sep=[',',';','\t','|'].map(s=>[s,L.split(s).length]).sort((a,b)=>b[1]-a[1])[0][0];const R=[];let row=[],f='',qq=false;
 for(let i=0;i<t.length;i++){const c=t[i];if(qq){if(c==='"'){if(t[i+1]==='"'){f+='"';i++}else qq=false}else f+=c}else if(c==='"'&&!f)qq=true;else if(c===sep){row.push(f);f=''}else if(c==='\n'){row.push(f);R.push(row);row=[];f=''}else f+=c}if(f||row.length){row.push(f);R.push(row)}return R}
function tabRows(b){if(b.xlsx){const buf=Buffer.from(String(b.xlsx),'base64');if(buf.length>30e6)throw E(413,'فایل بزرگ‌تر از ۳۰ مگابایت است');return xlsxRows(buf)}const t=String(b.text||'');if(t.length<5)throw E(400,'فایل یا متن جدول خالی است');if(t.length>30e6)throw E(413,'متن بیش از حد بزرگ است');return csvRows(t)}
const nCell=s=>enDig(String(s??'')).replace(/[\u200e\u200f\u202a-\u202e\ufeff]/g,'').trim();
const nNum=s=>{const t=nCell(s).replace(/[٪%\s]/g,'').replace(/,/g,'');return /^-?\d+(\.\d+)?$/.test(t)?+t:null};
/* =====================================================================
   1) کتاب تعرفهٔ گمرک ایران + نرخ ارز گمرکی
   ===================================================================== */
const TBH={hs:/(کد|ردیف|شماره)\s*(?:ی\s*)?(تعرفه|کالا)|tariff\s*(code|no|line)?|^hs(\s*code)?$|^کد$/i,desc:/شرح|description|^desc|نام\s*کالا/i,duty:/حقوق\s*ورودی|سود\s*بازرگانی|duty|^نرخ|rate|درصد/i,suq:/suq|واحد/i,prio:/اولویت|گروه\s*کالا|priority/i};
const tbCode=s=>{const d=nCell(s).replace(/[\s.\-\/]/g,'');return /^\d{6,10}$/.test(d)?d:null};
function tbParse(rows){let ci=null;const out=[];let skipped=0;const seen=new Set();
 for(const r0 of rows){const r=(r0||[]).map(nCell);if(!r.some(Boolean))continue;
  const hh=r.findIndex(c=>TBH.hs.test(c)),hd=r.findIndex((c,i)=>i!==hh&&TBH.duty.test(c));if(hh>=0&&hd>=0&&!r.some(c=>tbCode(c))){ci={hs:hh,duty:hd,desc:r.findIndex((c,i)=>i!==hh&&TBH.desc.test(c)),suq:r.findIndex((c,i)=>i!==hh&&i!==hd&&TBH.suq.test(c)),prio:r.findIndex((c,i)=>i!==hh&&i!==hd&&TBH.prio.test(c))};continue}
  let hi=ci?ci.hs:-1;let hs=hi>=0?tbCode(r[hi]):null;if(!hs){hi=r.findIndex(c=>tbCode(c));hs=hi>=0?tbCode(r[hi]):null}if(!hs){skipped++;continue}
  let duty=ci&&ci.duty>=0?nNum(r[ci.duty]):null;if(duty==null)for(let i=hi+1;i<r.length;i++){const v=nNum(r[i]);if(v!=null&&v>=0&&v<=400&&!tbCode(r[i])){duty=v;break}}if(duty==null||duty<0||duty>400){skipped++;continue}
  let desc=ci&&ci.desc>=0?r[ci.desc]:'';if(!desc)desc=r.filter((c,i)=>i!==hi&&nNum(c)==null).sort((a,b)=>b.length-a.length)[0]||'';
  if(seen.has(hs)){skipped++;continue}seen.add(hs);out.push({hs,desc:desc.slice(0,400),duty,suq:ci&&ci.suq>=0?r[ci.suq].slice(0,16):'',prio:ci&&ci.prio>=0?r[ci.prio].slice(0,10):''})}
 return {rows:out,skipped,header:!!ci}}
function tbLook(hs){const d=String(hs||'').replace(/\D/g,'');if(d.length<4)return null;const ex=q1('SELECT * FROM tariff_ir WHERE hs=?',d);if(ex)return {match:'exact',...ex};
 for(let l=d.length-1;l>=6;l--){const r=q1('SELECT * FROM tariff_ir WHERE hs=?',d.slice(0,l));if(r)return {match:'parent',...r}}
 const rng=K=>{const v=K.map(k=>k.duty);return [Math.min(...v),Math.max(...v)]};
 const kids=q('SELECT * FROM tariff_ir WHERE hs LIKE ? ORDER BY hs LIMIT 40',d+'%');if(kids.length)return {match:kids.length===1?'child':'children',...kids[0],range:rng(kids),children:kids};
 const sib=d.length>6?q('SELECT * FROM tariff_ir WHERE hs LIKE ? ORDER BY hs LIMIT 40',d.slice(0,6)+'%'):[];if(sib.length)return {match:'sibling',...sib[0],range:rng(sib),children:sib};return null}
const tbMeta=()=>({...(kvGet('tb:meta')||{}),n:(q1('SELECT COUNT(*) n FROM tariff_ir')||{}).n||0});
const CFX0={rates:{},date:null,src:'',note:'',vat:10,hl:1};
const cfxGet=()=>({...CFX0,...(kvGet('tb:cfx')||{})});
async function cfxRefresh(by='scheduler'){const url=process.env.IFA_CUSTOMS_FX_URL;if(!url)throw E(501,'منبع خودکار نرخ ارز گمرکی پیکربندی نشده است (IFA_CUSTOMS_FX_URL)؛ نرخ را دستی ثبت کنید');if(irOff('net'))throw E(503,'دریافت شبکه‌ای خاموش است (IFA_LIVE_OFF)');
 const j=JSON.parse(await getT(url,{timeout:20000}));const R=j.rates||j;const rates={};for(const [k,v] of Object.entries(R||{}))if(/^[A-Z]{3}$/.test(k)&&+v>0)rates[k]=+v;if(!rates.USD)throw E(502,'پاسخ منبع نرخ ارز گمرکی شامل USD نیست');
 const C={...cfxGet(),rates,date:j.date||agToday(),src:'url: '+url.replace(/\?.*/,'').slice(0,80),by,at:Date.now()};kvPut('tb:cfx',C,by);lstat('customsFx',true);return C}
function tbCalc(b){const C=cfxGet();const cur=/^[A-Z]{3}$/.test(b.cur)?b.cur:'USD';const T=b.hs?tbLook(b.hs):null;const rate=b.rate!=null&&b.rate!==''?+b.rate:T&&T.match!=='children'&&T.match!=='sibling'?T.duty:null;
 if(rate==null)throw E(404,'نرخ حقوق ورودی برای این کد در کتاب تعرفه یافت نشد؛ نرخ را دستی بدهید');const fx=+b.fx>0?+b.fx:+C.rates[cur]||(cur!=='USD'&&C.rates.USD?null:null);if(!fx)throw E(422,'نرخ ارز گمرکی برای '+cur+' ثبت نشده است');
 const cif=(+b.cif>0?+b.cif:(+b.fob||0)+(+b.fr||0)+(+b.ins||0));if(!(cif>0))throw E(400,'ارزش CIF لازم است');const vatP=b.vat!=null?+b.vat:+C.vat,hlP=b.hl!=null?+b.hl:+C.hl;
 const cv=cif*fx,duty=cv*rate/100,hl=duty*hlP/100,vat=(cv+duty)*vatP/100,total=duty+hl+vat;
 return {hs:b.hs||null,tariff:T,rate,cur,fx,fxDate:C.date,cif,customsValueIRR:Math.round(cv),dutyIRR:Math.round(duty),hlIRR:Math.round(hl),vatIRR:Math.round(vat),totalIRR:Math.round(total),effectivePct:cv?+(total/cv*100).toFixed(2):0,vatPct:vatP,hlPct:hlP,
  note:'حقوق ورودی = ارزش گمرکی (CIF × نرخ ارز گمرکی) × نرخ کتاب تعرفه؛ هلال احمر درصدی از حقوق ورودی؛ ارزش افزوده روی (ارزش گمرکی + حقوق ورودی). عوارض خاص، مشوق‌ها و معافیت‌های موردی محاسبه نشده‌اند.'}}
route('GET','/api/tariff/ir',(req,u,P,Q)=>{const qs=new URL(req.url,'http://x').searchParams;const hs=qs.get('hs'),qq=String(qs.get('q')||'').trim();const meta=tbMeta();
 if(hs)return {meta,result:tbLook(hs)};if(qq.length>=2){const d=qq.replace(/\D/g,'');const L=d.length>=4&&d.length===qq.replace(/[\s.]/g,'').length?q('SELECT * FROM tariff_ir WHERE hs LIKE ? ORDER BY hs LIMIT 40',d+'%'):q('SELECT * FROM tariff_ir WHERE desc LIKE ? ORDER BY hs LIMIT 40','%'+qq.slice(0,60)+'%');return {meta,results:L}}return {meta,fx:cfxGet()}},'');
route('POST','/api/tariff/ir/import',async(req,u)=>{const b=await body(req);const P=tbParse(tabRows(b));if(!P.rows.length)throw E(422,'هیچ ردیف تعرفه‌ای شناسایی نشد. ستون‌های لازم: کد تعرفه (۸ رقمی) و حقوق ورودی (درصد)'+(P.skipped?' · '+P.skipped+' ردیف نامعتبر':''));
 const replace=b.mode!=='merge';db.exec('BEGIN');try{if(replace)run('DELETE FROM tariff_ir');const st=db.prepare('INSERT OR REPLACE INTO tariff_ir(hs,desc,duty,suq,prio) VALUES(?,?,?,?,?)');for(const r of P.rows)st.run(r.hs,r.desc,r.duty,r.suq,r.prio);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}
 const meta={label:String(b.label||'').slice(0,80)||'کتاب تعرفه',file:String(b.name||'').slice(0,120),at:Date.now(),by:u.username,mode:replace?'replace':'merge',imported:P.rows.length,skipped:P.skipped};kvPut('tb:meta',meta,u.username);audit(u.username,'','tariff.import','tariff_ir',meta.label,{n:P.rows.length});fire('tariff.imported',{n:P.rows.length,label:meta.label});
 return {ok:true,...tbMeta(),imported:P.rows.length,skipped:P.skipped,header:P.header,sample:P.rows.slice(0,5)}},'tariff.manage');
route('POST','/api/tariff/ir/calc',async req=>tbCalc(await body(req)),'');
route('GET','/api/tariff/fx',()=>({...cfxGet(),auto:!!process.env.IFA_CUSTOMS_FX_URL}),'');
route('PUT','/api/tariff/fx',async(req,u)=>{const b=await body(req);const C=cfxGet();if(b.rates&&typeof b.rates==='object'){const R={};for(const [k,v] of Object.entries(b.rates))if(/^[A-Z]{3}$/.test(k)&&+v>0)R[k]=+v;if(Object.keys(b.rates).length&&!R.USD)throw E(400,'نرخ دلار (USD) لازم است');C.rates=R;C.src='دستی · '+u.username;C.date=/^\d{4}-\d\d-\d\d$/.test(b.date)?b.date:agToday()}
 if(b.vat!=null){const v=+b.vat;if(!(v>=0&&v<=30))throw E(400,'نرخ ارزش افزوده نامعتبر');C.vat=v}if(b.hl!=null){const v=+b.hl;if(!(v>=0&&v<=10))throw E(400,'درصد هلال احمر نامعتبر');C.hl=v}if(b.note!=null)C.note=String(b.note).slice(0,200);C.by=u.username;C.at=Date.now();kvPut('tb:cfx',C,u.username);audit(u.username,'','tariff.fx','cfx',C.date||'',C.rates);return C},'tariff.manage');
route('POST','/api/tariff/fx/refresh',async(req,u)=>cfxRefresh(u.username),'tariff.manage');
/* =====================================================================
   2) تعرفه‌های بندری (سازمان بنادر و دریانوردی) — تخلیه/بارگیری، انبارداری پلکانی، عوارض، برق یخچالی
   ===================================================================== */
const PTP={SHR:['بندر شهید رجایی','IR_BND',/رجایی|بندرعباس|bandar\s*abbas|rajaee|rajaei|shr/i],BAH:['بندر شهید باهنر','IR_BAH',/باهنر|bahonar/i],BIK:['بندر امام خمینی','IR_BIK',/امام|imam|bik/i],BUZ:['بندر بوشهر','IR_BUZ',/بوشهر|bushehr|buz/i],CHB:['بندر چابهار (شهید بهشتی)','IR_CHB',/چابهار|بهشتی|chabahar|chb/i],KHO:['بندر خرمشهر','IR_KHO',/خرمشهر|khorramshahr/i],ASS:['بندر عسلویه','IR_ASS',/عسلویه|assaluyeh/i],LEN:['بندر لنگه','IR_LEN',/لنگه|lengeh/i],QSH:['بندر قشم','IR_QSH',/قشم|qeshm/i],JSK:['بندر جاسک','IR_JSK',/جاسک|jask/i],ANZ:['بندر انزلی','IR_ANZ',/انزلی|anzali/i],AST:['بندر آستارا','IR_ASP',/آستارا|astara/i],AMR:['بندر امیرآباد','IR_AMI',/امیرآباد|amirabad/i],NOW:['بندر نوشهر','IR_NOW',/نوشهر|nowshahr/i],KSP:['بندر کاسپین','IR_KSP',/کاسپین|caspian|kaspian/i],DRY:['بندر خشک / گمرک داخلی','',/خشک|dry/i]};
const ptCode=x=>{const s=nCell(x);if(!s)return null;const u=s.toUpperCase();if(PTP[u])return u;for(const [k,v] of Object.entries(PTP))if(v[1]&&v[1]===u)return k;for(const [k,v] of Object.entries(PTP))if(v[2].test(s))return k;return null};
const PTI=[['handling',/تخلیه|بارگیری|handling|thc|stevedor|ترمینال/i,'تخلیه و بارگیری (THC بندری)'],['storage',/انبار|storage|نگهداری|توقف/i,'انبارداری'],['reefer',/برق|یخچال|reefer|plug/i,'برق کانتینر یخچالی'],['wharfage',/عوارض|حق.?الثبت|wharf|اسکله|بندری/i,'عوارض بندری / حق‌الثبت'],['scan',/ایکس|اسکن|x-?ray|scan/i,'ایکس‌ری / اسکن'],['move',/جابجا|شیفت|shift|move|حمل\s*داخل/i,'جابجایی و شیفتینگ']];
const ptItem=s=>{const t=nCell(s);if(!t)return null;const l=t.toLowerCase();for(const [k] of PTI)if(l===k)return k;for(const [k,re] of PTI)if(re.test(t))return k;return 'other'};
const ptEq=s=>{const t=nCell(s).toUpperCase();return /40|45|HC/.test(t)?'40':/20/.test(t)?'20':'*'};
const ptUnit=s=>{const t=nCell(s);return /روز|day/i.test(t)?'day':/تن|ton/i.test(t)?'ton':/بارنامه|bl\b/i.test(t)?'bl':'box'};
const PTH={port:/بندر|port/i,item:/خدمت|شرح|item|service|عنوان/i,eq:/کانتینر|نوع|eq|size|سایز/i,unit:/واحد|unit/i,amt:/مبلغ|نرخ|تعرفه|amount|rate|ریال/i,cur:/ارز|cur/i,from:/از\s*روز|day.?from|^from$|شروع/i,to:/تا\s*روز|day.?to|^to$|پایان/i,free:/آزاد|free|مهلت/i,note:/توضیح|note|ملاحظات/i};
function ptParse(rows,defPort){let H=null;const out=[];let skipped=0;
 for(const r0 of rows){const r=(r0||[]).map(nCell);if(!r.some(Boolean))continue;
  if(!H&&r.filter(c=>Object.values(PTH).some(re=>re.test(c))).length>=3&&r.some(c=>PTH.amt.test(c))){H={};const used=new Set();for(const k of ['from','to','free','port','item','eq','unit','cur','note','amt']){const i=r.findIndex((c,j)=>!used.has(j)&&PTH[k].test(c));if(i>=0){H[k]=i;used.add(i)}}continue}
  if(!H){skipped++;continue}const g=k=>H[k]!=null?r[H[k]]:'';const amt=nNum(g('amt'));const port=ptCode(g('port'))||ptCode(defPort);const item=ptItem(g('item'));if(!(amt>=0)||amt===null||!port||!item){skipped++;continue}
  const unit=H.unit!=null?ptUnit(g('unit')):item==='storage'||item==='reefer'?'day':'box';
  out.push({port,item,name:(g('item')||PTI.find(x=>x[0]===item)?.[2]||'').slice(0,80),eq:ptEq(g('eq')),unit,amt,cur:/^[A-Z]{3}$/i.test(g('cur'))?g('cur').toUpperCase():/دلار/.test(g('cur'))?'USD':'IRR',d_from:nNum(g('from')),d_to:nNum(g('to')),free:nNum(g('free')),note:g('note').slice(0,160)})}
 return {rows:out,skipped}}
const ptRows=port=>q('SELECT * FROM port_tariff WHERE port=? ORDER BY item,d_from,eq,id',port);
function ptFree(R){const f=R.filter(r=>r.item==='storage'&&r.free!=null).map(r=>r.free);if(f.length)return Math.max(...f);const z=R.filter(r=>r.item==='storage'&&!r.amt&&r.d_to);return z.length?Math.max(...z.map(r=>r.d_to)):0}
function ptCalc(b){const port=ptCode(b.port);if(!port)throw E(400,'بندر نامعتبر');const R=ptRows(port);if(!R.length)throw E(404,'تعرفه‌ای برای «'+PTP[port][0]+'» ثبت نشده است');
 const eq=ptEq(b.eq||'40'),qty=Math.max(1,Math.min(500,+b.qty||1)),days=Math.max(0,Math.min(365,Math.round(+b.days||0))),tons=Math.max(0,+b.tons||0),rf=!!b.reefer;const pick=it=>{const A=R.filter(r=>r.item===it);const X=A.filter(r=>r.eq===eq);return X.length?X:A.filter(r=>r.eq==='*')};
 const fx=cfxGet();const lines=[];const free=ptFree(R);
 for(const it of [...new Set(R.map(r=>r.item))]){if(it==='reefer'&&!rf)continue;const A=pick(it);if(!A.length)continue;let tot=0;const det=[];
  if(it==='storage'||it==='reefer'){for(let d=1;d<=days;d++){if(it==='storage'&&d<=free)continue;const t=A.find(r=>(r.d_from==null||d>=r.d_from)&&(r.d_to==null||d<=r.d_to)&&r.unit==='day')||A.filter(r=>r.unit==='day').slice(-1)[0];if(t)tot+=t.amt}det.push(days+' روز'+(it==='storage'?' · '+free+' روز آزاد':''))}
  else for(const r of A){const k=r.unit==='ton'?tons:r.unit==='bl'?1:r.unit==='day'?days*qty:qty;tot+=r.amt*k;det.push((r.name||it)+' × '+k)}
  const cur=A[0].cur||'IRR';lines.push({item:it,name:(PTI.find(x=>x[0]===it)||[0,0,A[0].name||it])[2],amt:Math.round(it==='storage'||it==='reefer'?tot*qty:tot),cur,detail:det.join(' · ')})}
 const irr=lines.filter(l=>l.cur==='IRR').reduce((s,l)=>s+l.amt,0),oth=lines.filter(l=>l.cur!=='IRR');
 return {port,name:PTP[port][0],eq,qty,days,free,lines,totalIRR:irr,other:oth,meta:(kvGet('pt:meta')||{})[port]||null}}
const DDT0=[[6,1500000,3000000],[10,3000000,6000000],[999,6000000,12000000]];
function ptSyncDD(by){const P0=kvGet('ifa-dd-ports');const base=['SHR','BIK','BUZ','CHB','ANZ','AMR','AST','DRY'];const P=Array.isArray(P0)&&P0.length?P0.slice():base.map(id=>({id,n:PTP[id][0],free:4,t:JSON.parse(JSON.stringify(DDT0)),plug:4000000}));let n=0;
 for(const {port} of q("SELECT DISTINCT port FROM port_tariff WHERE item='storage'")){const R=ptRows(port);const S=R.filter(r=>r.item==='storage'&&r.unit==='day'&&r.amt>0&&(r.cur||'IRR')==='IRR');if(!S.length)continue;const free=ptFree(R);
  const bands=[...new Set(S.map(r=>(r.d_from||free+1)+'-'+(r.d_to||999)))].map(k=>k.split('-').map(Number)).sort((a,b)=>a[0]-b[0]);const t=[];
  for(const [f,to] of bands){const v=e=>{const x=S.find(r=>(r.d_from||free+1)===f&&(r.d_to||999)===to&&(r.eq===e||r.eq==='*'));return x?x.amt:0};const len=to>=999?999:Math.max(1,to-Math.max(f,free+1)+1);t.push([len,v('20')||v('40')/2,v('40')||v('20')*2])}
  const rf=R.find(r=>r.item==='reefer'&&r.unit==='day');const o={id:port,n:PTP[port][0],free,t,plug:rf?rf.amt:4000000,src:'تعرفهٔ بندری واردشده'};const i=P.findIndex(p=>p.id===port);if(i>=0)P[i]={...P[i],...o};else P.push(o);n++}
 if(n)kvPut('ifa-dd-ports',P,by);return n}
route('GET','/api/ports/tariff',(req)=>{const qs=new URL(req.url,'http://x').searchParams;const port=ptCode(qs.get('port')||'');const M=kvGet('pt:meta')||{};
 const ports=Object.entries(PTP).map(([id,v])=>({id,name:v[0],node:v[1],n:(q1('SELECT COUNT(*) n FROM port_tariff WHERE port=?',id)||{}).n||0,meta:M[id]||null}));return port?{port,name:PTP[port][0],rows:ptRows(port),meta:M[port]||null,ports}:{ports}},'');
route('POST','/api/ports/tariff/import',async(req,u)=>{const b=await body(req);const P=ptParse(tabRows(b),b.port);if(!P.rows.length)throw E(422,'هیچ ردیف تعرفه‌ای شناسایی نشد. سطر عنوان با ستون‌های «بندر، خدمت، کانتینر، واحد، مبلغ، از روز، تا روز، روز آزاد» لازم است'+(P.skipped?' · '+P.skipped+' ردیف نامعتبر':''));
 const ports=[...new Set(P.rows.map(r=>r.port))];const M=kvGet('pt:meta')||{};db.exec('BEGIN');try{for(const p of ports)if(b.mode!=='merge')run('DELETE FROM port_tariff WHERE port=?',p);const st=db.prepare('INSERT INTO port_tariff(port,item,name,eq,unit,amt,cur,d_from,d_to,free,note) VALUES(?,?,?,?,?,?,?,?,?,?,?)');for(const r of P.rows)st.run(r.port,r.item,r.name,r.eq,r.unit,r.amt,r.cur,r.d_from,r.d_to,r.free,r.note);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}
 for(const p of ports)M[p]={label:String(b.label||'').slice(0,80)||'تعرفهٔ سازمان بنادر',at:Date.now(),by:u.username,n:P.rows.filter(r=>r.port===p).length};kvPut('pt:meta',M,u.username);const dd=ptSyncDD(u.username);audit(u.username,'','ports.tariff.import','port_tariff',ports.join(','),{n:P.rows.length});
 return {ok:true,imported:P.rows.length,skipped:P.skipped,ports,ddSynced:dd}},'tariff.manage');
route('DELETE','/api/ports/tariff',(req,u)=>{const port=ptCode(new URL(req.url,'http://x').searchParams.get('port')||'');if(!port)throw E(400,'بندر نامعتبر');const r=run('DELETE FROM port_tariff WHERE port=?',port);const M=kvGet('pt:meta')||{};delete M[port];kvPut('pt:meta',M,u.username);return {ok:true,removed:r.changes}},'tariff.manage');
route('POST','/api/ports/tariff/calc',async req=>ptCalc(await body(req)),'');
/* =====================================================================
   3) کانال‌های نرخ تلگرام و بله — دریافت خودکار، استخراج، سنجش با بازار، افزودن خودکار یا صف بازبینی
   ===================================================================== */
const RC0={on:true,every:30,autoMin:0.75,maxDev:0.3,maxAge:7,sources:[]};
const rcCfg=()=>{const c={...RC0,...(kvGet('rc:cfg')||{})};c.sources=Array.isArray(c.sources)?c.sources:[];return c};
const rcHandle=s=>String(s||'').trim().replace(/^https?:\/\/(t\.me|telegram\.me|ble\.ir)\/(s\/)?/i,'').replace(/^@/,'').replace(/[/?#].*$/,'').slice(0,64);
function tgParse(html){const out=[];for(const p of String(html||'').split(/data-post="/).slice(1)){const m=p.match(/^([^"\/]+)\/(\d+)"/);if(!m)continue;const tx=p.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/);if(!tx)continue;
 const text=xDec(tx[1].replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,'')).trim();const dt=(p.match(/<time[^>]*datetime="([^"]+)"/)||[])[1]||null;if(text)out.push({n:+m[2],text,date:dt})}return out}
function rcSrcFor(C,h,title,ch){h=String(h||'').toLowerCase();const s=C.sources.find(s=>s.kind==='bot'&&s.on!==false&&((h&&rcHandle(s.handle).toLowerCase()===h)||(s.handle&&title&&String(title).includes(s.handle))));return s||{id:'bot-'+ch,kind:'bot',name:title||ch,trust:false,auto:false}}
function rcAddRate(it,src,by){const A0=kvGet('ifa-rates');const A=Array.isArray(A0)?A0:[];const id='CH-'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
 A.unshift({id,mode:'sea',vendor:String(src.name||'کانال').slice(0,80),pol:it.pol||'',pod:it.pod||'',eq:it.eq||'',amt:+it.amt,cur:it.cur||'USD',from:agToday(),to:it.valid||'',src:'channel',incl:'',note:['کانال '+String(src.name||'').slice(0,60),it.days?'T/T '+it.days+'d':'',it.free?'free '+it.free+'d':''].filter(Boolean).join(' · '),t:Date.now()});kvPut('ifa-rates',A,by);return id}
function rcIngest(m,C,by){const src=m.src||{id:'manual',name:'ورودی دستی',trust:false,auto:false};const text=String(m.text||'').slice(0,8000);const res={n:0,auto:0,pending:0,items:[]};if(text.trim().length<8)return res;
 const R=qxText(text,{vendor:src.name,ref:'ch:'+m.key,src:'channel'});const age=m.date?Date.now()-Date.parse(m.date):0;const inj=R.injection&&R.injection.length;
 for(const x of (R.quotes||[]).slice(0,20)){if(!(+x.amt>0))continue;const usd=x.usd||null;const b=usd&&x.pol&&x.pod?benchOne(usd,{pol:x.pol,pod:x.pod,eq:x.eq}):{};const dev=b&&b.median?usd/b.median-1:null;const why=[];
  if(!x.pol||!x.pod)why.push('مبدأ یا مقصد مشخص نیست');if((x.conf||0)<C.autoMin)why.push('اطمینان استخراج '+Math.round((x.conf||0)*100)+'٪');if(dev!=null&&Math.abs(dev)>C.maxDev)why.push('انحراف '+Math.round(dev*100)+'٪ از میانهٔ بازار');if(!usd)why.push('تبدیل به دلار ممکن نشد');
  if(x.valid&&x.valid<agToday())why.push('اعتبار گذشته');if(age>C.maxAge*864e5)why.push('پیام قدیمی‌تر از '+C.maxAge+' روز');if(inj)why.push('متن مشکوک به دستور');if(!src.trust)why.push('منبع تأییدنشده');else if(!src.auto)why.push('افزودن خودکار برای این منبع خاموش است');
  const ok=!why.length;let r;try{r=run('INSERT INTO rc_items(src,srcname,msgid,date,text,pol,pod,eq,amt,cur,usd,valid,days,free,conf,dev,status,why,rate,ts,by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',String(src.id||''),String(src.name||'').slice(0,80),String(m.key),m.date||null,text.slice(0,2000),x.pol||'',x.pod||'',x.eq||'',+x.amt,x.cur||'USD',usd,x.valid||null,x.days||null,x.free||null,x.conf||0,dev==null?null:+dev.toFixed(3),ok?'auto':'pending',why.join(' · '),null,Date.now(),by)}catch(e){continue}
  const id=Number(r.lastInsertRowid);res.n++;if(ok){const rid=rcAddRate(x,src,by);run('UPDATE rc_items SET rate=? WHERE id=?',rid,id);res.auto++}else res.pending++;res.items.push({id,pol:x.pol,pod:x.pod,eq:x.eq,amt:+x.amt,cur:x.cur,usd,dev,status:ok?'auto':'pending',why})}
 return res}
let RCBUSY=false;
async function rcPoll(by='scheduler'){if(RCBUSY)return {busy:true};RCBUSY=true;try{const C=rcCfg();const st=kvGet('rc:st')||{};const res={msgs:0,quotes:0,auto:0,pending:0,errors:[],at:Date.now()};const msgs=[];const net=!irOff('net');
 if(net){const tg=kvGet('ag:tg')||{};
  for(const [ch,base,tok] of [['bale',process.env.IFA_BALE_API||'https://tapi.bale.ai/bot',CFG.bale&&CFG.bale.token],['telegram',process.env.IFA_TG_API||'https://api.telegram.org/bot',CFG.telegram&&CFG.telegram.token]]){if(!tok)continue;
   try{const r=await fetch(base+tok+'/getUpdates?timeout=0&offset='+((tg[ch]||0)+1),{signal:AbortSignal.timeout(20000)});const j=await r.json();if(j.ok===false)throw new Error(j.description||'getUpdates');
    for(const u of j.result||[]){tg[ch]=Math.max(tg[ch]||0,u.update_id);const m=u.message||u.channel_post;if(!m||!(m.text||m.caption))continue;const chat=m.forward_from_chat||m.chat||{};const title=chat.title||(m.from&&(m.from.username||m.from.first_name))||ch;const key=ch+'-'+u.update_id;const text=String(m.text||m.caption);
     if(!q1('SELECT id FROM inbox WHERE msgid=?',key))run('INSERT INTO inbox(msgid,uid,sender,subject,date,text,atts,status,ts) VALUES(?,?,?,?,?,?,?,?,?)',key,u.update_id,title,ch==='bale'?'پیام بله':'پیام تلگرام',new Date((m.date||0)*1000).toISOString(),text.slice(0,20000),'[]','new',Date.now());
     msgs.push({key,src:rcSrcFor(C,chat.username,title,ch),date:new Date((m.date||0)*1000).toISOString(),text})}}catch(e){res.errors.push(ch+': '+String(e.message).slice(0,100))}}
  kvPut('ag:tg',tg,'rates');
  for(const s of C.sources.filter(s=>s.on!==false&&s.kind==='tg'&&s.handle)){const h=rcHandle(s.handle);try{const P=tgParse(await getT((process.env.IFA_TG_WEB||'https://t.me/s/')+encodeURIComponent(h),{timeout:20000}));if(!P.length)throw new Error('پستی یافت نشد (کانال خصوصی است یا پیش‌نمایش وب ندارد)');const last=+st['n:'+s.id]||0;
    for(const p of P)if(p.n>last)msgs.push({key:'tg-'+h+'-'+p.n,src:s,date:p.date,text:p.text});st['n:'+s.id]=Math.max(last,...P.map(p=>p.n));st['e:'+s.id]=null;st['t:'+s.id]=Date.now()}catch(e){res.errors.push(h+': '+String(e.message).slice(0,100));st['e:'+s.id]=String(e.message).slice(0,140)}}}
 for(const m of msgs){const r=rcIngest(m,C,by);res.msgs++;res.quotes+=r.n;res.auto+=r.auto;res.pending+=r.pending}
 if(!net)res.errors.push('دریافت شبکه‌ای خاموش است (IFA_LIVE_OFF)');st.at=Date.now();st.last=res;kvPut('rc:st',st,'rates');lstat('rateChannels',!res.errors.length||res.msgs>0,res.errors[0]);
 if(res.auto)_fire0('rates.imported',{n:res.auto,src:'channel'});if(res.pending)fire('rates.inbox',{n:res.pending,src:'channel'},'rcq|'+new Date().toISOString().slice(0,13));return res}finally{RCBUSY=false}}
tool('chat_poll',{d:'دریافت پیام‌های تازهٔ ربات بله/تلگرام و کانال‌های عمومی نرخ؛ نرخ‌های معتبر از منابع مورد اعتماد خودکار به بانک نرخ افزوده و بقیه در صف بازبینی قرار می‌گیرند',taint:true,run:async()=>rcPoll('agent')});
route('GET','/api/ratech',()=>{const C=rcCfg();const st=kvGet('rc:st')||{};const items=q('SELECT id,src,srcname,msgid,date,substr(text,1,400) text,pol,pod,eq,amt,cur,usd,valid,days,free,conf,dev,status,why,rate,ts FROM rc_items ORDER BY id DESC LIMIT 150');
 const cnt={};for(const r of q('SELECT status,COUNT(*) n FROM rc_items GROUP BY status'))cnt[r.status]=r.n;return {cfg:{...C,sources:C.sources.map(s=>({...s,last:st['t:'+s.id]||null,err:st['e:'+s.id]||null,lastPost:st['n:'+s.id]||null}))},status:{at:st.at||null,last:st.last||null,bots:{bale:!!(CFG.bale&&CFG.bale.token),telegram:!!(CFG.telegram&&CFG.telegram.token)},web:process.env.IFA_TG_WEB||'https://t.me/s/',net:!irOff('net')},counts:cnt,items}},'');
route('PUT','/api/ratech/cfg',async(req,u)=>{const b=await body(req);const C=rcCfg();if(b.on!=null)C.on=!!b.on;if(b.every!=null)C.every=Math.max(5,Math.min(1440,+b.every||30));if(b.autoMin!=null)C.autoMin=Math.max(0.3,Math.min(1,+b.autoMin));if(b.maxDev!=null)C.maxDev=Math.max(0.05,Math.min(2,+b.maxDev));if(b.maxAge!=null)C.maxAge=Math.max(1,Math.min(60,+b.maxAge));
 if(Array.isArray(b.sources))C.sources=b.sources.slice(0,40).map((s,i)=>({id:String(s.id||('s'+Date.now().toString(36)+i)).replace(/[^\w-]/g,'').slice(0,24),kind:s.kind==='bot'?'bot':'tg',handle:rcHandle(s.handle),name:String(s.name||rcHandle(s.handle)).slice(0,60),trust:!!s.trust,auto:!!s.auto,on:s.on!==false})).filter(s=>s.handle||s.kind==='bot');
 kvPut('rc:cfg',C,u.username);audit(u.username,'','ratech.cfg','rc',String(C.sources.length),null);return C},'rates.channels');
route('POST','/api/ratech/poll',async(req,u)=>rcPoll(u.username),'rates.channels');
route('POST','/api/ratech/ingest',async(req,u)=>{const b=await body(req);const C=rcCfg();const s=C.sources.find(x=>x.id===b.source)||{id:'manual',name:String(b.name||'ورودی دستی').slice(0,60),trust:false,auto:false};const r=rcIngest({key:'man-'+sha(String(b.text||'')).slice(0,12),src:s,date:new Date().toISOString(),text:b.text},C,u.username);if(r.auto)_fire0('rates.imported',{n:r.auto,src:'channel'});return r},'rates.channels');
route('POST','/api/ratech/items/:id',async(req,u,P)=>{const b=await body(req);const it=q1('SELECT * FROM rc_items WHERE id=?',+P.id);if(!it)throw E(404,'یافت نشد');if(it.status!=='pending'&&b.action!=='undo')throw E(409,'این مورد قبلاً بررسی شده است');
 if(b.action==='reject'){run("UPDATE rc_items SET status='rejected',by=? WHERE id=?",u.username,it.id);return {ok:true,status:'rejected'}}
 if(b.action==='approve'){const p=b.patch||{};const x={...it,...Object.fromEntries(Object.entries(p).filter(([k])=>['pol','pod','eq','amt','cur','valid'].includes(k)))};if(!(+x.amt>0)||!x.pol||!x.pod)throw E(400,'مبدأ، مقصد و مبلغ لازم است');const rid=rcAddRate(x,{name:it.srcname},u.username);run("UPDATE rc_items SET status='approved',rate=?,pol=?,pod=?,eq=?,amt=?,cur=?,by=? WHERE id=?",rid,x.pol,x.pod,x.eq,+x.amt,x.cur,u.username,it.id);_fire0('rates.imported',{n:1,src:'channel'});return {ok:true,status:'approved',rate:rid}}
 throw E(400,'عمل نامعتبر')},'rates.channels');
function rcTick(){try{const C=rcCfg();if(!C.on||irOff('net'))return;const st=kvGet('rc:st')||{};const has=C.sources.some(s=>s.on!==false&&s.kind==='tg')||(CFG.bale&&CFG.bale.token)||(CFG.telegram&&CFG.telegram.token);if(!has)return;if(Date.now()-(st.at||0)<C.every*60e3)return;rcPoll('scheduler').catch(e=>console.error('rate channels',e.message))}catch(e){}}
if(require.main===module){setInterval(rcTick,60e3).unref?.();setInterval(()=>{if(process.env.IFA_CUSTOMS_FX_URL&&!irOff('net')){const C=cfxGet();if(Date.now()-(C.at||0)>12*3600e3)cfxRefresh('scheduler').catch(e=>lstat('customsFx',false,e.message))}},30*60e3).unref?.()}
/* connectors registry extension */
function connExtra(st){const C=rcCfg();const tb=tbMeta();const fx=cfxGet();const pm=kvGet('pt:meta')||{};const np=Object.keys(pm).length;
 return [{id:'rateChannels',name:'کانال‌های نرخ تلگرام و بله',mode:'rates',on:C.on&&(C.sources.some(s=>s.on!==false)||!!(CFG.bale&&CFG.bale.token)||!!(CFG.telegram&&CFG.telegram.token)),status:st('rateChannels'),env:C.sources.length+' کانال · ربات: '+([CFG.bale&&CFG.bale.token?'بله':'',CFG.telegram&&CFG.telegram.token?'تلگرام':''].filter(Boolean).join('، ')||'—')},
  {id:'tariffIR',name:'کتاب تعرفهٔ گمرک ایران',mode:'customs',on:tb.n>0,status:tb.at?{ok:true,at:tb.at}:null,env:tb.n?tb.n+' ردیف · '+(tb.label||''):'وارد نشده — فایل Excel/CSV را از «داده‌های ایران» وارد کنید'},
  {id:'customsFx',name:'نرخ ارز گمرکی',mode:'fx',on:!!(fx.rates&&fx.rates.USD),status:fx.at?{ok:true,at:fx.at}:st('customsFx'),env:fx.rates&&fx.rates.USD?'USD = '+fx.rates.USD+' ریال · '+(fx.src||''):'ثبت نشده — دستی یا IFA_CUSTOMS_FX_URL'},
  {id:'portTariff',name:'تعرفه‌های بندری (سازمان بنادر)',mode:'port',on:np>0,status:np?{ok:true,at:Math.max(...Object.values(pm).map(m=>m.at||0))}:null,env:np?np+' بندر':'وارد نشده'}]}
