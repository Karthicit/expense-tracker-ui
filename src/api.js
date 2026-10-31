const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function getToken() {
  return localStorage.getItem('token');
}
export function setToken(token) {
  localStorage.setItem('token', token);
}
export function clearToken() {
  localStorage.removeItem('token');
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null; // delete returns no content

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.message || 'Request failed');
    err.status = res.status;
    err.fieldErrors = data?.fieldErrors;
    throw err;
  }
  return data;
}