import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Product from './pages/Product'
import Navbar from './components/Navbar'
import Contact from './pages/Contact'
import Login from './pages/Login'
import MyProfile from './pages/MyProfile'
import Footer from './components/Footer'
import SearchEngine from './components/SearchEngine'
import Banner from './components/Banner'
import Privacy from './pages/Privacy'
import Jobs from './pages/Jobs'
import Cart from './pages/Cart'
import DetailProduct from './pages/DetailProduct'
import CheckoutAddToCart from './pages/CheckoutAddToCart'
import { ToastContainer } from 'react-toastify'
import MyComments from './pages/MyComments'
import ChatbotPopup from './components/ChatbotPopup'
import Verify from './pages/Verify'
import ChangePassword from './pages/ChangePassword'
import ShoppingCart from './pages/ShoppingCart'
import OrderDetail from './pages/OrderDetail'
import { AnimatePresence, motion } from 'framer-motion'

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
)

const App = () => {
  const location = useLocation();

  return (
    <div className='min-h-screen flex flex-col bg-background'>
      <ToastContainer position="bottom-right" />
      <Navbar />
      
      <main className='flex-grow pt-24'>
        <AnimatePresence mode='wait'>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
            <Route path="/products" element={<PageWrapper><Product /></PageWrapper>} />
            <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
            <Route path="/products/:category" element={<PageWrapper><Product /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/mycart" element={<PageWrapper><Cart /></PageWrapper>} />
            <Route path="/shopping-cart" element={<PageWrapper><ShoppingCart /></PageWrapper>} />
            <Route path="/order-detail/:orderId" element={<PageWrapper><OrderDetail /></PageWrapper>} />
            <Route path="/my-profile" element={<PageWrapper><MyProfile /></PageWrapper>} />
            <Route path="/privacy" element={<PageWrapper><Privacy /></PageWrapper>} />
            <Route path="/jobs" element={<PageWrapper><Jobs /></PageWrapper>} />
            <Route path="/detail/:prID" element={<PageWrapper><DetailProduct /></PageWrapper>} />
            <Route path="/checkout" element={<PageWrapper><CheckoutAddToCart /></PageWrapper>} />
            <Route path="/comments" element={<PageWrapper><MyComments /></PageWrapper>} />
            <Route path="/verify" element={<PageWrapper><Verify /></PageWrapper>} />
            <Route path="/changePassword" element={<PageWrapper><ChangePassword /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </main>

      <ChatbotPopup />
      <Footer />
    </div>
  )
}

export default App

