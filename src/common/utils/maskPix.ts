import { isCNPJ, isCPF, isPhone } from "brazilian-values";
import VMasker from "vanilla-masker";

const notNumbersRegex = /[^0-9\(\)\.\-\/ ]/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmail(value: string): boolean {
  return emailRegex.test(value);
}

// Função para mascarar chave PIX
export function maskPixKey(value: string): string {
  if (!notNumbersRegex.test(value)) {
    const cleanValue = value.replace(/\D/g, "");
    if (isCPF(cleanValue))
      return VMasker.toPattern(cleanValue, "999.999.999-99");
    if (isCNPJ(cleanValue))
      return VMasker.toPattern(cleanValue, "99.999.999/9999-99");
    if (isPhone(cleanValue)) {
      return VMasker.toPattern(
        cleanValue,
        cleanValue.length === 10 ? "(99) 9999-9999" : "(99) 99999-9999",
      );
    }
  }
  // Para chave aleatória e Email, não aplica máscara
  return value;
}

export function unmaskPixKey(value: string): string {
  // Verifica o tipo da chave e remove a máscara apenas para CPF, CNPJ e Telefone
  if (!notNumbersRegex.test(value)) {
    const cleanValue = value.replace(/\D/g, "");
    if (isCPF(cleanValue) || isCNPJ(cleanValue) || isPhone(cleanValue)) {
      return cleanValue;
    }
  }
  // se estava mascarado, retirar a mascara
  const wasMasked = value.slice(0, -1);
  if (isCPF(wasMasked) || isCNPJ(wasMasked) || isPhone(wasMasked)) {
    return wasMasked.replace(/\D/g, "") + value.slice(-1);
  }
  // devolver sem mascara caso nao tenha mascara
  return value;
}

// Função para identificar o tipo de chave PIX
export function detectPixKeyType(value: string): string {
  const cleanValue = value.replace(/\D/g, "");
  if (isCPF(cleanValue)) return "CPF";
  if (isCNPJ(cleanValue)) return "CNPJ";
  if (isPhone(cleanValue)) return "Telefone";
  if (isEmail(value)) return "Email";
  return "Chave Aleatória"; // Default para chave aleatória
}
