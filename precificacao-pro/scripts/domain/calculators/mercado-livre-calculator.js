import { getMercadoLivreFixedCost } from '../fees/mercado-livre-fees.js';
import { buildBreakdown } from '../shared/breakdown.js';
import { isVariableShareInvalid } from '../../core/validators.js';

const emptyBreakdown = () => ([
  { label: 'Produto', value: 0 },
  { label: 'ML (comis+fixo+frete)', value: 0 },
  { label: 'Marketing', value: 0 },
  { label: 'Impostos', value: 0 },
  { label: 'Outros', value: 0 },
  { label: 'Lucro Líquido', value: 0 },
]);

export const calculateMercadoLivrePrice = (input) => {
  const {
    productCost,
    packagingCost,
    shippingCost,
    commissionPercent,
    adsPercent,
    promoPercent,
    taxPercent,
    otherPercent,
    targetMargin,
  } = input;

  const marketingPercent = adsPercent + promoPercent;
  const variableShare = commissionPercent + marketingPercent + taxPercent + otherPercent + targetMargin;

  if (isVariableShareInvalid(variableShare)) {
    return { salePrice: 0, breakdown: buildBreakdown(emptyBreakdown()) };
  }

  let salePrice = 0;
  let fixedCost = 0;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const costs = productCost + packagingCost + fixedCost + shippingCost;
    salePrice = costs / (1 - variableShare);
    fixedCost = getMercadoLivreFixedCost(salePrice);
  }

  const commissionValue = salePrice * commissionPercent;
  const marketingValue = salePrice * marketingPercent;
  const taxValue = salePrice * taxPercent;
  const otherValue = salePrice * otherPercent;
  const profitValue = salePrice * targetMargin;

  const breakdown = buildBreakdown([
    { label: 'Produto', value: productCost + packagingCost },
    { label: 'ML (comis+fixo+frete)', value: commissionValue + fixedCost + shippingCost },
    { label: 'Marketing', value: marketingValue },
    { label: 'Impostos', value: taxValue },
    { label: 'Outros', value: otherValue },
    { label: 'Lucro Líquido', value: profitValue },
  ]);

  return { salePrice, breakdown };
};
