import { toggleClass } from '../core/dom.js';
import { MARKETPLACE_PAGE_IDS } from '../config/marketplaces.js';

const NAV_BACK_ID = 'navBack';

export const showHome = () => {
  toggleClass('.page', 'active', false);
  document.getElementById(MARKETPLACE_PAGE_IDS.home)?.classList.add('active');
  document.getElementById(NAV_BACK_ID)?.classList.remove('on');
  window.scrollTo(0, 0);
};

export const showMarketplace = (key) => {
  const pageId = MARKETPLACE_PAGE_IDS[key];
  if (!pageId) return;
  toggleClass('.page', 'active', false);
  document.getElementById(pageId)?.classList.add('active');
  document.getElementById(NAV_BACK_ID)?.classList.add('on');
  window.scrollTo(0, 0);
};
