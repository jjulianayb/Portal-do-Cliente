-- A aprovação intermediária é opcional e pode ser ativada por regra.
alter table public.disciplinary_policies
  add column if not exists requires_facilitator_approval boolean not null default false;
