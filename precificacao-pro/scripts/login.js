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

// Se já tem sessão ativa vai direto pro sistema
supabaseClient.auth.getSession().then(({ data: { session } }) => {
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
          "https://paginavendaprecificacao.scaleonbr.com.br/index.html";
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
