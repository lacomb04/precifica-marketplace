const getClient = () => {
  if (window._supabase) return window._supabase;
  throw new Error("Supabase client nao encontrado em window._supabase");
};

export const getSession = async () => {
  const client = getClient();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data?.session ?? null;
};

export const requireSession = async () => {
  const session = await getSession().catch(() => null);
  if (!session) {
    window.location.replace("/login.html");
  }
  return session;
};

export const clearSession = async () => {
  const client = getClient();
  await client.auth.signOut();
};
