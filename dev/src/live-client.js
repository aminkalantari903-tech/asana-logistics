
/* ===== v15.2: live connections — server live hub (FX + free market, road weather, real road km, sanctions lists, holidays) ===== */
(function(){
const LV={on:()=>!!svUrl(),get:(p,o={})=>fetch(svUrl()+p,{cache:'no-cache',...o}).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}),post:(p,b)=>LV.get(p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)})};
/* 1) FX — official cross rates + Iranian free-market rial, applied to the engine automatically */
const _fxLoad=fxLoad;
const fxMk=m=>{if(!m||!(m.USD>10000))return;const v=Math.round(m.USD);LSS('ifa-irr',v);LSS('ifa-irr-live',{t:m.ts||Date.now(),src:m.src,USD:m.USD,EUR:m.EUR,AED:m.AED,CNY:m.CNY,TRY:m.TRY,RUB:m.RUB});try{if(FIN.rx.free!==v){FIN.rx.free=v;finSave()}}catch(e){}emit('fx.market',{USD:v,src:m.src})};
fxLoad=async function(force){if(LSG('ifa-fxurl','')||!LV.on())return _fxLoad(force);if(!force&&FX.d&&FX.d.live&&Date.now()-FX.d.t<10*60e3)return FX.d;FX.busy=true;FX.err='';
 try{const j=await LV.get('/api/live/fx');if(!j.rates||!j.rates.EUR)throw new Error('ساختار پاسخ نامعتبر');FX.d={t:Date.now(),src:'https://'+(j.src||'ifa-live'),upd:j.time_last_update_utc||'',rates:j.rates,market:j.market||null,live:1};LSS('ifa-fx',FX.d);fxMk(j.market);
  emit('fx.updated',{src:j.src,EUR:j.rates.EUR,CNY:j.rates.CNY});FX.busy=false;return FX.d}catch(e){FX.busy=false;return _fxLoad(force)}};
/* 2) Roads — live weather alerts on passes/corridors/borders → «محدودیت مسیر و فصل» */
let RDN=0;async function roadsPull(){if(!LV.on())return;try{const j=await LV.get('/api/live/roads');LSS('ifa-live-roads',{t:j.fetched,points:j.points});
  const synced=svOn()&&!(SV.st.off||[]).includes('ifa-rtn');if(!synced){const cur=LSG('ifa-rtn',null);const base=Array.isArray(cur)?cur.filter(r=>!String(r&&r.id||'').startsWith('LIVE-')):RTN0.map(x=>({id:rgId(),route:x[0],season:x[1],kind:x[2],note:x[3],src:'نمونه — باید تأیید شود',chk:''}));
   const nx=JSON.stringify([...j.rows,...base]);if(nx!==JSON.stringify(cur))localStorage.setItem('ifa-rtn',nx)}
  const hi=j.rows.filter(r=>r.lvl>=3).length;if(hi&&hi!==RDN)toast('⚠ '+fa(hi)+' هشدار جدی جاده (زنده) — عملیات ← حمل‌کنندگان ← محدودیت مسیر');RDN=hi;emit('roads.updated',{alerts:j.rows.length,severe:hi})}catch(e){}}
/* 3) Routing — real road distances (OSRM/ORS) for domestic trucking & waybills */
const _dmKm=dmKm;const dmH=fnv(JSON.stringify(DMC.map(c=>[c[0],c[2],c[3]])));let KM=(()=>{const x=LSG('ifa-live-km',null);return x&&x.h===dmH?x:null})();
dmKm=function(a,c){if(KM&&a!==c){const i=KM.codes.indexOf(a),j=KM.codes.indexOf(c);const v=i>=0&&j>=0&&KM.km[i]&&KM.km[i][j];if(v)return Math.round(v/10)*10}return _dmKm(a,c)};
window.__ifaKm=()=>KM&&KM.src;
async function kmPull(){if(!LV.on()||(KM&&Date.now()-KM.t<30*864e5))return;try{const j=await LV.post('/api/live/matrix',{points:DMC.map(c=>[c[2],c[3]])});if(!j.km)return;KM={h:dmH,t:Date.now(),src:j.src,codes:DMC.map(c=>c[0]),km:j.km,min:j.min};LSS('ifa-live-km',KM)}catch(e){}}
/* 4) Official Iranian holidays → ETA/schedule calendar */
const _hol=holidays;holidays=function(){if(HOLC)return HOLC;const r=_hol();(LSG('ifa-live-hol',{}).holidays||[]).forEach(h=>{const s=Date.parse(h.a+'T00:00:00Z');if(s)r.push({cs:['IR'],s,e:s+DAY,n:h.n})});return r};
async function holPull(){if(!LV.on())return;const x=LSG('ifa-live-hol',null);if(x&&Date.now()-x.t<24*3600e3)return;try{const j=await LV.get('/api/live/holidays');if(j.holidays&&j.holidays.length){LSS('ifa-live-hol',{t:Date.now(),src:j.src,holidays:j.holidays});HOLC=null}}catch(e){}}
/* 5) Sanctions — daily OFAC SDN/Non-SDN + UN + EU from the server (falls back to the built-in snapshot) */
const _sxLoad=sxLoad;sxLoad=async function(){if(SX)return SX;if(SXP)return SXP;if(!LV.on())return _sxLoad();
 SXP=(async()=>{try{const J=await LV.get('/api/live/sanctions');if(!J||!Array.isArray(J.d)||J.d.length<1000)throw new Error('empty');const extra=LSG('ifa-sx-extra',null);
   if(extra&&extra.d&&extra.date>J.m.date){J.d=J.d.filter(x=>x[0]!=='O').concat(extra.d);J.m.ofac=extra.date}SX=sxIndex(J);return SX}catch(e){SXP=null;return _sxLoad()}})();return SXP};
/* scheduler */
const tick=()=>{if(!LV.on()||document.visibilityState==='hidden')return;fxLoad(true);roadsPull()};
setTimeout(()=>{if(!LV.on())return;fxLoad(false).then(()=>{const m=FX.d&&FX.d.market;if(m)fxMk(m)});roadsPull();kmPull();holPull()},3500);
setInterval(tick,10*60e3);setInterval(()=>{kmPull();holPull()},6*3600e3);
window.__IFA_LIVE={fx:()=>fxLoad(true),roads:roadsPull,km:()=>KM,holidays:()=>LSG('ifa-live-hol',null),status:()=>LV.get('/api/live/status')};
})();
