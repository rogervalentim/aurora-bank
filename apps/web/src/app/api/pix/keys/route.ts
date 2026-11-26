import type { NextRequest } from 'next/server';
import { errorResponse, json, readJson } from '@/lib/http';
import { createPixKeyBodySchema } from '@/lib/validation';
import { normalizePixKey } from '@aurora/shared';

/** POST /api/pix/keys — cadastra uma chave Pix normalizada. */
export async function POST(request: NextRequest): Promise<Response> {
  const parsed = createPixKeyBodySchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return errorResponse(422, 'Chave Pix inválida.', Object.fromEntries(
      parsed.error.issues.map((issue) => [issue.path.join('.') || '_', issue.message]),
    ));
  }
  return json(
    {
      id: `key_${Date.now()}`,
      accountId: parsed.data.accountId,
      type: parsed.data.key.type,
      value: normalizePixKey(parsed.data.key.type, parsed.data.key.value),
      createdAt: new Date().toISOString(),
    },
    201,
  );
}
