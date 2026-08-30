# youB — Access Model v1

> Contrato arquitetural da Sprint 1. Separa plataforma, partner/reseller e organização. Não substitui RLS e não é fonte única de segurança.

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

- `platform_admin`: administração operacional da plataforma;
- `platform_support`: suporte temporário e mínimo, sempre auditado;
- `platform_analyst`: dados agregados e explicitamente autorizados.

### Partner / Reseller

- `partner_admin`: gestão do tenant de partner;
- `partner_operator`: implantação e operação delegada;
- `partner_support`: suporte limitado às organizações concedidas.

O vínculo partner–organization é uma relação própria, com estado, escopo, validade e auditoria. Usuário de partner não se torna membro de todas as organizações.

### Organização

- `organization_admin`: configuração da organização e usuários autorizados;
- `diretoria`: visão e decisões conforme capability;
- `rh`: governança de pessoas, ciclos, recomendações e intervenções;
- `gestor`: escopo da equipe/cadeia autorizada;
- `colaborador`: próprio perfil e dados permitidos.

`admin_youb` permanece somente como compatibilidade histórica durante a transição. Não é autorização global da plataforma.

## Princípios obrigatórios

1. `organization_id` não autoriza quando vier somente do frontend.
2. O servidor resolve o tenant pelo contexto autenticado.
3. Toda entidade de negócio pertence a exatamente um tenant.
4. Toda referência entre entidades deve ser validada no mesmo tenant.
5. RLS é obrigatório mesmo com API/BFF.
6. UI pode ocultar ações; backend/RLS autoriza.
7. Branding, domínio, logo, cores e nome da Bi não definem acesso.
8. Suporte é temporário, explícito e auditado.
9. A Bi recebe somente contexto já filtrado pela autorização.
10. Acesso a dados sensíveis, exportação e uso de IA gera auditoria.

## Contexto de requisição

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

`populationScope` pode representar organização, unidade, área, time, cadeia de gestão ou próprio usuário. `manager_employee_id` é dado organizacional; não é sozinho uma prova de autorização.

## Compatibilidade com o banco atual

- Reutilizar organizations, memberships, employees, areas, positions, competencies, cycles, assessments, feedbacks, pdis e checkins.
- Manter a criação legada de organização até existir provisionamento contextual.
- Não alterar o significado dos dados existentes sem migration de compatibilidade.
- Adicionar capabilities e escopos sem assumir que uma role textual é suficiente.
- Não usar HTML legado ou dados de cliente como seed.

## Matriz inicial

| Capacidade | Plataforma | Partner | Organização | Gestor | Colaborador |
|---|---:|---:|---:|---:|---:|
| Administrar plataforma | Sim | Não | Não | Não | Não |
| Administrar organizações delegadas | Conforme grant | Sim | Própria | Não | Não |
| Administrar usuários | Suporte auditado | Conforme grant | Sim | Não | Não |
| Visão organizacional | Agregado | Conforme grant | Conforme role | Equipe | Próprio |
| Criar recomendação | Não padrão | Conforme grant | RH/diretoria | Conforme fluxo | Não |
| Aprovar investimento | Não padrão | Conforme grant | Conforme política | Não padrão | Não |
| Dados individuais sensíveis | Mínimo/auditado | Mínimo/auditado | Conforme escopo | Equipe autorizada | Próprio permitido |

A matriz precisa ser detalhada por recurso, ação, população e sensibilidade antes da implementação.

## Transição de `admin_youb`

Não fazer rename destrutivo. A transição deve inventariar memberships, separar organização de suporte de plataforma, criar vínculos mínimos, preservar histórico, testar dois tenants e remover dependências do frontend somente depois da validação.

## Critérios de aceite

- Usuário de organização não consulta outro tenant, inclusive por IDs relacionados.
- Gestor não acessa pessoas fora do escopo definido.
- Partner só acessa organizações com grant ativo.
- Suporte só acessa operação autorizada e fica auditado.
- Branding diferente não altera autorização.
- Bi não recupera registros fora do contexto.
- Frontend não é necessário para garantir segurança.
- Toda decisão de acesso é explicável por identidade, camada, capability, escopo e estado.
