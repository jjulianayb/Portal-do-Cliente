# youB — Delivery Plan

## Papéis

- **Juliana** — Product Owner; prioriza, aprova escopo e decisões de produto.
- **Dodo** — CTO / Arquitetura / PMO / QA; define guardrails, revisa desenho, coordena qualidade e auditoria.
- **Zapia** — implementação; executa mudanças autorizadas, validações e registro de evidências.

## Estados oficiais

`BACKLOG → SPEC READY → BUILDING → AUDIT → FIX → BLOCKED → READY FOR STAGING → READY FOR MERGE → DONE`

## Estado atual e gates

| Entrega | Estado | Responsável | Dependências | Prazo-alvo / gate |
|---|---|---|---|---|
| PR #1 — fundação multiempresa/RLS | READY FOR STAGING | Zapia / Dodo | staging descartável autorizado | condicionado ao staging descartável autorizado |
| PR #2 — Intelligence Core | READY FOR STAGING | Zapia / Dodo | PR #1; staging descartável autorizado | condicionado ao staging descartável autorizado |
| PR #4 — Recommendation & Intervention Model V1 | READY FOR STAGING | Zapia / Dodo | PR #2; auditoria fail-fast concluída | condicionado ao staging descartável autorizado |
| Bee Actions + Impact Foundation V1 | **FIX/AUDIT** | Zapia / Dodo | PR #4; hardening QA/governança; nova auditoria de Dodo | 02/09/2026; sem promoção antes da auditoria |

**Fechamento PR #4:** `READY FOR STAGING`; head congelado em `311c6d3028fc3685c6479810e497db58b2695023`.

**Bee Actions + Impact Foundation V1:** permanece em `FIX/AUDIT` nesta branch. O hardening é aditivo e aguarda nova auditoria de Dodo. Não está `READY FOR STAGING`.

## Caminho após as fundações

As etapas abaixo são planejamento futuro. Não estão implementadas nesta branch e não devem ser interpretadas como entregas concluídas:

| Próxima entrega | Prazo-alvo / gate |
|---|---|
| Organizational Memory + Event Layer | 03/09/2026 |
| Decision Engine + wiring core | 04/09/2026 |
| Organizational Reading Engine V1 | 05/09/2026 |
| Evidence + Recommendation operacional | 06/09/2026 |
| Bee Runtime V1 | 07–08/09/2026 |
| Product Wiring + jornadas por papel + Home de decisões | 09–10/09/2026 |
| Pilot Readiness, regressão, onboarding/importação, white-label básico, auditoria/observabilidade e staging final | a partir de 11/09/2026, condicionado aos gates reais de staging |

## Bloqueios e regras de qualidade

- Execução autenticada em staging descartável ainda pendente; nenhum horário é inventado.
- Nenhuma migration será aplicada em staging ou produção sem autorização explícita.
- Nenhum merge automático e nenhuma alteração em `main`.
- A suíte SQL não é declarada `PASS` sem execução autenticada real.
- PR #1, PR #2 e PR #4 aguardam execução autenticada assim que o staging descartável autorizado estiver disponível.
- O PR #4 permanece limitado à fundação estrutural de Recommendation & Intervention V1.
