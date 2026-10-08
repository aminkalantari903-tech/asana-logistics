# v15.10.0: floating page assistant + autopilot + repeatable flows UI
p='/data/atlas/ifa/public/index.html';s=open(p,encoding='utf8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:80]);s=s.replace(a,b)
mods=['shared/calc.js','asst/a_css.js','asst/b_assist.js','asst/c_auto.js','asst/c_stages.js','asst/e_hud.js','asst/f_saveflow.js','asst/d_flows.js','asst/h_tl.js','asst/i_brain.js','asst/j_mobile.js','asst/k_conn.js','shared/inv.js','asst/l_actual.js','asst/m_iran.js','asst/n_ap2.js','asst/g_expose.js']
code='\n'.join(open('/data/atlas/src/'+m,encoding='utf8').read() for m in mods)

assert '</script' not in code.lower()
A='/* ===== v15.2: live connections'
rep(A,'/* ===== v15.10: assistant, autopilot, flows ===== */\n'+code+'\n'+A)
rep("['routes','کریدورها'],","['flow','فرایندهای تکرارپذیر'],['routes','کریدورها'],")
rep("routes:agRoutes,","routes:agRoutes,flow:agFlows,")
rep(" else if(sheet)e.stopImmediatePropagation()},true);"," else if(sheet&&!(typeof AP!=='undefined'&&AP.run))e.stopImmediatePropagation()},true);")
rep(" if(wrap)e.stopImmediatePropagation()},true);"," if(wrap&&!(typeof AP!=='undefined'&&AP.run))e.stopImmediatePropagation()},true);")
rep("IFA={version:'15.9.3',","IFA={version:'15.18.0',")
open(p,'w',encoding='utf8').write(s);print('ASSIST_OK')
