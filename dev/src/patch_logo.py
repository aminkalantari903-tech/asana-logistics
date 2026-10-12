# v15.23: replace brand mark with the uploaded "ASANA Logistics" wordmark (vectorized; light & dark variants)
import base64,re
P='/data/atlas/ifa/public/index.html'
h=open(P,encoding='utf8').read()
B='/data/atlas/brand/'
d64=lambda f:'data:image/svg+xml;base64,'+base64.b64encode(open(B+f,'rb').read()).decode()
WL=d64('wordmark.svg');WD=d64('wordmark-dark.svg');OLD='data:image/svg+xml;base64,'+open(B+'mark.b64').read().strip()
FA='\\u0633\\u0627\\u0645\\u0627\\u0646\\u0647 \\u0644\\u062C\\u0633\\u062A\\u06CC\\u06A9 \\u0622\\u0633\\u0627\\u0646\\u0627'
def rep(a,b,n=1):
    global h
    assert h.count(a)==n,(a[:90],h.count(a)); h=h.replace(a,b)
# 1) BrandMark component → theme-aware wordmark
i=h.find('function iD(){');j=h.find('a(iD,"BrandMark")',i);assert i>0 and j>i
h=h[:i]+'function iD(){return(0,xe.jsxs)("span",{className:"brand-logo",role:"img","aria-label":"ASANA Logistics",children:[(0,xe.jsx)("img",{className:"bl-dark",src:"%s",alt:"",draggable:!1}),(0,xe.jsx)("img",{className:"bl-light",src:"%s",alt:"",draggable:!1})]})}'%(WD,WL)+h[j:]
# header: Persian name only (English is in the wordmark)
rep('(0,q.jsx)("h1",{children:"%s"}),(0,q.jsx)("small",{children:"Asana Logistics"})'%FA,'(0,q.jsx)("h1",{children:"%s"})'%FA)
# 2) intro splash
k=h.find('(0,q.jsx)(Gt.img,{className:"intro-logo",src:"');assert k>0
e=h.find('"',k+len('(0,q.jsx)(Gt.img,{className:"intro-logo",src:"'));assert h[k:e].endswith(OLD[:30]) or OLD in h[k:e+1]
h=h[:k]+'(0,q.jsxs)(Gt.div,{className:"intro-logo","aria-label":"ASANA Logistics",role:"img",children:[(0,q.jsx)("img",{className:"bl-dark",src:"%s",alt:""}),(0,q.jsx)("img",{className:"bl-light",src:"%s",alt:""})],'%(WD,WL)+h[e+len('",alt:"",'):]
rep('(0,q.jsx)(Gt.p,{initial:{opacity:0},animate:{opacity:1},transition:{delay:.6},children:"Asana Logistics"})','(0,q.jsx)(Gt.p,{className:"intro-tag",initial:{opacity:0},animate:{opacity:1},transition:{delay:.6},children:"\\u067E\\u0644\\u062A\\u0641\\u0631\\u0645 \\u06CC\\u06A9\\u067E\\u0627\\u0631\\u0686\\u0647\\u0654 \\u062D\\u0645\\u0644 \\u0648 \\u0644\\u062C\\u0633\\u062A\\u06CC\\u06A9"})')
# 3) print sheet + report header (white paper → original colours)
rep('"ps-brand",children:[(0,q.jsx)("img",{src:"%s",alt:""})'%OLD,'"ps-brand",children:[(0,q.jsx)("img",{src:"%s",alt:"ASANA Logistics"})'%WL)
rep('<small class="mut"><img src="%s" alt="" style="width:18px;height:18px;vertical-align:-4px;margin-left:6px">'%OLD,'<small class="mut"><img src="%s" alt="ASANA Logistics" style="height:26px;width:auto;vertical-align:-8px;margin-left:8px">'%WL)
assert OLD not in h,'old mark still referenced'
css=""".brand-logo{display:inline-flex;align-items:center;flex:none;height:38px;padding-inline-end:11px;margin-inline-end:2px;border-inline-end:1px solid var(--line,rgba(255,255,255,.1))}
.brand-logo img{height:38px;width:auto;display:block;user-select:none;-webkit-user-drag:none}
.bl-light{display:none!important}
html[data-theme=light] .bl-light{display:block!important}html[data-theme=light] .bl-dark{display:none!important}
.brand h1{font-size:13px;font-weight:700;opacity:.92}
.intro-logo{display:block!important;width:auto!important;height:auto!important;border-radius:0!important;box-shadow:none!important;margin:0 auto 22px!important}
.intro-logo img{width:min(300px,64vw);height:auto;margin:0 auto;filter:drop-shadow(0 12px 40px rgba(40,110,200,.35))}
.intro-tag{letter-spacing:.02em!important;text-transform:none!important;font-family:Vazirmatn,sans-serif!important}
.ps-brand img{width:auto!important;height:40px!important}
@media (max-width:720px){.brand-logo{height:34px;border:0;padding:0}.brand-logo img{height:34px}.brand h1{display:none}}"""
h=h.replace('</head>','<style id="asana-logo">%s</style>\n</head>'%css,1)
open(P,'w',encoding='utf8').write(h);print('logo ok')
