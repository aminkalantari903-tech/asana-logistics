/* ---------- v15.19: goal-based planning from one sentence, editable plan preview, actions with approval, post-run watch ---------- */
const PLW={cost:{cost:.65,days:.15,risk:.2},time:{cost:.2,days:.6,risk:.2},risk:{cost:.25,days:.15,risk:.6},bal:{cost:.45,days:.3,risk:.25}};
const PLG={bal:'متعادل',cost:'کمترین هزینه',time:'سریع‌ترین',risk:'کمترین ریسک'};
const PLEQ={'20GP':['20DV',33],'40GP':['40DV',67],'40HC':['40HC',76],'20RF':['20RF',28],'40RF':['40RF',59]};
const PLCK=[['پمپ|ماشین|دستگاه|تجهیزات|موتور|کمپرسور|machine|pump|equipment','machinery'],['قطعات خودرو|لوازم یدکی|خودرو|auto part','auto'],['الکترونیک|موبایل|گوشی|لپ.?تاپ|کامپیوتر|electronic','electronics'],['فولاد|آهن|ورق|میلگرد|steel','steel'],['پارچه|نساجی|پوشاک|نخ|textile','textile'],['شیمیایی|chemical','chemicals'],['پلیمر|گرانول|polymer','polymer'],['دارو|پزشکی|pharma|medical','pharma'],['غذا|برنج|چای|خوراکی|food','food']];
const PLACT={route:'انتخاب مسیر پیشنهادی روی نقشه',records:'ثبت پرونده، پیشنهاد قیمت، رزرو، فاکتور و اظهارنامه (پیش‌نویس)',rfq:'آماده‌سازی استعلام قیمت از فورواردرها (ارسال با شما)',watch:'پایش پس از اجرا: نرخ حمل، نرخ ارز گمرکی و آخرین موعد حرکت'};
const plN=s=>{try{return nnorm(String(s||''))}catch(e){return String(s||'').toLowerCase()}};
const plK=(n,u)=>+n*(/هزار|k/i.test(u||'')?1e3:/میلیون|m/i.test(u||'')?1e6:1);
function plParse(text){const C=asCtxSafe();const t=plN(text);const P={text,goal:'bal',parts:[],miss:[]};
 const nf_=s=>{if(!C||!s)return null;const ph=plN(s),w=s.split(/\s+/);const ok=n=>{const a=plN(n.nameFa).replace(/^(بندر|مرز|ایستگاه|فرودگاه)\s+/,'').replace(/\s*\(.*$/,''),e=plN((n.nameEn||'').split(/[\s(]/)[0]);return (a&&ph.includes(a))||(e&&ph.includes(e))};for(const k of [3,2,1]){if(w.length>=k){const n=nodeFind(C,w.slice(0,k).join(' '));if(n&&ok(n))return n}}return nodeFind(C,w[0])};
 const m=t.match(/(?:از|from)\s+(.+?)\s+(?:به|تا|to)\s+(.+?)(?=[،,.؛\n]|\s+(?:با|برای|حداکثر|ظرف|زیر|کمتر|بودجه|ارزش|اینکوترمز|ارزان|سریع|امن|کم|\d)|$)/)||t.match(/(\S+(?:\s\S+)?)\s*(?:←|->|→)\s*(\S+(?:\s\S+)?)/);
 if(m){P.o=nf_(m[1]);P.d=nf_(m[2]);if(!P.o)P.miss.push('مبدأ «'+m[1]+'»');if(!P.d)P.miss.push('مقصد «'+m[2]+'»')}else P.miss.push('مبدأ و مقصد');
 const q=t.match(/(\d+)\s*(?:×|x|\*|تا|عدد|دستگاه)?\s*(?:کانتینر|container|cntr)?\s*(20|40|45)\s*(?:فوت|ft|'|’|ی)?\s*(hc|hq|های.?کیوب|rf|یخچالی|reefer|gp|dv|dc|استاندارد)?/i)||t.match(/(\d+)\s*(?:کانتینر|container)/i);
 if(q){P.qty=+q[1];if(q[2]){const h=/hc|hq|کیوب/i.test(q[3]||''),r=/rf|یخچال|reefer/i.test(q[3]||'');P.eq=(q[2]==='20'?'20':'40')+(r?'RF':h?'HC':'GP');if(q[2]==='45')P.eq='40HC'}P.ship='FCL'}
 if(/\blcl\b|خرده\s?بار|بار\s?جزئی/i.test(t))P.ship='LCL';if(/هوایی|\bair\b/i.test(t))P.ship='AIR';if(/کامیون|تریلی|\bftl\b/i.test(t))P.ship='FTL';
 const w=t.match(/(\d+(?:\.\d+)?)\s*(تن|ton|tonne|کیلو(?:گرم)?|kg)(?![a-z])/i);if(w)P.kg=Math.round(+w[1]*(/تن|ton/i.test(w[2])?1000:1));
 const v=t.match(/(\d+(?:\.\d+)?)\s*(?:cbm|متر\s?مکعب|m3)/i);if(v)P.cbm=+v[1];
 const vl=t.match(/(?:ارزش|value)(?:\s*کالا)?\s*[:：]?\s*\$?\s*(\d+(?:\.\d+)?)\s*(هزار|k|میلیون|m)?/i);if(vl)P.value=plK(vl[1],vl[2]);
 const bg=t.match(/(?:بودجه|سقف\s*هزینه|حداکثر\s*هزینه|budget)\s*[:：]?\s*\$?\s*(\d+(?:\.\d+)?)\s*(هزار|k|میلیون|m)?/i);if(bg)P.budget=plK(bg[1],bg[2]);
 const dy=t.match(/(?:حداکثر|ظرف|زیر|کمتر\s*از|تا|within|max|under)\s*(\d+)\s*(?:روز|day)/i);if(dy)P.days=+dy[1];
 const ic=t.match(/\b(exw|fca|fas|fob|cfr|cif|cpt|cip|dap|dpu|ddp)\b/i);if(ic)P.inc=ic[1].toUpperCase();
 const hs=t.match(/(?:hs|کد\s*(?:تعرفه|hs)|اچ\s*اس)\s*[:：]?\s*(\d{4,10})/i);if(hs)P.hs=hs[1];
 if(/ارزان|کم\s?هزینه|کمترین\s*هزینه|cheap|lowest cost/i.test(t))P.goal='cost';else if(/سریع|فوری|عجله|fast|urgent|quick/i.test(t))P.goal='time';else if(/امن|کم\s?ریسک|مطمئن|safe|low risk/i.test(t))P.goal='risk';
 const cu=String(text).match(/(?:مشتری|برای\s+شرکت|customer)\s*[:：]?\s*([^،,.\n]+?)(?=\s*(?:[،,.\n]|$))/i);if(cu)P.cust=cu[1].trim().slice(0,60);
 for(const [re,k] of PLCK){const mm=String(text).match(new RegExp('('+re+')[^،,.\\n]{0,24}','i'));if(mm){P.com=k;P.desc=mm[0].replace(/\s+(از|به|با|برای)\s.*$/,'').trim().slice(0,50);break}}
 return P}
async function plLLM(P){if(!svOn())return P;try{const r=await svApi('/api/ap/intake',{method:'POST',body:{text:P.text}});if(!r||!r.llm||!r.fields)return P;const f=r.fields,C=asCtxSafe();P.llm=true;
  const nd=s=>s&&C?nodeFind(C,s):null;if(!P.o&&f.from)P.o=nd(f.from)||P.o;if(!P.d&&f.to)P.d=nd(f.to)||P.d;
  [['qty','qty'],['kg','kg'],['cbm','cbm'],['value','value'],['inc','inc'],['hs','hs'],['days','days'],['budget','budget'],['cust','cust'],['desc','desc']].forEach(([a,b])=>{if(!P[a]&&f[b])P[a]=f[b]});
  if(!P.eq&&/^(20|40)(GP|HC|RF)$/.test(f.eq))P.eq=f.eq;if(!P.ship&&['LCL','AIR','FTL'].includes(f.eq))P.ship=f.eq;if(P.goal==='bal'&&f.goal)P.goal=f.goal;if(P.o&&P.d)P.miss=P.miss.filter(x=>!/مبدأ|مقصد/.test(x))}catch(e){}return P}
/* stage plan with reasons */
function plStages(P){const ir=P.d&&P.d.country==='IR',sea=P.ship!=='AIR'&&P.ship!=='FTL';const R={
 intake:[1,'خواندن درخواست و مشخصات'],route:[1,'هدف «'+PLG[P.goal]+'» وزن‌های بهینه‌ساز را تعیین می‌کند'],live:[1,'کرایه با دادهٔ روز برای مقایسه با مدل'],landed:[1,'هزینهٔ کامل'+(P.budget?' برای سنجش بودجهٔ '+usd(P.budget):'')],
 load:[P.ship!=='AIR'?1:0,P.ship==='AIR'?'برای حمل هوایی لازم نیست':'تعداد و پرشدگی کانتینر'+(P.qty?' (درخواست: '+fa(P.qty)+' × '+(P.eq||'')+')':'')],
 tariff:[ir?1:0,ir?'واردات به ایران: حقوق ورودی، مجوزها و کد HS':'مقصد خارج از ایران'],ins:[1,'حق بیمهٔ باربری'],sanc:[1,P.cust?'غربال «'+P.cust+'»':'نام طرف‌ها وارد نشده؛ غربال محدود خواهد بود'],
 risk:[1,'ماتریس ریسک مسیر'],dd:[sea&&ir?1:0,sea&&ir?'برآورد دموراژ بندر مقصد':'مسیر دریایی به بندر ایران ندارد'],dom:[ir?1:0,ir?'حمل داخلی تا مقصد نهایی':'—'],
 scen:[1,'مقایسهٔ همهٔ مسیرها با هدف و محدودیت‌های شما'+(P.days||P.budget?' ('+[P.days?'≤ '+fa(P.days)+' روز':'',P.budget?'≤ '+usd(P.budget):''].filter(Boolean).join('، ')+')':'')],
 rfq:[1,'پیش‌نویس استعلام (بدون ارسال)'],job:[0,'به‌صورت اقدام نیازمند تأیید پیشنهاد می‌شود'],quote:[0,'به‌صورت اقدام نیازمند تأیید'],bkg:[0,'به‌صورت اقدام نیازمند تأیید'],docs:[0,'به‌صورت اقدام نیازمند تأیید'],cus:[0,'به‌صورت اقدام نیازمند تأیید'],track:[0,'پس از تأیید رزرو'],final:[1,'جمع‌بندی و کارت تصمیم']};
 return APS.map(s=>({k:s[0],n:s[1],on:!!(R[s[0]]||[1])[0],why:(R[s[0]]||[1,''])[1],lock:s[0]==='intake'||s[0]==='final'}))}
/* apply to the map sidebar (same controls a user would use) */
const plSleep=ms=>new Promise(r=>setTimeout(r,ms));
function plSetV(el,v){if(!el)return false;const pr=el.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(pr,'value').set.call(el,String(v));el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));el.dispatchEvent(new Event('blur',{bubbles:true}));return true}
const plLab=l=>{const L=[...document.querySelectorAll('label')].find(x=>x.offsetParent&&!x.closest('.apx-pre,.sx-wrap,.as-panel,.ap-hud')&&x.textContent.trim().startsWith(l));return L?L.parentElement.querySelector('input,select'):null};
const plTab=re=>{const b=[...document.querySelectorAll('button')].find(x=>x.offsetParent&&re.test(x.textContent.replace(/\s+/g,' ')));if(b)b.click();return !!b};
async function plOD(lbl,n){const i=document.querySelector('input[role=combobox][aria-label="'+lbl+'"]');if(!i||!n)return false;i.focus();plSetV(i,n.nameFa);await plSleep(450);const O=[...document.querySelectorAll('[role=option]')].filter(e=>e.offsetParent);const o=O.find(e=>(e.querySelector('.nm')||e).textContent.trim()===n.nameFa)||O[0];if(!o)return false;['pointerdown','mousedown','pointerup','mouseup','click'].forEach(t=>o.dispatchEvent(new (t.startsWith('pointer')?PointerEvent:MouseEvent)(t,{bubbles:true,cancelable:true,view:window})));await plSleep(300);i.blur();return true}
async function plApply(P){const bad=[];if(typeof wrap!=='undefined'&&wrap&&typeof close==='function'){try{close()}catch(e){}await plSleep(300)}
 const mob=innerWidth<760;if(mob)try{const sh=document.querySelector('.drawer');if(sh)sh.classList.add('open')}catch(e){}
 plTab(/01\s*مسیر|مسیر\s*01/);await plSleep(200);if(P.o&&!(await plOD('مبدأ',P.o)))bad.push('مبدأ');if(P.d&&!(await plOD('مقصد',P.d)))bad.push('مقصد');
 if(P.ship){const T={FCL:'FCL',LCL:'LCL',AIR:'هوایی',FTL:'FTL'}[P.ship];const b=[...document.querySelectorAll('button')].find(x=>x.offsetParent&&x.textContent.trim()===T);if(b)b.click();else bad.push('نوع حمل')}
 if(plTab(/02\s*بار|بار\s*02/)){await plSleep(350);const set=(l,v,nm)=>{if(v==null||v==='')return;if(!plSetV(plLab(l),v))bad.push(nm)};
  if(P.com)set('نوع کالا',P.com,'نوع کالا');if(P.hs)set('کد HS',P.hs,'کد HS');if(P.kg)set('وزن',P.kg,'وزن');if(P.value)set('ارزش کالا',P.value,'ارزش کالا');if(P.inc)set('اینکوترمز',P.inc,'اینکوترمز');
  let cbm=P.cbm;if(!cbm&&P.qty&&P.eq&&PLEQ[P.eq]){cbm=Math.round(P.qty*PLEQ[P.eq][1]*.85);P.cbmEst=1}if(cbm){const c=document.querySelector('input[aria-label="حجم کل CBM"]');if(!plSetV(c,cbm))bad.push('حجم')}
  if(P.eq&&PLEQ[P.eq]){const b=[...document.querySelectorAll('button')].find(x=>x.offsetParent&&x.textContent.trim()===PLEQ[P.eq][0]);if(b)b.click();else bad.push('نوع کانتینر')}
  await plSleep(250);plTab(/01\s*مسیر|مسیر\s*01/)}else if(P.kg||P.value||P.inc||P.com)bad.push('مشخصات بار (برگهٔ «بار» در دسترس نبود)');
 for(let i=0;i<40;i++){const S=apShip();if(S&&(!P.o||S.o.id===P.o.id)&&(!P.d||S.d.id===P.d.id))break;await plSleep(250)}await plSleep(400);return bad}
/* plan preview dialog */
function plShow(text){if(AP.run)return toast('کنترل خودکار در حال اجراست');$('.apx-pre-bg')?.remove();const bg=document.createElement('div');bg.className='apx-pre-bg pl-bg';
 const ex=['۲ کانتینر ۴۰ فوت های‌کیوب پمپ صنعتی از شانگهای به تهران، ارزش ۹۵ هزار دلار، حداکثر ۳۰ روز، بودجه ۴۵ هزار دلار، ارزان‌ترین','از بمبئی به چابهار LCL ۸ تن چای، ارزش ۴۰ هزار دلار، CFR، سریع'];
 bg.innerHTML=`<div class="apx-pre pl-dlg" role="dialog" aria-modal="true" aria-label="برنامه‌ریزی با هدف"><header><button class="xx" title="بستن (Esc)">${ASI.x}</button><div class="t"><span>${ASI.bolt}</span><div><b>برنامه‌ریزی محموله با یک جمله</b><small>هدف و محدودیت‌ها را بنویسید؛ برنامه را قبل از اجرا ببینید و ویرایش کنید</small></div></div></header>
 <div class="bd"><textarea class="pl-q" rows="3" placeholder="مثلاً: ${esc(ex[0])}">${esc(text||'')}</textarea><div class="pl-ex">${ex.map((x,i)=>`<button type="button" data-x="${i}">${esc(x.slice(0,58))}…</button>`).join('')}</div>
 <div class="pl-acts0"><button type="button" class="pl-go0">تحلیل درخواست و ساخت برنامه</button>${svOn()?'<small>اگر مدل زبانی روی سرور تنظیم شده باشد، برای تکمیل موارد ناقص هم استفاده می‌شود</small>':''}</div><div class="pl-plan"></div><div class="pl-w"></div></div>
 <footer><button class="go" disabled>${API_.play2}اعمال روی نقشه و اجرا</button><button class="apx-cn">انصراف</button><span class="est"></span><div class="opt"><label>حالت <select data-p="mode"><option value="instant">فوری (بدون نمایش صفحه‌ها)</option><option value="fast">نمایشی سریع</option></select></label></div></footer></div>`;
 document.body.appendChild(bg);const shut=()=>{bg.classList.add('out');setTimeout(()=>bg.remove(),220)};$('.xx',bg).onclick=shut;$('.apx-cn',bg).onclick=shut;bg.addEventListener('mousedown',e=>{if(e.target===bg)shut()});
 bg.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();shut()}});const ta=$('.pl-q',bg);$$('.pl-ex button',bg).forEach(b=>b.onclick=()=>{ta.value=ex[+b.dataset.x];go0()});
 let P=null;const go0=async()=>{const t=ta.value.trim();if(t.length<6)return toast('درخواست را کامل‌تر بنویسید');$('.pl-go0',bg).disabled=true;$('.pl-plan',bg).innerHTML='<div class="pl-ld"><i class="sp"></i> در حال تحلیل…</div>';
  P=plParse(t);if(svOn()&&(P.miss.length||!P.kg||!P.value))P=await plLLM(P);P.st=Object.fromEntries(plStages(P).map(s=>[s.k,s.on]));P.acts={route:1,records:1,rfq:1,watch:svOn()?1:0};plRender(bg,P);$('.pl-go0',bg).disabled=false};
 $('.pl-go0',bg).onclick=go0;ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();go0()}});
 $('.go',bg).onclick=async()=>{if(!P)return;plRead(bg,P);if(!P.o||!P.d)return toast('مبدأ و مقصد را مشخص کنید');P.mode=$('[data-p=mode]',bg).value;shut();await plRun(P)};
 if(text)go0();else setTimeout(()=>ta.focus(),60);plWatchList($('.pl-w',bg))}
function plRender(bg,P){const S=plStages(P).map(s=>({...s,on:P.st[s.k]!==undefined?P.st[s.k]:s.on}));const C=asCtxSafe();const opts=C?C.G.nodes.slice().sort((a,b)=>(a.nameFa||'').localeCompare(b.nameFa||'','fa')):[];
 const nsel=(k,n)=>`<input data-f="${k}" list="pl-nodes" value="${esc(n?n.nameFa:'')}" placeholder="نام بندر یا شهر">`;
 const f=(k,l,v,t='text',ph='')=>`<label>${l}<input data-f="${k}" type="${t}" value="${esc(v==null?'':String(v))}" placeholder="${esc(ph)}" ${t==='number'?'min="0"':''}></label>`;
 $('.pl-plan',bg).innerHTML=`${P.miss.length?`<p class="pl-miss">⚠ مشخص نشد: ${esc(P.miss.join('، '))} — در فرم زیر تکمیل کنید.</p>`:''}${P.llm?'<p class="pl-llm">موارد ناقص با مدل زبانی سرور تکمیل شد؛ لطفاً بررسی کنید.</p>':''}
 <datalist id="pl-nodes">${opts.slice(0,1500).map(n=>`<option value="${esc(n.nameFa)}">`).join('')}</datalist>
 <h5>درخواست برداشت‌شده<em>قابل ویرایش</em></h5><div class="g"><label>مبدأ${nsel('o',P.o)}</label><label>مقصد${nsel('d',P.d)}</label>
 <label>نوع حمل<select data-f="ship">${[['','بدون تغییر'],['FCL','FCL'],['LCL','LCL'],['AIR','هوایی'],['FTL','FTL جاده‌ای']].map(([k,n])=>`<option value="${k}" ${P.ship===k?'selected':''}>${n}</option>`).join('')}</select></label>
 <label>کانتینر<select data-f="eq"><option value="">—</option>${Object.keys(PLEQ).map(k=>`<option ${P.eq===k?'selected':''}>${k}</option>`).join('')}</select></label>${f('qty','تعداد کانتینر',P.qty,'number')}${f('kg','وزن (kg)',P.kg,'number')}${f('value','ارزش کالا (USD)',P.value,'number')}
 <label>اینکوترمز<select data-f="inc"><option value="">بدون تغییر</option>${['EXW','FCA','FOB','CFR','CIF','CPT','CIP','DAP','DPU','DDP'].map(k=>`<option ${P.inc===k?'selected':''}>${k}</option>`).join('')}</select></label>
 <label>گروه کالا<select data-f="com"><option value="">بدون تغییر</option>${Object.entries(APCF).map(([k,n])=>`<option value="${k}" ${P.com===k?'selected':''}>${n}</option>`).join('')}</select></label>${f('desc','شرح کالا (برای HS)',P.desc)}${f('hs','کد HS',P.hs,'text','اختیاری')}${f('cust','مشتری',P.cust,'text','اختیاری')}</div>
 <h5>هدف و محدودیت‌ها</h5><div class="g"><label>هدف<select data-f="goal">${Object.entries(PLG).map(([k,n])=>`<option value="${k}" ${P.goal===k?'selected':''}>${n}</option>`).join('')}</select></label>${f('days','حداکثر زمان ترانزیت (روز)',P.days,'number')}${f('budget','بودجهٔ هزینهٔ کامل لجستیک (USD)',P.budget,'number')}</div>
 <h5>مراحل اجرا<em>${fa(S.filter(s=>s.on).length)} مرحله</em></h5><ul class="pl-st">${S.map(s=>`<li class="${s.on?'':'off'}"><label><input type="checkbox" data-s="${s.k}" ${s.on?'checked':''} ${s.lock?'disabled':''}><b>${esc(s.n)}</b></label><small>${esc(s.why)}</small></li>`).join('')}</ul>
 <h5>اقدام‌های پس از اجرا<em>هر کدام فقط با تأیید شما</em></h5><div class="pl-ac">${Object.entries(PLACT).map(([k,n])=>`<label class="${k==='watch'&&!svOn()?'dis':''}"><input type="checkbox" data-a="${k}" ${P.acts[k]?'checked':''} ${k==='watch'&&!svOn()?'disabled':''}>${esc(n)}${k==='watch'&&!svOn()?' <small>(نیازمند سرور)</small>':''}</label>`).join('')}</div>`;
 $$('.pl-st input',bg).forEach(i=>i.onchange=()=>{i.closest('li').classList.toggle('off',!i.checked);P.st[i.dataset.s]=i.checked;$('.pl-plan h5:nth-of-type(3) em',bg).textContent=fa($$('.pl-st input:checked',bg).length)+' مرحله'});
 $('.go',bg).disabled=false;$('.est',bg).textContent=P.o&&P.d?P.o.nameFa+' ← '+P.d.nameFa:''}
function plRead(bg,P){const C=asCtxSafe();const g=k=>{const e=$('[data-f='+k+']',bg);return e?e.value.trim():''};const nd=s=>{if(!s||!C)return null;return C.G.nodes.find(n=>n.nameFa===s)||nodeFind(C,s)};
 P.o=nd(g('o'))||null;P.d=nd(g('d'))||null;P.ship=g('ship');P.eq=g('eq');['qty','kg','value','days','budget'].forEach(k=>{const v=+g(k);P[k]=v>0?v:0});P.inc=g('inc');P.com=g('com');P.desc=g('desc');P.hs=g('hs').replace(/\D/g,'');P.cust=g('cust');P.goal=g('goal')||'bal';
 $$('[data-s]',bg).forEach(i=>P.st[i.dataset.s]=i.checked);$$('[data-a]',bg).forEach(i=>P.acts[i.dataset.a]=i.checked?1:0);return P}
async function plRun(P){toast('اعمال درخواست روی نقشه…');const bad=await plApply(P);const S=apShip();if(!S||S.o.id!==P.o.id||S.d.id!==P.d.id)return toast('مسیر روی نقشه ساخته نشد؛ مبدأ و مقصد را دستی انتخاب کنید و دوباره اجرا کنید');
 if(bad.length)toast('این موارد اعمال نشد و از مقدار فعلی استفاده می‌شود: '+bad.join('، '));const W0={...APWT},O0={...AP.opts,off:[...(AP.opts.off||[])]};
 Object.assign(APWT,PLW[P.goal]||PLW.bal);AP.plan={goal:P.goal,days:P.days||0,budget:P.budget||0,acts:{...P.acts},text:P.text,bad,cbmEst:!!P.cbmEst};
 try{await apStart({off:APS.map(s=>s[0]).filter(k=>P.st[k]===false),cust:P.cust||AP.opts.cust,desc:P.desc||'',hs:P.hs||'',speed:P.mode==='fast'?'fast':'instant',records:false})}finally{Object.assign(APWT,W0);Object.assign(AP.opts,O0)}}
/* constraints in the scenario matrix */
{const s0=apScenRows;apScenRows=function(S){const X=s0(S);const P=AP.plan;if(!P||!X||!X.rows)return X;X.rows.forEach(r=>{r.why=[];if(P.days&&r.days>P.days)r.why.push('زمان '+fa(nf(r.days,1))+' روز > '+fa(P.days));if(P.budget&&(r.costCal||r.cost)>P.budget)r.why.push('هزینه '+usd(r.costCal||r.cost)+' > بودجه');r.ok=!r.why.length});
 X.ord.sort((a,b)=>(b.ok-a.ok)||(b.score-a.score));X.ord.forEach((r,j)=>r.rank=j+1);X.best=X.ord[0];X.feasible=X.rows.filter(r=>r.ok).length;X.plan={goal:P.goal,days:P.days,budget:P.budget};return X}}
{const t0=APTH.scen;APTH.scen=S=>{t0(S);const X=S.scen,P=AP.plan;if(!X||!P||!(P.days||P.budget))return;if(!X.feasible){const c=X.ord.slice().sort((a,b)=>a.why.length-b.why.length||b.score-a.score)[0];apFind_('scen','nofeas','hi','هیچ مسیری با محدودیت‌های شما سازگار نیست','نزدیک‌ترین: '+c.name+' — '+c.why.join('، ')+'. محدودیت زمان/بودجه را بازنگری کنید یا تقسیم محموله را بسنجید.','cost','بازنگری محدودیت‌ها')}
 else{if(X.cur&&!X.cur.ok)apFind_('scen','curinf','md','مسیر انتخابی با محدودیت‌ها سازگار نیست ('+X.cur.why.join('، ')+')',fa(X.feasible)+' مسیر سازگار وجود دارد؛ بهترین: '+X.best.name,'cost','انتخاب مسیر سازگار');apSay(fa(X.feasible)+' از '+fa(X.rows.length)+' مسیر با محدودیت‌های شما سازگارند','cost')}}}
APWI['scen.curinf']=APWI['scen.alt'];APWI['scen.nofeas']=S=>{const X=S.scen;if(!X)return null;const c=X.ord.slice().sort((a,b)=>a.why.length-b.why.length||b.score-a.score)[0];const P=AP.plan||{};return {rows:[...(P.days?[['زمان (روز)',P.days,c.days,x=>fa(nf(x,1))]]:[]),...(P.budget?[['هزینهٔ کامل',P.budget,c.cost,usd]]:[])],note:'محدودیت شما ← نزدیک‌ترین مسیر «'+c.name+'»'}};
/* actions awaiting approval (replace the one-click row in the decision card) */
function plActs(){const S=AP.S||{},D=apDecision(),A=(AP.plan&&AP.plan.acts)||{route:1,records:1,rfq:1,watch:svOn()?1:0},L=[];const P=AP.plan||{};
 if(A.route&&D.rec&&D.cur&&D.rec.i!==D.cur.i)L.push({kind:'route',t:'انتخاب مسیر «'+D.rec.name+'»',d:usd(D.rec.cost)+' · '+fa(nf(D.rec.days,1))+' روز',payload:{i:D.rec.i,name:D.rec.name}});
 if(A.records&&!S.job)L.push({kind:'records',t:'ثبت سوابق این محموله',d:'پرونده، پیشنهاد قیمت، رزرو، فاکتور و اظهارنامه — همه داخلی و پیش‌نویس',payload:{}});
 if(A.rfq)L.push({kind:'rfq',t:'استعلام قیمت از فورواردرها',d:'پیش‌نویس آماده است؛ ارسال در صفحهٔ استعلام با خود شما',payload:{}});
 if(A.watch&&svOn()&&S.o){const r=D.rec||{};const dl=P.days&&r.days?new Date(Date.now()+Math.max(0,P.days-r.days)*864e5).toISOString().slice(0,10):'';L.push({kind:'watch',t:'پایش پس از اجرا',d:'نرخ حمل'+(S.pol&&S.pod?' '+apLoc(S.pol)+'→'+apLoc(S.pod):'')+'، نرخ ارز گمرکی'+(dl?'، آخرین موعد حرکت '+new Date(dl).toLocaleDateString('fa-IR'):'')+' — اعلان از طریق قانون «autopilot.watch»',payload:{lane:S.o.id+'>'+S.d.id,name:S.o.nameFa+' ← '+S.d.nameFa,pol:S.pol?apLoc(S.pol):'',pod:S.pod?apLoc(S.pod):'',eq:S.eq||S.cargo.containerType||'',land:S.landed?S.landed.totalUSD:0,budget:P.budget||0,maxDays:P.days||0,deadline:dl}})}
 return L.map((x,i)=>({...x,id:i+1,st:'pending'}))}
const PLST={pending:'منتظر تأیید',approved:'تأیید شد',rejected:'رد شد',done:'انجام شد',err:'خطا'};
function plActsHtml(){const L=AP.acts||[];if(!L.length)return '';return `<div class="pl-acts"><div class="lb">اقدام‌ها — منتظر تأیید شما${AP.actsSrv?' <small>(در کارتابل سرور هم ثبت شد)</small>':''}</div>${L.map(a=>`<div class="pl-a" data-st="${a.st}" data-id="${a.id}"><div><b>${esc(a.t)}</b><small>${esc(a.d)}</small></div>${a.st==='pending'?`<button class="ok">تأیید</button><button class="no">رد</button>`:`<em>${PLST[a.st]||a.st}${a.msg?' · '+esc(a.msg):''}</em>`}</div>`).join('')}</div>`}
async function plDecide(a,ok,box){a.st=ok?'approved':'rejected';let srv=null;if(a.sid&&svOn()){try{srv=await svApi('/api/ap/actions/'+a.sid,{method:'POST',body:{decision:ok?'approve':'reject'}})}catch(e){a.st='err';a.msg=String(e.message||e).slice(0,60)}}
 if(ok&&a.st!=='err'){try{if(a.kind==='route'){apSelRoute(a.payload.i);a.st='done';a.msg='انتخاب شد'}else if(a.kind==='rfq'){open('rfq');a.st='done';a.msg='صفحهٔ استعلام باز شد'}else if(a.kind==='records'){a.st='done';a.msg='در حال ثبت…';setTimeout(()=>apRecordNow(),200)}
  else if(a.kind==='watch'){if(srv&&srv.watch){a.st='done';a.msg='پایش #'+fa(srv.watch.id)+' فعال شد'}else{const r=await svApi('/api/ap/watch',{method:'POST',body:a.payload});a.st='done';a.msg='پایش #'+fa(r.watch.id)+' فعال شد'}}}catch(e){a.st='err';a.msg=String(e.message||e).slice(0,60)}
  if(a.sid&&a.st==='done'&&a.kind!=='watch'&&svOn())svApi('/api/ap/actions/'+a.sid,{method:'POST',body:{decision:'done'}}).catch(()=>{})}
 if(box){box.outerHTML=plActsHtml();plBind($('.ap-sumw'))}}
function plBind(sw){if(!sw)return;$$('.pl-a',sw).forEach(el=>{const a=(AP.acts||[]).find(x=>x.id===+el.dataset.id);if(!a)return;const ok=$('.ok',el),no=$('.no',el);if(ok)ok.onclick=()=>plDecide(a,true,$('.pl-acts',sw));if(no)no.onclick=()=>plDecide(a,false,$('.pl-acts',sw))})}
{const d0=apDecHtml;apDecHtml=function(){let h=d0();if(!h)return h;if(!AP.acts)AP.acts=plActs();const P=AP.plan,X=(AP.S||{}).scen;
 if(P){const c=[P.days?'≤ '+fa(P.days)+' روز':'',P.budget?'بودجه ≤ '+usd(P.budget):''].filter(Boolean);const line=`<p class="ic">هدف: <b>${PLG[P.goal]||''}</b>${c.length?' · محدودیت: '+c.join('، '):''}${X&&X.feasible!=null&&c.length?' · '+fa(X.feasible)+' از '+fa(X.rows.length)+' مسیر سازگار':''}</p>`;const i=h.indexOf('</b></div>');if(i>0)h=h.slice(0,i+10)+line+h.slice(i+10)}
 return h.replace(/<div class="bt">[\s\S]*?<\/div><\/div>$/,plActsHtml()+'<div class="bt"><button class="dc-cp">کپی کارت تصمیم</button></div></div>')}}
{const b0=apSumBind;apSumBind=function(sw){b0(sw);plBind(sw)}}
/* start wrapper: reset actions; after a full run register them on the server */
{const s0=apStart;apStart=async function(over){if(AP.run)return;AP.acts=null;AP.actsSrv=false;AP.runId=null;await s0(over);
 if(AP.done&&!AP.stopped&&AP.S){if(!AP.acts)AP.acts=plActs();if(svOn()&&AP.acts.length){for(let i=0;i<20&&!AP.runId;i++)await plSleep(150);try{const r=await svApi('/api/ap/actions',{method:'POST',body:{run:AP.runId,name:AP.S.o.nameFa+' ← '+AP.S.d.nameFa,items:AP.acts.map(a=>({kind:a.kind,title:a.t,detail:a.d,payload:a.payload}))}});(r.ids||[]).forEach((id,i)=>{if(AP.acts[i])AP.acts[i].sid=id});AP.actsSrv=true;const b=$('.ap-sumw .pl-acts');if(b){b.outerHTML=plActsHtml();plBind($('.ap-sumw'))}}catch(e){}}}
 AP.plan=null}}
/* active watches list (in the plan dialog) */
async function plWatchList(box){if(!box||!svOn())return;try{const r=await svApi('/api/ap/watch');const L=(r.watches||[]).filter(w=>w.active);if(!L.length){box.innerHTML='';return}
 box.innerHTML=`<h5>پایش‌های فعال<em>${fa(L.length)}</em></h5>${L.map(w=>`<div class="pl-wi" data-id="${w.id}"><div><b>${esc(w.name||w.lane)}</b><small>${[w.pol&&w.pod?w.pol+'→'+w.pod:'',w.baseRate?'نرخ پایه $'+w.baseRate:'',w.deadline?'موعد '+new Date(w.deadline).toLocaleDateString('fa-IR'):'',w.last?'آخرین هشدار: '+w.last:'بدون هشدار'].filter(Boolean).map(esc).join(' · ')}</small></div><button title="توقف پایش">توقف</button></div>`).join('')}<button class="pl-chk">بررسی همین حالا</button>`;
 $$('.pl-wi button',box).forEach(b=>b.onclick=async()=>{try{await svApi('/api/ap/watch/'+b.closest('.pl-wi').dataset.id,{method:'DELETE'});plWatchList(box)}catch(e){toast(e.message)}});
 $('.pl-chk',box).onclick=async()=>{try{const r=await svApi('/api/ap/watch/check',{method:'POST',body:{}});const n=(r.results||[]).reduce((a,x)=>a+x.signals.length,0);toast(n?fa(n)+' هشدار تازه (اعلان‌ها طبق قانون‌ها ارسال شد)':'تغییر قابل توجهی نبود');plWatchList(box)}catch(e){toast(e.message)}}}catch(e){}}
/* entry points: assistant panel, autopilot pre-flight, API */
{const p0=apPre;apPre=function(){const r=p0();const h=$('.apx-pre:not(.pl-dlg) header p');if(h&&!$('.apx-pl',h)){h.insertAdjacentHTML('beforeend',' <button type="button" class="cnl apx-pl">برنامه‌ریزی با یک جمله ←</button>');$('.apx-pl',h).onclick=e=>{e.preventDefault();$('.apx-pre-bg')?.remove();plShow()}}return r}}
try{NEV['autopilot.watch']=['هشدار پایش پس از اجرا','👁 {{name}}: {{text}}'];NEV['autopilot.approval']=['اقدام منتظر تأیید (کنترل خودکار)','📝 {{name}}: {{n}} اقدام منتظر تأیید — {{titles}}']}catch(e){}
setTimeout(()=>{if(!window.IFA||!IFA.autopilot)return;Object.assign(IFA.autopilot,{plan:t=>plShow(t||''),parse:t=>{const P=plParse(t);return {from:P.o&&P.o.id,to:P.d&&P.d.id,qty:P.qty,eq:P.eq,ship:P.ship,kg:P.kg,cbm:P.cbm,value:P.value,inc:P.inc,hs:P.hs,days:P.days,budget:P.budget,goal:P.goal,customer:P.cust,commodity:P.com,desc:P.desc,missing:P.miss}},
 runPlan:async(t,o={})=>{let P=plParse(t);if(svOn()&&(P.miss.length||!P.kg))P=await plLLM(P);if(!P.o||!P.d)throw new Error('مبدأ/مقصد مشخص نشد: '+P.miss.join('، '));P.st=Object.fromEntries(plStages(P).map(s=>[s.k,s.on]));P.acts={route:1,records:1,rfq:1,watch:svOn()?1:0,...(o.acts||{})};Object.assign(P,o);P.mode=o.mode||'instant';await plRun(P);return IFA.autopilot.status()},
 actions:()=>(AP.acts||[]).map(a=>({id:a.id,serverId:a.sid||null,kind:a.kind,title:a.t,detail:a.d,status:a.st})),decide:async(id,ok=true)=>{const a=(AP.acts||[]).find(x=>x.id===id||x.kind===id);if(!a)return null;await plDecide(a,ok,$('.ap-sumw .pl-acts'));return a.st},
 watches:()=>svApi('/api/ap/watch'),watchCheck:()=>svApi('/api/ap/watch/check',{method:'POST',body:{}})})},800);
