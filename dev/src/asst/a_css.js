/* ===== v15.12: minimal design system + motion for assistant, autopilot and repeatable processes ===== */
(()=>{const st=document.createElement('style');st.id='asana-assist-css';st.textContent=`
:root{--as-ok:var(--good,#72bc8f);--as-warn:var(--road,#e0a84e);--as-bad:var(--border,#e97366);--as-mint:var(--accent,#5e9fe8);
 --as-e:cubic-bezier(.2,.8,.2,1);--as-sp:cubic-bezier(.3,1.25,.5,1);--as-io:cubic-bezier(.65,0,.35,1);
 --as-bg:var(--panel-solid,#1e1e1e);--as-surf2:var(--panel2);--as-surf3:var(--hover);--as-r:16px;
 --as-sh:0 0 0 1px var(--line2),0 20px 50px -14px rgba(0,0,0,.6),0 4px 14px -6px rgba(0,0,0,.4);--as-font:Vazirmatn,Inter,system-ui,sans-serif}
[data-theme=light]{--as-sh:0 0 0 1px var(--line2),0 20px 44px -16px rgba(20,20,20,.22),0 3px 10px -4px rgba(20,20,20,.1)}
@property --ap-p{syntax:'<angle>';inherits:true;initial-value:0deg}
.as-fab,.as-pill,.as-panel,.ap-hud,.apx-pre,.ap-badge,.as-tip,.as-ask,.ap-cur-l,.ap-wipe span,.ap-intro .c,.ap-fly{font-family:var(--as-font);direction:rtl}
.as-panel button,.ap-hud button,.apx-pre button,.ap-badge button,.as-pill{font-family:inherit}
.as-panel svg,.ap-hud svg,.apx-pre svg,.ap-badge svg,.as-pill svg{flex:none}
/* ---------- launcher ---------- */
.as-fab{position:fixed;left:20px;bottom:20px;z-index:120;width:44px;height:44px;border-radius:14px;border:0;padding:0;display:grid;place-items:center;cursor:pointer;color:var(--text);background:var(--as-bg);box-shadow:var(--as-sh);touch-action:none;user-select:none;
 transition:transform .25s var(--as-e),background .2s,box-shadow .25s,left .45s var(--as-e),bottom .45s var(--as-e);animation:asFabIn .5s var(--as-e) both}
.as-fab:hover{background:color-mix(in srgb,var(--text) 6%,var(--as-bg))}.as-fab:active{transform:scale(.94)}
.as-fab.drag{transition:none;cursor:grabbing;transform:scale(1.04)}.as-fab.snap{transition:left .45s var(--as-e),bottom .45s var(--as-e)}
.as-fab .i1,.as-fab .i2{grid-area:1/1;display:grid;place-items:center;transition:transform .3s var(--as-e),opacity .2s}
.as-fab .i1 svg{width:21px;height:21px}.as-fab .i2{opacity:0;transform:rotate(-90deg) scale(.6)}
.as-fab.open .i1{opacity:0;transform:rotate(90deg) scale(.6)}.as-fab.open .i2{opacity:1;transform:none}
.as-fab .as-orb{position:absolute;inset:-3px;border-radius:17px;padding:2px;opacity:0;transition:opacity .3s;pointer-events:none;
 background:conic-gradient(from 0deg,var(--accent) var(--ap-p),transparent 0);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;transition:--ap-p .6s var(--as-e),opacity .3s}
.as-fab.run .as-orb{opacity:1}
.as-fab.busy:not(.run) .as-orb{opacity:1;--ap-p:90deg;animation:asRot 1s linear infinite}
.as-fab .as-dot{position:absolute;top:7px;left:7px;width:6px;height:6px;border-radius:50%;background:var(--faint);box-shadow:0 0 0 2px var(--as-bg);transition:background .3s}
.as-fab .as-dot.on{background:var(--as-ok)}
.as-fab .as-bdg{position:absolute;top:-5px;right:-5px;min-width:17px;height:17px;padding:0 4px;border-radius:9px;background:var(--accent);color:#fff;font:600 10px/17px var(--as-font);box-shadow:0 0 0 2px var(--as-bg);animation:asPop .35s var(--as-sp)}
@keyframes asFabIn{from{opacity:0;transform:translateY(10px) scale(.9)}to{opacity:1;transform:none}}
@keyframes asPop{from{transform:scale(.4);opacity:0}to{transform:none;opacity:1}}
@keyframes asRot{to{transform:rotate(360deg)}}
/* ---------- tooltip / selection ask ---------- */
.as-tip{position:fixed;z-index:123;max-width:270px;padding:6px 9px;border-radius:8px;background:var(--text);color:var(--ink);font-size:11px;line-height:1.6;pointer-events:none;opacity:0;transform:translateY(4px);transition:opacity .16s,transform .2s var(--as-e)}
.as-tip.on{opacity:1;transform:none}.as-tip kbd{font:600 9.5px ui-monospace,monospace;padding:0 4px;border-radius:4px;border:1px solid color-mix(in srgb,var(--ink) 30%,transparent);margin-right:4px}
.as-ask{position:fixed;z-index:122;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border:0;border-radius:8px;background:var(--as-bg);color:var(--text);box-shadow:var(--as-sh);font-size:11.5px;cursor:pointer;animation:asIn .18s var(--as-e)}
.as-ask svg{color:var(--accent);width:13px;height:13px}.as-ask:hover{background:color-mix(in srgb,var(--text) 6%,var(--as-bg))}
@keyframes asIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
/* ---------- autopilot launch bar ---------- */
.as-pill{position:fixed;z-index:120;height:44px;display:flex;align-items:center;gap:10px;padding:0 8px 0 6px;padding-inline:6px 8px;border-radius:14px;background:var(--as-bg);color:var(--text);box-shadow:var(--as-sh);cursor:pointer;max-width:min(380px,calc(100vw - 100px));
 animation:asPillIn .4s var(--as-e) both;transition:background .2s,transform .2s var(--as-e)}
.as-pill:hover{background:color-mix(in srgb,var(--text) 5%,var(--as-bg))}.as-pill:active{transform:scale(.98)}
.as-pill.out{animation:asPillOut .22s var(--as-e) forwards;pointer-events:none}
.as-pill .bolt{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;background:var(--accent-soft);color:var(--accent);flex:none}
.as-pill .bolt svg{width:15px;height:15px}
.as-pill .tx{display:flex;flex-direction:column;min-width:0;line-height:1.35}
.as-pill .tx b{font-size:12px;font-weight:600}.as-pill .tx small{font-size:10.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.as-pill kbd{font:600 9.5px ui-monospace,monospace;color:var(--faint);padding:1px 5px;border:1px solid var(--line2);border-radius:5px;flex:none}
.as-pill .x{width:24px;height:24px;border-radius:7px;display:grid;place-items:center;color:var(--faint);flex:none;transition:background .15s,color .15s}
.as-pill .x:hover{background:var(--hover);color:var(--text)}.as-pill .x svg{width:12px;height:12px}
@keyframes asPillIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
@keyframes asPillOut{to{opacity:0;transform:translateX(-6px)}}
/* ---------- assistant panel ---------- */
.as-panel{position:fixed;z-index:121;left:20px;bottom:76px;width:400px;height:min(640px,calc(100vh - 110px));display:flex;flex-direction:column;border-radius:var(--as-r);background:var(--as-bg);color:var(--text);box-shadow:var(--as-sh);overflow:hidden;
 animation:asPanelIn .26s var(--as-e) both;transition:width .32s var(--as-e),height .32s var(--as-e)}
.as-panel.wide{width:min(680px,calc(100vw - 40px));height:min(800px,calc(100vh - 100px))}
.as-panel.out{animation:asPanelOut .16s ease-in forwards;pointer-events:none}
@keyframes asPanelIn{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:none}}
@keyframes asPanelOut{to{opacity:0;transform:translateY(6px) scale(.98)}}
.as-hd{display:flex;align-items:center;gap:10px;height:54px;padding:0 14px 0 10px;padding-inline:14px 10px;border-bottom:1px solid var(--line);flex:none}
.as-lg{position:relative;width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:var(--panel2);box-shadow:inset 0 0 0 1px var(--line2);color:var(--text);flex:none}
.as-lg svg{width:16px;height:16px}
.as-lg.busy::after{content:'';position:absolute;inset:-3px;border-radius:11px;border:1.5px solid transparent;border-top-color:var(--accent);border-left-color:var(--accent);animation:asRot .9s linear infinite}
.as-hd .tt{display:flex;flex-direction:column;min-width:0;line-height:1.35}
.as-hd .tt b{font-size:13px;font-weight:600}
.as-hd .tt small{display:flex;align-items:center;gap:6px;font-size:10.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.as-hd .tt small i{width:6px;height:6px;border-radius:50%;background:var(--faint);flex:none}.as-hd .tt small i.on{background:var(--as-ok)}
.as-hd .sp{flex:1}
.as-ib{width:28px;height:28px;border-radius:8px;border:0;background:transparent;color:var(--muted);display:grid;place-items:center;cursor:pointer;transition:background .15s,color .15s,transform .15s}
.as-ib:hover{background:var(--hover);color:var(--text)}.as-ib:active{transform:scale(.92)}.as-ib svg{width:15px;height:15px}
.as-ctx{display:flex;align-items:center;gap:6px;padding:10px 14px 0;font-size:11px;flex:none;min-width:0}
.as-chip{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 8px;border-radius:7px;background:var(--panel2);box-shadow:inset 0 0 0 1px var(--line);color:var(--muted);max-width:230px;min-width:0;animation:asIn .25s var(--as-e)}
.as-chip>span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.as-chip svg{width:12px;height:12px}
.as-chip.sel{background:var(--accent-soft);box-shadow:none;color:var(--accent);max-width:140px}
.as-chip .as-sx{display:grid;place-items:center;cursor:pointer;opacity:.7}.as-chip .as-sx:hover{opacity:1}.as-chip .as-sx svg{width:10px;height:10px}
.as-ctx label{margin-inline-start:auto;display:inline-flex;align-items:center;gap:6px;color:var(--muted);cursor:pointer;white-space:nowrap;flex:none}
.as-sw{appearance:none;-webkit-appearance:none;width:28px;height:16px;margin:0;border-radius:999px;background:var(--line2);position:relative;cursor:pointer;transition:background .2s;flex:none;vertical-align:middle}
.as-sw::after{content:'';position:absolute;top:2px;right:2px;width:12px;height:12px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.3);transition:right .25s var(--as-e)}
.as-sw:checked{background:var(--accent)}.as-sw:checked::after{right:14px}
.as-modes{position:relative;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;margin:10px 14px 0;padding:3px;border-radius:10px;background:var(--panel2);box-shadow:inset 0 0 0 1px var(--line);flex:none}
.as-modes button{position:relative;z-index:1;height:28px;border:0;background:none;color:var(--muted);font-size:11.5px;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;border-radius:7px;transition:color .2s;white-space:nowrap}
.as-modes button svg{width:13px;height:13px;opacity:.85}.as-modes button:hover{color:var(--text)}.as-modes button.on{color:var(--text);font-weight:500}
.as-modes .ind{position:absolute;top:3px;bottom:3px;border-radius:7px;background:var(--as-bg);box-shadow:0 0 0 1px var(--line2),0 1px 3px rgba(0,0,0,.18);transition:left .3s var(--as-e),width .3s var(--as-e)}
.as-msgs{flex:1;overflow:auto;padding:16px 16px 10px;display:flex;flex-direction:column;gap:16px;scroll-behavior:smooth;overscroll-behavior:contain;transition:opacity .2s}
.as-msgs::-webkit-scrollbar,.ap-bd::-webkit-scrollbar,.apx-pre .bd::-webkit-scrollbar{width:8px}
.as-msgs::-webkit-scrollbar-thumb,.ap-bd::-webkit-scrollbar-thumb,.apx-pre .bd::-webkit-scrollbar-thumb{background:var(--line2);border-radius:8px;border:2px solid var(--as-bg)}
.as-m{animation:asMsg .32s var(--as-e) both;min-width:0}
@keyframes asMsg{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.as-m.u{align-self:flex-end;max-width:84%;padding:8px 12px;border-radius:14px 14px 14px 4px;background:var(--hover);box-shadow:inset 0 0 0 1px var(--line);font-size:12.5px;line-height:1.8;white-space:pre-wrap;word-break:break-word}
.as-m.a{position:relative;padding-inline-start:32px}
.as-m.a>.av{position:absolute;right:0;top:1px;width:22px;height:22px;border-radius:7px;display:grid;place-items:center;background:var(--panel2);box-shadow:inset 0 0 0 1px var(--line2);color:var(--text)}
.as-m.a>.av svg{width:12px;height:12px}
.as-m.a.err>.av{color:var(--as-bad)}
.as-m .bd{font-size:12.75px;line-height:1.9;word-break:break-word}
.as-m.a.fresh .bd>*{animation:asRv .38s var(--as-e) both;animation-delay:calc(var(--i,0)*45ms)}
@keyframes asRv{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.as-m .bd h4{font-size:13px;font-weight:600;margin:12px 0 4px}.as-m .bd h4:first-child{margin-top:0}
.as-m .bd ul,.as-m .bd ol{margin:4px 0;padding-inline-start:18px}.as-m .bd li{margin:2px 0}.as-m .bd li::marker{color:var(--faint)}
.as-m .bd b{font-weight:600}
.as-m .bd code{font:11.5px ui-monospace,Menlo,monospace;padding:1px 5px;border-radius:5px;background:var(--panel2);box-shadow:inset 0 0 0 1px var(--line)}
.as-m .bd pre{margin:6px 0;padding:9px 11px;border-radius:9px;background:var(--panel2);box-shadow:inset 0 0 0 1px var(--line);overflow:auto}
.as-m .bd blockquote{margin:6px 0;padding:2px 10px;border-inline-start:2px solid var(--line2);color:var(--muted);font-size:12px}
.as-m .bd table{width:100%;border-collapse:collapse;margin:8px 0;font-size:11.5px}
.as-m .bd th,.as-m .bd td{padding:6px 8px;border-bottom:1px solid var(--line);text-align:start}.as-m .bd th{color:var(--muted);font-weight:600}
.as-m a{color:var(--accent);text-decoration:none}.as-m a:hover{text-decoration:underline}
.as-m sup a{display:inline-grid;place-items:center;min-width:15px;height:15px;padding:0 3px;border-radius:5px;background:var(--accent-soft);font-size:9.5px;text-decoration:none!important;margin:0 1px}
.as-res{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:10px 0 4px;padding:12px 14px;border-radius:12px;background:var(--panel2);box-shadow:inset 0 0 0 1px var(--line);animation:asRv .4s var(--as-e) .1s both}
.as-res span{font-size:11px;color:var(--muted)}.as-res b{font-size:22px;font-weight:650;letter-spacing:-.01em;direction:ltr;font-variant-numeric:tabular-nums}
.as-calc{width:100%;border-collapse:collapse;margin:6px 0;font-size:11.5px}
.as-calc tr{animation:asRv .3s var(--as-e) both}.as-calc td{padding:5px 2px;border-bottom:1px dashed var(--line)}.as-calc td:first-child{color:var(--muted)}
.as-calc td:last-child{text-align:left;direction:ltr;font-variant-numeric:tabular-nums;font-weight:500}
.as-srcs{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px}
.as-sc{display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:10px;box-shadow:inset 0 0 0 1px var(--line);color:var(--text)!important;text-decoration:none!important;min-width:0;animation:asRv .3s var(--as-e) both;animation-delay:calc(var(--i,0)*40ms + 120ms);transition:background .15s,box-shadow .15s}
.as-sc:hover{background:var(--hover);box-shadow:inset 0 0 0 1px var(--line2)}
.as-sc .fv{width:18px;height:18px;border-radius:5px;display:grid;place-items:center;color:#fff;font-size:9.5px;font-weight:600;flex:none}
.as-sc div{min-width:0;display:flex;flex-direction:column;line-height:1.4}.as-sc b{font-size:11px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.as-sc small{font-size:10px;color:var(--faint);direction:ltr;text-align:right}
.as-src{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.as-src a,.as-src span{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 8px;border-radius:7px;box-shadow:inset 0 0 0 1px var(--line);font-size:11px;color:var(--muted)!important;text-decoration:none!important;max-width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.as-src a:hover{background:var(--hover);color:var(--text)!important}.as-src svg{width:11px;height:11px}
.as-m .meta{display:flex;align-items:center;gap:10px;margin-top:8px;font-size:10.5px;color:var(--faint);min-height:24px;flex-wrap:wrap}
.as-tl{margin-inline-start:auto;display:flex;gap:2px;opacity:0;transform:translateY(2px);transition:opacity .2s,transform .2s var(--as-e)}
.as-m:hover .as-tl,.as-m.last .as-tl,.as-tl:focus-within{opacity:1;transform:none}
.as-tl button{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 7px;border:0;border-radius:7px;background:none;color:var(--muted);font-size:10.5px;cursor:pointer;transition:background .15s,color .15s}
.as-tl button:hover{background:var(--hover);color:var(--text)}.as-tl svg{width:12px;height:12px}
.as-think{display:flex;flex-direction:column;gap:8px;padding-top:2px}
.as-think .as-row{display:flex;align-items:center;gap:8px;font-size:12px}
.as-think .tx{background:linear-gradient(90deg,var(--muted) 0%,var(--text) 50%,var(--muted) 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:asShim 1.6s linear infinite,asRv .3s var(--as-e)}
@keyframes asShim{from{background-position:100% 0}to{background-position:-100% 0}}
.as-think .dots{display:inline-flex;gap:3px}.as-think .dots i{width:4px;height:4px;border-radius:50%;background:var(--accent);animation:asB 1.1s infinite}.as-think .dots i:nth-child(2){animation-delay:.15s}.as-think .dots i:nth-child(3){animation-delay:.3s}
@keyframes asB{0%,80%,100%{opacity:.25;transform:none}40%{opacity:1;transform:translateY(-2px)}}
.as-think .sk{height:8px;border-radius:4px;background:linear-gradient(90deg,var(--panel2) 0%,var(--hover) 50%,var(--panel2) 100%);background-size:200% 100%;animation:asShim 1.4s linear infinite}
.as-think .sk:nth-child(2){width:92%}.as-think .sk:nth-child(3){width:74%}.as-think .sk:nth-child(4){width:52%}
.as-empty{display:flex;flex-direction:column;align-items:flex-start;padding:6px 0 4px;animation:asIn .35s var(--as-e)}
.as-orb2{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;background:var(--panel2);box-shadow:inset 0 0 0 1px var(--line2);color:var(--text)}
.as-orb2 svg{width:18px;height:18px}
.as-empty>b{font-size:15px;font-weight:600;margin-top:14px}
.as-empty>p{font-size:12px;color:var(--muted);line-height:1.85;margin:4px 0 0}
.as-sug{display:flex;flex-direction:column;gap:2px;width:100%;margin-top:16px}
.as-sug .lb{font-size:10.5px;color:var(--faint);margin:0 4px 4px}
.as-sug button{display:flex;align-items:center;gap:10px;width:100%;min-height:36px;padding:6px 10px;border:0;border-radius:9px;background:none;color:var(--text);font-size:12px;text-align:start;cursor:pointer;animation:asRv .3s var(--as-e) both;animation-delay:calc(var(--i,0)*35ms + 80ms);transition:background .15s}
.as-sug button:hover{background:var(--hover)}
.as-sug button>svg:first-child{width:14px;height:14px;color:var(--faint)}
.as-sug button>span{flex:1;min-width:0}
.as-sug button .ar{width:14px;height:14px;color:var(--faint);opacity:0;transform:translateX(4px);transition:opacity .15s,transform .2s var(--as-e)}
.as-sug button:hover .ar{opacity:1;transform:none}
.as-sug button.as-apx{background:var(--panel2);box-shadow:inset 0 0 0 1px var(--line2);margin-bottom:8px;min-height:44px}
.as-sug button.as-apx>svg:first-child{width:28px;height:28px;padding:7px;border-radius:8px;background:var(--accent-soft);color:var(--accent)}
.as-sug button.as-apx span b{display:block;font-weight:600;font-size:12px}.as-sug button.as-apx span small{display:block;color:var(--muted);font-size:10.5px}
.as-sug button.as-apx:hover{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--accent) 45%,transparent)}
.as-down{position:absolute;left:50%;bottom:104px;width:30px;height:30px;margin-left:-15px;border-radius:50%;border:0;display:grid;place-items:center;background:var(--as-bg);color:var(--muted);box-shadow:var(--as-sh);cursor:pointer;opacity:0;transform:translateY(6px);pointer-events:none;transition:opacity .2s,transform .2s var(--as-e)}
.as-down.on{opacity:1;transform:none;pointer-events:auto}.as-down svg{width:14px;height:14px}
.as-ft{padding:10px 12px 10px;flex:none}
.as-in{display:flex;align-items:flex-end;gap:6px;padding:6px;padding-inline:10px 6px;border-radius:12px;background:var(--panel2);box-shadow:inset 0 0 0 1px var(--line2);transition:box-shadow .2s}
.as-in:focus-within{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--accent) 60%,transparent),0 0 0 3px var(--accent-soft)}
.as-in .pf{align-self:center;display:none;font-size:10.5px;color:var(--accent);background:var(--accent-soft);height:20px;line-height:20px;padding:0 7px;border-radius:6px;white-space:nowrap;animation:asPop .25s var(--as-sp)}
.as-in .pf.on{display:block}
.as-in textarea{flex:1;min-width:0;border:0;outline:0;resize:none;background:none;color:var(--text);font:12.5px/1.6 var(--as-font);padding:5px 2px;min-height:22px;max-height:130px}
.as-in textarea::placeholder{color:var(--faint)}
.as-in .go{width:30px;height:30px;border-radius:9px;border:0;display:grid;place-items:center;background:var(--ivory);color:var(--on-ivory);cursor:pointer;flex:none;transition:opacity .2s,transform .15s}
.as-in .go:active{transform:scale(.92)}.as-in .go:disabled,.as-in.as-mt .go{opacity:.3;cursor:default}
.as-in .go.busy svg{animation:asRot .8s linear infinite}.as-in .go svg{width:15px;height:15px}
.as-ft .kb{display:flex;gap:12px;margin-top:7px;padding:0 4px;font-size:10.5px;color:var(--faint);white-space:nowrap;overflow:hidden}
.as-ft kbd,.ap-hud kbd,.apx-pre kbd{font:600 9.5px ui-monospace,monospace;padding:0 4px;border-radius:4px;box-shadow:inset 0 0 0 1px var(--line2);color:var(--muted);margin-inline-end:3px}
.as-ft .md{margin-inline-start:auto;color:var(--accent)}
/* ---------- autopilot: frame, badge, cursor, focus ---------- */
.ap-frame{position:fixed;inset:0;z-index:118;pointer-events:none;box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--accent) 55%,transparent),inset 0 0 60px -20px color-mix(in srgb,var(--accent) 45%,transparent);animation:apFrIn .5s var(--as-e) both,apBr 2.8s ease-in-out .5s infinite;transition:box-shadow .4s}
.ap-frame.paused{box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--as-warn) 60%,transparent),inset 0 0 50px -24px color-mix(in srgb,var(--as-warn) 45%,transparent);animation:none}
.ap-frame.out{animation:apFrOut .5s ease forwards}
@keyframes apFrIn{from{opacity:0}to{opacity:1}}@keyframes apFrOut{to{opacity:0}}@keyframes apBr{0%,100%{opacity:1}50%{opacity:.55}}
.ap-badge{position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:126;display:flex;align-items:center;gap:8px;height:36px;padding-inline:12px 4px;border-radius:11px;background:var(--as-bg);color:var(--text);box-shadow:var(--as-sh);font-size:11.5px;white-space:nowrap;animation:apBdgIn .35s var(--as-e) both}
.ap-badge.out{animation:apBdgOut .25s ease forwards}
@keyframes apBdgIn{from{opacity:0;transform:translate(-50%,-10px)}to{opacity:1;transform:translateX(-50%)}}@keyframes apBdgOut{to{opacity:0;transform:translate(-50%,-8px)}}
.ap-badge .lv{position:relative;width:7px;height:7px;border-radius:50%;background:var(--accent)}
.ap-badge .lv::after{content:'';position:absolute;inset:0;border-radius:50%;background:var(--accent);animation:asPing 1.6s var(--as-e) infinite}
@keyframes asPing{0%{transform:scale(1);opacity:.7}100%{transform:scale(3);opacity:0}}
.ap-badge.paused .lv{background:var(--as-warn)}.ap-badge.paused .lv::after{display:none}
.ap-badge>span:nth-of-type(2){font-weight:600}.ap-badge small{color:var(--muted);font-size:11px;max-width:240px;overflow:hidden;text-overflow:ellipsis}
.ap-badge .sep{width:1px;height:18px;background:var(--line2)}
.ap-badge button{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 10px;border:0;border-radius:8px;background:none;color:var(--text);font-size:11px;cursor:pointer;transition:background .15s}
.ap-badge button:hover{background:var(--hover)}.ap-badge button.go{background:var(--ivory);color:var(--on-ivory)}.ap-badge button svg{width:12px;height:12px}
.ap-cur{position:fixed;left:0;top:0;z-index:125;pointer-events:none;will-change:transform}
.ap-cur>svg{display:block;width:20px;height:20px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.35));transition:transform .14s var(--as-e);transform-origin:3px 2px}
.ap-cur.down>svg{transform:scale(.82)}
.ap-cur-l{position:absolute;left:16px;top:20px;display:inline-flex;align-items:center;gap:6px;height:24px;padding-inline:6px 9px;border-radius:7px;background:var(--as-bg);color:var(--text);box-shadow:var(--as-sh);font-size:11px;white-space:nowrap}
.ap-cur-l i{display:grid;place-items:center;color:var(--accent)}.ap-cur-l i svg{width:13px;height:13px}
.ap-cur-l.chg{animation:apLbl .3s var(--as-e)}@keyframes apLbl{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}
.ap-tr{position:fixed;z-index:124;width:4px;height:4px;border-radius:50%;background:var(--accent);pointer-events:none;opacity:.45;animation:apTr .5s ease-out forwards}
@keyframes apTr{to{opacity:0;transform:scale(.2)}}
.ap-ring{position:fixed;z-index:124;pointer-events:none;border-radius:9px;box-shadow:0 0 0 1.5px var(--accent),0 0 0 5px var(--accent-soft);opacity:0;transition:left .38s var(--as-e),top .38s var(--as-e),width .38s var(--as-e),height .38s var(--as-e),opacity .2s,box-shadow .35s}
.ap-ring.on{opacity:1}.ap-ring.spot{box-shadow:0 0 0 1.5px var(--accent),0 0 0 5px var(--accent-soft),0 0 0 100vmax rgba(0,0,0,.16)}
.ap-rip{position:fixed;z-index:124;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;box-shadow:0 0 0 1.5px var(--accent);pointer-events:none;animation:apRip .55s var(--as-e) forwards}
.ap-rip.b{box-shadow:none;background:var(--accent-soft);animation-duration:.7s}
@keyframes apRip{from{transform:scale(.4);opacity:1}to{transform:scale(3.4);opacity:0}}
.ap-typing{outline:0!important;box-shadow:0 0 0 1.5px var(--accent),0 0 0 4px var(--accent-soft)!important;transition:box-shadow .2s!important}
.ap-wipe{position:fixed;z-index:117;pointer-events:none;display:grid;place-items:center;background:color-mix(in srgb,var(--ink) 40%,transparent);animation:apWipe .75s var(--as-e) forwards}
.ap-wipe span{display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 14px;border-radius:10px;background:var(--as-bg);color:var(--text);box-shadow:var(--as-sh);font-size:12px;font-weight:600;animation:apWipeL .75s var(--as-e) forwards}
.ap-wipe span svg{width:14px;height:14px;color:var(--accent)}
@keyframes apWipe{0%{opacity:0}25%,60%{opacity:1}100%{opacity:0}}@keyframes apWipeL{0%{transform:translateY(6px) scale(.97);opacity:0}25%,65%{transform:none;opacity:1}100%{transform:translateY(-4px);opacity:0}}
.ap-fly{position:fixed;left:0;top:0;z-index:128;height:24px;padding:0 9px;border-radius:7px;background:var(--ivory);color:var(--on-ivory);font:600 11px/24px var(--as-font);white-space:nowrap;pointer-events:none;box-shadow:0 6px 16px -6px rgba(0,0,0,.4);font-variant-numeric:tabular-nums}
.ap-intro{position:fixed;inset:0;z-index:127;display:grid;place-items:center;pointer-events:none;background:color-mix(in srgb,var(--ink) 30%,transparent);animation:apIntro 1.5s var(--as-e) forwards}
.ap-intro .c{display:flex;align-items:center;gap:12px;padding:14px 18px 14px 16px;padding-inline:16px 20px;border-radius:14px;background:var(--as-bg);color:var(--text);box-shadow:var(--as-sh);animation:apIntroC 1.5s var(--as-e) forwards}
.ap-intro .o{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:var(--accent-soft);color:var(--accent)}.ap-intro .o svg{width:17px;height:17px}
.ap-intro .c div{display:flex;flex-direction:column;line-height:1.5}.ap-intro b{font-size:13px;font-weight:600}.ap-intro small{font-size:11px;color:var(--muted)}
.ap-intro .pb{position:absolute;inset:auto 16px 0 16px;height:2px;border-radius:2px;background:var(--line);overflow:hidden}.ap-intro .pb::after{content:'';position:absolute;inset:0;background:var(--accent);transform-origin:right;animation:apIntroB 1.1s var(--as-io) .1s both}
.ap-intro .c{position:relative}
@keyframes apIntro{0%{opacity:0}15%,75%{opacity:1}100%{opacity:0}}@keyframes apIntroC{0%{transform:translateY(8px) scale(.97)}18%,78%{transform:none}100%{transform:translateY(-6px)}}@keyframes apIntroB{from{transform:scaleX(0)}to{transform:scaleX(1)}}
/* ---------- autopilot run panel ---------- */
.ap-hud{position:fixed;z-index:119;left:20px;bottom:76px;width:384px;max-height:min(640px,calc(100vh - 110px));display:flex;flex-direction:column;border-radius:var(--as-r);background:var(--as-bg);color:var(--text);box-shadow:var(--as-sh);overflow:hidden;animation:asPanelIn .3s var(--as-e) both}
.ap-hud.out{animation:asPanelOut .2s ease-in forwards}
.ap-hd{display:flex;align-items:center;gap:10px;padding:12px 14px;padding-inline:14px 10px;flex:none}
.ap-pr{position:relative;width:36px;height:36px;flex:none}.ap-pr svg{width:36px;height:36px;transform:rotate(-90deg)}
.ap-pr circle{fill:none;stroke-width:3}.ap-pr .bg{stroke:var(--line2)}.ap-pr .fg{stroke:var(--accent);stroke-linecap:round;stroke-dasharray:113.1;stroke-dashoffset:113.1;transition:stroke-dashoffset .6s var(--as-e),stroke .3s}
.ap-hud.done .ap-pr .fg{stroke:var(--as-ok)}.ap-hud.paused .ap-pr .fg{stroke:var(--as-warn)}
.ap-pr b{position:absolute;inset:0;display:grid;place-items:center;font-size:9.5px;font-weight:600;font-variant-numeric:tabular-nums}
.ap-hd .tt{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.45}
.ap-hd .tt b{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600}
.ap-hd .stt{display:inline-flex;align-items:center;gap:5px;height:18px;padding:0 7px;border-radius:6px;background:var(--panel2);box-shadow:inset 0 0 0 1px var(--line);font-size:10px;font-weight:500;color:var(--muted)}
.ap-hd .stt i{width:6px;height:6px;border-radius:50%;background:var(--faint)}
.ap-hud.run .stt i{background:var(--accent);animation:apBr 1.4s infinite}.ap-hud.paused .stt i{background:var(--as-warn);animation:none}.ap-hud.done .stt i{background:var(--as-ok);animation:none}
.ap-hd .sub{font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ap-hd .tm{display:flex;flex-direction:column;align-items:flex-end;line-height:1.4;flex:none}
.ap-hd .el{font-size:12px;font-weight:600;font-variant-numeric:tabular-nums}.ap-hd .eta{font-size:10px;color:var(--faint)}
.ap-hd .mn,.ap-hd .cl{width:28px;height:28px;border:0;border-radius:8px;background:none;color:var(--muted);display:grid;place-items:center;cursor:pointer;transition:background .15s,color .15s,transform .3s var(--as-e)}
.ap-hd .mn:hover,.ap-hd .cl:hover{background:var(--hover);color:var(--text)}.ap-hd .mn svg,.ap-hd .cl svg{width:15px;height:15px}
.ap-hud.min .ap-hd .mn{transform:rotate(180deg)}
.ap-bar{position:relative;height:2px;background:var(--line);flex:none;overflow:hidden}
.ap-bar i{position:absolute;inset:0 0 0 auto;width:0;background:var(--accent);transition:width .6s var(--as-e),background .3s}
.ap-hud.done .ap-bar i{background:var(--as-ok)}.ap-hud.paused .ap-bar i{background:var(--as-warn)}
.ap-hud.run:not(.paused) .ap-bar::after{content:'';position:absolute;top:0;bottom:0;width:30%;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--accent) 70%,#fff),transparent);animation:apBar 1.6s var(--as-io) infinite}
@keyframes apBar{from{right:-30%}to{right:100%}}
.ap-bd{flex:1;overflow:auto;padding-bottom:12px;transition:opacity .2s}
.ap-hud.min .ap-bd{display:none}
.ap-now{display:flex;align-items:center;gap:10px;margin:12px 14px 0;padding:10px;border-radius:12px;background:var(--panel2);box-shadow:inset 0 0 0 1px var(--line)}
.ap-av{width:32px;height:32px;border-radius:9px;display:grid;place-items:center;background:var(--accent-soft);color:var(--accent);flex:none}.ap-av svg{width:16px;height:16px}
.ap-av.chg{animation:apAvC .45s var(--as-sp)}@keyframes apAvC{0%{transform:scale(.6);opacity:0}100%{transform:none;opacity:1}}
.ap-now .w{min-width:0;display:flex;flex-direction:column;line-height:1.55}.ap-now .w b{font-size:12px;font-weight:600}
.ap-now .w span{font-size:11.5px;color:var(--muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ap-now .w span.chg{animation:asRv .35s var(--as-e)}
.ap-ctl{display:flex;align-items:center;gap:6px;margin:10px 14px 0;flex-wrap:wrap}
.ap-ctl>button{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 10px;border:0;border-radius:8px;background:none;box-shadow:inset 0 0 0 1px var(--line2);color:var(--text);font-size:11.5px;cursor:pointer;transition:background .15s,box-shadow .15s,color .15s,transform .12s}
.ap-ctl>button:hover{background:var(--hover)}.ap-ctl>button:active{transform:scale(.96)}.ap-ctl>button svg{width:12px;height:12px}
.ap-ctl>button.pri{background:var(--ivory);color:var(--on-ivory);box-shadow:none}.ap-ctl>button.pri:hover{opacity:.9}
.ap-ctl>button.bad:hover{color:var(--as-bad);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--as-bad) 50%,transparent)}
.ap-spd{position:relative;display:flex;margin-inline-start:auto;padding:2px;border-radius:8px;background:var(--panel2);box-shadow:inset 0 0 0 1px var(--line)}
.ap-spd button{position:relative;z-index:1;height:24px;padding:0 8px;border:0;background:none;color:var(--muted);font-size:10.5px;cursor:pointer;transition:color .2s}.ap-spd button.on{color:var(--text)}
.ap-spd .ind{position:absolute;top:2px;bottom:2px;border-radius:6px;background:var(--as-bg);box-shadow:0 0 0 1px var(--line2);transition:left .3s var(--as-e),width .3s var(--as-e)}
.ap-ctl label{display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--muted);cursor:pointer;width:100%;justify-content:flex-start;margin-top:2px}
.ap-tabs{position:relative;display:flex;gap:18px;margin:14px 14px 0;border-bottom:1px solid var(--line)}
.ap-tabs button{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 1px;border:0;background:none;color:var(--muted);font-size:12px;cursor:pointer;transition:color .2s}
.ap-tabs button:hover,.ap-tabs button.on{color:var(--text)}
.ap-tabs em{font-style:normal;font-size:10px;min-width:18px;height:16px;line-height:16px;padding:0 5px;border-radius:5px;background:var(--panel2);box-shadow:inset 0 0 0 1px var(--line);color:var(--muted);font-variant-numeric:tabular-nums;text-align:center}
.ap-tabs em.bump{animation:asPop .35s var(--as-sp)}
.ap-tabs .ind{position:absolute;bottom:-1px;height:2px;border-radius:2px;background:var(--text);transition:left .3s var(--as-e),width .3s var(--as-e)}
.ap-pane{display:none;padding:10px 14px 0}.ap-pane.on{display:block;animation:asIn .25s var(--as-e)}
.ap-st{list-style:none;margin:0;padding:0}
.ap-st li{position:relative;display:grid;grid-template-columns:20px 16px minmax(0,1fr) auto;align-items:center;gap:9px;min-height:32px;font-size:12px;color:var(--muted);transition:color .25s}
.ap-st li:not(:last-child)::after{content:'';position:absolute;right:9.5px;top:calc(50% + 11px);height:calc(100% - 22px);width:1px;background:var(--line2);transition:background .3s}
.ap-st li.ok:not(:last-child)::after{background:color-mix(in srgb,var(--as-ok) 50%,transparent)}
.ap-st li .d{position:relative;z-index:1;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;font-size:9.5px;font-weight:600;background:var(--as-bg);box-shadow:inset 0 0 0 1px var(--line2);font-variant-numeric:tabular-nums;transition:background .3s,color .3s,box-shadow .3s}
.ap-st li .ic{display:grid;place-items:center;color:var(--faint)}.ap-st li .ic svg{width:13px;height:13px}
.ap-st li>span:nth-child(3){white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ap-st li small{font-size:10.5px;color:var(--faint);max-width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ap-st li.ok,.ap-st li.warn,.ap-st li.run{color:var(--text)}
.ap-st li.ok .d{background:color-mix(in srgb,var(--as-ok) 16%,var(--as-bg));color:var(--as-ok);box-shadow:none;animation:asPop .3s var(--as-sp)}
.ap-st li.warn .d{background:color-mix(in srgb,var(--as-warn) 18%,var(--as-bg));color:var(--as-warn);box-shadow:none}
.ap-st li.skip{opacity:.6}.ap-st li.skip .d{color:var(--faint)}
.ap-st li.stop .d,.ap-st li.fail .d{color:var(--as-bad);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--as-bad) 50%,transparent)}
.ap-st li.run{font-weight:600}.ap-st li.run .d{color:var(--accent);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--accent) 35%,transparent)}
.ap-st li.run .d::after{content:"";position:absolute;inset:-3px;border-radius:50%;border:1.5px solid transparent;border-top-color:var(--accent);animation:asRot .9s linear infinite}
.ap-st li.run .ic{color:var(--accent)}
.ap-vals{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.ap-v{min-width:0;padding:8px 10px;border-radius:10px;box-shadow:inset 0 0 0 1px var(--line);cursor:pointer;transition:background .15s,box-shadow .15s}
.ap-v:hover{background:var(--hover);box-shadow:inset 0 0 0 1px var(--line2)}
.ap-v span{display:flex;justify-content:space-between;gap:6px}.ap-v span i{font-style:normal;font-size:10.5px;color:var(--faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ap-v span em{font-style:normal;font-size:10px;color:var(--accent);opacity:0;transition:opacity .15s;flex:none}.ap-v:hover span em{opacity:1}
.ap-v b{display:block;margin-top:2px;font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-variant-numeric:tabular-nums}
.ap-v.w{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--as-warn) 45%,transparent)}.ap-v.w b{color:var(--as-warn)}
.ap-v.new{animation:apVIn .4s var(--as-e) both,apFl 1.4s ease-out}
@keyframes apVIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes apFl{0%{background:var(--accent-soft)}100%{background:transparent}}
.apx-log>div{display:flex;gap:10px;padding:6px 0;border-bottom:1px solid var(--line);font-size:11.5px;line-height:1.6}
.apx-log>div:first-child{animation:asRv .3s var(--as-e)}
.apx-log time{flex:none;font:10.5px/1.9 ui-monospace,Menlo,monospace;color:var(--faint);direction:ltr}
.apx-log span{display:flex;gap:6px;min-width:0}.apx-log span svg{width:12px;height:12px;color:var(--faint);margin-top:3px;flex:none}
.ap-sum{position:relative;margin:12px 14px 0;padding:14px;border-radius:12px;background:var(--panel2);box-shadow:inset 0 0 0 1px var(--line);animation:asIn .4s var(--as-e)}
.ap-sum .hd{display:flex;gap:12px;align-items:flex-start}
.ap-sum .ck{width:34px;height:34px;flex:none}.ap-sum .ck circle{fill:color-mix(in srgb,var(--as-ok) 14%,transparent);stroke:none}
.ap-sum .ck path{fill:none;stroke:var(--as-ok);stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:40;stroke-dashoffset:40;animation:apDraw .5s var(--as-e) .25s forwards}
.ap-sum.stopped .ck circle{fill:color-mix(in srgb,var(--as-warn) 16%,transparent)}.ap-sum.stopped .ck path{stroke:var(--as-warn)}
@keyframes apDraw{to{stroke-dashoffset:0}}
.ap-sum .hd b{display:block;font-size:13px;font-weight:600;line-height:1.5}.ap-sum .hd p{margin:3px 0 0;font-size:11.5px;line-height:1.8;color:var(--muted)}
.ap-kp{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:12px}
.ap-kp div{padding:8px 4px;border-radius:9px;background:var(--as-bg);box-shadow:inset 0 0 0 1px var(--line);text-align:center;animation:apVIn .35s var(--as-e) both;animation-delay:calc(var(--i,0)*50ms + 150ms)}
.ap-kp b{display:block;font-size:15px;font-weight:600;font-variant-numeric:tabular-nums}.ap-kp span{font-size:10px;color:var(--faint)}
.ap-sum .bt{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px}
.ap-sum .bt button{text-overflow:ellipsis;display:inline-flex;align-items:center;gap:7px;height:32px;padding:0 10px;border:0;border-radius:8px;background:var(--as-bg);box-shadow:inset 0 0 0 1px var(--line2);color:var(--text);font-size:11.5px;cursor:pointer;white-space:nowrap;overflow:hidden;animation:apVIn .3s var(--as-e) both;animation-delay:calc(var(--i,0)*35ms + 250ms);transition:background .15s}
.ap-sum .bt button:hover{background:var(--hover)}.ap-sum .bt button svg{width:13px;height:13px;color:var(--muted)}
.ap-sum .bt button.pri{grid-column:1/-1;justify-content:center;background:var(--ivory);color:var(--on-ivory);box-shadow:none}.ap-sum .bt button.pri svg{color:inherit}
.ap-cf{display:none}
/* ---------- autopilot pre-flight ---------- */
.apx-pre-bg{position:fixed;inset:0;z-index:126;display:grid;place-items:center;padding:20px;background:rgba(0,0,0,.45);backdrop-filter:blur(3px);animation:apFrIn .2s ease both}
[data-theme=light] .apx-pre-bg{background:rgba(30,30,30,.22)}
.apx-pre-bg.out{animation:apFrOut .2s ease forwards}.apx-pre-bg.out .apx-pre{animation:asPanelOut .2s ease forwards}
.apx-pre{width:min(780px,100%);max-height:calc(100vh - 40px);display:flex;flex-direction:column;border-radius:var(--as-r);background:var(--as-bg);color:var(--text);box-shadow:var(--as-sh);overflow:hidden;animation:apPreIn .32s var(--as-e) both}
@keyframes apPreIn{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}
.apx-pre>header{position:relative;padding:18px 20px 16px;border-bottom:1px solid var(--line);flex:none}
.apx-pre .t{display:flex;align-items:center;gap:12px}
.apx-pre .t>span{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:var(--accent-soft);color:var(--accent)}.apx-pre .t>span svg{width:16px;height:16px}
.apx-pre .t div{display:flex;flex-direction:column;line-height:1.45}.apx-pre .t b{font-size:15px;font-weight:600}.apx-pre .t small{font-size:11px;color:var(--muted)}
.apx-pre>header p{margin:12px 0 0;font-size:12px;line-height:1.9;color:var(--muted);max-width:640px}
.apx-pre .xx{position:absolute;top:16px;left:16px;width:30px;height:30px;border:0;border-radius:8px;background:none;color:var(--muted);display:grid;place-items:center;cursor:pointer;transition:background .15s,color .15s}
.apx-pre .xx:hover{background:var(--hover);color:var(--text)}.apx-pre .xx svg{width:15px;height:15px}
.apx-pre .bd{flex:1;overflow:auto;padding:16px 20px 18px}
.apx-pre .bd>*{animation:asRv .35s var(--as-e) both;animation-delay:calc(var(--i,0)*45ms + 60ms)}
.ap-rt{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:16px;padding:14px 16px;border-radius:12px;box-shadow:inset 0 0 0 1px var(--line)}
.ap-rt .n{display:flex;align-items:center;gap:10px}
.ap-rt .n i{width:10px;height:10px;border-radius:50%;box-shadow:0 0 0 3px var(--accent-soft);background:var(--accent);flex:none}.ap-rt .n.d i{background:var(--as-bg);box-shadow:inset 0 0 0 2.5px var(--accent),0 0 0 3px var(--accent-soft)}
.ap-rt .n div{display:flex;flex-direction:column;line-height:1.4}.ap-rt .n b{font-size:13px;font-weight:600}.ap-rt .n small{font-size:10.5px;color:var(--faint)}
.ap-rt .ln{position:relative;height:28px;display:grid;place-items:center}
.ap-rt .ln svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.ap-rt .ln path{fill:none;stroke:var(--line2);stroke-width:1.5;stroke-dasharray:3 4;vector-effect:non-scaling-stroke}
.ap-rt .ln path.f{stroke:var(--accent);stroke-dasharray:1;stroke-dashoffset:1;animation:apDrawL 1.2s var(--as-io) .2s both}
@keyframes apDrawL{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
.ap-rt .ln span{position:relative;font-size:10.5px;color:var(--muted);background:var(--as-bg);padding:0 8px;border-radius:6px;box-shadow:inset 0 0 0 1px var(--line)}
.ap-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:10px}
.ap-kpis div{min-width:0;padding:10px 12px;border-radius:10px;background:var(--panel2);box-shadow:inset 0 0 0 1px var(--line)}
.ap-kpis span{display:block;font-size:10.5px;color:var(--faint)}.ap-kpis b{display:block;margin-top:3px;font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.apx-pre h5{display:flex;align-items:center;justify-content:space-between;margin:20px 0 10px;font-size:12px;font-weight:600;color:var(--text)}
.apx-pre h5 em{font-style:normal;font-weight:400;font-size:11px;color:var(--faint)}
.apx-pre .g{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.apx-pre .g label{display:flex;flex-direction:column;gap:5px;font-size:11px;color:var(--muted);min-width:0}
.apx-pre .g input{height:34px;padding:0 10px;border:0;border-radius:8px;background:var(--panel2);box-shadow:inset 0 0 0 1px var(--line2);color:var(--text);font:12px var(--as-font);outline:0;min-width:0;transition:box-shadow .2s}
.apx-pre .g input::placeholder{color:var(--faint)}
.apx-pre .g input:focus{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--accent) 60%,transparent),0 0 0 3px var(--accent-soft)}
.ap-grp{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px}
.ap-gc{padding:10px;border-radius:12px;box-shadow:inset 0 0 0 1px var(--line)}
.ap-gc header{display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:11.5px;font-weight:600}
.ap-gc header span{width:22px;height:22px;border-radius:6px;display:grid;place-items:center;background:var(--panel2);box-shadow:inset 0 0 0 1px var(--line);color:var(--muted)}.ap-gc header span svg{width:12px;height:12px}
.ap-chip{position:relative;display:flex;align-items:center;gap:8px;min-height:28px;padding:0 6px;border-radius:7px;font-size:11.5px;cursor:pointer;transition:background .15s,color .15s}
.ap-chip:hover{background:var(--hover)}
.ap-chip input{position:absolute;opacity:0;pointer-events:none}
.ap-chip i{width:15px;height:15px;border-radius:5px;display:grid;place-items:center;font-style:normal;font-size:10px;color:transparent;box-shadow:inset 0 0 0 1px var(--line2);flex:none;transition:background .15s,color .15s,box-shadow .15s}
.ap-chip input:checked+i{background:var(--accent);color:#fff;box-shadow:none}
.ap-chip.off{color:var(--faint)}.ap-chip.lock{cursor:default}.ap-chip.lock input+i{opacity:.55}
.ap-chip small{color:var(--faint);font-size:10px}
.apx-pre .nt{display:flex;gap:10px;margin-top:14px;padding:10px 12px;border-radius:10px;background:var(--panel2);box-shadow:inset 0 0 0 1px var(--line);font-size:11.5px;line-height:1.85;color:var(--muted)}
.apx-pre .nt svg{width:14px;height:14px;margin-top:4px;color:var(--faint)}
.apx-pre>footer{display:flex;align-items:center;gap:8px;padding:12px 20px;border-top:1px solid var(--line);flex:none;flex-wrap:wrap}
.apx-pre .go{display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 14px;border:0;border-radius:9px;background:var(--ivory);color:var(--on-ivory);font-size:12px;font-weight:600;cursor:pointer;transition:opacity .15s,transform .12s}
.apx-pre .go:hover{opacity:.9}.apx-pre .go:active{transform:scale(.97)}.apx-pre .go svg{width:12px;height:12px}
.apx-pre .go kbd{color:inherit;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--on-ivory) 30%,transparent);margin:0}
.apx-cn{height:34px;padding:0 12px;border:0;border-radius:9px;background:none;box-shadow:inset 0 0 0 1px var(--line2);color:var(--text);font-size:12px;cursor:pointer;transition:background .15s}.apx-cn:hover{background:var(--hover)}
.apx-pre .est{font-size:11px;color:var(--faint)}
.apx-pre .opt{display:flex;align-items:center;gap:14px;margin-inline-start:auto;font-size:11.5px;color:var(--muted)}
.apx-pre .opt label{display:inline-flex;align-items:center;gap:6px;cursor:pointer}
.apx-pre .opt select{height:28px;padding:0 8px;border:0;border-radius:7px;background:var(--panel2);box-shadow:inset 0 0 0 1px var(--line2);color:var(--text);font:11.5px var(--as-font)}
@media (max-width:720px){.apx-pre .g,.ap-kpis{grid-template-columns:1fr 1fr}.apx-pre .opt{margin-inline-start:0;width:100%}.as-panel{width:calc(100vw - 24px)}.ap-hud{width:calc(100vw - 24px)}}
@keyframes apRingP{0%,100%{opacity:1}50%{opacity:.5}}
/* guards against generic app classes (.ic .n .ln .t .sub .tm .dots .skip .ar) */
.ap-st li .ic{width:auto;font-size:inherit;text-align:initial}
.ap-rt .n{font-family:var(--as-font);font-size:inherit;letter-spacing:0;color:var(--text);font-weight:400}
.ap-rt .ln{width:auto;height:28px;border-radius:0;flex:initial}
.apx-pre .t{color:var(--text);font-size:inherit;font-weight:400;transition:none}
.ap-hd .sub{display:block;margin:0;gap:0}
.ap-hd .tm{gap:0}
.as-think .dots{margin:0}
.ap-st li.skip{margin-top:0;height:auto;pointer-events:auto;font-size:12px}
.as-sug .ar{animation:none!important}
/* ---------- v15.13: autopilot red mode ---------- */
@property --accent{syntax:'<color>';inherits:true;initial-value:#5e9fe8}
@property --accent-soft{syntax:'<color>';inherits:true;initial-value:rgba(94,159,232,.14)}
html{transition:--accent .7s var(--as-io),--accent-soft .7s var(--as-io)}
html.ap-mode{--accent:#e5484d;--accent-soft:rgba(229,72,77,.16);--ap-red:#e5484d}
html.ap-mode[data-theme=light]{--accent:#d93036;--accent-soft:#fdeaea;--ap-red:#d93036}
html.ap-mode.ap-paused{--accent:#e0a84e;--accent-soft:rgba(224,168,78,.16)}
html.ap-mode.ap-paused[data-theme=light]{--accent:#c27c0e;--accent-soft:#fdf1dc}
html.ap-mode .as-fab{box-shadow:0 0 0 1px color-mix(in srgb,var(--accent) 55%,transparent),0 10px 30px -10px color-mix(in srgb,var(--accent) 60%,transparent)}
html.ap-mode .ap-frame{box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--accent) 70%,transparent),inset 0 0 90px -30px color-mix(in srgb,var(--accent) 60%,transparent)}
.ap-frame::before{content:'';position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent 0%,var(--accent) 50%,transparent 100%);background-size:50% 100%;background-repeat:no-repeat;animation:apScan 2.4s var(--as-io) infinite}
.ap-frame.paused::before{animation:none;background:var(--accent);opacity:.6;background-size:100% 100%}
@keyframes apScan{from{background-position:-60% 0}to{background-position:160% 0}}
.ap-sweep{position:fixed;inset:0;z-index:116;pointer-events:none;background:radial-gradient(120% 90% at 50% 100%,rgba(229,72,77,.32) 0%,rgba(229,72,77,.12) 45%,transparent 75%);clip-path:circle(0% at 50% 100%);animation:apSweep 1s var(--as-io) forwards}
.ap-sweep.off{background:radial-gradient(120% 90% at 50% 100%,color-mix(in srgb,var(--text) 10%,transparent),transparent 70%)}
@keyframes apSweep{0%{clip-path:circle(0% at 50% 100%);opacity:1}55%{clip-path:circle(140% at 50% 100%);opacity:1}100%{clip-path:circle(140% at 50% 100%);opacity:0}}
.ap-hud .ap-hd .tt b::after{content:'AUTO';font:700 9px/16px Inter,var(--as-font);letter-spacing:.08em;padding:0 6px;border-radius:5px;color:#fff;background:var(--accent);opacity:0;transform:scale(.8);transition:opacity .3s,transform .3s var(--as-sp)}
html.ap-mode .ap-hud .ap-hd .tt b::after{opacity:1;transform:none}
.ap-st li.flash{animation:apFlash 1.2s ease-out}@keyframes apFlash{0%,40%{background:var(--accent-soft)}100%{background:transparent}}
/* chat panel live strip */
.as-live{display:none;position:relative;align-items:center;gap:8px;margin:10px 14px 0;padding:0 6px 0 10px;padding-inline:10px 6px;height:34px;border-radius:9px;background:var(--accent-soft);color:var(--text);font-size:11px;overflow:hidden;flex:none}
.as-live.on{display:flex;animation:asIn .3s var(--as-e)}
.as-live .lv{position:relative;width:7px;height:7px;border-radius:50%;background:var(--accent);flex:none}.as-live .lv::after{content:'';position:absolute;inset:0;border-radius:50%;background:var(--accent);animation:asPing 1.6s var(--as-e) infinite}
.as-live>span:nth-child(2){color:var(--accent);font-weight:600;white-space:nowrap}
.as-live b{flex:1;min-width:0;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.as-live i{position:absolute;right:0;bottom:0;height:2px;width:var(--p);background:var(--accent);transition:width .6s var(--as-e)}
.as-live button{height:24px;padding:0 9px;border:0;border-radius:7px;background:var(--as-bg);color:var(--text);font-size:10.5px;cursor:pointer;box-shadow:0 0 0 1px var(--line2);flex:none}
/* ---------- v15.13: bottom live timeline ---------- */
.ap-tl{position:fixed;z-index:119;bottom:16px;left:84px;right:calc(var(--nv-w,68px) + 16px);max-width:1180px;margin:0 auto;height:72px;display:flex;align-items:center;gap:18px;padding:0 16px;padding-inline:16px 10px;border-radius:16px;background:var(--as-bg);color:var(--text);box-shadow:var(--as-sh);font-family:var(--as-font);direction:rtl;
 animation:apTlIn .5s var(--as-e) both;transition:height .35s var(--as-e),box-shadow .4s}
.ap-tl.run{box-shadow:0 0 0 1px color-mix(in srgb,var(--accent) 45%,transparent),0 20px 50px -14px rgba(0,0,0,.6),0 0 40px -18px var(--accent)}
.ap-tl.out{animation:apTlOut .3s ease-in forwards;pointer-events:none}
@keyframes apTlIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}@keyframes apTlOut{to{opacity:0;transform:translateY(18px)}}
.ap-tl button{font-family:inherit}
.ap-tl .st{display:flex;align-items:center;gap:10px;width:214px;flex:none;min-width:0}
.ap-tl .st .lv{position:relative;width:8px;height:8px;border-radius:50%;background:var(--faint);flex:none}
.ap-tl.run .st .lv{background:var(--accent)}.ap-tl.run:not(.paused) .st .lv::after{content:'';position:absolute;inset:0;border-radius:50%;background:var(--accent);animation:asPing 1.6s var(--as-e) infinite}
.ap-tl.done .st .lv{background:var(--as-ok)}.ap-tl.stopped .st .lv{background:var(--as-warn)}
.ap-tl .st .tx{display:flex;flex-direction:column;min-width:0;line-height:1.45}
.ap-tl .st small{font-size:10.5px;color:var(--accent);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ap-tl.done .st small{color:var(--as-ok)}.ap-tl.stopped .st small{color:var(--as-warn)}
.ap-tl .st b{font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ap-tl .st b.chg{animation:asRv .35s var(--as-e)}
.ap-tl .trk{position:relative;flex:1;min-width:0;height:52px}
.ap-tl .rail{position:absolute;inset:0 12px}
.ap-tl .ln,.ap-tl .fill{position:absolute;top:19px;height:2px;border-radius:2px}
.ap-tl .ln{left:0;right:0;background:var(--line2)}
.ap-tl .fill{right:0;width:var(--fp,0%);background:var(--accent);transition:width .7s var(--as-e),background .4s;box-shadow:0 0 10px -1px var(--accent)}
.ap-tl.done .fill{background:var(--as-ok);box-shadow:none}
.ap-tl.run:not(.paused) .fill::after{content:'';position:absolute;left:-1px;top:-3px;width:40px;height:8px;border-radius:8px;background:radial-gradient(closest-side,color-mix(in srgb,var(--accent) 80%,#fff),transparent);opacity:.8}
.ap-tl .nds{position:absolute;inset:0}
.ap-tl .nd{position:absolute;top:20px;width:18px;height:18px;margin:-9px -9px 0 0;padding:0;border:0;background:none;cursor:pointer;display:grid;place-items:center;animation:apNdIn .4s var(--as-e) both;animation-delay:calc(var(--i)*22ms + 150ms)}
@keyframes apNdIn{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:none}}
.ap-tl .nd i{width:8px;height:8px;border-radius:50%;background:var(--as-bg);box-shadow:inset 0 0 0 1.5px var(--line2);transition:transform .25s var(--as-sp),background .3s,box-shadow .3s}
.ap-tl .nd:hover i,.ap-tl .nd:focus-visible i{transform:scale(1.5)}
.ap-tl .nd.ok i{background:var(--accent);box-shadow:none}
.ap-tl.done .nd.ok i{background:var(--as-ok)}
.ap-tl .nd.warn i{background:var(--as-warn);box-shadow:none}
.ap-tl .nd.skip i{background:var(--as-bg);box-shadow:inset 0 0 0 1.5px var(--faint);opacity:.7}
.ap-tl .nd.stop i,.ap-tl .nd.fail i{box-shadow:inset 0 0 0 1.5px var(--as-bad)}
.ap-tl .nd.cur i{opacity:0}
.ap-tl .hd{position:absolute;top:20px;width:24px;height:24px;margin:-12px -12px 0 0;border-radius:50%;display:grid;place-items:center;background:var(--accent);color:#fff;pointer-events:none;transition:right .7s var(--as-e),background .4s,opacity .3s,transform .3s var(--as-sp);box-shadow:0 0 0 4px var(--accent-soft),0 4px 14px -4px var(--accent)}
.ap-tl .hd::before{content:'';position:absolute;inset:-4px;border-radius:50%;border:1.5px solid var(--accent);opacity:.6;animation:asPing 1.8s var(--as-e) infinite}
.ap-tl.paused .hd::before{animation:none;opacity:0}
.ap-tl .hd.chg .ic{animation:apAvC .45s var(--as-sp)}
.ap-tl .hd .ic{display:grid;place-items:center}.ap-tl .hd svg{width:12px;height:12px}
.ap-tl.done .hd{opacity:0;transform:scale(.4)}
.ap-tl .grps{position:absolute;left:0;right:0;top:32px;height:16px}
.ap-tl .gp{position:absolute;top:0;height:16px;display:flex;align-items:flex-end;justify-content:center;padding:0 3px;box-sizing:border-box;animation:asIn .4s var(--as-e) both;animation-delay:calc(var(--i)*40ms + 300ms)}
.ap-tl .gp::before{content:'';position:absolute;top:0;left:3px;right:3px;height:1px;background:var(--line);transition:background .3s}
.ap-tl .gp span{font-size:9.5px;color:var(--faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;transition:color .3s}
.ap-tl .gp.on::before{background:var(--accent);height:2px}.ap-tl .gp.on span{color:var(--accent);font-weight:600}
.ap-tl .rt{display:flex;flex-direction:column;align-items:flex-end;line-height:1.35;flex:none;min-width:92px}
.ap-tl .pc{font-size:16px;font-weight:650;font-variant-numeric:tabular-nums}.ap-tl .tm{font-size:10px;color:var(--faint);white-space:nowrap;font-variant-numeric:tabular-nums}
.ap-tl .ct{display:flex;gap:2px;flex:none}
.ap-tl .ct button{width:30px;height:30px;border:0;border-radius:8px;background:none;color:var(--muted);display:grid;place-items:center;cursor:pointer;transition:background .15s,color .15s,transform .3s var(--as-e)}
.ap-tl .ct button:hover{background:var(--hover);color:var(--text)}.ap-tl .ct button svg{width:14px;height:14px}
.ap-tl .ct .pp{background:var(--accent-soft);color:var(--accent)}.ap-tl.done .ct .pp{background:none;color:var(--muted)}
.ap-tl.min{height:44px}.ap-tl.min .grps,.ap-tl.min .st small{display:none}.ap-tl.min .trk{height:40px}.ap-tl.min .ln,.ap-tl.min .fill{top:19px}
.ap-tl.min .mn{transform:rotate(180deg)}
.ap-tlt{position:absolute;bottom:calc(100% + 10px);left:0;min-width:180px;max-width:280px;padding:9px 11px;border-radius:10px;background:var(--as-bg);box-shadow:var(--as-sh);font-size:11px;line-height:1.6;pointer-events:none;opacity:0;transform:translateY(4px);transition:opacity .15s,transform .2s var(--as-e),left .2s var(--as-e)}
.ap-tlt.on{opacity:1;transform:none}
.ap-tlt small{display:block;color:var(--faint);font-size:10px}.ap-tlt b{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;margin:2px 0}.ap-tlt b svg{color:var(--accent)}
.ap-tlt .s{display:inline-flex;align-items:center;gap:5px;color:var(--muted)}.ap-tlt .s i{width:6px;height:6px;border-radius:50%;background:var(--faint)}
.ap-tlt .s-ok i{background:var(--as-ok)}.ap-tlt .s-run i{background:var(--accent)}.ap-tlt .s-warn i{background:var(--as-warn)}.ap-tlt .s-stop i,.ap-tlt .s-fail i{background:var(--as-bad)}
.ap-tlt em{display:block;font-style:normal;color:var(--faint);font-size:10.5px;margin-top:2px}
@media (max-width:900px){.ap-tl .st{width:150px}.ap-tl .gp span{display:none}}
@media (max-width:640px){.ap-tl{left:12px;right:12px;bottom:72px}.ap-tl .st,.ap-tl .rt{display:none}}
@media (prefers-reduced-motion:reduce){.ap-tl,.ap-tl *,.ap-sweep,.ap-frame::before,.as-live,.as-live *{animation:none!important;transition:none!important}html{transition:none}}
.ap-tl .ln{width:auto;flex:initial}
.ap-tl .hd .ic{width:auto;color:inherit;font-size:inherit}
.ap-tl .pc{display:block;margin:0;gap:0}
.ap-tl .tm{display:block;gap:0}
.ap-tl .ct{margin:0;font-size:inherit;color:inherit}
.ap-tlt .s{font-size:11px;padding:0;border-radius:0;background:none}
.ap-tl .gp.nl span{opacity:0}
.ap-tl .gp.nl.on span{opacity:1;position:absolute;bottom:0;max-width:none;padding:0 5px;border-radius:4px;background:var(--as-bg);z-index:1}
/* ---------- repeatable processes ---------- */
.fl-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:12px}
.fl-c{position:relative;border:1px solid var(--line);border-radius:14px;padding:12px 14px;background:var(--as-surf2);margin-bottom:0;overflow:hidden;transition:transform .35s var(--as-sp),box-shadow .3s,border-color .25s;animation:apVIn .5s var(--as-sp) both;animation-delay:calc(var(--i,0)*45ms)}
.fl-c:hover{transform:translateY(-2px);box-shadow:0 14px 30px -18px rgba(0,0,0,.6);border-color:color-mix(in srgb,var(--accent) 35%,transparent)}
.fl-c::before{content:'';position:absolute;right:0;top:0;bottom:0;width:3px;background:var(--line);transition:background .3s}.fl-c.s-ok::before{background:var(--as-ok)}.fl-c.s-failed::before{background:var(--as-bad)}.fl-c.s-stopped::before,.fl-c.s-cancelled::before{background:var(--as-warn)}.fl-c.s-run::before{background:linear-gradient(var(--accent),var(--as-mint));animation:apRingP 1.2s infinite}
.fl-c.off{opacity:.72}.fl-c.tpl::before{display:none}
.fl-h{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.fl-h b{font-size:13.5px}.fl-sp{flex:1}
.fl-ic{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;font-size:17px;background:color-mix(in srgb,var(--accent) 13%,transparent);flex:none;transition:transform .4s var(--as-sp)}.fl-c:hover .fl-ic{transform:rotate(-8deg) scale(1.08)}
.fl-sch{display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--muted);padding:1px 8px;border-radius:999px;background:var(--as-surf2);border:1px solid var(--line)}
.fl-c p{font-size:11.5px;margin:7px 0;line-height:1.85;color:var(--muted)}
.fl-meta{display:flex;flex-wrap:wrap;gap:6px;font-size:11px;color:var(--muted);align-items:center}.fl-meta>span{padding:1px 8px;border-radius:999px;background:var(--as-surf2)}
.fl-act{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px;align-items:center}
.fl-act .sx-btn{transition:transform .25s var(--as-sp)}.fl-act .sx-btn:hover{transform:translateY(-1px)}.fl-act .sx-btn:active{transform:scale(.94)}
.fl-sw{appearance:none;-webkit-appearance:none;width:34px;height:19px;border-radius:999px;background:var(--as-surf3);position:relative;cursor:pointer;transition:background .25s;margin:0;flex:none}
.fl-sw::after{content:'';position:absolute;top:2.5px;right:2.5px;width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.35);transition:right .35s var(--as-sp)}.fl-sw:checked{background:var(--as-ok)}.fl-sw:checked::after{right:17.5px}
.fl-run{margin-top:10px;padding:8px 10px;border-radius:10px;background:color-mix(in srgb,var(--accent) 9%,transparent);border:1px solid color-mix(in srgb,var(--accent) 22%,transparent);font-size:11.5px;animation:asRv .4s var(--as-e)}
.fl-run .br{height:5px;border-radius:9px;background:var(--as-surf3);overflow:hidden;margin-top:6px;position:relative}.fl-run .br i{position:absolute;inset:0 auto 0 0;width:4%;background:linear-gradient(90deg,var(--as-mint),var(--accent));border-radius:9px;transition:width .7s var(--as-e)}
.fl-run .br::after{content:'';position:absolute;inset:0;width:30%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);animation:apBar 1.4s ease-in-out infinite}
.fl-run .rw{display:flex;gap:8px;align-items:center}.fl-run .rw .sp{width:13px;height:13px;border-radius:50%;border:2px solid var(--accent);border-top-color:transparent;animation:asRot .8s linear infinite}.fl-run .rw button{margin-right:auto}
.fl-vars{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 8px;margin:8px 0}.fl-vars input{width:100%;min-width:0;box-sizing:border-box}.fl-vars label{min-width:0;display:flex;flex-direction:column;gap:2px;font-size:11px;color:var(--muted)}
.fl-lgb{margin-top:10px;border-top:1px dashed var(--line);padding-top:10px}.fl-st{display:flex;gap:6px;align-items:center;margin-bottom:8px;font-size:12px}
.fl-log{display:flex;flex-direction:column;gap:0;position:relative}
.fl-step{position:relative;padding:5px 30px 7px 8px;font-size:12px;animation:asRv .45s var(--as-e) both;animation-delay:calc(var(--i,0)*60ms)}
.fl-step::before{content:'';position:absolute;right:10px;top:0;bottom:0;width:2px;background:var(--line)}.fl-step:first-child::before{top:12px}.fl-step:last-child::before{bottom:calc(100% - 12px)}
.fl-step .dt{position:absolute;right:3px;top:6px;width:16px;height:16px;border-radius:50%;display:grid;place-items:center;font-size:9px;color:#fff;background:var(--muted);box-shadow:0 0 0 3px var(--panel-solid)}
.fl-step.ok .dt{background:var(--as-ok)}.fl-step.fail .dt{background:var(--as-bad)}.fl-step.warn .dt,.fl-step.approval .dt,.fl-step.stop .dt{background:var(--as-warn)}.fl-step.skip{opacity:.65}
.fl-step pre{white-space:pre-wrap;direction:ltr;font-size:10.5px;max-height:220px;overflow:auto;margin:4px 0;padding:6px;border-radius:8px;background:var(--as-surf2)}.fl-txt{white-space:pre-wrap;margin-top:4px;line-height:1.85;padding:7px 9px;border-radius:9px;background:var(--as-surf2)}
.fl-step details summary{cursor:pointer;color:var(--muted);font-size:11px}
.fl-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:9px;margin-top:9px}.fl-g label{display:flex;flex-direction:column;gap:3px;font-size:11.5px;color:var(--muted)}.fl-g label.w{grid-column:1/-1}.fl-g label.ck{flex-direction:row;align-items:center;gap:6px}
.fl-g textarea{font:11.5px/1.55 ui-monospace,Menlo,monospace;width:100%;transition:border-color .2s,box-shadow .25s}.fl-g textarea.bad{border-color:var(--as-bad)!important;box-shadow:0 0 0 3px color-mix(in srgb,var(--as-bad) 18%,transparent)}
.fl-g textarea[data-f="prompt"],.fl-g textarea[data-f="text"]{font-family:inherit}.fl-g .er{color:var(--as-bad);font-size:10.5px;min-height:0}
.fl-tl{position:relative;display:flex;flex-direction:column;gap:10px;padding-right:34px}
.fl-tl::before{content:'';position:absolute;right:14px;top:16px;bottom:16px;width:2px;background:linear-gradient(var(--accent),var(--as-mint));opacity:.35;border-radius:2px}
.fl-se{position:relative;border:1px solid var(--line);border-radius:13px;padding:9px 12px;background:var(--as-surf2);transition:transform .3s var(--as-sp),box-shadow .3s,border-color .2s,opacity .2s;animation:apVIn .45s var(--as-sp) both;animation-delay:calc(var(--i,0)*40ms)}
.fl-se:hover{border-color:color-mix(in srgb,var(--accent) 35%,transparent)}.fl-se.dragging{opacity:.45;transform:scale(.98)}.fl-se.over-t{box-shadow:0 -3px 0 0 var(--accent)}.fl-se.over-b{box-shadow:0 3px 0 0 var(--accent)}
.fl-se .nd{position:absolute;right:-31px;top:10px;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:12px;color:#fff;box-shadow:0 0 0 4px var(--panel-solid,#1e1e1e);font-weight:700}
.fl-se.t-tool .nd{background:#3d78d8}.fl-se.t-agent .nd{background:#7a5af5}.fl-se.t-llm .nd{background:#2ea58a}.fl-se.t-notify .nd{background:#d9a53a}.fl-se.t-gate .nd{background:#e97366}
.fl-se .hdl{cursor:grab;color:var(--muted);padding:0 3px;font-size:14px;letter-spacing:-2px;user-select:none}.fl-se .hdl:active{cursor:grabbing}
.fl-se .fl-h input[data-f="title"]{flex:1;min-width:140px}.fl-se .cl{border:0;background:transparent;color:var(--muted);cursor:pointer;transition:transform .3s var(--as-sp)}.fl-se.col .cl{transform:rotate(90deg)}
.fl-se .bx{display:grid;grid-template-rows:1fr;transition:grid-template-rows .4s var(--as-e)}.fl-se.col .bx{grid-template-rows:0fr}.fl-se .bx>div{overflow:hidden}
.fl-refs{display:flex;flex-wrap:wrap;gap:4px;align-items:center;font-size:10.5px;color:var(--muted);grid-column:1/-1}
.fl-refs button{border:1px dashed var(--line);background:transparent;color:var(--accent);border-radius:7px;padding:0 6px;font:10.5px ui-monospace,monospace;direction:ltr;cursor:pointer;transition:background .2s}.fl-refs button:hover{background:color-mix(in srgb,var(--accent) 12%,transparent)}
.fl-add{display:flex;flex-wrap:wrap;gap:6px}.fl-add button{border:1px dashed var(--line);background:transparent;color:var(--text);border-radius:10px;padding:4px 11px;font:inherit;font-size:11.5px;cursor:pointer;display:flex;align-items:center;gap:5px;transition:border-color .2s,transform .25s var(--as-sp),background .2s}
.fl-add button:hover{border-style:solid;border-color:var(--accent);transform:translateY(-1px);background:color-mix(in srgb,var(--accent) 8%,transparent)}.fl-add button i{width:9px;height:9px;border-radius:50%;display:inline-block}
.fl-help{font-size:11.5px;color:var(--muted);line-height:1.9}.fl-help code,.fl-g code{direction:ltr;unicode-bidi:embed;background:var(--as-surf3);padding:0 4px;border-radius:4px}
.fl-dirty{display:inline-flex;align-items:center;gap:5px;font-size:11px;color:var(--as-warn);animation:asRv .3s}.fl-dirty::before{content:'';width:7px;height:7px;border-radius:50%;background:var(--as-warn)}
.fl-added{animation:asPop .45s var(--as-sp)}
@media (prefers-reduced-motion:reduce){.as-fab,.as-pill,.as-panel,.as-m,.as-m *,.as-sug button,.as-empty,.ap-frame,.ap-intro,.ap-intro *,.ap-hud,.ap-wipe,.ap-wipe *,.ap-v,.ap-st li,.ap-st li .d,.ap-kp div,.ap-sum,.ap-sum *,.apx-pre,.apx-pre *,.apx-pre-bg,.ap-badge,.ap-badge *,.ap-pane,.as-think *,.fl-c,.fl-se,.fl-step{animation:none!important;transition:none!important}.ap-sum .ck path{stroke-dashoffset:0}}
`;document.head.appendChild(st)})();
