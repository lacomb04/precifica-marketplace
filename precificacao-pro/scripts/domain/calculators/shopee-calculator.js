import { getShopeeFee } from '../fees/shopee-fees.js';
import { buildBreakdown } from '../shared/breakdown.js';
import { isVariableShareInvalid } from '../../core/validators.js';

export const calculateShopeePrice = (input) => {
  const {
    productCost,
    packagingCost,
    shippingCost,
    sellerProfile,
    hasFreeShippingProgram,
    adsPercent,
    promoPercent,
    taxPercent,
    otherPercent,
    targetMargin,
  } = input;

  const marketingPercent = adsPercent + promoPercent;
  const variableShare = marketingPercent + taxPercent + otherPercent + targetMargin;

  if (isVariableShareInvalid(variableShare)) {
    return { salePrice: 0, breakdown: buildBreakdown(emptyShopeeBreakdown()) };
  }

  let salePrice = 0;
  let feePercent = 0;
  let fixedFee = 0;

  for (let attempt = 0; attempt < 25; attempt += 1) {
    const costs = productCost + packagingCost + fixedFee + shippingCost;
    salePrice = costs / (1 - variableShare - feePercent);
    const updatedFee = getShopeeFee(salePrice, sellerProfile, hasFreeShippingProgram);
    if (Math.abs(updatedFee.percentCommission - feePercent) < 0.0001 && updatedFee.fixedFee === fixedFee) {
      break;
    }
    feePercent = updatedFee.percentCommission;
    fixedFee = updatedFee.fixedFee;
  }

  const commissionValue = salePrice * feePercent;
  const marketingValue = salePrice * marketingPercent;
  const taxValue = salePrice * taxPercent;
  const otherValue = salePrice * otherPercent;
  const profitValue = salePrice * targetMargin;

  const breakdown = buildBreakdown([
    { label: 'Produto', value: productCost + packagingCost },
    { label: 'Shopee (comis+fixo+frete)', value: commissionValue + fixedFee + shippingCost },
    { label: 'Marketing', value: marketingValue },
    { label: 'Impostos', value: taxValue },
    { label: 'Outros', value: otherValue },
    { label: 'Lucro Líquido', value: profitValue },
  ]);

  return { salePrice, breakdown };
};

const emptyShopeeBreakdown = () => ([
  { label: 'Produto', value: 0 },
  { label: 'Shopee (comis+fixo+frete)', value: 0 },
  { label: 'Marketing', value: 0 },
  { label: 'Impostos', value: 0 },
  { label: 'Outros', value: 0 },
  { label: 'Lucro Líquido', value: 0 },
]);
