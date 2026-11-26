/** Remove máscara e caracteres não numéricos. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** Calcula um dígito verificador (módulo 11) para um bloco de dígitos. */
function calcCheckDigit(slice: string): number {
  const factorStart = slice.length + 1;
  const sum = slice.split('').reduce((acc, char, index) => {
    return acc + Number.parseInt(char, 10) * (factorStart - index);
  }, 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

/**
 * Valida um CPF pelos dígitos verificadores (módulo 11).
 * Aceita CPF com ou sem máscara. Rejeita sequências repetidas (`111.111.111-11`).
 */
export function isValidCpf(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const firstDigit = calcCheckDigit(digits.slice(0, 9));
  if (firstDigit !== Number.parseInt(digits.charAt(9), 10)) return false;

  const secondDigit = calcCheckDigit(digits.slice(0, 10));
  return secondDigit === Number.parseInt(digits.charAt(10), 10);
}

/** Formata um CPF (somente dígitos ou já mascarado) no padrão `000.000.000-00`. */
export function formatCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
}

/** Mascara um CPF para exibição pública: `123.456.789-00` → `***.456.789-**`. */
export function maskCpfForDisplay(value: string): string {
  const digits = onlyDigits(value);
  if (digits.length !== 11) return '***.***.***-**';
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
}

/** Calcula os dois dígitos verificadores de uma base de 9 dígitos. */
export function computeCpfCheckDigits(base: string): string {
  const digits = onlyDigits(base).slice(0, 9);
  if (digits.length !== 9) {
    throw new RangeError(`A base do CPF deve ter 9 dígitos (recebido: ${base}).`);
  }
  const first = calcCheckDigit(digits);
  const second = calcCheckDigit(`${digits}${first}`);
  return `${first}${second}`;
}
