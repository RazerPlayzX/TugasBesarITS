let csrf = '';
export async function api(path, body) {
  let response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    response = await fetch(`/api/${path}`, {
      method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    throw new Error('Server tidak dapat dihubungi. Periksa koneksi dan jalankan backend.');
  } finally {
    clearTimeout(timeout);
  }
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401 && !['login', 'register', 'me'].includes(path))
      document.dispatchEvent(new Event('session-expired'));
    throw new Error(data.detail || 'Permintaan gagal. Coba lagi.');
  }
  if (data.csrf_token) csrf = data.csrf_token;
  return data;
}
