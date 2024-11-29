/**
 * Returns a contrasting color (either black or white) based on the luminance of the provided hex color.
 * This function ensures that text is readable on any background color.
 *
 * @param hex - A hex color string in the format `#RRGGBB`. The `#` symbol is optional.
 * @returns The hex string for either black (`#000000`) or white (`#FFFFFF`), whichever provides better contrast.
 *
 * @example
 * ```ts
 * const contrastColor = getContrastColor('#3498db'); // Outputs: '#FFFFFF'
 * ```
 */
export function getContrastColor(hex: string): string {
  // Remove the hash symbol if present
  hex = hex.replace("#", "");

  // Convert the hex color to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate the luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light colors and white for dark colors
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}
