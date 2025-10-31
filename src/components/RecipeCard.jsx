import { useEffect, useState } from 'react'
import gsap from 'gsap'
import '../styles/RecipeCard.css'

function RecipeCard({ recipe }) {
  const [recipeData, setRecipeData] = useState(null)

  useEffect(() => {
    gsap.from('.recipe-card', {
      scale: 0.9,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(1.2)'
    })

    setRecipeData(parseRecipe(recipe))
  }, [recipe])

  const parseRecipe = (text) => {
    const sections = {
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
      } else if (trimmed.includes('Nutrition') || trimmed.includes('Calorie')) {
        if (currentSection && tempContent.length > 0) assignSection(sections, currentSection, tempContent)
        currentSection = 'nutrition'
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
    } else if (section === 'nutrition') {
      content.forEach(line => {
        if (line.includes('Calorie')) {
          const match = line.match(/(\d+)/)
          if (match) sections.nutrition.calories = match[1]
        } else if (line.includes('Protein')) {
          const match = line.match(/(\d+)/)
          if (match) sections.nutrition.protein = match[1]
        } else if (line.includes('Carb')) {
          const match = line.match(/(\d+)/)
          if (match) sections.nutrition.carbs = match[1]
        } else if (line.includes('Fat')) {
          const match = line.match(/(\d+)/)
          if (match) sections.nutrition.fat = match[1]
        } else if (line.includes('Fiber')) {
          const match = line.match(/(\d+)/)
          if (match) sections.nutrition.fiber = match[1]
        }
      })
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

      {/* NUTRITION INFO */}
      {(recipeData.nutrition.calories || recipeData.nutrition.protein) && (
        <div className="recipe-nutrition">
          <h4 className="nutrition-title">📊 Nutrition Facts</h4>
          <div className="nutrition-grid">
            {recipeData.nutrition.calories && (
              <div className="nutrition-item">
                <span className="nutrition-label">Calories</span>
                <span className="nutrition-value">{recipeData.nutrition.calories}</span>
              </div>
            )}
            {recipeData.nutrition.protein && (
              <div className="nutrition-item">
                <span className="nutrition-label">Protein</span>
                <span className="nutrition-value">{recipeData.nutrition.protein}g</span>
              </div>
            )}
            {recipeData.nutrition.carbs && (
              <div className="nutrition-item">
                <span className="nutrition-label">Carbs</span>
                <span className="nutrition-value">{recipeData.nutrition.carbs}g</span>
              </div>
            )}
            {recipeData.nutrition.fat && (
              <div className="nutrition-item">
                <span className="nutrition-label">Fat</span>
                <span className="nutrition-value">{recipeData.nutrition.fat}g</span>
              </div>
            )}
            {recipeData.nutrition.fiber && (
              <div className="nutrition-item">
                <span className="nutrition-label">Fiber</span>
                <span className="nutrition-value">{recipeData.nutrition.fiber}g</span>
              </div>
            )}
          </div>
        </div>
      )}

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
        <button 
          onClick={() => navigator.clipboard.writeText(recipe)} 
          className="recipe-btn"
        >
          📋 Copy Recipe
        </button>
      </div>
    </div>
  )
}

export default RecipeCard
