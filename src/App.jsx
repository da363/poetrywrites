import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import { Home, About, Competition, Prizes, Terms, Contact } from './pages/PublicPages.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Admin from './pages/Admin.jsx'
import Voting from './pages/VotingPage.jsx'

// Protected route — must be logged in
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/" replace />
  return children
}

// Admin only route
function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user || !isAdmin) return <Navigate to="/" replace />
  return children
}

function LoadingScreen() {
  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: 'float 2s ease-in-out infinite' }}>✍️</div>
        <p style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.2em', color: 'rgba(201,168,76,0.5)' }}>
          LOADING...
        </p>
      </div>
    </div>
  )
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"            element={<Layout><Home /></Layout>} />
      <Route path="/about"       element={<Layout><About /></Layout>} />
      <Route path="/competition" element={<Layout><Competition /></Layout>} />
      <Route path="/prizes"      element={<Layout><Prizes /></Layout>} />
      <Route path="/terms"       element={<Layout><Terms /></Layout>} />
      <Route path="/contact"     element={<Layout><Contact /></Layout>} />

      <Route path="/vote" element={<Layout><Voting /></Layout>} />

      {/* Protected */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Layout><Dashboard /></Layout>
        </PrivateRoute>
      } />

      {/* Admin only */}
      <Route path="/admin" element={
        <AdminRoute>
          <Layout><Admin /></Layout>
        </AdminRoute>
      } />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
