-- 유저 프로필 (Supabase Auth 확장)
create table profiles (
  id          uuid references auth.users primary key,
  name        text,
  phone       text,
  role        text default 'customer' check (role in ('customer', 'owner')),
  created_at  timestamptz default now()
);

-- 가게
create table restaurants (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid references profiles(id) on delete cascade,
  name         text not null,
  address      text not null,
  lat          numeric(10, 7) not null,
  lng          numeric(10, 7) not null,
  corkage_fee  integer not null,
  max_tables   integer default 5,
  description  text,
  image_url    text,
  is_active    boolean default true,
  created_at   timestamptz default now()
);

-- 예약
create table reservations (
  id             uuid primary key default gen_random_uuid(),
  customer_id    uuid references profiles(id) on delete set null,
  restaurant_id  uuid references restaurants(id) on delete cascade,
  reserved_at    timestamptz not null,
  party_size     integer not null check (party_size > 0),
  status         text default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  payment_key    text,
  payment_amount integer,
  memo           text,
  created_at     timestamptz default now()
);

-- RLS 정책
alter table profiles enable row level security;
alter table restaurants enable row level security;
alter table reservations enable row level security;

-- profiles: 본인만 조회·수정
create policy "profiles_self" on profiles
  for all using (auth.uid() = id);

-- restaurants: 누구나 조회, 사장님만 수정
create policy "restaurants_read" on restaurants
  for select using (true);
create policy "restaurants_owner_write" on restaurants
  for all using (auth.uid() = owner_id);

-- reservations: 본인 예약만 조회, 사장님은 자기 가게 예약 조회
create policy "reservations_customer" on reservations
  for all using (auth.uid() = customer_id);
create policy "reservations_owner_read" on reservations
  for select using (
    exists (
      select 1 from restaurants r
      where r.id = restaurant_id and r.owner_id = auth.uid()
    )
  );

-- 유저 가입 시 자동으로 프로필을 생성하는 함수 및 트리거
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'customer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
