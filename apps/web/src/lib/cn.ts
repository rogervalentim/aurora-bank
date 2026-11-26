import { clsx, type ClassValue } from 'clsx';

/** Junta classes condicionais. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
