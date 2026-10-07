# منبع ساخت (dev)

- `src/asst/` — ماژول‌های دستیار شناور، اجرای خودکار، خط زمانی زنده و فرایندهای تکرارپذیر (`ui.css` + `mk_css.py` → `a_css.js`).
- `src/p5/`، `src/shared/` — ماژول‌های سرور؛ `apply_p5.sh` آن‌ها را در `server.js` ادغام می‌کند.
- `src/patch_*.py`، `*-client.js` — وصله‌های مرحله‌ای کلاینت؛ `build.sh` همه را روی فایل پایهٔ `index.v153.html` اعمال و `public/index.html` را می‌سازد.

فایل پایهٔ `index.v153.html` (حدود ۹ مگابایت) در مخزن نیست؛ خروجی نهایی ساخت همان `public/index.html` است که با `npm run restore` بازسازی می‌شود.
