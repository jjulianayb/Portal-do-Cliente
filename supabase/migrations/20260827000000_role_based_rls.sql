-- youB — RLS por papel e isolamento multiempresa
-- Aplicar depois de 20260826010000_onboarding_rpc.sql.

create or replace function public.has_org_role(target_org uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    where m.organization_id = target_org
      and m.user_id = auth.uid()
      and m.role = any(allowed_roles)
  );
$$;

grant execute on function public.has_org_role(uuid, text[]) to authenticated;

create or replace function public.is_org_employee(target_org uuid, target_employee uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.employees e
    where e.id = target_employee
      and e.organization_id = target_org
      and e.auth_user_id = auth.uid()
  );
$$;

grant execute on function public.is_org_employee(uuid, uuid) to authenticated;

-- A organização só pode ser alterada por admin_youb ou diretoria.
drop policy if exists organizations_update_admin on public.organizations;
create policy organizations_update_admin on public.organizations
for update to authenticated
using (public.has_org_role(id, array['admin_youb','diretoria']))
with check (public.has_org_role(id, array['admin_youb','diretoria']));

drop policy if exists organizations_delete_admin on public.organizations;
create policy organizations_delete_admin on public.organizations
for delete to authenticated
using (public.has_org_role(id, array['admin_youb']));

-- Vínculos e papéis são administrados por admin_youb ou diretoria.
drop policy if exists memberships_insert_admin on public.memberships;
create policy memberships_insert_admin on public.memberships
for insert to authenticated
with check (public.has_org_role(organization_id, array['admin_youb','diretoria']));

drop policy if exists memberships_update_admin on public.memberships;
create policy memberships_update_admin on public.memberships
for update to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria']))
with check (public.has_org_role(organization_id, array['admin_youb','diretoria']));

drop policy if exists memberships_delete_admin on public.memberships;
create policy memberships_delete_admin on public.memberships
for delete to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria']));

-- Estrutura da empresa e cadastro de pessoas: RH, diretoria e admin_youb.
drop policy if exists areas_member_insert on public.areas;
create policy areas_admin_insert on public.areas
for insert to authenticated
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));
drop policy if exists areas_member_update on public.areas;
create policy areas_admin_update on public.areas
for update to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']))
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));
drop policy if exists areas_member_delete on public.areas;
create policy areas_admin_delete on public.areas
for delete to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));

drop policy if exists positions_member_insert on public.positions;
create policy positions_admin_insert on public.positions
for insert to authenticated
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));
drop policy if exists positions_member_update on public.positions;
create policy positions_admin_update on public.positions
for update to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']))
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));
drop policy if exists positions_member_delete on public.positions;
create policy positions_admin_delete on public.positions
for delete to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));

drop policy if exists competencies_member_insert on public.competencies;
create policy competencies_admin_insert on public.competencies
for insert to authenticated
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));
drop policy if exists competencies_member_update on public.competencies;
create policy competencies_admin_update on public.competencies
for update to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']))
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));
drop policy if exists competencies_member_delete on public.competencies;
create policy competencies_admin_delete on public.competencies
for delete to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));

drop policy if exists employees_member_insert on public.employees;
create policy employees_admin_insert on public.employees
for insert to authenticated
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));
drop policy if exists employees_member_update on public.employees;
create policy employees_admin_update on public.employees
for update to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']))
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));
drop policy if exists employees_member_delete on public.employees;
create policy employees_admin_delete on public.employees
for delete to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));

-- Ciclos: apenas RH, diretoria e admin_youb.
drop policy if exists cycles_member_insert on public.cycles;
create policy cycles_admin_insert on public.cycles
for insert to authenticated
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));
drop policy if exists cycles_member_update on public.cycles;
create policy cycles_admin_update on public.cycles
for update to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']))
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));
drop policy if exists cycles_member_delete on public.cycles;
create policy cycles_admin_delete on public.cycles
for delete to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));

-- Avaliações: gestores e superiores podem criar; gestão administrativa altera/remove.
drop policy if exists assessments_member_insert on public.assessments;
create policy assessments_manager_insert on public.assessments
for insert to authenticated
with check (
  public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor'])
  and (evaluator_employee_id is null or public.is_org_employee(organization_id, evaluator_employee_id)
       or public.has_org_role(organization_id, array['admin_youb','diretoria','rh']))
);
drop policy if exists assessments_admin_update on public.assessments;
create policy assessments_admin_update on public.assessments
for update to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']))
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));
drop policy if exists assessments_admin_delete on public.assessments;
create policy assessments_admin_delete on public.assessments
for delete to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));

-- Feedbacks: qualquer membro pode registrar o próprio feedback; gestores e superiores podem gerir feedbacks.
drop policy if exists feedbacks_member_insert on public.feedbacks;
create policy feedbacks_member_insert on public.feedbacks
for insert to authenticated
with check (
  public.is_org_member(organization_id)
  and (
    public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor'])
    or public.is_org_employee(organization_id, author_employee_id)
  )
);
drop policy if exists feedbacks_member_update on public.feedbacks;
create policy feedbacks_member_update on public.feedbacks
for update to authenticated
using (
  public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor'])
  or public.is_org_employee(organization_id, author_employee_id)
)
with check (public.is_org_member(organization_id));
drop policy if exists feedbacks_member_delete on public.feedbacks;
create policy feedbacks_member_delete on public.feedbacks
for delete to authenticated
using (
  public.has_org_role(organization_id, array['admin_youb','diretoria','rh'])
  or public.is_org_employee(organization_id, author_employee_id)
);

-- PDIs: gestores e superiores criam para a equipe; colaborador cria apenas o próprio.
drop policy if exists pdis_member_insert on public.pdis;
create policy pdis_member_insert on public.pdis
for insert to authenticated
with check (
  public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor'])
  or public.is_org_employee(organization_id, employee_id)
);
drop policy if exists pdis_member_update on public.pdis;
create policy pdis_member_update on public.pdis
for update to authenticated
using (
  public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor'])
  or public.is_org_employee(organization_id, employee_id)
)
with check (public.is_org_member(organization_id));
drop policy if exists pdis_member_delete on public.pdis;
create policy pdis_member_delete on public.pdis
for delete to authenticated
using (
  public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor'])
  or public.is_org_employee(organization_id, employee_id)
);

-- O RLS decide quem pode; estes grants apenas habilitam o PostgREST a avaliar as políticas.
grant insert, update, delete on table public.memberships to authenticated;
grant update, delete on table public.organizations to authenticated;
grant update, delete on table public.areas, public.positions, public.employees, public.competencies, public.cycles, public.assessments, public.feedbacks, public.pdis to authenticated;
