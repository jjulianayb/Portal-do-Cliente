# youB — Delivery Plan

## Papéis

- **Juliana** — Product Owner; prioriza, aprova escopo e decisões de produto.
- **Dodo** — CTO / Arquitetura / PMO / QA; define guardrails, revisa desenho, coordena qualidade e auditoria.
- **Zapia** — implementação; executa mudanças autorizadas, validações e registro de evidências.

## Estados oficiais

`BACKLOG → SPEC READY → BUILDING → AUDIT → FIX → BLOCKED → READY FOR STAGING → READY FOR MERGE → DONE`

## Entregas atuais

| Entrega | Estado | Responsável | Dependências | Prazo-alvo / gate |
|---|---|---|---|---|
| PR #1 — fundação multiempresa/RLS | READY FOR STAGING | Zapia / Dodo | staging descartável autorizado | assim que o staging descartável autorizado estiver disponível |
| PR #2 — Intelligence Core | READY FOR STAGING | Zapia / Dodo | PR #1; staging descartável autorizado | assim que o staging descartável autorizado estiver disponível |
| PR #4 — Recommendation & Intervention Model V1 | READY FOR STAGING | Zapia / Dodo | PR #2; auditoria fail-fast concluída | assim que o staging descartável autorizado estiver disponível |
| Bee Actions + Impact Foundation V1 | AUDIT | Zapia / Dodo | PR #4; contrato de autorização e Impact Model V1 | 02/09/2026 |

**Fechamento PR #4:** `READY FOR STAGING`; head congelado em `311c6d3028fc3685c6479810e497db58b2695023`.

**Nova entrega:** Bee Actions + Impact Foundation V1 está em `AUDIT` nesta branch após a implementação estrutural. A entrega não será promovida para `READY FOR STAGING` antes da auditoria de Dodo.

## Bloqueio comum

- **Execução autenticada em staging descartável ainda pendente.** O gate é a disponibilidade de staging descartável autorizado; nenhum horário é inventado.

## Próximas entregas — fora do escopo desta branch

| Entrega | Prazo-alvo operacional |
|---|---|
| Organizational Memory + Event Layer | 03/09/2026 |
| Decision Engine + wiring das jornadas | 04/09/2026 |
| Integração / regressão / readiness | 05/09/2026 |

A fundação Bee Actions + Impact V1 tem prazo-alvo de 02/09/2026 e está registrada acima como `AUDIT`, aguardando auditoria de Dodo. As demais entregas são planejamento futuro e não são implementadas nesta branch.

## Gate de qualidade

- Nenhuma migration será aplicada em staging ou produção sem autorização explícita.
- Nenhum merge automático.
- PR #1, PR #2 e PR #4 aguardam execução autenticada assim que o staging descartável autorizado estiver disponível.
- O PR #4 permanece limitado à fundação estrutural de Recommendation & Intervention V1.
