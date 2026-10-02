type ClassValue = string | false | null | undefined;

/** Junta classes condicionais. Mantido mínimo de propósito (sem dependência extra). */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
