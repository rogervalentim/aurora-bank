import { getDb } from '@/lib/db';
import { errorResponse, json } from '@/lib/http';
import { maskCpfForDisplay } from '@aurora/shared';

/** GET /api/pix/keys/:key — consulta o titular de uma chave Pix. */
export async function GET(_request: Request, context: { params: Promise<{ key: string }> }): Promise<Response> {
  const { key } = await context.params;
  const decoded = decodeURIComponent(key).toLowerCase();
  const record = getDb().accounts.find((item) => {
    const account = item.account;
    return (
      account.cpf === decoded ||
      account.email.toLowerCase() === decoded ||
      account.id === decoded ||
      account.fullName.toLowerCase().replace(/\s+/g, '.') === decoded
    );
  });
  if (!record) return errorResponse(404, 'Chave Pix não encontrada.');
  return json({
    accountId: record.account.id,
    holderName: record.account.fullName,
    maskedCpf: maskCpfForDisplay(record.account.cpf),
    type: decoded.includes('@') ? 'EMAIL' : 'CPF',
    value: decoded,
  });
}
