import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const legacyLocalKeys: [string, string][] = [
  ['rewear_access_token', 'closet_cycle_access_token'],
  ['rewear_user', 'closet_cycle_user'],
  ['rewear_saved', 'closet_cycle_saved'],
  ['rewear-listing-draft', 'closet-cycle-listing-draft'],
]

for (const [legacyKey, currentKey] of legacyLocalKeys) {
  const oldValue = localStorage.getItem(legacyKey)
  if (oldValue !== null && localStorage.getItem(currentKey) === null) {
    localStorage.setItem(currentKey, oldValue)
  }
  localStorage.removeItem(legacyKey)
}

const legacyNextRoute = sessionStorage.getItem('rewear_after_signin')
if (legacyNextRoute !== null && sessionStorage.getItem('closet_cycle_after_signin') === null) {
  sessionStorage.setItem('closet_cycle_after_signin', legacyNextRoute)
}
sessionStorage.removeItem('rewear_after_signin')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
