import { showHome, showMarketplace } from './ui/navigation.js';
import { openInfoModal, closeInfoModal } from './ui/modal.js';
import { bindShopeeInputs, handleShopeeCalculation } from './controllers/shopee-controller.js';
import { bindMercadoLivreInputs, handleMercadoLivreCalculation } from './controllers/mercado-livre-controller.js';
import { bindTikTokInputs, handleTikTokCalculation } from './controllers/tiktok-controller.js';
import { bindAmazonInputs, handleAmazonCalculation } from './controllers/amazon-controller.js';

const MARKETPLACE_KEYS = {
  s: 'shopee',
  m: 'mercadoLivre',
  t: 'tiktok',
  a: 'amazon',
};

const INITIAL_CALCULATORS = {
  shopee: handleShopeeCalculation,
  mercadoLivre: handleMercadoLivreCalculation,
  tiktok: handleTikTokCalculation,
  amazon: handleAmazonCalculation,
};

const calculatorBindings = [
  bindShopeeInputs,
  bindMercadoLivreInputs,
  bindTikTokInputs,
  bindAmazonInputs,
];

const runInitialCalculations = () => {
  Object.values(INITIAL_CALCULATORS).forEach((calculate) => calculate());
};

const bindNavigation = () => {
  const brand = document.querySelector('.brand');
  const backButton = document.getElementById('navBack');
  brand?.addEventListener('click', showHome);
  backButton?.addEventListener('click', showHome);

  document.querySelectorAll('[data-target-page]').forEach((card) => {
    card.addEventListener('click', () => {
      const key = card.dataset.targetPage;
      showMarketplace(key);
      const calculator = INITIAL_CALCULATORS[key];
      if (calculator) calculator();
    });
  });
};

const bindModalTriggers = () => {
  document.querySelectorAll('[data-modal-key]').forEach((trigger) => {
    trigger.addEventListener('click', () => openInfoModal(trigger.dataset.modalKey));
  });

  const overlay = document.getElementById('ov');
  const closeButton = document.querySelector('.mx');
  overlay?.addEventListener('click', closeInfoModal);
  closeButton?.addEventListener('click', closeInfoModal);
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

const boot = () => {
  bindNavigation();
  calculatorBindings.forEach((bind) => bind());
  bindModalTriggers();
  bindRangeLabels();
  runInitialCalculations();
};

document.addEventListener('DOMContentLoaded', boot);
