import { MODAL_DATA } from '../config/modal-data.js';
import { setHTML } from '../core/dom.js';

const OVERLAY_ID = 'ov';
const MODAL_BODY_ID = 'mb';

const buildTable = (table) => {
  if (!table || table.length === 0) return '';
  const [headings, ...rows] = table;
  const headRow = headings.map((cell) => `<th>${cell}</th>`).join('');
  const bodyRows = rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('');
  return `<table class="rt"><thead><tr>${headRow}</tr></thead><tbody>${bodyRows}</tbody></table>`;
};

const buildItems = (items) => items
  .map((item) => `
    <div class="ii">
      <div class="iin">${item.label}<span class="itag" style="background:${item.tagColor}22;color:${item.tagColor}">${item.tag}</span></div>
      <div class="iid">${item.description}</div>
    </div>
  `)
  .join('');

export const openInfoModal = (key) => {
  const data = MODAL_DATA[key];
  if (!data) return;

  const tableHtml = buildTable(data.table);
  const itemsHtml = buildItems(data.items);

  setHTML(MODAL_BODY_ID, `
    <h2>${data.title}</h2>
    <p class="msub">${data.subtitle}</p>
    <div class="mst">// campos da calculadora</div>
    ${itemsHtml}
    <div class="mst">// tabela de taxas</div>
    ${tableHtml}
  `);

  document.getElementById(OVERLAY_ID)?.classList.add('on');
  document.body.style.overflow = 'hidden';
};

export const closeInfoModal = (event) => {
  if (event && event.target && event.target.id !== OVERLAY_ID && event.target.className !== 'mx') {
    return;
  }
  document.getElementById(OVERLAY_ID)?.classList.remove('on');
  document.body.style.overflow = '';
};
