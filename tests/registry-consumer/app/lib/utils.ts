// Provided by `shadcn init` in a real consumer; the registry's `@/lib/utils`
// imports resolve here. Standard shadcn cn() helper.
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
