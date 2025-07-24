import { createRoot } from 'react-dom/client'
import App from './lib/App.tsx'
import './index.css'
import './App.css'
import { AuthProvider } from './hooks/useAuth'

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
