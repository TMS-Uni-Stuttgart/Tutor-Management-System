export function isDevelopment(): boolean {
  return !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
}
