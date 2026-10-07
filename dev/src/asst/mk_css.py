d='/data/atlas/src/asst/';css=open(d+'ui.css').read()+open(d+'flows_css.part').read()
css+="""@media (prefers-reduced-motion:reduce){.as-fab,.as-pill,.as-panel,.as-m,.as-m *,.as-sug button,.as-empty,.ap-frame,.ap-intro,.ap-intro *,.ap-hud,.ap-wipe,.ap-wipe *,.ap-v,.ap-st li,.ap-st li .d,.ap-kp div,.ap-sum,.ap-sum *,.apx-pre,.apx-pre *,.apx-pre-bg,.ap-badge,.ap-badge *,.ap-pane,.as-think *,.fl-c,.fl-se,.fl-step{animation:none!important;transition:none!important}.ap-sum .ck path{stroke-dashoffset:0}}\n"""
assert '`' not in css and '${' not in css
open(d+'a_css.js','w').write("/* ===== v15.12: minimal design system + motion for assistant, autopilot and repeatable processes ===== */\n(()=>{const st=document.createElement('style');st.id='asana-assist-css';st.textContent=`\n"+css+"`;document.head.appendChild(st)})();\n")
print('CSS_OK',len(css))
