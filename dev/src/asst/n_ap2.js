/* ---------- v15.18: instant mode (no UI driving), stage timeouts + retry, checkpoints & resume, value provenance, scenario matrix, executable findings, decision card, server run log ---------- */
APS.splice(APS.findIndex(s=>s[0]==='dom')+1,0,['scen','مقایسهٔ سناریوها و ماتریس تصمیم','cost']);
const APREC=['job','quote','bkg','docs','cus'];
const APCKK='ifa-ap-ck';
/* --- instant mode: UI helpers become no-ops while AP.fast --- */
{const W=(f,v)=>function(...a){return AP.fast&&AP.run?v:f.apply(this,a)};
 const g0=apGo,t0=apType,c0=apClick,b0=apBtn,s0=apSeg,m0=apMove,f0=apFind,w0=apWipe,y0=apFly,i0=apIntro,aw=apW;
 apGo=W(g0,Promise.resolve());apType=W(t0,Promise.resolve());apClick=W(c0,Promise.resolve());apBtn=W(b0,Promise.resolve(true));apSeg=W(s0,Promise.resolve());apMove=W(m0,Promise.resolve());apFind=W(f0,Promise.resolve(null));apWipe=W(w0,undefined);apFly=W(y0,undefined);
 apIntro=S=>AP.fast?Promise.resolve():i0(S);
 /* orphan guard: a timed-out stage stops at its next wait; instant mode skips animation waits */
 apW=async ms=>{const t=AP.tok;await aw(AP.fast?0:ms);if(AP.run&&t!==AP.tok)throw APSKIP}}
const apWith=async(name,over,fn)=>{const f0=IFA[name];IFA[name]=(o={},...r)=>f0(Object.assign({},over,o),...r);try{return await fn()}finally{IFA[name]=f0}};
/* stage variants used in instant mode (same calculations, no screen reading) */
const APH={
 async route(S){const R=IFA.optimize({from:S.o.id,to:S.d.id});const b=R.find(c=>c.rank===1)||R[0];if(!b)throw new Error('بهینه‌ساز گزینه‌ای برنگرداند');S.opt=R.slice(0,5);
  apVal('p50','هزینهٔ میانه (P50)',usd(b.costP50));apVal('d50','زمان میانه',fa(nf(b.daysP50,1))+' روز (P90 '+fa(nf(b.daysP90,1))+')');apVal('otd','تحویل به‌موقع',apPct(b.onTime));apVal('tops','امتیاز TOPSIS',fa(nf(b.score,3)));apVal('best','گزینهٔ برتر بهینه‌ساز',String(b.name||'').slice(0,60),1);
  if(svOn()&&AP.opts.server&&S.pol&&S.pod&&!S.sched){try{const C=await cnSched(apLoc(S.pol),apLoc(S.pod));S.sched=C.stats}catch(e){}}},
 landed:S=>apWith('landedCost',{route:S.sel,inc:S.cargo.incoterm||'CFR'},()=>APF.landed(S)),
 ins(S){const c=S.cargo;const cls=c.dg?'dg':c.reefer?'rf':{machinery:'mach',auto:'mach',electronics:'elec',steel:'bulk'}[c.commodity]||'gen';return apWith('cargoLiability',{cls,cl:'A'},()=>APF.ins(S))},
 dd(S){if(!S.sea)return APF.dd(S);const o={ct:String(S.eq||'40').startsWith('20')?'20':'40',n:S.ncont||1};const p=apDD(S.pod);if(p)o.port=p;return apWith('demurrage',o,()=>APF.dd(S))},
 async track(S){const n0=new Set(IFA.shipments.list().map(x=>x.id));IFA.shipments.create({route:S.sel});const L=IFA.shipments.list();const s=L.find(x=>!n0.has(x.id))||L[0];S.ship=s;apVal('trk','محموله برای رهگیری',(s&&(s.ref||s.id))+(s&&s.state&&s.state.eta?' · ETA '+new Date(s.state.eta).toLocaleDateString('fa-IR'):''),1)},
 async final(S){apSay('جمع‌بندی نتایج همهٔ عامل‌ها')}};
APREC.forEach(k=>APH[k]=async()=>{AP.note[k]='حالت فوری — با «ثبت سوابق» در کارت تصمیم';return 'skip'});
/* --- scenario matrix: every candidate route re-costed with the same assumptions --- */
const APWT={cost:.45,days:.3,risk:.25};
function apScenRows(S){const C=S.C||asCtxSafe();const R=(C&&C.routes)||[];const inc=S.cargo.incoterm||'CFR';
 const rows=R.slice(0,5).map((r,i)=>{let L=null;try{L=IFA.landedCost({route:i,inc})}catch(e){}return {i,name:'#'+fa(i+1)+' '+r.name,cost:L?L.totalUSD:Math.round(r.total||0),landed:L?L.landedUSD:0,days:+(L?L.days:r.avgDays||0),risk:+r.risk||0,rel:+r.reliability||0,co2:Math.round(r.co2||0)}}).filter(r=>r.cost>0);
 const k=S.cal&&S.cal.base>0?S.cal.adj/S.cal.base:1;if(k!==1)rows.forEach(r=>{r.costCal=Math.round(r.cost*k)});
 const mm=f=>{const v=rows.map(f);return [Math.min(...v),Math.max(...v)]};const nz=(x,[a,b])=>b>a?(b-x)/(b-a):1;const C0=mm(r=>r.cost),D0=mm(r=>r.days),K0=mm(r=>r.risk);
 rows.forEach(r=>{r.nc=nz(r.cost,C0);r.nd=nz(r.days,D0);r.nr=nz(r.risk,K0);r.score=+(APWT.cost*r.nc+APWT.days*r.nd+APWT.risk*r.nr).toFixed(3)});
 const ord=rows.slice().sort((a,b)=>b.score-a.score);ord.forEach((r,j)=>r.rank=j+1);return {rows,ord,best:ord[0],cur:rows.find(r=>r.i===S.sel)||rows[0],w:APWT,inc,calK:k}}
APF.scen=APH.scen=async function(S){if(!AP.fast){await apGo('cost');await apW(300)}const X=apScenRows(S);if(X.rows.length<2){apSay('مسیر جایگزینی برای مقایسه وجود ندارد');return 'skip'}
 try{const M=IFA.monteCarlo(1500);S.mc=M}catch(e){}
 try{const I=IFA.incoterms(AP.opts.margin||0);const b=I.slice().sort((a,b)=>a.effectiveBuyerUSD-b.effectiveBuyerUSD)[0];X.inco=I;if(b){X.bestInc=b.incoterm;apVal('inc','اینکوترمز ارزان‌تر برای خریدار',b.incoterm+' · مؤثر '+usd(b.effectiveBuyerUSD)+' (فعلی '+X.inc+')',1)}}catch(e){}
 S.scen=X;const B=X.best,Cu=X.cur;apSay('ماتریس تصمیم برای '+fa(X.rows.length)+' مسیر ساخته شد (هزینه ۴۵٪، زمان ۳۰٪، ریسک ۲۵٪)','cost');
 apVal('scen','ماتریس تصمیم ('+fa(X.rows.length)+' مسیر)','برتر: '+B.name.slice(0,34)+' · '+usd(B.cost)+' · '+fa(nf(B.days,1))+' روز · امتیاز '+fa(Math.round(B.score*100)),1);
 if(S.mc)apVal('band','بازهٔ هزینهٔ کامل (P10–P90)',usd(S.mc.p10)+' تا '+usd(S.mc.p90)+' · میانه '+usd(S.mc.p50))};
APTH.scen=S=>{const X=S.scen;if(!X)return;const B=X.best,Cu=X.cur;if(B&&Cu&&B.i!==Cu.i&&B.score-Cu.score>=.08){const dc=B.cost-Cu.cost,dd=B.days-Cu.days;apFind_('scen','alt','md','مسیر «'+B.name+'» امتیاز بهتری از مسیر انتخابی دارد','هزینهٔ کامل '+(dc>0?'+':'')+usd(dc)+' · زمان '+(dd>0?'+':'')+fa(nf(dd,1))+' روز · ریسک '+fa(Cu.risk)+' → '+fa(B.risk),'cost','مقایسه و انتخاب مسیر')}
 if(S.mc&&S.mc.p50>0&&(S.mc.p90-S.mc.p10)/S.mc.p50>.35)apFind_('scen','band','lo','عدم‌قطعیت هزینه زیاد است (P10–P90: '+usd(S.mc.p10)+' تا '+usd(S.mc.p90)+')','در پیشنهاد قیمت به مشتری حاشیهٔ احتیاط یا اعتبار کوتاه‌تر بگذارید؛ بزرگ‌ترین عامل: '+((S.mc.drivers||[])[0]||{}).category,'cost')};
/* --- provenance: source, method, confidence, freshness, band per value --- */
const apDays=t=>{if(!t)return '';const d=(Date.now()-(typeof t==='number'?t:Date.parse(t)))/864e5;return !isFinite(d)?String(t):d<1/24?'همین حالا':d<1?fa(Math.round(d*24))+' ساعت پیش':fa(Math.round(d))+' روز پیش'};
const APV={
 od:()=>({src:'انتخاب شما روی نقشه',conf:1}),cg:()=>({src:'مشخصات بار واردشده',conf:1}),rt:()=>({src:'مسیرهای ساخته‌شده روی نقشه',conf:1}),
 fr:()=>({src:'مدل مسیر (نرخ‌های مرجع کریدورها)',f:'جمع کرایهٔ بخش‌های مسیر + هزینه‌های گذر',conf:.55}),
 p50:()=>({src:'بهینه‌ساز چندمعیاره با شبیه‌سازی عدم‌قطعیت',f:'میانهٔ توزیع هزینهٔ مسیر برتر',conf:.65}),d50:()=>({src:'بهینه‌ساز چندمعیاره',f:'میانه و صدک ۹۰ زمان ترانزیت',conf:.65}),otd:()=>({src:'بهینه‌ساز چندمعیاره',f:'سهم اجراهای شبیه‌سازی که در مهلت می‌رسند',conf:.6}),tops:()=>({src:'TOPSIS با وزن‌های پروفایل متعادل',conf:.7}),best:()=>({src:'بهینه‌ساز چندمعیاره',conf:.7}),
 live:S=>{const b=S.liveQ||{};const src=[...new Set((b.legs||[]).map(l=>l.sourceName).filter(Boolean))];return {src:'نرخ روز: '+(src.join('، ')||'مدل'),f:'کرایهٔ بخش‌ها با آخرین نرخ هر منبع؛ نبود داده = نرخ مدل',conf:b.confidence,at:(b.legs||[]).map(l=>l.date).filter(Boolean).sort()[0]}},
 liveR:S=>APV.live(S),sch:()=>({src:'برنامهٔ حرکت خطوط کشتیرانی (ارائه‌دهندگان متصل)',conf:.9,at:Date.now()}),
 land:S=>({src:'مدل هزینهٔ کامل زنجیره',f:'جمع '+fa(((S.landed||{}).lines||[]).length)+' قلم هزینه (کرایه، THC، بیمه، گمرک، حمل داخلی…) · اینکوترمز '+(S.cargo.incoterm||'CFR'),conf:S.cal?.8:.6,band:S.mc?[S.mc.p10,S.mc.p90]:null}),
 landV:S=>({src:'مدل هزینهٔ کامل + ارزش کالا',f:'ارزش کالا + هزینهٔ کامل لجستیک',conf:S.cal?.8:.6}),buy:()=>({src:'قواعد اینکوترمز ۲۰۲۰',f:'تفکیک اقلام بین فروشنده و خریدار',conf:.85}),
 cal:S=>({src:'فاکتورهای واقعی ثبت‌شده روی سرور ('+fa((S.cal||{}).nAll||0)+' ردیف)',f:'ضریب تصحیح سلسله‌مراتبی: مسیر ← شیوهٔ حمل ← کل',conf:Math.min(.95,.5+((S.cal||{}).nAll||0)/40)}),
 port:S=>({src:'تعرفهٔ بندری ثبت‌شده'+((S.port||{}).name?' · '+S.port.name:''),f:'تخلیه/بارگیری + انبارداری پلکانی پس از '+fa((S.port||{}).free||0)+' روز آزاد',conf:.85}),
 pack:()=>({src:'موتور چیدمان سه‌بعدی (اقلام بار)',f:'چیدمان حریصانه با محدودیت وزن، چرخش و چیدن روی هم',conf:.8}),
 tbk:S=>({src:'کتاب تعرفهٔ ایران روی سرور'+(IR.tbMeta&&IR.tbMeta.label?' · '+IR.tbMeta.label:''),f:S.tb&&S.tb.match==='exact'?'تطبیق دقیق ۸ رقمی':'نزدیک‌ترین ردیف (والد/زیرشاخه)',conf:S.tb&&S.tb.match==='exact'?.95:.7,at:IR.tbMeta&&IR.tbMeta.at}),
 cfx:S=>({src:'نرخ ارز گمرکی ثبت‌شده روی سرور',conf:.9,at:S.cfx&&S.cfx.date}),
 hs:S=>({src:S.hsSrc||'—',conf:/کاربر/.test(S.hsSrc||'')?1:/عامل/.test(S.hsSrc||'')?.7:.4}),
 duty:S=>({src:S.tb?'کتاب تعرفهٔ ایران':'جدول تقریبی فصل‌های تعرفه',f:'ارزش گمرکی (CIF × نرخ ارز گمرکی) × نرخ حقوق + ارزش افزوده + هلال احمر',conf:S.tb&&S.cfx?.85:S.tb?.7:.45}),
 hsv:()=>({src:'نامگذاری رسمی HS 2022',conf:.95,at:Date.now()}),perm:()=>({src:'جدول مجوزهای ورود (داخلی برنامه)',conf:.6}),
 ins:()=>({src:'مدل نرخ بیمهٔ باربری',f:'ارزش بیمه‌ای (۱۱۰٪ CIF) × نرخ پوشش ICC A + جنگ',conf:.6}),insV:()=>({src:'قاعدهٔ ۱۱۰٪ CIF',conf:.9}),
 sanc:()=>({src:'فهرست‌های تحریم (OFAC، سازمان ملل، اتحادیهٔ اروپا…)',f:'تطبیق فازی نام با آستانهٔ ۸۶٪',conf:.75}),
 risk:()=>({src:'ماتریس ریسک مسیر',f:'احتمال × اثر برای هر ریسک',conf:.6}),risk1:()=>APV.risk(),
 dd:()=>({src:'جدول زمان آزاد و نرخ خطوط و بنادر',f:'روزهای پس از زمان آزاد × نرخ پلکانی',conf:.6}),ddf:()=>APV.dd(),dom:()=>({src:'مدل نرخ حمل جاده‌ای داخلی',f:'مسافت × نرخ تن-کیلومتر + هزینه‌های جانبی',conf:.6}),
 scen:S=>({src:'محاسبهٔ دوبارهٔ مدل برای هر مسیر با فرض‌های یکسان',f:'امتیاز = ۰٫۴۵ هزینه + ۰٫۳۰ زمان + ۰٫۲۵ ریسک (نرمال‌شده)'+(S.scen&&S.scen.calK!==1?' · کالیبره با فاکتورهای واقعی':''),conf:.7}),
 band:S=>({src:'شبیه‌سازی مونت‌کارلو (۱۵۰۰ اجرا)',f:'صدک ۱۰ و ۹۰ هزینهٔ کامل',conf:.7,band:S.mc?[S.mc.p10,S.mc.p90]:null}),inc:()=>({src:'مقایسهٔ اینکوترمزها با حاشیهٔ فروشنده',conf:.7}),
 rfq:()=>({src:'رکورد داخلی برنامه',conf:1}),job:()=>({src:'رکورد داخلی برنامه',conf:1}),quo:()=>({src:'رکورد داخلی برنامه',conf:1}),bkg:()=>({src:'رکورد داخلی برنامه',conf:1}),docs:()=>({src:'رکورد داخلی برنامه',conf:1}),cus:()=>({src:'رکورد داخلی برنامه',conf:1}),trk:()=>({src:'رکورد داخلی برنامه',conf:1})};
apVal=function(k,label,value,w,meta){let p={};try{p=APV[k]?APV[k](AP.S||{}):{}}catch(e){}p=Object.assign({at:Date.now()},p,meta||{});if(p.conf==null||!isFinite(p.conf))delete p.conf;
 const i=AP.vals.findIndex(x=>x.k===k);const o={k,label,value:String(value),w:!!w,n:Date.now(),view:wrap?view:'map',p};if(i>=0)AP.vals[i]=o;else AP.vals.push(o);apFly(String(value).slice(0,46));apHud()};
const apConfL=c=>c==null?'':c>=.85?'بالا':c>=.65?'متوسط':'پایین';const apConfC=c=>c==null?'':c>=.85?'hi':c>=.65?'md':'lo';
function apPvHtml(v){const p=v.p||{};const R=[['منبع',p.src],['روش',p.f],['اطمینان',p.conf!=null?`<span class="cf" data-c="${apConfC(p.conf)}"><i style="width:${Math.round(p.conf*100)}%"></i></span>${apConfL(p.conf)} (${fa(Math.round(p.conf*100))}٪)`:''],['تازگی داده',p.at?apDays(p.at):''],['بازهٔ P10–P90',p.band?usd(p.band[0])+' تا '+usd(p.band[1]):'']].filter(r=>r[1]);
 return R.map(r=>`<div><span>${r[0]}</span><b>${r[0]==='اطمینان'?r[1]:esc(String(r[1]))}</b></div>`).join('')||'<div><span>منبع</span><b>—</b></div>'}
/* --- checkpoints: saved after each stage; resume after reload/crash --- */
const APCKS=['liveQ','sched','landed','cal','port','portNo','eq','ncont','packU','packX','hs','hsSrc','tb','tbN','cfx','duty','hsOk','hsOff','hsHead','ins','sancHits','risks','dd','domc','rfq','job','jobv','ship','scen','mc','opt'];
function apCk(k,st){try{const S=AP.S;if(!S)return;const ck=LSG(APCKK,null);const c=ck&&ck.t0===AP.t0?ck:{v:1,t0:AP.t0,lane:S.o.id+'>'+S.d.id,sel:S.sel,name:S.o.nameFa+' ← '+S.d.nameFa,opts:{...AP.opts},list:(AP.list||[]).map(s=>s[0]),st:{}};
 c.st[k]=st;c.at=Date.now();c.S={};APCKS.forEach(x=>{if(S[x]!==undefined)c.S[x]=S[x]});c.vals=AP.vals.slice(-80);c.finds=(AP.finds||[]).slice(-60);c.note={...AP.note};LSS(APCKK,c);apCkPush(c)}catch(e){}}
let apCkT=0;function apCkPush(c){if(!svOn())return;clearTimeout(apCkT);apCkT=setTimeout(()=>{svApi('/api/ap/ckpt',{method:'PUT',body:c}).catch(()=>{})},600)}
function apCkClear(){try{localStorage.removeItem(APCKK)}catch(e){}if(svOn())svApi('/api/ap/ckpt',{method:'DELETE'}).catch(()=>{})}
/* --- stage executor: timeout (pause-aware), retry on network errors, checkpoint --- */
const APTO={route:30e3,live:30e3,tariff:40e3,sanc:40e3,landed:30e3,scen:25e3};
const apTOms=k=>AP.fast?(APTO[k]||20e3):Math.max(90e3,(APTO[k]||20e3)*3)*Math.max(1,AP.k||1);
function apTO(p,ms){p.catch(()=>{});return new Promise((res,rej)=>{let el=0;const iv=setInterval(()=>{if(AP.stop){clearInterval(iv);return rej(APSTOP)}if(AP.skip){AP.skip=false;clearInterval(iv);return rej(APSKIP)}if(!AP.pause)el+=200;if(el>=ms){clearInterval(iv);const e=new Error('مهلت '+fa(Math.round(ms/1000))+' ثانیه‌ای مرحله تمام شد');e.apTO=1;rej(e)}},200);p.then(v=>{clearInterval(iv);res(v)},e=>{clearInterval(iv);rej(e)})})}
{const x0=apExec;apExec=async function(k,S,n,ag){
 const R=AP.resume;if(R&&!AP.resumed){AP.resumed=true;Object.assign(S,R.S||{});AP.vals=(R.vals||[]).slice();AP.finds=(R.finds||[]).slice();apSay('ادامه از نقطهٔ بازیابی '+new Date(R.at||Date.now()).toLocaleTimeString('fa-IR'),'orc')}
 if(R&&R.st&&(R.st[k]==='ok'||R.st[k]==='skip')){AP.note[k]=(R.note&&R.note[k])||'از نقطهٔ بازیابی';apCk(k,R.st[k]);return R.st[k]==='skip'?'skip':undefined}
 const fn=AP.fast&&APH[k]?()=>APH[k](S):()=>x0(k,S,n,ag);let tries=0;
 for(;;){AP.tok=(AP.tok||0)+1;try{const r=await apTO(Promise.resolve().then(fn),apTOms(k));apCk(k,r==='skip'?'skip':'ok');return r}
  catch(e){if(e===APSTOP)throw e;if(e===APSKIP){AP.tok++;apCk(k,'skip');throw e}if(e&&e.apTO){AP.tok++;apCk(k,'warn');AP.tmo=(AP.tmo||0)+1;throw e}
   const m=String(e&&e.message||e);if(tries<(AP.opts.retry??1)&&/fetch|network|شبکه|Failed|timed? ?out|ECONN|50[234]|ارتباط/i.test(m)){tries++;apSay('🔁 خطای ارتباط در «'+n+'»؛ تلاش دوباره ('+fa(tries)+')','orc');await apSleep(700*tries);continue}
   apCk(k,'warn');throw e}}}}
/* --- start wrapper: instant flag, resume, report to server --- */
{const s0=apStart;apStart=async function(over){if(AP.run)return;if(over)Object.assign(AP.opts,over);AP.fast=AP.opts.speed==='instant';AP.resumed=false;AP.tmo=0;
 if(!AP.resume){try{localStorage.removeItem(APCKK)}catch(e){}}
 try{await s0()}finally{const R=AP.resume;AP.resume=null;if(AP.done&&AP.S){if(!AP.stopped)apCkClear();if(!AP.stopped)apReport().catch(()=>{})}$('.ap-rsm')?.remove()}}}
function apResume(ck){ck=ck||LSG(APCKK,null);if(!ck)return toast('نقطهٔ بازیابی وجود ندارد');const S=apShip();if(!S||S.o.id+'>'+S.d.id!==ck.lane)return toast('برای ادامه، همان مسیر «'+ck.name+'» را روی نقشه انتخاب کنید');
 if(S.sel!==ck.sel){const c=$$('.rcard')[ck.sel];if(c)c.click()}AP.resume=ck;const o={...ck.opts};apStart(o)}
function apResumeTick(){if(AP.run||$('.ap-rsm')||$('.ap-hud:not(.out)')||$('.apx-pre-bg'))return;const ck=LSG(APCKK,null);if(!ck||!ck.st||Date.now()-(ck.at||0)>24*3600e3)return;const done=Object.keys(ck.st).length,N=(ck.list||[]).length;if(!N||done>=N)return;const S=apShip();if(!S)return;
 const same=S.o.id+'>'+S.d.id===ck.lane;const nx=(APS.find(s=>s[0]===(ck.list||[])[done])||[0,'—'])[1];const d=document.createElement('div');d.className='ap-rsm';
 d.innerHTML=`<span class="ic">${ASI.bolt}</span><div><b>اجرای ناتمام کنترل خودکار</b><small>${esc(ck.name)} · ${fa(done)} از ${fa(N)} مرحله · ${apDays(ck.at)}${same?' · بعدی: '+esc(nx):' · برای ادامه همین مسیر را انتخاب کنید'}</small></div>${same?'<button class="go">ادامه از همین‌جا</button>':''}<button class="no">حذف</button>`;document.body.appendChild(d);
 $('.no',d).onclick=()=>{apCkClear();d.remove()};const g=$('.go',d);if(g)g.onclick=()=>{d.remove();apResume(ck)}}
setTimeout(async()=>{if(!LSG(APCKK,null)&&svOn()){try{const r=await svApi('/api/ap/ckpt');if(r&&r.ck&&r.ck.st)LSS(APCKK,r.ck)}catch(e){}}apResumeTick();setInterval(()=>{if(!$('.ap-rsm'))apResumeTick()},5000)},3500);
/* --- executable findings: what-if, before/after, optional apply --- */
const apSelRoute=i=>{const c=$$('.rcard')[i];if(c){c.click();return true}const E=window.__IFA_E;if(E&&E.setSelected){E.setSelected(i);return true}return false};
const apDl=(a,b,f)=>{const d=b-a;const p=a?Math.round(d/a*100):0;return (d>0?'+':d<0?'−':'')+f(Math.abs(d))+(a?' ('+(p>0?'+':'')+fa(p)+'٪)':'')};
const APWI={
 'scen.alt':S=>{const X=S.scen||apScenRows(S);const B=X.best,C=X.cur;return {rows:[['هزینهٔ کامل',C.cost,B.cost,usd],['زمان (روز)',C.days,B.days,x=>fa(nf(x,1))],['ریسک',C.risk,B.risk,fa],['امتیاز',Math.round(C.score*100),Math.round(B.score*100),fa,1]],note:'«'+C.name+'» ← «'+B.name+'»',apply:B.i!==C.i&&{label:'انتخاب این مسیر',fn:()=>{apSelRoute(B.i);toast('مسیر «'+B.name+'» انتخاب شد؛ برای محاسبهٔ کامل دوباره اجرا کنید')}}}},
 'route.otd':S=>{const X=S.scen||apScenRows(S);const C=X.cur;const F=X.rows.filter(r=>r.i!==C.i).sort((a,b)=>a.days-b.days)[0];if(!F)return null;return {rows:[['زمان (روز)',C.days,F.days,x=>fa(nf(x,1))],['هزینهٔ کامل',C.cost,F.cost,usd],['ریسک',C.risk,F.risk,fa]],note:'سریع‌ترین جایگزین: «'+F.name+'»',apply:{label:'انتخاب مسیر سریع‌تر',fn:()=>{apSelRoute(F.i);toast('مسیر سریع‌تر انتخاب شد')}}}},
 'live.dev':S=>{const b=S.liveQ,m=+S.R.total||0,L=S.landed;if(!b||!m||!L)return null;const adj=Math.round(L.totalUSD-m+b.liveUSD);return {rows:[['کرایهٔ حمل (مدل ← روز)',m,b.liveUSD,usd],['هزینهٔ کامل لجستیک',L.totalUSD,adj,usd],['بهای تمام‌شده در مقصد',L.landedUSD,Math.round(L.landedUSD-L.totalUSD+adj),usd]],note:'کرایهٔ مدل با نرخ روز جایگزین شد (اطمینان دادهٔ روز '+apPct(b.confidence)+')'+(b.confidence<.6?' — پیش از قیمت‌دهی با استعلام واقعی تأیید کنید':''),apply:{label:'مبنا قرار دادن نرخ روز در کارت تصمیم',fn:()=>{S.liveAdj=adj;apVal('landL','هزینهٔ کامل با نرخ روز',usd(adj)+' (مدل '+usd(L.totalUSD)+')',1,{src:'هزینهٔ کامل مدل با کرایهٔ دادهٔ روز',f:'هزینهٔ کامل − کرایهٔ مدل + کرایهٔ روز',conf:b.confidence});toast('نرخ روز در مقادیر ثبت شد')}}}},
 'landed.ptd':async S=>{const P=S.port;if(!P)return null;const pc=irDestPort();const r=await svApi('/api/ports/tariff/calc',{method:'POST',body:{port:pc,eq:S.cargo.containerType||'40HC',qty:1,days:P.free,tons:Math.round((+S.cargo.weightKg||0)/1000),reefer:!!S.cargo.reefer}});return {rows:[['روز توقف',P.days,P.free,fa],['هزینهٔ بندری',P.totalIRR,r.totalIRR,apRial]],note:'ترخیص در زمان آزاد بندر',apply:{label:'برنامه‌ریزی ترخیص در '+fa(P.free)+' روز',fn:()=>{AP.opts.dwell=P.free;LSS('ifa-ap-opt',AP.opts);toast('مدت توقف پیش‌فرض بندر '+fa(P.free)+' روز شد')}}}},
 'load.util':S=>apEqWI(S),'load.unpl':S=>apEqWI(S),
 'ins.rate':S=>{const c=S.cargo;const cls=c.dg?'dg':c.reefer?'rf':'gen';const A=S.ins||IFA.cargoLiability({cls,cl:'A'}),B=IFA.cargoLiability({cls,cl:'B'}),C=IFA.cargoLiability({cls,cl:'C'});return {rows:[['حق بیمه ICC A → B',A.premiumUSD,B.premiumUSD,usd],['حق بیمه ICC A → C',A.premiumUSD,C.premiumUSD,usd]],note:'⚠ پوشش B و C محدودتر است (خطرات نام‌برده)؛ برای کالای حساس A توصیه می‌شود'}},
 'dd.dd':S=>{const C=asCtxSafe();const d0=ddDef(C);const o={ct:String(S.eq||'40').startsWith('20')?'20':'40',n:S.ncont||1};const p=apDD(S.pod);if(p)o.port=p;const A=IFA.demurrage(o),B=IFA.demurrage({...o,out:fwAdd(d0.dis,4),ret:fwAdd(d0.dis,7)});return {rows:[['دموراژ + دیتنشن',A.totalUSD,B.totalUSD,usd],['انبارداری',A.storageIRR,B.storageIRR,apRial]],note:'ترخیص ۴ روزه و برگشت کانتینر خالی تا روز ۷ (به‌جای ۸ و ۱۳)'}},
 'job.gp':S=>{const J=S.jobv;if(!J)return null;const t=Math.max(12,+AP.opts.margin||12)/100;const sale=Math.round(J.costUSD/(1-t));return {rows:[['فروش',J.salesUSD,sale,usd,1],['سود',J.gpUSD,sale-J.costUSD,usd,1],['حاشیه ٪',J.marginPct,Math.round(t*100),x=>fa(x)+'٪',1]],note:'قیمت لازم برای حاشیهٔ '+fa(Math.round(t*100))+'٪'}},
 'landed.cal':S=>S.cal?{rows:[['هزینهٔ کامل',S.cal.base,S.cal.adj,usd]],note:'مدل ← کالیبره با فاکتورهای واقعی؛ برای قیمت‌دهی رقم کالیبره را مبنا قرار دهید'}:null};
async function apEqWI(S){const E=['20GP','40GP','40HC'];const R=await IFA.packAll(null,E);const cur=R.find(r=>r.eq===S.eq)||R[0];const ok=R.filter(r=>!r.un).sort((a,b)=>a.n-b.n||((b.vol||[]).reduce((x,y)=>x+y,0)/b.n)-((a.vol||[]).reduce((x,y)=>x+y,0)/a.n))[0]||cur;const u=r=>Math.round((r.vol||[]).reduce((x,y)=>x+y,0)/(r.n||1)*100);
 return {rows:[['تعداد کانتینر',cur.n,ok.n,fa],['پرشدگی ٪',u(cur),u(ok),x=>fa(x)+'٪',1],['جانمانده',cur.un||0,ok.un||0,fa]],note:(cur.eq||S.eq)+' ← '+ok.eq+(ok.eq===cur.eq?' (تجهیز فعلی بهترین است؛ LCL/تجمیعی را بسنجید)':'')}}
async function apWhatIf(f,box){const fn=APWI[f.k+'.'+f.id];if(!fn)return;box.innerHTML='<i class="sp"></i> در حال محاسبهٔ سناریو…';try{const r=await fn(AP.S||{});if(!r){box.innerHTML='دادهٔ کافی برای این سناریو نیست';return}
 box.innerHTML=`<table><thead><tr><th></th><th>فعلی</th><th>سناریو</th><th>تفاوت</th></tr></thead><tbody>${r.rows.map(([l,a,b,fm,hb])=>`<tr><td>${esc(l)}</td><td>${fm(a)}</td><td>${fm(b)}</td><td class="${(hb?b>a:b<a)?'dn':(hb?b<a:b>a)?'up':''}">${apDl(a,b,fm)}</td></tr>`).join('')}</tbody></table>${r.note?`<p>${esc(r.note)}</p>`:''}${r.apply?'<button class="ap-wia">'+esc(r.apply.label)+'</button>':''}`;
 if(r.apply)$('.ap-wia',box).onclick=e=>{e.stopPropagation();r.apply.fn();(AP.wiDone=AP.wiDone||{})[f.id]=1;$('.ap-wia',box).disabled=true;$('.ap-wia',box).textContent='✓ اعمال شد'};f.wi=r.rows.map(x=>[x[0],x[1],x[2]])}catch(e){box.textContent='محاسبه ممکن نشد: '+(e.message||e)}}
/* --- decision card --- */
function apDecision(){const S=AP.S||{};const X=S.scen;const F=(AP.finds||[]).filter(f=>f.sev==='hi'||f.sev==='md').sort((a,b)=>APSEV[b.sev][1]-APSEV[a.sev][1]);
 const rec=X?X.best:null,alts=X?X.ord.filter(r=>r!==rec).slice(0,2):[];const risks=[...F.map(f=>({t:f.t,s:f.sev,src:'یافته'})),...((S.risks||[]).slice(0,3).map(r=>({t:r.risk,s:r.score>=16?'hi':r.score>=12?'md':'lo',src:'ماتریس ریسک'})))].filter((r,i,a)=>a.findIndex(x=>x.t===r.t)===i).slice(0,3);
 const keys=['land','duty','live','pack','ins','dd'];const cs=AP.vals.filter(v=>keys.includes(v.k)&&v.p&&v.p.conf!=null).map(v=>v.p.conf);const conf=cs.length?cs.reduce((a,b)=>a+b,0)/cs.length:null;
 const hi=F.some(f=>f.sev==='hi');const verdict=hi?'پیش از تعهد، موارد بحرانی را رفع کنید':rec&&X.cur&&rec.i!==X.cur.i?'با مسیر پیشنهادی ادامه دهید':'با مسیر فعلی ادامه دهید';
 return {verdict,rec,cur:X&&X.cur,alts,risks,conf,band:S.mc?[S.mc.p10,S.mc.p50,S.mc.p90]:null,bestInc:X&&X.bestInc,inc:X&&X.inc,recordsPending:AP.fast&&AP.opts.records&&APREC.some(k=>AP.st[k]==='skip'),mode:AP.fast?'instant':'ui'}}
function apDecHtml(){const D=apDecision();if(!D.rec&&!D.risks.length)return '';const r=D.rec;const dl=(a,b,f)=>{const d=b-a;return d?(d>0?'+':'−')+f(Math.abs(d)):'='};
 const B=[...(r&&D.cur&&r.i!==D.cur.i?[['dc-sel','انتخاب مسیر پیشنهادی']]:[]),...(D.recordsPending?[['dc-rec','ثبت سوابق (پرونده، رزرو، اسناد)']]:[]),['dc-rfq','استعلام از فورواردرها (پیش‌نویس)'],['dc-cp','کپی کارت تصمیم']];
 return `<div class="ap-dec"><div class="hd"><small>کارت تصمیم${D.conf!=null?' · اطمینان '+apConfL(D.conf)+' ('+fa(Math.round(D.conf*100))+'٪)':''}</small><b>${esc(D.verdict)}</b></div>
 ${r?`<div class="rc"><span>پیشنهاد</span><b>${esc(r.name)}</b><em>${usd(r.cost)} · ${fa(nf(r.days,1))} روز · ریسک ${fa(r.risk)}</em>${D.band&&D.cur&&r.i===D.cur.i?`<small>بازهٔ هزینه P10–P90: ${usd(D.band[0])} تا ${usd(D.band[2])}</small>`:''}</div>`:''}
 ${D.alts.length?`<div class="al">${D.alts.map(a=>`<div><span>جایگزین</span><b>${esc(a.name)}</b><em>${dl(r.cost,a.cost,usd)} · ${dl(r.days,a.days,x=>fa(nf(x,1))+' روز')}</em></div>`).join('')}</div>`:''}
 ${D.bestInc&&D.bestInc!==D.inc?`<p class="ic">اینکوترمز ارزان‌تر برای خریدار: <b>${esc(D.bestInc)}</b> (فعلی ${esc(D.inc)})</p>`:''}
 ${D.risks.length?`<ol class="rk">${D.risks.map(x=>`<li data-r="${x.s}">${esc(x.t)}<small>${x.src}</small></li>`).join('')}</ol>`:''}
 <div class="bt">${B.map(b=>`<button class="${b[0]}">${b[1]}</button>`).join('')}</div></div>`}
{const h0=apSumHtml,b0=apSumBind;apSumHtml=function(done){const h=h0(done);if(AP.stopped)return h;const d=apDecHtml();const i=h.indexOf('<div class="ap-brief"');return d&&i>0?h.slice(0,i)+d+h.slice(i):h+d};
 apSumBind=function(sw){b0(sw);const on=(s,f)=>{const e=$(s,sw);if(e)e.onclick=f};const D=apDecision();
  on('.dc-sel',()=>{if(D.rec&&apSelRoute(D.rec.i))toast('مسیر «'+D.rec.name+'» انتخاب شد؛ «اجرای دوباره» برای محاسبهٔ کامل');});
  on('.dc-rec',()=>apRecordNow());on('.dc-rfq',()=>open('rfq'));
  on('.dc-cp',()=>{const t=apDecText(D);(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('کارت تصمیم کپی شد')).catch(()=>toast('کپی ممکن نشد'))})}}
function apDecText(D){D=D||apDecision();const S=AP.S||{};return ['کارت تصمیم · '+(S.o?S.o.nameFa+' ← '+S.d.nameFa:''),D.verdict,D.rec?'پیشنهاد: '+D.rec.name+' · '+usd(D.rec.cost)+' · '+nf(D.rec.days,1)+' روز':'',...D.alts.map(a=>'جایگزین: '+a.name+' · '+usd(a.cost)+' · '+nf(a.days,1)+' روز'),D.band?'بازهٔ هزینه P10–P90: '+usd(D.band[0])+' تا '+usd(D.band[2]):'',...D.risks.map((r,i)=>'ریسک '+(i+1)+': '+r.t)].filter(Boolean).join('\n')}
/* «record now»: replay only the record stages in visible mode, reusing this run's results */
async function apRecordNow(){const S=AP.S;if(!S||AP.run)return;const st={};(AP.list||[]).forEach(s=>{if(!APREC.includes(s[0])&&s[0]!=='final'&&AP.st[s[0]]&&AP.st[s[0]]!=='stop')st[s[0]]=AP.st[s[0]]==='skip'?'skip':'ok'});
 const c={v:1,t0:0,lane:S.o.id+'>'+S.d.id,sel:S.sel,name:S.o.nameFa+' ← '+S.d.nameFa,st,S:{},vals:AP.vals.slice(),finds:(AP.finds||[]).slice(),note:{},at:Date.now()};APCKS.forEach(x=>{if(S[x]!==undefined)c.S[x]=S[x]});
 AP.resume=c;const sp=AP.opts.speed;try{await apStart({speed:sp==='instant'?'fast':sp,records:true})}finally{AP.opts.speed=sp}}
/* --- server run log (+ «autopilot.done» notification rule on the server) --- */
async function apReport(){if(!svOn()||!AP.S)return;const S=AP.S,D=apDecision(),B=apBrief();const L=AP.list||[];
 const body={lane:S.o.id+'>'+S.d.id,name:S.o.nameFa+' ← '+S.d.nameFa,route:S.R.name||'',mode:D.mode,score:B.score,verdict:B.verdict,dur:Math.round((AP.end-AP.t0)/1000),
  st:Object.fromEntries(L.map(s=>[s[0],{st:AP.st[s[0]]||'',ms:AP.ts[s[0]]&&AP.ts[s[0]].e?AP.ts[s[0]].e-AP.ts[s[0]].s:null,note:(AP.note||{})[s[0]]||''}])),
  vals:AP.vals.map(v=>({k:v.k,label:v.label,value:v.value,p:v.p||null})),finds:(AP.finds||[]).map(f=>({k:f.k,id:f.id,sev:f.sev,t:f.t,d:f.d})),
  dec:{verdict:D.verdict,rec:D.rec&&{name:D.rec.name,cost:D.rec.cost,days:D.rec.days,risk:D.rec.risk},alts:D.alts.map(a=>({name:a.name,cost:a.cost,days:a.days,risk:a.risk})),risks:D.risks.map(r=>r.t),conf:D.conf,band:D.band},landUSD:S.landed?S.landed.totalUSD:null,timeouts:AP.tmo||0,healed:Object.keys(AP.healed||{})};
 const r=await svApi('/api/ap/runs',{method:'POST',body});AP.runId=r&&r.id;return r}
/* --- notification template + API --- */
try{NEV['autopilot.done']=['پایان کنترل خودکار','🤖 کنترل خودکار {{name}}: {{verdict}} · امتیاز {{score}} · پیشنهاد: {{rec}}']}catch(e){}
setTimeout(()=>{if(!window.IFA||!IFA.autopilot)return;const st0=IFA.autopilot.status;Object.assign(IFA.autopilot,{
 status:()=>{const s=st0();s.mode=AP.fast?'instant':'ui';s.values=AP.vals.map(v=>({key:v.k,label:v.label,value:v.value,provenance:v.p||null}));s.timeouts=AP.tmo||0;return s},
 instant:async(o={})=>{const sp=AP.opts.speed;try{await apStart({...o,speed:'instant'})}finally{AP.opts.speed=sp}return IFA.autopilot.status()},decision:()=>AP.done?apDecision():null,scenarios:()=>AP.S?apScenRows(AP.S):null,
 whatIf:async id=>{const f=(AP.finds||[]).find(x=>x.id===id||x.k+'.'+x.id===id);const fn=f&&APWI[f.k+'.'+f.id];return fn?await fn(AP.S||{}):null},
 checkpoint:()=>LSG(APCKK,null),resumeRun:()=>apResume(),recordNow:()=>apRecordNow(),runs:(q='')=>svApi('/api/ap/runs'+(q?'?'+q:'')),run:id=>svApi('/api/ap/run?id='+encodeURIComponent(id))})},700);
