import { isCNPJ, isCPF, isPhone } from 'brazilian-values';
import VMasker from 'vanilla-masker';

// Regex que identifica qualquer caractere que não seja número, parêntese, ponto, traço, barra ou espaço
const notNumbersRegex = /[^0-9()./\- ]/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmail(value: string): boolean {
  return emailRegex.test(value);
}

// Função para mascarar chave PIX
export function maskPixKey(value: string): string {
  const cleanValue = value.replace(/\D/g, '');

  if (!notNumbersRegex.test(value)) {
    if (isCPF(cleanValue)) {
      return VMasker.toPattern(cleanValue, '999.999.999-99');
    }

    if (isCNPJ(cleanValue)) {
      return VMasker.toPattern(cleanValue, '99.999.999/9999-99');
    }

    if (isPhone(cleanValue)) {
      const mask =
        cleanValue.length === 10 ? '(99) 9999-9999' : '(99) 99999-9999';
      return VMasker.toPattern(cleanValue, mask);
    }
  }

  // Para chave aleatória e Email, não aplica máscara
  return value;
}

export function unmaskPixKey(value: string): string {
  const cleanValue = value.replace(/\D/g, '');

  // Remove máscara apenas se for CPF, CNPJ ou Telefone
  if (!notNumbersRegex.test(value)) {
    if (isCPF(cleanValue) || isCNPJ(cleanValue) || isPhone(cleanValue)) {
      return cleanValue;
    }
  }

  // Tenta remover parcialmente a máscara
  const wasMasked = value.slice(0, -1);
  const lastChar = value.slice(-1);

  if (isCPF(wasMasked) || isCNPJ(wasMasked) || isPhone(wasMasked)) {
    return wasMasked.replace(/\D/g, '') + lastChar;
  }

  return value;
}

// Função para identificar o tipo de chave PIX
export function detectPixKeyType(value: string): string {
  const cleanValue = value.replace(/\D/g, '');

  if (isCPF(cleanValue)) return 'CPF';
  if (isCNPJ(cleanValue)) return 'CNPJ';
  if (isPhone(cleanValue)) return 'Telefone';
  if (isEmail(value)) return 'Email';

  return 'Chave Aleatória';
}
