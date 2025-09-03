import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Login from './components/Login';
import Product from './components/Product';
import Statistics from './components/Statistics';
import Invoice from './components/Invoice';
import SignUp from './components/SignUp';
import ForgotPassword from './components/ForgotPassword';
import OTPVerification from './components/OTPVerification';
import ResetPassword from './components/ResetPassword';
import Setting from './components/Setting';

function App() {

  return (
    <>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/otp-verification' element={<OTPVerification />} />
        <Route path='/reset-password' element={<ResetPassword />} />

        <Route path='/' element={<Home />} />
        <Route path='/product' element={<Product />} />
        <Route path='/invoice' element={<Invoice />} />
        <Route path='/statistics' element={<Statistics />} />
        <Route path='/setting' element={<Setting />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            fontSize: '14px',
            padding: '12px 16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #10b981',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #ef4444',
            },
          },
        }}
      />
    </>
  )
}

export default App
