import { formatToBRL } from "brazilian-values";

export function maskBRL(v: number) {
  return formatToBRL(v);
}

export function maskMoney({
  value,
  currency = "BRL",
  locale = "pt-BR",
}: {
  value: number;
  currency?: string;
  locale?: string;
}) {
  value = value / 100;
  const formatOptions = { currency: currency, style: "currency" };

  return value.toLocaleString(
    locale,
    formatOptions as Intl.NumberFormatOptions,
  );
}

export function maskPercent(v: number) {
  return v.toLocaleString("pt-br", { minimumFractionDigits: 2 }) + "%";
}

export function maskDocument(document: string) {
  if (document.length < 12) {
    return maskCpf(document);
  } else {
    return maskCnpj(document);
  }
}

export function maskCnpj(v: string) {
  if (!v) return v;

  v = v.replace(/\D/g, ""); //Remove tudo o que não é dígito
  v = v.substring(0, 14);
  v = v.replace(/^(\d{2})(\d)/, "$1.$2"); //Coloca ponto entre o segundo e o terceiro dígitos
  v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3"); //Coloca ponto entre o quinto e o sexto dígitos
  v = v.replace(/\.(\d{3})(\d)/, ".$1/$2"); //Coloca uma barra entre o oitavo e o nono dígitos
  v = v.replace(/(\d{4})(\d)/, "$1-$2"); //Coloca um hífen depois do bloco de quatro dígitos
  return v;
}

export function unmaskCnpj(value: string) {
  value = value.replace(/\D/g, ""); // Remove tudo que não é dígito
  value = value.substring(0, 14); // Limita a 14 dígitos para evitar números extras
  return value;
}

export function maskCpf(v: string) {
  if (!v) return v;

  v = v.replace(/\D/g, ""); //Remove tudo o que não é dígito
  v = v.substring(0, 11);
  v = v.replace(/(\d{3})(\d)/, "$1.$2"); //Coloca um ponto entre o terceiro e o quarto dígitos
  v = v.replace(/(\d{3})(\d)/, "$1.$2"); //Coloca um ponto entre o terceiro e o quarto dígitos
  //de novo (para o segundo bloco de números)
  v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2"); //Coloca um hífen entre o terceiro e o quarto dígitos
  return v;
}

export function maskPhone(value: string) {
  if (!value) return "";
  value = value.replace(/\D/g, "");
  value = value.replace(/(\d{2})(\d)/, "($1) $2");
  value = value.replace(/(\d)(\d{4})$/, "$1-$2");
  return value;
}

export const normalizePhoneNumber = (value: string | undefined) => {
  if (!value) return "";

  return value
    .replace(/[\D]/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})(\d+?)/, "$1");
};

export const normalizeCnpjNumber = (value: string | undefined) => {
  if (!value) return "";

  return value
    .replace(/[\D]/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

export const normalizeCepNumber = (value: string | undefined) => {
  if (!value) return "";
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{5})(\d{3})+?$/, "$1-$2")
    .replace(/(-\d{3})(\d+?)/, "$1");
};

export const normalizeBRL = (value: string | undefined) => {
  if (!value) return "";
  return value.replace(/\D/g, "");
};

export function maskCardNumber(
  cardNumber?: string,
  shortened?: boolean,
): string {
  if (!cardNumber) {
    if (shortened) {
      return "****";
    }

    return "**** **** **** ****";
  }

  const sanitized = cardNumber.replace(/\D/g, "");

  // Check if length is valid for a card number
  if (sanitized.length < 4) {
    if (shortened) {
      return "****";
    }

    return "**** **** **** ****";
  }

  if (shortened) {
    return `**** ${sanitized.slice(-4)}`;
  }

  return `**** **** **** ${sanitized.slice(-4)}`;
}

export function formatCardNumber(cardNumber: string): string {
  const sanitized = cardNumber.replace(/\D/g, "");

  if (sanitized.length < 16 || sanitized.length > 19) {
    return cardNumber;
  }

  return sanitized.match(/.{1,4}/g)?.join(" ") ?? "";
}
