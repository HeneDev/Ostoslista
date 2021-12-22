export function isDefined<T>(value: T) {
  return value !== null && value !== undefined;
}

export function isEmpty(value: unknown) {
  return !isDefined(value) || value === '';
}

export function isString(value: unknown) {
  return isDefined(value) && typeof value === 'string';
}

export function isNumber(value: unknown) {
  return isDefined(value) && typeof value === 'number';
}

export function isArray(value: unknown) {
  return isDefined(value) && Array.isArray(value);
}
