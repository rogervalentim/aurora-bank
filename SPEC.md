# SPEC.md — Aurora Bank (Digital Banking & Backoffice Suite)

## 1. Visão Geral do Produto
O **Aurora Bank** é um ecossistema financeiro full-stack composto por duas aplicações integradas que atendem ao ciclo completo de operações bancárias digitais (abertura de conta, Pix e crédito consignado):

1. **Aurora Mobile (`apps/mobile`)**: Aplicativo bancário voltado ao cliente final (iOS e Android) com fluxo de abertura de conta (onboarding KYC), área Pix completa (chaves, transferências e comprovantes) e simulação/contratação de Crédito Consignado.
2. **Aurora Backoffice (`apps/web`)**: Portal web administrativo usado pelas equipes internas de risco e operações para auditar, aprovar ou reprovar aberturas de conta e propostas de crédito consignado em tempo real.

---

## 2. Skills de Design & Diagramação (Setup Inicial Obrigatório)
Antes de iniciar a codificação ou gerar a documentação visual, execute no terminal do ambiente a instalação das skills de design para garantir acabamento editorial nos diagramas e alta qualidade visual na interface:

```bash
npx skills add cathrynlavery/diagram-design --skill diagram-design
npx skills add anthropics/skills --skill frontend-design
```

### Regras de Uso da Skill `diagram-design`
* **Customização de Marca (Style Guide)**: Configure o perfil da skill com os tokens visuais do **Aurora Bank** (`paper: #F8FAFC`, `ink: #0F172A`, `accent: #10B981`, tipografia `Plus Jakarta Sans` / `Inter`) antes de gerar os diagramas.
* **Diagramas Obrigatórios (`docs/diagrams/*.html`)**: Gere arquivos HTML + SVG autocontidos usando a skill para ilustrar:
  1. `architecture.html`: Arquitetura do Monorepo (`apps/mobile`, `apps/web`, `packages/shared`, API REST Next.js e Firebase Auth/Firestore).
  2. `pix-flow.html`: Diagrama de sequência da transferência Pix (validação de chave -> verificação de saldo -> transação atômica -> comprovante).
  3. `consignado-state.html`: Máquina de estados da proposta de Crédito Consignado (`SIMULATED` -> `UNDER_REVIEW` -> `APPROVED` / `REJECTED` + crédito em conta).
* Referencie esses diagramas interativos no `README.md` principal.

---

## 3. Stack Tecnológica (Obrigatória)
* **Arquitetura**: Monorepo (`npm workspaces` ou `pnpm workspaces`) com tipagem e regras de negócio compartilhadas (`packages/shared`).
* **Mobile (`apps/mobile`)**: React Native (Expo SDK 52+ com Expo Router), TypeScript, NativeWind (Tailwind CSS), React Hook Form + Zod, Lucide React Native.
* **Web Backoffice (`apps/web`)**: Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons.
* **Backend / BaaS / Auth**: Firebase (`firebase/auth` para autenticação e `firebase/firestore` para sincronização em tempo real de propostas e saldos) + camada de serviço HTTP via `Axios` consumindo APIs RESTful com interceptors e tratamento padronizado de erros.
* **Testes Automatizados**: Jest + React Testing Library (`@testing-library/react` e `@testing-library/react-native`) com cobertura de regras financeiras, validações e fluxos de formulário.
* **Controle de Versão**: Git com Conventional Commits em inglês (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).

---

## 4. Sistema de Design & Diretrizes de UI/UX (Fintech Aesthetic)
Siga rigorosamente este sistema visual em ambas as aplicações para garantir consistência e credibilidade bancária:

* **Paleta de Cores (Design Tokens)**:
  * **Surface / Fundo Principal**: `#F8FAFC` (Slate 50) no modo claro; `#090D16` no cabeçalho/cartão principal do app.
  * **Cards & Containers**: `#FFFFFF` com borda sutil `1px solid #E2E8F0` (Slate 200) e sombras suaves (`shadow-sm`).
  * **Primária (Brand Navy)**: `#0F172A` (Slate 900) para tipografia principal, headers, sidebar e botões primários.
  * **Destaque (Fintech Emerald)**: `#10B981` (Emerald 500) exclusivamente para ações principais de confirmação (ex: "Confirmar Pix", "Aprovar Crédito") e indicadores positivos.
  * **Semânticas**: Alerta/Em Análise `#F59E0B` (Amber 500), Erro/Bloqueio `#EF4444` (Red 500).
* **Tipografia & Hierarquia Numérica**:
  * Aplicar `tabular-nums` (`font-variant-numeric: tabular-nums`) em todos os valores monetários, saldos, taxas de juros e parcelas para alinhamento vertical perfeito.
  * Rótulos em caixa alta discreta (`text-xs uppercase tracking-wider text-slate-500`) acima de valores grandes em negrito.
* **Micro-interações e Estados**:
  * Toda requisição REST deve tratar explicitamente: **Skeletons** animados no carregamento (`loading`), **Empty States** ilustrados com ícone e CTA claro quando não houver registros (`empty`), e **Toasts/Banners** de erro amigáveis com botão de retry (`error`).
  * No Mobile, aplicar máscaras automáticas de CPF (`000.000.000-00`), telefone e moeda (`R$ 0,00`), além de cartão de saldo com gradiente escuro sofisticado (`#0F172A` -> `#1E293B`).

---

## 5. Estrutura de Diretórios do Monorepo

```text
aurora-bank/
├── package.json                 # Configuração de workspaces e scripts globais (build, test, lint)
├── tsconfig.base.json           # Configuração base TypeScript strict compartilhada
├── SPEC.md                      # Este arquivo de especificação
├── README.md                    # Documentação técnica e guia de execução
├── docs/
│   └── diagrams/                # Diagramas HTML+SVG gerados pela skill diagram-design
│       ├── architecture.html
│       ├── pix-flow.html
│       └── consignado-state.html
├── packages/
│   └── shared/                  # Tipos, schemas Zod e regras financeiras compartilhadas
│       ├── src/
│       │   ├── types/           # Account, PixTransaction, ConsignadoProposal, UserRole
│       │   ├── schemas/         # Validações de CPF, Chave Pix, Margem Consignável
│       │   ├── utils/           # Calculadoras financeiras (Tabela Price, formatação BRL)
│       │   └── __tests__/       # Testes unitários Jest das regras de negócio
│       └── package.json
├── apps/
│   ├── mobile/                  # App React Native (Cliente Final)
│   │   ├── app/                 # Rotas (Expo Router)
│   │   │   ├── (auth)/          # Login e Onboarding (Abertura de Conta)
│   │   │   └── (tabs)/          # Home (Saldo), Pix, Consignado, Extrato
│   │   ├── src/
│   │   │   ├── components/      # Botões, Inputs mascarados, Cards de Saldo, Skeletons
│   │   │   ├── services/        # api.ts (Axios REST) e firebase.ts
│   │   │   └── __tests__/       # Testes Jest + React Native Testing Library
│   │   └── package.json
│   └── web/                     # Portal Interno Next.js (Equipe de Operações)
│       ├── src/
│       │   ├── app/
│       │   │   ├── api/         # Endpoints RESTful (/accounts, /pix, /loans)
│       │   │   ├── login/       # Acesso restrito analistas
│       │   │   └── dashboard/   # Filas de Aprovação (Contas e Consignado)
│       │   ├── components/      # Tabelas, Badges de Status, Modais de Auditoria
│       │   ├── services/        # api.ts (Axios REST) e firebase.ts
│       │   └── __tests__/       # Testes Jest + React Testing Library
│       └── package.json
```

---

## 6. Requisitos Funcionais Detalhados

### 6.1. Pacote Compartilhado (`packages/shared`)
* **Tipagens Estritas (TypeScript)**:
  * `AccountStatus`: `'PENDING_KYC' | 'ACTIVE' | 'BLOCKED'`
  * `LoanStatus`: `'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'`
  * `PixKeyType`: `'CPF' | 'EMAIL' | 'PHONE' | 'RANDOM'`
  * `EmploymentType`: `'INSS' | 'PUBLIC_SERVANT' | 'CLT'`
* **Regras de Negócio Puras (100% cobertas por testes Jest)**:
  * `calculateConsignado(amount, installments, monthlyRate, monthlyIncome)`:
    * Calcula o valor exato da parcela fixa via Tabela Price: $PMT = PV \cdot \frac{i \cdot (1 + i)^n}{(1 + i)^n - 1}$.
    * Calcula o total a pagar e o Custo Efetivo Total (CET) anual.
    * Retorna `isWithinMargin: boolean` validando se $PMT \le 0.35 \times \text{monthlyIncome}$ (limite legal de 35% da margem consignável).
  * `validatePixKey(type, value)`: Valida dígitos verificadores de CPF, formato de e-mail, telefone internacional/BR ou UUID v4.
  * `formatCurrencyBRL(value)`: Formatação monetária padrão `pt-BR`.

### 6.2. App Mobile (`apps/mobile` — React Native)
1. **Abertura de Conta (Onboarding Multi-step)**:
   * Barra de progresso visual no topo (Etapas 1/3, 2/3, 3/3).
   * **Etapa 1**: Dados pessoais (Nome completo, CPF, e-mail, senha) criando credencial via Firebase Auth.
   * **Etapa 2**: Dados financeiros (Renda mensal declarada e vínculo: INSS, Servidor Público ou CLT) exibindo em tempo real o teto da margem consignável liberada (35%).
   * **Etapa 3**: Resumo cadastral e envio via API REST (`POST /api/accounts`), criando a conta com status `PENDING_KYC` e saldo inicial `R$ 0,00` (ou bônus sandbox configurável para testes).
2. **Home & Extrato**:
   * Header escuro com saudação, badge de status da conta (`Em Análise` / `Conta Ativa`) e cartão de saldo disponível com toggle de privacidade (olho aberto/fechado).
   * Grid de ações rápidas: **Área Pix**, **Crédito Consignado**, **Minhas Chaves** e **Extrato Completo**.
   * Lista cronológica de movimentações com ícones contextuais (entradas em `#10B981`, saídas em `#0F172A`/`#EF4444`).
3. **Área Pix**:
   * Cadastro e listagem de chaves Pix do usuário com botão de cópia rápida.
   * Fluxo guiado de transferência Pix:
     1. Informar chave de destino e consultar titular via API REST (`GET /api/pix/keys/:key`).
     2. Informar valor da transferência (bloqueando o botão de avanço caso `valor > saldo` ou conta não esteja `ACTIVE`).
     3. Confirmar transação (`POST /api/pix/transfers`) debitando origem, creditando destino e exibindo tela de comprovante autenticado.
4. **Crédito Consignado**:
   * Simulador interativo com controle de valor (`R$ 1.000` a `R$ 50.000`) e chips selecionáveis de prazo (`12x`, `24x`, `36x`, `48x`, `60x`, `84x`).
   * Card de resumo financeiro destacando taxa de juros (`1,65% a.m.`), valor da parcela e barra visual de comprometimento de margem (verde $\le 35\%$, vermelho $> 35\%$).
   * Botão "Solicitar Empréstimo" (`POST /api/loans/consignado`), bloqueado se exceder a margem, enviando a proposta para a fila do Backoffice (`UNDER_REVIEW`).

### 6.3. Backoffice Web (`apps/web` — Next.js)
1. **Autenticação de Analista**:
   * Tela split-screen institucional com login via Firebase Auth e verificação de perfil interno (`role: 'analyst'`).
2. **Dashboard Operacional (Métricas e Filas)**:
   * Sidebar fixa com navegação limpa e 3 KPI Cards no topo: **Contas Pendentes (KYC)**, **Propostas de Consignado em Análise** e **Volume Financeiro Aprovado**.
   * **Aba 1 — Aprovação de Contas (KYC)**: Tabela filtrável por status com modal de auditoria dos dados do cliente e ações **Aprovar Conta** (`PATCH /api/accounts/:id/approve`) ou **Reprovar** (`PATCH /api/accounts/:id/reject`).
   * **Aba 2 — Mesa de Crédito Consignado**: Lista de propostas exibindo renda declarada, parcela solicitada e badge automático de enquadramento na margem (verde $\le 35\%$, vermelho $> 35\%$). Ao clicar em **Aprovar Crédito** (`PATCH /api/loans/:id/approve`), o sistema altera o status para `APPROVED`, credita o valor líquido no saldo da conta do cliente e registra a entrada no extrato.

---

## 7. Camada de API REST & Integração Firebase
* **Cliente HTTP (`Axios`)**:
  * Instância centralizada com `baseURL` configurável via `.env`.
  * Request interceptor injetando automaticamente `Authorization: Bearer <firebase_id_token>`.
  * Response interceptor normalizando erros HTTP (`400`, `401`, `403`, `422`, `500`) em um formato tipado único (`ApiError`).
* **Endpoints RESTful (`apps/web/src/app/api/*`)**:
  * `POST /api/accounts` & `GET /api/accounts`
  * `PATCH /api/accounts/[id]/approve` & `PATCH /api/accounts/[id]/reject`
  * `GET /api/pix/keys/[key]` & `POST /api/pix/keys`
  * `POST /api/pix/transfers` & `GET /api/transactions`
  * `POST /api/loans/consignado` & `GET /api/loans/consignado`
  * `PATCH /api/loans/[id]/approve` & `PATCH /api/loans/[id]/reject`

---

## 8. Estratégia de Testes Automatizados (Jest)
Configurar Jest em `packages/shared`, `apps/mobile` e `apps/web` garantindo cobertura nos seguintes cenários críticos:

1. **Testes Unitários (`packages/shared`)**:
   * Cálculo exato de parcelas pela Tabela Price e bloqueio automático quando a parcela ultrapassa 35% da renda mensal.
   * Validação de chaves Pix (CPF válido/inválido, e-mail, telefone e chave aleatória).
   * Formatação monetária BRL.
2. **Testes de Componentes & Fluxos (`apps/mobile`)**:
   * Renderização e validação do formulário de transferência Pix (garantindo mensagem de erro e bloqueio de envio quando o valor excede o saldo disponível).
   * Interação no simulador de Crédito Consignado atualizando o valor da parcela ao alterar prazo/montante.
3. **Testes de Componentes & Integração (`apps/web`)**:
   * Renderização da fila de propostas no Backoffice e disparo correto da chamada REST de aprovação de crédito (`PATCH /api/loans/:id/approve`).

---

## 9. Qualidade de Código & Boas Práticas
* **Strict TypeScript**: Proibido uso de `any`; utilizar interfaces explícitas e inferência de tipos via `z.infer<typeof schema>`.
* **Variáveis de Ambiente**: Fornecer `.env.example` completo tanto em `apps/web` quanto em `apps/mobile` documentando todas as chaves do Firebase (`API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, etc.) e `API_BASE_URL`.
* **Git Hygiene**: Manter `.gitignore` adequado para Node, Expo e Next.js, estruturando commits atômicos seguindo Conventional Commits.

---

## 10. Plano de Execução Incremental para o Agente
Execute a construção do projeto em 4 etapas, validando o build e os testes ao final de cada passo:

1. **Passo 1 (Fundação & Regras de Negócio)**: Instalar as skills (`diagram-design` e `frontend-design`), inicializar o monorepo (`package.json` raiz, `tsconfig.base.json`) e implementar `packages/shared` com tipos, schemas Zod, cálculos financeiros e suíte completa de testes unitários em Jest passando.
2. **Passo 2 (Backend REST & Backoffice Web)**: Configurar `apps/web` (Next.js + Tailwind + Firebase), implementar todos os endpoints REST em `src/app/api/*` e construir as telas de Login e Dashboard Operacional (KYC + Mesa de Crédito Consignado).
3. **Passo 3 (App Mobile React Native)**: Configurar `apps/mobile` (Expo Router + NativeWind + Axios + Firebase), implementando Onboarding multi-step, Home/Extrato, Área Pix e Simulador de Consignado.
4. **Passo 4 (Diagramas, Testes de UI & Documentação)**: Gerar os 3 diagramas HTML+SVG em `docs/diagrams/` via skill `diagram-design`, implementar os testes Jest + Testing Library em `apps/web` e `apps/mobile`, validar `npm test` e `npm run build` em todo o monorepo e finalizar o `README.md`.