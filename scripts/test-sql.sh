#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:=postgresql://postgres:postgres@127.0.0.1:5432/postgres}"
repo_root="$(cd "$(dirname "$0")/.." && pwd)"
psql_cmd=(psql "$DATABASE_URL" -v ON_ERROR_STOP=1)

"${psql_cmd[@]}" <<'SQL'
create extension if not exists pgcrypto;
create schema if not exists auth;
drop role if exists authenticated;
drop role if exists anon;
drop role if exists service_role;
create role authenticated;
create role anon;
create role service_role;
create table if not exists auth.users(id uuid primary key,email text,created_at timestamptz not null default now());
truncate auth.users;
create or replace function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
create or replace function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
grant usage on schema auth to authenticated,anon,service_role;
grant execute on function auth.uid(),auth.jwt() to authenticated,anon,service_role;
insert into auth.users(id,email,created_at) values
 ('10000000-0000-0000-0000-000000000001','admin@example.invalid','2026-01-01'),
 ('10000000-0000-0000-0000-000000000002','rh@example.invalid','2026-01-02'),
 ('10000000-0000-0000-0000-000000000003','diretoria@example.invalid','2026-01-03'),
 ('10000000-0000-0000-0000-000000000004','gestor@example.invalid','2026-01-04'),
 ('10000000-0000-0000-0000-000000000005','colaborador@example.invalid','2026-01-05'),
 ('10000000-0000-0000-0000-000000000006','sem-employee@example.invalid','2026-01-06');
SQL

count=0
for migration in "$repo_root"/supabase/migrations/*.sql; do
  psql_cmd+=( -f "$migration" )
  "${psql_cmd[@]}" >/dev/null
  psql_cmd=(psql "$DATABASE_URL" -v ON_ERROR_STOP=1)
  count=$((count+1))
done
echo "MIGRATIONS_PASS=$count"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$repo_root/supabase/tests/classic_dho_access_v1.sql" >/dev/null
echo "CLASSIC_SQL_SUITE=PASS"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$repo_root/supabase/tests/competency_cycle_assessment_v1.sql" >/dev/null
echo "CCA_SQL_SUITE=PASS"
