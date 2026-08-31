import type { SupabaseSession } from "../../lib/supabase";

export type IntelligenceStatus = "received" | "reviewed" | "archived" | "draft" | "proposed" | "accepted" | "rejected" | "expired" | "approved" | "in_progress" | "completed" | "cancelled" | "observed" | "confirmed";
export type KnowledgeAccessLevel = "organization" | "management" | "restricted";
export type KnowledgeDocumentStatus = "draft" | "published" | "archived";
export type IntelligenceReadContext = { session: SupabaseSession; organizationId: string; employeeId?: string | null };
export type IntelligenceSignal = { id: string; organization_id: string; employee_id?: string | null; signal_type: string; observed_at: string; value: Record<string, unknown>; source_type: string; source_id?: string | null; status: IntelligenceStatus; };
export type IntelligenceEvidence = { id: string; organization_id: string; signal_id?: string | null; evidence_type: string; summary: string; payload: Record<string, unknown>; source_type: string; source_id?: string | null; observed_at?: string | null; };
export type IntelligenceRecommendation = { id: string; organization_id: string; employee_id?: string | null; title: string; rationale?: string | null; status: IntelligenceStatus; source_evidence_ids: string[]; };
export type IntelligenceIntervention = { id: string; organization_id: string; recommendation_id?: string | null; employee_id?: string | null; intervention_type: string; title: string; plan: Record<string, unknown>; status: IntelligenceStatus; owner_employee_id?: string | null; };
export type IntelligenceAction = { id: string; organization_id: string; intervention_id?: string | null; action_type: string; title: string; details: Record<string, unknown>; status: IntelligenceStatus; assignee_employee_id?: string | null; due_at?: string | null; completed_at?: string | null; };
export type IntelligenceOutcome = { id: string; organization_id: string; intervention_id?: string | null; action_id?: string | null; outcome_type: string; status: IntelligenceStatus; details: Record<string, unknown>; measured_at: string; };
export type KnowledgeSource = { id: string; organization_id: string; source_type: string; name: string; owner_user_id?: string | null; access_level: KnowledgeAccessLevel; status: "active" | "archived"; };
export type KnowledgeDocument = { id: string; organization_id: string; knowledge_source_id?: string | null; document_type: string; title: string; version: string; status: KnowledgeDocumentStatus; valid_from?: string | null; valid_until?: string | null; content?: string | null; storage_path?: string | null; access_level: KnowledgeAccessLevel; owner_user_id?: string | null; };

