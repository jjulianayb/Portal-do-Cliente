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
