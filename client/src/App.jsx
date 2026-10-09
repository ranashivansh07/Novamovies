import React, { useState, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import MainContent from './components/Home'
import Sidebar from './components/Sidebar'
import Tvseries from './components/Tvseries'
import Tvpop from './components/Tvpop'
import Footer from './components/Footer'
import MoviePlayer from './components/MoviePlayer'
import TvPlayer from './components/TvPlayer'
import NewPopular from './components/NewPopular'

const Movie = () => {
  // Session & Auth State
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [sessionId, setSessionId] = useState(localStorage.getItem('sessionId'))
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'))

  // State for Login Form & Takeover Modal
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [deviceName] = useState(
    navigator.userAgentData?.platform || navigator.platform || 'Browser Device'
  )
  const [showTakeoverModal, setShowTakeoverModal] = useState(false)
  const [activeDevice, setActiveDevice] = useState('')

  // 1. Session Validation Polling: Check if session has been taken over by another device
  useEffect(() => {
    if (!token || !sessionId) return

    const interval = setInterval(async () => {
      try {
       const res = await fetch(`http://localhost:5000/api/auth/validate-session?userId=${user?.id}`,{
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-session-id': sessionId
          }
        })

        const data = await res.json()

        // Redirect to login screen if session became invalid
        if (!res.ok || !data.active) {
          alert('Your session was taken over by another device.')
          handleLogout()
        }
      } catch (err) {
        console.error('Session validation error:', err)
      }
    }, 4000) // Poll every 4 seconds

    return () => clearInterval(interval)
  }, [token, sessionId, user])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('sessionId')
    localStorage.removeItem('user')
    setToken(null)
    setSessionId(null)
    setUser(null)
  }

  // 2. Login & Session Takeover Handler
  const handleLogin = async (forceTakeover = false) => {
    if (!email || !password) {
      alert('Please enter both email and password.')
      return
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/login',{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, deviceName, forceTakeover })
      })

      const data = await res.json()

      if (res.status === 409) {
        // Active session exists -> Show takeover confirmation modal with current device name
        setActiveDevice(data.currentDeviceName || 'Another Device')
        setShowTakeoverModal(true)
      } else if (res.ok) {
        setShowTakeoverModal(false)
        localStorage.setItem('token', data.token)
        localStorage.setItem('sessionId', data.sessionId)
        localStorage.setItem('user', JSON.stringify(data.user))
        setToken(data.token)
        setSessionId(data.sessionId)
        setUser(data.user)
      } else {
        alert(data.message || 'Login failed')
      }
    } catch (err) {
      console.error('Login error:', err)
    }
  }

  // Show Login Screen if user is not authenticated
  if (!token) {
    return (
      <div style={styles.container}>
        <div style={styles.loginCard}>
          <h2>Account Login</h2>
          <div style={styles.inputGroup}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>
          <button style={styles.primaryBtn} onClick={() => handleLogin(false)}>
            Sign In
          </button>

          {/* Session Takeover Modal */}
          {showTakeoverModal && (
            <div style={styles.modalOverlay}>
              <div style={styles.modalContent}>
                <h3>Active Session Detected</h3>
                <p>
                  Your account is currently active on: <strong>{activeDevice}</strong>
                </p>
                <p>Do you want to log out that device and take over the session?</p>

                <button style={styles.primaryBtn} onClick={() => handleLogin(true)}>
                  Yes, Take Over Session
                </button>
                <button style={styles.secondaryBtn} onClick={() => setShowTakeoverModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Authenticated View: Full Application
  return (
    <>
      <Navbar onLogout={handleLogout} />
      <Sidebar />

      <Routes>
        <Route path='/' element={<MainContent />} />
        <Route path='/play/movie/:movieId' element={<MoviePlayer />} />
        <Route path='/play/tv/:tvId/:season/:episode' element={<TvPlayer />} />
        <Route path='/tvseries' element={<Tvseries />} />
        <Route path='/tvdetail' element={<Tvpop />} />
        <Route path='/new-popular' element={<NewPopular />} />
      </Routes>

      <Footer />
    </>
  )
}

export default Movie

// Basic styles for Login and Session Takeover Modal
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#141414',
    color: '#fff',
    fontFamily: 'sans-serif'
  },
  loginCard: {
    backgroundColor: '#1f1f1f',
    padding: '2.5rem',
    borderRadius: '8px',
    width: '320px',
    textAlign: 'center',
    boxShadow: '0 8px 16px rgba(0,0,0,0.5)'
  },
  inputGroup: {
    marginBottom: '1rem'
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #333',
    backgroundColor: '#333',
    color: '#fff',
    boxSizing: 'border-box'
  },
  primaryBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#e50914',
    color: '#fff',
  }
}