import { getShopeeFeeBreakdown } from "../fees/shopee-fees.js";
import { buildBreakdown } from "../shared/breakdown.js";
import { isVariableShareInvalid } from "../../core/validators.js";

const emptyBreakdown = () => [
  { label: "Produto", value: 0 },
  { label: "Shopee (taxas)", value: 0 },
  { label: "Marketing", value: 0 },
  { label: "Impostos", value: 0 },
  { label: "Outros", value: 0 },
  { label: "Lucro Líquido", value: 0 },
];

export const calculateShopeePrice = (input) => {
  const {
    sellerType,
    productCost,
    packagingCost,
    adsPercent,
    promoPercent,
    taxPercent,
    otherPercent,
    targetMargin,
  } = input;

  const marketingPercent = adsPercent + promoPercent;
  const extraVariablePercent = marketingPercent + taxPercent + otherPercent;
  const fixedBaseCosts = productCost + packagingCost;

  if (fixedBaseCosts < 0 || targetMargin < 0) {
    return {
      salePrice: 0,
      breakdown: buildBreakdown(emptyBreakdown()),
    };
  }

  let salePrice = fixedBaseCosts || 1;

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const feeBreakdown = getShopeeFeeBreakdown({
      salePrice,
      sellerType,
    });

    const variableShare =
      feeBreakdown.commissionPercent +
      extraVariablePercent;

    if (isVariableShareInvalid(variableShare)) {
      return {
        salePrice: 0,
        breakdown: buildBreakdown(emptyBreakdown()),
      };
    }

    const desiredProfit = productCost * targetMargin;

    const nextSalePrice =
      (fixedBaseCosts + desiredProfit + feeBreakdown.fixedFee) /
      (1 - variableShare);

    if (!Number.isFinite(nextSalePrice) || nextSalePrice <= 0) {
      return {
        salePrice: 0,
        breakdown: buildBreakdown(emptyBreakdown()),
      };
    }

    if (Math.abs(nextSalePrice - salePrice) < 0.01) {
      salePrice = nextSalePrice;
      break;
    }

    salePrice = nextSalePrice;
  }

  const finalFees = getShopeeFeeBreakdown({
    salePrice,
    sellerType,
  });

  const marketingValue = salePrice * marketingPercent;
  const taxValue = salePrice * taxPercent;
  const otherValue = salePrice * otherPercent;

  const totalCosts =
    productCost +
    packagingCost +
    finalFees.totalMarketplaceFee +
    marketingValue +
    taxValue +
    otherValue;

  const netProfit = salePrice - totalCosts;

  return {
    salePrice,
    breakdown: buildBreakdown([
      { label: "Produto", value: productCost + packagingCost },
      {
        label: "Shopee (taxas)",
        value: finalFees.totalMarketplaceFee,
      },
      { label: "Marketing", value: marketingValue },
      { label: "Impostos", value: taxValue },
      { label: "Outros", value: otherValue },
      { label: "Lucro Líquido", value: netProfit },
    ]),
  };
};
