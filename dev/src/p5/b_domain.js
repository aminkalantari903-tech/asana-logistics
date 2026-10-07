
/* ---------- domain knowledge: ports, equipment, money ---------- */
const PORTS=[['CNNGB','Ningbo','نینگبو',/ningbo|نینگبو|نینگ‌بو/i,'CN'],['CNSHA','Shanghai','شانگهای',/shanghai|شانگهای/i,'CN'],['CNTAO','Qingdao','چینگدائو',/qingdao|tsingtao|چینگدائو|چینگ‌دائو/i,'CN'],['CNSZX','Shenzhen','شنژن',/shenzhen|yantian|shekou|chiwan|شنژن|شنزن/i,'CN'],['CNCAN','Guangzhou','گوانگژو',/guangzhou|nansha|huangpu|گوانگژو/i,'CN'],
 ['CNTSN','Tianjin','تیانجین',/tianjin|xingang|تیانجین/i,'CN'],['CNXMN','Xiamen','شیامن',/xiamen|شیامن/i,'CN'],['CNDLC','Dalian','دالیان',/dalian|دالیان/i,'CN'],['CNLYG','Lianyungang','لیان‌یونگانگ',/lianyungang/i,'CN'],['CNFOC','Fuzhou','فوژو',/fuzhou/i,'CN'],['HKHKG','Hong Kong','هنگ‌کنگ',/hong\s*kong|هنگ\s*‌?کنگ/i,'CN'],
 ['CNYIW','Yiwu','ییوو',/yiwu|ییوو|یی‌وو/i,'CN'],['CNXIY',"Xi'an",'شی‌آن',/xi'?an\b|شی‌?آن/i,'CN'],['CNCKG','Chongqing','چونگ‌کینگ',/chongqing/i,'CN'],['CNURC','Urumqi','ارومچی',/urumqi|ارومچی/i,'CN'],['CNKHG','Kashgar','کاشغر',/kashgar|kashi\b|کاشغر/i,'CN'],
 ['IRBND','Bandar Abbas','بندرعباس',/bandar\s*abbas|shahid\s*raja(?:e|ee|i)|\bBND\b|بندر\s*‌?عباس|شهید\s*رجایی/i,'IR'],['IRZBR','Chabahar','چابهار',/chabahar|چابهار/i,'IR'],['IRBUZ','Bushehr','بوشهر',/bushehr|بوشهر/i,'IR'],['IRBKM','Imam Khomeini Port','بندر امام',/imam\s*khomeini|bandar\s*imam|بندر\s*امام/i,'IR'],
 ['IRBZR','Anzali','انزلی',/anzali|انزلی/i,'IR'],['IRAMD','Amirabad','امیرآباد',/amirabad|امیرآباد/i,'IR'],['IRTHR','Tehran','تهران',/tehran|تهران|\bTHR\b/i,'IR'],['IRMHD','Mashhad','مشهد',/mashhad|مشهد/i,'IR'],['IRIFN','Isfahan','اصفهان',/isfahan|esfahan|اصفهان/i,'IR'],['IRTBZ','Tabriz','تبریز',/tabriz|تبریز/i,'IR'],['IRSYZ','Shiraz','شیراز',/shiraz|شیراز/i,'IR'],
 ['IRSRK','Sarakhs','سرخس',/sarakhs|serakhs|سرخس/i,'IR'],['IRINC','Incheh Borun','اینچه‌برون',/incheh|inche\s*borun|اینچه/i,'IR'],['AEJEA','Jebel Ali','جبل‌علی',/jebel\s*ali|jabal\s*ali|dubai|جبل\s*‌?علی|دبی/i,'AE'],['KZAKT','Aktau','آکتائو',/aktau|kuryk|آکتائو|آکتاو/i,'KZ']];
const portOf=s=>{s=String(s||'');if(!s)return null;for(const p of PORTS)if(p[3].test(s)||p[0]===s.toUpperCase())return p;return null};
const portsIn=s=>{const out=[];s=String(s||'');for(const p of PORTS){const re=new RegExp(p[3].source,'gi');let m;while((m=re.exec(s))){out.push({p,i:m.index});break}}return out.sort((a,b)=>a.i-b.i).map(x=>x.p)};
function eqNorm(size,type){const s=String(size||'').toUpperCase(),t=String(type||'').toUpperCase().replace(/\s/g,'');if(s==='TEU')return '20GP';if(s==='FEU')return '40GP';if(s==='LCL')return 'LCL';
 if(s==='45')return '45HC';if(/HC|HQ/.test(t))return s+'HC';if(/RF|RH|NOR/.test(t))return s==='20'?'20RF':'40RH';if(/OT/.test(t))return s+'OT';if(/FR/.test(t))return s+'FR';return s+'GP'}
const eqCls=e=>{e=String(e||'').toUpperCase();return /^LCL/.test(e)?'LCL':/^20/.test(e)?'20':/^4[05]/.test(e)?(/RF|RH/.test(e)?'40R':'40'):/TRUCK|FTL|TIR/.test(e)?'FTL':e||'?'};
const EQRX=/\b(20|40|45)\s*(?:['’′]|ft|feet|foot|فوت)?\s*(GP|DC|DV|ST|STD|HC|HQ|RF|RH|NOR|OT|FR)?(?![\d.,])|\b(TEU|FEU|LCL)\b/gi;
const CURRX=/(US\$|USD|\$|EUR|€|AED|CNY|RMB|IRR|ریال|دلار|یورو|درهم|یوان)/i;
const curNorm=c=>{c=String(c||'').toUpperCase();return /USD|\$|دلار/.test(c)?'USD':/EUR|€|یورو/.test(c)?'EUR':/AED|درهم/.test(c)?'AED':/CNY|RMB|یوان/.test(c)?'CNY':/IRR|ریال/.test(c)?'IRR':c||'USD'};
const numP=s=>{s=enDig(s).replace(/[,\s]/g,'');return parseFloat(s)};
const AMTRX=/(US\$|USD|\$|EUR|€|AED|CNY|RMB|دلار|یورو|درهم|یوان)\s*([\d][\d,]*(?:\.\d+)?)|([\d][\d,]*(?:\.\d+)?)\s*(US\$|USD|\$|EUR|€|AED|CNY|RMB|دلار|یورو|درهم|یوان)/gi;
function fxNow(){const fx=cGet('fx',null)||{};return {R:fx.rates||{},free:fx.market&&fx.market.USD?+fx.market.USD:null,date:fx.date||fx.ts||null,src:fx.src||'fx'}}
function usdOf(amt,cur){cur=curNorm(cur);amt=+amt;if(!(amt>0))return null;if(cur==='USD')return amt;const F=fxNow();if(cur==='IRR')return F.free?amt/F.free:null;return F.R[cur]?amt/F.R[cur]:null}
const CARRIERS=/\b(COSCO|OOCL|CMA[\s-]?CGM|MSC|MAERSK|HAPAG(?:[\s-]LLOYD)?|ONE|EVERGREEN|YANG\s*MING|IRISL|HDS(?:\s*LINES?)?|EMIRATES\s*SHIPPING|ESL|SEA\s*LEAD|KMTC|WAN\s*HAI|PIL|ZIM|RCL|SINOKOR|SITC|TS\s*LINES|SIMATECH|SEA\s*LEGEND|GOLD\s*STAR|ASYAD|SOLAR\s*SHIPPING|PASHA)\b/i;
const SURRX=/\b(BAF|CAF|THC|OTHC|DTHC|ISPS|WRS|WAR\s*RISK(?:\s*SURCHARGE)?|PSS|GRI|EBS|LSS|EIS|CIC|ECRS|DOC(?:UMENTATION)?\s*FEE|B\/?L\s*FEE|SEAL\s*FEE|EIR|AMS|ENS|TELEX(?:\s*RELEASE)?|DO\s*FEE|ورود\s*به\s*انبار|هزینه\s*ترمینال)\b/i;
const surKey=s=>{s=String(s).toUpperCase().replace(/\s+/g,' ');return /WAR/.test(s)?'WRS':/DOC/.test(s)?'DOC':/B\/?L/.test(s)?'BL':/SEAL/.test(s)?'SEAL':/TELEX/.test(s)?'TELEX':s.split(' ')[0]};
const DATERX=/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})|(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})|(\d{1,2})\s*(?:st|nd|rd|th)?\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?,?\s*(\d{4})?|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})?/i;
const AGMON={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
function dateOf(s){s=enDig(s);const m=s.match(DATERX);if(!m)return null;let y,mo,d;const cy=new Date().getUTCFullYear();
 if(m[1]){y=+m[1];mo=+m[2];d=+m[3]}else if(m[6]){y=+m[6];d=+m[4];mo=+m[5];if(mo>12){[d,mo]=[mo,d]}}else if(m[8]){d=+m[7];mo=AGMON[m[8].toLowerCase()];y=+m[9]||cy}else{mo=AGMON[m[10].toLowerCase()];d=+m[11];y=+m[12]||cy}
 if(y>=1390&&y<=1450){try{const g=j2g(y,mo,d);return g}catch(e){return null}}if(!(mo>=1&&mo<=12&&d>=1&&d<=31))return null;return y+'-'+String(mo).padStart(2,'0')+'-'+String(d).padStart(2,'0')}
const agToday=()=>new Date().toISOString().slice(0,10);
const median=a=>{a=a.filter(v=>isFinite(v)).sort((x,y)=>x-y);if(!a.length)return null;const m=a.length>>1;return a.length%2?a[m]:(a[m-1]+a[m])/2};

/* ---------- quote extraction (rules; the model only refines, and every extracted number must exist verbatim in the source) ---------- */
function qxText(text,meta={}){const raw=enDig(String(text||'')).replace(/\r/g,'');const lines=raw.split('\n').map(l=>l.trim()).filter(Boolean);const out=[],sur=[];const flags=[];
 const g={};const v=raw.match(/(?:valid(?:ity)?|validity\s*date|expir\w*|until|till|اعتبار(?:\s*تا)?)[^\n\d]{0,25}([^\n]{4,30})/i);if(v)g.valid=dateOf(v[1]);
 const f=raw.match(/(\d{1,3})\s*days?\s*(?:of\s*)?(?:free|detention|demurrage\s*free)|free\s*(?:time|days?)?\s*(?:at\s*\w+\s*)?[:\-]?\s*(\d{1,3})|(\d{1,3})\s*روز\s*(?:آزاد|فری)|روز\s*(?:آزاد|فری)\s*[:\-]?\s*(\d{1,3})/i);if(f)g.free=+(f[1]||f[2]||f[3]||f[4]);
 const tt=raw.match(/(?:t\/t|transit(?:\s*time)?|ترانزیت|زمان\s*حمل)\s*[:\-]?\s*(?:about\s*|approx\.?\s*)?(\d{1,3})(?:\s*[-–~]\s*(\d{1,3}))?\s*(?:days?|روز)?/i);if(tt)g.days=tt[2]?Math.round((+tt[1]+ +tt[2])/2):+tt[1];
 const cm=raw.match(CARRIERS);if(cm)g.carrier=cm[1].toUpperCase().replace(/\s+/g,' ');
 const lp=portsIn(raw);const pol0=lp.find(p=>p[4]!=='IR'&&p[4]!=='AE')||null,pod0=lp.find(p=>p[4]==='IR')||lp.find(p=>p[4]==='AE'&&p!==pol0)||null;
 if(/all[\s-]?in/i.test(raw))g.allin=true;if(/subject\s*to|plus\s*local|excl(?:uding|\.)?\b|not\s*incl|بدون\s*احتساب|به\s*جز/i.test(raw))flags.push('شرط/استثنا در متن («subject to/excluding») — شمول سرشارژها را کنترل کنید');
 /* table (CSV / TSV / pipe / Excel export) */
 const sep=lines.slice(0,8).map(l=>[[',',l.split(',').length],['\t',l.split('\t').length],[';',l.split(';').length],['|',l.split('|').length]].sort((a,b)=>b[1]-a[1])[0]);
 const hi=lines.findIndex((l,i)=>i<8&&sep[i]&&sep[i][1]>=3&&/(20|40|pol|origin|from|مبدأ|مبدا)/i.test(l)&&/(40|pod|dest|to\b|مقصد)/i.test(l));
 if(hi>=0){const S=sep[hi][0];const H=lines[hi].split(S).map(h=>h.trim());const col=re=>H.findIndex(h=>re.test(h));
  const cPol=col(/^(pol|origin|from|load|مبدأ|مبدا|بندر\s*بارگیری)/i),cPod=col(/^(pod|dest|destination|to|discharge|مقصد|بندر\s*تخلیه)/i),cCur=col(/^(cur|currency|ارز)/i),cVal=col(/valid|اعتبار/i),cTT=col(/t\/t|transit|ترانزیت/i),cFree=col(/free|آزاد/i),cCar=col(/carrier|line|خط|کشتیرانی/i),cRem=col(/remark|note|incl|توضیح|شامل/i);
  const eqCols=H.map((h,i)=>{const m=h.toUpperCase().match(/\b(20|40|45)\s*['’]?\s*(GP|DC|DV|ST|HC|HQ|RF|RH|NOR|OT|FR)?\b|\b(TEU|FEU|LCL)\b/);return m?[i,m[3]?eqNorm(m[3]):eqNorm(m[1],m[2])]:null}).filter(Boolean);
  for(const l of lines.slice(hi+1)){const c=l.split(S).map(x=>x.trim());if(c.length<2)continue;const pol=portOf(c[cPol])||pol0,pod=portOf(c[cPod])||pod0;const cur=cCur>=0?curNorm(c[cCur]):(CURRX.test(l)?curNorm(l.match(CURRX)[1]):'USD');
   for(const [i,eq] of eqCols){const amt=numP(String(c[i]||'').replace(/[^\d.,]/g,''));if(!(amt>0))continue;out.push({pol:pol?pol[1]:(c[cPol]||''),pod:pod?pod[1]:(c[cPod]||''),eq,amt,cur,valid:cVal>=0?dateOf(c[cVal])||g.valid:g.valid,days:cTT>=0?+(String(c[cTT]).match(/\d+/)||[])[0]||g.days:g.days,free:cFree>=0?+(String(c[cFree]).match(/\d+/)||[])[0]||g.free:g.free,carrier:cCar>=0?c[cCar]:g.carrier,note:cRem>=0?c[cRem]:'',raw:l.slice(0,300),how:'table'})}}}
 /* free text: amounts paired with equipment on the same line (or "1200/1900 for 20/40") */
 if(!out.length){let lane=[pol0,pod0];
  for(const l of lines){const lpp=portsIn(l);if(lpp.length>=2){const a=lpp.find(p=>p[4]!=='IR')||lpp[0],b=lpp.find(p=>p[4]==='IR'&&p!==a)||lpp[1];lane=[a,b]}
   const A=[...l.matchAll(AMTRX)].map(m=>({amt:numP(m[2]||m[3]),cur:curNorm(m[1]||m[4]),i:m.index}));const Q=[...l.matchAll(EQRX)].map(m=>({eq:m[3]?eqNorm(m[3]):eqNorm(m[1],m[2]),i:m.index}));
   const sm=l.match(SURRX);
   const slash=l.match(/([\d][\d,]*(?:\.\d+)?)\s*\/\s*([\d][\d,]*(?:\.\d+)?)(?:\s*\/\s*([\d][\d,]*(?:\.\d+)?))?[^\n]{0,30}?\b(20|40)\s*['’]?\s*(?:GP|DC)?\s*\/\s*(40|45)\s*['’]?\s*(GP|HC|HQ)?(?:\s*\/\s*(40|45)\s*['’]?\s*(HC|HQ))?/i);
   let P=[];if(slash&&!sm){const vs=[slash[1],slash[2],slash[3]].filter(Boolean).map(numP);const es=[eqNorm(slash[4]),eqNorm(slash[5],slash[6]),slash[7]?eqNorm(slash[7],slash[8]):null].filter(Boolean);vs.forEach((v,i)=>es[i]&&P.push({amt:v,cur:A.length?A[0].cur:(CURRX.test(l)?curNorm(l.match(CURRX)[1]):'USD'),eq:es[i]}))}
   else if(A.length&&Q.length){for(const a of A){let best=null,bd=1e9;for(const e of Q){const d=Math.abs(e.i-a.i);if(d<bd){bd=d;best=e}}if(best&&bd<60)P.push({...a,eq:best.eq})}}
   else if(A.length&&!sm&&/(ocean|sea|freight|rate|price|کرایه|نرخ|قیمت|all[\s-]?in)/i.test(l)){P=A.map(a=>({...a,eq:null}))}
   if(sm){const SM=[...l.matchAll(new RegExp(SURRX.source,'gi'))];const nearS=i=>SM.find(s=>i>=s.index&&i-(s.index+s[0].length)<22&&!/\d/.test(l.slice(s.index+s[0].length,i).replace(/[\s:=\-]/g,'').replace(/^(US\$|USD|\$|EUR|€|AED)/i,'')));
    const used=new Set();for(const a of A){const s=nearS(a.i);if(s){used.add(a.i);sur.push({code:surKey(s[1]),amt:a.amt,cur:a.cur,eq:(P.find(p=>p.i===a.i)||{}).eq||null,raw:l.slice(0,200)})}}
    for(const s of SM){if(sur.some(x=>x.raw===l.slice(0,200)&&x.code===surKey(s[1])))continue;const m=l.slice(s.index+s[0].length).match(/^\s*[:=\-]?\s*(?:US\$|USD|\$)?\s*(\d[\d,]*(?:\.\d+)?)(?!\s*(?:days?|روز|%))/i);if(m&&numP(m[1])>0)sur.push({code:surKey(s[1]),amt:numP(m[1]),cur:A.length?A[0].cur:'USD',eq:null,raw:l.slice(0,200)})}
    const rest=P.filter(p=>p.i==null||!used.has(p.i));if(!rest.length||A.every(a=>used.has(a.i))&&!rest.some(p=>p.i!=null&&!used.has(p.i)))continue;P=rest}
   if(sm&&/(incl|included|شامل)/i.test(l))sur.push({code:surKey(sm[1]),amt:0,incl:true,raw:l.slice(0,200)});
   for(const p of P)if(p.amt>=20)out.push({pol:lane[0]?lane[0][1]:'',pod:lane[1]?lane[1][1]:'',eq:p.eq||'40GP',eqGuess:!p.eq,amt:p.amt,cur:p.cur,valid:g.valid||null,days:g.days||null,free:g.free||null,carrier:g.carrier||'',raw:l.slice(0,300),how:'text'})}}
 const Q=out.map(o=>{const s=sur.filter(x=>!x.eq||!o.eq||eqCls(x.eq)===eqCls(o.eq));let conf=0.35+(o.pol?0.15:0)+(o.pod?0.15:0)+(o.valid?0.1:0)+(o.eqGuess?0:0.1)+(o.cur?0.05:0)+(o.how==='table'?0.1:0);
  return {...o,vendor:meta.vendor||o.carrier||'',usd:usdOf(o.amt,o.cur)!=null?Math.round(usdOf(o.amt,o.cur)):null,surcharges:s,allin:!!g.allin,conf:Math.min(0.95,+conf.toFixed(2)),src:meta.src||'text',ref:meta.ref||''}});
 const inj=agInj(raw);if(inj.length)flags.push('نشانهٔ تزریق دستور در متن: '+inj.join(' | '));
 if(!Q.length)flags.push('هیچ نرخ قابل‌استخراجی (مبلغ + ارز + نوع کانتینر) پیدا نشد');
 return {quotes:Q,surcharges:sur,flags,injection:inj,lane:{pol:pol0&&pol0[1],pod:pod0&&pod0[1]}}}
/* every number the model returns must appear in the source text */
function qxVerify(src,Q){const pool=new Set(numsOf(src));return Q.filter(q=>q&&+q.amt>0&&(pool.has(+q.amt)||pool.has(Math.round(+q.amt))))}

/* ---------- minimal PDF text extraction (Flate streams, Tj/TJ) — best effort, no dependencies ---------- */
function pdfText(buf){const s=buf.toString('latin1');const out=[];const re=/stream\r?\n/g;let m;
 while((m=re.exec(s))){const st=m.index+m[0].length;const en=s.indexOf('endstream',st);if(en<0)break;const head=s.slice(Math.max(0,m.index-300),m.index);let data=buf.subarray(st,en);
  try{if(/FlateDecode/.test(head))data=zlib.inflateSync(data);else if(/\/Filter/.test(head))continue}catch(e){try{data=zlib.inflateRawSync(data.subarray(2))}catch(e2){continue}}
  const t=data.toString('latin1');if(!/T[Jj]/.test(t))continue;const parts=[];for(const x of t.matchAll(/\[((?:[^\]\\]|\\.)*)\]\s*TJ|\(((?:[^)\\]|\\.)*)\)\s*Tj|(T\*|Td|TD|Tm|')/g)){
   if(x[3]){parts.push('\n');continue}const seg=x[1]!=null?[...x[1].matchAll(/\(((?:[^)\\]|\\.)*)\)|(-?\d+(?:\.\d+)?)/g)].map(y=>y[1]!=null?y[1]:(+y[2]<-200?' ':'')).join(''):x[2];
   parts.push(seg.replace(/\\([nrtbf()\\])/g,(a,c)=>({n:'\n',r:'',t:'\t',b:'',f:'','(':'(',')':')','\\':'\\'}[c])).replace(/\\(\d{3})/g,(a,o)=>String.fromCharCode(parseInt(o,8))))}
  out.push(parts.join('').replace(/\n{2,}/g,'\n'))}
 return out.join('\n').replace(/[^\S\n]+/g,' ').trim()}

/* ---------- rate bank access (server copy of the shared datasets) ---------- */
function ratesAll(){const A=[];const R=kvGet('ifa-rates');(Array.isArray(R)?R:[]).forEach(r=>r&&A.push({id:r.id,vendor:r.vendor||'',mode:r.mode||'sea',pol:r.pol||'',pod:r.pod||'',eq:r.eq||'',amt:+r.amt,cur:r.cur||'USD',date:r.from||(r.t?new Date(r.t).toISOString().slice(0,10):''),valid:r.to||'',src:'rate-bank:'+(r.src||'manual'),incl:r.incl||''}));
 for(const r of q("SELECT * FROM prates WHERE status!='rej' AND usd>0 ORDER BY ts DESC LIMIT 2000"))if(!A.some(x=>x.id==='PR-'+r.id))A.push({id:'PR-'+r.id,vendor:r.partner,mode:r.mode==='lcl'?'sea':r.mode,pol:r.pol,pod:r.pod,eq:r.eq||'',amt:r.amt,cur:r.cur,usdK:r.usd,date:new Date(r.ts).toISOString().slice(0,10),valid:r.valid||'',src:'partner-panel',incl:r.incl||''});
 for(const r of q('SELECT rr.*,rf.route,rf.title FROM rfq_resp rr JOIN rfq rf ON rf.id=rr.rfq ORDER BY rr.ts DESC LIMIT 1000')){const lp=portsIn((r.route||'')+' '+(r.title||''));A.push({id:'RFQ-'+r.id,rfq:r.rfq,vendor:r.vendor,mode:'sea',pol:lp[0]?lp[0][1]:'',pod:lp[1]?lp[1][1]:'',eq:((r.title||'')+' '+(r.route||'')).match(/40\s*HC|40|20/i)?eqNorm(...(((r.title||'')+' '+(r.route||'')).match(/(40|20)\s*(HC|HQ)?/i)||[]).slice(1)):'',amt:r.price,cur:r.cur,usdK:r.usd,date:new Date(r.ts).toISOString().slice(0,10),valid:r.valid||'',days:r.days,free:r.free,src:'rfq-online',note:r.note||''})}
 return A.map(r=>({...r,usd:r.usdK!=null?Math.round(r.usdK):usdOf(r.amt,r.cur)!=null?Math.round(usdOf(r.amt,r.cur)):null,polC:(portOf(r.pol)||[])[0]||'',podC:(portOf(r.pod)||[])[0]||''}))}
function laneMatch(r,f){const pc=f.pol?(portOf(f.pol)||[])[0]:null,dc=f.pod?(portOf(f.pod)||[])[0]:null;
 if(f.pol&&!(pc&&r.polC===pc||nk(r.pol).includes(nk(f.pol))))return false;if(f.pod&&!(dc&&r.podC===dc||nk(r.pod).includes(nk(f.pod))))return false;if(f.eq&&eqCls(r.eq)!==eqCls(f.eq))return false;if(f.mode&&r.mode&&f.mode!==r.mode)return false;
 if(f.days&&r.date&&Date.parse(r.date)<Date.now()-f.days*864e5)return false;return true}
const nk=s=>String(s||'').toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]/g,'');
const rSrc=r=>({kind:'rate',ref:r.id,title:(r.vendor||'—')+' · '+r.pol+' → '+r.pod+' '+(r.eq||'')+' · '+r.amt+' '+r.cur+(r.date?' · '+r.date:''),view:'rate',ts:r.date});
function benchOne(usd,f){const L=ratesAll().filter(r=>r.usd>0&&laneMatch(r,{...f,days:f.days||120}));const m=median(L.map(r=>r.usd));if(!m||L.length<2)return {n:L.length,median:m?Math.round(m):null,verdict:null,reason:'دادهٔ مقایسه‌ای کافی برای این مسیر نیست (کمتر از ۲ نرخ در ۱۲۰ روز)',sources:L.slice(0,5).map(rSrc)};
 const C=agCfg();const dv=usd/m-1;return {n:L.length,median:Math.round(m),deviation:+dv.toFixed(3),verdict:dv>C.devHi?'expensive':dv<C.devLo?'suspicious-cheap':'fair',sources:L.slice(0,8).map(rSrc)}}
function anomalies(days=180){const G={};for(const r of ratesAll().filter(r=>r.usd>0&&laneMatch(r,{days})))(G[[r.polC||nk(r.pol),r.podC||nk(r.pod),eqCls(r.eq)].join('|')]=G[[r.polC||nk(r.pol),r.podC||nk(r.pod),eqCls(r.eq)].join('|')]||[]).push(r);
 const out=[];for(const [k,L] of Object.entries(G)){if(L.length<4)continue;const m=median(L.map(r=>r.usd));const mad=median(L.map(r=>Math.abs(r.usd-m)))||m*0.05;for(const r of L){const z=0.6745*(r.usd-m)/mad;if(Math.abs(z)>3.5)out.push({id:r.id,vendor:r.vendor,lane:r.pol+' → '+r.pod+' '+r.eq,usd:r.usd,median:Math.round(m),z:+z.toFixed(1),n:L.length,kind:z>0?'high':'low',source:rSrc(r)})}}
 const expired=ratesAll().filter(r=>r.valid&&r.valid<agToday()&&Date.parse(r.valid)>Date.now()-30*864e5).map(r=>({id:r.id,vendor:r.vendor,valid:r.valid}));return {outliers:out,expired:expired.slice(0,30)}}

/* ---------- index forecast with uncertainty (log-return drift + volatility, 80% band) ---------- */
function idxForecast(series='ccfi',line='PERSIAN_GULF_RED_SEA',weeks=4){const H=q('SELECT date,value FROM idx_hist WHERE series=? AND line=? ORDER BY date DESC LIMIT 60',series,line).reverse();if(H.length<6)return {series,line,n:H.length,error:'دادهٔ تاریخی کافی نیست (حداقل ۶ مشاهده)'};
 const r=[];for(let i=1;i<H.length;i++){const dd=(Date.parse(H[i].date)-Date.parse(H[i-1].date))/(7*864e5);if(dd>0&&H[i].value>0&&H[i-1].value>0)r.push(Math.log(H[i].value/H[i-1].value)/Math.sqrt(dd))}
 const mu=r.reduce((s,x)=>s+x,0)/r.length*0.5;const sd=Math.sqrt(r.reduce((s,x)=>s+(x-mu*2)**2,0)/Math.max(1,r.length-1));const last=H[H.length-1];
 const P=[];for(let h=1;h<=weeks;h++){const c=last.value*Math.exp(mu*h);P.push({week:h,date:new Date(Date.parse(last.date)+h*7*864e5).toISOString().slice(0,10),value:+c.toFixed(1),lo80:+(c*Math.exp(-1.2816*sd*Math.sqrt(h))).toFixed(1),hi80:+(c*Math.exp(1.2816*sd*Math.sqrt(h))).toFixed(1)})}
 return {series,line,last:{date:last.date,value:last.value},n:H.length,weeklyVolPct:+(sd*100).toFixed(1),driftPct:+(mu*100).toFixed(2),points:P,method:'میانگین بازده لگاریتمی هفتگی (کاهش‌یافته ۵۰٪) و نوسان تاریخی؛ بازهٔ ۸۰٪',caveat:'پیش‌بینی آماری کوتاه‌مدت است و رویدادهای ناگهانی (جنگ، تعطیلی مسیر، GRI) را نمی‌بیند.',sources:[{kind:'index',ref:series+'|'+line,title:series.toUpperCase()+' '+line+' — '+H.length+' مشاهده تا '+last.date,view:'mkt'}]}}
