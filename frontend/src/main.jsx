import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Auto-unregister old service workers in development to avoid "Response body is already used" errors
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then(registrations => {
      registrations.forEach(reg => {
        console.info('[SW] Unregistering service worker:', reg);
        reg.unregister();
      });
    })
    .catch(err => console.warn('[SW] Failed to unregister service workers', err));
}

// Initialize currency settings from public capacity dashboard (picked for being public)
import { setCurrencyConfig } from './utils/currencyConfig'
import { settingsService } from './services/dataService'

// Load currency settings from public capacity dashboard (non-blocking)
settingsService.getCapacityDashboard()
  .then(data => {
    const cs = data.currency_settings || {}
    setCurrencyConfig({
      locale: cs.locale || 'vi-VN',
      currency: cs.currency || 'VND',
      fractionDigits: (typeof cs.fraction_digits === 'number') ? cs.fraction_digits : (parseInt(cs.fraction_digits) || 0)
    })
    console.info('[Currency] initialized from capacity dashboard', cs)
  })
  .catch(err => console.warn('[Currency] failed to initialize from capacity dashboard', err))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
