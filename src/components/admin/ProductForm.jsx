import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ProductForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: ''
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();

    // Append text data
    Object.keys(formData).forEach(key => {
      formDataToSend.append(`product[${key}]`, formData[key]);
    });

    // Append images
    images.forEach(image => {
      formDataToSend.append('product[images][]', image);
    });

    try {
      const response = await fetch('/api/v1/admin/products', {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to create product');

      navigate('/admin/products');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-form-container">
      <h2>Add New Product</h2>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            type="number"
            id="price"
            name="price"
            step="0.01"
            value={formData.price}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="images">Images</label>
          <input
            type="file"
            id="images"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        </div>

        <div className="preview-images">
          {previews.map((preview, index) => (
            <div key={index} className="image-preview">
              <img src={preview} alt={`Preview ${index + 1}`} />
              <button
                type="button"
                className="remove-image"
                onClick={() => removeImage(index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button type="submit" className="submit-button">
          Create Product
        </button>
      </form>
    </div>
  );
}

export default ProductForm; 