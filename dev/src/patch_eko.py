import json,sys
P='/data/atlas/ifa/public/index.html'
h=open(P,encoding='utf8').read()
assert 'EKO_B64' not in h,'already patched'
def rep(a,b):
    global h
    assert h.count(a)==1,(a[:70],h.count(a)); h=h.replace(a,b)
js=open('/data/atlas/src/eko-client.js',encoding='utf8').read()
js=js.replace('__EKO_B64__',open('/data/atlas/src/cne.b64').read().strip()).replace('__EKO_LINK__',json.dumps(json.load(open('/data/atlas/src/eko_link.json')))).replace('__EKO_SNAP__',json.dumps(json.load(open('/data/atlas/src/eko_snap2.json')),ensure_ascii=False))
assert '</script' not in js.lower()
# 1 tabs / icon / render map / nav / descriptions
rep("{k:'crm',n:'شرکا و فورواردرها',ic:'crm',key:''},","{k:'crm',n:'شرکا و فورواردرها',ic:'crm',key:''},{k:'eko',n:'اکوسیستم لجستیک چین',ic:'eko',key:''},")
rep("IC.cty=","IC.eko='<path d=\"M4 20V9l5-3v14\"/><path d=\"M9 20V4l6 3v13\"/><path d=\"M15 20V10l5 2v8\"/><path d=\"M3 20h18\"/>';IC.cty=")
rep("crm:rCrm,","crm:rCrm,eko:rEko,")
rep("items:['intel','cty','src','crm','flt']","items:['intel','cty','src','crm','eko','flt']")
rep("const NDESC={","const NDESC={eko:'۶٬۹۸۱ شرکت و نهاد زنجیرهٔ حمل چین در ۱۲ لایه با اعتبار، منبع، کریدور ایران و غربالگری تحریم',")
rep("crm:'کارت امتیاز فورواردرها و دفترچهٔ تماس',sys:","crm:'کارت امتیاز فورواردرها و دفترچهٔ تماس',eko:'۶٬۹۸۱ شرکت و نهاد لجستیک چین · کریدور ایران · تحریم',sys:")
rep("['crm','کارت امتیاز فورواردرها و دفترچهٔ تماس'],","['crm','کارت امتیاز فورواردرها و دفترچهٔ تماس'],['eko','اکوسیستم لجستیک چین: ۶٬۹۸۱ شرکت و نهاد در ۱۲ لایه'],")
rep(" [['plan','برنامه‌ریزی معکوس"," Object.keys(EKO_L).forEach(k=>X.push({g:'اکوسیستم لجستیک چین',t:'فهرست '+EKO_L[k][0]+' چین ('+k+')',run:()=>{Object.assign(EKO,{L:[k],tab:'dir',page:0,sel:null,q:''});open('eko')}}));\n [['cor','کریدور چین–ایران: ادعاهای مستند، دروازه‌ها و نهادهای کریدور'],['scr','غربالگری تحریمی دسته‌ای شرکای چینی'],['pick','فهرست منتخب شرکای چینی']].forEach(([k,t])=>X.push({g:'اکوسیستم لجستیک چین',t,run:()=>ekoGo(null,k)}));\n [['plan','برنامه‌ریزی معکوس")
# 2 parties: RFQ, CRM, sanctions
rep("DS.cncos.forEach((c,i)=>L.push({id:'c'+i","ekoParties().forEach(p=>L.push(p));DS.cncos.forEach((c,i)=>L.push({id:'c'+i")
rep("const raw=p.id[0]==='f'?DS.fwd[+p.id.slice(1)]:DS.cncos[+p.id.slice(1)];","const raw=p.id[0]==='f'?DS.fwd[+p.id.slice(1)]:p.id[0]==='e'?ekoRaw(p.id):DS.cncos[+p.id.slice(1)];")
rep("DS.cncos.forEach(c=>P.push({n:c.en,fa:c.cn,g:'شرکت چینی',x:c.type}));","DS.cncos.forEach(c=>P.push({n:c.en,fa:c.cn,g:'شرکت چینی',x:c.type}));ekoPicks().forEach(p=>P.push({n:p.n,fa:p.cn,g:'اکوسیستم چین',x:(EKO_L[p.L]||[p.L])[0]}));")
rep("[['all','همه'],['فورواردر ایرانی','ایرانی'],['شرکت چینی','چینی']]","[['all','همه'],['فورواردر ایرانی','ایرانی'],['شرکت چینی','چینی'],['اکوسیستم چین','منتخب اکوسیستم']]")
rep("if(m)sn=m.h.length?m.h[0]:false}","if(m)sn=m.h.length?m.h[0]:false}if(sn==null&&p.id[0]==='e'){const x=EKO_SNAP.h[p.id.slice(1)];if(x&&x.l==='s')sn={n:x.name,name:x.name}}")
rep('<small>فورواردرهای ایرانی، شرکت‌های لجستیک چین، طرف‌های افزوده‌شده</small>','<small>فورواردرهای ایرانی، شرکت‌های لجستیک چین، منتخب‌های اکوسیستم چین و طرف‌های افزوده‌شده</small>')
rep('<span class="sx-sp"></span>${nd?`<button class="sx-btn sm pri" data-opt="${nd.id}">مسیر بهینه تا تهران</button>`','<span class="sx-sp"></span><button class="sx-btn sm" data-ekoq="${esc(city)}">شرکت‌های لجستیک این هاب در اکوسیستم چین</button>${nd?`<button class="sx-btn sm pri" data-opt="${nd.id}">مسیر بهینه تا تهران</button>`')
# 3 intel directory: links + banner
rep("<p>${esc(f.type)}</p><dl><dt>سرویس ایران</dt>","<p>${esc(f.type)}</p>${ekoCard(f)}<dl><dt>سرویس ایران</dt>")
rep('<h4 class="in-h">شرکت‌های لجستیک چینی <small>وضعیت تحریمی طبق فایل — پیش از همکاری غربالگری کنید</small></h4>','<h4 class="in-h">شرکت‌های لجستیک چینی <small>وضعیت تحریمی طبق فایل — پیش از همکاری غربالگری کنید</small> <button class="sx-btn sm" data-eko-all>جستجو در ۶٬۹۸۱ نهاد اکوسیستم لجستیک چین ←</button></h4>')
rep("const qi=$('.in-cq',B);qi.oninput=","ekoBind(B);{const ea=$('[data-eko-all]',B);if(ea)ea.onclick=()=>{EKO.q=INT.cq||'';EKO.page=0;EKO.sel=null;ekoGo(null,'dir')}}const qi=$('.in-cq',B);qi.oninput=")
# 4 server sync key, API events, IFA API
rep("['ifa-crm','شرکا و فورواردرها'],","['ifa-crm','شرکا و فورواردرها'],['ifa-eko','اکوسیستم چین: منتخب‌ها، یادداشت‌ها و غربالگری'],")
rep("'query.run'];","'query.run','china.pick','china.screened'];")
api=""" china:{
  async stats(){const J=await ekoLoad();const c=f=>J.d.filter(f).length;const by={};J.d.forEach(r=>by[r[1]]=(by[r[1]]||0)+1);return {source:J.file,generated:J.gen,entities:J.d.length,layers:Object.fromEntries(Object.keys(EKO_L).map(k=>[k,{name:EKO_L[k][1],count:by[k]||0}])),verified:c(r=>r[15]==='V'),partiallyVerified:c(r=>r[15]==='P'),uncertain:c(r=>r[15]==='U'),corridor:c(r=>r[17]),iranRelevanceRecorded:c(r=>!'UN'.includes(r[21])),picks:ekoPicks().length}},
  async search(q='',f={}){const J=await ekoLoad();const k=nkey(q);const Ls=f.layer?[].concat(f.layer):null;return J.d.filter(r=>(!k||r.k.includes(k))&&(!Ls||Ls.includes(r[1]))&&(!f.verification||r[15]===String(f.verification)[0].toUpperCase())&&(f.corridor==null||!!r[17]===!!f.corridor)&&(!f.province||r[23]===f.province)&&(!f.node||r[36]===f.node)&&(!f.mode||(r[25]||'').includes(f.mode))).sort((a,b)=>b.w-a.w).slice(0,f.limit||50).map(ekoObj)},
  async get(id){const J=await ekoLoad();const r=J.by.get(id);return r?ekoObj(r,true):null},
  async corridor(){const J=await ekoLoad();return {rules:J.rules,claims:J.claims,counts:J.counts,entities:J.d.filter(r=>r[17]).map(r=>ekoObj(r))}},
  picks:()=>ekoPicks(),
  async pick(id,on=true){const J=await ekoLoad();const r=J.by.get(id);if(!r)return false;if(ekoIsPick(id)!==!!on)ekoToggle(r);return ekoIsPick(id)},
  async screen(ids){const J=await ekoLoad();const R=(ids?[].concat(ids):ekoPicks().map(p=>p.id)).map(i=>J.by.get(i)).filter(r=>r&&ekoLat(r));const out=await screenBatch(R.map(ekoNm),{});const M={};R.forEach((r,i)=>M[r[0]]=out[i]||[]);ekoScrSave(M);return R.map((r,i)=>({id:r[0],name:ekoNm(r),hits:(out[i]||[]).slice(0,3).map(x=>({name:x.name,list:x.list,score:x.score,programs:x.programs||''}))}))}},
"""
rep(" open:v=>open(v),report:()=>report(),",api+" open:v=>open(v),report:()=>report(),")
js+="""
function ekoObj(r,full){const o={id:r[0],layer:r[1],layerFa:(EKO_L[r[1]]||['',''])[1],name:r[2],chineseName:r[3]||null,type:r[4],role:r[5],hq:r[22]||null,province:r[23]||null,status:r[24]||null,modes:[...(r[25]||'')].map(c=>EKO_M[c]),ownership:r[26]||null,founded:r[28]||null,phone:r[32]||null,email:r[33]||null,permit:r[34]||null,verification:r[15]==='V'?'Verified':r[15]==='P'?'Partially Verified':'Uncertain',evidenceStrength:r[7],iranRelevance:r[8],corridor:!!r[17],corridorLastVerified:r[18]||null,mapNode:r[36]||null,crossLayer:r[35],sources:r[12]};
 if(full)Object.assign(o,{iranEvidence:r[9],entityResolution:r[11],originalVerification:r[6],reclassificationBasis:r[16],corridorNote:r[19]>=0&&EKD?EKD.cn[r[19]]:null,notes:r[13],descriptionFa:r[14],scale:r[29]||null,services:r[30]||null,subRoles:r[31]||null,listing:r[27]||null});return o}
"""
anchor="/* ===== v15.2: live connections"
assert h.count(anchor)==1
h=h.replace(anchor,js+"\n"+anchor)
h=h.replace("const IFA={version:'15.0',","const IFA={version:'15.3',") if "const IFA={version:'15.0'," in h else h
open(P,'w',encoding='utf8').write(h)
print('patched',len(h))
