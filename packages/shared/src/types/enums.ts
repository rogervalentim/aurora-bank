/**
 * Status do ciclo de vida de uma conta digital.
 * - `PENDING_KYC`: conta criada, aguardando análise de KYC pelo backoffice.
 * - `ACTIVE`: conta aprovada e apta a transacionar.
 * - `BLOCKED`: conta reprovada/bloqueada pela equipe de risco.
 */
export type AccountStatus = 'PENDING_KYC' | 'ACTIVE' | 'BLOCKED';

/**
 * Status de uma proposta de crédito consignado.
 * - `SIMULATED`: simulação feita no app, ainda não enviada.
 * - `UNDER_REVIEW`: proposta enviada e aguardando a mesa de crédito.
 * - `APPROVED`: crédito aprovado e valor creditado na conta.
 * - `REJECTED`: proposta recusada pela mesa de crédito.
 */
export type LoanStatus = 'SIMULATED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

/** Tipo de chave Pix. */
export type PixKeyType = 'CPF' | 'EMAIL' | 'PHONE' | 'RANDOM';

/** Vínculo empregatício usado para enquadramento do consignado. */
export type EmploymentType = 'INSS' | 'PUBLIC_SERVANT' | 'CLT';

/** Papel do usuário no ecossistema Aurora Bank. */
export type UserRole = 'customer' | 'analyst' | 'admin';

/** Direção de uma movimentação financeira no extrato. */
export type TransactionDirection = 'CREDIT' | 'DEBIT';

/** Natureza da movimentação exibida no extrato. */
export type TransactionType = 'PIX_IN' | 'PIX_OUT' | 'LOAN_DISBURSEMENT' | 'LOAN_PAYMENT' | 'BONUS';
