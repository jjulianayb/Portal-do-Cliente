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
| Bee Actions + Impact Foundation V1 | **READY FOR STAGING** | Zapia / Dodo | PR #4; hardening QA/governança concluído | staging descartável autorizado; sem promoção para merge antes dos gates reais |

**Fechamento PR #4:** `READY FOR STAGING`; head congelado em `311c6d3028fc3685c6479810e497db58b2695023`.

**Bee Actions + Impact Foundation V1:** `READY FOR STAGING`; head congelado em `f8670a512b14d55e82bde213bf2e4f6de4c4a96a`. Esta mudança é de governança após o patch final de QA; não altera o escopo funcional. A suíte SQL autenticada continua pendente de execução em staging descartável autorizado. `READY FOR STAGING` não significa `READY FOR MERGE`.

## Caminho após as fundações

As etapas abaixo são planejamento futuro. Não estão implementadas nesta branch e não devem ser interpretadas como entregas concluídas:

| Próxima entrega | Prazo-alvo / gate |
|---|---|
| Organizational Memory + Event Layer | 03/09/2026 |
| Training Compliance & Development Calendar | Futuro; não implementado |
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
- A suíte SQL autenticada de Bee/Impact continua pendente de staging e não é declarada `PASS` sem execução autenticada real.
- `READY FOR STAGING` não autoriza merge; o PR #5 permanece sem merge até os gates de staging e a decisão posterior de governança.
- PR #1, PR #2 e PR #4 aguardam execução autenticada assim que o staging descartável autorizado estiver disponível.
- O PR #4 permanece limitado à fundação estrutural de Recommendation & Intervention V1.

## Entrega futura — Training Compliance & Development Calendar

Entrega futura, **NÃO IMPLEMENTADA** e fora do PR #5. Escopo planejado: catálogo de treinamentos obrigatórios e de desenvolvimento; aplicabilidade por cargo, área e unidade; periodicidade e validade; histórico; próxima realização; calendário individual; alertas configuráveis para colaborador, gestor, RH/SSMA e facilitador; convocação; presença/conclusão; certificado; recertificação; status em dia, vencendo, agendamento necessário, vencido ou não aplicável; e integração futura com Bee, Organizational Reading e Impact.

