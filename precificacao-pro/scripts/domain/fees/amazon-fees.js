import { AMAZON_CATEGORIES } from "../../config/amazon-categories.js";

export const getAmazonItemFee = (plan) => (plan === "ind" ? 2 : 0);

export const getAmazonCategoryRule = (category) =>
  AMAZON_CATEGORIES[category] ?? AMAZON_CATEGORIES.demais;

export const getAmazonCommissionRate = (category) =>
  getAmazonCategoryRule(category).rate;

export const getAmazonCommission = ({ totalSaleAmount, category }) => {
  const rule = getAmazonCategoryRule(category);

  if (totalSaleAmount <= 0) return 0;

  const percentageCommission = totalSaleAmount * rule.rate;
  return Math.max(percentageCommission, rule.minCommission);
};
