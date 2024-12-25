export function isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
}

export function isProduction(): boolean {
    return !process.env.NODE_ENV || process.env.NODE_ENV === 'production';
}
