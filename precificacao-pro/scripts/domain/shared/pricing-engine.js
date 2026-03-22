export const iteratePriceUntilStable = (initialPercent, initialFixed, variableShare, iterations = 20) => {
  let currentPercent = initialPercent;
  let currentFixed = initialFixed;
  let salePrice = 0;

  for (let index = 0; index < iterations; index += 1) {
    const baseCosts = currentFixed;
    salePrice = baseCosts / (1 - variableShare - currentPercent);
  }

  return { salePrice, percent: currentPercent, fixed: currentFixed };
};
