import { useState, useEffect } from 'react'
import ChatInterface from './components/ChatInterface'
import './App.css'

function App() {
  const [userName, setUserName] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentImage, setCurrentImage] = useState(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('userName')
    if (saved) {
      setUserName(saved)
      setIsLoggedIn(true)
    }
  }, [])

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
    setCurrentImage(null)
  }

  const handleRecipeGenerated = (recipeName) => {
    setImageLoading(true)
    setImageError(null)
    generateRecipeImage(recipeName)
  }

  const generateRecipeImage = async (recipeName) => {
    try {
      console.log('🎨 Searching for recipe image:', recipeName)
      
      const query = `${recipeName} food photography delicious`
      
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&count=1&client_id=tR5S07dh0sA8phwJ0PHDvAYvT0F_ibjEUjzlR1Jyw1c`
      )

      console.log('📡 Unsplash response status:', response.status)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      
      console.log('📦 Data received')
      
      if (data.results && data.results.length > 0) {
        const imageUrl = data.results[0].urls.regular
        console.log('✅ Image found!')
        setCurrentImage(imageUrl)
        setImageError(null)
        setImageLoading(false)
      } else {
        // Fallback to generic food image
        const fallbackUrl = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500&h=500&fit=crop'
        console.log('⚠️ Using fallback image')
        setCurrentImage(fallbackUrl)
        setImageLoading(false)
      }
    } catch (err) {
      console.error('❌ Error:', err)
      // Use fallback image on error
      const fallbackUrl = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500&h=500&fit=crop'
      setCurrentImage(fallbackUrl)
      setImageError(null)
      setImageLoading(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="app">
        <GalaxyBackground />
        <div className="app-login">
          <div className="login-container">
            <form onSubmit={handleLogin} className="login-card">
              <div className="login-emoji">🍳</div>
              <h1 className="login-title">AI Recipe Generator</h1>
              <p className="login-subtitle">Chef Powered by Gemini</p>
              <p className="login-description">
                Generate amazing recipes with AI-created food images instantly!
              </p>
              <div className="login-form">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name..."
                  className="login-input"
                  required
                />
                <button type="submit" className="login-button">
                  Get Started →
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <GalaxyBackground />
      <div className="app-main">
        <div className="app-header">
          <div className="app-title">🍳 AI Recipe Generator</div>
          <div className="app-user-section">
            <span className="user-name">Welcome, {userName}!</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>

        <div className="app-content">
          {/* LEFT PANEL - IMAGE */}
          <div className="image-panel">
            <div className="image-panel-content">
              {imageLoading ? (
                <div className="image-loading-state">
                  <svg viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" stroke="#667eea" strokeWidth="2" strokeDasharray="31.4 125.6" />
                  </svg>
                  <p>🎨 Loading food image...</p>
                </div>
              ) : currentImage ? (
                <img 
                  src={currentImage} 
                  alt="Recipe" 
                  className="recipe-image-display"
                  onError={() => {
                    console.error('Image failed to load')
                  }}
                />
              ) : (
                <div className="image-loading-state">
                  <p style={{ fontSize: '3rem', marginBottom: '10px' }}>🍽️</p>
                  <p>Your recipe image will appear here</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '10px', color: '#999' }}>Ask for a recipe to get started →</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL - CHAT */}
          <div className="chat-wrapper">
            <ChatInterface userName={userName} onRecipeGenerated={handleRecipeGenerated} />
          </div>
        </div>
      </div>
    </div>
  )
}

function GalaxyBackground() {
  useEffect(() => {
    const starsContainer = document.querySelector('.stars')
    if (starsContainer) {
      for (let i = 0; i < 100; i++) {
        const star = document.createElement('div')
        star.className = 'star'
        star.style.left = Math.random() * 100 + '%'
        star.style.top = Math.random() * 100 + '%'
        star.style.animationDelay = Math.random() * 3 + 's'
        starsContainer.appendChild(star)
      }
    }
  }, [])

  return (
    <div className="galaxy-background">
      <div className="stars"></div>
      <div className="nebula nebula-purple" style={{ top: '10%', left: '10%' }}></div>
      <div className="nebula nebula-blue" style={{ bottom: '20%', right: '15%' }}></div>
      <div className="nebula nebula-purple" style={{ bottom: '10%', left: '20%' }}></div>
    </div>
  )
}

export default App
