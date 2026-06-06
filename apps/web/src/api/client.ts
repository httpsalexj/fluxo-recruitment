const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

export function apiUrl(path: string) {
  return `${API_URL}${path}`;
}

async function getCsrfToken() {
  const response = await fetch(apiUrl('/api/auth/csrf'), {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Não foi possível gerar CSRF token.');
  const data = await response.json();
  return data.csrfToken as string;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json');

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    headers.set('x-csrf-token', await getCsrfToken());
  }

  const response = await fetch(apiUrl(path), {
    ...options,
    method,
    headers,
    credentials: 'include'
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof data === 'object' && data && 'message' in data ? String((data as { message: unknown }).message) : 'Erro na requisição.';
    throw new Error(message);
  }

  return data as T;
}

export function discordLoginUrl() {
  return apiUrl('/api/auth/discord');
}

export { API_URL };
