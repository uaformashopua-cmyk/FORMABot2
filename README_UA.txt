FORMA — ПОВНИЙ ПАКЕТ ДЛЯ GITHUB + SUPABASE

ЩО Є В АРХІВІ
----------------
index.html       — магазин
style.css        — дизайн магазину
app.js           — логіка магазину + Supabase
admin.html       — адмін-панель
admin.css        — дизайн адмінки
admin.js         — логіка адмінки + Supabase Auth
.nojekyll        — статична публікація GitHub Pages
.github/workflows/telegram-post.yml — пост у Telegram з кнопкою
supabase/setup.sql — схема БД + RLS + підключення адміна
supabase/admin_rls.sql — окремий SQL для RLS адмінки

GITHUB
------
1. Відкрий репозиторій forma212/FORMABot.
2. Переключись на гілку FORMA.
3. Завантаж файли з цього архіву в КОРІНЬ репозиторію.
4. Існуючі index.html, style.css, app.js, admin.html, admin.css, admin.js заміни файлами з архіву.
5. Папку .github/workflows завантаж також, якщо хочеш використовувати кнопку публікації посту в Telegram.
6. Не видаляй GitHub Pages і не змінюй Source, якщо сайт уже публікується з гілки FORMA.

SUPABASE
--------
Проєкт уже прописаний у app.js/admin.js.
Використовується тільки publishable key. Secret/service_role key у коді НЕ потрібен.

Якщо база/політики були зламані:
1. Supabase -> SQL Editor.
2. Відкрий supabase/setup.sql.
3. ЗАМІНИ email@example.com на email користувача, якого створив у Authentication -> Users.
4. Запусти весь SQL.
5. Внизу запиту має бути admin_count = 1.

ВАЖЛИВО: setup.sql НЕ видаляє існуючі товари.

АДМІНКА
-------
https://forma212.github.io/FORMABot/admin.html

Після входу можна без коду:
- додавати товари;
- редагувати назву, ціну, фото та характеристики;
- змінювати наявність;
- видаляти товари.

КАТЕГОРІЇ
---------
iPhone -> category = iphone
PC     -> category = pc

ФОТО
----
У поле image вставляється пряме HTTPS-посилання на зображення.

TELEGRAM
--------
Workflow використовує GitHub Secret:
TELEGRAM_BOT_TOKEN

Сам токен у файли НЕ вставляти.
Кнопка відкриває:
https://t.me/StoreFORMA_bot?startapp

БЕЗПЕКА
-------
Ніколи не вставляй Supabase secret/service_role key у app.js або admin.js.
Не публікуй TELEGRAM_BOT_TOKEN у коді, README, скріншотах або чаті.
