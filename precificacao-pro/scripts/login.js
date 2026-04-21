const { createClient } = supabase;

const supabaseClient = createClient(
  "https://eexmmgoplxrnhkjrskwo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVleG1tZ29wbHhybmhranJza3dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNzQwNDgsImV4cCI6MjA5MTk1MDA0OH0.j5D8z1qf3WLPtIgndPdCxQNg8on1Xilr95DHVba518k",
);

const emailInput = document.getElementById("emailInput");
const btnEntrar = document.getElementById("btnEntrar");
const msgBox = document.getElementById("msgBox");
const formView = document.getElementById("formView");
const successView = document.getElementById("successView");
const emailSent = document.getElementById("emailSent");
const vendaUrl = "https://paginavendaprecificacao.scaleonbr.com.br/index.html";

const saveTrialAccess = (payload) => {
  localStorage.setItem(
    "precificacao_trial_access_v1",
    JSON.stringify({
      token: payload.token,
      expiresAt: payload.expiresAt,
      customerEmail: payload.customerEmail || "",
    }),
  );
};

const consumeTrialTokenFromUrl = async () => {
  const params = new URLSearchParams(window.location.search);
  const trialToken = params.get("trial_token");

  if (!trialToken) return false;

  btnEntrar.disabled = true;
  btnEntrar.textContent = "Validando teste gratis...";

  try {
    const { data, error } = await supabaseClient.functions.invoke(
      "trial-consumir-token",
      {
        body: { token: trialToken },
      },
    );

    if (error || !data?.ok || !data?.expiresAt) {
      throw new Error("Token de teste invalido ou expirado");
    }

    saveTrialAccess({
      token: data.accessToken || trialToken,
      expiresAt: data.expiresAt,
      customerEmail: data.customerEmail || "Teste gratis",
    });

    params.delete("trial_token");
    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `/index.html?${nextQuery}` : "/index.html";
    window.location.replace(nextUrl);
    return true;
  } catch (error) {
    console.error(error);
    showMsg(
      "Seu link de teste gratis e invalido ou expirou. Redirecionando para venda...",
      "error",
    );
    window.setTimeout(() => {
      window.location.replace(vendaUrl);
    }, 2500);
    return true;
  } finally {
    btnEntrar.disabled = false;
    btnEntrar.textContent = "Enviar link de acesso";
  }
};

// Se já tem sessão ativa vai direto pro sistema
supabaseClient.auth.getSession().then(async ({ data: { session } }) => {
  const trialFlowExecuted = await consumeTrialTokenFromUrl();
  if (trialFlowExecuted) return;

  if (session) {
    window.location.href = "/index.html";
  }
});

btnEntrar.addEventListener("click", handleLogin);
emailInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") handleLogin();
});

async function handleLogin() {
  const email = emailInput.value.trim();

  if (!email || !email.includes("@")) {
    showMsg("Digite um e-mail válido.", "error");
    return;
  }

  btnEntrar.disabled = true;
  btnEntrar.textContent = "Verificando...";
  hideMsg();

  try {
    // 1. Verifica se o e-mail tem acesso via Edge Function
    const { data, error } = await supabaseClient.functions.invoke(
      "verificar-acesso",
      { body: { email: email.toLowerCase() } },
    );

    if (error) throw error;

    if (!data?.temAcesso) {
      // Sem acesso → redireciona para página de vendas
      showMsg(
        "Este e-mail não possui acesso. Redirecionando para a página de vendas...",
        "info",
      );
      setTimeout(() => {
        window.location.href =
          vendaUrl;
      }, 2000);
      return;
    }

    // 2. Tem acesso → chama n8n para gerar magic link e enviar e-mail bonito
    const response = await fetch(
      "https://scaleonbr.app.n8n.cloud/webhook/enviar-magic-link",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-token": "PrecPro@2026#ScaleonBR",
        },
        body: JSON.stringify({ email: email.toLowerCase() }),
      },
    );

    if (!response.ok) throw new Error("Erro ao enviar");

    // Mostra tela de sucesso
    emailSent.textContent = email;
    formView.classList.add("hide");
    successView.classList.add("show");
  } catch (error) {
    console.error(error);
    showMsg("Ocorreu um erro. Tente novamente em instantes.", "error");
  } finally {
    btnEntrar.disabled = false;
    btnEntrar.textContent = "Enviar link de acesso";
  }
}

function showMsg(text, type) {
  msgBox.textContent = text;
  msgBox.className = `msg ${type} show`;
}

function hideMsg() {
  msgBox.className = "msg";
}
