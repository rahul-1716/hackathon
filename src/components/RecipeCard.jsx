import { useEffect, useState } from 'react'
import { jsPDF } from 'jspdf'
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

  const exportPDF = () => {
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      let yPosition = 15

      // Title
      doc.setFontSize(20)
      doc.setFont(undefined, 'bold')
      doc.text(recipeData.name, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 15

      // Recipe Info
      doc.setFontSize(10)
      doc.setFont(undefined, 'normal')
      const infoText = [
        `⏱️ Time: ${recipeData.time}`,
        `🍽️ Servings: ${recipeData.servings}`,
        `💪 Difficulty: ${recipeData.difficulty}`,
        `🌱 Diet: ${recipeData.dietary}`
      ].join(' | ')
      doc.text(infoText, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 12

      // Nutrition Facts
      if (recipeData.nutrition.calories) {
        doc.setFont(undefined, 'bold')
        doc.setFontSize(12)
        doc.text('📊 Nutrition Facts (per serving)', 15, yPosition)
        yPosition += 10

        doc.setFont(undefined, 'normal')
        doc.setFontSize(10)
        const nutritionText = [
          `Calories: ${recipeData.nutrition.calories}`,
          `Protein: ${recipeData.nutrition.protein}g`,
          `Carbs: ${recipeData.nutrition.carbs}g`,
          `Fat: ${recipeData.nutrition.fat}g`,
          `Fiber: ${recipeData.nutrition.fiber}g`
        ]
        nutritionText.forEach(text => {
          doc.text(text, 20, yPosition)
          yPosition += 7
        })
        yPosition += 5
      }

      // Ingredients
      if (recipeData.ingredients.length > 0) {
        doc.setFont(undefined, 'bold')
        doc.setFontSize(12)
        doc.text('🥘 Ingredients', 15, yPosition)
        yPosition += 10

        doc.setFont(undefined, 'normal')
        doc.setFontSize(10)
        recipeData.ingredients.forEach(ingredient => {
          const splitText = doc.splitTextToSize(ingredient, pageWidth - 30)
          splitText.forEach(line => {
            doc.text(`• ${line}`, 20, yPosition)
            yPosition += 6
          })
        })
        yPosition += 5
      }

      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        doc.addPage()
        yPosition = 15
      }

      // Instructions
      if (recipeData.instructions.length > 0) {
        doc.setFont(undefined, 'bold')
        doc.setFontSize(12)
        doc.text('👨‍🍳 Instructions', 15, yPosition)
        yPosition += 10

        doc.setFont(undefined, 'normal')
        doc.setFontSize(10)
        recipeData.instructions.forEach((instruction, index) => {
          const splitText = doc.splitTextToSize(instruction, pageWidth - 30)
          doc.setFont(undefined, 'bold')
          doc.text(`${index + 1}.`, 20, yPosition)
          doc.setFont(undefined, 'normal')
          
          let firstLine = true
          splitText.forEach(line => {
            doc.text(line, firstLine ? 28 : 20, yPosition)
            yPosition += 6
            firstLine = false
          })
          yPosition += 3
        })
      }

      // Footer
      doc.setFont(undefined, 'normal')
      doc.setFontSize(8)
      doc.text('Generated with AI Recipe Generator 🍳', pageWidth / 2, pageHeight - 10, { align: 'center' })

      // Save PDF
      doc.save(`${recipeData.name}.pdf`)
      alert(`✅ ${recipeData.name}.pdf downloaded!`)
    } catch (error) {
      console.error('PDF generation error:', error)
      alert('❌ Error generating PDF')
    }
  }

  const printRecipe = () => {
    const printWindow = window.open('', '', 'width=800,height=600')
    printWindow.document.write(`
      <html>
        <head>
          <title>${recipeData.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #667eea; }
            h2 { color: #764ba2; margin-top: 20px; }
            ul, ol { line-height: 1.8; }
          </style>
        </head>
        <body>
          <h1>${recipeData.name}</h1>
          <p><strong>⏱️ Time:</strong> ${recipeData.time} | <strong>🍽️ Servings:</strong> ${recipeData.servings}</p>
          <h2>🥘 Ingredients</h2>
          <ul>
            ${recipeData.ingredients.map(ing => `<li>${ing}</li>`).join('')}
          </ul>
          <h2>👨‍🍳 Instructions</h2>
          <ol>
            ${recipeData.instructions.map(inst => `<li>${inst}</li>`).join('')}
          </ol>
          <h2>📊 Nutrition</h2>
          <p>Calories: ${recipeData.nutrition.calories} | Protein: ${recipeData.nutrition.protein}g</p>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const shareRecipe = async () => {
    const text = `🍳 Check out this recipe: ${recipeData.name}!\n\nCalories: ${recipeData.nutrition.calories}\nProtein: ${recipeData.nutrition.protein}g\n\nGenerated with AI Recipe Generator`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipeData.name,
          text: text
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(text)
      alert('📋 Recipe copied to clipboard!')
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
          onClick={exportPDF}
          className="recipe-btn"
          title="Download recipe as PDF"
        >
          📥 PDF
        </button>

        <button 
          onClick={printRecipe}
          className="recipe-btn"
          title="Print recipe"
        >
          🖨️ Print
        </button>

        <button 
          onClick={shareRecipe}
          className="recipe-btn secondary"
          title="Share recipe"
        >
          🔗 Share
        </button>

        <button 
          onClick={() => navigator.clipboard.writeText(recipe)}
          className="recipe-btn secondary"
          title="Copy to clipboard"
        >
          📋 Copy
        </button>
      </div>
    </div>
  )
}

export default RecipeCard
