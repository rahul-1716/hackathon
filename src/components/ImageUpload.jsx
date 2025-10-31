import { useState, useEffect } from 'react'
import axios from 'axios'
import gsap from 'gsap'

function ImageUpload({ detectedIngredients, setDetectedIngredients }) {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (detectedIngredients.length > 0) {
      gsap.from('.ingredient-tag', {
        scale: 0,
        duration: 0.3,
        stagger: 0.1,
        ease: 'back.out(1.7)'
      })
    }
  }, [detectedIngredients])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const recognizeFood = async () => {
    if (!image) return
    
    setLoading(true)
    setError('')
    
    try {
      // Using Hugging Face Inference API - Completely FREE
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/nateraw/food',
        image,
        {
          headers: {
            'Content-Type': 'application/octet-stream',
          }
        }
      )

      // Extract top predictions
      const predictions = response.data
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .filter(p => p.score > 0.1)
        .map(p => p.label.replace(/_/g, ' '))
      
      setDetectedIngredients(predictions)
      setLoading(false)
    } catch (err) {
      setError('Failed to recognize food. Try another image.')
      setLoading(false)
      console.error(err)
    }
  }

  const removeIngredient = (index) => {
    setDetectedIngredients(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="image-upload-container">
      <h2 className="section-title">📸 Upload Food Image</h2>
      
      <div className="upload-area">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          id="file-input"
          className="file-input"
        />
        <label htmlFor="file-input" className="file-label">
          {preview ? (
            <img src={preview} alt="Preview" className="preview-image" />
          ) : (
            <div className="upload-placeholder">
              <span className="upload-icon">📷</span>
              <p>Click to upload image</p>
            </div>
          )}
        </label>
      </div>

      {image && (
        <button 
          onClick={recognizeFood} 
          disabled={loading}
          className="btn-recognize"
        >
          {loading ? 'Analyzing...' : 'Recognize Ingredients'}
        </button>
      )}

      {error && <p className="error-text">{error}</p>}

      {detectedIngredients.length > 0 && (
        <div className="ingredients-detected">
          <h3>Detected Food:</h3>
          <div className="tags-container">
            {detectedIngredients.map((ingredient, index) => (
              <span key={index} className="ingredient-tag">
                {ingredient}
                <button 
                  onClick={() => removeIngredient(index)}
                  className="remove-tag"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUpload
