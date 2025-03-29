// ----------------------------------- CPF Mask Functions -----------------------------------
export const maskCPF = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  // 000.000.000-00
};

export const unmaskCPF = (value: string): string => {
  return value.replace(/\D/g, '');
  // 00000000000
};

// ----------------------------------- Cellphone Mask Functions -----------------------------------
export const maskCellphone = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
    .slice(0, 15);
  // (00) 00000-0000
};

// example: 11999999999
export const unmaskCellphone = (value: string): string => {
  return value.replace(/\D/g, '');
  // 11999999999
};

// ----------------------------------- CEP Mask Functions -----------------------------------
export const maskCEP = (value: string): string => {
  return value.replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, '$1-$2');
  // 00000-000
};

export const unmaskCEP = (value: string): string => {
  return value.replace(/\D/g, '');
  // 00000000
};

// ----------------------------------- CNPJ Mask Functions -----------------------------------
export const maskCNPJ = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  // 00.000.000/0000-00
};

export const unmaskCNPJ = (value: string): string => {
  return value.replace(/\D/g, '');
  // 00000000000000
};

// ----------------------------------- NumberFormat Mask Functions --------------------------------
export const maskNumberFormat = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {}).format(value);
};

export const maskBRL = (value: number, isVisible: boolean): string => {
  return isVisible
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value)
    : 'R$ ***';
};

// ----------------------------------- Name Mask Functions -----------------------------------
export const maskOnlyText = (value: string): string => {
  return value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, ''); // Permite letras acentuadas e espaços
};

// ----------------------------------- Initials Name Mask Functions -----------------------------------
export function getInitials(name: string): string {
  if (!name?.length) return '';

  const nameParts = name.trim().split(' ');

  if (nameParts.length === 1) {
    return nameParts[0]?.charAt(0).toUpperCase() || '';
  }
  return (
    nameParts[0]?.charAt(0).toUpperCase() +
    (nameParts[1]?.charAt(0).toUpperCase() || '')
  );
}
