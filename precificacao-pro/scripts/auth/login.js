import { setSession, clearSession } from './auth.js';

const ADMIN_EMAIL = 'admin@demo.com';
const ADMIN_PASSWORD = 'demo123';

const show = (el, visible) => {
  if (!el) return;
  el.hidden = !visible;
};

const switchTab = (key) => {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.tab === key);
  });
  document.querySelectorAll('.tab-pane').forEach((pane) => {
    pane.classList.toggle('active', pane.id === `pane-${key}`);
  });
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

const handleMagicLink = async (event) => {
  event.preventDefault();
  const emailInput = document.getElementById('magicEmail');
  const infoBox = document.getElementById('magicInfo');
  const errorBox = document.getElementById('magicError');

  const email = (emailInput?.value || '').trim().toLowerCase();

  show(infoBox, false);
  show(errorBox, false);

  if (!email) {
    show(errorBox, true);
    errorBox.textContent = 'Informe um email válido.';
    return;
  }

  try {
    // Placeholder: quando integrar, chame sua API
    // await fetch('/api/auth/request-magic-link', { method: 'POST', body: JSON.stringify({ email }) });
    show(infoBox, true);
    infoBox.textContent = 'Se este email existir, enviamos um link válido por 10 minutos.';
  } catch (e) {
    show(errorBox, true);
    errorBox.textContent = 'Não foi possível enviar agora. Tente novamente.';
  }
};

const consumeToken = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (!token) return;

  // Placeholder: ao integrar, valide o token no backend.
  setSession({ email: 'magic-link-user', provider: 'magic_link', token });
  window.location.href = 'index.html';
};

const wireUI = () => {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  const formLogin = document.getElementById('loginForm');
  formLogin?.addEventListener('submit', handleLogin);

  const formMagic = document.getElementById('magicForm');
  formMagic?.addEventListener('submit', handleMagicLink);
};

const init = () => {
  clearSession();
  wireUI();
  consumeToken();
};

document.addEventListener('DOMContentLoaded', init);
