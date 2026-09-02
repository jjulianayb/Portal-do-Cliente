import test from "node:test";
import assert from "node:assert/strict";
import { BEE_INTENTS, buildBeeAttentionToday, explainHypothesis, explainReading, routeBeeIntent, type BeeRuntimeFinding, type BeeRuntimeReadModel } from "./bee-runtime";

const finding = (kind: BeeRuntimeFinding["kind"], id: string, summary: string, status: string | null = "open", evidenceState: string | null = null): BeeRuntimeFinding => ({ kind, id, organizationId: "org-a", scope: { type: "organization", ref: "org-a" }, title: summary, summary, status, knowledgeKind: kind === "HYPOTHESIS" ? "hypothesis" : kind === "READING" ? "interpreted" : null, evidenceState, unknowns: [], limitations: [], provenance: [{ entityType: kind, entityId: id }], sensitivity: null, timestamps: { createdAt: "2026-09-01T10:00:00Z" }, links: [] });
const model = (): BeeRuntimeReadModel => {
  const hypothesis = finding("HYPOTHESIS", "hyp-a", "Mudança de liderança pode estar relacionada");
  const readingFinding = finding("READING", "reading-a", "Movimento de risco na organização");
  const assessmentFinding = finding("ASSESSMENT", "assessment-a", "Evidências em direções diferentes", "assessed", "conflicting");
  return { context: { organizationId: "org-a", userId: "user-a", role: "diretoria", employeeId: null, purpose: "review" }, readings: [{ finding: readingFinding, hypotheses: [hypothesis], sources: [], evidence: [], assessments: [{ finding: assessmentFinding, supportingEvidence: [], contradictingEvidence: [] }], recommendations: [], decisions: [] }], assessments: [{ finding: assessmentFinding, supportingEvidence: [], contradictingEvidence: [] }], recommendations: [], decisions: [], actions: [], outcomes: [], memory: [], events: [], attentionToday: [] };
};

test("Bee intents are deterministic and closed", () => {
  assert.deepEqual(routeBeeIntent("attention_today"), "attention_today");
  assert.deepEqual(routeBeeIntent("what deserves my attention today?"), "attention_today");
  assert.equal(routeBeeIntent("invented_intent"), null);
  assert.equal(BEE_INTENTS.length, 10);
});

test("attention_today prioritizes transparent conflicting evidence and honors limit", () => {
  const result = buildBeeAttentionToday({} as never, model(), 1, new Date("2026-09-01T12:00:00Z"));
  assert.equal(result.length, 1);
  assert.equal(result[0]?.rule, "conflicting_evidence");
});

test("explanations keep hypothesis epistemically distinct", () => {
  const result = explainHypothesis(model(), "hyp-a");
  assert.ok(result);
  assert.match(result?.summary ?? "", /Hipótese em investigação/);
  assert.match(result?.whatWeDoNotKnow[0] ?? "", /não é uma conclusão/);
  assert.ok(explainReading(model(), "reading-a"));
});
