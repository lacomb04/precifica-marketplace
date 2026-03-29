export const getInputNumber = (id) => {
  const element = document.getElementById(id);
  if (!element) return 0;
  const value = parseFloat(element.value);
  return Number.isFinite(value) ? value : 0;
};

export const getInputPercent = (id) => getInputNumber(id) / 100;

export const getSelectValue = (id) => {
  const element = document.getElementById(id);
  return element ? element.value : "";
};

export const setText = (id, text) => {
  const element = document.getElementById(id);
  if (element) element.textContent = text;
};

export const setHTML = (id, html) => {
  const element = document.getElementById(id);
  if (element) element.innerHTML = html;
};

export const setInputValue = (id, value) => {
  const element = document.getElementById(id);
  if (!element) return;
  element.value = value;
};

export const toggleClass = (selector, className, shouldAdd) => {
  document.querySelectorAll(selector).forEach((node) => {
    node.classList.toggle(className, shouldAdd);
  });
};

export const getCheckboxValue = (id) => {
  const el = document.getElementById(id);
  return el ? el.checked : false;
};
