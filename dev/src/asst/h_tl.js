/* ---------- v15.13: live bottom timeline + autopilot «red mode» ---------- */
const apTlPos=(i,N)=>N>1?i/(N-1)*100:50;
const apAgShort=g=>String((APA[g]||APA.orc)[1]).replace(/^عامل\s+/,'').replace(/^هماهنگ‌کنندهٔ خودکار$/,'هماهنگی');
const APSTN={ok:'انجام شد',warn:'با هشدار',skip:'رد شد',stop:'متوقف',fail:'خطا',run:'در حال اجرا'};
function apMode(on){const H=document.documentElement,was=H.classList.contains('ap-mode');if(on===was)return;H.classList.toggle('ap-mode',on);if(!on)H.classList.remove('ap-paused');
 if(apRM())return;const s=document.createElement('div');s.className='ap-sweep'+(on?'':' off');document.body.appendChild(s);setTimeout(()=>s.remove(),1100)}
function apTlBuild(){const t=document.createElement('div');t.className='ap-tl'+(LSG('ifa-ap-tlmin',false)?' min':'');t.setAttribute('role','region');t.setAttribute('aria-label','خط زمانی اجرای خودکار');
 t.innerHTML=`<div class="st"><span class="lv"></span><div class="tx"><small></small><b></b></div></div>
 <div class="trk"><div class="rail"><i class="ln"></i><i class="fill"></i><div class="grps"></div><div class="nds"></div><span class="hd"><span class="ic"></span></span></div></div>
 <div class="rt"><b class="pc"></b><small class="tm"></small></div>
 <div class="ct"><button class="pp" title="توقف/ادامه (Space)"></button><button class="mn" title="جمع/باز کردن">${API_.chev}</button><button class="x" title="بستن">${ASI.x}</button></div><div class="ap-tlt" role="tooltip"></div>`;
 document.body.appendChild(t);
 $('.pp',t).onclick=()=>{if(AP.run)apPause(!AP.pause);else apPre()};
 $('.mn',t).onclick=()=>{t.classList.toggle('min');LSS('ifa-ap-tlmin',t.classList.contains('min'));setTimeout(asPlace,360);asPlace()};
 $('.x',t).onclick=()=>apTlClose();
 t.addEventListener('mouseenter',()=>clearTimeout(APTL.hide));t.addEventListener('mouseleave',()=>{if(AP.done&&!AP.run)apTlAuto()});
 setTimeout(asPlace,30);return t}
const APTL={hide:0};
function apTlAuto(){clearTimeout(APTL.hide);APTL.hide=setTimeout(()=>{const t=$('.ap-tl');if(t&&!t.matches(':hover')&&!AP.run)apTlClose()},14000)}
function apTlClose(){const t=$('.ap-tl:not(.out)');if(!t||AP.run)return;t.classList.add('out');setTimeout(()=>{t.remove();asPlace()},320)}
function apTlTip(t,nd){const L=AP.list||[],i=+nd.dataset.i,s=L[i];if(!s)return;const st=AP.st[s[0]]||'',ts=(AP.ts||{})[s[0]],tip=$('.ap-tlt',t);
 const dur=ts&&ts.s?((ts.e||(st==='run'?Date.now():ts.s))-ts.s)/1000:0;const note=(AP.note||{})[s[0]];
 tip.innerHTML=`<small>مرحلهٔ ${fa(i+1)} از ${fa(L.length)} · ${esc(apAgShort(s[2]))}</small><b>${apIc(s[2],13)}${esc(s[1])}</b><span class="s s-${st||'wait'}"><i></i>${st?APSTN[st]||st:'در انتظار'}${dur?' · '+fa(dur.toFixed(1))+' ث':''}</span>${note?`<em>${esc(note)}</em>`:''}`;
 const r=nd.getBoundingClientRect(),R=t.getBoundingClientRect();tip.classList.add('on');const w=tip.offsetWidth;tip.style.left=Math.max(8,Math.min(R.width-w-8,r.left-R.left+r.width/2-w/2))+'px'}
function apTlFocus(i){const s=(AP.list||[])[i];if(!s)return;let h=$('.ap-hud');if(!h){apHud();h=$('.ap-hud')}if(!h)return;h.classList.remove('min');AP.hudTab='st';apHud();setTimeout(asPlace,30);
 const li=$(`.ap-st li[data-k="${s[0]}"]`,h);if(li){li.scrollIntoView({block:'center',behavior:apRM()?'auto':'smooth'});li.classList.remove('flash');void li.offsetWidth;li.classList.add('flash')}}
function apTl(){let t=$('.ap-tl:not(.out)');if(!AP.S||!(AP.run||AP.done)){return}if(!t){if(!AP.run)return;t=apTlBuild()}
 const H=document.documentElement;H.classList.toggle('ap-paused',!!(AP.run&&AP.pause));
 const L=AP.list||[],N=L.length,cur=Math.max(0,AP.cur),done=L.filter(s=>['ok','warn','skip'].includes(AP.st[s[0]])).length;
 t.classList.toggle('run',AP.run);t.classList.toggle('paused',!!(AP.run&&AP.pause));t.classList.toggle('done',!!AP.done&&!AP.run);t.classList.toggle('stopped',!!AP.stopped);
 const sig=L.map(s=>s[0]).join();if(t._sig!==sig){t._sig=sig;
  $('.nds',t).innerHTML=L.map((s,i)=>`<button class="nd" data-i="${i}" style="right:${apTlPos(i,N)}%;--i:${i}" aria-label="${esc(s[1])}"><i></i></button>`).join('');
  const G=[];L.forEach((s,i)=>{const g=G[G.length-1];if(g&&g.ag===s[2])g.e=i;else G.push({ag:s[2],s:i,e:i})});const step=N>1?100/(N-1):100;
  $('.grps',t).innerHTML=G.map((g,j)=>{const r=Math.max(0,apTlPos(g.s,N)-step/2),l=Math.min(100,apTlPos(g.e,N)+step/2);return `<span class="gp" data-ag="${g.ag}" data-s="${g.s}" data-e="${g.e}" style="right:${r}%;width:${l-r}%;--i:${j}" title="${esc((APA[g.ag]||APA.orc)[1])}"><span>${esc(apAgShort(g.ag))}</span></span>`}).join('');
  requestAnimationFrame(()=>apTlFit(t));$$('.nd',t).forEach(nd=>{nd.onmouseenter=()=>apTlTip(t,nd);nd.onfocus=()=>apTlTip(t,nd);nd.onmouseleave=nd.onblur=()=>$('.ap-tlt',t).classList.remove('on');nd.onclick=()=>apTlFocus(+nd.dataset.i)})}
 $$('.nd',t).forEach((nd,i)=>{const x=AP.st[L[i][0]]||'';const c='nd'+(x?' '+x:'')+(AP.run&&i===cur?' cur':'');if(nd.className!==c)nd.className=c});
 $$('.gp',t).forEach(g=>g.classList.toggle('on',AP.run&&cur>=+g.dataset.s&&cur<=+g.dataset.e));
 const fp=AP.done&&!AP.run?(AP.stopped?apTlPos(Math.max(0,done-1),N):100):apTlPos(cur,N);t.style.setProperty('--fp',fp+'%');
 const hd=$('.hd',t);hd.style.right=apTlPos(cur,N)+'%';if(hd._ag!==AP.ag){hd._ag=AP.ag;$('.ic',hd).innerHTML=apIc(AP.ag,12);hd.classList.remove('chg');void hd.offsetWidth;hd.classList.add('chg')}
 const s=L[cur];const sm=$('.st small',t),b=$('.st b',t);
 const st1=AP.run?(AP.pause?'متوقف موقت · کنترل دست شماست':`اجرای خودکار · مرحلهٔ ${fa(cur+1)} از ${fa(N)}`):(AP.stopped?'اجرا متوقف شد':'اجرای خودکار پایان یافت');
 const st2=AP.run&&s?s[1]:`${fa(done)} مرحله · ${fa(AP.vals.length)} مقدار`;if(sm.textContent!==st1)sm.textContent=st1;if(b.textContent!==st2){b.textContent=st2;b.classList.remove('chg');void b.offsetWidth;b.classList.add('chg')}
 const pct=AP.done&&!AP.stopped?100:Math.round(done/(N||1)*100);$('.pc',t).textContent=fa(pct)+'٪';
 const sec=((AP.end||Date.now())-AP.t0)/1000;const eta=AP.run&&done>0?' · ≈'+apFmt((N-done)*(sec/done))+' مانده':'';$('.tm',t).textContent=apFmt(sec)+eta;
 const pp=$('.pp',t),pk=AP.run?(AP.pause?'p':'r'):'d';if(pp.dataset.k!==pk){pp.dataset.k=pk;pp.innerHTML=pk==='p'?API_.play:pk==='r'?API_.pause:ASI.again;pp.title=pk==='p'?'ادامه (Space)':pk==='r'?'توقف موقت (Space)':'اجرای دوباره'}
 $('.x',t).style.display=AP.run?'none':'';if(AP.done&&!AP.run&&!t._auto){t._auto=1;apTlAuto()}else if(AP.run)t._auto=0;
 /* live strip inside the chat panel */
 const lv=$('.as-panel .as-live');if(lv){if(AP.run&&s){lv.classList.add('on');lv.innerHTML=`<span class="lv"></span><span>${AP.pause?'متوقف موقت':'اجرای خودکار'} · ${fa(cur+1)}/${fa(N)}</span><b>${esc(s[1])}</b><i style="--p:${pct}%"></i><button data-tl>نمایش پنل</button>`;$('[data-tl]',lv).onclick=()=>apTlFocus(cur)}else lv.classList.remove('on')}}
function apTlFit(t){$$('.gp',t).forEach(g=>{const sp=$('span',g);g.classList.toggle('nl',!!sp&&sp.scrollWidth>g.clientWidth-4)})}
addEventListener('resize',()=>{const t=$('.ap-tl');if(t)apTlFit(t)});
