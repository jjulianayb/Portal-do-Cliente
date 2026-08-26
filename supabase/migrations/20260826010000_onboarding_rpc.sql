-- youB — onboarding inicial da primeira empresa
-- Cria uma organização e vincula o usuário autenticado como admin_youb.

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

  return v_org;
exception
  when unique_violation then
    raise exception 'Já existe uma empresa com este identificador.' using errcode = '23505';
end;
$$;

revoke all on function public.create_organization(text, text) from public;
grant execute on function public.create_organization(text, text) to authenticated;
