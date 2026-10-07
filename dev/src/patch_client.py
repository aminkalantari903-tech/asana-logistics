h=open('ifa/public/index.html').read()
def hrep(a,b,cnt=1):
    global h
    assert h.count(a)==cnt,(a[:80],h.count(a)); h=h.replace(a,b)
lc=open('src/live-client.js').read()
end="window.__STUDIO.nav={go:nvGo,all:nvAll,groups:()=>NAV.map(g=>({id:g.k,name:g.n,items:g.items.map(k=>({id:k,name:itName(k)}))}))};\n"
hrep(end,end+lc)
hrep("const NCH={log:'فقط ثبت (آزمایشی)',bale:'پیام‌رسان بله',telegram:'تلگرام',sms:'پیامک (کاوه‌نگار)',webhook:'وب‌هوک'};",
     "const NCH={log:'فقط ثبت (آزمایشی)',bale:'پیام‌رسان بله',telegram:'تلگرام',sms:'پیامک (کاوه‌نگار)',email:'ایمیل (SMTP)',webhook:'وب‌هوک'};")
hrep("'job.status':['تغییر وضعیت پرونده','پروندهٔ {{ref}}: {{status}}'],'*':",
     "'job.status':['تغییر وضعیت پرونده','پروندهٔ {{ref}}: {{status}}'],'road.alert':['هشدار زندهٔ جاده (آب‌وهوا)','⚠️ {{route}}: {{alerts}}'],'quote.received':['دریافت پیشنهاد قیمت آنلاین','💬 پیشنهاد {{company}} برای {{route}}: {{usd}} دلار · {{days}} روز (انحراف از مدل {{deviation}})'],'fx.jump':['جهش نرخ دلار بازار آزاد','💱 دلار بازار آزاد: {{rate}} ریال ({{pct}}٪ نسبت به {{prev}})'],'*':")
hrep("<small>فاصلهٔ جاده‌ای تقریبی (خط مستقیم × ۱٫۲۵) — در صورت داشتن فاصلهٔ دقیق، وارد کنید</small>",
     "<small>${window.__ifaKm&&window.__ifaKm()?'فاصلهٔ جاده‌ای واقعی از مسیریاب ('+esc(window.__ifaKm())+') — در صورت نیاز، فاصلهٔ دقیق را وارد کنید':'فاصلهٔ جاده‌ای تقریبی (خط مستقیم × ۱٫۲۵) — در صورت داشتن فاصلهٔ دقیق، وارد کنید'}</small>")
hrep("${km?'فاصلهٔ جاده‌ای تقریبی '+fa(nf(km))+' km':''}","${km?(window.__ifaKm&&window.__ifaKm()?'فاصلهٔ جاده‌ای ':'فاصلهٔ جاده‌ای تقریبی ')+fa(nf(km))+' km':''}")
oldnote="<p class=\"sx-note\">نرخ‌ها از سرویس عمومی open.er-api.com (نرخ‌های بین‌بانکی روزانه) دریافت و ۶ ساعت ذخیره می‌شوند. نرخ ریال در بازار آزاد با نرخ رسمی تفاوت زیادی دارد؛ عدد بازار را دستی وارد کنید. «اعمال روی موتور» نرخ‌های EUR و IRR را در محاسبه‌های بعدی اطلس جایگزین می‌کند.</p>"
inner=oldnote[len('<p class="sx-note">'):-len('</p>')]
hrep(oldnote,"<p class=\"sx-note\">${d&&d.live?'نرخ‌ها از هاب زندهٔ سرور ('+esc(d.src.replace(/^https?:\\/\\//,''))+') هر ۱۰ دقیقه به‌روز می‌شوند'+(d.market&&d.market.USD?'؛ دلار بازار آزاد ('+nf(d.market.USD)+' ریال، '+esc(d.market.src)+') خودکار در «نرخ بازار آزاد» و مالی اعمال می‌شود':'')+'. «اعمال روی موتور» نرخ‌های EUR و IRR را در محاسبه‌های بعدی اطلس جایگزین می‌کند.':'"+inner+"'}</p>")
i=h.find("$('.rf-mail',b).onclick=");j=h.find("\n $('.rf-cp',b).onclick=",i)
old=h[i:j]; assert old.count('location.href')==1
new="""$('.rf-mail',b).onclick=async()=>{const sel=P.filter(p=>RFQ.sel.has(p.id)&&p.mail);const to=sel.map(p=>p.mail);if(!to.length)return toast('گیرنده‌ای با ایمیل انتخاب نشده');const t=rfqText(C,src,'en');const sub=t.split('\\n')[0].replace('Subject: ','');let link='';
  if(svCan('rfq.send')){const bt=$('.rf-mail',b);bt.disabled=true;try{const r=await svApi('/api/rfq',{method:'POST',body:{title:sub,text:rfqText(C,src,RFQ.lang).split('\\n').filter(l=>!/^Subject: /.test(l)).join('\\n').trim(),route:src.name,model,days:mdays,validDays:RFQ.valid,recipients:sel.map(p=>({name:p.n,email:p.mail})),send:true}});
    emit('rfq.sent',{recipients:to.length,route:src.name,online:r.id});if(r.emailed){bt.disabled=false;toast(fa(r.emailed)+' استعلام با پیوند پاسخ آنلاین از سرور ایمیل شد · پاسخ‌ها خودکار در جدول پیشنهادها می‌نشیند');return}link=r.open.url}catch(e){toast(e.message)}bt.disabled=false}
  location.href='mailto:?bcc='+encodeURIComponent(to.join(','))+'&subject='+encodeURIComponent(sub)+'&body='+encodeURIComponent(t.split('\\n').slice(2).join('\\n')+(link?'\\n\\n————————\\nSubmit your quotation online / ثبت آنلاین پیشنهاد قیمت:\\n'+link+'\\n':''));if(!link)emit('rfq.sent',{recipients:to.length,route:src.name})};"""
h=h[:i]+new+h[j:]
import re,base64
m=re.search(r"(SRVJS\s*=\s*['\"`])([A-Za-z0-9+/=]+)(['\"`])",h)
h=h[:m.start(2)]+base64.b64encode(open('ifa/server.js','rb').read()).decode()+h[m.end(2):]
open('ifa/public/index.html','w').write(h);print('client patched')
