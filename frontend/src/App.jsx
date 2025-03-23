import React, { Suspense, useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import CrashGame from './components/AviatorGame'
import WalletPage from './components/WalletPage'
import PaymentQRPage from './components/payment-qr-page'
import Layout from './components/Layout'
import PaymentPage from './components/PaymentPage'
import LoginPage from './components/LoginPage'
import AdminPaymentManagement from './Admin/AdminPaymentManagement'
import BetHistory from './components/bet-history'
import WalletTransactions from './components/wallet-transactions'
import ContactPage from './components/contact'
import PrivacyPolicy from './components/Policys/privacy-policy'
import TermsOfService from './components/Policys/terms-of-service'
import RefundPolicy from './components/Policys/refund-policy'
import Disclaimer from './components/Policys/disclaimer'
import AdminDashboard from './Admin/Admin_Home'
import Admin_Login from './Admin/Admin_Login'
import Admin_Layout from './Admin/Admin_Layout'
import WithdrawPage from './components/withdraw-page'
import WithdrawalHistory from './components/withdrawal-history'
import AdminWithdrawalManagement from './Admin/AdminWithdrawalManagement'
import AdminPanel from './Admin/admin-panel'
import AdminUpiSettings from './Admin/AdminUpiSettings'

// Simple loading component
const Loading = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
)

function App() {
  // Move all hooks inside the component
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("user"))
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => localStorage.getItem("admin") === "true")

  const handleAdminLogin = (status) => {
    localStorage.setItem("admin", status ? "true" : "false")
    setIsAdminAuthenticated(status)
  }

  const handleUserLogin = (status) => {
    if (status) {
      localStorage.setItem("user", "true")
    } else {
      localStorage.removeItem("user")
    }
    setIsAuthenticated(status)
  }

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("user"))
    setIsAdminAuthenticated(localStorage.getItem("admin") === "true")
    // Preload secondary important components after initial render
  }, [])

  return (
    <Routes>
      {/* User Routes */}
      {/* <Route path="/login" element={<LoginPage setIsAuthenticated={handleUserLogin} />} /> */}

      <Route path="/" element={<Layout />}>
        <Route index element={<CrashGame />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/payment-qr" element={<PaymentQRPage />} />
        <Route path="/PaymentPage" element={<PaymentPage />} />
        <Route path="/Login" element={<LoginPage />} />
        <Route path="/BetHistory" element={<BetHistory />} />
        <Route path="/ContactPage" element={<ContactPage />} />
        <Route path="/wallet-history" element={<WalletTransactions />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        {/* <Route path="/AdminPaymentManagement" element={<AdminPaymentManagement />} /> */}

        <Route path="/withdraw" element={<WithdrawPage />} />
        <Route path="/withdrawal-history" element={<WithdrawalHistory />} />
      </Route>

      <Route
        path="/admin/login"
        element={
          <Suspense fallback={<Loading />}>
            <Admin_Login onLogin={handleAdminLogin} />
          </Suspense>
        }
      />

      {isAdminAuthenticated ? (
        <Route
          path="/admin"
          element={
            <Suspense fallback={<Loading />}>
              <Admin_Layout />
            </Suspense>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<Loading />}>
                <AdminDashboard />
              </Suspense>
            }
          />
          <Route
            path="AdminPaymentPage"
            element={
              <Suspense fallback={<Loading />}>
                <AdminPaymentManagement />
              </Suspense>
            }
          />

          <Route
            path="withdrawals"
            element={
              <Suspense fallback={<Loading />}>
                <AdminWithdrawalManagement />
              </Suspense>
            }
          />
          <Route
            path="AdminPanel"
            element={
              <Suspense fallback={<Loading />}>
                <AdminPanel />
              </Suspense>
            }
          />
           <Route
              path="AdminUpiSettings"
              element={
                <Suspense fallback={<Loading />}>
                  <AdminUpiSettings />
                </Suspense>
              }
            />
        </Route>
      ) : (
        <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />
      )}
    </Routes>
  )
}

export default App