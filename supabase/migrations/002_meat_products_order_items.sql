-- 정육단 상품 카탈로그 (고기맵에서 직접 관리)
create table meat_products (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  price        integer not null,
  unit         text not null,         -- '100g', '1팩' 등
  image_url    text,
  is_available boolean default true,
  created_at   timestamptz default now()
);

-- 예약별 주문 항목
create table order_items (
  id             uuid primary key default gen_random_uuid(),
  reservation_id uuid references reservations(id) on delete cascade,
  product_id     uuid references meat_products(id),
  quantity       integer not null check (quantity > 0),
  unit_price     integer not null,    -- 주문 시점 가격 스냅샷
  created_at     timestamptz default now()
);

-- RLS
alter table meat_products enable row level security;
create policy "meat_products_read" on meat_products
  for select using (true);

alter table order_items enable row level security;
create policy "order_items_customer" on order_items
  for all using (
    exists (
      select 1 from reservations r
      where r.id = reservation_id and r.customer_id = auth.uid()
    )
  );
create policy "order_items_owner_read" on order_items
  for select using (
    exists (
      select 1 from reservations rv
      join restaurants r on r.id = rv.restaurant_id
      where rv.id = reservation_id and r.owner_id = auth.uid()
    )
  );
