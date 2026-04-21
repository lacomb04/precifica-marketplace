const { createClient } = supabase;

const SUPABASE_URL = "https://eexmmgoplxrnhkjrskwo.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVleG1tZ29wbHhybmhranJza3dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNzQwNDgsImV4cCI6MjA5MTk1MDA0OH0.j5D8z1qf3WLPtIgndPdCxQNg8on1Xilr95DHVba518k";

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

const trialEmail = document.getElementById("trialEmail");
const trialMinutes = document.getElementById("trialMinutes");
const btnGenerate = document.getElementById("btnGenerate");
const btnCopyLink = document.getElementById("btnCopyLink");
const generateMsg = document.getElementById("generateMsg");
const resultBox = document.getElementById("resultBox");
const generatedLink = document.getElementById("generatedLink");

const btnRefresh = document.getElementById("btnRefresh");
const dashboardMsg = document.getElementById("dashboardMsg");
const kpiCreated = document.getElementById("kpiCreated");
const kpiActive = document.getElementById("kpiActive");
const kpiOnline = document.getElementById("kpiOnline");
const dashboardRows = document.getElementById("dashboardRows");

const adminEmail = document.getElementById("adminEmail");
const adminPassword = document.getElementById("adminPassword");
const btnLoginAdmin = document.getElementById("btnLoginAdmin");
const btnLogoutAdmin = document.getElementById("btnLogoutAdmin");
const authMsg = document.getElementById("authMsg");
const authUser = document.getElementById("authUser");
const generatorCard = document.getElementById("generatorCard");
const dashboardCard = document.getElementById("dashboardCard");
let adminValidated = false;
let dashboardIntervalId = null;
let currentSession = null;

const setMsg = (el, text, type = "") => {
  el.textContent = text;
  el.className = `msg ${type}`.trim();
};

const getPayload = () => ({
  email: trialEmail.value.trim().toLowerCase(),
  durationMinutes: Number(trialMinutes.value || 30),
});

const setAuthenticated = (isAuthenticated) => {
  generatorCard.hidden = !isAuthenticated;
  dashboardCard.hidden = !isAuthenticated;
  generatorCard.style.display = isAuthenticated ? "grid" : "none";
  dashboardCard.style.display = isAuthenticated ? "grid" : "none";
  btnLogoutAdmin.disabled = !isAuthenticated;
  btnLoginAdmin.disabled = isAuthenticated;
  adminEmail.disabled = isAuthenticated;
  adminPassword.disabled = isAuthenticated;
};

const forceLogout = async (
  message = "Sessao invalida. Faca login novamente.",
) => {
  await supabaseClient.auth.signOut();
  currentSession = null;
  adminValidated = false;
  stopRealtimeDashboard();
  setAuthenticated(false);
  authUser.textContent = "";
  setMsg(authMsg, message, "error");
};

const getAccessToken = async () => {
  return currentSession?.access_token ?? "";
};

const invokeAdminFunction = async (name, body = {}) => {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { data: null, error: { message: "Sem token de sessao" } };
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const message =
        payload?.message ||
        payload?.error ||
        `Erro HTTP ${response.status} na funcao ${name}`;

      return {
        data: null,
        error: {
          status: response.status,
          message,
          payload,
        },
      };
    }

    return { data: payload, error: null };
  } catch (networkError) {
    return {
      data: null,
      error: {
        message: "Falha de rede ao chamar Edge Function",
        payload: String(networkError?.message || networkError || "erro desconhecido"),
      },
    };
  }
};

const stopRealtimeDashboard = () => {
  if (dashboardIntervalId) {
    window.clearInterval(dashboardIntervalId);
    dashboardIntervalId = null;
  }
};

const startRealtimeDashboard = () => {
  stopRealtimeDashboard();
  dashboardIntervalId = window.setInterval(() => {
    if (document.hidden) return;
    loadDashboard({ silent: true });
  }, 15000);
};

const getDashboardData = async () => {
  const { data, error } = await invokeAdminFunction("trial-dashboard", {});

  if (error || !data) {
    if (error?.message) {
      setMsg(authMsg, `Falha no dashboard: ${error.message}`, "error");
    }
    return null;
  }
  return data;
};

const refreshAuthUser = async (forceAdminValidation = false) => {
  let activeSession = currentSession;

  if (!activeSession) {
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    activeSession = session ?? null;
    currentSession = activeSession;
  }

  if (!activeSession?.user) {
    await forceLogout("Faca login para acessar o painel.");
    return null;
  }

  if (!adminValidated || forceAdminValidation) {
    const dashboardData = await getDashboardData();

    if (!dashboardData) {
      await forceLogout("Usuario autenticado sem permissao de admin.");
      return null;
    }

    adminValidated = true;
  }

  authUser.textContent = `Logado como: ${activeSession.user.email || "admin"}`;
  setAuthenticated(true);
  return activeSession;
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("pt-BR");
};

const renderRows = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    dashboardRows.innerHTML =
      "<tr><td colspan='3'>Sem sessoes no momento.</td></tr>";
    return;
  }

  dashboardRows.innerHTML = items
    .map(
      (row) => `
      <tr>
        <td>${row.customerEmail || "-"}</td>
        <td>${row.status || "-"}</td>
        <td>${formatDate(row.expiresAt)}</td>
      </tr>
    `,
    )
    .join("");
};

const loadDashboard = async ({ silent = false } = {}) => {
  const session = await refreshAuthUser(true);
  if (!session) {
    setMsg(dashboardMsg, "Faca login admin para carregar dashboard.", "error");
    stopRealtimeDashboard();
    return;
  }

  if (!silent) {
    setMsg(dashboardMsg, "Carregando dashboard...");
  }

  const data = await getDashboardData();

  if (!data) {
    await forceLogout(
      "Sessao expirada ou sem permissao. Faca login novamente.",
    );
    setMsg(dashboardMsg, "Nao foi possivel carregar dashboard.", "error");
    return;
  }

  kpiCreated.textContent = data.createdToday ?? "0";
  kpiActive.textContent = data.activeTrials ?? "0";
  kpiOnline.textContent = data.onlineUsers ?? "0";
  renderRows(data.sessions || []);
  if (!silent) {
    setMsg(
      dashboardMsg,
      `Atualizado em ${new Date().toLocaleTimeString("pt-BR")}.`,
      "ok",
    );
  }
};

const generateTrial = async () => {
  const session = await refreshAuthUser();
  if (!session) {
    setMsg(generateMsg, "Faca login admin para gerar links.", "error");
    return;
  }

  const payload = getPayload();

  if (!payload.email || !payload.email.includes("@")) {
    setMsg(generateMsg, "Informe um e-mail valido.", "error");
    return;
  }

  btnGenerate.disabled = true;
  setMsg(generateMsg, "Gerando link unico...");

  const { data, error } = await invokeAdminFunction(
    "trial-gerar-link",
    payload,
  );

  btnGenerate.disabled = false;

  if (error || !data?.trialLink) {
    if (error?.status === 401 || error?.status === 403) {
      await forceLogout("Sessao admin invalida para gerar link.");
    } else if (error?.message) {
      setMsg(generateMsg, `Erro: ${error.message}`, "error");
      return;
    }
    setMsg(generateMsg, "Erro ao gerar link de teste gratis.", "error");
    return;
  }

  generatedLink.value = data.trialLink;
  resultBox.hidden = false;
  setMsg(generateMsg, "Link gerado com sucesso.", "ok");
  loadDashboard();
};

const loginAdmin = async () => {
  const email = adminEmail.value.trim().toLowerCase();
  const password = adminPassword.value;

  if (!email || !email.includes("@") || !password) {
    setMsg(authMsg, "Informe e-mail e senha validos.", "error");
    return;
  }

  btnLoginAdmin.disabled = true;
  setMsg(authMsg, "Autenticando...");

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setMsg(authMsg, "Nao foi possivel autenticar admin.", "error");
    btnLoginAdmin.disabled = false;
    return;
  }

  currentSession = data?.session ?? null;

  if (!currentSession?.access_token) {
    setMsg(
      authMsg,
      "Login sem sessao JWT. Tente em aba anonima ou outro navegador.",
      "error",
    );
    btnLoginAdmin.disabled = false;
    return;
  }

  const validatedSession = await refreshAuthUser(true);

  if (!validatedSession) {
    await supabaseClient.auth.signOut();
    btnLoginAdmin.disabled = false;
    return;
  }

  setMsg(authMsg, "Login admin realizado com sucesso.", "ok");
  await loadDashboard();
  startRealtimeDashboard();
};

const logoutAdmin = async () => {
  await forceLogout("Sessao encerrada.");
  setMsg(authMsg, "Sessao encerrada.", "ok");
};

btnGenerate.addEventListener("click", generateTrial);
btnRefresh.addEventListener("click", loadDashboard);
btnLoginAdmin.addEventListener("click", loginAdmin);
btnLogoutAdmin.addEventListener("click", logoutAdmin);

adminPassword.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    loginAdmin();
  }
});

btnCopyLink.addEventListener("click", async () => {
  if (!generatedLink.value) return;
  await navigator.clipboard.writeText(generatedLink.value);
  setMsg(generateMsg, "Link copiado para a area de transferencia.", "ok");
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) return;
  if (adminValidated) {
    loadDashboard({ silent: true });
  }
});

supabaseClient.auth.onAuthStateChange((_event, session) => {
  currentSession = session ?? currentSession;
});

// Sempre inicia exigindo login explicito no painel.
setAuthenticated(false);
