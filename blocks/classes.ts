export function cn(
  ...values: readonly (string | boolean | null | undefined)[]
) {
  return values
    .filter((value) => typeof value === 'string' && value.length > 0)
    .join(' ');
}
