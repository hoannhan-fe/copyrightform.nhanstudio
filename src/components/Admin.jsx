import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { portfolioItems as defaultItems } from '../data/portfolioData';
import { 
  getPortfolioItems, 
  addProject, 
  updateProject, 
  deleteProject,
  initializePortfolioData 
} from '../utils/portfolioStorage';
import { resizeImage } from '../utils/imageResize';

function Admin() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    date: '',
    technologies: '',
    link: ''
  });

  useEffect(() => {
    // Initialize with default data if localStorage is empty
    const initialized = initializePortfolioData(defaultItems);
    setProjects(initialized);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      try {
        // Resize image to max 800x600 with high quality
        const resizedBase64 = await resizeImage(file, 800, 600, 0.85);
        setFormData(prev => ({
          ...prev,
          image: resizedBase64
        }));
        setImagePreview(resizedBase64);
      } catch (error) {
        console.error('Error resizing image:', error);
        alert('Error processing image. Please try again.');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const projectData = {
      title: formData.title,
      description: formData.description,
      fullDescription: formData.description, // Use same description for both
      image: formData.image,
      date: formData.date,
      technologies: formData.technologies.split(',').map(tech => tech.trim()).filter(tech => tech),
      link: formData.link || ''
    };

    if (editingId) {
      // Update existing project
      const updated = updateProject(editingId, projectData, defaultItems);
      setProjects(updated);
      setEditingId(null);
    } else {
      // Add new project
      const updated = addProject(projectData, defaultItems);
      setProjects(updated);
    }

    // Reset form
    setFormData({
      title: '',
      description: '',
      image: '',
      date: '',
      technologies: '',
      link: ''
    });
    setImagePreview(null);
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setFormData({
      title: project.title,
      description: project.description,
      fullDescription: project.fullDescription,
      image: project.image,
      date: project.date || '',
      technologies: project.technologies.join(', '),
      link: project.link || ''
    });
    // Show preview if image is base64 or URL
    if (project.image) {
      setImagePreview(project.image);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const updated = deleteProject(id, defaultItems);
      setProjects(updated);
      if (editingId === id) {
        setEditingId(null);
        setFormData({
          title: '',
          description: '',
          image: '',
          date: '',
          technologies: '',
          link: ''
        });
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      fullDescription: '',
      image: '',
      date: '',
      technologies: '',
      link: ''
    });
    setImagePreview(null);
  };

  return (
    <div>
      <Header />
      <div style={{ paddingTop: '120px', paddingBottom: '40px', paddingLeft: '20px', paddingRight: '20px', minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#333' }}>Admin Panel</h1>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '10px 20px',
                background: '#333',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Back to Website
            </button>
          </div>

          {/* Form */}
          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>
              {editingId ? 'Edit Project' : 'Add New Project'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="8"
                  placeholder="Write a detailed description of your project here..."
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '16px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    lineHeight: '1.6'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Write a complete description of your project. This will be displayed on both the portfolio card and project detail page.
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
                  Project Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  required={!formData.image}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '16px',
                    marginBottom: '10px'
                  }}
                />
                {imagePreview && (
                  <div style={{ marginTop: '10px' }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '300px',
                        borderRadius: '5px',
                        border: '1px solid #ddd'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, image: '' }));
                      }}
                      style={{
                        marginTop: '10px',
                        padding: '5px 15px',
                        background: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Remove Image
                    </button>
                  </div>
                )}
                <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, WebP
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
                  Date (e.g., January 2020) *
                </label>
                <input
                  type="text"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  placeholder="January 2020"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
                    Photography tools (comma-separated) *
                  </label>
                <input
                  type="text"
                  name="technologies"
                  value={formData.technologies}
                  onChange={handleInputChange}
                  required
                  placeholder="React, Node.js, MongoDB"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
                  Link (optional)
                </label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {editingId ? 'Update Project' : 'Add Project'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    style={{
                      padding: '12px 24px',
                      background: '#6c757d',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Projects List */}
          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>All Projects ({projects.length})</h2>
            <div style={{ display: 'grid', gap: '20px' }}>
              {projects.map((project) => (
                <div
                  key={project.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'center'
                  }}
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    style={{
                      width: '150px',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '5px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: '5px', color: '#333' }}>{project.title}</h3>
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                      {project.date}
                    </p>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                      {project.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleEdit(project)}
                      style={{
                        padding: '8px 16px',
                        background: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      style={{
                        padding: '8px 16px',
                        background: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;

