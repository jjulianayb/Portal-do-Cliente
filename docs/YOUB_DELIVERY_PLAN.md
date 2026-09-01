# youB — Delivery Plan

## Papéis

- **Juliana** — Product Owner; prioriza, aprova escopo e decisões de produto.
- **Dodo** — CTO / Arquitetura / PMO / QA; define guardrails, revisa desenho, coordena qualidade e auditoria.
- **Zapia** — implementação; executa mudanças autorizadas, validações e registro de evidências.

## Estados oficiais

`BACKLOG → SPEC READY → BUILDING → AUDIT → FIX → BLOCKED → READY FOR STAGING → READY FOR MERGE → DONE`

Os estados não são necessariamente lineares: uma auditoria pode retornar o item para `FIX` ou `BLOCKED`.

## Entregas atuais

| Entrega | Estado | Responsável principal | Dependências | Prazo-alvo |
|---|---|---|---|---|
| PR #1 — fundação multiempresa/RLS | READY FOR STAGING | Zapia / Dodo | revisão de staging autorizada | a definir |
| PR #2 — Intelligence Core | READY FOR STAGING | Zapia / Dodo | PR #1; execução autenticada em staging | a definir |
| PR #4 — Recommendation & Intervention Model V1 | FIX/AUDIT | Zapia / Dodo | PR #2; restauração da suíte base; auditoria fail-fast | a definir |

## Próximas entregas — ainda não implementadas

1. **Bee Actions + Impact** — contratos para ações, resultados e impacto, sem afirmar implementação neste PR.
2. **Organizational Memory + Event Layer** — memória organizacional e eventos rastreáveis, sem afirmar implementação neste PR.
3. **Decision Engine** — camada futura para decisões explicáveis e aprovadas humanamente, sem afirmar implementação neste PR.

## Gate de qualidade

- Nenhuma migration será aplicada em staging ou produção sem autorização explícita.
- Nenhum merge automático.
- O PR #4 só avança após diff da suíte base vazio, fail-fast revisado, Actions/build/typecheck verificados e validação autenticada autorizada.
- Não implementar Bee Actions, Impact, Memory ou Decision Engine no PR #4.
