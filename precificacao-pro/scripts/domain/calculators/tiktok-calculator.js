import { getTikTokServiceFee } from "../fees/tiktok-fees.js";
import { buildBreakdown } from "../shared/breakdown.js";
import { isVariableShareInvalid } from "../../core/validators.js";

const emptyBreakdown = () => [
  { label: "Produto", value: 0 },
  { label: "TikTok (taxa+frete)", value: 0 },
  { label: "Marketing", value: 0 },
  { label: "Impostos", value: 0 },
  { label: "Outros", value: 0 },
  { label: "Lucro Líquido", value: 0 },
];

export const calculateTikTokPrice = (input) => {
  const {
    productCost,
    packagingCost,
    shippingCost,
    isNewSeller,
    affiliatesPercent,
    adsPercent,
    promoPercent,
    taxPercent,
    otherPercent,
    targetMargin,
  } = input;

  const baseCosts = productCost + packagingCost + shippingCost;

  // Lucro desejado em cima do custo
  const desiredProfit = productCost * targetMargin;

  const marketingPercent = adsPercent + promoPercent;

  // Comissão base do TikTok sobre o preço de venda
  const baseCommissionPercent = isNewSeller ? 0 : 0.06;

  // Percentuais variáveis sobre a venda
  const variableShare =
    baseCommissionPercent +
    affiliatesPercent +
    marketingPercent +
    taxPercent +
    otherPercent;

  if (isVariableShareInvalid(variableShare)) {
    return {
      salePrice: 0,
      breakdown: buildBreakdown(emptyBreakdown()),
    };
  }

  // Preço de venda:
  // preço precisa cobrir custo + lucro desejado,
  // enquanto os percentuais incidem sobre a venda
  let salePrice = (baseCosts + desiredProfit) / (1 - variableShare);
  // Se cair na regra dos R$79,90, recalcula COM taxa fixa
  if (salePrice <= 79.9) {
    const extraFee = 2;

    salePrice = (baseCosts + desiredProfit + extraFee) / (1 - variableShare);
  }

  // Valores reais calculados sobre a venda
  const serviceFee = getTikTokServiceFee(salePrice, isNewSeller);
  const affiliatesValue = salePrice * affiliatesPercent;
  const marketingValue = salePrice * marketingPercent;
  const taxValue = salePrice * taxPercent;
  const otherValue = salePrice * otherPercent;

  // Lucro líquido continua sobre custo
  const profitValue = desiredProfit;

  const breakdown = buildBreakdown([
    { label: "Produto", value: productCost + packagingCost },
    {
      label: "TikTok (taxa+frete)",
      value: serviceFee + affiliatesValue + shippingCost,
    },
    { label: "Marketing", value: marketingValue },
    { label: "Impostos", value: taxValue },
    { label: "Outros", value: otherValue },
    { label: "Lucro Líquido", value: profitValue },
  ]);

  return { salePrice, breakdown };
};
