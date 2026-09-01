# youB — Decision Log

## Decisões arquiteturais aprovadas

| Data | Decisão | Motivo | Impacto |
|---|---|---|---|
| 2026-08-26 | O produto deve ser multiempresa com isolamento por tenant. | Evitar vazamento entre organizações desde a fundação. | `organization_id`, FKs tenant-safe e RLS tornam o tenant parte do contrato estrutural. |
| 2026-08-27 | RLS é a autoridade de autorização; frontend não é mecanismo de segurança. | Impedir que escopo visual ou payload determine acesso. | Toda leitura e escrita sensível depende de políticas e funções SQL autorizadas. |
| 2026-08-30 | A escrita direta de sinais fica restrita a `admin_youb` e `rh` no próprio tenant. | Separar leitura de inteligência de ingestão privilegiada. | Colaborador, gestor e diretoria não recebem CRUD genérico de sinais. |
| 2026-08-31 | Recommendation & Intervention V1 é fundação estrutural, sem IA ou automação. | Evoluir incrementalmente sem acoplar produto a algoritmo prematuro. | Contratos são explícitos, explicáveis e rastreáveis; geração e execução ficam para fases futuras. |
| 2026-08-31 | A junction Recommendation–Evidence é a relação oficial. | Preservar múltiplas evidências, inclusive contraditórias. | `source_evidence_ids` permanece apenas como compatibilidade/denormalização. |
| 2026-08-31 | `insufficient` não pode aceitar `intervene`. | Evitar intervenção sem base mínima de evidência. | Constraint estrutural rejeita a combinação inválida. |
| 2026-08-31 | Escopo descritivo nunca autoriza acesso. | Evitar confundir alvo de negócio com autorização. | `scope_ref` e `target_scope_ref` são referências, não controles de segurança. |
| 2026-09-01 | Aprovação humana não cria nem executa Intervention automaticamente. | Evitar decisões organizacionais irreversíveis sem revisão. | O contrato registra aprovação, mas não há trigger, workflow ou action automática. |
| 2026-09-01 | Bee será role-aware e conversas privadas não serão expostas individualmente a gestores. | Proteger privacidade e manter utilidade contextual. | Compartilhamento depende de autorização, agregação ou consentimento explícito. |
| 2026-09-01 | Nenhuma decisão sensível será autônoma. | Risco humano, jurídico e ético. | Demissões, promoções, remuneração, disciplina e diagnósticos permanecem decisões humanas. |

## Estado de governança

PR #1 e PR #2: `READY FOR STAGING`.
PR #4: `FIX/AUDIT`.

Nenhuma decisão deste log autoriza aplicação de migration, staging, produção ou merge.
