import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';

const Home = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./components/Profile'));
const Chat = lazy(() => import('./components/Chat'));
const Shop = lazy(() => import('./components/Shop'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const Login = lazy(() => import('./components/Login'));
const Signup = lazy(() => import('./components/Signup'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));

function App() {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="container-12 section-block"><div className="skeleton-page" /></div>}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requiredPermission="access_admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </Suspense>
      <BottomNav />
    </>
  );
}

export default App;
