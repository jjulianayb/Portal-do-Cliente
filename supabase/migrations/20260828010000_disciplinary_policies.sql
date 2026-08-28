-- Regras disciplinares configuráveis por organização.
create table if not exists public.disciplinary_policies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  sequence_order integer not null default 1 check (sequence_order > 0),
  requires_hr_approval boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.disciplinary_actions add column if not exists policy_id uuid references public.disciplinary_policies(id) on delete set null;
alter table public.disciplinary_policies enable row level security;

drop policy if exists disciplinary_policies_select_management on public.disciplinary_policies;
create policy disciplinary_policies_select_management on public.disciplinary_policies for select to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor']));
drop policy if exists disciplinary_policies_insert_management on public.disciplinary_policies;
create policy disciplinary_policies_insert_management on public.disciplinary_policies for insert to authenticated
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));
drop policy if exists disciplinary_policies_update_management on public.disciplinary_policies;
create policy disciplinary_policies_update_management on public.disciplinary_policies for update to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']))
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));
drop policy if exists disciplinary_policies_delete_management on public.disciplinary_policies;
create policy disciplinary_policies_delete_management on public.disciplinary_policies for delete to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));
grant select, insert, update, delete on public.disciplinary_policies to authenticated;
