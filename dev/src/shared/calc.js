/* ---------- safe calculator (shared by server and client): numbers, + - * / ^ %, parentheses, functions; no eval ---------- */
function calcNorm(s){s=String(s??'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
 return s.replace(/٫/g,'.').replace(/[٬،](?=\d{3}(\D|$))/g,'').replace(/(\d),(?=\d{3}(\D|$))/g,'$1').replace(/[×✕]/g,'*').replace(/(\d|\))\s*[xX]\s*(?=[\d(.])/g,'$1*').replace(/÷/g,'/').replace(/[−–—]/g,'-').replace(/\*\*/g,'^').replace(/\s*(درصد|percent)\b/gi,'%').replace(/،/g,',').replace(/=\s*$/,'').trim()}
function calcEval(src){const s=calcNorm(src);if(!s||s.length>400)throw new Error('عبارت خالی یا بیش از حد طولانی است');
 const T=[];const re=/\s*(?:(\d+(?:\.\d+)?(?:e[+-]?\d+)?|\.\d+)|([A-Za-z_\u0600-\u06FF][A-Za-z0-9_\u0600-\u06FF]*)|(\^|\*|\/|\+|-|%|\(|\)|,))/gy;let m,i=0;
 while(i<s.length){re.lastIndex=i;m=re.exec(s);if(!m||m[0].length===0){if(/\s/.test(s[i])){i++;continue}throw new Error('نویسهٔ نامعتبر: «'+s[i]+'»')}i=re.lastIndex;T.push(m[1]!=null?{t:'n',v:+m[1]}:m[2]!=null?{t:'id',v:m[2].toLowerCase()}:{t:'op',v:m[3]})}
 const F={sqrt:Math.sqrt,abs:Math.abs,floor:Math.floor,ceil:Math.ceil,exp:Math.exp,ln:Math.log,log:Math.log10,log10:Math.log10,sin:Math.sin,cos:Math.cos,tan:Math.tan,pow:Math.pow,
  round:(x,d=0)=>{const k=10**Math.max(0,Math.min(10,d|0));return Math.round(x*k)/k},min:(...a)=>Math.min(...a),max:(...a)=>Math.max(...a),sum:(...a)=>a.reduce((p,c)=>p+c,0),avg:(...a)=>a.reduce((p,c)=>p+c,0)/(a.length||1),
  'رادیکال':Math.sqrt,'جذر':Math.sqrt,'گرد':(x,d=0)=>{const k=10**(d|0);return Math.round(x*k)/k},'کمینه':(...a)=>Math.min(...a),'بیشینه':(...a)=>Math.max(...a),'میانگین':(...a)=>a.reduce((p,c)=>p+c,0)/(a.length||1),'جمع':(...a)=>a.reduce((p,c)=>p+c,0)};
 const K={pi:Math.PI,e:Math.E};let p=0,depth=0;const pk=()=>T[p],nx=()=>T[p++],is=v=>T[p]&&T[p].t==='op'&&T[p].v===v;
 const need=v=>{if(!is(v))throw new Error('«'+v+'» انتظار می‌رفت');p++};
 function expr(){if(++depth>60)throw new Error('عبارت بیش از حد تودرتو است');let a=term();
  while(is('+')||is('-')){const o=nx().v;const b=term();const v=b.pct?a.v*b.v:b.v;a={v:o==='+'?a.v+v:a.v-v}}depth--;return a}
 function term(){let a=pow();while(is('*')||is('/')){const o=nx().v;const b=pow();if(o==='/'&&b.v===0)throw new Error('تقسیم بر صفر');a={v:o==='*'?a.v*b.v:a.v/b.v}}return a}
 function pow(){const a=unary();if(is('^')){p++;const b=pow();return {v:Math.pow(a.v,b.v)}}return a}
 function unary(){if(is('-')){p++;const a=unary();return {v:-a.v,pct:a.pct}}if(is('+')){p++;return unary()}return post()}
 function post(){let a=prim();while(is('%')){p++;a={v:a.v/100,pct:true}}return a}
 function prim(){const t=nx();if(!t)throw new Error('عبارت ناقص است');if(t.t==='n')return {v:t.v};
  if(t.t==='op'&&t.v==='('){const a=expr();need(')');return {v:a.v}}
  if(t.t==='id'){if(is('(')){p++;const A=[];if(!is(')')){A.push(expr().v);while(is(',')){p++;A.push(expr().v)}}need(')');const f=F[t.v];if(!f)throw new Error('تابع ناشناخته: '+t.v);return {v:f(...A)}}
   if(t.t==='id'&&K[t.v]!=null)return {v:K[t.v]};throw new Error('نام ناشناخته: '+t.v)}
  throw new Error('عبارت نامعتبر نزدیک «'+t.v+'»')}
 const r=expr();if(p<T.length)throw new Error('عبارت نامعتبر نزدیک «'+T[p].v+'»');if(!isFinite(r.v))throw new Error('نتیجه عدد متناهی نیست');return r.v}
/* logistics shortcuts: CBM / chargeable weight from "L×W×H [× n] [kg]" (cm) */
function calcCargo(q){const s=calcNorm(q);const m=s.match(/(\d+(?:\.\d+)?)\s*\*\s*(\d+(?:\.\d+)?)\s*\*\s*(\d+(?:\.\d+)?)(?:\s*(?:cm|سانت\S*))?(?:[^\d]{0,24}?(\d+)\s*(?:عدد|بسته|کارتن|پالت|pcs|pkgs?|ctns?|×|\*|x))?/i);
 if(!m||!/(cbm|حجم|متر مکعب|وزن حجمی|قابل پرداخت|chargeable|volum|ابعاد|کارتن|پالت|بسته)/i.test(String(q)))return null;
 const [L,W,H]=[+m[1],+m[2],+m[3]];const n=+(m[4]||(s.match(/(\d+)\s*(?:عدد|بسته|کارتن|پالت|pcs|pkgs?|ctns?)/i)||[])[1]||1);const kg=+((s.match(/(\d+(?:\.\d+)?)\s*(?:kg|کیلو\S*)/i)||[])[1]||0);
 const cbm=L*W*H/1e6*n;const air=cbm*167,road=cbm*333,sea=Math.max(cbm,kg/1000);
 return {cbm:+cbm.toFixed(3),n,kg,air:Math.round(air),airChg:Math.round(Math.max(air,kg)),road:Math.round(road),roadChg:Math.round(Math.max(road,kg)),seaWM:+sea.toFixed(3),dims:[L,W,H]}}
