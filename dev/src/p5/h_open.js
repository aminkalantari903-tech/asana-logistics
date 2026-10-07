/* ---------- v1.8.2 open access: no username/password for the team server (IFA_AUTH=open, default) ---------- */
const AUTHM=(()=>{const m=String(process.env.IFA_AUTH||'open').toLowerCase();const scope=String(process.env.IFA_OPEN_SCOPE||'lan').toLowerCase();const role=ROLES[process.env.IFA_OPEN_ROLE]?process.env.IFA_OPEN_ROLE:'admin';return {mode:m==='password'?'password':'open',scope:scope==='all'?'all':'lan',role}})();
const isPrivIp=a=>{a=String(a||'').trim().replace(/^::ffff:/i,'');return a==='::1'||a==='localhost'||/^127\./.test(a)||/^10\./.test(a)||/^192\.168\./.test(a)||/^172\.(1[6-9]|2\d|3[01])\./.test(a)||/^169\.254\./.test(a)||/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(a)||/^f[cd][0-9a-f]{2}:/i.test(a)||/^fe80:/i.test(a)};
const openOk=req=>{if(AUTHM.mode!=='open')return false;if(AUTHM.scope==='all')return true;const xf=String(req.headers['x-forwarded-for']||'').split(',').map(s=>s.trim()).filter(Boolean);return isPrivIp(req.socket.remoteAddress)&&xf.every(isPrivIp)};
const OPENRL=new Map();
route('GET','/api/auth/mode',req=>({mode:AUTHM.mode,scope:AUTHM.scope,allowed:openOk(req),role:AUTHM.role,roleName:ROLES[AUTHM.role]}));
route('POST','/api/auth/open',async(req)=>{if(AUTHM.mode!=='open')throw E(403,'ورود بدون رمز روی این سرور غیرفعال است (IFA_AUTH=password)');if(!openOk(req))throw E(403,'ورود بدون رمز فقط از شبکهٔ داخلی مجاز است (IFA_OPEN_SCOPE=lan)');
 const b=await body(req);const dev=String(b.device||'');if(!/^[A-Za-z0-9_-]{16,64}$/.test(dev))throw E(400,'شناسهٔ دستگاه نامعتبر');const un='dev-'+sha('ifa-dev|'+dev).slice(0,12);const ip=ipOf(req);
 let u=q1('SELECT * FROM users WHERE username=?',un);
 if(!u){const k=ip,o=OPENRL.get(k)||{n:0,t:Date.now()};if(Date.now()-o.t>3600e3){o.n=0;o.t=Date.now()}if(o.n>=30)throw E(429,'دستگاه جدید بیش از حد؛ یک ساعت بعد دوباره امتحان کنید');o.n++;OPENRL.set(k,o);
  const n=q1("SELECT COUNT(*) n FROM users WHERE username LIKE 'dev-%'").n+1;const lb=String(b.label||'').replace(/[<>"'`]/g,'').trim().slice(0,40);
  run('INSERT INTO users(username,name,role,created) VALUES(?,?,?,?)',un,('دستگاه '+n+(lb?' · '+lb:'')).slice(0,60),AUTHM.role,Date.now());u=q1('SELECT * FROM users WHERE username=?',un);audit(un,ip,'device.join','user',un,{label:lb,role:AUTHM.role})}
 if(!u.active)throw E(403,'دسترسی این دستگاه توسط مدیر غیرفعال شده است');
 run('UPDATE users SET last_login=? WHERE id=?',Date.now(),u.id);audit(u.username,ip,'login.open','user',u.username,null);
 return {token:mkToken(u),user:pub(u),roles:ROLES,perms:Object.keys(PERM).filter(p=>can(u,p)),exp:Date.now()+CFG.tokenHours*3600e3,open:true}});
route('PATCH','/api/me/name',async(req,u)=>{const b=await body(req);const nm=String(b.name||'').replace(/[<>"'`]/g,'').trim().slice(0,60);if(nm.length<2)throw E(400,'نام حداقل ۲ کاراکتر');run('UPDATE users SET name=? WHERE id=?',nm,u.id);audit(u.username,ipOf(req),'user.rename','user',u.username,{name:nm});return {ok:true,user:pub(q1('SELECT * FROM users WHERE id=?',u.id))}},'');
