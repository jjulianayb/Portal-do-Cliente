-- youB — permissões por papel para proteger dados e operações no backend

-- Remove nomes de políticas legados ou criados em tentativas anteriores antes de
-- recriar a matriz canônica. Não remove dados, apenas regras de acesso.
do $$
declare r record;
begin
  for r in select schemaname, tablename, policyname from pg_policies where schemaname = 'public' and tablename in ('employees','areas','positions','cycles','assessments','feedbacks','pdis','disciplinary_actions','checkins') loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- Estrutura organizacional: leitura para membros; alteração somente administração/RH.
drop policy if exists areas_member_select on public.areas;
drop policy if exists areas_select_members on public.areas;
create policy areas_select_members on public.areas for select to authenticated
using (public.is_org_member(organization_id));
drop policy if exists positions_member_select on public.positions;
drop policy if exists positions_select_members on public.positions;
create policy positions_select_members on public.positions for select to authenticated
using (public.is_org_member(organization_id));
drop policy if exists areas_member_insert on public.areas;
drop policy if exists areas_insert_admin_hr on public.areas;
create policy areas_insert_admin_hr on public.areas for insert to authenticated
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));
drop policy if exists positions_member_insert on public.positions;
drop policy if exists positions_insert_admin_hr on public.positions;
create policy positions_insert_admin_hr on public.positions for insert to authenticated
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));

-- Colaboradores: gestores consultam; cadastro e alteração ficam com administração/RH.
drop policy if exists employees_member_select on public.employees;
create policy employees_select_by_role on public.employees for select to authenticated
using (
  public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor'])
  or (public.has_org_role(organization_id, array['colaborador']) and auth_user_id = auth.uid())
);
drop policy if exists employees_member_insert on public.employees;
create policy employees_insert_admin_hr on public.employees for insert to authenticated
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));
drop policy if exists employees_member_update on public.employees;
create policy employees_update_admin_hr on public.employees for update to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']))
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));
drop policy if exists employees_member_delete on public.employees;
create policy employees_delete_admin_hr on public.employees for delete to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));
grant update, delete on public.employees to authenticated;

-- Ciclos, avaliações, feedbacks e PDIs: gestão pode operar; colaborador vê apenas seus registros.
drop policy if exists cycles_member_select on public.cycles;
create policy cycles_select_members on public.cycles for select to authenticated
using (public.is_org_member(organization_id));
drop policy if exists cycles_member_insert on public.cycles;
create policy cycles_insert_admin_hr on public.cycles for insert to authenticated
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));
drop policy if exists assessments_member_select on public.assessments;
create policy assessments_select_by_role on public.assessments for select to authenticated
using (
  public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor'])
  or exists (select 1 from public.employees e where e.id = subject_employee_id and e.organization_id = assessments.organization_id and e.auth_user_id = auth.uid())
);
drop policy if exists assessments_member_insert on public.assessments;
create policy assessments_insert_management on public.assessments for insert to authenticated
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor']));
drop policy if exists feedbacks_member_select on public.feedbacks;
create policy feedbacks_select_by_role on public.feedbacks for select to authenticated
using (
  public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor'])
  or exists (select 1 from public.employees e where e.id = target_employee_id and e.organization_id = feedbacks.organization_id and e.auth_user_id = auth.uid())
);
drop policy if exists feedbacks_member_insert on public.feedbacks;
create policy feedbacks_insert_management on public.feedbacks for insert to authenticated
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor']));
drop policy if exists pdis_member_select on public.pdis;
create policy pdis_select_by_role on public.pdis for select to authenticated
using (
  public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor'])
  or exists (select 1 from public.employees e where e.id = employee_id and e.organization_id = pdis.organization_id and e.auth_user_id = auth.uid())
);
drop policy if exists pdis_member_insert on public.pdis;
create policy pdis_insert_management on public.pdis for insert to authenticated
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor']));
grant insert on public.cycles, public.assessments, public.feedbacks, public.pdis to authenticated;

-- Medidas disciplinares: gestores registram; somente administração, diretoria e RH alteram ou removem.
drop policy if exists disciplinary_actions_select_management on public.disciplinary_actions;
create policy disciplinary_actions_select_management on public.disciplinary_actions for select to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor']));
drop policy if exists disciplinary_actions_insert_management on public.disciplinary_actions;
create policy disciplinary_actions_insert_management on public.disciplinary_actions for insert to authenticated
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor']));
drop policy if exists disciplinary_actions_update_management on public.disciplinary_actions;
drop policy if exists disciplinary_actions_update_workflow on public.disciplinary_actions;
create policy disciplinary_actions_update_admin_hr on public.disciplinary_actions for update to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']))
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));
drop policy if exists disciplinary_actions_delete_management on public.disciplinary_actions;
create policy disciplinary_actions_delete_admin_hr on public.disciplinary_actions for delete to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));

-- Check-ins: liderança registra e atualiza; leitura de colaborador fica limitada ao próprio registro.
drop policy if exists checkins_select_management on public.checkins;
create policy checkins_select_by_role on public.checkins for select to authenticated
using (
  public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor'])
  or exists (select 1 from public.employees e where e.id = employee_id and e.organization_id = checkins.organization_id and e.auth_user_id = auth.uid())
);
drop policy if exists checkins_insert_management on public.checkins;
create policy checkins_insert_management on public.checkins for insert to authenticated
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor']));
drop policy if exists checkins_update_management on public.checkins;
create policy checkins_update_management on public.checkins for update to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor']))
with check (public.has_org_role(organization_id, array['admin_youb','diretoria','rh','gestor']));
drop policy if exists checkins_delete_management on public.checkins;
create policy checkins_delete_admin_hr on public.checkins for delete to authenticated
using (public.has_org_role(organization_id, array['admin_youb','diretoria','rh']));
