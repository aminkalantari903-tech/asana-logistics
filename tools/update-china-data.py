#!/usr/bin/env python3
"""Refresh the embedded China logistics ecosystem dataset from a new workbook version.
Usage: python3 tools/update-china-data.py China_Logistics_Ecosystem_....xlsx [public/index.html]
Requires: pip install openpyxl. Same sheet layout as China_Logistics_Ecosystem_Consolidated_FA_2026-09.xlsx."""
import json,re,gzip,base64,collections,sys,os,openpyxl
XLSX=sys.argv[1];HTML=sys.argv[2] if len(sys.argv)>2 else os.path.join(os.path.dirname(__file__),'..','public','index.html')
wb=openpyxl.load_workbook(XLSX,read_only=True)
MS=[n for n in wb.sheetnames if 'شاخص اصلی' in n or 'Master' in n][0]
def rows(ws):
  o=[]
  for r in ws.iter_rows(values_only=True):
    r=list(r)
    while r and (r[-1] is None or str(r[-1]).strip()==''): r.pop()
    o.append(['' if x is None else (str(int(x)) if isinstance(x,float) and x.is_integer() else str(x)) for x in r])
  return o
MR=rows(wb[MS]);hi=next(i for i,r in enumerate(MR) if 'Entity_ID' in r)
d=[MR[hi]]+[r+['']*(len(MR[hi])-len(r)) for r in MR[hi+1:] if any(r)]
meta={n:rows(wb[n]) for n in wb.sheetnames if n!=MS and 'ارجاعات' not in n}
H5=open(HTML,encoding='utf8').read();i=H5.find('"cncos":[')+8;CNCOS=json.JSONDecoder().raw_decode(H5[i:])[0]
H=d[0];R=d[1:]
ix={h:i for i,h in enumerate(H)}
g=lambda r,k:(r[ix[k]] or '').strip() if isinstance(r[ix[k]],str) else ('' if r[ix[k]] is None else str(r[ix[k]]))
LABELS=['مالکیت/شرکت مادر','نوع مالکیت','وضعیت بورسی','روابط مالکیتی/سازمانی ثبت‌شده','مقیاس تقریبی','حوزهٔ خدمات','شیوه‌های حمل','نقش‌های فرعی','مقر','سال تأسیس','وضعیت کنونی']
STOP=['ارتباط با کریدور','ارتباط مستقیم با کریدور','استحکام شواهد منبع','اطلاعات مالکیت','توجه:']
lab_re=re.compile('('+'|'.join(re.escape(x) for x in LABELS)+r'):\s')
stop_re=re.compile('|'.join(re.escape(x) for x in STOP))
def parse(desc):
  out={};ms=list(lab_re.finditer(desc))
  for i,m in enumerate(ms):
    end=ms[i+1].start() if i+1<len(ms) else len(desc)
    v=desc[m.end():end]
    s=stop_re.search(v)
    if s:v=v[:s.start()]
    v=v.strip().rstrip('؛').strip().rstrip('.').strip()
    v=re.sub(r'(?:\s*(?:—\s*)?\[?(?:از|بر)?\s*$)','',v)
    if m[1] not in out and v:out[m[1]]=v
  return out
def evT(s):
  t=s.lower()
  if re.match(r'(strong|verified|high|medium-high|very strong)',t):return 'S'
  if re.match(r'(weak|low|unverified|single)',t):return 'W'
  if re.match(r'(moderate|medium|partial|partly)',t):return 'M'
  return 'U'
def irT(s):
  t=s.lower().strip()
  if not t or t=='unknown':return 'U'
  if re.match(r'(none|generic|no )',t):return 'N'
  if re.match(r'(confirmed|strong)',t):return 'H'
  if re.match(r'(moderate|medium|likely|reported)',t):return 'M'
  if re.match(r'(weak|low)',t):return 'W'
  return 'I'
PROV=[('Beijing','پکن',['北京','beijing']),('Shanghai','شانگهای',['上海','shanghai']),('Tianjin','تیانجین',['天津','tianjin']),('Chongqing','چونگ‌کینگ',['重庆','chongqing']),
('Guangdong','گوانگدونگ',['广东','guangdong','shenzhen','深圳','guangzhou','广州','dongguan','东莞','foshan','佛山','zhuhai','珠海','shantou','汕头','zhongshan','中山','huizhou','惠州','jiangmen','zhanjiang','湛江','江门','潮州','茂名','肇庆','揭阳','清远','韶关','yantian','nansha','shekou']),
('Zhejiang','ژجیانگ',['浙江','zhejiang','ningbo','宁波','hangzhou','杭州','yiwu','义乌','wenzhou','温州','jinhua','金华','zhoushan','舟山','jiaxing','嘉兴','shaoxing','绍兴','taizhou, zhejiang']),
('Jiangsu','جیانگسو',['江苏','jiangsu','nanjing','南京','suzhou','苏州','wuxi','无锡','lianyungang','连云港','nantong','南通','changzhou','常州','xuzhou','徐州','zhangjiagang','张家港','taicang','太仓','yangzhou','扬州','zhenjiang','江阴','镇江','盐城','泰州','淮安']),
('Shandong','شاندونگ',['山东','shandong','qingdao','青岛','jinan','济南','yantai','烟台','weihai','威海','rizhao','日照','linyi','临沂','weifang','潍坊','zibo','荣成','东营','淄博','德州','聊城']),
('Fujian','فوجیان',['福建','fujian','xiamen','厦门','fuzhou','福州','quanzhou','泉州','putian','莆田','zhangzhou','漳州']),
('Liaoning','لیائونینگ',['辽宁','liaoning','dalian','大连','shenyang','沈阳','yingkou','营口','dandong','丹东','jinzhou']),
('Hebei','هبی',['河北','hebei','shijiazhuang','石家庄','tangshan','唐山','qinhuangdao','秦皇岛','cangzhou','沧州','huanghua']),
('Henan','هنان',['河南','henan','zhengzhou','郑州','luoyang']),('Hubei','هوبی',['湖北','hubei','wuhan','武汉','yichang','ezhou','鄂州','宜昌','襄阳']),('Hunan','هونان',['湖南','hunan','changsha','长沙','yueyang']),
('Sichuan','سیچوان',['四川','sichuan','chengdu','成都','德阳','泸州','宜宾']),('Shaanxi','شانشی',['陕西','shaanxi',"xi'an",'xian','西安']),('Shanxi','شانسی',['山西','shanxi','taiyuan','太原']),
('Anhui','آن‌هوی',['安徽','anhui','hefei','合肥','wuhu','芜湖','马鞍山','安庆']),('Jiangxi','جیانگشی',['江西','jiangxi','nanchang','南昌','jiujiang']),('Guangxi','گوانگشی',['广西','guangxi','nanning','南宁','qinzhou','钦州','beihai','北海','fangchenggang','防城港','pingxiang']),
('Yunnan','یوننان',['云南','yunnan','kunming','昆明']),('Guizhou','گوئیژو',['贵州','guizhou','guiyang']),('Hainan','هاینان',['海南','hainan','haikou','海口','yangpu','sanya']),
('Jilin','جیلین',['吉林','jilin','changchun','长春','hunchun']),('Heilongjiang','هیلونگ‌جیانگ',['黑龙江','heilongjiang','harbin','哈尔滨','suifenhe','绥芬河','heihe']),
('Inner Mongolia','مغولستان داخلی',['内蒙古','inner mongolia','hohhot','erenhot','二连浩特','manzhouli','满洲里','baotou']),
('Xinjiang','سین‌کیانگ',['新疆','xinjiang','urumqi','乌鲁木齐','khorgos','horgos','霍尔果斯','alashankou','阿拉山口','kashgar','kashi','喀什','yining','伊宁','tacheng','changji','昌吉','korla','bole']),
('Gansu','گانسو',['甘肃','gansu','lanzhou','兰州','wuwei']),('Ningxia','نینگشیا',['宁夏','ningxia','yinchuan']),('Qinghai','چینگهای',['青海','qinghai','xining']),('Tibet','تبت',['西藏','tibet','lhasa']),
('Hong Kong','هنگ‌کنگ',['香港','hong kong','hongkong','hksar']),('Macau','ماکائو',['澳门','macau','macao']),('Taiwan','تایوان',['台湾','taiwan','taipei'])]
FOREIGN=re.compile(r'tehran|iran|تهران|singapore|dubai|kazakh|almaty|geneva|brussels|london|paris|washington|new york|moscow|tashkent|bishkek|islamabad|karachi|baku|ankara|istanbul|rotterdam|hamburg|switzerland|usa|u\.s\.|united states|germany|japan|korea|india|bandar|hormozgan|chabahar|bushehr|jolfa|anzali|seoul|astana|tashkent|ashgabat|bermuda|mumbai|texas|ontario|illinois|uae|emirates|foreign|outside china|美国|日本|韩国|新加坡|德国|英国|法国|荷兰|丹麦|瑞士|印度|阿联酋|伊朗|俄罗斯|哈萨克|加拿大|澳大利亚|意大利|马来西亚|泰国|越南|印度尼西亚|菲律宾|土耳其|巴基斯坦|比利时|瑞典|挪威|以色列|沙特|巴西|墨西哥|智利|西班牙|新西兰|卢森堡|开曼|英属|塞浦路斯|希腊|爱尔兰|芬兰|波兰|奥地利|孟加拉|斯里兰卡|缅甸|柬埔寨|埃及|南非|毛里求斯|百慕大|马绍尔|巴拿马|利比里亚',re.I)
def prov(*ts):
  for t in ts:
    tl=t.lower()
    if not tl:continue
    best=None
    for code,fa,keys in PROV:
      for k in keys:
        p=tl.find(k)
        if p>=0 and (best is None or p<best[0]):best=(p,code)
    if best:return best[1]
    if re.search(r'tehran|iran|تهران|bandar|hormozgan|chabahar|bushehr|jolfa|anzali|伊朗|mashhad|tabriz|sarakhs|isfahan',t,re.I):return 'IR'
    if FOREIGN.search(t):return 'X'
  return ''
NODES=[('CN_KHG',['khorgos','horgos','霍尔果斯','altynkol']),('CN_KSG',['kashgar','kashi','喀什']),('CN_URC',['urumqi','乌鲁木齐']),('CN_XIY',["xi'an",'xian','西安']),('CN_LHW',['lanzhou','兰州']),('CN_YIW',['yiwu','义乌']),
('CN_NGB',['ningbo','宁波','zhoushan','舟山']),('CN_TAO',['qingdao','青岛']),('CN_TSN',['tianjin','天津']),('CN_SZX',['shenzhen','深圳','yantian']),('CN_CAN',['guangzhou','广州','nansha']),('CN_SHA',['shanghai','上海','yangshan'])]
def node(hq,L):
  t=hq.lower()
  for nid,keys in NODES:
    if any(k in t for k in keys):
      if L=='AC' and nid=='CN_SHA':return 'CN_PVG'
      if L=='AC' and nid=='CN_CAN':return 'CN_CGO'
      return nid
  return ''
def modes(txt,L):
  t=txt.lower();m=''
  if re.search(r'دریا|sea|ocean|nvocc|کشتی',t) or L in('OC','PT'):m+='s'
  if re.search(r'هوا|air',t) or L=='AC':m+='a'
  if re.search(r'ریل|rail',t) or L=='RR':m+='r'
  if re.search(r'جاده|road|truck|کامیون',t) or L=='RT':m+='d'
  if re.search(r'چندوجهی|multimodal|intermodal',t):m+='m'
  return m
cjk=re.compile(r'[\u4e00-\u9fff]')
corrN=[];cnIdx={}
out=[];urls_total=0
for r in R:
  desc=g(r,'Persian_Description');P=parse(desc);L=g(r,'Layer_Code');notes=g(r,'Notes')
  name=g(r,'Canonical_Name');cn=g(r,'Chinese_Name')
  if not cjk.search(cn):cn_disp=''
  else:cn_disp=cn
  srcs=re.findall(r'https?://[^\s;|,，；<>"]+',g(r,'Source_URLs'));srcs=[u.rstrip('.)]') for u in srcs];srcs=list(dict.fromkeys(srcs));urls_total+=len(srcs)
  cnote=g(r,'Corridor_Refresh_Note')
  ci=-1
  if cnote:
    if cnote not in cnIdx:cnIdx[cnote]=len(corrN);corrN.append(cnote)
    ci=cnIdx[cnote]
  hq=P.get('مقر','')
  mails=re.findall(r'[\w.+-]+@[\w-]+(?:\.[\w-]+)+',notes)
  tels=re.findall(r'(?:tel|phone|电话|contact tel)[:\s]*([+\d][\d\s()-]{6,}\d)',notes,re.I)
  permit=re.search(r'(CHN/\d{3}/\d{3,6})',notes)
  xr=g(r,'Cross_Layer_Ref');refs=[x for x in dict.fromkeys(re.findall(r'\b(FF|OC|RR|RT|AC|PT|WH|CB|IN|PL|EX|RG)-(\d{4})\b',xr+' '+notes))]
  refs=[a+'-'+b for a,b in refs if a+'-'+b!=g(r,'Entity_ID')]
  mt=P.get('شیوه‌های حمل','')+' '+P.get('حوزهٔ خدمات','')+' '+g(r,'Primary_Role')+' '+g(r,'Entity_Type')
  vr=g(r,'Verification_Status_Reclassified');V={'Verified':'V','Partially Verified':'P','Uncertain':'U'}.get(vr,'U')
  out.append([g(r,'Entity_ID'),L,name,cn_disp,g(r,'Entity_Type'),g(r,'Primary_Role'),g(r,'Verification_Status'),g(r,'Evidence_Strength'),g(r,'Iran_Relevance'),g(r,'Iran_Evidence'),xr,g(r,'Entity_Resolution_Status'),srcs,notes,desc,V,g(r,'Reclassification_Basis'),1 if g(r,'Corridor_Flag')=='Corridor' else 0,g(r,'Corridor_Last_Verified').replace('—',''),ci,
   evT(g(r,'Evidence_Strength')),irT(g(r,'Iran_Relevance')),hq,prov(hq,cn,name),P.get('وضعیت کنونی',''),modes(mt,L),P.get('مالکیت/شرکت مادر','') or P.get('نوع مالکیت',''),P.get('وضعیت بورسی',''),P.get('سال تأسیس',''),P.get('مقیاس تقریبی',''),P.get('حوزهٔ خدمات',''),P.get('نقش‌های فرعی',''),
   tels[0].strip() if tels else '',mails[0] if mails else '',permit[1] if permit else '',refs,node(hq+' '+name+' '+cn,L)])
# reverse refs
byid={o[0]:o for o in out}
for o in out:
  for t in o[35]:
    if t in byid and o[0] not in byid[t][35]:byid[t][35].append(o[0])
B5=meta.get('تازه‌سازی کریدور (B5)',[])
claims=[];counts=[];rules=[]
for r in B5:
  if len(r)>=7 and re.match(r'^[A-Z]+-[A-Z]+-\d+$',r[1]):
    src=[]
    for ln in r[6].split('\n'):
      ln=ln.strip().lstrip('-').strip()
      if not ln:continue
      parts=[x.strip() for x in ln.split(' | ')]
      u=next((x for x in parts if x.startswith('http')),'')
      src.append({'t':parts[0],'u':u,'d':' · '.join(x for x in parts[1:] if x!=u)})
    claims.append({'id':r[1],'topic':r[2],'fa':r[3],'conf':r[4],'label':r[5],'src':src})
  elif len(r)>=5 and re.match(r'^\d',r[1] or '') and not claims==[] :
    counts.append(r[1:6])
  elif len(r)==3 and r[1] and r[2] and not claims:
    rules.append([r[1],r[2]])
PVN={c:f for c,f,_ in PROV};PVN['IR']='ایران';PVN['X']='خارج از سرزمین اصلی چین'
cc=CNCOS
nn=lambda s:re.sub(r'[^a-z0-9\u4e00-\u9fff]','',s.lower().replace('co., ltd','').replace('limited','').replace('ltd',''))
link={}
for i,c in enumerate(cc):
  a=nn(c['cn']);b=nn(re.sub(r'\(.*?\)','',c['en']))
  h=[o[0] for o in out if a and len(a)>=4 and nn(o[3])==a]
  if not h:h=[o[0] for o in out if b and len(b)>=6 and (nn(o[2])==b or nn(o[2]).startswith(b))]
  if h:link[i]=h[:5]
GEN=max((r[ix['Corridor_Last_Verified']] or '' for r in R if re.match(r'\d{4}-\d\d-\d\d',str(r[ix['Corridor_Last_Verified']] or ''))),default='')
J={'v':GEN[:7],'gen':GEN,'file':os.path.basename(XLSX),'cols':H,'cn':corrN,'d':out,'meta':meta,'claims':claims,'counts':counts,'rules':rules,'pv':PVN}
print('claims',len(claims),'counts',len(counts),'rules',len(rules),'links',len(link))
#,'gen':'2026-09-22','file':os.path.basename(XLSX),'cols':H,'cn':corrN,'d':out,'meta':meta}
raw=json.dumps(J,ensure_ascii=False,separators=(',',':')).encode()
b64=base64.b64encode(gzip.compress(raw,9)).decode()
h=open(HTML,encoding='utf8').read()
h=re.sub(r"const EKO_B64='[^']*';",lambda m:"const EKO_B64='"+b64+"';",h,count=1)
h=re.sub(r"const EKO_LINK=\{[^\n]*\};",lambda m:"const EKO_LINK="+json.dumps(link)+";",h,count=1)
open(HTML,'w',encoding='utf8').write(h)
print('updated',HTML,'entities',len(out),'layers',dict(collections.Counter(o[1] for o in out)),'corridor',sum(o[17] for o in out),'gzip KB',len(b64)*3//4//1024)
