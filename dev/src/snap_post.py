import json,re,difflib,gzip,base64
h=json.load(open('src/eko_snap.json'));J=json.load(open('src/cne.json'));by={o[0]:o for o in J['d']}
s=open('/data/atlas/index.v152.html',encoding='utf8').read();i=s.find("SANC_B64='")+10;j=s.find("'",i)
SD=json.loads(gzip.decompress(base64.b64decode(s[i:j])))['m']['date']
SUF=r'\b(co|company|ltd|limited|inc|incorporated|corp|corporation|llc|ooo|osoo|pte|jsc|ssk|group|the|and|of|plc|gmbh|sa|ag|llp|liability|fzco|fze)\b'
def nz(s):
  s=s.lower();s=re.sub(r'[^a-z0-9 ]',' ',s);s=re.sub(SUF,' ',s);return ' '.join(s.split())
def variants(n):
  v=[n]+re.findall(r'\(([^)]*)\)',n)+[re.sub(r'\(.*?\)','',n)]+[x.strip() for x in re.split(r'a\.k\.a\.|/',n)]
  return [x for x in {nz(x) for x in v} if x]
def q(a,b):
  r=difflib.SequenceMatcher(None,a,b).ratio();r2=difflib.SequenceMatcher(None,' '.join(sorted(a.split())),' '.join(sorted(b.split()))).ratio()
  A,B=set(a.split()),set(b.split());sm=A if len(A)<=len(B) else B;big=B if sm is A else A
  cont=bool(sm) and sm<=big and (len(sm)>=2 or max(len(t) for t in sm)>=6)
  return max(r,r2),cont
out={}
for k,v in h.items():
  n=by[k][2];best=None
  for hit in v:
    for a in variants(n):
      r,c=q(a,nz(hit['name']))
      if best is None or r>best[0]:best=(r,c,hit)
  r,c,hit=best
  GEN={'international','logistics','logistic','shipping','services','service','global','trading','transport','freight','express','line','lines','china','chinese','supply','chain','air','sea','ocean','cargo','forwarding','systems','system','holding','holdings','industrial','development'}
  dist=any(t in set(nz(hit['name']).split()) and len(t)>=4 and t not in GEN for a in variants(n) for t in a.split())
  lvl='s' if (r>=0.9 and dist) else ('p' if (r>=0.75 or c) else None)
  if lvl:out[k]={'l':lvl,'q':round(r,2),'name':hit['name'],'list':hit['list'],'score':hit['score'],'programs':hit.get('programs','')}
  if lvl=='s' and r<0.9: pass
  print(k,lvl,round(r,2),c,n[:35],'=>',hit['name'][:40])
json.dump({'date':SD,'h':out},open('src/eko_snap2.json','w'),ensure_ascii=False)
print(len(out),SD)
