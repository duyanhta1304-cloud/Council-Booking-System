import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './mainLayout.jsx'
import { BrowserRouter } from "react-router"
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/authContext.jsx'
import { Toaster } from 'react-hot-toast'
import DevRoleSwitcher from './context/DEVONLY_DELETETHIS.jsx'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={CLIENT_ID}>
        <AuthProvider>
          <Toaster />
          {process.env.NODE_ENV !== 'production' && <DevRoleSwitcher />}
          <App />
        </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </StrictMode>
)
