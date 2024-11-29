import VMasker from "vanilla-masker";

/**
 * Formats a given value as CPF or CNPJ based on its length.
 * - CPF format: 999.999.999-99
 * - CNPJ format: 99.999.999/9999-99
 *
 * @param value - The string value to be formatted.
 * @returns The formatted value as a CPF or CNPJ.
 */
export function maskCpfCnpj(value?: string | null): string {
  if (!value) return "";
  const cleanValue = value?.replace(/\D/g, "") ?? "";

  if (cleanValue.length <= 11) {
    return VMasker.toPattern(cleanValue, "999.999.999-99");
  }
  return VMasker.toPattern(cleanValue, "99.999.999/9999-99");
}

/**
 * Unmasks a formatted string by removing all non-numeric characters.
 * This can be used to remove formatting from values like CPF, CNPJ, phone numbers, etc.
 *
 * @param value - The formatted string containing numeric characters.
 * @returns The numeric string with non-numeric characters removed.
 */
export function unmaskNonNumerics(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Masks a Brazilian phone number in the format (+99) 99 99999-9999.
 *
 * @param {string} value - The input phone number to be formatted.
 * @returns {string} - The formatted phone number with the specified mask.
 *
 * @example
 * ```typescript
 * const phoneNumber = '551234567890';
 * const formattedNumber = maskPhoneBRL(phoneNumber);
 * console.log(formattedNumber); // Output: '(+55) 12 34567-890'
 * ```
 */
export const maskPhoneBRL = (value: string): string =>
  VMasker.toPattern(value, { pattern: "(+99) 99 99999-9999" });

/**
 *  Masks a Brazilian phone number in the format (99) 99999-9999.
 *
 * @param {string} value - The input phone number to be formatted.
 * @returns {string} - The formatted phone number with the specified mask.
 */
export const maskPhoneWithoutDDI = (value: string): string =>
  VMasker.toPattern(value, { pattern: "(99) 99999-9999" });

/**
 * Removes all line breaks from the input string.
 *
 * @param {string} str - The string from which line breaks will be removed.
 * @returns {string} - The input string with all line breaks removed.
 *
 * @example
 * const stringWithLineBreaks = "This is a\nmultiline\nstring.";
 * const stringWithoutLineBreaks = removeLineBreaks(stringWithLineBreaks);
 * console.log(stringWithoutLineBreaks); // Output: "This is a multiline string."
 */
export const removeLineBreaks = (value: string): string => {
  if (!value?.length) {
    return "";
  }

  return value.replace(/[\r\n]+/g, "");
};

/**
 * Masks a decimal value with an optional currency acronym.
 *
 * @param {number | string} value - The decimal value to mask. This can be either a number or a string representation of a number.
 * @param {string} [acronym='R$'] - The currency acronym to prepend or append to the masked value. Defaults to 'R$'.
 * @param {'left' | 'right'} [positionAcronym='left'] - The position of the currency acronym relative to the masked value. Defaults to 'left'.
 * @param {number} [precision=2] - The number of decimal places to include in the masked value. Defaults to 2.
 * @param {boolean} [acronymWithSpace=true] - Whether to include a space between the acronym and the masked value. Defaults to true.
 * @returns {string} - The masked value with the currency acronym.
 *
 * @example
 * const maskedValue = maskDecimalWithAcronym(1234.56, 'USD', 'right', 2, false);
 * console.log(maskedValue); // Output: '1.234,56USD'
 */
export const maskDecimalWithAcronym = (
  value: number | string,
  acronym = "R$",
  positionAcronym: "left" | "right" = "left",
  precision = 2,
  acronymWithSpace = true,
): string => {
  if (value === "-") {
    return value;
  }

  if (value !== 0 && !value) {
    return "";
  }

  const maskedValue = VMasker?.toMoney(Number(value).toFixed(0), {
    precision,
    separator: ",",
  });
  const isNegative = Number(VMasker.toNumber(value)) < 0;

  if (isNegative) {
    if (positionAcronym === "left") {
      return acronymWithSpace
        ? `${acronym} -${maskedValue}`
        : `${acronym}-${maskedValue}`;
    }
    return acronymWithSpace
      ? `-${maskedValue} ${acronym}`
      : `-${maskedValue}${acronym}`;
  }

  if (positionAcronym === "left") {
    return acronymWithSpace
      ? `${acronym} ${maskedValue}`
      : `${acronym}${maskedValue}`;
  }
  return acronymWithSpace
    ? `${maskedValue} ${acronym}`
    : `${maskedValue}${acronym}`;
};

/**
 * Masks an integer value with an optional currency acronym and precision.
 *
 * @param {number | string} value - The integer value to mask.
 * @param {string} [acronym='R$'] - The currency acronym to prepend or append to the masked value. Defaults to 'R$'.
 * @param {'left' | 'right'} [positionAcronym='left'] - The position of the currency acronym relative to the masked value. Defaults to 'left'.
 * @param {number} [precision=2] - The number of decimal places to display. Defaults to 2.
 * @param {boolean} [addMinusSignal=true] - Whether or not to add the minus signal for negative numbers. Defaults to true.
 * @returns {string} - The masked value with the currency acronym and specified precision.
 */
export const maskIntegerWithAcronym = (
  value: number | string,
  acronym = "R$",
  positionAcronym: "left" | "right" = "left",
  precision = 2,
  addMinusSignal = true,
): string => {
  if (value === "-") {
    return value;
  }
  if (value !== 0 && !value) {
    return "";
  }

  const numericValue = Number(value);
  const isNegative = numericValue < 0;

  const formattedValue = Math.abs(numericValue).toFixed(precision);

  if (isNegative && addMinusSignal) {
    if (positionAcronym === "left") {
      return `${acronym} -${formattedValue}`;
    }

    return `-${formattedValue} ${acronym}`;
  }

  if (positionAcronym === "left") {
    return `${acronym} ${formattedValue}`;
  }
  return `${formattedValue} ${acronym}`;
};

/**
 * Unmasks a decimal number from a formatted string representation.
 *
 * @param {string} value - The formatted decimal value to be unmasked.
 * @returns {number} - The unmasked decimal value as a number, or 0 if the input is invalid.
 *
 * @example
 * const formattedValue = '150,98';
 * const unmaskedValue = unmaskDecimal(formattedValue);
 * console.log(unmaskedValue); // Output: 15098
 */
export const unmaskDecimal = (value: string): number => {
  if (!value || typeof value !== "string") {
    return 0;
  }
  const unmaskedValue = value.replace(/[^\d,]/g, "");
  return Number(VMasker.toNumber(unmaskedValue));
};

/**
 * Converts a number to a format suitable for use with vanilla-masker.
 *
 * This function multiplies the input number by 100 to prepare it for formatting
 * with vanilla-masker, which typically expects numbers to represent percentages or
 * decimal values.
 *
 * @param {number} value - The number to convert.
 * @returns {number} - The converted number.
 *
 * @example
 * // Convert number to vanilla-mask format:
 * const result = convertNumberToVanillaMaskFormat(0.5);
 * // result is 50
 */
export const convertNumberToVanillaMaskFormat = (value: number): number =>
  Number((Number(value) * 100).toFixed(0));

/**
 * Converts a string representing a number from one format to another.
 * The input string is expected to use dot as thousands separator and comma as decimal separator.
 * The output string will use dot as decimal separator.
 * @param {string} input - The input string representing a number.
 * @returns {number} The converted string with dot as decimal separator.
 */
export const convertVanillaMaskToNumber = (input: string | number): number => {
  // Use regular expression to remove dots and replace commas with dots

  const maskedValue = maskDecimal(String(input));
  const cleanString = maskedValue.replace(/\./g, "").replace(/,/, ".");

  // Use parseFloat to parse the string as a floating-point number
  const numberValue = parseFloat(cleanString);

  // Use toFixed to format the number to have two decimal places
  const formattedNumber = numberValue.toFixed(2);

  return Number(formattedNumber);
};

/* Masks a decimal value by formatting it as currency.
 *
 * @param {string | undefined | null} value - The decimal value to be masked. If undefined or null, an empty string is returned.
 * @param {string} [separator=','] - The separator to be used in the formatted string. Defaults to ','.
 * @returns {string} - The masked decimal value formatted as currency.
 *
 * @example
 * const originalValue = '12345.67';
 * const maskedValue = maskDecimal(originalValue, ',');
 * console.log(maskedValue); // Output: '12,345.67' (or your custom currency format)
 */
export const maskDecimal = (value: string, separator = ","): string => {
  if (value === undefined || value === null) {
    return "";
  }

  const masked = VMasker.toMoney(value, {
    precision: 2,
    separator,
  });

  return masked;
};

/**
 * Masks the input to allow only numeric characters.
 *
 * This function takes a string and returns a new string
 * with all non-numeric characters removed.
 *
 * @param {string} value - The input string to be masked.
 * @returns {string} A string containing only numeric characters.
 */
export const maskOnlyNumbers = (value: string): string => {
  if (value == null) return "";
  if (value.length > 1 && value.startsWith("0"))
    return value.slice(1, value.length);

  return String(value).replace(/\D/g, "");
};

export const maskOnlyNumbersV2 = (value: string): string => {
  if (value == null) return "";

  return String(value).replace(/\D/g, "");
};

/**
 * Apply a mask to a Brazilian postal code (CEP).
 * Formats the value in the "XXXXX-XXX" pattern.
 *
 * @param {string | null} value - The value to be masked. If null or undefined, returns an empty string.
 * @returns {string} The formatted CEP or an empty string if no value is provided.
 *
 * @example
 * ```typescript
 * maskCep("12345678"); // "12345-678"
 * maskCep(null);       // ""
 * ```
 */
export function maskCep(value?: string | null): string {
  if (!value) return "";
  const cleanValue = value.replace(/\D/g, ""); // Remove non-digit characters
  return VMasker.toPattern(cleanValue, "99999-999"); // Apply CEP mask
}
