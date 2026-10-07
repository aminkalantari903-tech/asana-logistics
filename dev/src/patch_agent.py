P='/data/atlas/ifa/public/index.html'
h=open(P,encoding='utf8').read()
assert 'function rAgt' not in h,'already patched'
def rep(a,b,n=1):
    global h
    assert h.count(a)==n,(a[:80],h.count(a)); h=h.replace(a,b)
js=open('/data/atlas/src/agent-client.js',encoding='utf8').read()
assert '</script' not in js.lower()
rep("{k:'dom',n:'حمل داخلی',ic:'dom',key:''},","{k:'dom',n:'حمل داخلی',ic:'dom',key:''},{k:'agt',n:'کارکنان هوشمند',ic:'agt',key:''},")
rep("lq:rLq,","lq:rLq,agt:rAgt,")
rep("IC.cty=","IC.agt='<rect x=\"5\" y=\"8\" width=\"14\" height=\"11\" rx=\"3\"/><path d=\"M12 4v4M9 13h.01M15 13h.01M9.5 16.5h5\"/><circle cx=\"12\" cy=\"3.5\" r=\"1\"/><path d=\"M3 12v3M21 12v3\"/>';IC.cty=")
rep("items:['exec','inbox']},","items:['exec','inbox']},\n {k:'g-ai',n:'کارکنان هوشمند',s:'عامل‌ها',ic:'agt',d:'عامل‌های هوش مصنوعی: تحلیل بازار، استعلام و خرید، ریسک مسیر، اسناد، مالی، پیگیری و پاسخ به مشتری — با کارتابل تأیید',items:['agt']},")
rep("const NDESC={","const NDESC={agt:'هشت کارمند هوشمند روی داده‌های شما کار می‌کنند: نرخ‌ها را محک می‌زنند، استعلام می‌سازند، خبر ریسک را پایش می‌کنند و اسناد را کنترل می‌کنند. هر اقدام بیرونی، تعهدی یا مالی پیش از اجرا به کارتابل تأیید شما می‌آید و همه‌چیز ردپا دارد.',")
rep("rate:'نرخ‌های خرید","agt:'عامل‌های هوشمند با کارتابل تأیید، پرسش و پاسخ فارسی و استعلام خودکار',rate:'نرخ‌های خرید")
rep("['ifa-dom-f','ضرایب ناوگان داخلی']","['ifa-dom-f','ضرایب ناوگان داخلی'],['ifa-routes','وضعیت کریدورهای چین–ایران'],['ifa-payq','صف پرداخت تأییدشده']")
rep("'domestic.tariff':['","'agent.approval':['درخواست تأیید از سوی عامل هوشمند','🤖 {{agent}} ({{cls}}): {{summary}} — کارتابل تأیید {{ref}}'],'agent.alert':['هشدار عامل هوشمند','⚠️ {{agent}}: {{text}}'],'agent.report':['گزارش عامل (روزانه/هفتگی/کیفیت)','{{text}}'],'agent.done':['پایان کار عامل','✅ {{agent}} · {{kind}}: {{summary}}'],'route.status':['تغییر وضعیت کریدور','🛣 {{route}}: {{from}} → {{to}} — {{reason}}'],'quote.benchmarked':['محک پیشنهاد نرخ تازه','📊 {{company}} {{lane}}: {{usd}}$ · میانه {{median}}$ ({{deviation}}، {{verdict}})'],'risk.signal':['سیگنال ریسک مسیر از خبر','{{text}}'],'surcharge.notice':['اعلام سرشارژ تازه','{{text}}'],'payment.approved':['درخواست پرداخت تأییدشده','💳 {{vendor}} {{amount}} {{cur}} — {{ref}} (تأیید: {{by}})'],'domestic.tariff':['")
rep("'rates.inbox','domestic.tariff']","'rates.inbox','domestic.tariff','agent.approval','agent.alert','agent.report','agent.done','route.status','quote.benchmarked','risk.signal','surcharge.notice','payment.approved']")
rep("['IFA.domestic.calc(","['await IFA.agents.ask(\"میانهٔ نرخ ۴۰ فوت نینگبو به بندرعباس؟\")','پرسش فارسی از تحلیل‌گر بازار با ارجاع به منبع هر عدد (سرور)'],['await IFA.agents.run(\"procurement\",\"plan\",{pol:\"Ningbo\",dest:\"Tehran\",eq:\"40HC\",qty:2,deadlineDays:45},true)','برنامهٔ استعلام: مقایسهٔ مسیرها + پیش‌نویس RFQ در کارتابل تأیید'],['await IFA.agents.approvals()','کارتابل تأیید عامل‌ها'],['await IFA.agents.compareRoutes({pol:\"Ningbo\",dest:\"Tehran\",scenario:{closed:[\"sea-bnd\"]}})','مقایسهٔ کریدورها با سناریو'],['await IFA.agents.extract(\"Ningbo-BND 40HC USD 2250 valid 30 Nov\")','استخراج پیشنهاد نرخ از متن'],['IFA.domestic.calc(")
rep(" liveQuote(o={}){"," get agents(){return agApi}, liveQuote(o={}){")
rep("const IFA={version:'15.8',","const IFA={version:'15.9.1',")
anchor="/* ===== v15.2: live connections"
assert h.count(anchor)==1
h=h.replace(anchor,js+"\n"+anchor)
open(P,'w',encoding='utf8').write(h)
print('patched',len(h))
