import { useState, useEffect, useRef } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import gsap from 'gsap'
import RecipeCard from './RecipeCard'

function ChatInterface({ detectedIngredients, userName }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi ${userName}! 👋 Upload an image or tell me what ingredients you have, and I'll create amazing recipes for you!` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recipe, setRecipe] = useState(null)
  const messagesEndRef = useRef(null)
  const [chat, setChat] = useState(null)

  // Initialize Gemini
  useEffect(() => {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    
    const chatInstance = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    })
    
    setChat(chatInstance)
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
    if (detectedIngredients.length > 0) {
      setInput(`I have: ${detectedIngredients.join(', ')}. What can I cook?`)
    }
  }, [detectedIngredients])

  const generateRecipe = async (userMessage) => {
    if (!chat) {
      alert('Chat not initialized yet. Wait a moment!')
      return
    }

    setLoading(true)
    
    try {
      const prompt = `You are a professional chef assistant. User says: "${userMessage}". 
      Generate a creative recipe with these sections:
      
      **Recipe Name**
      [Creative name here]
      
      **Ingredients:**
      - List all ingredients with quantities
      
      **Instructions:**
      1. Step-by-step cooking instructions
      
      **Cooking Time:** [time]
      **Servings:** [number]
      **Dietary Info:** [vegetarian/vegan/etc if applicable]`

      const result = await chat.sendMessage(prompt)
      const aiResponse = result.response.text()
      
      setMessages(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: aiResponse }
      ])
      
      setRecipe(aiResponse)
      setLoading(false)
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again!' }
      ])
      setLoading(false)
      console.error('Gemini Error:', err)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    
    generateRecipe(input)
    setInput('')
  }

  return (
    <div className="chat-container">
      <h2 className="section-title">💬 Recipe Chatbot (Gemini AI)</h2>
      
      <div className="messages-area">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message ${msg.role}`}
          >
            <div className="message-content">
              {msg.content}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="message assistant">
            <div className="message-content typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for a recipe or describe ingredients..."
          className="chat-input"
          disabled={loading}
        />
        <button type="submit" disabled={loading} className="btn-send">
          Send
        </button>
      </form>

      {recipe && <RecipeCard recipe={recipe} />}
    </div>
  )
}

export default ChatInterface
