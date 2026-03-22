export const getMercadoLivreFixedCost = (salePrice) => {
  if (salePrice < 12.5) return salePrice * 0.5;
  if (salePrice < 29) return 6.25;
  if (salePrice < 50) return 6.5;
  if (salePrice < 79) return 6.75;
  return 0;
};
