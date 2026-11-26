import type { NextRequest } from 'next/server';
import { errorResponse, json, readJson } from '@/lib/http';
import { transferBodySchema } from '@/lib/validation';
import { getDb } from '@/lib/db';

/** POST /api/pix/transfers — debita origem, credita destino e devolve o comprovante. */
export async function POST(request: NextRequest): Promise<Response> {
  const parsed = transferBodySchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return errorResponse(422, 'Transferência inválida.', Object.fromEntries(
      parsed.error.issues.map((issue) => [issue.path.join('.') || '_', issue.message]),
    ));
  }

  const db = getDb();
  const sender = db.accounts.find((item) => item.account.id === parsed.data.senderAccountId);
  if (!sender) return errorResponse(404, 'Conta de origem não encontrada.');
  if (sender.account.status !== 'ACTIVE') return errorResponse(403, 'Conta de origem não está ativa.');
  if (sender.account.balanceCents < parsed.data.amountCents) {
    return errorResponse(422, 'Saldo insuficiente para esta transferência.', { amountCents: 'Valor acima do saldo.' });
  }

  const receiver = db.accounts.find(
    (item) =>
      item.account.cpf === parsed.data.receiverKey ||
      item.account.email.toLowerCase() === parsed.data.receiverKey.toLowerCase(),
  );
  if (!receiver) return errorResponse(404, 'Chave Pix de destino não encontrada.');

  const now = new Date().toISOString();
  const endToEndId = `E${Date.now()}${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  sender.account = { ...sender.account, balanceCents: sender.account.balanceCents - parsed.data.amountCents };
  receiver.account = { ...receiver.account, balanceCents: receiver.account.balanceCents + parsed.data.amountCents };
  sender.transactions = [
    {
      id: `txn_${endToEndId}`,
      accountId: sender.account.id,
      direction: 'DEBIT',
      type: 'PIX_OUT',
      amountCents: parsed.data.amountCents,
      description: `Pix enviado para ${receiver.account.fullName}`,
      createdAt: now,
    },
    ...sender.transactions,
  ];
  receiver.transactions = [
    {
      id: `txn_${endToEndId}_in`,
      accountId: receiver.account.id,
      direction: 'CREDIT',
      type: 'PIX_IN',
      amountCents: parsed.data.amountCents,
      description: `Pix recebido de ${sender.account.fullName}`,
      createdAt: now,
    },
    ...receiver.transactions,
  ];

  return json(
    {
      id: endToEndId,
      senderAccountId: sender.account.id,
      receiverAccountId: receiver.account.id,
      receiverName: receiver.account.fullName,
      receiverKey: parsed.data.receiverKey,
      receiverKeyType: parsed.data.receiverKey.includes('@') ? 'EMAIL' : 'CPF',
      amountCents: parsed.data.amountCents,
      status: 'COMPLETED',
      endToEndId,
      createdAt: now,
    },
    201,
  );
}
