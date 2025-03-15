import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function TournamentForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    prize_pool: '',
    start_date: '',
    max_players: '',
    game_mode: '5v5',
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
      formDataToSend.append(`tournament[${key}]`, formData[key]);
    });

    // Append images
    images.forEach(image => {
      formDataToSend.append('tournament[images][]', image);
    });

    try {
      const response = await fetch('/api/v1/admin/tournaments', {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to create tournament');

      navigate('/admin/tournaments');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-form-container">
      <h2>Add New Tournament</h2>

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
          <label htmlFor="prize_pool">Prize Pool ($)</label>
          <input
            type="number"
            id="prize_pool"
            name="prize_pool"
            step="0.01"
            value={formData.prize_pool}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="start_date">Start Date</label>
          <input
            type="datetime-local"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="max_players">Maximum Players</label>
          <input
            type="number"
            id="max_players"
            name="max_players"
            value={formData.max_players}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="game_mode">Game Mode</label>
          <select
            id="game_mode"
            name="game_mode"
            value={formData.game_mode}
            onChange={handleInputChange}
            required
          >
            <option value="1v1">1v1</option>
            <option value="2v2">2v2</option>
            <option value="5v5">5v5</option>
          </select>
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
          Create Tournament
        </button>
      </form>
    </div>
  );
}

export default TournamentForm; 