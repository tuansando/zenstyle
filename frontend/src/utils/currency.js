import { getCurrencyConfig } from './currencyConfig'

export function formatCurrency(value, opts = {}) {
  const cfg = getCurrencyConfig()
  const { locale = cfg.locale, currency = cfg.currency, maximumFractionDigits = (opts.maximumFractionDigits ?? cfg.fractionDigits) } = opts
  const number = Number(value) || 0
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits
  }).format(number)
}

export function formatNumber(value, { locale = 'vi-VN' } = {}) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat(locale).format(number);
}
