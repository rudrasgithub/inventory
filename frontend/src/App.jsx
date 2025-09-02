import './App.css'
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import DragDropPage from './pages/DragDropPage';
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
        <Route path='/dragdrop' element={<DragDropPage />} />
        <Route path='/product' element={<Product />} />
        <Route path='/invoice' element={<Invoice />} />
        <Route path='/statistics' element={<Statistics />} />
        <Route path='/setting' element={<Setting />} />
      </Routes>
    </>
  )
}

export default App
