/**
 * Filter array by removing null values.
 *
 * @param value - The value to check.
 * @returns `true` if the value is not null or undefined, `false` otherwise.
 */
export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined;
}
