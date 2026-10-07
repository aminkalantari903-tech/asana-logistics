P='/data/atlas/ifa/public/index.html'
h=open(P,encoding='utf8').read()
assert 'function rMkt' not in h,'already patched'
def rep(a,b):
    global h
    assert h.count(a)==1,(a[:70],h.count(a)); h=h.replace(a,b)
js=open('/data/atlas/src/mkt-client.js',encoding='utf8').read()
assert '</script' not in js.lower()
rep("{k:'rate',n:'بانک نرخ',ic:'rate',key:''}","{k:'rate',n:'بانک نرخ',ic:'rate',key:''},{k:'mkt',n:'شاخص بازار و محک نرخ',ic:'mkt',key:''}")
rep("IC.cty=","IC.mkt='<path d=\"M3 20h18\"/><path d=\"M4 16l4.5-5 3.5 3 5-7 3 3\"/><circle cx=\"20\" cy=\"10\" r=\"1.3\"/>';IC.cty=")
rep("eko:rEko,","eko:rEko,mkt:rMkt,")
rep("'rate','dom','fc'","'rate','mkt','dom','fc'")
rep("const NDESC={","const NDESC={mkt:'شاخص‌های CCFI (خلیج فارس)، SCFI، WCI، FBX و سوخت با هشدار جهش؛ اعتبار و محک هر نرخ؛ برآورد مسیرهای ایران؛ ورود نرخ از ایمیل/Excel',")
rep("rate:'نرخ‌های خرید با تاریخ اعتبار، هشدار انقضا و ارزان‌ترین گزینه'","rate:'نرخ‌های خرید با تاریخ اعتبار، هشدار انقضا و ارزان‌ترین گزینه',mkt:'شاخص بازار حمل، محک و اعتبار نرخ، برآورد مسیرهای ایران'")
rep("['eko','اکوسیستم لجستیک چین: ۶٬۹۸۱ شرکت و نهاد در ۱۲ لایه'],","['eko','اکوسیستم لجستیک چین: ۶٬۹۸۱ شرکت و نهاد در ۱۲ لایه'],['mkt','شاخص بازار حمل (CCFI، WCI، FBX، سوخت) و محک نرخ'],")
rep("['ifa-eko','","['ifa-mkt','شاخص بازار: مقادیر دستی و نرخ‌های پایه'],['ifa-eko','")
rep("'china.pick','china.screened']","'china.pick','china.screened','rate.jump','rate.threshold','market.updated','rates.imported']")
rep("'rate.expiring':[","'rate.threshold':['عبور از آستانهٔ نرخ/شاخص','🔔 {{name}}: {{value}} — {{op}} آستانهٔ {{threshold}}'],'rate.jump':['جهش شاخص کرایه (سرور)','⚡ {{index}} — {{lane}}: {{change}} · {{value}} {{unit}} ({{date}})'],'rate.expiring':[")
# RFQ quotes: market verdict column
rep("<th>انحراف از مدل</th>","<th>انحراف از مدل</th><th>محک بازار</th>")
rep(":''}</td><td>${nf(q.d,1)}</td>",":''}</td><td>${(()=>{const m=mkQuote(q,Q,model);return m.dv==null?'—':mkVb(m.v)+' <small class=\"sx-muted\" title=\"میانهٔ '+fa(m.n)+' مرجع (سایر پیشنهادها تعدیل‌شده با CCFI + مدل)\">'+(m.dv>0?'+':'')+nf(m.dv*100,1)+'٪</small>'})()}</td><td>${nf(q.d,1)}</td>")
# rate bank: credibility, verdict, provenance
rep("const draw=()=>{const L=rbFilter(R,F);","const draw=()=>{const L=rbFilter(R,F);const MV=new Map(mkScore(R).map(o=>[o.r.id,o]));")
rep("<th>معادل $</th>","<th>معادل $</th><th>اعتبار / محک</th>")
rep("<td>${usd0(pU(r.amt,r.cur))}</td>","<td>${usd0(pU(r.amt,r.cur))}</td><td>${(o=>o?mkCb(o)+(o.verdict?' '+mkVb(o.verdict):''):'')(MV.get(r.id))}</td>")
rep("<td><small>${esc(r.note||'')}</small></td>","<td><small>${esc(r.note||'')}</small><div class=\"rb-src\">${esc((MKSRC[mkSrcOf(r)]||MKSRC.manual)[0])}${r.incl?' · '+esc(r.incl):''}</div></td>")
rep("R.unshift({...N,id:'R'+Date.now().toString(36)})","R.unshift({...N,src:'manual',id:'R'+Date.now().toString(36)})")
rep('<button class="sx-btn sm" data-seed>','<button class="sx-btn sm" data-mking>ورود خودکار از ایمیل / Excel</button><button class="sx-btn sm" data-mkbm>محک و اعتبار نرخ‌ها</button><button class="sx-btn sm" data-seed>')
rep("$('[data-seed]',b).onclick=","$('[data-mking]',b).onclick=()=>{MKS.tab='ing';mkSv();open('mkt')};$('[data-mkbm]',b).onclick=()=>{MKS.tab='bm';mkSv();open('mkt')};$('[data-seed]',b).onclick=")
api=""" market:{
  indices(){const S=mkC();const H=mkHist();return {fetched:S&&S.t||null,series:S?S.series:{},history:H,alerts:S?S.alerts||[]:[]}},
  history:k=>mkHist()[k]||[],refresh:(force=false)=>mkPull(force),
  addIndex(series,line,date,value){const M=mkM();M.manual=M.manual.filter(m=>!(m.s===series&&m.l===line&&m.d===date));M.manual.push({s:series,l:line,date,d:date,v:+value,t:Date.now()});mkMS(M);return true},
  lanesIndex:r=>mkMap(r),adjust:(r,to)=>mkAdj(r,mkHist(),to),
  benchmark(f={}){const V=mkScore();return V.filter(o=>(!f.pol||nkey(o.r.pol).includes(nkey(f.pol)))&&(!f.pod||nkey(o.r.pod).includes(nkey(f.pod)))&&(!f.eq||mkEqC(o.r.eq)===mkEqC(f.eq))).map(o=>({id:o.r.id,vendor:o.r.vendor,pol:o.r.pol,pod:o.r.pod,eq:o.r.eq,usd:Math.round(o.u),adjustedUsd:o.adj?Math.round(o.adj.usd):null,index:o.adj?o.adj.k:null,laneMedian:o.ref?Math.round(o.ref):null,deviation:o.dv,verdict:o.verdict||null,credibility:o.score,source:mkSrcOf(o.r)}))},
  check(amount,cur,f){const L=IFA.market.benchmark(f).map(x=>x.adjustedUsd||x.usd);const m=mkMed(L);if(!m)return {verdict:null,reason:'no reference'};const dv=pU(amount,cur||'USD')/m-1;return {median:Math.round(m),n:L.length,deviation:+dv.toFixed(3),verdict:dv>.15?'expensive':dv<-.2?'suspiciously-cheap':'fair'}},
  estimate:o=>mkEstimate(o),estimates:()=>MKIR.map(([pol,pod,eq])=>mkEstimate({pol,pod,eq})),
  parse:(text,src)=>mkParse(text,src),
  forecast:(key='ccfi|PERSIAN_GULF_RED_SEA',weeks=12)=>{const R=mkForecast(key,weeks);return R&&{key,last:R.last,weeklyVol:R.sig,empiricalVol:R.emp,points:R.F.map(p=>({date:p.d,value:+p.v.toFixed(2),lo80:+p.lo.toFixed(2),hi80:+p.hi.toFixed(2)}))}},
  surcharges:(o={pol:'Shanghai',pod:'Bandar Abbas',eq:'40HC'})=>{const X=mkSurCalc(o);return {total:X.total,lines:X.L.map(x=>({key:x.k,name:x.n,usd:x.v==null?null:Math.round(x.v),basis:x.b})),baseIncludes:X.inc}},
  setSurcharges:o=>{const S=Object.assign(mkSurC(),o||{});mkSurS(S);return S},
  watches:()=>mkM().watch||[],addWatch:w=>{const M=mkM();const x={id:'W'+Date.now().toString(36),op:'>',...w};M.watch=[...(M.watch||[]),x];mkMS(M);mkWatchRun();return x},
  ingest(text,src){const P=mkParse(text,src);const A=rbAll();P.forEach(r=>A.unshift({id:'R'+Math.random().toString(36).slice(2,9),...r}));LSS('ifa-rates',A);emit('rates.imported',{n:P.length,src:src||'api'});return P.length}},
"""
rep(" open:v=>open(v),report:()=>report(),",api+" open:v=>open(v),report:()=>report(),")
rep("const IFA={version:'15.3',","const IFA={version:'15.5',")
anchor="/* ===== v15.2: live connections"
assert h.count(anchor)==1
h=h.replace(anchor,js+"\n"+anchor)
open(P,'w',encoding='utf8').write(h)
print('patched',len(h))
