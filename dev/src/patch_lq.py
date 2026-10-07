P='/data/atlas/ifa/public/index.html'
h=open(P,encoding='utf8').read()
assert 'function rLq' not in h,'already patched'
def rep(a,b):
    global h
    assert h.count(a)==1,(a[:70],h.count(a)); h=h.replace(a,b)
js=open('/data/atlas/src/lq-client.js',encoding='utf8').read()
assert '</script' not in js.lower()
# engine hooks (React bundle): live leg pricing + rates setter for recompute
rep('{freight:l,fuel:d,peak:p,special:m,basis:u,base:c}}a(ZR,"legFreight")','(window.__IFA_LF?window.__IFA_LF(e,t,r,n,o,{freight:l,fuel:d,peak:p,special:m,basis:u,base:c}):{freight:l,fuel:d,peak:p,special:m,basis:u,base:c})}a(ZR,"legFreight")')
rep('(0,Ie.useEffect)(()=>{n9(i)},[i])','(0,Ie.useEffect)(()=>{n9(i)},[i]),(0,Ie.useEffect)(()=>{window.__IFA_RATES=[i,s]},[i,s])')
rep('F=ZR(_,i,t,n,!E)','F=(window.__IFA_LD=L.from,ZR(_,i,t,n,!E))')
# studio registry
rep("{k:'opt',n:'بهینه‌ساز مسیر',ic:'opt',key:'O'}","{k:'opt',n:'بهینه‌ساز مسیر',ic:'opt',key:'O'},{k:'lq',n:'هزینهٔ حمل با دادهٔ روز',ic:'lq',key:''}")
rep("IC.cty=","IC.lq='<circle cx=\"6\" cy=\"18\" r=\"2.2\"/><circle cx=\"18\" cy=\"6\" r=\"2.2\"/><path d=\"M8 17c5 0 3-10 8-10\"/><path d=\"M14 16h7M17.5 13v6\"/>';IC.cty=")
rep("eko:rEko,","eko:rEko,lq:rLq,")
rep("items:['opt','cn','plan','scen','res']","items:['opt','lq','cn','plan','scen','res']")
rep("const NDESC={","const NDESC={lq:'مبدأ و مقصد را انتخاب کنید: کرایهٔ هر بخش از دادهٔ روز (CCFI، سوخت کشتی، گازوئیل کشورها، دلار آزاد و نرخ‌های واقعی شما) محاسبه و با مدل مقایسه می‌شود',")
rep("rate:'نرخ‌های خرید با تاریخ اعتبار، هشدار انقضا و ارزان‌ترین گزینه',mkt:","lq:'هزینهٔ حمل مبدأ تا مقصد با دادهٔ روز منابع عمومی',rate:'نرخ‌های خرید با تاریخ اعتبار، هشدار انقضا و ارزان‌ترین گزینه',mkt:")
rep("['mkt','شاخص بازار حمل (CCFI، WCI، FBX، سوخت) و محک نرخ'],","['mkt','شاخص بازار حمل (CCFI، WCI، FBX، سوخت) و محک نرخ'],['lq','هزینهٔ حمل مبدأ→مقصد با دادهٔ روز'],")
rep("['ifa-mkt','شاخص بازار","['ifa-lq','تنظیمات هزینهٔ حمل با دادهٔ روز'],['ifa-mkt','شاخص بازار")
rep("'market.updated','rates.imported']","'market.updated','rates.imported','live.quote']")
rep("['IFA.nodes(\"bandar\")'","['IFA.liveQuote({from:\"CN_SHA\",to:\"IR_THR\"})','هزینهٔ حمل مبدأ→مقصد با دادهٔ روز و منبع هر بخش'],['IFA.liveData()','تازگی داده‌های زنده (دلار، CCFI، سوخت، گازوئیل)'],['IFA.nodes(\"bandar\")'")
# market indices page: diesel table has its own place (avoid 40 lines in the index list)
rep("Object.entries(ser).forEach(([s,o])=>(o.lines||[])","Object.entries(ser).filter(([s])=>s!=='diesel').forEach(([s,o])=>(o.lines||[])")
rep("bunker:'سوخت کشتی'};","bunker:'سوخت کشتی',diesel:'گازوئیل'};")
api=""" liveQuote(o={}){const Q=lqQuote(o.from,o.to,o.top||LQS.top);return {from:Q.from,to:Q.to,at:new Date(Q.at).toISOString(),routes:Q.routes.map(r=>({name:r.name,modes:r.modes,days:+r.days.toFixed(1),liveUSD:Math.round(r.live),modelUSD:Math.round(r.model),confidence:+r.conf.toFixed(2),legs:r.legs.map(l=>({from:l.from,to:l.to,mode:l.mode,km:Math.round(l.km),modelUSD:Math.round(l.model),liveUSD:Math.round(l.live),source:l.src,sourceName:(LQSRC[l.src]||LQSRC.model)[0],date:l.date,note:l.note,irr:l.irr?Math.round(l.irr):null}))})),data:Q.data.map(({k,n,v,d,s,age})=>({key:k,name:n,value:v,date:d,source:s,ageDays:age}))}},
 liveData:()=>lqFresh().map(({k,n,v,d,s,age})=>({key:k,name:n,value:v,date:d,source:s,ageDays:age})),
 liveMode(on){if(on!=null){LQS.on=!!on;lqSv();lqApply()}return LQS.on},
"""
rep(" open:v=>open(v),report:()=>report(),",api+" open:v=>open(v),report:()=>report(),")
rep("const IFA={version:'15.5',","const IFA={version:'15.6',")
anchor="/* ===== v15.2: live connections"
assert h.count(anchor)==1
h=h.replace(anchor,js+"\n"+anchor)
open(P,'w',encoding='utf8').write(h)
print('patched',len(h))
