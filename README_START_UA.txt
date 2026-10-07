FORMA — ЧИСТИЙ ЗАПУСК

1. У GitHub завантаж УСІ файли з цього архіву в КОРІНЬ репозиторію:
   index.html, app.js, style.css, admin.html, admin.js, admin.css, .nojekyll,
   папки .github та supabase.

2. GitHub Pages:
   Settings -> Pages -> Deploy from a branch -> main -> /(root).

3. Supabase:
   SQL Editor -> New query -> відкрий supabase/setup.sql.
   ПЕРЕД Run заміни:
     email@example.com
   на email користувача, якого створиш у Authentication -> Users.
   Потім Run.

4. Якщо користувача ще нема:
   Authentication -> Users -> Add user -> створи email/password.
   Після цього знову запусти setup.sql із правильним email.

5. Магазин:
   https://YOUR_USERNAME.github.io/FORMABot/

6. Адмінка:
   https://YOUR_USERNAME.github.io/FORMABot/admin.html

Supabase:
Project URL:
https://qdcnzraotcfdupmnapqo.supabase.co

У frontend використовується тільки publishable key. Secret/service_role key у файлах немає.

Telegram:
Bot: @StoreFORMA_bot
Manager: @Sundayass
