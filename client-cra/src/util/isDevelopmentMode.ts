export function isDevelopment(): boolean {
  const NODE_ENV = process.env.NODE_ENV;
  return !NODE_ENV || NODE_ENV === 'development';
}
