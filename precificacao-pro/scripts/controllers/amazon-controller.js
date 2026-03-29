import {
  getInputNumber,
  getInputPercent,
  getSelectValue,
} from "../core/dom.js";
import { renderPricingCard, syncRangeLabel } from "../ui/renderer.js";
import { PRICING_CARD_PREFIX } from "../config/marketplaces.js";
import { calculateAmazonPrice } from "../domain/calculators/amazon-calculator.js";

const INPUT_IDS = [
  "ap",
  "ae",
  "af",
  "aplano",
  "acategory",
  "aads",
  "apr",
  "aimp",
  "aout",
  "amg",
];

export const handleAmazonCalculation = () => {
  const input = {
    productCost: getInputNumber("ap"),
    packagingCost: getInputNumber("ae"),
    shippingCost: getInputNumber("af"),
    plan: getSelectValue("aplano"),
    category: getSelectValue("acategory"),
    adsPercent: getInputPercent("aads"),
    promoPercent: getInputPercent("apr"),
    taxPercent: getInputPercent("aimp"),
    otherPercent: getInputPercent("aout"),
    targetMargin: getInputPercent("amg"),
  };

  const result = calculateAmazonPrice(input);
  renderPricingCard(PRICING_CARD_PREFIX.amazon, result);
};

export const bindAmazonInputs = () => {
  INPUT_IDS.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;

    const eventType = element.tagName === "SELECT" ? "change" : "input";

    element.addEventListener(eventType, () => {
      if (element.type === "range") syncRangeLabel(element);
      handleAmazonCalculation();
    });

    if (element.type === "range") syncRangeLabel(element);
  });
};

const updateMercadoLivreCommission = () => {
  const category = getSelectValue("mcategory");
  const plan = getSelectValue("mplano");

  const config =
    MERCADO_LIVRE_CATEGORIES[category] || MERCADO_LIVRE_CATEGORIES.outros;

  const commission = plan === "premium" ? config.premiumRate : config.rate;

  // converter pra %
  setInputValue("mc", (commission * 100).toFixed(2));
};
