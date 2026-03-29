const _win = window as unknown as Record<string, Record<string, string>>;

export const environment = {
  production: false,
  useMockApi: true,
  apiUrl: _win['__env']?.['API_URL'] ?? 'http://localhost:8080',
  defaultLanguage: _win['__env']?.['DEFAULT_LANGUAGE'] ?? 'pl',
};
