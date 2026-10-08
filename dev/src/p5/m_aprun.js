/* =====================================================================
   v1.13 AUTOPILOT RUN LOG & CHECKPOINTS — گزارش اجراهای کنترل خودکار، نقطهٔ بازیابی هر کاربر، آمار پایداری
   ===================================================================== */
db.exec(`CREATE TABLE IF NOT EXISTS ap_runs(id INTEGER PRIMARY KEY,lane TEXT,name TEXT,route TEXT,mode TEXT,score INTEGER,verdict TEXT,dur INTEGER,ok INTEGER,warn INTEGER,hi INTEGER,md INTEGER,timeouts INTEGER,land REAL,rec TEXT,data TEXT,ts INTEGER,by TEXT);
CREATE INDEX IF NOT EXISTS ix_apr_lane ON ap_runs(lane,ts);
CREATE TABLE IF NOT EXISTS ap_ckpt(user TEXT PRIMARY KEY,data TEXT,ts INTEGER);`);
const apS=(v,n)=>String(v==null?'':v).slice(0,n);
const apLaneN=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9_>]/g,'').slice(0,40);
function apRunRow(r,full){const o={id:r.id,lane:r.lane,name:r.name,route:r.route,mode:r.mode,score:r.score,verdict:r.verdict,dur:r.dur,ok:r.ok,warn:r.warn,hi:r.hi,md:r.md,timeouts:r.timeouts,landUSD:r.land,ts:r.ts,by:r.by};try{o.decision=JSON.parse(r.rec||'null')}catch(e){o.decision=null}if(full){try{Object.assign(o,JSON.parse(r.data||'{}'))}catch(e){}}return o}
route('POST','/api/ap/runs',async(req,u)=>{const b=await body(req);const lane=apLaneN(b.lane);if(!lane)throw E(400,'مسیر اجرا نامشخص است');
 const st=b.st&&typeof b.st==='object'?b.st:{};const S=Object.values(st);const cnt=k=>S.filter(x=>x&&x.st===k).length;
 const vals=(Array.isArray(b.vals)?b.vals:[]).slice(0,120).map(v=>({k:apS(v.k,12),label:apS(v.label,80),value:apS(v.value,200),p:v.p&&typeof v.p==='object'?{src:apS(v.p.src,160),f:apS(v.p.f,200),conf:isFinite(+v.p.conf)&&v.p.conf!==null?Math.max(0,Math.min(1,+v.p.conf)):null,at:v.p.at||null,band:Array.isArray(v.p.band)?v.p.band.slice(0,2).map(Number):null}:null}));
 const finds=(Array.isArray(b.finds)?b.finds:[]).slice(0,80).map(f=>({k:apS(f.k,12),id:apS(f.id,16),sev:['hi','md','lo','ok'].includes(f.sev)?f.sev:'lo',t:apS(f.t,200),d:apS(f.d,400)}));
 const d=b.dec&&typeof b.dec==='object'?b.dec:{};const dec={verdict:apS(d.verdict,120),rec:d.rec?{name:apS(d.rec.name,120),cost:+d.rec.cost||0,days:+d.rec.days||0,risk:+d.rec.risk||0}:null,alts:(Array.isArray(d.alts)?d.alts:[]).slice(0,3).map(a=>({name:apS(a.name,120),cost:+a.cost||0,days:+a.days||0,risk:+a.risk||0})),risks:(Array.isArray(d.risks)?d.risks:[]).slice(0,3).map(x=>apS(x,200)),conf:isFinite(+d.conf)&&d.conf!==null?+d.conf:null,band:Array.isArray(d.band)?d.band.slice(0,3).map(Number):null};
 const stages=Object.fromEntries(Object.entries(st).slice(0,40).map(([k,x])=>[apS(k,12),{st:apS(x&&x.st,6),ms:x&&isFinite(+x.ms)?+x.ms:null,note:apS(x&&x.note,60)}]));
 const data=JSON.stringify({stages,vals,finds,healed:(Array.isArray(b.healed)?b.healed:[]).slice(0,40).map(x=>apS(x,12))});if(data.length>400e3)throw E(413,'گزارش اجرا بیش از حد بزرگ است');
 const score=Math.max(0,Math.min(100,Math.round(+b.score||0))),ts=Date.now();
 const r=run('INSERT INTO ap_runs(lane,name,route,mode,score,verdict,dur,ok,warn,hi,md,timeouts,land,rec,data,ts,by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',lane,apS(b.name,120),apS(b.route,120),b.mode==='instant'?'instant':'ui',score,apS(b.verdict,120),Math.max(0,Math.round(+b.dur||0)),cnt('ok'),cnt('warn'),finds.filter(f=>f.sev==='hi').length,finds.filter(f=>f.sev==='md').length,Math.max(0,Math.round(+b.timeouts||0)),+b.landUSD>0?+b.landUSD:null,JSON.stringify(dec),data,ts,u.username);
 const id=Number(r.lastInsertRowid);run('DELETE FROM ap_runs WHERE id IN (SELECT id FROM ap_runs ORDER BY id DESC LIMIT -1 OFFSET 2000)');
 audit(u.username,ipOf(req),'autopilot.run','ap_runs',String(id),{lane,score,mode:b.mode});
 try{fire('autopilot.done',{id,lane,name:apS(b.name,120),score,verdict:dec.verdict||apS(b.verdict,120),rec:dec.rec?dec.rec.name:'—',risks:dec.risks.join(' | '),hi:finds.filter(f=>f.sev==='hi').length,by:u.username},'ap|'+id)}catch(e){}
 return {ok:true,id}},'');
route('GET','/api/ap/runs',req=>{const s=new URL(req.url,'http://x').searchParams;const W=[],A=[];if(s.get('lane')){W.push('lane=?');A.push(apLaneN(s.get('lane')))}if(s.get('mode')){W.push('mode=?');A.push(s.get('mode'))}
 const lim=Math.max(1,Math.min(200,+s.get('limit')||30));return {runs:q('SELECT * FROM ap_runs'+(W.length?' WHERE '+W.join(' AND '):'')+' ORDER BY id DESC LIMIT '+lim,...A).map(r=>apRunRow(r,false))}},'');
route('GET','/api/ap/run',req=>{const id=+new URL(req.url,'http://x').searchParams.get('id');const r=q1('SELECT * FROM ap_runs WHERE id=?',id);if(!r)throw E(404,'اجرا یافت نشد');return apRunRow(r,true)},'');
route('GET','/api/ap/stats',req=>{const days=Math.max(1,Math.min(365,+new URL(req.url,'http://x').searchParams.get('days')||30));const R=q('SELECT lane,name,mode,score,dur,warn,timeouts,land,ts,data FROM ap_runs WHERE ts>? ORDER BY id',Date.now()-days*864e5);
 const avg=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length*10)/10:null;const stg={};
 for(const r of R){let d={};try{d=JSON.parse(r.data||'{}')}catch(e){}for(const [k,x] of Object.entries(d.stages||{})){const o=stg[k]=stg[k]||{n:0,warn:0,skip:0,ms:[]};o.n++;if(x.st==='warn')o.warn++;if(x.st==='skip')o.skip++;if(x.ms!=null)o.ms.push(x.ms)}}
 const lanes={};for(const r of R){const l=lanes[r.lane]=lanes[r.lane]||{lane:r.lane,name:r.name,n:0,last:null,land:[]};l.n++;l.last=r.ts;if(r.land)l.land.push(r.land)}
 return {days,runs:R.length,instant:R.filter(r=>r.mode==='instant').length,avgScore:avg(R.map(r=>r.score)),avgDur:avg(R.map(r=>r.dur)),timeouts:R.reduce((a,r)=>a+(r.timeouts||0),0),
  stages:Object.fromEntries(Object.entries(stg).map(([k,o])=>[k,{n:o.n,warnPct:Math.round(o.warn/o.n*100),skipPct:Math.round(o.skip/o.n*100),avgMs:avg(o.ms)}])),
  lanes:Object.values(lanes).map(l=>({lane:l.lane,name:l.name,n:l.n,last:l.last,landMin:l.land.length?Math.min(...l.land):null,landMax:l.land.length?Math.max(...l.land):null})).sort((a,b)=>b.last-a.last).slice(0,30)}},'');
route('GET','/api/ap/ckpt',(req,u)=>{const r=q1('SELECT data,ts FROM ap_ckpt WHERE user=?',u.username);if(!r||Date.now()-r.ts>24*3600e3)return {ck:null};try{return {ck:JSON.parse(r.data),ts:r.ts}}catch(e){return {ck:null}}},'');
route('PUT','/api/ap/ckpt',async(req,u)=>{const b=await body(req);if(!b||typeof b!=='object'||!b.lane||!b.st)throw E(400,'نقطهٔ بازیابی نامعتبر است');const s=JSON.stringify(b);if(s.length>600e3)throw E(413,'نقطهٔ بازیابی بیش از حد بزرگ است');
 run('INSERT INTO ap_ckpt(user,data,ts) VALUES(?,?,?) ON CONFLICT(user) DO UPDATE SET data=excluded.data,ts=excluded.ts',u.username,s,Date.now());return {ok:true}},'');
route('DELETE','/api/ap/ckpt',(req,u)=>{run('DELETE FROM ap_ckpt WHERE user=?',u.username);return {ok:true}},'');
