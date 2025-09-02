import { createRoot } from 'react-dom/client'
import './index.css'
import './css/global.css';
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import ContextProvider from './Context/ContextProvider';

createRoot(document.getElementById('root')).render(
  <ContextProvider>
    <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              maxWidth: '500px'
            },
            success: {
              duration: 3000,
              style: {
                background: '#10B981',
                color: '#fff'
              }
            },
            error: {
              duration: 4000,
              style: {
                background: '#EF4444', 
                color: '#fff'
              }
            }
          }}
        />
        <App />
    </BrowserRouter>
  </ContextProvider>
)
