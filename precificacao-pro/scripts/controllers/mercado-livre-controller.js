import {
  getInputNumber,
  getInputPercent,
  getSelectValue,
  setInputValue,
} from "../core/dom.js";
import { renderPricingCard, syncRangeLabel } from "../ui/renderer.js";
import { PRICING_CARD_PREFIX } from "../config/marketplaces.js";
import { calculateMercadoLivrePrice } from "../domain/calculators/mercado-livre-calculator.js";
import { getMercadoLivreCommissionPercent } from "../domain/fees/mercado-livre-fees.js";

const INPUT_IDS = [
  "mp", // custo produto
  "me", // embalagem
  "mf", // frete
  "mcategory", // categoria
  "mplano", // classic | premium
  "ma", // ads %
  "mpr", // promo %
  "mi", // impostos %
  "mo", // outros %
  "mmg", // margem desejada %
];

export const handleMercadoLivreCalculation = () => {
  const input = {
    productCost: getInputNumber("mp"),
    packagingCost: getInputNumber("me"),
    shippingCost: getInputNumber("mf"),

    categoryKey: getSelectValue("mcategory"),
    listingType: getSelectValue("mplano"),

    adsPercent: getInputPercent("ma"),
    promoPercent: getInputPercent("mpr"),
    taxPercent: getInputPercent("mi"),
    otherPercent: getInputPercent("mo"),

    targetMargin: getInputPercent("mmg"),
  };

  const result = calculateMercadoLivrePrice(input);

  renderPricingCard(PRICING_CARD_PREFIX.mercadoLivre, result);
};

const updateMercadoLivreCommission = () => {
  const categoryKey = getSelectValue("mcategory");
  const listingType = getSelectValue("mplano");

  const commissionPercent = getMercadoLivreCommissionPercent({
    categoryKey,
    listingType,
  });

  setInputValue("mc", (commissionPercent * 100).toFixed(2));
};

const bindMercadoLivreEvents = () => {
  document.getElementById("mcategory").addEventListener("change", () => {
    updateMercadoLivreCommission();
    handleMercadoLivreCalculation();
  });

  document.getElementById("mplano").addEventListener("change", () => {
    updateMercadoLivreCommission();
    handleMercadoLivreCalculation();
  });
};

export const bindMercadoLivreInputs = () => {
  INPUT_IDS.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;

    const eventType = element.tagName === "SELECT" ? "change" : "input";

    element.addEventListener(eventType, () => {
      if (id === "mcategory" || id === "mplano") {
        updateMercadoLivreCommission();
      }
      if (element.type === "range") syncRangeLabel(element);
      handleMercadoLivreCalculation();
    });

    if (element.type === "range") syncRangeLabel(element);
  });
  updateMercadoLivreCommission();
  handleMercadoLivreCalculation();
};
