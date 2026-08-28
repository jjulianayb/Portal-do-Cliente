import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";

import type { SupabaseSession } from "../../lib/supabase";

type Organization = { id: string; name: string; slug: string };
type View = "overview" | "team" | "cycles" | "assessments" | "feedbacks" | "pdis";
type Employee = { id: string; full_name: string; email?: string | null; area_id?: string | null; position_id?: string | null };
type Area = { id: string; name: string };
type Position = { id: string; name: string; level?: string | null };
type Cycle = { id: string; name: string; starts_at?: string | null; ends_at?: string | null; status: string };
type Feedback = { id: string; content: string; visibility: string; created_at: string; target_employee_id: string; };
type Pdi = { id: string; objective: string; status: string; due_date?: string | null; employee_id: string };
type Assessment = { id: string; subject_employee_id: string; cycle_id: string; created_at: string };

type DashboardProps = {
  session: SupabaseSession;
  organization: Organization;
  onLogout: () => void;
};

const inputClassName = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
const buttonClassName = "rounded-xl bg-[#1e3a6e] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#152c57] disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButtonClassName = "rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, "");
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function getErrorMessage(body: unknown): string {
  if (body && typeof body === "object") {
    const value = body as { message?: string; details?: string; hint?: string };
    return value.message ?? value.details ?? value.hint ?? "Não foi possível salvar agora.";
  }
  return "Não foi possível salvar agora.";
}

async function apiRequest<T>(session: SupabaseSession, path: string, options: RequestInit = {}): Promise<T> {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("O ambiente ainda não está conectado ao Supabase.");
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(getErrorMessage(body));
  return body as T;
}

function formatDate(value?: string | null): string {
  if (!value) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function statusLabel(status: string): string {
  return ({ draft: "Rascunho", active: "Ativo", closed: "Encerrado", completed: "Concluído", cancelled: "Cancelado" } as Record<string, string>)[status] ?? status;
}

export default function Dashboard({ session, organization, onLogout }: DashboardProps) {
  const [view, setView] = useState<View>("overview");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [pdis, setPdis] = useState<Pdi[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cycleName, setCycleName] = useState("");
  const [cycleStartsAt, setCycleStartsAt] = useState("");
  const [cycleEndsAt, setCycleEndsAt] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeeArea, setEmployeeArea] = useState("");
  const [employeePosition, setEmployeePosition] = useState("");
  const [areaName, setAreaName] = useState("");
  const [positionName, setPositionName] = useState("");
  const [positionLevel, setPositionLevel] = useState("");
  const [feedbackTarget, setFeedbackTarget] = useState("");
  const [feedbackContent, setFeedbackContent] = useState("");
  const [pdiEmployee, setPdiEmployee] = useState("");
  const [pdiObjective, setPdiObjective] = useState("");
  const [pdiDueDate, setPdiDueDate] = useState("");
  const [assessmentEmployee, setAssessmentEmployee] = useState("");
  const [assessmentCycle, setAssessmentCycle] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const org = encodeURIComponent(organization.id);
      const [employeeRows, areaRows, positionRows, cycleRows, feedbackRows, pdiRows, assessmentRows] = await Promise.all([
        apiRequest<Employee[]>(session, `employees?select=id,full_name,email,area_id,position_id&organization_id=eq.${org}&status=eq.active&order=full_name`),
        apiRequest<Area[]>(session, `areas?select=id,name&organization_id=eq.${org}&order=name`),
        apiRequest<Position[]>(session, `positions?select=id,name,level&organization_id=eq.${org}&order=name`),
        apiRequest<Cycle[]>(session, `cycles?select=id,name,starts_at,ends_at,status&organization_id=eq.${org}&order=created_at.desc`),
        apiRequest<Feedback[]>(session, `feedbacks?select=id,content,visibility,created_at,target_employee_id&organization_id=eq.${org}&order=created_at.desc`),
        apiRequest<Pdi[]>(session, `pdis?select=id,objective,status,due_date,employee_id&organization_id=eq.${org}&order=created_at.desc`),
        apiRequest<Assessment[]>(session, `assessments?select=id,subject_employee_id,cycle_id,created_at&organization_id=eq.${org}&order=created_at.desc`),
      ]);
      setEmployees(employeeRows);
      setAreas(areaRows);
      setPositions(positionRows);
      setCycles(cycleRows);
      setFeedbacks(feedbackRows);
      setPdis(pdiRows);
      setAssessments(assessmentRows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar os dados da empresa.");
    } finally {
      setLoading(false);
    }
  }, [organization.id, session]);

  useEffect(() => { void loadData(); }, [loadData]);

  const employeeNames = useMemo(() => new Map(employees.map((employee) => [employee.id, employee.full_name])), [employees]);
  const cycleNames = useMemo(() => new Map(cycles.map((cycle) => [cycle.id, cycle.name])), [cycles]);
  const areaNames = useMemo(() => new Map(areas.map((area) => [area.id, area.name])), [areas]);
  const positionNames = useMemo(() => new Map(positions.map((position) => [position.id, position.name])), [positions]);
  const activeCycles = cycles.filter((cycle) => cycle.status === "active").length;
  const pendingPdis = pdis.filter((pdi) => pdi.status !== "completed" && pdi.status !== "cancelled").length;
  const firstName = String(session.user.user_metadata?.full_name ?? session.user.email ?? "Time").split(" ")[0];

  function resetMessages() { setNotice(null); setError(null); }

  async function createArea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); resetMessages(); setSaving(true);
    try {
      await apiRequest(session, "areas", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ organization_id: organization.id, name: areaName.trim() }) });
      setAreaName(""); setNotice("Área criada."); await loadData();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Não foi possível criar a área."); } finally { setSaving(false); }
  }

  async function createPosition(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); resetMessages(); setSaving(true);
    try {
      await apiRequest(session, "positions", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ organization_id: organization.id, name: positionName.trim(), level: positionLevel.trim() || null }) });
      setPositionName(""); setPositionLevel(""); setNotice("Cargo criado."); await loadData();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Não foi possível criar o cargo."); } finally { setSaving(false); }
  }

  async function createEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); resetMessages(); setSaving(true);
    try {
      await apiRequest(session, "employees", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ organization_id: organization.id, full_name: employeeName.trim(), email: employeeEmail.trim() || null, area_id: employeeArea || null, position_id: employeePosition || null, status: "active" }) });
      setEmployeeName(""); setEmployeeEmail(""); setEmployeeArea(""); setEmployeePosition(""); setNotice("Colaborador adicionado à equipe."); await loadData();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Não foi possível adicionar o colaborador."); } finally { setSaving(false); }
  }

  async function createCycle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); resetMessages(); setSaving(true);
    try {
      await apiRequest(session, "cycles", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ organization_id: organization.id, name: cycleName.trim(), starts_at: cycleStartsAt || null, ends_at: cycleEndsAt || null, status: "draft", cycle_type: "performance" }) });
      setCycleName(""); setCycleStartsAt(""); setCycleEndsAt(""); setNotice("Ciclo criado. Você já pode ativá-lo quando estiver pronto."); await loadData(); setView("cycles");
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Não foi possível criar o ciclo."); } finally { setSaving(false); }
  }

  async function createFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); resetMessages(); setSaving(true);
    try {
      await apiRequest(session, "feedbacks", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ organization_id: organization.id, target_employee_id: feedbackTarget, content: feedbackContent.trim(), visibility: "private" }) });
      setFeedbackTarget(""); setFeedbackContent(""); setNotice("Feedback registrado com segurança."); await loadData(); setView("feedbacks");
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Não foi possível registrar o feedback."); } finally { setSaving(false); }
  }

  async function createPdi(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); resetMessages(); setSaving(true);
    try {
      await apiRequest(session, "pdis", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ organization_id: organization.id, employee_id: pdiEmployee, objective: pdiObjective.trim(), due_date: pdiDueDate || null, actions: [], status: "draft" }) });
      setPdiEmployee(""); setPdiObjective(""); setPdiDueDate(""); setNotice("PDI criado para acompanhamento."); await loadData(); setView("pdis");
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Não foi possível criar o PDI."); } finally { setSaving(false); }
  }

  async function createAssessment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); resetMessages(); setSaving(true);
    try {
      await apiRequest(session, "assessments", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ organization_id: organization.id, subject_employee_id: assessmentEmployee, cycle_id: assessmentCycle, scores: {} }) });
      setAssessmentEmployee(""); setAssessmentCycle(""); setNotice("Avaliação criada e pronta para preenchimento."); await loadData(); setView("assessments");
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Não foi possível criar a avaliação."); } finally { setSaving(false); }
  }

  const navItems: Array<{ id: View; label: string; icon: string }> = [
    { id: "overview", label: "Visão geral", icon: "⌂" },
    { id: "team", label: "Equipe", icon: "♙" },
    { id: "cycles", label: "Ciclos", icon: "◷" },
    { id: "assessments", label: "Avaliações", icon: "▣" },
    { id: "feedbacks", label: "Feedbacks", icon: "↗" },
    { id: "pdis", label: "PDIs", icon: "◎" },
  ];

  return (
    <main className="min-h-screen bg-[#f5f8fc] text-slate-900">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full bg-[#102654] p-5 text-white lg:w-64 lg:p-6">
          <div className="flex items-baseline gap-1 px-2"><span className="text-2xl font-light text-white/75">you</span><span className="text-3xl font-extrabold">B</span></div>
          <div className="mt-8 rounded-2xl bg-white/10 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100/70">Empresa</p><p className="mt-1 truncate font-bold">{organization.name}</p><p className="mt-1 truncate text-xs text-blue-100/65">{organization.slug}</p></div>
          <nav className="mt-8 grid grid-cols-2 gap-2 lg:block lg:space-y-1">
            {navItems.map((item) => <button key={item.id} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${view === item.id ? "bg-white text-[#102654]" : "text-blue-100/80 hover:bg-white/10 hover:text-white"}`} onClick={() => { resetMessages(); setView(item.id); }} type="button"><span className="w-5 text-center text-lg">{item.icon}</span>{item.label}</button>)}
          </nav>
          <button className="mt-8 w-full rounded-xl border border-white/20 px-3 py-3 text-left text-sm font-semibold text-blue-100/80 hover:bg-white/10 hover:text-white" onClick={onLogout} type="button">↩ Sair</button>
        </aside>

        <section className="flex-1 p-5 sm:p-8 lg:p-10">
          <header className="mx-auto flex max-w-6xl flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Painel de pessoas</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight">Olá, {firstName}.</h1><p className="mt-1 text-sm text-slate-500">Acompanhe o desenvolvimento da sua equipe em um só lugar.</p></div><div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm"><span className="text-slate-400">Plano </span><strong className="text-[#1e3a6e]">Essencial</strong></div></header>
          <div className="mx-auto mt-8 max-w-6xl">{notice && <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}{error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
            {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Carregando os dados da empresa...</div> : <>
              {view === "overview" && <Overview employees={employees} cycles={cycles} feedbacks={feedbacks} pdis={pdis} activeCycles={activeCycles} pendingPdis={pendingPdis} onView={setView} />}
              {view === "team" && <ModuleSection title="Equipe" description="Cadastre colaboradores, áreas e cargos para dar contexto aos ciclos e planos.">
                <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                  <form className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5" onSubmit={createEmployee}><h3 className="font-bold text-slate-800">Adicionar colaborador</h3><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold text-slate-600 sm:col-span-2">Nome completo<input className={inputClassName} value={employeeName} onChange={(event) => setEmployeeName(event.target.value)} placeholder="Ex.: Ana Souza" required /></label><label className="text-xs font-bold text-slate-600">E-mail<input className={inputClassName} type="email" value={employeeEmail} onChange={(event) => setEmployeeEmail(event.target.value)} placeholder="ana@empresa.com" /></label><label className="text-xs font-bold text-slate-600">Área<select className={inputClassName} value={employeeArea} onChange={(event) => setEmployeeArea(event.target.value)}><option value="">Sem área</option>{areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label><label className="text-xs font-bold text-slate-600">Cargo<select className={inputClassName} value={employeePosition} onChange={(event) => setEmployeePosition(event.target.value)}><option value="">Sem cargo</option>{positions.map((position) => <option key={position.id} value={position.id}>{position.name}</option>)}</select></label></div><button className={`${buttonClassName} mt-4`} disabled={saving} type="submit">{saving ? "Salvando..." : "+ Adicionar à equipe"}</button></form>
                  <div className="space-y-4"><form className="rounded-2xl border border-slate-200 bg-white p-5" onSubmit={createArea}><h3 className="font-bold text-slate-800">Nova área</h3><input className={inputClassName} value={areaName} onChange={(event) => setAreaName(event.target.value)} placeholder="Ex.: Produto" required /><button className={`${secondaryButtonClassName} mt-3`} disabled={saving} type="submit">Criar área</button></form><form className="rounded-2xl border border-slate-200 bg-white p-5" onSubmit={createPosition}><h3 className="font-bold text-slate-800">Novo cargo</h3><input className={inputClassName} value={positionName} onChange={(event) => setPositionName(event.target.value)} placeholder="Ex.: Gerente" required /><input className={inputClassName} value={positionLevel} onChange={(event) => setPositionLevel(event.target.value)} placeholder="Nível (opcional)" /><button className={`${secondaryButtonClassName} mt-3`} disabled={saving} type="submit">Criar cargo</button></form></div>
                </div>
                <div className="mt-6 space-y-3">{employees.length === 0 ? <EmptyState text="Ainda não há colaboradores cadastrados." /> : employees.map((employee) => <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center" key={employee.id}><div><h3 className="font-bold">{employee.full_name}</h3><p className="mt-1 text-sm text-slate-500">{employee.email || "Sem e-mail"} · {areaNames.get(employee.area_id ?? "") ?? "Sem área"} · {positionNames.get(employee.position_id ?? "") ?? "Sem cargo"}</p></div><StatusPill status="active" /></div>)}</div>
              </ModuleSection>}
              {view === "cycles" && <ModuleSection title="Ciclos de desenvolvimento" description="Organize períodos de avaliação e acompanhamento da equipe."><form className="mb-6 grid gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 md:grid-cols-4" onSubmit={createCycle}><label className="text-xs font-bold text-slate-600 md:col-span-2">Nome do ciclo<input className={inputClassName} value={cycleName} onChange={(event) => setCycleName(event.target.value)} placeholder="Ex.: Ciclo de desempenho 2026" required /></label><label className="text-xs font-bold text-slate-600">Início<input className={inputClassName} type="date" value={cycleStartsAt} onChange={(event) => setCycleStartsAt(event.target.value)} /></label><label className="text-xs font-bold text-slate-600">Fim<input className={inputClassName} type="date" value={cycleEndsAt} onChange={(event) => setCycleEndsAt(event.target.value)} /></label><button className={`${buttonClassName} md:col-span-4 md:w-fit`} disabled={saving} type="submit">{saving ? "Salvando..." : "+ Criar ciclo"}</button></form><div className="space-y-3">{cycles.length === 0 ? <EmptyState text="Ainda não há ciclos criados." /> : cycles.map((cycle) => <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center" key={cycle.id}><div><h3 className="font-bold">{cycle.name}</h3><p className="mt-1 text-sm text-slate-500">{formatDate(cycle.starts_at)} → {formatDate(cycle.ends_at)}</p></div><StatusPill status={cycle.status} /></div>)}</div></ModuleSection>}
              {view === "assessments" && <ModuleSection title="Avaliações" description="Crie avaliações vinculadas a um ciclo e acompanhe o preenchimento."><form className="mb-6 grid gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 md:grid-cols-3" onSubmit={createAssessment}><label className="text-xs font-bold text-slate-600">Pessoa avaliada<select className={inputClassName} value={assessmentEmployee} onChange={(event) => setAssessmentEmployee(event.target.value)} required><option value="">Selecione</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.full_name}</option>)}</select></label><label className="text-xs font-bold text-slate-600">Ciclo<select className={inputClassName} value={assessmentCycle} onChange={(event) => setAssessmentCycle(event.target.value)} required><option value="">Selecione</option>{cycles.map((cycle) => <option key={cycle.id} value={cycle.id}>{cycle.name}</option>)}</select></label><div className="flex items-end"><button className={buttonClassName} disabled={saving} type="submit">{saving ? "Salvando..." : "+ Nova avaliação"}</button></div></form><div className="space-y-3">{assessments.length === 0 ? <EmptyState text="Crie a primeira avaliação da sua equipe." /> : assessments.map((assessment) => <div className="flex flex-col justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center" key={assessment.id}><div><h3 className="font-bold">{employeeNames.get(assessment.subject_employee_id) ?? "Pessoa da equipe"}</h3><p className="mt-1 text-sm text-slate-500">{cycleNames.get(assessment.cycle_id) ?? "Ciclo"} · criada em {formatDate(assessment.created_at.slice(0, 10))}</p></div><StatusPill status="draft" /></div>)}</div></ModuleSection>}
              {view === "feedbacks" && <ModuleSection title="Feedbacks" description="Registre conversas importantes e mantenha uma cultura de desenvolvimento contínuo."><form className="mb-6 space-y-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-5" onSubmit={createFeedback}><label className="block text-xs font-bold text-slate-600">Pessoa que receberá o feedback<select className={inputClassName} value={feedbackTarget} onChange={(event) => setFeedbackTarget(event.target.value)} required><option value="">Selecione</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.full_name}</option>)}</select></label><label className="block text-xs font-bold text-slate-600">Mensagem<textarea className={inputClassName} rows={3} value={feedbackContent} onChange={(event) => setFeedbackContent(event.target.value)} placeholder="Escreva um feedback claro e construtivo..." required /></label><button className={buttonClassName} disabled={saving} type="submit">{saving ? "Salvando..." : "+ Registrar feedback"}</button></form><div className="space-y-3">{feedbacks.length === 0 ? <EmptyState text="Nenhum feedback registrado ainda." /> : feedbacks.map((feedback) => <div className="rounded-2xl border border-slate-200 bg-white p-5" key={feedback.id}><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">Para {employeeNames.get(feedback.target_employee_id) ?? "pessoa da equipe"}</h3><span className="text-xs text-slate-400">{formatDate(feedback.created_at.slice(0, 10))}</span></div><p className="mt-3 text-sm leading-6 text-slate-600">{feedback.content}</p></div>)}</div></ModuleSection>}
              {view === "pdis" && <ModuleSection title="Planos de desenvolvimento individual" description="Transforme conversas em objetivos e próximos passos acompanháveis."><form className="mb-6 grid gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 md:grid-cols-3" onSubmit={createPdi}><label className="text-xs font-bold text-slate-600">Pessoa<select className={inputClassName} value={pdiEmployee} onChange={(event) => setPdiEmployee(event.target.value)} required><option value="">Selecione</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.full_name}</option>)}</select></label><label className="text-xs font-bold text-slate-600 md:col-span-2">Objetivo<input className={inputClassName} value={pdiObjective} onChange={(event) => setPdiObjective(event.target.value)} placeholder="Ex.: Desenvolver liderança" required /></label><label className="text-xs font-bold text-slate-600">Prazo<input className={inputClassName} type="date" value={pdiDueDate} onChange={(event) => setPdiDueDate(event.target.value)} /></label><button className={`${buttonClassName} md:col-span-3 md:w-fit`} disabled={saving} type="submit">{saving ? "Salvando..." : "+ Criar PDI"}</button></form><div className="space-y-3">{pdis.length === 0 ? <EmptyState text="Nenhum PDI criado ainda." /> : pdis.map((pdi) => <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center" key={pdi.id}><div><h3 className="font-bold">{pdi.objective}</h3><p className="mt-1 text-sm text-slate-500">{employeeNames.get(pdi.employee_id) ?? "Pessoa da equipe"} · prazo {formatDate(pdi.due_date)}</p></div><StatusPill status={pdi.status} /></div>)}</div></ModuleSection>}
            </>}</div>
        </section>
      </div>
    </main>
  );
}

function Overview({ employees, cycles, feedbacks, pdis, activeCycles, pendingPdis, onView }: { employees: Employee[]; cycles: Cycle[]; feedbacks: Feedback[]; pdis: Pdi[]; activeCycles: number; pendingPdis: number; onView: (view: View) => void }) {
  const cards = [{ label: "Pessoas ativas", value: employees.length, view: "overview" as View, tone: "blue" }, { label: "Ciclos ativos", value: activeCycles, view: "cycles" as View, tone: "violet" }, { label: "Feedbacks registrados", value: feedbacks.length, view: "feedbacks" as View, tone: "emerald" }, { label: "PDIs em andamento", value: pendingPdis, view: "pdis" as View, tone: "amber" }];
  return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <button className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" key={card.label} onClick={() => onView(card.view)} type="button"><div className={`mb-5 h-2 w-12 rounded-full bg-${card.tone}-500`} /><p className="text-sm text-slate-500">{card.label}</p><p className="mt-2 text-3xl font-extrabold">{card.value}</p></button>)}</div><div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><div className="rounded-2xl border border-slate-200 bg-white p-6"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Próximos ciclos</h2><p className="mt-1 text-sm text-slate-500">Mantenha os rituais de desenvolvimento em dia.</p></div><button className={secondaryButtonClassName} onClick={() => onView("cycles")} type="button">Ver ciclos</button></div><div className="mt-5 space-y-3">{cycles.slice(0, 3).map((cycle) => <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4" key={cycle.id}><div><p className="font-semibold">{cycle.name}</p><p className="mt-1 text-xs text-slate-500">{formatDate(cycle.starts_at)} → {formatDate(cycle.ends_at)}</p></div><StatusPill status={cycle.status} /></div>)}{cycles.length === 0 && <EmptyState text="Crie um ciclo para começar." />}</div></div><div className="rounded-2xl bg-gradient-to-br from-[#1e3a6e] to-[#315da0] p-6 text-white"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-100/70">Próximo passo</p><h2 className="mt-3 text-xl font-bold">Dê contexto ao desenvolvimento.</h2><p className="mt-3 text-sm leading-6 text-blue-100/80">Comece criando um ciclo, registre um feedback ou transforme uma conversa em PDI.</p><div className="mt-6 flex flex-wrap gap-2"><button className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-[#1e3a6e]" onClick={() => onView("cycles")} type="button">Criar ciclo</button><button className="rounded-xl border border-white/30 px-3 py-2 text-xs font-bold text-white" onClick={() => onView("pdis")} type="button">Criar PDI</button></div></div></div></>;
}

function ModuleSection({ title, description, children }: { title: string; description: string; children: ReactNode }) { return <div><div className="mb-6"><h2 className="text-2xl font-extrabold">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div>{children}</div>; }
function EmptyState({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">{text}</div>; }
function StatusPill({ status }: { status: string }) { return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${status === "active" ? "bg-emerald-100 text-emerald-700" : status === "completed" ? "bg-blue-100 text-blue-700" : status === "cancelled" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{statusLabel(status)}</span>; }
