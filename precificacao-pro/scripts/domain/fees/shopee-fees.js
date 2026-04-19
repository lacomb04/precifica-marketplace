export const SHOPEE_BASE_COMMISSION_RATE = 0.14;

// Ajuste aqui se a Shopee mudar novamente.
export const SHOPEE_FIXED_FEES = {
  cpf: 4,
  cpf_high_volume: 7,
};

export const SHOPEE_CNPJ_TIERS = [
  {
    maxPriceExclusive: 80,
    commissionPercent: 0.2,
    fixedFee: 4,
  },
  {
    maxPriceExclusive: 100,
    commissionPercent: 0.14,
    fixedFee: 16,
  },
  {
    maxPriceExclusive: 200,
    commissionPercent: 0.14,
    fixedFee: 20,
  },
  {
    maxPriceExclusive: 500,
    commissionPercent: 0.14,
    fixedFee: 26,
  },
  {
    maxPriceExclusive: Number.POSITIVE_INFINITY,
    commissionPercent: 0.14,
    fixedFee: 26,
  },
];

export const SHOPEE_CPF_TIERS = [
  {
    maxPriceExclusive: 80,
    commissionPercent: 0.2,
    fixedFee: 4,
  },
  {
    maxPriceExclusive: 100,
    commissionPercent: 0.14,
    fixedFee: 16,
  },
  {
    maxPriceExclusive: 200,
    commissionPercent: 0.14,
    fixedFee: 20,
  },
  {
    maxPriceExclusive: 500,
    commissionPercent: 0.14,
    fixedFee: 26,
  },
  {
    maxPriceExclusive: Number.POSITIVE_INFINITY,
    commissionPercent: 0.14,
    fixedFee: 26,
  },
];

export const SHOPEE_CPF_HIGH_VOLUME_TIERS = [
  {
    maxPriceExclusive: 80,
    commissionPercent: 0.2,
    fixedFee: 7,
  },
  {
    maxPriceExclusive: 100,
    commissionPercent: 0.14,
    fixedFee: 19,
  },
  {
    maxPriceExclusive: 200,
    commissionPercent: 0.14,
    fixedFee: 23,
  },
  {
    maxPriceExclusive: 500,
    commissionPercent: 0.14,
    fixedFee: 29,
  },
  {
    maxPriceExclusive: Number.POSITIVE_INFINITY,
    commissionPercent: 0.14,
    fixedFee: 29,
  },
];

const getShopeeCnpjTier = (salePrice) => {
  for (const tier of SHOPEE_CNPJ_TIERS) {
    if (salePrice < tier.maxPriceExclusive) {
      return tier;
    }
  }

  return SHOPEE_CNPJ_TIERS[SHOPEE_CNPJ_TIERS.length - 1];
};

const getShopeeCpfTier = (salePrice) => {
  for (const tier of SHOPEE_CPF_TIERS) {
    if (salePrice < tier.maxPriceExclusive) {
      return tier;
    }
  }

  return SHOPEE_CPF_TIERS[SHOPEE_CPF_TIERS.length - 1];
};

const getShopeeCpfHighVolumeTier = (salePrice) => {
  for (const tier of SHOPEE_CPF_HIGH_VOLUME_TIERS) {
    if (salePrice < tier.maxPriceExclusive) {
      return tier;
    }
  }

  return SHOPEE_CPF_HIGH_VOLUME_TIERS[SHOPEE_CPF_HIGH_VOLUME_TIERS.length - 1];
};

export const getShopeeFeeBreakdown = ({ salePrice, sellerType }) => {
  if (!Number.isFinite(salePrice) || salePrice <= 0) {
    return {
      commissionPercent: 0,
      commissionValue: 0,
      fixedFee: 0,
      totalMarketplaceFee: 0,
    };
  }

  if (sellerType === "cnpj") {
    const tier = getShopeeCnpjTier(salePrice);
    const commissionValue = salePrice * tier.commissionPercent;

    return {
      commissionPercent: tier.commissionPercent,
      commissionValue,
      fixedFee: tier.fixedFee,
      totalMarketplaceFee: commissionValue + tier.fixedFee,
    };
  }

  if (sellerType === "cpf") {
    const tier = getShopeeCpfTier(salePrice);
    const commissionValue = salePrice * tier.commissionPercent;

    return {
      commissionPercent: tier.commissionPercent,
      commissionValue,
      fixedFee: tier.fixedFee,
      totalMarketplaceFee: commissionValue + tier.fixedFee,
    };
  }

  if (sellerType === "cpf_high_volume") {
    const tier = getShopeeCpfHighVolumeTier(salePrice);
    const commissionValue = salePrice * tier.commissionPercent;

    return {
      commissionPercent: tier.commissionPercent,
      commissionValue,
      fixedFee: tier.fixedFee,
      totalMarketplaceFee: commissionValue + tier.fixedFee,
    };
  }

  const commissionPercent = SHOPEE_BASE_COMMISSION_RATE;
  const fixedFee = SHOPEE_FIXED_FEES[sellerType] ?? SHOPEE_FIXED_FEES.cpf;
  const commissionValue = salePrice * commissionPercent;

  return {
    commissionPercent,
    commissionValue,
    fixedFee,
    totalMarketplaceFee: commissionValue + fixedFee,
  };
};
