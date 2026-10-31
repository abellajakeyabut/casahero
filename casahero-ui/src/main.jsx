import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AppProvider from './context/AppProvider.jsx'

async function enableMocking() {
  // mocks run in dev only; set VITE_ENABLE_MOCKS=false in .env to hit the real API
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCKS === 'false') return
  const { worker } = await import('./mocks/browser')
  const { default: api } = await import('./api/api')
  const startOptions = { onUnhandledRequest: 'bypass', quiet: true }

  // Chrome stops idle service workers (e.g. while the tab is in the background). The restarted
  // worker has forgotten this tab, so requests reach Vite and come back as index.html or a 404.
  // Re-register with the worker and retry the request once.
  let reconnecting = null
  const reconnect = () => {
    reconnecting ??= Promise.resolve()
      .then(() => worker.stop())
      .then(() => worker.start(startOptions))
      .finally(() => { reconnecting = null })
    return reconnecting
  }
  api.interceptors.response.use(undefined, async (error) => {
    const config = error.config
    const missedMock = error.notJson || error.response?.status === 404
    if (!config || !missedMock || config._mockRetried) throw error
    console.warn('[MSW] request was not mocked, reconnecting to the worker:', config.url)
    await reconnect()
    return api.request({ ...config, _mockRetried: true })
  })

  // Wait for the worker to be ready so early requests are intercepted
  return worker.start({ ...startOptions, quiet: false })
}

// render even if mocking fails to start, otherwise the page stays blank until a refresh
enableMocking()
  .catch((err) => console.error('[MSW] failed to start, API calls will hit the real server', err))
  .then(() => {
    createRoot(document.getElementById('root')).render(
    <StrictMode>
      <AppProvider>
        <App />
      </AppProvider>
    </StrictMode>,
  )
})
