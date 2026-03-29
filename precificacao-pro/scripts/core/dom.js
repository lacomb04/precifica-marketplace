export const getInputNumber = (id) => {
  const element = document.getElementById(id);
  if (!element) return 0;
  const raw = (element.value || "").trim().replace(/,/g, ".");
  const value = parseFloat(raw);
  return Number.isFinite(value) ? value : 0;
};

export const normalizeNumberInputs = () => {
  document.querySelectorAll('input[type="number"]').forEach((el) => {
    if (!el.getAttribute("inputmode")) el.setAttribute("inputmode", "decimal");
    if (!el.getAttribute("pattern"))
      el.setAttribute("pattern", "[0-9]*[.,]?[0-9]*");

    const normalize = () => {
      if (el.value && el.value.includes(",")) {
        el.value = el.value.replace(/,/g, ".");
      }
    };

    el.addEventListener(
      "beforeinput",
      (e) => {
        if (e.data === ",") {
          e.preventDefault();
          const start = el.selectionStart ?? el.value.length;
          const end = el.selectionEnd ?? el.value.length;
          const next = `${el.value.slice(0, start)}.${el.value.slice(end)}`;
          el.value = next;
          const pos = start + 1;
          requestAnimationFrame(() => el.setSelectionRange(pos, pos));
        }
      },
      { capture: true }
    );

    ["input", "change", "blur", "keyup"].forEach((evt) => {
      el.addEventListener(evt, normalize);
    });
  });
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
