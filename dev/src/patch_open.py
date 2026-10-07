# v15.9.3: team server without username/password (open device access)
p='/data/atlas/ifa/public/index.html';s=open(p,encoding='utf8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:80]);s=s.replace(a,b)
# 1) svApi -> svApi0 + silent re-auth wrapper; no "login again" toast in open mode
rep("async function svApi(p,{method='GET',body,url}={}){","async function svApi0(p,{method='GET',body,url}={}){")
rep("svSave();toast('نشست سرور منقضی شد؛ دوباره وارد شوید')}","svSave();if(!SV.st.open)toast('نشست سرور منقضی شد؛ دوباره وصل شوید')}")
rep("function svLogout(){SV.st.token='';SV.st.user=null;SV.st.perms=[];svSave()}",r"""function svLogout(){SV.st.token='';SV.st.user=null;SV.st.perms=[];SV.st.noauto=true;svSave()}
async function svApi(p,o={}){try{return await svApi0(p,o)}catch(e){if(e.code===401&&SV.st.open&&!SV.st.noauto&&!o.__re&&!/^\/api\/(login|auth\/)/.test(p)){await svOpen(o.url||'',true);return svApi0(p,{...o,__re:1})}throw e}}
const svDev=()=>{if(!/^[A-Za-z0-9_-]{16,64}$/.test(SV.st.dev||'')){const a=new Uint8Array(18);crypto.getRandomValues(a);SV.st.dev=btoa(String.fromCharCode(...a)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');svSave()}return SV.st.dev};
const svDevLabel=()=>{const u=navigator.userAgent;const b=/Edg\//.test(u)?'Edge':/OPR\//.test(u)?'Opera':/Firefox\//.test(u)?'Firefox':/Chrome\//.test(u)?'Chrome':/Safari\//.test(u)?'Safari':'Browser';const o=/Android/.test(u)?'Android':/iPhone|iPad/.test(u)?'iOS':/Windows/.test(u)?'Windows':/Mac OS/.test(u)?'macOS':/Linux/.test(u)?'Linux':'';return b+(o?'/'+o:'')};
const svNorm=url=>{url=String(url||'').trim().replace(/\/+$/,'');if(url&&!/^https?:\/\//.test(url))url='http://'+url;return url};
/* اتصال بدون نام کاربری و رمز: هر مرورگر یک شناسهٔ دستگاه دارد و سرور برایش هویت جداگانه می‌سازد (برای ممیزی و تأیید دونفره) */
async function svOpen(url,quiet){url=svNorm(url);const base=url||svUrl();if(!base)throw new Error('آدرس سرور تنظیم نشده است');
 const h=await svApi0('/api/health',{url:base});SV.health=h;if(h.auth!=='open'){SV.st.open=false;svSave();if(quiet)return null;throw new Error('این سرور ورود بدون رمز را غیرفعال کرده است (IFA_AUTH=password)')}
 const j=await svApi0('/api/auth/open',{method:'POST',body:{device:svDev(),label:svDevLabel()},url:base});
 if(url&&url!==SV.st.url){SV.st.ver={};SV.st.hash={};localStorage.removeItem('ifa-srvb')}if(url)SV.st.url=url;SV.st.token=j.token;SV.st.user=j.user;SV.st.perms=j.perms;SV.st.roles=j.roles;SV.st.open=true;SV.st.noauto=false;svSave();emit('team.login',{user:j.user.username,open:true});return j}
let SVAUTO=null;const svAutoOpen=()=>SVAUTO||(SVAUTO=(async()=>{try{if(svOn()||SV.st.noauto||!svUrl())return false;const j=await svOpen('',true);if(!j)return false;await svSync(true);if(wrap)open();return true}catch(e){return false}finally{SVAUTO=null}})());
setTimeout(svAutoOpen,600);""")
# 2) "go to server" button in off-cards connects directly (no form)
rep("const tmGo=root=>$$('[data-gosrv]',root).forEach(x=>x.onclick=()=>{TM.srv='con';open('srv')});",
    "const tmGo=root=>$$('[data-gosrv]',root).forEach(x=>x.onclick=async()=>{x.disabled=true;x.textContent='در حال اتصال…';try{SV.st.noauto=false;if(await svOpen('',true)){await svSync(true);toast('به سرور تیمی وصل شدید');open();return}}catch(e){}TM.srv='con';open('srv')});")
rep("ابتدا در بخش «سرور و همکاری تیمی» به سرور سازمانی خود وصل شوید. نصب سرور ساده است و فایل آن داخل همین برنامه قرار دارد.</p><button class=\"sx-btn sm pri\" data-gosrv>رفتن به اتصال سرور</button>",
    "اتصال بدون نام کاربری و رمز انجام می‌شود؛ کافی است برنامه از روی سرور تیمی باز شده باشد یا آدرس سرور را وارد کنید. نصب سرور ساده است و فایل آن داخل همین برنامه قرار دارد.</p><button class=\"sx-btn sm pri\" data-gosrv>اتصال به سرور تیمی</button>")
# 3) connect card: URL only, no username/password
a=s.index('<div class="sx-card"><header><b>ورود به سرور تیمی</b>');b=s.index('<div class="sx-card"><header><b>چرا سرور تیمی؟</b>')
s=s[:a]+'''<div class="sx-card"><header><b>اتصال به سرور تیمی</b><small>بدون نام کاربری و رمز — کاربران، همگام‌سازی، بایگانی، اعلان، پرتال و مؤدیان</small></header><div class="fw-g tm-lg">
  <label class="sx-f fw-f"><span>آدرس سرور</span><input class="tm-u" dir="ltr" value="${esc(SV.st.url||svUrl())}" placeholder="http://192.168.1.10:8080"></label></div>
  <p class="sx-muted">این مرورگر با یک شناسهٔ دستگاه (بدون رمز) شناخته می‌شود و پس از اولین اتصال، هر بار خودکار وصل می‌شود.</p>
  <div class="fw-bt"><button class="sx-btn pri tm-in">اتصال</button><button class="sx-btn sm tm-h">بررسی سلامت سرور</button></div><div class="tm-hr"></div></div>
  '''+s[b:]
rep("const go=tmTry(async()=>{await svLogin($('.tm-u',B).value,$('.tm-n',B).value,$('.tm-p',B).value);toast('وارد شدید');await svSync(true);re()});$('.tm-in',B).onclick=go;$('.tm-p',B).onkeydown=e=>{if(e.key==='Enter')go()};return}",
    "const go=tmTry(async()=>{await svOpen($('.tm-u',B).value);toast('به سرور تیمی وصل شدید');await svSync(true);re()});$('.tm-in',B).onclick=go;$('.tm-u',B).onkeydown=e=>{if(e.key==='Enter')go()};return}")
rep("· مؤدیان: ${h.moadian?'فعال':'تنظیم‌نشده'}</div>`});","· مؤدیان: ${h.moadian?'فعال':'تنظیم‌نشده'} · ورود: ${h.auth==='open'?'بدون رمز ('+(h.openScope==='all'?'همهٔ شبکه‌ها':'فقط شبکهٔ داخلی')+')':'با رمز'}</div>`});")
# 4) connected card: device identity + rename instead of password change
rep('<div class="sx-card"><header><b>تغییر رمز عبور</b><small>حداقل ۸ کاراکتر</small></header><div class="fw-g"><label class="sx-f fw-f"><span>رمز فعلی</span><input type="password" class="tm-o" dir="ltr"></label><label class="sx-f fw-f"><span>رمز جدید</span><input type="password" class="tm-n1" dir="ltr"></label><label class="sx-f fw-f"><span>تکرار رمز جدید</span><input type="password" class="tm-n2" dir="ltr"></label></div><div class="fw-bt"><button class="sx-btn sm tm-pw">ثبت رمز جدید</button></div></div></div>`;',
    '<div class="sx-card"><header><b>نام نمایشی این دستگاه</b><small>ورود بدون رمز · در ممیزی، تأییدها و تخصیص کارها نمایش داده می‌شود</small></header><div class="fw-g"><label class="sx-f fw-f"><span>نام</span><input class="tm-nm" value="${esc(u.name||\'\')}" maxlength="60"></label></div><div class="fw-bt"><button class="sx-btn sm tm-rn">ثبت نام</button></div></div></div>`;')
rep('<button class="sx-btn sm tm-out">خروج</button>','<button class="sx-btn sm tm-out">قطع اتصال</button>')
rep("$('.tm-out',B).onclick=()=>{svLogout();toast('از سرور خارج شدید');re()};","$('.tm-out',B).onclick=()=>{svLogout();toast('اتصال قطع شد؛ با دکمهٔ «اتصال» دوباره وصل شوید');re()};")
rep("$('.tm-pw',B).onclick=tmTry(async()=>{const a=$('.tm-n1',B).value;if(a!==$('.tm-n2',B).value)return toast('تکرار رمز یکسان نیست');const j=await svApi('/api/me/password',{method:'POST',body:{old:$('.tm-o',B).value,password:a}});SV.st.token=j.token;svSave();toast('رمز عبور تغییر کرد')})}",
    "$('.tm-rn',B).onclick=tmTry(async()=>{const j=await svApi('/api/me/name',{method:'PATCH',body:{name:$('.tm-nm',B).value}});SV.st.user=j.user;svSave();toast('نام ثبت شد');re()})}")
rep("const IFA={version:'15.9.2',","const IFA={version:'15.9.3',")
open(p,'w',encoding='utf8').write(s);print('OPEN_OK')
