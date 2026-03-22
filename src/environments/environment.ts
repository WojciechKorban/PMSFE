export const environment = {
  production: false,
  apiUrl: (window as Record<string, unknown>)['__env']
    ? ((window as Record<string, Record<string, string>>)['__env']['API_URL'] ?? 'http://localhost:8080')
    : 'http://localhost:8080',
  defaultLanguage: (window as Record<string, unknown>)['__env']
    ? ((window as Record<string, Record<string, string>>)['__env']['DEFAULT_LANGUAGE'] ?? 'pl')
    : 'pl',
};
