# Matriz de validação — permissões por perfil

## Perfis

- `admin_youb`: administração completa da organização.
- `diretoria`: gestão estrutural e de pessoas.
- `rh`: gestão de pessoas, políticas e aprovações de RH.
- `gestor`: acompanhamento e registros operacionais da equipe autorizada.
- `colaborador`: leitura dos próprios registros, quando vinculado por `employees.auth_user_id`.

## Matriz esperada

| Ação | Admin | Diretoria | RH | Gestor | Colaborador |
|---|---:|---:|---:|---:|---:|
| Consultar áreas e cargos | Sim | Sim | Sim | Sim | Sim |
| Criar/editar áreas e cargos | Sim | Sim | Sim | Não | Não |
| Consultar equipe | Sim | Sim | Sim | Sim | Próprio vínculo |
| Criar/editar colaborador | Sim | Sim | Sim | Não | Não |
| Criar ciclo | Sim | Sim | Sim | Não | Não |
| Criar avaliação | Sim | Sim | Sim | Sim | Não |
| Criar feedback | Sim | Sim | Sim | Sim | Não |
| Criar PDI | Sim | Sim | Sim | Sim | Não |
| Consultar check-ins | Sim | Sim | Sim | Sim | Próprio vínculo |
| Criar/atualizar check-in | Sim | Sim | Sim | Sim | Não |
| Registrar medida disciplinar | Sim | Sim | Sim | Sim | Não |
| Editar/remover medida disciplinar | Sim | Sim | Sim | Não | Não |
| Configurar política disciplinar | Sim | Sim | Sim | Não | Não |
| Gerenciar aprovadores intermediários | Sim | Sim | Sim | Não | Não |
| Aprovar etapa intermediária | Se autorizado | Se autorizado | Se autorizado | Conforme cadastro | Não |
| Aprovar etapa RH | Sim | Sim | Sim | Não | Não |

## Testes funcionais

1. Entrar com um administrador e confirmar menu completo e operações administrativas.
2. Entrar com diretoria e confirmar estrutura, ciclos, políticas e histórico.
3. Entrar com RH e confirmar gestão de pessoas, medidas e aprovações.
4. Entrar com gestor e confirmar apenas módulos operacionais permitidos.
5. Entrar com colaborador vinculado e confirmar leitura somente do próprio registro.
6. Tentar acessar uma segunda organização com cada perfil e confirmar retorno vazio/bloqueio.
7. Criar uma medida disciplinar como gestor e confirmar a sequência configurada.
8. Tentar aprovar a etapa intermediária com e-mail não cadastrado e confirmar bloqueio.
9. Aprovar com o responsável cadastrado e confirmar avanço para a etapa seguinte.
10. Tentar concluir a medida antes das aprovações obrigatórias e confirmar bloqueio.
11. Verificar que a substituição de aprovador preserva os registros anteriores.
12. Regressão: criar check-in, feedback, PDI, avaliação e histórico individual.

## Critério de aprovação

- Nenhum perfil acessa dados de outra organização.
- Nenhum colaborador visualiza dados sensíveis de outra pessoa.
- Operações fora do papel são bloqueadas no banco, não apenas escondidas na interface.
- O histórico disciplinar e de aprovações permanece íntegro.
- Typecheck, build e migrações passam no pipeline.

## Limitação do ambiente de demonstração

A validação completa de cada papel exige contas de teste separadas, com memberships distintas e, para o colaborador, vínculo em `employees.auth_user_id`. O pipeline confirma a integridade do código; os cenários de autorização devem ser executados com essas contas antes da produção.
