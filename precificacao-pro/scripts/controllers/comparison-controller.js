import { getInputNumber, getInputPercent, getSelectValue } from "../core/dom.js";
import { formatCurrency } from "../core/formatters.js";
import { calculateShopeePrice } from "../domain/calculators/shopee-calculator.js";
import { calculateMercadoLivrePrice } from "../domain/calculators/mercado-livre-calculator.js";
import { calculateTikTokPrice } from "../domain/calculators/tiktok-calculator.js";
import { calculateAmazonPrice } from "../domain/calculators/amazon-calculator.js";
import { syncRangeLabel } from "../ui/renderer.js";

const INPUT_IDS = [
  "cp",
  "ce",
  "cf",
  "ca",
  "cpr",
  "ci",
  "co",
  "cmg",
  "csm",
  "csfp",
  "cmcategory",
  "cmplano",
  "cttipo",
  "ctaf",
  "caplano",
  "cacategory",
];

const MARKETPLACE_NAMES = {
  shopee: "Shopee",
  mercadoLivre: "Mercado Livre",
  tiktok: "TikTok Shop",
  amazon: "Amazon",
};

const MARKETPLACE_LOGOS = {
  shopee: "assets/logos/shopee.svg",
  mercadoLivre: "assets/logos/mercado-livre.svg",
  tiktok: "assets/logos/tiktok.webp",
  amazon: "assets/logos/amazon.webp",
};

const getProfitFromBreakdown = (breakdown) => {
  if (!Array.isArray(breakdown)) return 0;
  const profitRow = breakdown.find((row) =>
    typeof row.label === "string" && row.label.toLowerCase().includes("lucro"),
  );
  return Number.isFinite(profitRow?.value) ? profitRow.value : 0;
};

const formatPercent = (value) => `${(value * 100).toFixed(1)}%`;

const buildBaseInput = () => ({
  productCost: getInputNumber("cp"),
  packagingCost: getInputNumber("ce"),
  shippingCost: getInputNumber("cf"),
  adsPercent: getInputPercent("ca"),
  promoPercent: getInputPercent("cpr"),
  taxPercent: getInputPercent("ci"),
  otherPercent: getInputPercent("co"),
  targetMargin: getInputPercent("cmg"),
});

const buildMarketplaceInputs = (baseInput) => ({
  shopee: {
    ...baseInput,
    sellerType: getSelectValue("csm"),
    programFreeShipping: getSelectValue("csfp"),
  },
  mercadoLivre: {
    ...baseInput,
    categoryKey: getSelectValue("cmcategory"),
    listingType: getSelectValue("cmplano"),
  },
  tiktok: {
    ...baseInput,
    isNewSeller: getSelectValue("cttipo") === "novo",
    affiliatesPercent: getInputPercent("ctaf"),
  },
  amazon: {
    ...baseInput,
    plan: getSelectValue("caplano"),
    category: getSelectValue("cacategory"),
  },
});

const calculateAll = (inputsByMarketplace) => {
  const calculators = {
    shopee: calculateShopeePrice,
    mercadoLivre: calculateMercadoLivrePrice,
    tiktok: calculateTikTokPrice,
    amazon: calculateAmazonPrice,
  };

  return Object.entries(calculators).map(([key, calculator]) => {
    const result = calculator(inputsByMarketplace[key]);
    const salePrice = Number.isFinite(result.salePrice) ? result.salePrice : 0;
    const profit = getProfitFromBreakdown(result.breakdown);
    const marginOverSale = salePrice > 0 ? profit / salePrice : 0;

    return {
      key,
      name: MARKETPLACE_NAMES[key],
      salePrice,
      profit,
      marginOverSale,
      breakdown: result.breakdown || [],
    };
  });
};

const renderComparison = (results) => {
  const container = document.getElementById("cmpResults");
  const bestLabel = document.getElementById("cmpBest");
  if (!container) return;

  const validResults = results.filter((item) => item.salePrice > 0);
  const best = validResults.reduce(
    (currentBest, item) => {
      if (!currentBest) return item;
      if (item.profit > currentBest.profit) return item;
      if (item.profit === currentBest.profit && item.salePrice < currentBest.salePrice) return item;
      return currentBest;
    },
    null,
  );

  if (bestLabel) {
    bestLabel.textContent = best
      ? `${best.name} entrega o maior lucro líquido (${formatCurrency(best.profit)}) com margem de ${formatPercent(best.marginOverSale)}`
      : "Nenhum marketplace viável com os parâmetros atuais.";
  }

  if (!results.length) {
    container.innerHTML =
      '<div class="cmp-empty">Preencha os campos para comparar os marketplaces.</div>';
    return;
  }

  const sorted = [...results].sort((a, b) => {
    if (a.profit === b.profit) return a.salePrice - b.salePrice;
    return b.profit - a.profit;
  });

  const cards = sorted
    .map((item, index) => {
      const isBest = best?.key === item.key;
      const viable = item.salePrice > 0;
      const logo = MARKETPLACE_LOGOS[item.key];
      const breakdownHtml = item.breakdown
        .map(
          (row) => `
            <div class="cmp-row">
              <span>${row.label}</span>
              <span>${formatCurrency(row.value)}</span>
            </div>
          `,
        )
        .join("");

      const marginLabel = viable ? formatPercent(item.marginOverSale) : "--";

      return `
        <div class="cmp-card ${isBest ? "best" : ""} ${!viable ? "dim" : ""}">
            <div class="cmp-head">
              <div class="cmp-left">
                <div class="cmp-rank">#${index + 1}</div>
                <div class="cmp-name">${item.name}</div>
              </div>
              <div class="cmp-right">
                ${logo ? `<div class="cmp-logo"><img src="${logo}" alt="${item.name}"/></div>` : ""}
                <div class="cmp-status ${viable ? "ok" : "bad"}">
                  ${viable ? "Viável" : "Inviável"}
                </div>
              </div>
            </div>
          <div class="cmp-metrics">
              <div class="cmp-pill price">
                <small>Preço sugerido</small>
                <strong>${formatCurrency(item.salePrice)}</strong>
            </div>
              <div class="cmp-pill">
              <small>Lucro líquido</small>
              <strong>${formatCurrency(item.profit)}</strong>
            </div>
              <div class="cmp-pill">
              <small>Margem sobre venda</small>
              <strong>${marginLabel}</strong>
            </div>
          </div>
          <div class="cmp-breakdown">
            ${breakdownHtml}
          </div>
        </div>
      `;
    })
    .join("");

  container.innerHTML = cards;
};

export const handleComparisonCalculation = () => {
  const baseInput = buildBaseInput();
  const marketplaceInputs = buildMarketplaceInputs(baseInput);
  const results = calculateAll(marketplaceInputs);
  renderComparison(results);
};

export const bindComparisonInputs = () => {
  INPUT_IDS.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    const isRange = element.type === "range";
    const eventType = element.tagName === "SELECT" ? "change" : "input";

    if (isRange) {
      ["input", "change"].forEach((evt) => {
        element.addEventListener(evt, () => {
          syncRangeLabel(element);
          handleComparisonCalculation();
        });
      });
      syncRangeLabel(element);
      return;
    }

    element.addEventListener(eventType, handleComparisonCalculation);
  });
};
