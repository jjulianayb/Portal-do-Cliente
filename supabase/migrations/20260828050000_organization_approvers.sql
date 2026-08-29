-- Responsáveis intermediários variam por empresa e podem ser BP, facilitador, comitê etc.
create table if not exists public.organization_approvers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  approver_label text not null,
  email text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, approver_label, email)
);

alter table public.organization_approvers enable row level security;
create policy organization_approvers_select_management on public.organization_approvers for select to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor']));
create policy organization_approvers_insert_admin on public.organization_approvers for insert to authenticated
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));
create policy organization_approvers_update_admin on public.organization_approvers for update to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']))
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));
create policy organization_approvers_delete_admin on public.organization_approvers for delete to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));

grant select, insert, update, delete on public.organization_approvers to authenticated;

-- A aprovação intermediária só pode ser concluída pelo e-mail autorizado para aquela função.
drop policy if exists disciplinary_action_approvals_update_management on public.disciplinary_action_approvals;
create policy disciplinary_action_approvals_update_management on public.disciplinary_action_approvals for update to authenticated
using (
  (approver_type = 'rh' and public.has_org_role(organization_id, array['admin_youb','diretoria','rh']))
  or
  (approver_type = 'intermediario' and exists (
    select 1 from public.organization_approvers oa
    where oa.organization_id = disciplinary_action_approvals.organization_id
      and oa.approver_label = disciplinary_action_approvals.approver_label
      and lower(oa.email) = lower(coalesce(auth.jwt()->>'email', ''))
      and oa.active = true
  ))
)
with check (
  (approver_type = 'rh' and public.has_org_role(organization_id, array['admin_youb','diretoria','rh']))
  or
  (approver_type = 'intermediario' and exists (
    select 1 from public.organization_approvers oa
    where oa.organization_id = disciplinary_action_approvals.organization_id
      and oa.approver_label = disciplinary_action_approvals.approver_label
      and lower(oa.email) = lower(coalesce(auth.jwt()->>'email', ''))
      and oa.active = true
  ))
);
