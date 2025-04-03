/**
 * Get the initials from a name.
 *
 * @param name - The full name as a string.
 * @returns The initials based on the name.
 *
 * @example
 * ```typescript
 * getInitials("John Doe"); // Returns "JD"
 * getInitials("Cher"); // Returns "C"
 * ```
 */
export function getInitials(name: string): string {
  if (!name?.length) return '';

  const nameParts = name.trim().split(' ');

  if (!nameParts?.length) return '';

  if (nameParts.length === 1) {
    return nameParts[0]?.charAt(0).toUpperCase() ?? '';
  }

  return (
    nameParts[0]?.charAt(0).toUpperCase() ??
    '' + nameParts[1]?.charAt(0).toUpperCase() ??
    ''
  );
}
