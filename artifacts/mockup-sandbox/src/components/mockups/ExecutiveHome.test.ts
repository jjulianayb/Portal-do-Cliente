import test from "node:test";
import assert from "node:assert/strict";
import { buildExecutiveSnapshot, roleCanSeeExecutiveHome } from "./ExecutiveHome";
import type { BeeRuntimeReadModel } from "../../features/intelligence-core/bee-runtime";

const model = (overrides: Partial<BeeRuntimeReadModel> = {}): BeeRuntimeReadModel => ({ context: { organizationId: "org-a", userId: "user-a", role: "diretoria", employeeId: null, purpose: "executive_home" }, readings: [], assessments: [], recommendations: [], decisions: [], interventions: [], actions: [], outcomes: [], memory: [], events: [], attentionToday: [], ...overrides });

test("executive snapshot derives only existing runtime collections", () => {
  const result = buildExecutiveSnapshot(model({ readings: [{ finding: { status: "open" } } as never, readingType: "risk", hypotheses: [], sources: [], evidence: [], assessments: [], recommendations: [], decisions: [] }], recommendations: [{ approvalRequired: true, finding: { status: "proposed" } } as never], decisions: [{ finding: { status: "pending_review" } } as never], actions: [{ dueAt: "2026-09-02", completedAt: null } as never], outcomes: [{ validationStatus: "unvalidated" } as never] }));
  assert.deepEqual(result, { openReadings: 1, pendingRecommendations: 1, pendingDecisions: 1, actionsDue: 1, outcomesPending: 1 });
});

test("executive home visibility is role-aware without creating authorization", () => {
  assert.equal(roleCanSeeExecutiveHome("admin_youb"), true);
  assert.equal(roleCanSeeExecutiveHome("rh"), true);
  assert.equal(roleCanSeeExecutiveHome("diretoria"), true);
  assert.equal(roleCanSeeExecutiveHome("gestor"), true);
  assert.equal(roleCanSeeExecutiveHome("colaborador"), false);
});
