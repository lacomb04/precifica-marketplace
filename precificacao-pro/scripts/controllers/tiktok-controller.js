import {
  getInputNumber,
  getInputPercent,
  getSelectValue,
} from "../core/dom.js";
import { renderPricingCard, syncRangeLabel } from "../ui/renderer.js";
import { PRICING_CARD_PREFIX } from "../config/marketplaces.js";
import { calculateTikTokPrice } from "../domain/calculators/tiktok-calculator.js";

const INPUT_IDS = [
  "tp",
  "te",
  "tf",
  "ttp",
  "taf",
  "ta",
  "tpr",
  "ti",
  "to",
  "tmg",
];

export const handleTikTokCalculation = () => {
  const input = {
    productCost: getInputNumber("tp"),
    packagingCost: getInputNumber("te"),
    shippingCost: getInputNumber("tf"),
    isNewSeller: getSelectValue("ttp") === "novo",
    affiliatesPercent: getInputPercent("taf"),
    adsPercent: getInputPercent("ta"),
    promoPercent: getInputPercent("tpr"),
    taxPercent: getInputPercent("ti"),
    otherPercent: getInputPercent("to"),
    targetMargin: getInputPercent("tmg"),
  };

  const result = calculateTikTokPrice(input);
  renderPricingCard(PRICING_CARD_PREFIX.tiktok, result);
};

export const bindTikTokInputs = () => {
  INPUT_IDS.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    const eventType = element.tagName === "SELECT" ? "change" : "input";
    element.addEventListener(eventType, () => {
      if (element.type === "range") syncRangeLabel(element);
      handleTikTokCalculation();
    });
    if (element.type === "range") syncRangeLabel(element);
  });
};
