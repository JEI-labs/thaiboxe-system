import { addDays, isValid, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import moment from 'moment';
import 'moment/locale/pt-br';

/**
 * Formats a date according to a specified pattern.
 *
 * This function utilizes Moment.js to format a given date object into a string
 * based on the provided pattern. The pattern can include any of the supported
 * format tokens by Moment.js.
 *
 * @param {Date | string | number} date - The date to be formatted. Can be a Date object, a string, or a timestamp.
 * @param {string} pattern - The pattern to format the date. Supports Moment.js format tokens.
 * @returns {string} The formatted date string.
 *
 * @example
 * ```typescript
 * const date = new Date();
 * console.log(formatDate(date, 'YYYY-MM-DD HH:mm:ss')); // Output: 2024-07-18 21:15:30
 * console.log(formatDate(date, 'DD/MM/YYYY')); // Output: 18/07/2024
 * console.log(formatDate(date, 'MM-DD-YY')); // Output: 07-18-24
 * console.log(formatDate(date, 'dddd, MMMM Do YYYY, h:mm:ss a')); // Output: Thursday, July 18th 2024, 9:15:30 pm
 * ```
 */
export function formatDate(
  date: Date | string | number,
  pattern = 'DD/MM/YYYY [às] HH:mm',
): string {
  if (!moment(date).isValid()) {
    return '';
  }
  return moment(date).locale('pt-br').format(pattern);
}

export const getNextBusinessDay = (date: Date): Date => {
  let nextDate = addDays(date, 1);

  while (nextDate.getDay() === 6 || nextDate.getDay() === 0) {
    nextDate = addDays(nextDate, 1);
  }

  return nextDate;
};

/**
 * Adds a specified number of days to the given date and resets the time to midnight.
 *
 * This function creates a new `Date` object based on the provided date, resets the hours, minutes,
 * seconds, and milliseconds to 00:00:00:000, and then adjusts the date by the given number of days.
 *
 * @param date - The original date to be adjusted.
 * @param numberOfDays - The number of days to add to the date. Defaults to 1.
 * @returns A new `Date` object with the adjusted date and time set to midnight.
 *
 * @example
 * ```typescript
 * const originalDate = new Date('2023-06-25T15:30:00Z');
 * const newDate = addDaysToDate(originalDate, 3);
 * console.log(newDate); // Will log a date 3 days after the original date, with time set to midnight.
 * ```
 */
export const addDaysToDate = (date: Date, numberOfDays = 1): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  newDate.setDate(newDate.getDate() + numberOfDays);
  return newDate;
};

/**
 * Função para analisar uma string de data e convertê-la para um objeto Date.
 * @param dateStr A string da data a ser analisada.
 * @param format O formato esperado da data (ex.: "dd/MM/yyyy").
 * @returns Um objeto Date válido ou undefined se a data for inválida.
 */
export const parseDate = (
  dateStr: string,
  format: string,
): Date | undefined => {
  const parsedDate = parse(dateStr, format, new Date(), { locale: ptBR });
  return isValid(parsedDate) ? parsedDate : undefined;
};

/**
 * Converte um timestamp Unix para uma data e hora formatadas.
 *
 * @param {number} timestamp - O timestamp Unix a ser convertido (em segundos ou milissegundos).
 * @param {string} pattern - O padrão de formatação (opcional, padrão: "DD/MM/YYYY [às] HH:mm").
 * @returns {string} A data e hora formatadas em um padrão legível por humanos.
 *
 * @example
 * ```typescript
 * const timestamp = 1697049600; // Unix em segundos
 * console.log(timestampToDate(timestamp)); // Saída: "11/10/2024 às 12:00"
 *
 * const timestampMs = 1697049600000; // Unix em milissegundos
 * console.log(timestampToDate(timestampMs)); // Saída: "11/10/2024 às 12:00"
 * ```
 */
export const timestampToDate = (
  timestamp: number,
  pattern = 'DD/MM/YYYY [às] HH:mm',
): string => {
  // Verifica se o timestamp é válido
  const date = moment(timestamp * (timestamp < 10000000000 ? 1000 : 1));
  if (!date.isValid()) {
    return '';
  }
  return date.locale('pt-br').format(pattern);
};
