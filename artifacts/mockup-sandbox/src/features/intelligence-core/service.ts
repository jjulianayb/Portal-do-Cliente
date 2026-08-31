import type { SupabaseSession } from "../../lib/supabase";
import type { IntelligenceAction, IntelligenceEvidence, IntelligenceIntervention, IntelligenceOutcome, IntelligenceReadContext, IntelligenceRecommendation, IntelligenceSignal, KnowledgeDocument, KnowledgeSource } from "./types";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, "");
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
type TableMap = { intelligence_signals: IntelligenceSignal; intelligence_evidence: IntelligenceEvidence; intelligence_recommendations: IntelligenceRecommendation; intelligence_interventions: IntelligenceIntervention; intelligence_actions: IntelligenceAction; intelligence_outcomes: IntelligenceOutcome; knowledge_sources: KnowledgeSource; knowledge_documents: KnowledgeDocument };
function requireConfig(): { url: string; key: string } { if (!supabaseUrl || !supabaseAnonKey) throw new Error("O ambiente ainda não está conectado ao Supabase."); return { url: supabaseUrl, key: supabaseAnonKey }; }
function encode(value: string): string { return encodeURIComponent(value); }
async function readTable<T extends keyof TableMap>(context: IntelligenceReadContext, table: T, select: string, extra = ""): Promise<TableMap[T][]> { const config = requireConfig(); const query = `select=${encode(select)}&organization_id=eq.${encode(context.organizationId)}${extra}`; const response = await fetch(`${config.url}/rest/v1/${table}?${query}`, { headers: { apikey: config.key, Authorization: `Bearer ${context.session.access_token}` } }); const body: unknown = await response.json().catch(() => null); if (!response.ok) throw new Error("Não foi possível carregar este conteúdo agora."); return (body ?? []) as TableMap[T][]; }
const selects = {
  signals: "id,organization_id,employee_id,signal_type,observed_at,value,source_type,source_id,status",
  evidence: "id,organization_id,signal_id,evidence_type,summary,payload,source_type,source_id,observed_at",
  recommendations: "id,organization_id,employee_id,title,rationale,status,source_evidence_ids",
  interventions: "id,organization_id,recommendation_id,employee_id,intervention_type,title,plan,status,owner_employee_id",
  actions: "id,organization_id,intervention_id,action_type,title,details,status,assignee_employee_id,due_at,completed_at",
  outcomes: "id,organization_id,intervention_id,action_id,outcome_type,status,details,measured_at",
  sources: "id,organization_id,source_type,name,owner_user_id,access_level,status",
  documents: "id,organization_id,knowledge_source_id,document_type,title,version,status,valid_from,valid_until,content,storage_path,access_level,owner_user_id",
} as const;
export const readSignals = (context: IntelligenceReadContext) => readTable(context, "intelligence_signals", selects.signals, context.employeeId ? `&employee_id=eq.${encode(context.employeeId)}` : "");
export const readEvidence = (context: IntelligenceReadContext) => readTable(context, "intelligence_evidence", selects.evidence);
export const readRecommendations = (context: IntelligenceReadContext) => readTable(context, "intelligence_recommendations", selects.recommendations, context.employeeId ? `&employee_id=eq.${encode(context.employeeId)}` : "");
export const readInterventions = (context: IntelligenceReadContext) => readTable(context, "intelligence_interventions", selects.interventions, context.employeeId ? `&employee_id=eq.${encode(context.employeeId)}` : "");
export const readActions = (context: IntelligenceReadContext) => readTable(context, "intelligence_actions", selects.actions, context.employeeId ? `&assignee_employee_id=eq.${encode(context.employeeId)}` : "");
export const readOutcomes = (context: IntelligenceReadContext) => readTable(context, "intelligence_outcomes", selects.outcomes);
export const readKnowledgeSources = (context: IntelligenceReadContext) => readTable(context, "knowledge_sources", selects.sources, "&status=eq.active");
export const readKnowledgeDocuments = (context: IntelligenceReadContext) => { const now = encode(new Date().toISOString()); return readTable(context, "knowledge_documents", selects.documents, `&status=eq.published&or=(valid_from.is.null,valid_from.lte.${now})&or=(valid_until.is.null,valid_until.gt.${now})`); };

export type EmployeeHomeData = { pdis: Array<{ id: string; objective: string; status: string; due_date?: string | null }>; checkins: Array<{ id: string; checkin_date: string; mood: number; engagement: number; energy: number; workload: number; note?: string | null }>; actions: IntelligenceAction[] };
async function safeLegacyRead<T>(context: IntelligenceReadContext, table: string, select: string, filters: string): Promise<T[]> { try { const config = requireConfig(); const query = `select=${encode(select)}&organization_id=eq.${encode(context.organizationId)}&${filters}`; const response = await fetch(`${config.url}/rest/v1/${table}?${query}`, { headers: { apikey: config.key, Authorization: `Bearer ${context.session.access_token}` } }); if (!response.ok) return []; return (await response.json()) as T[]; } catch { return []; } }
export async function readEmployeeHomeData(context: IntelligenceReadContext): Promise<EmployeeHomeData> { if (!context.employeeId) return { pdis: [], checkins: [], actions: [] }; const employee = encode(context.employeeId); const [pdis, checkins, actions] = await Promise.all([safeLegacyRead<EmployeeHomeData["pdis"][number]>(context, "pdis", "id,objective,status,due_date", `employee_id=eq.${employee}`), safeLegacyRead<EmployeeHomeData["checkins"][number]>(context, "checkins", "id,checkin_date,mood,engagement,energy,workload,note", `employee_id=eq.${employee}&order=checkin_date.desc&limit=1`), readActions(context).catch(() => [] as IntelligenceAction[])]); return { pdis, checkins, actions }; }
export async function readIntelligenceFoundation(context: IntelligenceReadContext) { const [signals, evidence, recommendations, interventions, actions, outcomes, knowledgeSources, knowledgeDocuments] = await Promise.all([readSignals(context), readEvidence(context), readRecommendations(context), readInterventions(context), readActions(context), readOutcomes(context), readKnowledgeSources(context), readKnowledgeDocuments(context)]); return { signals, evidence, recommendations, interventions, actions, outcomes, knowledgeSources, knowledgeDocuments }; }
export type { SupabaseSession };
