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
