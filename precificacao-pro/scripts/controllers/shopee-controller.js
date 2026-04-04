import {
  getInputNumber,
  getInputPercent,
  getSelectValue,
} from "../core/dom.js";
import { renderPricingCard, syncRangeLabel } from "../ui/renderer.js";
import { PRICING_CARD_PREFIX } from "../config/marketplaces.js";
import { calculateShopeePrice } from "../domain/calculators/shopee-calculator.js";

const INPUT_IDS = ["sp", "se", "sm", "sfp", "sa", "spr", "si", "so", "smg"];

export const handleShopeeCalculation = () => {
  const input = {
    sellerType: getSelectValue("sm"),
    productCost: getInputNumber("sp"),
    packagingCost: getInputNumber("se"),
    adsPercent: getInputPercent("sa"),
    promoPercent: getInputPercent("spr"),
    taxPercent: getInputPercent("si"),
    otherPercent: getInputPercent("so"),
    targetMargin: getInputPercent("smg"),
  };

  const result = calculateShopeePrice(input);
  renderPricingCard(PRICING_CARD_PREFIX.shopee, result);
};

export const bindShopeeInputs = () => {
  INPUT_IDS.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;

    const eventName = element.type === "range" ? "input" : "change";

    element.addEventListener(eventName, () => {
      if (element.type === "range") {
        syncRangeLabel(element);
      }

      handleShopeeCalculation();
    });
  });
};
