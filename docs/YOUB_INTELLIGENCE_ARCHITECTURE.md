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

## Decision Engine + Wiring Core V1

O Decision Engine V1 adiciona `intelligence_decisions` como registro tenant-safe de escolha humana. A arquitetura preserva a cadeia: Recommendation (proposta) → Decision (escolha) → Approval (autorização adicional, quando exigida) → Intervention (plano explícito) → Action (execução) → Outcome (medição). Nenhuma etapa gera a seguinte por trigger ou automação.

Uma Recommendation pode ter zero ou várias Decisions históricas. Uma Decision pode ter zero ou várias intervenções por meio de `intelligence_decision_interventions`, com vínculo explícito `derived_from_decision` e FKs compostas tenant-safe. Interventions, Actions e Outcomes continuam usando as tabelas existentes; não há duplicação de estado operacional.

Decisions podem ser representadas na Organizational Memory por serviço controlado como entidade `decision`, com relação temporal e `knowledge_kind` explícito; decisões superseded permanecem disponíveis. O Event Layer recebe somente contratos implementados controlados (`decision_created`, `decision_approved`, `decision_rejected`, `decision_deferred`, `decision_superseded`, `decision_effective`), sem captura automática.

`evidence_snapshot` preserva o estado disponível no momento da decisão e não recalcula o passado. `alternatives_considered` e `unknowns` são arrays JSONB; `evidence_snapshot` e `context` são objetos JSONB. A Bee poderá preparar rascunhos, mas não autoaprovar decisões sensíveis. Organizational Reading Engine, Evidence Engine automático, Bee Runtime, LLM, UI final, scoring e automações permanecem fora do escopo.

### Hardening: Decision colaborativa e versionável

`intelligence_decisions` continua representando o estado corrente. Enquanto está em `draft` ou `pending_review`, admin_youb, RH e diretoria (dentro do escopo organizacional permitido) podem colaborar por uma função controlada. Cada alteração substantiva grava uma linha em `intelligence_decision_revisions`, com snapshots JSONB estruturados antes/depois, `changed_by_user_id`, motivo e sequência append-only. O `evidence_snapshot` pode mudar nesses estados somente por esse caminho.

Em `pending_approval`, diretoria pode aprovar sem alteração, rejeitar, devolver para revisão ou revisar conteúdo. Uma revisão nesse estado sempre retorna a Decision para `pending_review`; portanto, não existe aprovação implícita do conteúdo alterado. A aprovação final grava `approved_by=auth.uid()` e `approved_at` e leva a decisão a `decided`; isso não executa Action.

Depois de `decided` ou `effective`, o estado corrente é protegido contra update autenticado direto. Uma mudança é uma nova Decision criada pelo serviço de supersession: a nova linha contém `supersedes_decision_id` apontando para a predecessora, e a predecessora muda para `superseded`. A predecessora não aponta para frente e nenhuma das duas é apagada.

Os contratos controlados `decision_revised` e `decision_returned_for_review`, além de `decision_approved`, foram adicionados ao Event Layer. Eles não são emitidos por triggers automáticos. Não são armazenadas conversa bruta, prompt completo ou chain-of-thought.

## Organizational Reading Engine V1 — Leitura Organizacional

A arquitetura expõe **Leitura Organizacional** como a camada entre Contexto e Padrões. A cadeia é: DADOS → CONTEXTO → LEITURAS ORGANIZACIONAIS → PADRÕES → HIPÓTESES → EVIDÊNCIAS → RECOMENDAÇÕES → DECISÕES → INTERVENÇÕES → AÇÕES → IMPACTO → MEMÓRIA ORGANIZACIONAL. O nome técnico legado `intelligence_signals` pode permanecer internamente sem transformar Signal no conceito de produto.

`intelligence_organizational_readings` registra uma interpretação estruturada tenant-safe com tipo controlado (`movement`, `pattern`, `anomaly`, `risk`, `opportunity`, `tension`, `gap`, `evolution`), escopo compartilhado, janela de observação, detecção, resumo de fonte e contexto. Em V1, `knowledge_kind` é obrigatoriamente `interpreted`: a Reading não é automaticamente fato, declaração, observação confirmada ou causa.

Reading e Hypothesis não são a mesma coisa. Reading descreve o que a organização apresenta; Hypothesis (`knowledge_kind = hypothesis`) registra uma explicação possível sobre por que isso ocorre. `supported` em uma hipótese não equivale a causalidade confirmada; Evidence Engine posterior continua necessário.

A junction `intelligence_organizational_reading_sources` referencia, com FKs compostas tenant-safe, múltiplas fontes existentes: `intelligence_evidence`, `knowledge_sources`, `knowledge_documents`, `organizational_events` e relações de memória. Não duplica o Evidence Engine. Cada vínculo declara seu tipo de relação e provenance.

Leituras podem ser registradas explicitamente na Organizational Memory como entidade `reading` e `knowledge_kind = interpreted`. O Event Layer recebe contratos controlados `organizational_reading_created`, `organizational_reading_updated`, `organizational_reading_supported` e `organizational_reading_dismissed`; nenhum trigger faz projeção automática.

Para preservar histórico, o estado corrente pode ser revisado pelo caminho controlado em `open`/`under_investigation`, com `intelligence_organizational_reading_revisions` append-only. A suíte e o contrato não armazenam conversa bruta, prompt completo ou chain-of-thought. Não há geração automática de evidência, scoring, ranking, ML, LLM, diagnóstico ou criação de Recommendation/Decision/Intervention/Action.
