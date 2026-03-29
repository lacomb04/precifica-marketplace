import { setSession, clearSession } from './auth.js';

const ADMIN_EMAIL = 'admin@demo.com';
const ADMIN_PASSWORD = 'demo123';

const show = (el, visible) => {
  if (!el) return;
  el.hidden = !visible;
};

const handleLogin = (event) => {
  event.preventDefault();
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorBox = document.getElementById('loginError');
  const successBox = document.getElementById('loginSuccess');

  const email = (emailInput?.value || '').trim().toLowerCase();
  const password = passwordInput?.value || '';

  show(errorBox, false);
  show(successBox, false);

  if (!email || !password) {
    show(errorBox, true);
    errorBox.textContent = 'Preencha email e senha.';
    return;
  }

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    setSession({ email, provider: 'demo' });
    show(successBox, true);
    successBox.textContent = 'Login ok! Redirecionando...';
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 600);
    return;
  }

  show(errorBox, true);
  errorBox.textContent = 'Credenciais inválidas para o ambiente de teste.';
};

const wireForm = () => {
  const form = document.getElementById('loginForm');
  form?.addEventListener('submit', handleLogin);
};

const init = () => {
  clearSession();
  wireForm();
};

document.addEventListener('DOMContentLoaded', init);
