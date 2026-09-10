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

  // `+` binds tighter than `??`, so this used to collapse to just the first
  // initial. Parenthesised, it returns the documented "JD" for "John Doe".
  return (
    (nameParts[0]?.charAt(0).toUpperCase() ?? '') +
    (nameParts[1]?.charAt(0).toUpperCase() ?? '')
  );
}
