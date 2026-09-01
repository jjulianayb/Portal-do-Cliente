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
