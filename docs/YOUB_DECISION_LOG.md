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
| 2026-09-01 | PR #4 está `READY FOR STAGING` após o fechamento final de QA/governança. | Os testes cross-tenant passaram a usar payloads válidos no tenant B e as assertions fail-fast foram revisadas. | A implementação continua sem merge e sem produção; o próximo gate é staging descartável autorizado. |
| 2026-09-01 | Bee Action Request é uma camada distinta de `intelligence_actions`. | Separar capacidade, solicitação, autorização e execução concreta sem duplicar a ação organizacional. | `bee_action_requests` registra metadados mínimos, referências tenant-safe e estados; não executa ações. |
| 2026-09-01 | Acesso ao dado não equivale a permissão para agir. | Leitura contextual e ação mediada têm riscos diferentes. | RLS e constraints conservadoras separam leitura, confirmação, aprovação e execução. |
| 2026-09-01 | Aprovação humana não é execução. | Evitar automação de decisões e efeitos irreversíveis. | Aprovação apenas habilita o contrato estrutural; não há trigger, RPC, webhook ou executor. |
| 2026-09-01 | `OUTPUT`, `OUTCOME` e `IMPACT` são conceitos distintos. | Evitar atribuir impacto a uma saída ou a uma associação. | Outcomes recebem níveis e força de afirmação explícitos, sem causalidade ou ROI automático. |
| 2026-09-01 | Associação não é causalidade; ROI nunca é presumido. | Guardar incerteza e evitar claims financeiros indevidos. | `causal_validated` exige validação e metodologia; `financial_value` exige valor não negativo, moeda e metodologia. |
| 2026-09-01 | Conversa privada da Bee não vira relatório escondido. | Preservar privacidade e limitar o registro ao necessário. | A tabela de requests armazena metadados e payload mínimo, sem conversa bruta ou prompt completo. |
| 2026-09-01 | A máquina de estados de autorização deve ser coerente e conservadora. | Impedir execução ativa sem autorização correspondente e impedir estados impossíveis. | `none` só aceita `not_required`; confirmation/approval têm estados próprios; aprovação exige provenance; rejected/expired não executam; sensitive + execute exige approval; completed exige `executed_at`. |
| 2026-09-01 | Todo Outcome `validated` exige provenance de validação; valor financeiro exige metodologia. | Evitar validações sem responsável/data e valores financeiros sem base metodológica. | `validated_by`/`validated_at` são obrigatórios; `financial_value` exige valor não negativo, `currency` e `measurement_methodology`, sem cálculo de ROI. |
| 2026-09-01 | Provenance de requester/confirmed_by/approved_by/validated_by será validada na fronteira server-side em etapa futura. | Validar tenant e autoridade sem destruir histórico nem bloquear offboarding. | Não criar agora FK de membership; a fronteira server-side fica fora deste PR. |

## Estado de governança

- PR #1: `READY FOR STAGING`.
- PR #2: `READY FOR STAGING`.
- PR #4: `READY FOR STAGING`.
- Bee Actions + Impact Foundation V1: `FIX/AUDIT`; aguarda nova auditoria de Dodo.
- Bloqueio comum: execução autenticada em staging descartável ainda pendente.

A implementação continua sem merge e sem aplicação em produção. Nenhuma decisão deste log autoriza migration, staging ou merge.

## Estado da nova entrega

Bee Actions + Impact Foundation V1: `FIX/AUDIT` após o hardening de QA/governança; aguarda auditoria de Dodo e não será `READY FOR STAGING` antes dela.
