import { getTikTokServiceFee } from '../fees/tiktok-fees.js';
import { buildBreakdown } from '../shared/breakdown.js';
import { isVariableShareInvalid } from '../../core/validators.js';

const emptyBreakdown = () => ([
  { label: 'Produto', value: 0 },
  { label: 'TikTok (taxa+frete)', value: 0 },
  { label: 'Marketing', value: 0 },
  { label: 'Impostos', value: 0 },
  { label: 'Outros', value: 0 },
  { label: 'Lucro Líquido', value: 0 },
]);

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

  const marketingPercent = adsPercent + promoPercent;
  const baseCommissionPercent = isNewSeller ? 0 : 0.06;
  const commissionPercent = baseCommissionPercent + affiliatesPercent;
  const variableShare = commissionPercent + marketingPercent + taxPercent + otherPercent + targetMargin;

  if (isVariableShareInvalid(variableShare)) {
    return { salePrice: 0, breakdown: buildBreakdown(emptyBreakdown()) };
  }

  let salePrice = 0;
  for (let attempt = 0; attempt < 15; attempt += 1) {
    const costs = productCost + packagingCost + shippingCost;
    salePrice = costs / (1 - variableShare);
  }

  const serviceFee = getTikTokServiceFee(salePrice, isNewSeller);
  const affiliatesValue = salePrice * affiliatesPercent;
  const marketingValue = salePrice * marketingPercent;
  const taxValue = salePrice * taxPercent;
  const otherValue = salePrice * otherPercent;
  const profitValue = salePrice * targetMargin;

  const breakdown = buildBreakdown([
    { label: 'Produto', value: productCost + packagingCost },
    { label: 'TikTok (taxa+frete)', value: serviceFee + affiliatesValue + shippingCost },
    { label: 'Marketing', value: marketingValue },
    { label: 'Impostos', value: taxValue },
    { label: 'Outros', value: otherValue },
    { label: 'Lucro Líquido', value: profitValue },
  ]);

  return { salePrice, breakdown };
};
