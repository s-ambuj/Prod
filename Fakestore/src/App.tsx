import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'

function App() {
  const [isAuthed, setIsAuthed] = useState(
    () => localStorage.getItem('pb-auth') === '1',
  )
  const [userEmail, setUserEmail] = useState(
    () => localStorage.getItem('pb-user') ?? '',
  )

  const handleAuth = (email: string) => {
    localStorage.setItem('pb-auth', '1')
    localStorage.setItem('pb-user', email)
    setIsAuthed(true)
    setUserEmail(email)
  }

  const handleLogout = () => {
    localStorage.removeItem('pb-auth')
    localStorage.removeItem('pb-user')
    setIsAuthed(false)
    setUserEmail('')
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar
          isAuthed={isAuthed}
          userEmail={userEmail}
          onLogout={handleLogout}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              isAuthed ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLogin={handleAuth} />
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthed ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Register onRegister={handleAuth} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              isAuthed ? <Dashboard /> : <Navigate to="/login" replace />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
