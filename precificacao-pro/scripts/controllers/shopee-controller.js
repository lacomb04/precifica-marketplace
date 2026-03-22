import {
  getInputNumber,
  getInputPercent,
  getSelectValue,
} from "../core/dom.js";
import { renderPricingCard, syncRangeLabel } from "../ui/renderer.js";
import { PRICING_CARD_PREFIX } from "../config/marketplaces.js";
import { calculateShopeePrice } from "../domain/calculators/shopee-calculator.js";

const INPUT_IDS = [
  "sp",
  "se",
  "sf",
  "sm",
  "sfp",
  "spr",
  "sa",
  "si",
  "so",
  "smg",
];

export const handleShopeeCalculation = () => {
  const input = {
    productCost: getInputNumber("sp"),
    packagingCost: getInputNumber("se"),
    shippingCost: getInputNumber("sf"),
    sellerProfile: getSelectValue("sm"),
    hasFreeShippingProgram: getSelectValue("sfp") === "sim",
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
    const eventType = element.tagName === "SELECT" ? "change" : "input";
    element.addEventListener(eventType, () => {
      if (element.type === "range") syncRangeLabel(element);
      handleShopeeCalculation();
    });
    if (element.type === "range") syncRangeLabel(element);
  });
};
