export function isDevelopment(): boolean {
  const NODE_ENV = import.meta.env.NODE_ENV;
  return !NODE_ENV || NODE_ENV === 'development';
}
