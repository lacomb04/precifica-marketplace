const SERVICE_BASE_RATE = 0.06;
const SERVICE_FEE_CAP = 50;

export const getTikTokServiceFee = (salePrice, isNewSeller) => {
  const baseFee = isNewSeller ? 0 : salePrice * SERVICE_BASE_RATE;
  return Math.min(baseFee, SERVICE_FEE_CAP);
};
