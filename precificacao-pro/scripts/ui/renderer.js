import { formatCurrency, formatDecimal } from '../core/formatters.js';
import { setHTML, setText } from '../core/dom.js';

const SEGMENT_COLORS = ['#2244ff', '#cc2244', '#ccaa00', '#cc4400', '#0099cc', '#00bb77'];
const SEGMENT_CLASSES = ['s0', 's1', 's2', 's3', 's4', 's5'];
const SEGMENT_TEXT_COLORS = ['#fff', '#fff', '#000', '#fff', '#000', '#000'];

const getProfitRow = (breakdown) => breakdown.find((row) => row.label === 'Lucro Líquido');

export const renderPricingCard = (prefix, result) => {
  const { salePrice, breakdown } = result;
  const salePriceElement = document.getElementById(`${prefix}pv`);

  if (salePriceElement) {
    salePriceElement.textContent = formatCurrency(salePrice);
    salePriceElement.classList.remove('popped');
    void salePriceElement.offsetWidth;
    salePriceElement.classList.add('popped');
  }

  const profitRow = getProfitRow(breakdown);
  const pillElement = document.getElementById(`${prefix}pill`);
  const pillContent = !profitRow || salePrice <= 0
    ? '<span class="ppill p-bad">⛔ Inviável — revise os percentuais</span>'
    : `<span class="ppill p-ok">▲ Lucro líquido: ${formatCurrency(profitRow.value)}</span>`;
  setHTML(`${prefix}pill`, pillContent);

  const breakdownHtml = breakdown
    .map((row, index) => `
      <div class="bi">
        <div class="bil"><span class="bid" style="background:${SEGMENT_COLORS[index]}"></span>${row.label}</div>
        <div class="biv">${formatDecimal(row.value)}</div>
      </div>
    `)
    .join('');
  setHTML(`${prefix}bd`, breakdownHtml);

  const barElement = document.getElementById(`${prefix}bar`);
  if (barElement) {
    if (salePrice > 0) {
      const bar = breakdown
        .map((row, index) => {
          const width = (row.value / salePrice) * 100;
          if (width < 0.5) return '';
          const widthText = width.toFixed(1);
          return `<div class="seg ${SEGMENT_CLASSES[index]}" style="width:${widthText}%;color:${SEGMENT_TEXT_COLORS[index]}"><span>${widthText}%</span></div>`;
        })
        .join('');
      barElement.innerHTML = bar;
    } else {
      barElement.innerHTML = '<div style="width:100%;height:100%;background:var(--card2)"></div>';
    }
  }

  const legendHtml = breakdown
    .map((row, index) => `<div class="li"><span class="ld" style="background:${SEGMENT_COLORS[index]}"></span>${row.label}</div>`)
    .join('');
  setHTML(`${prefix}leg`, legendHtml);
};

export const syncRangeLabel = (input) => {
  const targetId = input.dataset.labelTarget;
  if (!targetId) return;
  setText(targetId, `${input.value}%`);
};
