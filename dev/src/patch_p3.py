P='/data/atlas/ifa/public/index.html'
h=open(P,encoding='utf8').read()
assert 'function mkPrt' not in h,'already patched'
def rep(a,b):
    global h
    assert h.count(a)==1,(a[:70],h.count(a)); h=h.replace(a,b)
js=open('/data/atlas/src/p3-client.js',encoding='utf8').read()
assert '</script' not in js.lower()
rep("['ing','ورود خودکار نرخ'],['src','منابع و روش']","['ing','ورود خودکار نرخ'],['prt','پنل نرخ شرکا'],['rep','گزارش هفتگی'],['src','منابع و روش']")
rep("ing:mkIng,src:mkSrc","ing:mkIngX,prt:mkPrt,rep:mkRep,src:mkSrc")
rep("'rate.threshold':['","'market.weekly':['گزارش هفتگی بازار نرخ','{{text}}'],'partner.rates':['نرخ جدید از پنل شرکا','🤝 {{company}}: {{n}} نرخ جدید — {{lanes}}'],'rates.inbox':['ایمیل نرخ جدید','📥 {{n}} ایمیل نرخ: {{subjects}}'],'rate.alert':['هشدار نرخ (کلی)','🔔 {{name}}: {{value}}'],'rate.threshold':['")
rep("'live.quote']","'live.quote','rate.alert','partner.rates','market.weekly','rates.inbox']")
rep("emit('rate.threshold',{name:n,op:w.op,threshold:w.val,value:Math.round(x.v),type:w.type})","emit('rate.threshold',{name:n,op:w.op,threshold:w.val,value:Math.round(x.v),type:w.type}),emit('rate.alert',{kind:'threshold',name:n,value:Math.round(x.v),threshold:w.val})")
rep("['IFA.liveQuote(","['await IFA.rates.pending()','نرخ‌های پنل شرکا در انتظار تأیید'],['await IFA.rates.weeklyReport()','گزارش هفتگی بازار (شاخص‌ها، نرخ شرکا، هشدارها)'],['await IFA.rates.reference({o:\"Shanghai\",oc:\"CN\",d:\"Jebel Ali\",dc:\"AE\",eq:\"40HC\"})','برآورد مرجع آنلاین (Freightos / API پولی)'],['IFA.liveQuote(")
api=""" rates:{benchmark:f=>IFA.market.benchmark(f||{}),check:(a,c,f)=>IFA.market.check(a,c,f||{}),partners:()=>svApi('/api/partners'),pending:()=>svApi('/api/partners/rates?status=new'),approve:(ids,ok=true)=>svApi('/api/partners/rates',{method:'POST',body:{ids,status:ok?'ok':'rej'}}),inbox:()=>svApi('/api/rates/inbox'),weeklyReport:()=>svApi('/api/reports/market'),reference:o=>svApi('/api/live/quote-ref?'+new URLSearchParams(o||{}))},
"""
rep(" liveQuote(o={}){",api+" liveQuote(o={}){")
rep("const IFA={version:'15.6',","const IFA={version:'15.7',")
rep("['ifa-lq','","['ifa-p3','پنل شرکا، گزارش هفتگی و صندوق ایمیل نرخ (روی سرور)'],['ifa-lq','")
anchor="/* ===== v15.2: live connections"
assert h.count(anchor)==1
h=h.replace(anchor,js+"\n"+anchor)
open(P,'w',encoding='utf8').write(h)
print('patched',len(h))
