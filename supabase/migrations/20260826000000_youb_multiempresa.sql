-- youB SaaS multiempresa — schema inicial MVP
-- Executar no projeto Supabase: youB Multiempresa

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan text not null default 'essencial' check (plan in ('essencial','estrategico','enterprise')),
  status text not null default 'active' check (status in ('active','suspended')),
  created_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin_youb','diretoria','rh','gestor','colaborador')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists public.areas (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table if not exists public.positions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  level text,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  auth_user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text,
  area_id uuid references public.areas(id) on delete set null,
  position_id uuid references public.positions(id) on delete set null,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now()
);

create table if not exists public.competencies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table if not exists public.cycles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  cycle_type text not null default 'performance',
  starts_at date,
  ends_at date,
  status text not null default 'draft' check (status in ('draft','active','closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  cycle_id uuid not null references public.cycles(id) on delete cascade,
  subject_employee_id uuid not null references public.employees(id) on delete cascade,
  evaluator_employee_id uuid references public.employees(id) on delete set null,
  scores jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  author_employee_id uuid references public.employees(id) on delete set null,
  target_employee_id uuid not null references public.employees(id) on delete cascade,
  cycle_id uuid references public.cycles(id) on delete set null,
  content text not null,
  visibility text not null default 'private' check (visibility in ('private','manager','hr')),
  created_at timestamptz not null default now()
);

create table if not exists public.pdis (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  cycle_id uuid references public.cycles(id) on delete set null,
  objective text not null,
  actions jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft','active','completed','cancelled')),
  due_date date,
  created_at timestamptz not null default now()
);

create index if not exists idx_memberships_user on public.memberships(user_id);
create index if not exists idx_memberships_org on public.memberships(organization_id);
create index if not exists idx_employees_org on public.employees(organization_id);
create index if not exists idx_cycles_org on public.cycles(organization_id);
create index if not exists idx_assessments_org on public.assessments(organization_id);
create index if not exists idx_feedbacks_org on public.feedbacks(organization_id);
create index if not exists idx_pdis_org on public.pdis(organization_id);

create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships m
    where m.organization_id = target_org and m.user_id = auth.uid()
  );
$$;

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.areas enable row level security;
alter table public.positions enable row level security;
alter table public.employees enable row level security;
alter table public.competencies enable row level security;
alter table public.cycles enable row level security;
alter table public.assessments enable row level security;
alter table public.feedbacks enable row level security;
alter table public.pdis enable row level security;

-- Organizações: usuário vê apenas as organizações das quais participa.
drop policy if exists organizations_select_member on public.organizations;
create policy organizations_select_member on public.organizations
for select to authenticated using (public.is_org_member(id));

drop policy if exists memberships_select_self on public.memberships;
create policy memberships_select_self on public.memberships
for select to authenticated using (user_id = auth.uid() or public.is_org_member(organization_id));

-- Leitura para membros. Escrita será refinada no backend por papel.
drop policy if exists areas_member_select on public.areas;
create policy areas_member_select on public.areas
for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists positions_member_select on public.positions;
create policy positions_member_select on public.positions
for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists employees_member_select on public.employees;
create policy employees_member_select on public.employees
for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists competencies_member_select on public.competencies;
create policy competencies_member_select on public.competencies
for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists cycles_member_select on public.cycles;
create policy cycles_member_select on public.cycles
for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists assessments_member_select on public.assessments;
create policy assessments_member_select on public.assessments
for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists feedbacks_member_select on public.feedbacks;
create policy feedbacks_member_select on public.feedbacks
for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists pdis_member_select on public.pdis;
create policy pdis_member_select on public.pdis
for select to authenticated using (public.is_org_member(organization_id));

-- Escrita temporariamente restrita a membros; regras por papel entram no backend.
drop policy if exists areas_member_insert on public.areas;
create policy areas_member_insert on public.areas
for insert to authenticated with check (public.is_org_member(organization_id));
drop policy if exists positions_member_insert on public.positions;
create policy positions_member_insert on public.positions
for insert to authenticated with check (public.is_org_member(organization_id));
drop policy if exists employees_member_insert on public.employees;
create policy employees_member_insert on public.employees
for insert to authenticated with check (public.is_org_member(organization_id));
drop policy if exists competencies_member_insert on public.competencies;
create policy competencies_member_insert on public.competencies
for insert to authenticated with check (public.is_org_member(organization_id));
drop policy if exists cycles_member_insert on public.cycles;
create policy cycles_member_insert on public.cycles
for insert to authenticated with check (public.is_org_member(organization_id));
drop policy if exists assessments_member_insert on public.assessments;
create policy assessments_member_insert on public.assessments
for insert to authenticated with check (public.is_org_member(organization_id));
drop policy if exists feedbacks_member_insert on public.feedbacks;
create policy feedbacks_member_insert on public.feedbacks
for insert to authenticated with check (public.is_org_member(organization_id));
drop policy if exists pdis_member_insert on public.pdis;
create policy pdis_member_insert on public.pdis
for insert to authenticated with check (public.is_org_member(organization_id));
