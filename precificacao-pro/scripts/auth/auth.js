// Placeholder Supabase client for future use
// Fill these when integrating Supabase Auth
export const SUPABASE_URL = "YOUR_SUPABASE_URL";
export const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
export const MAGIC_LINK_ENDPOINT = "/api/auth/request-magic-link";
export const MAGIC_CONSUME_ENDPOINT = "/api/auth/consume-magic-link";

const SESSION_KEY = "auth.session";

export const setSession = (session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const getSession = () => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const isAuthenticated = () => Boolean(getSession());

export const requireSession = () => {
  if (!isAuthenticated()) {
    window.location.href = "/login.html";
  }
};
