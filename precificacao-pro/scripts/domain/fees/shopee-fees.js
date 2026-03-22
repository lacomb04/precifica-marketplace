export const getShopeeFee = (salePrice, sellerProfile, isFreeShipping) => {
  let percentCommission;
  let fixedFee;

  if (sellerProfile === 'cnpj') {
    if (salePrice < 80) {
      percentCommission = 0.2;
      fixedFee = 4;
    } else if (salePrice < 100) {
      percentCommission = 0.14;
      fixedFee = 16;
    } else if (salePrice < 200) {
      percentCommission = 0.14;
      fixedFee = 20;
    } else if (salePrice < 500) {
      percentCommission = 0.14;
      fixedFee = 26;
    } else {
      percentCommission = 0.14;
      fixedFee = 26;
    }
  } else if (sellerProfile === 'cpf_high_volume') {
    percentCommission = 0.14;
    fixedFee = 4;
  } else {
    percentCommission = 0.14;
    fixedFee = 7;
  }

  const freeShippingExtra = isFreeShipping ? 0.06 : 0;

  return {
    percentCommission: percentCommission + freeShippingExtra,
    fixedFee,
  };
};
