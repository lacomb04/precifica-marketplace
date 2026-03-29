export const SHOPEE_BASE_COMMISSION_RATE = 0.14;
export const SHOPEE_FREE_SHIPPING_RATE = 0.06;

// Ajuste aqui se a Shopee mudar novamente.
export const SHOPEE_FIXED_FEES = {
  cnpj: 4,
  cpf: 7,
  cpf_high_volume: 4,
};

export const getShopeeCommissionRate = ({ programFreeShipping }) => {
  return (
    SHOPEE_BASE_COMMISSION_RATE +
    (programFreeShipping === "sim" ? SHOPEE_FREE_SHIPPING_RATE : 0)
  );
};

export const getShopeeFixedFee = ({ sellerType }) => {
  return SHOPEE_FIXED_FEES[sellerType] ?? SHOPEE_FIXED_FEES.cpf;
};
