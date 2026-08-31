import { useEffect, useState } from "react";
import EmployeeHome from "../mockups/EmployeeHome";
import { getMyOrganization, type SupabaseSession } from "../../lib/supabase";
import type { EmployeeHomeContext } from "../mockups/EmployeeHome";

type RouteState = { session: SupabaseSession; organization: { id: string; name: string; slug: string } } | null;
function safeSession(): SupabaseSession | null { try { const raw = window.localStorage.getItem("youb-session"); return raw ? JSON.parse(raw) as SupabaseSession : null; } catch { return null; } }
function displayName(session: SupabaseSession): string { const metadata = session.user.user_metadata as { full_name?: unknown } | undefined; return typeof metadata?.full_name === "string" && metadata.full_name.trim() ? metadata.full_name : session.user.email ?? "Usuário autenticado"; }

export default function EmployeeExperienceRoute() {
  const [state, setState] = useState<RouteState>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => { const session = safeSession(); if (!session) { setLoading(false); return; } void getMyOrganization(session).then((organization) => { if (organization) setState({ session, organization }); else setError("A organização autenticada ainda não foi carregada."); }).catch(() => setError("Não foi possível carregar o contexto da organização.")).finally(() => setLoading(false)); }, []);
  if (loading) return <RouteMessage title="Carregando sua jornada" detail="Estamos verificando seu contexto de acesso." />;
  if (error) return <RouteMessage title="Contexto indisponível" detail={error} />;
  if (!state) return <RouteMessage title="Acesse sua conta" detail="Entre na youB para visualizar sua jornada de colaborador." />;
  const name = displayName(state.session); const context: EmployeeHomeContext = { displayName: name, organizationName: state.organization.name, beeContext: { userName: name, organizationName: state.organization.name, role: "Role não carregada", capabilities: [], employeeLinked: false, screen: "employee-home" } };
  return <EmployeeHome context={context} />;
}
function RouteMessage({ title, detail }: { title: string; detail: string }) { return <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground"><section className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-sm"><h1 className="text-xl font-bold">{title}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{detail}</p></section></main>; }

