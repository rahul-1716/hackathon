import { useState, useEffect } from 'react'
import ChatInterface from './components/ChatInterface'
import './App.css'

function App() {
  const [userName, setUserName] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentRecipeData, setCurrentRecipeData] = useState(null)
  const [recipes, setRecipes] = useState([])

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
    setRecipes([])
    setCurrentRecipeData(null)
  }

  const handleRecipeGenerated = (recipeData) => {
    setCurrentRecipeData(recipeData)
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
                Generate amazing recipes with complete nutrition info!
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
          {/* LEFT PANEL - NUTRITION INFO */}
          <div className="nutrition-panel">
            {currentRecipeData ? (
              <div className="nutrition-panel-content">
                <h3 className="nutrition-panel-title">📊 {currentRecipeData.name}</h3>
                
                <div className="nutrition-display">
                  {currentRecipeData.nutrition.calories && (
                    <div className="nutrition-card calories">
                      <div className="nutrition-emoji">🔥</div>
                      <div className="nutrition-card-label">Calories</div>
                      <div className="nutrition-card-value">{currentRecipeData.nutrition.calories}</div>
                    </div>
                  )}
                  
                  {currentRecipeData.nutrition.protein && (
                    <div className="nutrition-card protein">
                      <div className="nutrition-emoji">💪</div>
                      <div className="nutrition-card-label">Protein</div>
                      <div className="nutrition-card-value">{currentRecipeData.nutrition.protein}g</div>
                    </div>
                  )}
                  
                  {currentRecipeData.nutrition.carbs && (
                    <div className="nutrition-card carbs">
                      <div className="nutrition-emoji">🌾</div>
                      <div className="nutrition-card-label">Carbs</div>
                      <div className="nutrition-card-value">{currentRecipeData.nutrition.carbs}g</div>
                    </div>
                  )}
                  
                  {currentRecipeData.nutrition.fat && (
                    <div className="nutrition-card fat">
                      <div className="nutrition-emoji">🧈</div>
                      <div className="nutrition-card-label">Fat</div>
                      <div className="nutrition-card-value">{currentRecipeData.nutrition.fat}g</div>
                    </div>
                  )}
                  
                  {currentRecipeData.nutrition.fiber && (
                    <div className="nutrition-card fiber">
                      <div className="nutrition-emoji">🌱</div>
                      <div className="nutrition-card-label">Fiber</div>
                      <div className="nutrition-card-value">{currentRecipeData.nutrition.fiber}g</div>
                    </div>
                  )}
                </div>

                <div className="recipe-meta-info">
                  {currentRecipeData.time && (
                    <div className="meta-item">
                      <span>⏱️ Time:</span> {currentRecipeData.time}
                    </div>
                  )}
                  {currentRecipeData.servings && (
                    <div className="meta-item">
                      <span>🍽️ Servings:</span> {currentRecipeData.servings}
                    </div>
                  )}
                  {currentRecipeData.difficulty && (
                    <div className="meta-item">
                      <span>💪 Difficulty:</span> {currentRecipeData.difficulty}
                    </div>
                  )}
                  {currentRecipeData.dietary && (
                    <div className="meta-item">
                      <span>🌱 Diet:</span> {currentRecipeData.dietary}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="nutrition-panel-empty">
                <p style={{ fontSize: '3rem', marginBottom: '10px' }}>📊</p>
                <p>Nutrition info will appear here</p>
                <p style={{ fontSize: '0.85rem', marginTop: '10px', color: '#999' }}>Ask for a recipe →</p>
              </div>
            )}
          </div>

          {/* RIGHT PANEL - CHAT */}
          <div className="chat-wrapper">
            <ChatInterface 
              userName={userName} 
              recipes={recipes}
              setRecipes={setRecipes}
              onRecipeGenerated={handleRecipeGenerated}
            />
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
