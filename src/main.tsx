import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ChaosProvider } from './context/ChaosContext'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { TesterControlPanel } from './components/TesterControlPanel'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChaosProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <App />
            <TesterControlPanel />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ChaosProvider>
  </StrictMode>,
)
