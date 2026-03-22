import { getInputNumber, getInputPercent } from "../core/dom.js";
import { renderPricingCard, syncRangeLabel } from "../ui/renderer.js";
import { PRICING_CARD_PREFIX } from "../config/marketplaces.js";
import { calculateMercadoLivrePrice } from "../domain/calculators/mercado-livre-calculator.js";

const INPUT_IDS = ["mp", "me", "mf", "mc", "ma", "mpr", "mi", "mo", "mmg"];

export const handleMercadoLivreCalculation = () => {
  const input = {
    productCost: getInputNumber("mp"),
    packagingCost: getInputNumber("me"),
    shippingCost: getInputNumber("mf"),
    commissionPercent: getInputPercent("mc"),
    adsPercent: getInputPercent("ma"),
    promoPercent: getInputPercent("mpr"),
    taxPercent: getInputPercent("mi"),
    otherPercent: getInputPercent("mo"),
    targetMargin: getInputPercent("mmg"),
  };

  const result = calculateMercadoLivrePrice(input);
  renderPricingCard(PRICING_CARD_PREFIX.mercadoLivre, result);
};

export const bindMercadoLivreInputs = () => {
  INPUT_IDS.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    const eventType = element.tagName === "SELECT" ? "change" : "input";
    element.addEventListener(eventType, () => {
      if (element.type === "range") syncRangeLabel(element);
      handleMercadoLivreCalculation();
    });
    if (element.type === "range") syncRangeLabel(element);
  });
};
