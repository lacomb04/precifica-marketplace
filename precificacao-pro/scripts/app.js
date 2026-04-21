import { showHome, showMarketplace } from "./ui/navigation.js";
import { openInfoModal, closeInfoModal } from "./ui/modal.js";
import {
  bindShopeeInputs,
  handleShopeeCalculation,
} from "./controllers/shopee-controller.js";
import {
  bindMercadoLivreInputs,
  handleMercadoLivreCalculation,
} from "./controllers/mercado-livre-controller.js";
import {
  bindTikTokInputs,
  handleTikTokCalculation,
} from "./controllers/tiktok-controller.js";
import {
  bindAmazonInputs,
  handleAmazonCalculation,
} from "./controllers/amazon-controller.js";
import {
  bindComparisonInputs,
  handleComparisonCalculation,
} from "./controllers/comparison-controller.js";
import { clearSession, resolveAccess } from "./auth/auth.js";
import {
  clearTrialAccess,
  formatRemaining,
  getRemainingSeconds,
  redirectToSalePage,
} from "./auth/trial-access.js";
import { normalizeNumberInputs } from "./core/dom.js";

const MARKETPLACE_KEYS = {
  s: "shopee",
  m: "mercadoLivre",
  t: "tiktok",
  a: "amazon",
};

const INITIAL_CALCULATORS = {
  shopee: handleShopeeCalculation,
  mercadoLivre: handleMercadoLivreCalculation,
  tiktok: handleTikTokCalculation,
  amazon: handleAmazonCalculation,
  comparador: handleComparisonCalculation,
};

const calculatorBindings = [
  bindShopeeInputs,
  bindMercadoLivreInputs,
  bindTikTokInputs,
  bindAmazonInputs,
  bindComparisonInputs,
];

const runInitialCalculations = () => {
  Object.values(INITIAL_CALCULATORS).forEach((calculate) => calculate());
};

const bindNavigation = () => {
  const brand = document.querySelector(".brand");
  const backButton = document.getElementById("navBack");
  const logoutButton = document.getElementById("navLogout");

  brand?.addEventListener("click", showHome);
  backButton?.addEventListener("click", showHome);
  logoutButton?.addEventListener("click", () => {
    clearSession();
    clearTrialAccess();
    window.location.href = "login.html";
  });

  document.querySelectorAll("[data-target-page]").forEach((card) => {
    card.addEventListener("click", () => {
      const key = card.dataset.targetPage;
      showMarketplace(key);
      const calculator = INITIAL_CALCULATORS[key];
      if (calculator) calculator();
    });
  });
};

const bindModalTriggers = () => {
  document.querySelectorAll("[data-modal-key]").forEach((trigger) => {
    trigger.addEventListener("click", () =>
      openInfoModal(trigger.dataset.modalKey),
    );
  });

  const overlay = document.getElementById("ov");
  const closeButton = document.querySelector(".mx");
  overlay?.addEventListener("click", closeInfoModal);
  closeButton?.addEventListener("click", closeInfoModal);
};

const bindRangeLabels = () => {
  document.querySelectorAll('input[type="range"]').forEach((range) => {
    const labelId = range.dataset.labelTarget;
    if (labelId) {
      const label = document.getElementById(labelId);
      if (label) label.textContent = `${range.value}%`;
    }
  });
};

const bindTrialTimer = (trialData) => {
  const timerEl = document.getElementById("trialTimer");
  if (!timerEl) return;

  timerEl.classList.add("show");

  const refreshTimer = () => {
    const remaining = getRemainingSeconds(trialData.expiresAt);
    if (remaining <= 0) {
      clearTrialAccess();
      redirectToSalePage();
      return;
    }

    timerEl.textContent = `Teste gratis: ${formatRemaining(remaining)}`;
  };

  refreshTimer();
  window.setInterval(refreshTimer, 1000);
};

const applyIdentity = (access) => {
  const emailEl = document.getElementById("userEmail");
  const dotEl = document.getElementById("statusDot");
  if (!emailEl || !dotEl) return;

  emailEl.textContent = access.label;
  if (access.mode === "trial") {
    dotEl.style.background = "#ffb020";
    dotEl.style.boxShadow = "0 0 6px #ffb020";
  }
};

const boot = async () => {
  const access = await resolveAccess();
  if (!access) {
    window.location.replace("/login.html");
    return;
  }

  applyIdentity(access);

  if (access.mode === "trial") {
    bindTrialTimer(access.trial);
  }

  normalizeNumberInputs();
  bindNavigation();
  calculatorBindings.forEach((bind) => bind());
  bindModalTriggers();
  bindRangeLabels();
  runInitialCalculations();
};

document.addEventListener("DOMContentLoaded", boot);
