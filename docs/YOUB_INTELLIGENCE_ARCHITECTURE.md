# youB — Intelligence Architecture

## Cadeia oficial

`DADOS → CONTEXTO → LEITURAS ORGANIZACIONAIS → PADRÕES → HIPÓTESES → EVIDÊNCIAS → RECOMENDAÇÕES → DECISÕES → INTERVENÇÕES → AÇÕES → IMPACTO → MEMÓRIA ORGANIZACIONAL`

A cadeia separa observação, interpretação, hipótese, evidência, recomendação, decisão e execução. Uma hipótese não é fato; deve permanecer identificada como hipótese até receber evidência suficiente.

## Princípios

- **Bee** é a interface inteligente role-aware: adapta linguagem e escopo ao papel e ao contexto autorizado.
- **RLS** é a autoridade de acesso. Frontend, `scope_ref` e filtros de interface nunca substituem RLS.
- **Leitura Organizacional** é a linguagem do produto para transformar dados contextualizados em leituras explicáveis e acionáveis.
- Recomendações são contratos estruturados, rastreáveis e explicáveis; não são texto livre autônomo.
- Evidências de apoio, contradição e neutralidade devem ser preservadas.
- Conversas privadas da Bee não são expostas individualmente a gestores. Só informações autorizadas, agregadas ou explicitamente compartilháveis podem atravessar esse limite.
- Aprovação humana é obrigatória quando o contrato exigir; aprovação não significa execução automática.
- Nenhuma decisão sensível pode ser autônoma: demissão, promoção, remuneração, disciplina, diagnóstico de saúde/saúde mental ou equivalente exigem decisão humana e controles próprios.

## Escopo do PR #4

O PR #4 cria somente a fundação estrutural de Recommendation & Intervention V1: campos, constraints, relações, políticas conservadoras, contratos de leitura e testes. Não implementa LLM, scoring, ranking, matching, Decision Engine, Bee Actions, Impact, Memory ou Event Layer.


## Bee Action Authorization + Impact Model V1

- A capacidade da Bee (`observe`, `explain`, `ask`, `recommend`, `prepare`, `execute`) é diferente da autorização para agir.
- Acesso ao dado é diferente de permissão para agir; RLS continua sendo a autoridade.
- Aprovação humana é um registro de autorização, não execução. A camada não dispara executor, trigger, RPC ou webhook.
- Conversa privada não vira relatório escondido: `bee_action_requests` armazena metadados e payload mínimo, nunca conversa bruta, prompt completo ou mensagem privada.
- `intelligence_actions` continua representando a ação organizacional concreta; `bee_action_requests` representa solicitação, autorização e auditoria.
- **OUTPUT ≠ OUTCOME ≠ IMPACT**: uma saída da Bee, um resultado observado e um impacto organizacional são conceitos distintos.
- Associação não é causalidade. `claim_strength` é declarado, não inferido, e `causal_validated` exige validação explícita.
- ROI nunca é presumido; valores financeiros, quando existentes, são registrados com moeda e metodologia.


## Organizational Memory + Event Layer V1

A branch `feature/organizational-memory-event-layer-v1` adiciona uma camada estruturada e temporal sobre PostgreSQL. Ela não usa graph database, não implementa event sourcing completo, replay da aplicação, Kafka/queue ou captura automática por triggers. As tabelas operacionais existentes continuam sendo a fonte de estado atual; eventos representam ocorrências registradas.

### Memória temporal

`organizational_memory_relations` conecta entidades por relação temporal com `organization_id`, tipos e IDs de origem/destino, relação, `knowledge_kind`, intervalo de validade, origem, sensibilidade e contexto JSONB objeto. Os tipos epistemológicos distinguem `fact`, `declaration`, `reading`, `hypothesis`, `decision`, `intervention` e `outcome`; hipótese não é fato e não é promovida implicitamente. Mudanças históricas encerram a relação anterior com `valid_until` e inserem uma nova relação, preservando a história. IDs polimórficos são referências descritivas sem FK falsa e nunca autorizam acesso.

### Event layer

`organizational_events` é append-oriented e registra `event_type`, entidade, ocorrência, registro, origem, ator, sensibilidade, payload JSONB objeto e correlação. Seu vocabulário é mantido em catálogo controlado: tipos arbitrários são rejeitados e novas extensões exigem mudança explícita no catálogo. O contrato inclui eventos de pessoas, feedback, check-in, PDI, assessment, aprendizagem, leitura, recomendação, decisão, intervenção, ação e outcome, além de contratos futuros de treinamento (`training_assigned`, `training_scheduled`, `training_completed`, `training_expiring`, `training_expired`, `recertification_scheduled`) marcados como não implementados. Não há replay, substituição de estado ou automação global. Conversa bruta da Bee não é armazenada.

### Segurança

RLS é tenant-safe: `admin_youb` e `rh` gerenciam memória no próprio tenant e registram eventos; diretoria lê somente conteúdo organizacional dentro das sensibilidades permitidas; gestor e colaborador não recebem leitura genérica. `standard`, `restricted` e `highly_sensitive` são vocabulários controlados. O contrato de leitura TypeScript é read-only para relações e eventos.
