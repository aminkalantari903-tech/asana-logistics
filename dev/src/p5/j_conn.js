/* =====================================================================
   v1.10 CONNECTORS — اتصال‌های دادهٔ معتبر
   1) UK Trade Tariff API (رایگان، بدون کلید): اعتبارسنجی و جست‌وجوی کد HS در نامگذاری رسمی HS 2022
   2) Neshan (کلید): فاصله و زمان واقعی جاده‌ای داخل ایران + تبدیل آدرس به مختصات
   3) DCSA Commercial Schedules (کلید هر خط): برنامهٔ حرکت واقعی بندر به بندر از چند خط کشتیرانی
   ===================================================================== */
CFG.live.conn=(()=>{let F={};try{F=JSON.parse(fs.readFileSync(CFG_FILE,'utf8'))}catch(e){}const f=(F.live&&F.live.conn)||{};const E=process.env;const off=String(E.IFA_LIVE_OFF||'').split(',');
 const o={hsOfficial:f.hsOfficial!==false,neshanKey:String(f.neshanKey||''),neshanTraffic:!!f.neshanTraffic,neshanUrl:String(f.neshanUrl||'https://api.neshan.org').replace(/\/$/,''),schedules:Array.isArray(f.schedules)?f.schedules:[]};
 if(E.IFA_NESHAN_KEY)o.neshanKey=E.IFA_NESHAN_KEY;if(E.IFA_NESHAN_URL)o.neshanUrl=E.IFA_NESHAN_URL.replace(/\/$/,'');if(E.IFA_HS_OFFICIAL==='0'||off.includes('all')||off.includes('conn')||off.includes('hs'))o.hsOfficial=false;
 if(E.IFA_SCHEDULES){try{const a=JSON.parse(E.IFA_SCHEDULES);if(Array.isArray(a))o.schedules=a}catch(e){console.error('IFA_SCHEDULES: JSON نامعتبر')}}
 if(E.IFA_SCHED_URL)o.schedules=[...o.schedules,{name:E.IFA_SCHED_NAME||'DCSA',baseUrl:E.IFA_SCHED_URL,key:E.IFA_SCHED_KEY||'',header:E.IFA_SCHED_HEADER||'API-Key'}];
 const okU=u=>/^https:\/\//i.test(u)||/^http:\/\/(127\.0\.0\.1|localhost)[:/]/i.test(u);o.schedules=o.schedules.filter(p=>p&&okU(String(p.baseUrl||''))).map(p=>({name:String(p.name||'DCSA').slice(0,40),baseUrl:String(p.baseUrl).replace(/\/$/,''),key:String(p.key||''),header:String(p.header||'API-Key'),path:String(p.path||'/point-to-point-routes'),q:{from:'placeOfReceipt',to:'placeOfDelivery',start:'departureStartDate',end:'departureEndDate',...(p.q||{})},extra:p.extra&&typeof p.extra==='object'?p.extra:{}}));
 if(off.includes('all')||off.includes('conn')){o.schedules=[];o.neshanKey=''}return o})();
const CONN_DOCS={uk:'https://www.trade-tariff.service.gov.uk/api/v2',neshan:'https://platform.neshan.org',dcsa:'https://developer.dcsa.org'};
const clean=s=>String(s==null?'':s).replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();

/* ---------- 1) UK Trade Tariff: HS verify + search ---------- */
const UKT='https://www.trade-tariff.service.gov.uk/api/v2';
const ukGet=p=>getJ(UKT+p,{headers:{Accept:'application/json'},timeout:15000});
async function hsVerify(code){const c=String(code||'').replace(/\D/g,'');if(c.length<6)throw E(400,'کد HS دست‌کم ۶ رقم لازم است');const c6=c.slice(0,6);
 if(!CFG.live.conn.hsOfficial)throw E(501,'اعتبارسنجی رسمی HS غیرفعال است (IFA_HS_OFFICIAL / IFA_LIVE_OFF)');
 const key='hsv|'+c6;const C=cGet(key,30*864e5);if(C)return {...C,cached:true};
 try{const s=await ukGet('/search?q='+c6);const a=(s.data&&s.data.attributes)||{};let out;
  if(a.type!=='exact_match'||!a.entry){out={code:c6,valid:false,src:'UK Trade Tariff · HS 2022',fetched:Date.now(),note:'این زیرعنوان شش‌رقمی در نامگذاری رسمی HS یافت نشد'}}
  else{const d=await ukGet('/'+a.entry.endpoint+'/'+encodeURIComponent(a.entry.id));const at=(d.data&&d.data.attributes)||{};const inc=d.included||[];
   const hd=inc.find(x=>x.type==='heading'),ch=inc.find(x=>x.type==='chapter');
   const kids=[];for(const x of inc.filter(x=>x.type==='commodity').map(x=>x.attributes||{})){const id=String(x.goods_nomenclature_item_id||'');if(!id.startsWith(c6))continue;const lf=!!(x.leaf||x.declarable),o={code:id,desc:clean(x.formatted_description||x.description),leaf:lf};const i=kids.findIndex(k=>k.code===id);if(i<0)kids.push(o);else if(lf)kids[i]=o;if(kids.length>=14)break}
   out={code:c6,valid:true,desc:clean(at.formatted_description||at.description),heading:hd?clean(hd.attributes.formatted_description||hd.attributes.description):'',chapter:ch?clean(ch.attributes.formatted_description||ch.attributes.description):'',children:kids,src:'UK Trade Tariff · HS 2022',fetched:Date.now()}}
  cSet(key,out);lstat('hsOfficial',true,c6);return out}catch(e){lstat('hsOfficial',false,e.message);throw e}}
async function hsSearchOfficial(q){q=String(q||'').trim().slice(0,120);if(q.length<3)throw E(400,'شرح کالا کوتاه است');if(!CFG.live.conn.hsOfficial)throw E(501,'اعتبارسنجی رسمی HS غیرفعال است');
 if(/^\d{6,10}$/.test(q.replace(/[\s.]/g,'')))return {query:q,candidates:[await hsVerify(q)].filter(x=>x.valid).map(x=>({hs:x.code,code:x.code,desc:x.desc,path:[x.chapter,x.heading].filter(Boolean)}))};
 if(/[\u0600-\u06FF]/.test(q))throw E(400,'جست‌وجوی نامگذاری رسمی به شرح انگلیسی نیاز دارد (کد یا شرح فارسی از مسیر hs_suggest بررسی می‌شود)');
 const key='hss|'+sha(q.toLowerCase()).slice(0,20);const C=cGet(key,14*864e5);if(C)return {...C,cached:true};
 const s=await ukGet('/search?q='+encodeURIComponent(q));const a=(s.data&&s.data.attributes)||{};let L=[];
 if(a.type==='exact_match'&&a.entry){const v=await hsVerify(String(a.entry.id).slice(0,6));if(v.valid)L=[{hs:v.code,code:v.code,desc:v.desc,path:[v.chapter,v.heading].filter(Boolean)}]}
 else{const g=a.goods_nomenclature_match||{};for(const x of [...(g.commodities||[]),...(g.headings||[])]){const z=x._source||{};const id=String(z.goods_nomenclature_item_id||'');if(id.length<6)continue;const hs=id.slice(0,6);if(/^\d{4}00$/.test(hs)&&(g.commodities||[]).length)continue;
   if(L.some(c=>c.hs===hs))continue;L.push({hs,code:id,desc:clean(z.description),path:(z.ancestor_descriptions||[]).map(clean).slice(0,4),score:+(x._score||0).toFixed(2)});if(L.length>=6)break}}
 const out={query:q,candidates:L,src:'UK Trade Tariff · HS 2022',fetched:Date.now()};cSet(key,out);lstat('hsOfficial',true,'search');return out}
/* hs_suggest: verify every candidate against the official nomenclature; add official search hits for Latin descriptions */
{const t=TOOLS.hs_suggest,run1=t.run;t.run=async(a,ctx)=>{const r=await run1(a,ctx);if(!CFG.live.conn.hsOfficial)return r;
 try{const desc=String(a.desc||'');if(/[A-Za-z]{4,}/.test(desc)&&!/[\u0600-\u06FF]/.test(desc)){const S=await hsSearchOfficial(desc).catch(()=>null);for(const c of (S&&S.candidates||[]).slice(0,3)){const k=c.hs.slice(0,4)+'.'+c.hs.slice(4);if(!r.candidates.some(z=>z.code===k))r.candidates.push({code:k,heading:c.hs.slice(0,4),name:c.desc,reason:'یافته در نامگذاری رسمی: '+(c.path||[]).slice(-2).join(' › '),confidence:0.45,matched:[],dualUse:false,src:'official'})}}
  await Promise.all(r.candidates.slice(0,5).map(async c=>{try{const v=await hsVerify(c.code);c.verified=v.valid;if(v.valid){c.official=v.desc;c.officialPath=[v.chapter,v.heading].filter(Boolean);c.confidence=Math.min(0.95,+((c.confidence||0)+0.05).toFixed(2))}else c.confidence=+((c.confidence||0)*0.4).toFixed(2)}catch(e){c.verified=null}}));
  r.candidates.sort((x,y)=>(y.confidence||0)-(x.confidence||0));r.sources=[...(r.sources||[]),{kind:'hs',ref:'uk-tariff',title:'نامگذاری رسمی HS 2022 — UK Trade Tariff API'}]}catch(e){}return r}}
route('GET','/api/live/hs/verify',async req=>hsVerify(new URL(req.url,'http://x').searchParams.get('code')));
route('GET','/api/live/hs/search',async req=>hsSearchOfficial(new URL(req.url,'http://x').searchParams.get('q')));

/* ---------- 2) Neshan: road distance/time inside Iran + geocoding ---------- */
const inIR=p=>p[0]>=24.5&&p[0]<=40.2&&p[1]>=43.8&&p[1]<=63.6;
async function neshanMatrix(pts){const K=CFG.live.conn.neshanKey;const N=pts.length;const km=pts.map(()=>Array(N).fill(null)),min=pts.map(()=>Array(N).fill(null));const B=10;
 for(let i=0;i<N;i+=B)for(let j=0;j<N;j+=B){const O=pts.slice(i,i+B),D=pts.slice(j,j+B);const u=CFG.live.conn.neshanUrl+'/v1/distance-matrix'+(CFG.live.conn.neshanTraffic?'':'/no-traffic')+'?type=car&origins='+O.map(p=>p[0]+','+p[1]).join('|')+'&destinations='+D.map(p=>p[0]+','+p[1]).join('|');
  const r=await getJ(u,{headers:{'Api-Key':K},timeout:30000});if(r.status&&!/^ok$/i.test(r.status))throw new Error('Neshan: '+r.status);
  (r.rows||[]).forEach((row,a)=>(row.elements||[]).forEach((el,b)=>{if(el&&/^ok$/i.test(el.status||'Ok')&&el.distance){km[i+a][j+b]=Math.round(el.distance.value/100)/10;min[i+a][j+b]=Math.round(el.duration.value/60)}}))}
 return {km,min}}
{const _rm=routeMatrix;routeMatrix=async function(pts){const K=CFG.live.conn.neshanKey;
 if(K&&Array.isArray(pts)&&pts.length>=2&&pts.length<=40){const P=pts.map(p=>[+(+p[0]).toFixed(5),+(+p[1]).toFixed(5)]);if(P.every(p=>isFinite(p[0])&&isFinite(p[1])&&inIR(p))){const key='nmx|'+sha(JSON.stringify(P)).slice(0,24);const C=cGet(key,7*864e5);if(C)return {...C,cached:true};
  try{const m=await neshanMatrix(P);const out={src:'Neshan (جادهٔ واقعی ایران)',fetched:Date.now(),...m};cSet(key,out);lstat('neshan',true,'matrix '+P.length);return out}catch(e){lstat('neshan',false,e.message)}}}
 return _rm(pts)}}
async function neshanGeocode(q,city){const K=CFG.live.conn.neshanKey;if(!K)throw E(501,'کلید نشان (IFA_NESHAN_KEY) تنظیم نشده است — platform.neshan.org');q=String(q||'').trim().slice(0,200);if(q.length<3)throw E(400,'آدرس کوتاه است');
 const key='ngc|'+sha(q+'|'+(city||'')).slice(0,20);const C=cGet(key,90*864e5);if(C)return {...C,cached:true};let j=null,err='';
 for(const v of ['v6','v4']){try{j=await getJ(CFG.live.conn.neshanUrl+'/'+v+'/geocoding?address='+encodeURIComponent(q)+(city?'&city='+encodeURIComponent(city):''),{headers:{'Api-Key':K},timeout:15000});break}catch(e){err=e.message}}
 if(!j){lstat('neshan',false,err);throw E(502,'نشان: '+err)}const L=j.location||(j.items&&j.items[0]&&j.items[0].location)||{};const lat=+(L.y??L.lat),lng=+(L.x??L.lng);
 if(!isFinite(lat)||!isFinite(lng))throw E(404,'آدرس یافت نشد');const out={q,lat,lng,src:'Neshan',fetched:Date.now()};cSet(key,out);lstat('neshan',true,'geocode');return out}
route('GET','/api/live/geocode',async req=>{const s=new URL(req.url,'http://x').searchParams;return neshanGeocode(s.get('q'),s.get('city'))},'');

/* ---------- 3) DCSA Commercial Schedules: point-to-point sailings from configured carriers ---------- */
const LOCODE=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5);
const dIso=t=>new Date(t).toISOString().slice(0,10);
function schedNorm(r,prov){const legs=Array.isArray(r.legs)?r.legs:[];const dep=(legs[0]&&legs[0].departure)||r.placeOfReceipt||{},arr=(legs[legs.length-1]&&legs[legs.length-1].arrival)||r.placeOfDelivery||{};
 const etd=dep.dateTime||dep.date||r.departureDateTime||'',eta=arr.dateTime||arr.date||r.arrivalDateTime||'';const tt=r.transitTime!=null?+r.transitTime:(etd&&eta?Math.round((Date.parse(eta)-Date.parse(etd))/864e5):null);
 const sea=legs.filter(l=>{const m=String((l.transport&&l.transport.modeOfTransport)||l.modeOfTransport||'VESSEL').toUpperCase();return m.includes('VESSEL')||m==='SEA'});
 const vsl=sea.map(l=>{const t=l.transport||{};return clean((t.vessel&&(t.vessel.name||t.vessel.vesselName))||t.vesselName||'')}).filter(Boolean);
 const svc=sea.map(l=>{const t=l.transport||{};const sp=(t.servicePartners||[])[0]||{};return clean(sp.carrierServiceName||sp.carrierServiceCode||t.carrierServiceName||t.serviceName||'')}).filter(Boolean);
 const co=(r.cutOffTimes||[]).map(c=>({code:c.cutOffDateTimeCode||c.code||'',at:c.cutOffDateTime||c.dateTime||''})).filter(c=>c.at);
 return {carrier:prov,etd,eta,transitDays:isFinite(tt)?tt:null,transshipments:Math.max(0,sea.length-1),vessels:[...new Set(vsl)],services:[...new Set(svc)],cutoffs:co.slice(0,6),legs:legs.length}}
async function schedules(from,to,start,weeks){from=LOCODE(from);to=LOCODE(to);if(from.length!==5||to.length!==5)throw E(400,'کد UN/LOCODE پنج‌حرفی مبدأ و مقصد لازم است (مثلاً CNSHA → AEJEA)');
 const P=CFG.live.conn.schedules;if(!P.length)throw E(501,'هیچ ارائه‌دهندهٔ برنامهٔ حرکت (DCSA Commercial Schedules) تنظیم نشده است — live.conn.schedules در config.json یا IFA_SCHED_URL/IFA_SCHED_KEY');
 const s0=start&&/^\d{4}-\d\d-\d\d$/.test(start)?start:dIso(Date.now());const w=Math.min(8,Math.max(1,+weeks||4));const s1=dIso(Date.parse(s0)+w*7*864e5);
 const key='sch|'+from+'|'+to+'|'+s0+'|'+w+'|'+P.map(p=>p.name).join(',');const C=cGet(key,6*3600e3);if(C)return {...C,cached:true};
 const res=await Promise.all(P.map(async p=>{const q=new URLSearchParams({[p.q.from]:from,[p.q.to]:to,[p.q.start]:s0,[p.q.end]:s1,...p.extra});const h={Accept:'application/json'};if(p.key)h[p.header]=p.key;
  try{const j=await getJ(p.baseUrl+p.path+'?'+q.toString(),{headers:h,timeout:30000});const A=Array.isArray(j)?j:(j.routes||j.pointToPointRoutes||j.data||[]);const L=(Array.isArray(A)?A:[]).slice(0,60).map(r=>schedNorm(r,p.name)).filter(x=>x.etd);lstat('sched:'+p.name,true,L.length+' sailings');return {name:p.name,ok:true,n:L.length,L}}
  catch(e){lstat('sched:'+p.name,false,e.message);return {name:p.name,ok:false,err:String(e.message).slice(0,160),L:[]}}}));
 const S=res.flatMap(r=>r.L).sort((a,b)=>String(a.etd).localeCompare(String(b.etd)));const T=S.map(x=>x.transitDays).filter(x=>x!=null).sort((a,b)=>a-b);
 const out={from,to,window:[s0,s1],providers:res.map(({L,...r})=>r),sailings:S,stats:{n:S.length,earliest:S[0]?S[0].etd:null,fastest:T[0]??null,medianTransit:T.length?T[Math.floor(T.length/2)]:null,direct:S.filter(x=>!x.transshipments).length},src:'DCSA Commercial Schedules',fetched:Date.now()};
 if(res.some(r=>r.ok))cSet(key,out);return out}
route('GET','/api/live/schedules',async req=>{const s=new URL(req.url,'http://x').searchParams;return schedules(s.get('from'),s.get('to'),s.get('start'),s.get('weeks'))},'');

/* ---------- connector registry (what is connected, last result, how to enable) ---------- */
route('GET','/api/live/connectors',()=>{const st=k=>LST[k]||null;const X=CFG.live.ext||{};const c=CFG.live.conn;
 const L=[
  {id:'fx',name:'نرخ ارز رسمی و بازار آزاد',mode:'fx',on:true,via:CFG.live.fx.market,status:st('fx')||st('fxMarket'),env:'IFA_FX_MARKET · IFA_NAVASAN_KEY'},
  {id:'indices',name:'شاخص‌های کرایه (CCFI/SCFI/WCI/FBX) و سوخت',mode:'sea',on:!!(CFG.live.market&&CFG.live.market.enabled),status:st('market')||st('indices'),env:'IFA_LIVE_OFF=market برای خاموش'},
  {id:'freightos',name:'برآورد بازار Freightos',mode:'multi',on:!!X.freightos,status:st('freightos'),env:'live.ext.freightos'},
  {id:'rateApi',name:X.custom&&X.custom.name||'API نرخ سفارشی',mode:'multi',on:!!(X.custom&&X.custom.url),status:st('custom')||st('rateApi'),env:'IFA_RATEAPI_URL · IFA_RATEAPI_KEY · IFA_RATEAPI_HEADER · IFA_RATEAPI_PATH'},
  {id:'hsOfficial',name:'نامگذاری رسمی HS 2022 (UK Trade Tariff)',mode:'customs',on:c.hsOfficial,status:st('hsOfficial'),env:'رایگان، بدون کلید · IFA_HS_OFFICIAL=0 برای خاموش',docs:CONN_DOCS.uk},
  {id:'neshan',name:'نشان — فاصلهٔ جاده‌ای واقعی ایران و آدرس‌یابی',mode:'road',on:!!c.neshanKey,status:st('neshan'),env:'IFA_NESHAN_KEY',docs:CONN_DOCS.neshan},
  {id:'routing',name:CFG.live.routing.orsKey?'OpenRouteService (کامیون)':'OSRM — فاصلهٔ جاده‌ای بین‌المللی',mode:'road',on:true,status:st('routing'),env:'IFA_ORS_KEY · IFA_OSRM_URL'},
  ...(c.schedules.length?c.schedules.map(p=>({id:'sched:'+p.name,name:'برنامهٔ حرکت '+p.name+' (DCSA)',mode:'sea',on:true,status:st('sched:'+p.name),env:'live.conn.schedules',docs:CONN_DOCS.dcsa})):[{id:'sched',name:'برنامهٔ حرکت خطوط (DCSA Commercial Schedules)',mode:'sea',on:false,status:null,env:'IFA_SCHED_URL · IFA_SCHED_KEY · IFA_SCHED_HEADER · IFA_SCHED_NAME یا live.conn.schedules',docs:CONN_DOCS.dcsa}]),
  {id:'track',name:'رهگیری DCSA Track & Trace',mode:'sea',on:!!(CFG.dcsa&&CFG.dcsa.baseUrl),status:null,env:'IFA_DCSA_URL · IFA_DCSA_KEY'},
  {id:'sanctions',name:'فهرست‌های تحریم OFAC/UN/EU',mode:'compliance',on:!!CFG.live.sanctions.enabled,status:st('sanctions'),env:'روزانه'},
  {id:'weather',name:'آب‌وهوای محورها و مرزها (Open-Meteo)',mode:'road',on:!!CFG.live.weather.enabled,status:st('weather'),env:'—'}];
 if(typeof connExtra==='function')try{L.push(...connExtra(st))}catch(e){}
 return {connectors:L,on:L.filter(x=>x.on).length,total:L.length}});
