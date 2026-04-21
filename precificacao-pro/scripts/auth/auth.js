import {
  getStoredTrialAccess,
  getRemainingSeconds,
  validateTrialWithServer,
  clearTrialAccess,
} from "./trial-access.js";

export const getClient = () => {
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

export const resolveAccess = async () => {
  const session = await getSession().catch(() => null);
  if (session) {
    return {
      mode: "paid",
      session,
      label: session?.user?.email || "Cliente",
    };
  }

  const client = getClient();
  const localTrial = getStoredTrialAccess();
  if (!localTrial) return null;

  const validatedTrial = await validateTrialWithServer(client, localTrial).catch(
    () => null,
  );

  if (!validatedTrial || getRemainingSeconds(validatedTrial.expiresAt) <= 0) {
    clearTrialAccess();
    return null;
  }

  return {
    mode: "trial",
    trial: validatedTrial,
    label: validatedTrial.customerEmail || "Teste gratis",
  };
};
