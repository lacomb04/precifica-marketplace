const TRIAL_STORAGE_KEY = "precificacao_trial_access_v1";
const SALE_PAGE_URL =
  "https://paginavendaprecificacao.scaleonbr.com.br/index.html";

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const getSalePageUrl = () => SALE_PAGE_URL;

export const getStoredTrialAccess = () => {
  const data = safeParse(localStorage.getItem(TRIAL_STORAGE_KEY));
  if (!data?.token || !data?.expiresAt) return null;

  const expiresMs = Date.parse(data.expiresAt);
  if (Number.isNaN(expiresMs) || expiresMs <= Date.now()) {
    localStorage.removeItem(TRIAL_STORAGE_KEY);
    return null;
  }

  return {
    token: data.token,
    expiresAt: data.expiresAt,
    customerEmail: data.customerEmail || "Teste gratis",
  };
};

export const saveTrialAccess = (payload) => {
  const expiresAt = payload?.expiresAt;
  const token = payload?.token;

  if (!token || !expiresAt) {
    throw new Error("Token ou expiracao ausente para salvar acesso de teste.");
  }

  localStorage.setItem(
    TRIAL_STORAGE_KEY,
    JSON.stringify({
      token,
      expiresAt,
      customerEmail: payload.customerEmail || "",
    }),
  );
};

export const clearTrialAccess = () => {
  localStorage.removeItem(TRIAL_STORAGE_KEY);
};

export const getRemainingSeconds = (expiresAt) => {
  const expiresMs = Date.parse(expiresAt);
  if (Number.isNaN(expiresMs)) return 0;
  return Math.max(0, Math.floor((expiresMs - Date.now()) / 1000));
};

export const formatRemaining = (seconds) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

export const redirectToSalePage = () => {
  window.location.replace(SALE_PAGE_URL);
};

export const validateTrialWithServer = async (client, trialAccess) => {
  const { data, error } = await client.functions.invoke("trial-validar-token", {
    body: {
      token: trialAccess.token,
    },
  });

  if (error || !data?.valido) {
    clearTrialAccess();
    return null;
  }

  if (data?.expiresAt && data.expiresAt !== trialAccess.expiresAt) {
    saveTrialAccess({
      token: trialAccess.token,
      expiresAt: data.expiresAt,
      customerEmail: trialAccess.customerEmail,
    });

    return {
      ...trialAccess,
      expiresAt: data.expiresAt,
    };
  }

  return trialAccess;
};
