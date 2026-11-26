/** Arredonda um valor para `decimals` casas, evitando erros de ponto flutuante. */
export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Arredonda um valor monetário para 2 casas (centavos). */
export function roundMoney(value: number): number {
  return roundTo(value, 2);
}

/** Garante que um valor é finito e positivo. */
export function assertPositiveFinite(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} deve ser um número finito e maior que zero (recebido: ${value}).`);
  }
}
