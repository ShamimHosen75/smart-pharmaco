import { useSettingsStore, CURRENCY_SYMBOLS } from "@/stores/settings-store";

/** Current currency symbol (non-reactive read — safe inside helpers & print templates). */
export const currencySymbol = () =>
  CURRENCY_SYMBOLS[useSettingsStore.getState().global.currency];

/** Current VAT rate as a fraction (e.g. 0.15 for 15%). */
export const vatRate = () => {
  const v = parseFloat(useSettingsStore.getState().global.vat);
  return Number.isFinite(v) ? v / 100 : 0;
};

export const vatPercent = () => useSettingsStore.getState().global.vat || "0";

/** Format an amount with the active currency symbol. */
export const money = (n: number, decimals = 2) =>
  `${currencySymbol()}${(n ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;

/** Compact format for charts / KPI tiles (e.g. ৳12.5k). */
export const moneyCompact = (n: number) =>
  n >= 1000 ? `${currencySymbol()}${(n / 1000).toFixed(1)}k` : `${currencySymbol()}${n.toFixed(0)}`;

/** Reactive formatter — re-renders the component when the currency changes. */
export const useMoney = () => {
  const currency = useSettingsStore((s) => s.global.currency);
  const sym = CURRENCY_SYMBOLS[currency];
  return (n: number, decimals = 2) =>
    `${sym}${(n ?? 0).toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
};
