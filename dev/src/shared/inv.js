/* ---------- invoice / debit-note line extractor (shared by server and client): text -> cost lines by component ---------- */
const INVC=[
 ['dem',/demurrage|detention|storage|انبارداری|دموراژ|دیتنشن|توقف/i],['duty',/\bduty\b|duties|customs duty|حقوق ورودی|حقوق گمرکی|سود بازرگانی/i],['vat',/\bvat\b|value added|ارزش افزوده/i],
 ['ins',/insurance|premium|بیمه/i],['broker',/brokerage|broker|agency fee|حق.?العمل/i],['exp',/export (customs|clearance)|ترخیص صادرات/i],['imp',/customs clearance|import clearance|clearance|ترخیص/i],
 ['fuel',/\bbaf\b|bunker|\blss\b|\bebs\b|\bfaf\b|fuel|\bcaf\b|سوخت/i],['peak',/\bpss\b|peak season|\bgri\b|congestion|war risk|سورشارژ فصلی|پیک/i],['special',/\bdg\b|hazard|imo surcharge|oog|reefer|خطرناک/i],
 ['thc',/\bthc\b|terminal handling|handling|\blo\/lo\b|lift|تخلیه|بارگیری|عملیات ترمینال/i],['docs',/\bb\/?l\b|bill of lading|\bdoc(ument(ation)?)?s?\b|documentation|\bd\/o\b|delivery order|telex|\bams\b|\bens\b|\bisf\b|seal|certificate|بارنامه|ترخیصیه|اسناد|گواهی/i],
 ['bank',/bank charge|remittance|swift|wire fee|کارمزد|حواله/i],['transfer',/transship|feeder|فیدر|ترانشیپ/i],['border',/border|transit fee|toll|عوارض|ترانزیت/i],
 ['origin',/pick.?up|origin (trucking|haulage)|ex.?works|collection|precarriage|pre-carriage|stuffing|جمع.?آوری|حمل مبدأ/i],['last',/delivery|on.?carriage|trucking|haulage|truck|کامیون|حمل داخلی|کرایه حمل داخلی|حمل تا انبار/i],
 ['freight',/ocean freight|sea freight|air freight|\bo\/f\b|\ba\/f\b|freight|rail|کرایه|حمل دریایی|حمل هوایی|حمل ریلی|نولون/i]];
const INVCUR=[['USD',/usd|us\$|\$|دلار/i],['EUR',/eur|€|یورو/i],['AED',/aed|dhs|درهم/i],['CNY',/cny|rmb|¥|یوان/i],['TRY',/\btry\b|₺|لیر/i],['IRR',/irr|rial|ریال/i],['IRT',/تومان|toman/i]];
function invNum(s){s=String(s).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/٫/g,'.').replace(/[٬،]/g,',');
 if(/^\d{1,3}(\.\d{3})+,\d{1,2}$/.test(s))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(/,(?=\d{3}(\D|$))/g,'').replace(',','.');return +s}
function invParse(text,defCur){const T=String(text||'').replace(/\r/g,'');const all=T.slice(0,20000);let dc=defCur||'';
 if(!dc){let b=0;for(const [c,re] of INVCUR){const n=(all.match(new RegExp(re.source,'gi'))||[]).length;if(n>b){b=n;dc=c}}dc=dc||'USD'}
 const out=[];for(let ln of T.split(/\n+/).slice(0,600)){const raw=ln.trim();if(raw.length<3)continue;if(/\b(sub.?total|grand total|total|balance|amount due|net amount)\b|جمع کل|جمع|مانده|مبلغ کل|قابل پرداخت/i.test(raw))continue;
  let s=raw.replace(/\b[A-Za-z]+[-/]?\d{3,}[A-Za-z\d]*\b|\b\d{3,}[A-Za-z]+[A-Za-z\d]*\b/g,' ').replace(/\b\d{4}[-/.]\d{1,2}[-/.]\d{1,4}\b|\b\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\b|[۰-۹]{4}\/[۰-۹]{1,2}\/[۰-۹]{1,2}/g,' ').replace(/\b(19|20)\d{2}\b/g,' ').replace(/\b\d+\s?(x|×)\s?(20|40|45)\s?('|ft|hc|gp|dv)?/gi,' ').replace(/\b(20|40|45)\s?('|ft|hc|gp|dv|rf)\b/gi,' ');
  const nums=[...s.matchAll(/[\d۰-۹٠-٩][\d۰-۹٠-٩.,٬،٫]*/g)].map(m=>invNum(m[0])).filter(v=>isFinite(v)&&v>0);if(!nums.length)continue;
  const label=raw.replace(/[\d۰-۹٠-٩][\d۰-۹٠-٩.,٬،٫]*/g,' ').replace(/\b(usd|eur|aed|cny|rmb|irr|try)\b|[$€¥₺]|دلار|یورو|درهم|یوان|ریال|تومان/gi,' ').replace(/[|:\t]+/g,' ').replace(/\s+/g,' ').trim().slice(0,80);if(label.length<2)continue;
  const hit=INVC.find(c=>c[1].test(raw));let cur=dc;for(const [c,re] of INVCUR)if(re.test(raw)){cur=c;break}let amt=nums[nums.length-1];if(cur==='IRT'){cur='IRR';amt*=10}
  if(amt<1||(amt<10&&nums.length===1&&!hit))continue;out.push({label,amt:Math.round(amt*100)/100,cur,comp:hit?hit[0]:'other',conf:hit?0.8:0.35})}
 const tot={};for(const l of out)tot[l.cur]=(tot[l.cur]||0)+l.amt;return {lines:out.slice(0,80),totals:tot,cur:dc}}
