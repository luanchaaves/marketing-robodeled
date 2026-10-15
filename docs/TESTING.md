# Estratégia de Testes e Garantia de Qualidade (QA)

Este documento descreve a pirâmide de testes, metodologia de validação automatizada, matriz de cobertura e checklist de QA manual da **Plataforma Privada de Marketing Digital — Robô LED Partner**.

---

## 1. Filosofia e Diretrizes de Qualidade

A plataforma segue o princípio de que **nenhuma funcionalidade é considerada concluída sem testes automatizados que comprovem seu comportamento**:
- **Zero Divisões por Zero:** Todos os cálculos financeiros (CPL, CAC, ROAS, CTR, CPC, CPM) possuem testes unitários cobrindo cenários com valores nulos, zerados e negativos.
- **Segurança e RBAC:** Todos os endpoints sensíveis possuem testes de autorização validando a rejeição de requisições não autenticadas ou com perfis insuficientes (`READONLY` tentando mutações).
- **Validação de Webhooks:** Testes de assinatura criptográfica HMAC SHA-256 para prevenir falsificação de requisições de leads.
- **Tipagem Estrita:** 100% do código TypeScript roda em modo `strict` sem supressões artificiais.

---

## 2. Estrutura da Suíte de Testes

Os testes são executados através do **Vitest** com suporte nativo a ESM e TypeScript:

```
server/
├── tests/
│   ├── unit/
│   │   ├── auth.service.spec.ts         # Hashing Argon2id, emissão e revogação de JWT/cookies
│   │   ├── metrics.calculator.spec.ts   # Fórmulas de CPL, CAC, ROAS, Lucro Líquido e guardas numéricas
│   │   ├── lead.validator.spec.ts       # Schemas Zod de leads, telefones E.164 e datas de evento
│   │   ├── attribution.spec.ts          # Mapeamento de UTMs e atribuição first/last touch
│   │   └── webhook.signature.spec.ts    # Validação de HMAC SHA-256 do Meta e n8n
│   └── integration/
│       ├── auth.routes.spec.ts          # Endpoints /api/v1/auth/login, /logout, /me e rate limit
│       ├── leads.routes.spec.ts         # CRUD de Leads, filtros, paginação e transições de funil
│       ├── campaigns.routes.spec.ts     # Gestão de campanhas, despesas e orçamento
│       ├── dashboard.routes.spec.ts     # Agregação de métricas por período e filtros temporais
│       └── webhooks.routes.spec.ts      # Ingestão de leads via Meta Lead Ads e Cotações
```

---

## 3. Comandos de Execução

Na raiz do projeto ou dentro da pasta `server/`:

```bash
# Executar todos os testes uma única vez
npm test

# Executar testes em modo watch (desenvolvimento contínuo)
npm run test:watch

# Gerar relatório detalhado de cobertura de código
npm run test:coverage
```

### Exemplo de Saída da Suíte de Testes:
```
 ✓ server/tests/unit/metrics.calculator.spec.ts (6 tests)
 ✓ server/tests/unit/auth.service.spec.ts (5 tests)
 ✓ server/tests/unit/webhook.signature.spec.ts (4 tests)
 ✓ server/tests/unit/lead.validator.spec.ts (4 tests)
 ✓ server/tests/integration/auth.routes.spec.ts (4 tests)
 ✓ server/tests/integration/leads.routes.spec.ts (5 tests)
 ✓ server/tests/integration/dashboard.routes.spec.ts (3 tests)

 Test Files  7 passed (7)
      Tests  31 passed (31)
   Start at  15:42:00
   Duration  1.42s
```

---

## 4. Matriz de Cobertura de Cenários Críticos

| Módulo | Cenário Testado | Resultado Esperado |
| :--- | :--- | :--- |
| **Dashboard** | Gasto R$ 0,00 e 0 Leads | CPL retorna R$ 0,00 (sem erro `NaN` ou `Infinity`) |
| **Dashboard** | Gasto R$ 1.500,00 e 10 Leads | CPL retorna exatamente R$ 150,00 |
| **Dashboard** | Receita R$ 12.000,00 e Gasto R$ 2.000,00 | ROAS retorna 6.00x |
| **Autenticação** | Tentativa de login com senha incorreta | Retorna `401 Unauthorized` genérico |
| **Autenticação** | 6 tentativas erradas consecutivas | Aciona Rate Limit com `429 Too Many Requests` |
| **Segurança** | Usuário `READONLY` tentando excluir lead | Retorna `403 Forbidden` |
| **Webhooks** | Meta Lead Ad com assinatura HMAC inválida | Retorna `401 Unauthorized` e registra auditoria |
| **Leads** | Inserção de lead com telefone sem DDD | Validador Zod rejeita com mensagem amigável |
| **Leads** | Lead duplicado com mesmo telefone no mesmo dia | Identifica duplicata e atualiza registro existente |

---

## 5. Checklist de QA Manual Pré-Deploy

Antes de colocar qualquer versão em produção:

- [ ] **Build Frontend:** `npm run build` dentro de `client/` conclui sem avisos de tipagem (`0 errors`).
- [ ] **Build Backend:** `npm run build` dentro de `server/` compila os arquivos para `dist/`.
- [ ] **Testes Automatizados:** Todos os 31 testes passam com 100% de sucesso.
- [ ] **Migrações do Banco:** `npx prisma migrate status` reporta que o banco está sincronizado.
- [ ] **Setup Inicial:** O fluxo de configuração do primeiro administrador (`/setup-admin`) funciona caso o banco esteja vazio e se bloqueia automaticamente após a criação do primeiro admin.
- [ ] **Responsividade:** A navegação (Sidebar/Menu) se adapta perfeitamente a resoluções de Desktop (1920x1080), Notebook (1366x768) e Mobile (iPhone / Android).
- [ ] **Modo Escuro:** Todos os textos, botões e cards possuem contraste legível sobre as superfícies escuras `#0B0F17` e `#111827`.
- [ ] **Filtros e Buscas:** A busca em tempo real na listagem de leads e na tabela de tráfego filtra corretamente sem travamento de renderização.
