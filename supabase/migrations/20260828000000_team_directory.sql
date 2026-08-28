-- youB — diretório de equipe, senioridade e estrutura inicial

alter table public.employees add column if not exists seniority text;
alter table public.employees add column if not exists manager_employee_id uuid references public.employees(id) on delete set null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'employees_seniority_check'
      and conrelid = 'public.employees'::regclass
  ) then
    alter table public.employees
      add constraint employees_seniority_check
      check (seniority is null or seniority in ('junior', 'pleno', 'senior'));
  end if;
end $$;

-- Sugestões iniciais para acelerar o cadastro. Cada organização continua livre
-- para criar, editar e remover sua própria estrutura.
insert into public.areas (organization_id, name)
select o.id, v.name
from public.organizations o
cross join (values
  ('Administração'), ('Pessoas & Cultura'), ('Produto'), ('Tecnologia'),
  ('Comercial'), ('Financeiro')
) as v(name)
on conflict (organization_id, name) do nothing;

insert into public.positions (organization_id, name, level)
select o.id, v.name, v.level
from public.organizations o
cross join (values
  ('Assistente', 'Júnior'), ('Analista Júnior', 'Júnior'), ('Analista Pleno', 'Pleno'),
  ('Especialista', 'Sênior'), ('Coordenador', 'Sênior'), ('Gerente', 'Sênior'),
  ('Diretor', 'Executivo')
) as v(name, level)
on conflict (organization_id, name) do nothing;

-- Novas organizações já nascem com as mesmas sugestões disponíveis.
create or replace function public.create_organization(
  p_name text,
  p_slug text default null
)
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org public.organizations;
  v_slug text;
begin
  if auth.uid() is null then
    raise exception 'É necessário estar autenticado para criar uma empresa.' using errcode = '42501';
  end if;

  if nullif(trim(p_name), '') is null then
    raise exception 'O nome da empresa é obrigatório.' using errcode = '22023';
  end if;

  v_slug := lower(trim(coalesce(nullif(p_slug, ''), p_name)));
  v_slug := regexp_replace(v_slug, '[^a-z0-9]+', '-', 'g');
  v_slug := trim(both '-' from v_slug);
  v_slug := left(v_slug, 80);

  if v_slug = '' then
    v_slug := 'org-' || left(auth.uid()::text, 8);
  end if;

  insert into public.organizations (name, slug)
  values (trim(p_name), v_slug)
  returning * into v_org;

  insert into public.memberships (organization_id, user_id, role)
  values (v_org.id, auth.uid(), 'admin_youb');

  insert into public.areas (organization_id, name)
  select v_org.id, v.name
  from (values
    ('Administração'), ('Pessoas & Cultura'), ('Produto'), ('Tecnologia'),
    ('Comercial'), ('Financeiro')
  ) as v(name)
  on conflict (organization_id, name) do nothing;

  insert into public.positions (organization_id, name, level)
  select v_org.id, v.name, v.level
  from (values
    ('Assistente', 'Júnior'), ('Analista Júnior', 'Júnior'), ('Analista Pleno', 'Pleno'),
    ('Especialista', 'Sênior'), ('Coordenador', 'Sênior'), ('Gerente', 'Sênior'),
    ('Diretor', 'Executivo')
  ) as v(name, level)
  on conflict (organization_id, name) do nothing;

  return v_org;
exception
  when unique_violation then
    raise exception 'Já existe uma empresa com este identificador.' using errcode = '23505';
end;
$$;

revoke all on function public.create_organization(text, text) from public;
grant execute on function public.create_organization(text, text) to authenticated;

-- Medidas disciplinares ficam separadas para preservar o histórico do colaborador.
create table if not exists public.disciplinary_actions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  action_type text not null,
  reason text not null,
  notes text,
  applied_at date not null default current_date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  checkin_date date not null default current_date,
  mood smallint not null check (mood between 1 and 5),
  engagement smallint not null check (engagement between 1 and 5),
  energy smallint not null check (energy between 1 and 5),
  workload smallint not null check (workload between 1 and 5),
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (organization_id, employee_id, checkin_date)
);

alter table public.disciplinary_actions enable row level security;
alter table public.checkins enable row level security;

drop policy if exists disciplinary_actions_select_management on public.disciplinary_actions;
create policy disciplinary_actions_select_management on public.disciplinary_actions for select to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor']));
drop policy if exists disciplinary_actions_insert_management on public.disciplinary_actions;
create policy disciplinary_actions_insert_management on public.disciplinary_actions for insert to authenticated
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor']));
drop policy if exists disciplinary_actions_update_management on public.disciplinary_actions;
create policy disciplinary_actions_update_management on public.disciplinary_actions for update to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']))
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));
drop policy if exists disciplinary_actions_delete_management on public.disciplinary_actions;
create policy disciplinary_actions_delete_management on public.disciplinary_actions for delete to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));

drop policy if exists checkins_select_management on public.checkins;
create policy checkins_select_management on public.checkins for select to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor']));
drop policy if exists checkins_insert_management on public.checkins;
create policy checkins_insert_management on public.checkins for insert to authenticated
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor']));
drop policy if exists checkins_update_management on public.checkins;
create policy checkins_update_management on public.checkins for update to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor']))
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor']));
drop policy if exists checkins_delete_management on public.checkins;
create policy checkins_delete_management on public.checkins for delete to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));

grant select, insert, update, delete on public.disciplinary_actions, public.checkins to authenticated;
