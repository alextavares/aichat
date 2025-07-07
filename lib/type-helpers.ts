
/**
 * Type helper utilities
 */

// Safe type assertion for API responses
export function assertType<T>(value: unknown): T {
  return value as T;
}

// Safe JSON parsing with type assertion
export function parseJsonAs<T>(json: string): T {
  return JSON.parse(json) as T;
}

// Environment variable helper with defaults
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value || defaultValue!;
}

const typeHelpers = { assertType, parseJsonAs, getEnvVar };
export default typeHelpers;
