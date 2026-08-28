-- Workflow de aprovação: líder aplica; facilitador é opcional; RH pode ser etapa final.
alter table public.disciplinary_actions
  add column if not exists approval_status text not null default 'approved';

create table if not exists public.disciplinary_action_approvals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  action_id uuid not null references public.disciplinary_actions(id) on delete cascade,
  approver_type text not null check (approver_type in ('facilitador', 'rh')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  note text,
  reviewed_by uuid references auth.users(id) on delete set null default auth.uid(),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (action_id, approver_type)
);

alter table public.disciplinary_action_approvals enable row level security;

drop policy if exists disciplinary_action_approvals_select_management on public.disciplinary_action_approvals;
create policy disciplinary_action_approvals_select_management on public.disciplinary_action_approvals for select to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor']));
drop policy if exists disciplinary_action_approvals_insert_management on public.disciplinary_action_approvals;
create policy disciplinary_action_approvals_insert_management on public.disciplinary_action_approvals for insert to authenticated
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor']));
drop policy if exists disciplinary_action_approvals_update_management on public.disciplinary_action_approvals;
create policy disciplinary_action_approvals_update_management on public.disciplinary_action_approvals for update to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor']))
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor']));

drop policy if exists disciplinary_actions_update_workflow on public.disciplinary_actions;
create policy disciplinary_actions_update_workflow on public.disciplinary_actions for update to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor']))
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor']));

grant select, insert, update on public.disciplinary_action_approvals to authenticated;
