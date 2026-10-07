-- FORMA: безпечний доступ до адмінських операцій
-- 1) Встав сюди EMAIL, який ти щойно створив у Authentication -> Users.
-- 2) Виконай весь SQL одним запуском.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Адміністратор може бачити лише свій запис у списку адмінів.
drop policy if exists "Admins can view own admin record" on public.admin_users;
create policy "Admins can view own admin record"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

-- Додай свого користувача. ЗАМІНИ email@example.com на свій email.
insert into public.admin_users (user_id)
select id
from auth.users
where email = 'email@example.com'
on conflict (user_id) do nothing;

-- Публічне читання товарів для магазину.
drop policy if exists "Products are publicly readable" on public.products;

create policy "Products are publicly readable"
on public.products
for select
to anon, authenticated
using (true);

-- Тільки користувачі з admin_users можуть змінювати товари.
drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
on public.products
for insert
to authenticated
with check (
  exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid()
  )
);

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
on public.products
for update
to authenticated
using (
  exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid()
  )
);

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
on public.products
for delete
to authenticated
using (
  exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid()
  )
);

-- Перевірка: після заміни email цей запит має повернути 1.
select count(*) as admin_count from public.admin_users;
