/* ---------- v15.14 mobile layer: responsive grid fixer, sheet placement, active-tab scroll ---------- */
const MB={seen:new WeakSet(),q:matchMedia('(max-width:760px)'),t:0,tab:null,hud:null};
const mbOn=()=>MB.q.matches;
function mbPx(v){return v.split(' ').map(parseFloat).filter(n=>!isNaN(n))}
function mbFix(){if(!mbOn())return;const R=$('.sx-body');if(!R)return;const W0=R.clientWidth;let n=0;
 for(const e of R.querySelectorAll('*')){if(MB.seen.has(e))continue;if(++n>2500)break;MB.seen.add(e);if(e.closest('svg,canvas,table,.ap-hud'))continue;const cs=getComputedStyle(e);const d=cs.display;
  if((d==='grid'||d==='inline-grid')&&!e.dataset.mbg){const c=mbPx(cs.gridTemplateColumns);if(c.length<2)continue;const W=e.clientWidth||W0,mn=Math.min(...c);
   if(e.tagName==='LABEL'||e.matches('.sx-sl,.sx-f,.sx-row')||cs.gridAutoFlow.startsWith('column'))continue;const ovf=W<c.reduce((a,b)=>a+b,0)-4;const ch=[...e.children];const small=ch.length>=2&&ch.every(x=>x.offsetHeight<130&&(x.innerText||'').length<140);if(ovf||(c.length>=4&&mn<64)||(mn<120&&!small)||(mn<44&&ch.some(x=>x.scrollWidth>x.clientWidth+2))){const k=small&&W>=250?'mb-g2':'mb-g1';e.classList.add(k);e.dataset.mbg=k;
    for(const x of ch){const p=getComputedStyle(x).position;if(p==='sticky')x.classList.add('mb-st')}}else e.dataset.mbg='-'}
  else if(d==='flex'&&cs.flexDirection.startsWith('row')&&cs.flexWrap==='nowrap'&&!e.dataset.mbf&&e.scrollWidth>e.clientWidth+3&&cs.overflowX==='visible'){const ch=[...e.children];const btns=ch.length>2&&ch.every(x=>/^(BUTTON|A|LABEL)$/.test(x.tagName)||x.classList.contains('ind')||x.classList.contains('sx-ink'));e.classList.add(btns?'mb-sc':'mb-fw');e.dataset.mbf=1}}}
function mbTick(){if(!mbOn())return;const h=document.documentElement;h.classList.toggle('mb-sx',!!$('.sx-wrap.in,.ch-wrap.in'));h.classList.toggle('mb-fly',!!$('.nv-fly,.nv-allp'));
 const t=$('.sx-head .sx-tabs button.on');if(t&&t!==MB.tab){MB.tab=t;const s=t.parentElement;s.scrollTo({left:t.offsetLeft-(s.clientWidth-t.offsetWidth)/2,behavior:'smooth'})}
 const hd=$('.ap-hud:not(.out)');if(hd&&hd!==MB.hud){MB.hud=hd;if(AP.run)hd.classList.add('min')}
 const tl=$('.ap-tl:not(.out)');h.style.setProperty('--mb-tl',(tl?tl.offsetHeight+8:0)+'px');mbFix()}
function mbSync(){const on=mbOn();document.documentElement.classList.toggle('mb',on);if(!on){MB.seen=new WeakSet();document.documentElement.classList.remove('mb-sx','mb-fly');$$('[data-mbg],[data-mbf]').forEach(e=>{e.classList.remove('mb-g1','mb-g2','mb-sc','mb-fw');delete e.dataset.mbg;delete e.dataset.mbf});$$('.mb-st').forEach(e=>e.classList.remove('mb-st'))}else{MB.seen=new WeakSet();$$('[data-mbg]').forEach(e=>{e.classList.remove('mb-g1','mb-g2');delete e.dataset.mbg});mbTick()}try{asPlace()}catch(e){}}
{const _p=asPlace;asPlace=function(){if(!mbOn())return _p();for(const s of ['.as-panel','.ap-hud','.as-pill']){const e=$(s);if(e){e.style.left='';e.style.bottom='';e.style.maxHeight='';e.style.transformOrigin=''}}}}
new MutationObserver(()=>{if(MB.t||!mbOn())return;MB.t=setTimeout(()=>{MB.t=0;try{mbTick()}catch(e){console.error('mobile',e)}},160)}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
(MB.q.addEventListener?MB.q.addEventListener('change',mbSync):MB.q.addListener(mbSync));addEventListener('orientationchange',()=>setTimeout(mbSync,300));setTimeout(mbSync,600);
