-- 이 스크립트는 이미 가입했지만 profiles 테이블에 데이터가 없는 기존 유저들을 복구하기 위한 스크립트입니다.
-- 001_initial_schema.sql 에 트리거가 추가되기 전에 가입한 유저들을 위해 한 번만 실행하면 됩니다.

insert into public.profiles (id, name, role)
select 
  id, 
  coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'User'), 
  'customer'
from auth.users
on conflict (id) do nothing;