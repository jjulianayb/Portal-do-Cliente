-- A etapa intermediária recebe o nome usado por cada empresa (BP, facilitador, comitê etc.).
alter table public.disciplinary_policies
  add column if not exists requires_intermediate_approval boolean not null default false;
alter table public.disciplinary_policies
  add column if not exists intermediate_approver_label text;

update public.disciplinary_policies
set requires_intermediate_approval = true,
    intermediate_approver_label = coalesce(intermediate_approver_label, 'Facilitador')
where requires_facilitator_approval = true;

alter table public.disciplinary_action_approvals add column if not exists approver_label text;
alter table public.disciplinary_action_approvals drop constraint if exists disciplinary_action_approvals_approver_type_check;
update public.disciplinary_action_approvals set approver_type = 'intermediario' where approver_type = 'facilitador';
alter table public.disciplinary_action_approvals
  add constraint disciplinary_action_approvals_approver_type_check
  check (approver_type in ('intermediario', 'rh'));
