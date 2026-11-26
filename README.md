# Aurora Bank — Digital Banking & Backoffice Suite

Monorepo full-stack do **Aurora Bank**: app bancário mobile (cliente final) + portal web de backoffice (risco e operações), com tipos, schemas e regras financeiras compartilhados.

> Especificação completa: [`SPEC.md`](./SPEC.md). Execução incremental em 4 passos — **Passos 1 e 2 concluídos** (fundação + backoffice).

## Estrutura

```text
aurora-bank/
├── package.json            # npm workspaces + scripts globais
├── tsconfig.base.json      # TypeScript strict compartilhado
├── .agents/skills/         # skills diagram-design e frontend-design
├── packages/shared/        # @aurora/shared — tipos, Zod e regras financeiras
└── apps/web/               # @aurora/web — backoffice Next.js 15
```

## Pré-requisitos

- Node.js >= 20 (testado com Node 24) e npm >= 10

## Como rodar

```bash
npm install          # instala todos os workspaces
npm test             # testes Jest de todos os workspaces
npm run typecheck    # TypeScript strict, sem emitir
npm run test:coverage --workspace @aurora/shared
```

## `packages/shared` (@aurora/shared)

### Tipos estritos (`src/types`)

| Tipo | Valores |
| --- | --- |
| `AccountStatus` | `PENDING_KYC` \| `ACTIVE` \| `BLOCKED` |
| `LoanStatus` | `SIMULATED` \| `UNDER_REVIEW` \| `APPROVED` \| `REJECTED` |
| `PixKeyType` | `CPF` \| `EMAIL` \| `PHONE` \| `RANDOM` |
| `EmploymentType` | `INSS` \| `PUBLIC_SERVANT` \| `CLT` |
| `UserRole` | `customer` \| `analyst` \| `admin` |

Interfaces: `Account`, `User`, `PixKey`, `PixKeyHolder`, `PixTransaction`, `Transaction`, `ConsignadoCalculation`, `ConsignadoProposal`, `ApiError`, `Paginated<T>` e o contrato `ApiContract` de todos os endpoints REST.

### Schemas Zod (`src/schemas`)

- `cpfSchema` — CPF com dígitos verificadores (aceita com/sem máscara).
- `pixKeySchema` — união discriminada por tipo; valida CPF, e-mail, telefone BR (+55) e UUID v4.
- `consignableMarginSchema` / `consignadoSimulationSchema` — renda, prazo (12/24/36/48/60/84), faixa R$ 1.000–50.000 e bloqueio quando a parcela excede 35% da renda.
- `personalDataSchema`, `financialDataSchema`, `createAccountSchema` — onboarding.
- `pixAmountSchema`, `pixTransferSchema` — transferência Pix (R$ 0,01–20.000,00).
- Tipos derivados sempre via `z.infer<typeof schema>` — sem `any`.

### Regras financeiras puras (`src/utils`)

- `calculateConsignado(amount, installments, monthlyRate, monthlyIncome)` — parcela fixa pela **Tabela Price** (`PMT = PV · i·(1+i)^n / ((1+i)^n − 1)`), total a pagar, juros, **CET anual** (`(1+i)^12 − 1`) e `isWithinMargin` (parcela ≤ 35% da renda).
- `calculatePriceInstallment`, `calculateAnnualCet`, `calculateMarginLimit`, `calculateMarginCommitment`, `isWithinConsignableMargin`.
- `formatCurrencyBRL` / `formatDecimalBRL` / `formatPercentBR` / `parseCurrencyBRL` — padrão `pt-BR` (`R$ 1.234,50`).
- `maskCpf`, `maskPhone`, `maskCurrencyBRL`, `isValidCpf`, `computeCpfCheckDigits`, `maskCpfForDisplay`.

### Testes

Jest + ts-jest, com `coverageThreshold` global de **100%** (statements, branches, functions, lines).

```text
Test Suites: 7 passed, 7 total
Tests:       75 passed, 75 total
Coverage:    100% statements / 100% branches / 100% functions / 100% lines
```

## `apps/web` (@aurora/web) — Backoffice

Next.js 15 (App Router) + React 19 + Tailwind CSS v4 + Axios + Firebase (opcional).

```bash
npm run dev --workspace @aurora/web     # http://localhost:3000
npm test --workspace @aurora/web
```

### Telas

| Rota | O que faz |
| --- | --- |
| `/login` | Login split-screen do analista (`role: analyst`). Sandbox: `analista@aurorabank.com` / `aurora2025` |
| `/dashboard` | Sidebar, 3 KPI cards, fila de KYC com modal de auditoria, mesa de crédito consignado |

Estados tratados em todas as requisições: **skeleton** no carregamento, **empty state** com CTA e **banner de erro com retry**; toast de confirmação a cada decisão. Valores monetários, taxas e parcelas sempre em `tabular-nums`.

### API REST (`src/app/api`)

| Método | Rota |
| --- | --- |
| GET / POST | `/api/accounts` |
| PATCH | `/api/accounts/[id]/approve` · `/api/accounts/[id]/reject` |
| GET / POST | `/api/pix/keys` · GET `/api/pix/keys/[key]` |
| POST | `/api/pix/transfers` |
| GET | `/api/transactions` · `/api/metrics` |
| GET / POST | `/api/loans/consignado` |
| PATCH | `/api/loans/[id]/approve` · `/api/loans/[id]/reject` |

`PATCH /api/loans/:id/approve` muda o status para `APPROVED`, credita o valor na conta do cliente e registra a entrada no extrato. Valores trafegam em **centavos**; a formatação BRL vem de `@aurora/shared`.

Sem as chaves `NEXT_PUBLIC_FIREBASE_*` (ver `apps/web/.env.example`), o app roda no **sandbox**: sessão local + banco em memória com dados de exemplo.

### Testes do backoffice

```text
Test Suites: 3 passed
Tests:       15 passed
```

Cobrem login (sucesso, erro e sandbox), fila de KYC (skeleton, empty, erro com retry, busca, filtros, aprovação e recusa) e mesa de consignado (lista, bloqueio acima de 35%, `PATCH /api/loans/:id/approve`, recusa e empty state).

## Convenções

- TypeScript strict com `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` e `verbatimModuleSyntax`.
- Proibido `any`: contratos explícitos e inferência via Zod.
- Conventional Commits em inglês (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).

## Próximos passos

- **Passo 3** — `apps/mobile`: Expo Router + NativeWind, onboarding multi-step, Home/Extrato, Pix e simulador de consignado.
- **Passo 4** — Diagramas em `docs/diagrams/` (`architecture.html`, `pix-flow.html`, `consignado-state.html`) e validação final de `npm test` / `npm run build`.
