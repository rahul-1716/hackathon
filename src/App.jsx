import { useState, useEffect } from 'react'
import ChatInterface from './components/ChatInterface'
import ImageUpload from './components/ImageUpload'
import gsap from 'gsap'
import './App.css'

function App() {
  const [userName, setUserName] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [detectedIngredients, setDetectedIngredients] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('userName')
    if (saved) {
      setUserName(saved)
      setIsLoggedIn(true)
    }
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      gsap.from('.main-container', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out'
      })
    }
  }, [isLoggedIn])

  const handleLogin = (e) => {
    e.preventDefault()
    if (userName.trim()) {
      localStorage.setItem('userName', userName)
      setIsLoggedIn(true)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userName')
    setUserName('')
    setIsLoggedIn(false)
    setDetectedIngredients([])
  }

  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h1 className="title">🍳 AI Recipe Generator</h1>
          <p className="subtitle">Powered by AI & Image Recognition</p>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="input-field"
              required
            />
            <button type="submit" className="btn-primary">
              Get Started
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="main-container">
      <div className="header">
        <div>
          <h1 className="app-title">🍳 AI Recipe Generator</h1>
          <p className="welcome-text">Welcome, {userName}!</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>

      <div className="content-grid">
        <div className="image-section">
          <ImageUpload 
            detectedIngredients={detectedIngredients}
            setDetectedIngredients={setDetectedIngredients}
          />
        </div>
        
        <div className="chat-section">
          <ChatInterface 
            detectedIngredients={detectedIngredients}
            userName={userName}
          />
        </div>
      </div>
    </div>
  )
}

export default App
