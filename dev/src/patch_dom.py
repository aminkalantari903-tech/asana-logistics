P='/data/atlas/ifa/public/index.html'
h=open(P,encoding='utf8').read()
assert 'function dtCalc' not in h,'already patched'
def rep(a,b,n=1):
    global h
    assert h.count(a)==n,(a[:80],h.count(a)); h=h.replace(a,b)
js=open('/data/atlas/src/dom-client.js',encoding='utf8').read()
assert '</script' not in js.lower()
rep("function rDom(b,C){","function rDomOld(b,C){")
rep("function dmCalc(S,T=dmTypes()){","function dmCalc0(S,T=dmTypes()){")
rep("['ifa-dom-t','نرخ انواع کامیون']","['ifa-dom-t','نرخ انواع کامیون'],['ifa-dtar','تعرفهٔ رسمی حمل داخلی (تن-کیلومتر)'],['ifa-dom-f','ضرایب ناوگان داخلی']")
rep("'market.weekly':['","'domestic.tariff':['ابلاغ یا خبر تعرفهٔ حمل داخلی','🚚 {{title}} — {{value}} {{effective}}'],'market.weekly':['")
rep("'market.weekly','rates.inbox']","'market.weekly','rates.inbox','domestic.tariff']")
rep("['await IFA.rates.pending()'","['IFA.domestic.calc(\"BND\",\"THR\",\"trl\",24)','کرایهٔ رسمی جاده‌ای داخلی (کف قانونی، برآورد کامل، بازار، امتیاز اعتبار)'],['IFA.domestic.check(\"BND\",\"THR\",450000000)','سنجش نرخ پیشنهادی با کف قانونی و بازار'],['IFA.domestic.tariff()','شاخص رسمی تن-کیلومتر، تاریخچه، حق توقف و ضرایب'],['await IFA.domestic.watch()','پایش ابلاغ‌ها و خبرهای تعرفه (سرور)'],['await IFA.rates.pending()'")
rep(" liveQuote(o={}){"," get domestic(){return dtApi}, liveQuote(o={}){")
rep("const IFA={version:'15.7',","const IFA={version:'15.8',")
anchor="/* ===== v15.2: live connections"
assert h.count(anchor)==1
h=h.replace(anchor,js+"\n"+anchor)
open(P,'w',encoding='utf8').write(h)
print('patched',len(h))
