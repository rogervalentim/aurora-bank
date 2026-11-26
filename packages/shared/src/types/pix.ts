import type { PixKeyType } from './enums';

/** Chave Pix cadastrada. */
export interface PixKey {
  readonly id: string;
  readonly accountId: string;
  readonly type: PixKeyType;
  /** Valor normalizado da chave (ver `normalizePixKey`). */
  readonly value: string;
  /** ISO 8601 (UTC). */
  readonly createdAt: string;
}

/** Titular retornado na consulta de uma chave Pix. */
export interface PixKeyHolder {
  readonly accountId: string;
  readonly holderName: string;
  /** CPF mascarado no formato `***.456.789-**`. */
  readonly maskedCpf: string;
  readonly type: PixKeyType;
  readonly value: string;
}

/** Transferência Pix efetivada. */
export interface PixTransaction {
  readonly id: string;
  readonly senderAccountId: string;
  readonly receiverAccountId: string;
  readonly receiverName: string;
  readonly receiverKey: string;
  readonly receiverKeyType: PixKeyType;
  /** Valor transferido em reais. */
  readonly amount: number;
  readonly status: 'COMPLETED' | 'FAILED';
  /** Identificador autenticado do comprovante (end-to-end). */
  readonly endToEndId: string;
  /** ISO 8601 (UTC). */
  readonly createdAt: string;
}

/** Item do extrato. */
export interface Transaction {
  readonly id: string;
  readonly accountId: string;
  readonly direction: 'CREDIT' | 'DEBIT';
  readonly type: 'PIX_IN' | 'PIX_OUT' | 'LOAN_DISBURSEMENT' | 'LOAN_PAYMENT' | 'BONUS';
  readonly amount: number;
  readonly description: string;
  /** ISO 8601 (UTC). */
  readonly createdAt: string;
}
