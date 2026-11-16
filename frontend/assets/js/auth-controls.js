const tabs = [...document.querySelectorAll('[data-auth-mode]')];
const password = document.getElementById('auth-password');
const toggle = document.getElementById('toggle-password');
let mode = 'login';

export const authMode = () => mode;
export function setAuthBusy(busy) { tabs.forEach(tab => { tab.disabled = busy; }); }

function passwordVisibility(visible) {
  const start = password.selectionStart;
  const end = password.selectionEnd;
  password.type = visible ? 'text' : 'password';
  toggle.setAttribute('aria-label', visible ? 'Sembunyikan password' : 'Tampilkan password');
  toggle.setAttribute('aria-pressed', String(visible));
  toggle.querySelector('.eye-slash').toggleAttribute('hidden', !visible);
  if (start !== null) password.setSelectionRange(start, end);
}

export function concealPassword() { passwordVisibility(false); }

function selectMode(tab) {
  mode = tab.dataset.authMode;
  const register = mode === 'register';
  tabs.forEach(node => {
    const active = node === tab;
    node.setAttribute('aria-selected', String(active));
    node.tabIndex = active ? 0 : -1;
  });
  document.getElementById('auth-panel').setAttribute('aria-labelledby', tab.id);
  document.getElementById('name-field').hidden = !register;
  document.getElementById('auth-name').required = register;
  password.autocomplete = register ? 'new-password' : 'current-password';
  document.getElementById('auth-title').textContent = register ? 'Mulai ruang belajarmu.' : 'Selamat datang kembali.';
  document.getElementById('enter-demo').textContent = register ? 'Buat akun' : 'Masuk';
  const notice = document.getElementById('session-notice');
  notice.hidden = true;
  notice.textContent = '';
  concealPassword();
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectMode(tab));
  tab.addEventListener('keydown', event => {
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1
      : event.key === 'ArrowRight' ? (index + 1) % tabs.length
      : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : null;
    if (next === null) return;
    event.preventDefault();
    tabs[next].focus();
    selectMode(tabs[next]);
  });
});

// Pointer activation keeps the caret in the field; keyboard focus stays on the toggle.
toggle.addEventListener('pointerdown', event => {
  if (document.activeElement === password) event.preventDefault();
});
toggle.addEventListener('click', () => passwordVisibility(password.type === 'password'));
