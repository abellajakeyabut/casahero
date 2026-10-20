import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AppProvider from './context/AppProvider.jsx'

async function enableMocking() {
  // mocks run in dev only; set VITE_ENABLE_MOCKS=false in .env to hit the real API
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCKS === 'false') return
  const { worker } = await import('./mocks/browser')
  // Wait for the worker to be ready so early requests are intercepted
  return worker.start({ onUnhandledRequest: 'bypass' })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <AppProvider>
        <App />
      </AppProvider>
    </StrictMode>,
  )
})
