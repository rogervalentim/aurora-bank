# Aurora Bank — Digital Banking & Backoffice Suite

Monorepo full-stack do **Aurora Bank**: app bancário mobile (cliente final) + portal web de backoffice (risco e operações), com tipos, schemas e regras financeiras compartilhados.

> Especificação completa: [`SPEC.md`](./SPEC.md). Execução incremental em 4 passos — **Passo 1 (Fundação & Regras de Negócio) concluído**.

## Estrutura

```text
aurora-bank/
├── package.json            # npm workspaces + scripts globais
├── tsconfig.base.json      # TypeScript strict compartilhado
├── .agents/skills/         # skill diagram-design (HTML + SVG autocontidos)
└── packages/shared/        # @aurora/shared — tipos, Zod e regras financeiras
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

## Convenções

- TypeScript strict com `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` e `verbatimModuleSyntax`.
- Proibido `any`: contratos explícitos e inferência via Zod.
- Conventional Commits em inglês (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).

## Próximos passos

- **Passo 2** — `apps/web`: Next.js 15 + Tailwind + Firebase, endpoints REST em `src/app/api/*`, login de analista e dashboard (KYC + mesa de consignado).
- **Passo 3** — `apps/mobile`: Expo Router + NativeWind, onboarding, Home/Extrato, Pix e simulador de consignado.
- **Passo 4** — Diagramas em `docs/diagrams/` (`architecture.html`, `pix-flow.html`, `consignado-state.html`) e testes de UI.
