set -e
cd /data/atlas
cp index.v153.html ifa/public/index.html
python3 src/patch_mkt.py
python3 src/patch_lq.py
python3 src/patch_p3.py
python3 src/patch_dom.py
python3 src/patch_agent.py
python3 src/patch_brand.py
python3 src/patch_open.py
python3 src/asst/mk_css.py
python3 src/patch_assist.py
python3 - <<'P'
import re,base64
p='/data/atlas/ifa/public/index.html';h=open(p,encoding='utf8').read()
b=base64.b64encode(open('/data/atlas/ifa/server.js','rb').read()).decode()
h=re.sub(r"const SRVJS='([A-Za-z0-9+/=]+)'",lambda m:"const SRVJS='"+b+"'",h);open(p,'w',encoding='utf8').write(h)
S=re.findall(r'<script[^>]*>([\s\S]*?)</script>',h);open('/tmp/main.js','w').write([x for x in S if 'rLq' in x][0])
P
node --check /tmp/main.js && echo BUILD_OK
