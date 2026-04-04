import {
  ML_PUBLIC_RATE_LIMITS,
  getMercadoLivreCommissionRate,
} from "../../config/mercado-livre.categories.js";

export const ML_LISTING_TYPES = {
  CLASSIC: "classic",
  PREMIUM: "premium",
};

export const ML_FIXED_FEE_TIERS = [
  {
    maxPriceExclusive: 12.5,
    type: "percent_of_sale_price",
    value: 0.5,
    label: "50% do valor do produto",
  },
  {
    maxPriceExclusive: 29,
    type: "fixed",
    value: 6.25,
    label: "Custo fixo até R$ 29",
  },
  {
    maxPriceExclusive: 50,
    type: "fixed",
    value: 6.5,
    label: "Custo fixo até R$ 50",
  },
  {
    maxPriceExclusive: 79,
    type: "fixed",
    value: 6.75,
    label: "Custo fixo até R$ 79",
  },
];

export const clampMercadoLivrePublicRate = (rate, listingType) => {
  const limits =
    listingType === ML_LISTING_TYPES.PREMIUM
      ? ML_PUBLIC_RATE_LIMITS.premium
      : ML_PUBLIC_RATE_LIMITS.classic;

  if (!Number.isFinite(rate)) return limits.max;
  return Math.min(Math.max(rate, limits.min), limits.max);
};

export const getMercadoLivreFixedFee = (salePrice) => {
  if (!Number.isFinite(salePrice) || salePrice <= 0) return 0;

  for (const tier of ML_FIXED_FEE_TIERS) {
    if (salePrice < tier.maxPriceExclusive) {
      if (tier.type === "percent_of_sale_price") {
        return salePrice * tier.value;
      }
      return tier.value;
    }
  }

  return 0;
};

export const getMercadoLivreCommissionPercent = ({
  categoryKey,
  listingType,
  customRate = null,
  clampToPublicLimits = true,
}) => {
  const rawRate = getMercadoLivreCommissionRate({
    categoryKey,
    listingType,
    customRate,
  });

  if (!clampToPublicLimits) return rawRate;
  return clampMercadoLivrePublicRate(rawRate, listingType);
};

/**
 * Taxa extra opcional para parcelamento/repasse.
 * Em muitos cenários você vai embutir isso no próprio rate do anúncio,
 * então por padrão deixamos 0.
 */
export const getMercadoLivreInstallmentExtra = ({
  salePrice,
  installmentExtraPercent = 0,
  installmentExtraFixed = 0,
}) => {
  if (!Number.isFinite(salePrice) || salePrice <= 0) return 0;
  return salePrice * installmentExtraPercent + installmentExtraFixed;
};

export const getMercadoLivreFeeBreakdown = ({
  salePrice,
  categoryKey,
  listingType,
  customCommissionRate = null,
  installmentExtraPercent = 0,
  installmentExtraFixed = 0,
  manualShippingCost = 0,
}) => {
  const commissionPercent = getMercadoLivreCommissionPercent({
    categoryKey,
    listingType,
    customRate: customCommissionRate,
  });

  const commissionValue = salePrice * commissionPercent;
  const fixedFee = getMercadoLivreFixedFee(salePrice);
  const installmentExtra = getMercadoLivreInstallmentExtra({
    salePrice,
    installmentExtraPercent,
    installmentExtraFixed,
  });

  return {
    commissionPercent,
    commissionValue,
    fixedFee,
    installmentExtra,
    totalMarketplaceFee: commissionValue + fixedFee + installmentExtra,
  };
};
