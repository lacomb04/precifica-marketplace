import { getMercadoLivreFeeBreakdown } from "../fees/mercado-livre-fees.js";
import { buildBreakdown } from "../shared/breakdown.js";
import { isVariableShareInvalid } from "../../core/validators.js";

const emptyBreakdown = () => [
  { label: "Produto", value: 0 },
  { label: "Embalagem", value: 0 },
  { label: "Frete", value: 0 },
  { label: "Mercado Livre", value: 0 },
  { label: "Marketing", value: 0 },
  { label: "Impostos", value: 0 },
  { label: "Outros", value: 0 },
  { label: "Lucro Líquido", value: 0 },
];

const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const invalidResult = () => ({
  salePrice: 0,
  profit: 0,
  breakdown: emptyBreakdown(),
  meta: {
    viable: false,
    reason: "Não foi possível calcular um preço de venda viável.",
  },
});

export const calculateMercadoLivrePrice = ({
  productCost = 0,
  packagingCost = 0,
  shippingCost = 0,

  categoryKey = "outros",
  listingType = "classic",
  customCommissionRate = null,

  adsPercent = 0,
  promoPercent = 0,
  taxPercent = 0,
  otherPercent = 0,

  installmentExtraPercent = 0,
  installmentExtraFixed = 0,

  extraShippingSubsidy = 0,

  targetMargin = 0,
}) => {
  const fixedBaseCosts = productCost + packagingCost + shippingCost;

  const marketingPercent = adsPercent + promoPercent;
  const extraVariablePercent = marketingPercent + taxPercent + otherPercent;

  if (fixedBaseCosts < 0 || targetMargin < 0) {
    return invalidResult();
  }

  let salePrice = fixedBaseCosts || 1;

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const feeBreakdown = getMercadoLivreFeeBreakdown({
      salePrice,
      categoryKey,
      listingType,
      customCommissionRate,
      installmentExtraPercent,
      installmentExtraFixed,
      manualShippingCost: shippingCost,
      extraShippingSubsidy,
    });

    const variableShare =
      feeBreakdown.commissionPercent +
      extraVariablePercent +
      installmentExtraPercent;

    if (variableShare >= 1) {
      return {
        salePrice: 0,
        profit: 0,
        breakdown: emptyBreakdown(),
        meta: {
          viable: false,
          reason: "A soma das taxas percentuais atingiu ou ultrapassou 100%.",
        },
      };
    }

    const desiredProfit = fixedBaseCosts * targetMargin;

    const nextSalePrice =
      (fixedBaseCosts +
        desiredProfit +
        feeBreakdown.fixedFee +
        feeBreakdown.installmentExtra +
        feeBreakdown.shippingSubsidy) /
      (1 - variableShare);

    if (!Number.isFinite(nextSalePrice) || nextSalePrice <= 0) {
      return invalidResult();
    }

    if (Math.abs(nextSalePrice - salePrice) < 0.01) {
      salePrice = nextSalePrice;
      break;
    }

    salePrice = nextSalePrice;
  }

  const finalFees = getMercadoLivreFeeBreakdown({
    salePrice,
    categoryKey,
    listingType,
    customCommissionRate,
    installmentExtraPercent,
    installmentExtraFixed,
    manualShippingCost: shippingCost,
    extraShippingSubsidy,
  });

  const marketingValue = salePrice * marketingPercent;
  const taxValue = salePrice * taxPercent;
  const otherValue = salePrice * otherPercent;

  const totalCosts =
    productCost +
    packagingCost +
    shippingCost +
    finalFees.totalMarketplaceFee +
    marketingValue +
    taxValue +
    otherValue;

  const profit = salePrice - totalCosts;

  return {
    salePrice: roundMoney(salePrice),
    profit: roundMoney(profit),
    breakdown: [
      { label: "Produto", value: roundMoney(productCost) },
      { label: "Embalagem", value: roundMoney(packagingCost) },
      { label: "Frete", value: roundMoney(shippingCost) },
      {
        label: "Mercado Livre",
        value: roundMoney(finalFees.totalMarketplaceFee),
      },
      { label: "Marketing", value: roundMoney(marketingValue) },
      { label: "Impostos", value: roundMoney(taxValue) },
      { label: "Outros", value: roundMoney(otherValue) },
      { label: "Lucro Líquido", value: roundMoney(profit) },
    ],
    meta: {
      viable: salePrice > 0 && Number.isFinite(salePrice),
      categoryKey,
      listingType,
      commissionPercent: finalFees.commissionPercent,
      fixedFee: roundMoney(finalFees.fixedFee),
      installmentExtra: roundMoney(finalFees.installmentExtra),
      shippingSubsidy: roundMoney(finalFees.shippingSubsidy),
      totalMarketplaceFee: roundMoney(finalFees.totalMarketplaceFee),
      marketingPercent,
      taxPercent,
      otherPercent,
      targetMargin,
    },
  };
};
