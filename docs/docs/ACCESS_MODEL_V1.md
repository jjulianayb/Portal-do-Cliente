# youB — Access Model v1

> Contrato arquitetural da Sprint 1. Este documento separa escopo de plataforma, partner/reseller e organização. Não substitui RLS, não autoriza dados e não deve ser usado como fonte única de segurança.

## Objetivo

A autorização futura da youB deve seguir:

```text
PLATFORM
  └── PARTNER / RESELLER
        └── ORGANIZATION
              └── USERS / EMPLOYEES
```

A identidade do usuário é global. O acesso é contextual, mínimo e auditável.

## Camadas

### Plataforma

Escopo sobre a operação youB, nunca concedido por `organization_id` ou branding.

- `platform_admin`: administração operacional da plataforma;
- `platform_support`: suporte temporário e mínimo, sempre auditado;
- `platform_analyst`: somente dados agregados e explicitamente autorizados.

### Partner / Reseller

Escopo sobre organizações explicitamente vinculadas ao partner.

- `partner_admin`: gestão do tenant de partner;
- `partner_operator`: implantação e operação delegada;
- `partner_support`: suporte limitado às organizações concedidas.

O vínculo partner–organization deve ser uma relação própria, com estado, escopo, validade e auditoria. Ser usuário de um partner não torna a pessoa membro de todas as organizações.

### Organização

Escopo sobre uma organização específica.

- `organization_admin`: configuração da organização e usuários autorizados;
- `diretoria`: visão e decisões conforme capability concedida;
- `rh`: governança de pessoas, ciclos, recomendações e intervenções;
- `gestor`: escopo da equipe/cadeia autorizada;
- `colaborador`: próprio perfil e dados permitidos.

`admin_youb` permanece apenas como compatibilidade histórica durante a transição. Não deve ser tratado como autorização global da plataforma.

## Princípios obrigatórios

1. `organization_id` nunca é fonte de autorização quando vier somente do frontend.
2. O servidor resolve o tenant pelo contexto autenticado.
3. Toda entidade de negócio pertence a exatamente um tenant.
4. Toda referência entre entidades deve ser validada no mesmo tenant.
5. RLS é obrigatório mesmo quando existir API/BFF.
6. UI pode esconder ações; somente backend/RLS pode autorizá-las.
7. Branding, domínio, logo, cores e nome da Bi não definem acesso.
8. Acesso de suporte deve ser temporário, explícito e registrado.
9. A Bi recebe somente contexto já filtrado pela autorização do usuário.
10. Acesso a dados sensíveis, exportação e uso de IA gera evento de auditoria.

## Contexto de requisição

O backend deverá montar um contexto semelhante a:

```text
requestContext = {
  userId,
  platformCapabilities,
  partnerGrants,
  organizationId,
  organizationCapabilities,
  populationScope,
  purpose,
  requestId
}
```

`populationScope` pode representar organização, unidade, área, time, cadeia de gestão ou próprio usuário. `manager_employee_id` é dado organizacional; não é, sozinho, uma prova de autorização.

## Compatibilidade com o banco atual

- Reutilizar `organizations`, `memberships`, `employees`, `areas`, `positions`, `competencies`, `cycles`, `assessments`, `feedbacks`, `pdis` e `checkins`.
- Manter o fluxo legado de criação de organização somente até existir o provisionamento contextual.
- Não alterar o significado dos dados existentes sem migration de compatibilidade.
- Adicionar capacidades e escopos sem assumir que uma role textual é suficiente.
- Não usar o HTML legado ou dados do case de cliente como seed do produto.

## Matriz inicial de capacidade

| Capacidade | Plataforma | Partner | Organização | Gestor | Colaborador |
|---|---:|---:|---:|---:|---:|
| Administrar plataforma | Sim | Não | Não | Não | Não |
| Administrar organizações delegadas | Conforme grant | Sim | Própria | Não | Não |
| Administrar usuários da organização | Suporte auditado | Conforme grant | Sim | Não | Não |
| Ver visão organizacional | Agregado/justificado | Conforme grant | Conforme role | Equipe | Próprio |
| Criar recomendação | Não por padrão | Conforme grant | RH/diretoria | Conforme fluxo | Não |
| Aprovar investimento | Não por padrão | Conforme grant | Conforme política | Não por padrão | Não |
| Ver dados individuais sensíveis | Mínimo e auditado | Mínimo e auditado | Conforme escopo | Equipe autorizada | Próprio permitido |

A tabela é um contrato inicial e precisa ser detalhada por recurso, ação, população e sensibilidade antes da implementação.

## Transição de `admin_youb`

Não fazer rename destrutivo. A transição deve:

1. inventariar memberships atuais;
2. identificar administradores da organização versus suporte da plataforma;
3. criar o novo vínculo de plataforma somente para quem realmente precisa;
4. preservar histórico e auditoria;
5. testar cada papel em dois tenants;
6. remover dependências do frontend sobre `admin_youb` global;
7. somente depois de validação, descontinuar o uso legado.

## Critérios de aceite da fundação

- Um usuário de organização não consegue consultar outro tenant, inclusive por IDs relacionados.
- Um gestor não acessa pessoas fora do escopo definido.
- Um partner só acessa organizações com grant ativo.
- Um suporte de plataforma só acessa a operação autorizada e fica auditado.
- Branding diferente não altera nenhuma resposta de autorização.
- A Bi não recupera registros fora do contexto.
- O frontend não é necessário para garantir a segurança.
- Toda decisão de acesso pode ser explicada por identidade, camada, capability, escopo e estado.
