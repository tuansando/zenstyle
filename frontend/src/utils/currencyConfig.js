export const currencyConfig = {
  locale: 'vi-VN',
  currency: 'VND',
  fractionDigits: 0
}

export function setCurrencyConfig({ locale, currency, fractionDigits } = {}) {
  if (locale) currencyConfig.locale = locale
  if (currency) currencyConfig.currency = currency
  if (typeof fractionDigits === 'number') currencyConfig.fractionDigits = fractionDigits
}

export function getCurrencyConfig() {
  return currencyConfig
}
