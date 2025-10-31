import { useEffect, useState } from 'react'
import gsap from 'gsap'
import '../styles/RecipeCard.css'

function RecipeCard({ recipe }) {
  const [recipeData, setRecipeData] = useState(null)
  const [image, setImage] = useState(null)
  const [imageLoading, setImageLoading] = useState(true)

  useEffect(() => {
    gsap.from('.recipe-card', {
      scale: 0.9,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(1.2)'
    })

    const data = parseRecipe(recipe)
    setRecipeData(data)
    generateImage(data.name)
  }, [recipe])

  const parseRecipe = (text) => {
    const sections = {
      name: 'Delicious Recipe',
      ingredients: [],
      instructions: [],
      time: '',
      servings: '',
      dietary: '',
      difficulty: ''
    }

    const lines = text.split('\n')
    let currentSection = null
    let tempContent = []

    lines.forEach(line => {
      const trimmed = line.trim()
      
      if (trimmed.includes('Recipe Name')) {
        if (currentSection && tempContent.length > 0) assignSection(sections, currentSection, tempContent)
        currentSection = 'name'
        tempContent = []
      } else if (trimmed.includes('Ingredient')) {
        if (currentSection && tempContent.length > 0) assignSection(sections, currentSection, tempContent)
        currentSection = 'ingredients'
        tempContent = []
      } else if (trimmed.includes('Instruction') || trimmed.includes('Step')) {
        if (currentSection && tempContent.length > 0) assignSection(sections, currentSection, tempContent)
        currentSection = 'instructions'
        tempContent = []
      } else if (trimmed.includes('Cooking Time')) {
        sections.time = trimmed.replace(/\*.*?:\s*/i, '').trim()
      } else if (trimmed.includes('Serving')) {
        sections.servings = trimmed.replace(/\*.*?:\s*/i, '').trim()
      } else if (trimmed.includes('Dietary')) {
        sections.dietary = trimmed.replace(/\*.*?:\s*/i, '').trim()
      } else if (trimmed.includes('Difficulty')) {
        sections.difficulty = trimmed.replace(/\*.*?:\s*/i, '').trim()
      } else if (trimmed && currentSection) {
        tempContent.push(trimmed)
      }
    })

    if (currentSection && tempContent.length > 0) assignSection(sections, currentSection, tempContent)
    return sections
  }

  const assignSection = (sections, section, content) => {
    if (section === 'name') {
      const cleanName = content.join(' ').replace(/\*{0,2}/g, '').trim()
      if (cleanName) sections.name = cleanName
    } else if (section === 'ingredients') {
      sections.ingredients = content
        .filter(line => line && (line.startsWith('-') || line.startsWith('•') || /^\d/.test(line)))
        .map(line => line.replace(/^[-•\d.)\s]+/, '').trim())
        .filter(line => line.length > 0)
    } else if (section === 'instructions') {
      sections.instructions = content
        .filter(line => line && /^\d/.test(line))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(line => line.length > 0)
    }
  }

  const generateImage = async (recipeName) => {
    setImageLoading(true)
    try {
      const query = `${recipeName} food photography professional high quality`
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&count=1&client_id=tR5S07dh0sA8phwJ0PHDvAYvT0F_ibjEUjzlR1Jyw1c`
      )

      if (!response.ok) throw new Error('Failed to fetch image')

      const data = await response.json()
      
      if (data.results && data.results.length > 0) {
        setImage(data.results[0].urls.regular)
      }

      setImageLoading(false)
    } catch (err) {
      console.error('Image fetch error:', err)
      setImageLoading(false)
    }
  }

  if (!recipeData) return null

  return (
    <div className="recipe-card">
      <div className="recipe-header">
        <h3 className="recipe-title">{recipeData.name}</h3>
        <div className="recipe-badges">
          {recipeData.time && <span className="badge">⏱️ {recipeData.time}</span>}
          {recipeData.servings && <span className="badge">🍽️ {recipeData.servings}</span>}
          {recipeData.difficulty && <span className="badge">💪 {recipeData.difficulty}</span>}
          {recipeData.dietary && <span className="badge dietary">🌱 {recipeData.dietary}</span>}
        </div>
      </div>

      <div className="recipe-image-container">
        {imageLoading && <div className="image-loading">🎨 Generating image...</div>}
        {image && <img src={image} alt={recipeData.name} className="recipe-image" />}
      </div>

      <div className="recipe-body">
        {recipeData.ingredients.length > 0 && (
          <div className="recipe-section">
            <h4 className="section-title">🥘 Ingredients</h4>
            <ul className="ingredients-list">
              {recipeData.ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </div>
        )}

        {recipeData.instructions.length > 0 && (
          <div className="recipe-section">
            <h4 className="section-title">👨‍🍳 Instructions</h4>
            <ol className="instructions-list">
              {recipeData.instructions.map((inst, i) => (
                <li key={i}><span className="step-num">{i + 1}</span>{inst}</li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <div className="recipe-footer">
        <button onClick={() => generateImage(recipeData.name)} className="recipe-btn">
          🔄 Regenerate Image
        </button>
        <button onClick={() => navigator.clipboard.writeText(recipe)} className="recipe-btn secondary">
          📋 Copy
        </button>
      </div>
    </div>
  )
}

export default RecipeCard
