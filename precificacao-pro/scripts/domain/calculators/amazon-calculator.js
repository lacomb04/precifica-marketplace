import {
  getAmazonCommission,
  getAmazonCommissionRate,
  getAmazonItemFee,
} from "../fees/amazon-fees.js";
import { buildBreakdown } from "../shared/breakdown.js";
import { isVariableShareInvalid } from "../../core/validators.js";

const emptyBreakdown = () => [
  { label: "Produto", value: 0 },
  { label: "Amazon (comis+frete)", value: 0 },
  { label: "Marketing", value: 0 },
  { label: "Impostos", value: 0 },
  { label: "Outros", value: 0 },
  { label: "Lucro Líquido", value: 0 },
];

export const calculateAmazonPrice = (input) => {
  const {
    productCost,
    packagingCost,
    shippingCost,
    plan,
    category,
    adsPercent,
    promoPercent,
    taxPercent,
    otherPercent,
    targetMargin,
  } = input;

  const itemFee = getAmazonItemFee(plan);
  const commissionPercent = getAmazonCommissionRate(category);
  const marketingPercent = adsPercent + promoPercent;

  // Só percentuais que realmente incidem sobre a venda.
  const variableShare =
    commissionPercent + marketingPercent + taxPercent + otherPercent;

  if (isVariableShareInvalid(variableShare)) {
    return { salePrice: 0, breakdown: buildBreakdown(emptyBreakdown()) };
  }

  let salePrice = 0;
  let extraMinCommission = 0;

  for (let attempt = 0; attempt < 30; attempt += 1) {
    const baseCosts =
      productCost + packagingCost + shippingCost + itemFee + extraMinCommission;

    // Lucro desejado sobre custo, não sobre venda
    const desiredProfit = productCost * targetMargin;

    salePrice = (baseCosts + desiredProfit) / (1 - variableShare);

    const commissionValue = getAmazonCommission({
      totalSaleAmount: salePrice,
      category,
    });

    const percentageCommission = salePrice * commissionPercent;

    // Se a comissão mínima for maior que a percentual,
    // a diferença vira custo fixo adicional.
    extraMinCommission = Math.max(0, commissionValue - percentageCommission);
  }

  const finalBaseCosts =
    productCost + packagingCost + shippingCost + itemFee + extraMinCommission;

  const commissionValue = getAmazonCommission({
    totalSaleAmount: salePrice,
    category,
  });

  const marketingValue = salePrice * marketingPercent;
  const taxValue = salePrice * taxPercent;
  const otherValue = salePrice * otherPercent;

  // Lucro líquido sobre custo
  const profitValue = productCost * targetMargin;

  const breakdown = buildBreakdown([
    { label: "Produto", value: productCost + packagingCost },
    {
      label: "Amazon (comis+frete)",
      value: commissionValue + itemFee + shippingCost,
    },
    { label: "Marketing", value: marketingValue },
    { label: "Impostos", value: taxValue },
    { label: "Outros", value: otherValue },
    { label: "Lucro Líquido", value: profitValue },
  ]);

  return { salePrice, breakdown };
};
