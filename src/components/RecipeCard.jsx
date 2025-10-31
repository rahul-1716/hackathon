import { useEffect } from 'react'
import gsap from 'gsap'

function RecipeCard({ recipe }) {
  useEffect(() => {
    gsap.from('.recipe-card', {
      scale: 0.9,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(1.2)'
    })
  }, [recipe])

  return (
    <div className="recipe-card">
      <h3>✨ Generated Recipe</h3>
      <div className="recipe-content">
        {recipe.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <button 
        onClick={() => {
          localStorage.setItem('savedRecipe', recipe)
          alert('Recipe saved!')
        }}
        className="btn-save"
      >
        💾 Save Recipe
      </button>
    </div>
  )
}

export default RecipeCard
