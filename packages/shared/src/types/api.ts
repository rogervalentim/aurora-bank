import type { Account } from './account';
import type { ConsignadoProposal } from './consignado';
import type { PixKeyHolder, PixTransaction, Transaction } from './pix';
import type { User } from './user';

/** Códigos HTTP normalizados pela camada Axios. */
export type ApiErrorCode = 'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'UNPROCESSABLE_ENTITY' | 'INTERNAL';

/** Erro tipado e único para toda a camada de serviço REST. */
export interface ApiError {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly message: string;
  /** Mapa campo → mensagem, quando validação (`422`). */
  readonly fields?: Readonly<Record<string, string>>;
}

/** Resposta paginada padrão das listagens REST. */
export interface Paginated<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

/** Contrato de payloads REST usados pelo app e pelo backoffice. */
export interface ApiContract {
  readonly 'POST /api/accounts': { readonly request: Omit<Account, 'id' | 'balance' | 'status' | 'createdAt'>; readonly response: Account };
  readonly 'GET /api/accounts': { readonly response: Paginated<Account> };
  readonly 'PATCH /api/accounts/:id/approve': { readonly response: Account };
  readonly 'PATCH /api/accounts/:id/reject': { readonly request: { readonly reason: string }; readonly response: Account };
  readonly 'GET /api/pix/keys/:key': { readonly response: PixKeyHolder };
  readonly 'POST /api/pix/transfers': { readonly response: PixTransaction };
  readonly 'GET /api/transactions': { readonly response: Paginated<Transaction> };
  readonly 'POST /api/loans/consignado': { readonly response: ConsignadoProposal };
  readonly 'GET /api/loans/consignado': { readonly response: Paginated<ConsignadoProposal> };
  readonly 'PATCH /api/loans/:id/approve': { readonly response: ConsignadoProposal };
  readonly 'PATCH /api/loans/:id/reject': { readonly request: { readonly reason: string }; readonly response: ConsignadoProposal };
  readonly 'GET /api/me': { readonly response: User };
}

/** Chave de um endpoint do contrato REST. */
export type ApiEndpoint = keyof ApiContract;
