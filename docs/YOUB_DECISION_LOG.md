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
| 2026-09-01 | PR #5 foi congelado no head `f8670a512b14d55e82bde213bf2e4f6de4c4a96a` e promovido documentalmente a `READY FOR STAGING`. | Encerrar o patch de QA sem alterar escopo funcional. | A suíte SQL autenticada continua pendente de staging; `READY FOR STAGING` não é `READY FOR MERGE`. |

## Estado de governança

- PR #1: `READY FOR STAGING`.
- PR #2: `READY FOR STAGING`.
- PR #4: `READY FOR STAGING`.
- Bee Actions + Impact Foundation V1: `READY FOR STAGING`; head congelado em `f8670a512b14d55e82bde213bf2e4f6de4c4a96a`.
- Bloqueio comum: execução autenticada em staging descartável ainda pendente.

A implementação continua sem merge e sem aplicação em produção. Nenhuma decisão deste log autoriza migration, staging ou merge.

## Estado da nova entrega

- Bee Actions + Impact Foundation V1: `READY FOR STAGING`, congelado no head `f8670a512b14d55e82bde213bf2e4f6de4c4a96a`; a suíte SQL autenticada continua pendente e isso não é `READY FOR MERGE`.
- Organizational Memory + Event Layer V1: `READY FOR STAGING` na branch `feature/organizational-memory-event-layer-v1`, baseada exatamente em `f8670a512b14d55e82bde213bf2e4f6de4c4a96a`; correção mínima da suíte, build/typecheck e fechamento técnico concluídos. A execução SQL autenticada em staging continua pendente e `READY FOR STAGING` não é `READY FOR MERGE`.

Bee Actions + Impact Foundation V1: `READY FOR STAGING`, congelado no head `f8670a512b14d55e82bde213bf2e4f6de4c4a96a`. A suíte SQL autenticada ainda depende de staging descartável autorizado. Este estado não autoriza merge nem aplicação em produção.


| 2026-09-01 | Organizational Memory + Event Layer V1 usa PostgreSQL com relações temporais e eventos leves append-oriented. | Manter a base operacional existente e criar memória estruturada sem graph database ou event sourcing completo. | Não há replay, Kafka/queue, trigger global ou substituição das tabelas operacionais. |
| 2026-09-01 | Memória distingue explicitamente `fact`, `declaration`, `reading`, `hypothesis`, `decision`, `intervention` e `outcome`; hipótese nunca é fato. | Preservar o tipo epistemológico e evitar promoção silenciosa de incerteza. | `knowledge_kind` é controlado; `hypothesis` permanece identificada como hipótese. |
| 2026-09-01 | Relações históricas são preservadas por encerramento temporal e nova inserção, sem sobrescrever a história. | Permitir mudanças de gestor/cargo/área/unidade com rastreabilidade. | `valid_until` não pode anteceder `valid_from`; IDs polimórficos são descritivos e não autorizam acesso. |
| 2026-09-01 | Vocabulários de entidades, relações e eventos são catálogos controlados e extensíveis por mudança explícita. | Impedir texto arbitrário silencioso e manter contrato evolutivo. | Eventos de compliance de treinamento entram apenas como contrato futuro, com `implemented=false`; a funcionalidade não está neste PR. |
| 2026-09-01 | O event layer registra ocorrências, não estado atual. | Separar fatos ocorridos das tabelas operacionais e evitar event sourcing implícito. | Eventos são append-oriented; V1 não implementa replay nem captura automática por triggers. |
| 2026-09-01 | RLS de memória/eventos é tenant-safe e conservador. | Evitar leitura genérica por gestor/colaborador e vazamento entre organizações. | Admin/RH gerem no próprio tenant; diretoria lê somente sensibilidades permitidas; IDs polimórficos não substituem autorização. |
| 2026-09-01 | Contexto e payload são JSONB objeto; conversa bruta da Bee não é armazenada. | Preservar estrutura mínima e privacidade. | Serviços expõem leitura tipada; não há prompt completo, conversa ou mensagem bruta. |

| 2026-09-01 | Organizational Memory + Event Layer V1 concluiu a correção mínima da suíte e o Build/typecheck e entrou em `READY FOR STAGING`. | Separar fechamento técnico da execução SQL autenticada em staging e do merge. | `READY FOR STAGING` não é `READY FOR MERGE`; staging autenticado e decisão posterior continuam obrigatórios. |

## Entrega futura registrada

**Training Compliance & Development Calendar** permanece futura e **NÃO IMPLEMENTADA**. O escopo planejado inclui catálogo obrigatório e de desenvolvimento, aplicabilidade por cargo/área/unidade, periodicidade/validade, histórico, próxima realização, calendário individual, alertas configuráveis para colaborador, gestor, RH/SSMA e facilitador, convocação, presença/conclusão, certificado, recertificação, status em dia/vencendo/agendamento necessário/vencido/não aplicável e integração futura com Bee, Organizational Reading e Impact.

## Decision Engine + Wiring Core V1

- PR #6 permanece `READY FOR STAGING`, congelado no head `023c07d52150955d488ae124fab4a6371b9e3eff`; não será alterado salvo bug real posterior.
- Decision Engine + Wiring Core V1 está em `READY FOR STAGING` na branch `feature/decision-engine-v1`, após a correção mínima da assertion JSON e novo Build/typecheck. `READY FOR STAGING` não é `READY FOR MERGE`; a execução SQL autenticada em staging continua pendente.
- Recommendation, Decision, Approval, Intervention, Action e Outcome são contratos distintos. Decidir ou aprovar não executa ação e não cria intervenção automaticamente.
- O Decision Engine usa a escala de risco Bee Action existente, mantém snapshots de evidência e registra decisões superseded sem apagar o histórico. `scope_ref` é descritivo e nunca autoriza acesso.
- A Bee poderá preparar/draftar decisões no futuro, mas nunca autoaprovar decisão sensível; não há LLM, scoring, UI final, Evidence Engine automático, Organizational Reading Engine ou Bee Runtime nesta entrega.

### Hardening final do Decision Engine V1

- Diretoria pode decidir, revisar decisões em `draft`/`pending_review` e aprovar somente quando for o approver requerido (`approval_required=true`, `required_approver_role='diretoria'`).
- Revisões são append-only em `intelligence_decision_revisions`; snapshots anterior/novo, autoria, motivo e número da revisão são preservados.
- Alteração substantiva durante `pending_approval` devolve a decisão para `pending_review` e precisa ser revisada antes da aprovação final.
- Aprovação, rejeição e retorno para revisão usam funções controladas e provenance clara; a Bee não pode autoaprovar decisões sensíveis.
- Atualização autenticada direta foi revogada. Depois de `decided`/`effective`, uma mudança exige nova Decision via supersession controlada.
- Semântica corrigida: a nova Decision aponta para a predecessora; a predecessora recebe `superseded`; sucessora e predecessora permanecem disponíveis.
