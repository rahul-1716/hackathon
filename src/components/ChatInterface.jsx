import { useState, useEffect, useRef } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import gsap from 'gsap'
import RecipeCard from './RecipeCard'
import '../styles/ChatInterface.css'

function ChatInterface({ userName, recipes, setRecipes, onRecipeGenerated }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi ${userName}! 👋 Welcome! Tell me what ingredients you have or what recipe you'd like, and I'll generate an amazing recipe with complete nutrition info!` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const recipeRef = useRef(null)
  const [chat, setChat] = useState(null)

  useEffect(() => {
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
      
      const chatInstance = model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 2500,
          temperature: 0.7,
        },
      })
      
      setChat(chatInstance)
      console.log('✅ Gemini initialized!')
    } catch (err) {
      console.error('❌ Gemini error:', err)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    
    const lastMsg = document.querySelector('.message:last-child')
    if (lastMsg) {
      gsap.from(lastMsg, {
        opacity: 0,
        x: -20,
        duration: 0.4,
        ease: 'power2.out'
      })
    }
  }, [messages])

  useEffect(() => {
    if (recipes.length > 0) {
      setTimeout(() => {
        recipeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 100)
    }
  }, [recipes])

  const parseRecipeData = (text) => {
    const data = {
      name: 'Delicious Recipe',
      ingredients: [],
      instructions: [],
      nutrition: {
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: ''
      },
      time: '',
      servings: '',
      dietary: '',
      difficulty: ''
    }

    const lines = text.split('\n')
    
    // Extract name
    const nameMatch = text.match(/\*\*Recipe Name\*\*\s*\n(.+)/i)
    if (nameMatch) data.name = nameMatch[1].trim()

    // Extract time
    const timeMatch = text.match(/Cooking Time.*?:\s*(.+?)(?:\n|$)/i)
    if (timeMatch) data.time = timeMatch[1].trim()

    // Extract servings
    const servingsMatch = text.match(/Servings.*?:\s*(.+?)(?:\n|$)/i)
    if (servingsMatch) data.servings = servingsMatch[1].trim()

    // Extract difficulty
    const diffMatch = text.match(/Difficulty.*?:\s*(.+?)(?:\n|$)/i)
    if (diffMatch) data.difficulty = diffMatch[1].trim()

    // Extract dietary
    const dietMatch = text.match(/Dietary.*?:\s*(.+?)(?:\n|$)/i)
    if (dietMatch) data.dietary = dietMatch[1].trim()

    // Extract nutrition
    const calorieMatch = text.match(/Calorie[s]?.*?:\s*(\d+)/i)
    if (calorieMatch) data.nutrition.calories = calorieMatch[1]

    const proteinMatch = text.match(/Protein.*?:\s*(\d+)/i)
    if (proteinMatch) data.nutrition.protein = proteinMatch[1]

    const carbsMatch = text.match(/Carb[s]?.*?:\s*(\d+)/i)
    if (carbsMatch) data.nutrition.carbs = carbsMatch[1]

    const fatMatch = text.match(/Fat.*?:\s*(\d+)/i)
    if (fatMatch) data.nutrition.fat = fatMatch[1]

    const fiberMatch = text.match(/Fiber.*?:\s*(\d+)/i)
    if (fiberMatch) data.nutrition.fiber = fiberMatch[1]

    // Extract ingredients
    const ingredientMatch = text.match(/Ingredients:([\s\S]*?)(?:Instructions:|$)/i)
    if (ingredientMatch) {
      const ingLines = ingredientMatch[1].split('\n')
      data.ingredients = ingLines
        .filter(line => line.match(/^[-•\*\s]+/))
        .map(line => line.replace(/^[-•\*\s]+/, '').trim())
        .filter(line => line.length > 0)
    }

    // Extract instructions
    const instructMatch = text.match(/Instructions:([\s\S]*?)(?:Cooking|Nutrition|$)/i)
    if (instructMatch) {
      const instLines = instructMatch[1].split('\n')
      data.instructions = instLines
        .filter(line => /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(line => line.length > 0)
    }

    return data
  }

  const generateRecipe = async (userMessage) => {
    if (!chat) {
      alert('Chat not initialized. Please wait...')
      return
    }

    setMessages(prev => [
      ...prev,
      { role: 'user', content: userMessage }
    ])

    setLoading(true)
    
    try {
      const recipePrompt = `You are a professional chef and nutritionist. The user says: "${userMessage}"

Generate ONE complete recipe with these EXACT sections:

**Recipe Name**
[Name]

**Ingredients:**
- [ingredient 1 with quantity]
- [ingredient 2 with quantity]
- [ingredient 3 with quantity]
- [ingredient 4 with quantity]
- [ingredient 5 with quantity]
- [ingredient 6 with quantity]

**Instructions:**
1. [Step 1 detailed]
2. [Step 2 detailed]
3. [Step 3 detailed]
4. [Step 4 detailed]
5. [Step 5 detailed]

**Nutrition Facts (per serving):**
- Calories: [number]
- Protein: [grams]g
- Carbs: [grams]g
- Fat: [grams]g
- Fiber: [grams]g

**Cooking Time:** [X minutes]
**Servings:** [X servings]
**Dietary Info:** [vegan/vegetarian/gluten-free/None]
**Difficulty:** [Easy/Medium/Hard]

Generate the complete recipe NOW with accurate nutrition info.`

      const result = await chat.sendMessage(recipePrompt)
      const aiResponse = result.response.text()
      
      console.log('✅ Recipe generated!')

      const recipeData = parseRecipeData(aiResponse)
      onRecipeGenerated(recipeData)

      setRecipes(prev => [...prev, aiResponse])
      
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '✨ Recipe ready! Check the nutrition info on the left 👈' }
      ])

      setLoading(false)

    } catch (err) {
      console.error('❌ Error:', err)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Try again!' }
      ])
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    
    const userMessage = input
    setInput('')
    generateRecipe(userMessage)
  }

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>🍳 Recipe Chatbot</h2>
      </div>
      
      <div className="messages-area">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-bubble">
              {msg.content}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="message assistant">
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {recipes.length > 0 && (
        <div className="recipes-scroll">
          {recipes.map((recipe, index) => (
            <div key={index} ref={index === recipes.length - 1 ? recipeRef : null}>
              <RecipeCard recipe={recipe} />
            </div>
          ))}
        </div>
      )}

      <div className="input-area">
        <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%', gap: '10px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me your recipe... 🥘"
            className="chat-input"
            disabled={loading}
          />
          <button type="submit" disabled={loading} className="send-button">
            {loading ? '⏳' : '➤'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatInterface
