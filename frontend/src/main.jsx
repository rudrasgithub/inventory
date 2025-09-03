import { createRoot } from 'react-dom/client'
import './index.css'
import './css/global.css';
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import ContextProvider from './Context/ContextProvider';

createRoot(document.getElementById('root')).render(
  <ContextProvider>
    <BrowserRouter>
        <App />
    </BrowserRouter>
  </ContextProvider>
)
