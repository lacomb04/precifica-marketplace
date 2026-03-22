export const formatCurrency = (value) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `R$ ${safeValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDecimal = (value) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  return safeValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
