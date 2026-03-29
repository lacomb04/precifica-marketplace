import {
  getShopeeCommissionRate,
  getShopeeFixedFee,
} from "../fees/shopee-fees.js";
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
    programFreeShipping,
    productCost,
    packagingCost,
    shippingCost,
    adsPercent,
    promoPercent,
    taxPercent,
    otherPercent,
    targetMargin,
  } = input;

  const commissionPercent = getShopeeCommissionRate({
    programFreeShipping,
  });

  const fixedFee = getShopeeFixedFee({
    sellerType,
  });

  const marketingPercent = adsPercent + promoPercent;
  const variableShare =
    commissionPercent + marketingPercent + taxPercent + otherPercent;

  if (isVariableShareInvalid(variableShare)) {
    return {
      salePrice: 0,
      breakdown: buildBreakdown(emptyBreakdown()),
    };
  }

  const baseCosts = productCost + packagingCost + shippingCost + fixedFee;
  const desiredProfit = productCost * targetMargin;

  const salePrice = (baseCosts + desiredProfit) / (1 - variableShare);

  const commissionValue = salePrice * commissionPercent;
  const marketingValue = salePrice * marketingPercent;
  const taxValue = salePrice * taxPercent;
  const otherValue = salePrice * otherPercent;

  const totalCosts =
    productCost +
    packagingCost +
    shippingCost +
    fixedFee +
    commissionValue +
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
        value: commissionValue + fixedFee + shippingCost,
      },
      { label: "Marketing", value: marketingValue },
      { label: "Impostos", value: taxValue },
      { label: "Outros", value: otherValue },
      { label: "Lucro Líquido", value: netProfit },
    ]),
  };
};
