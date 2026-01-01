import React, { useState, useEffect } from 'react';
import PortfolioCard from './PortfolioCard';
import { useAuth } from '../contexts/AuthContext';
import { projectsAPI } from '../services/api';
import { resizeImage } from '../utils/imageResize';

function Portfolio() {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
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

  // Fetch projects from backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await projectsAPI.getAll();
        if (response.success && response.data) {
          // Transform backend data to frontend format
          const transformedProjects = response.data.map(project => ({
            id: project.id,
            title: project.title,
            description: project.description,
            image: project.image || '',
            date: project.date || '',
            technologies: project.technologies || [],
            link: project.link || '',
            images: project.images || [],
            descriptions: project.descriptions || [],
            contentTimeline: project.contentTimeline || [],
            createdBy: project.createdBy?._id || project.createdBy || null,
            creatorName: project.createdBy 
              ? `${project.createdBy.firstName || ''} ${project.createdBy.lastName || ''}`.trim()
              : 'Unknown'
          }));
          setItems(transformedProjects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Please login to add or edit projects');
      return;
    }

    try {
      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        image: formData.image,
        date: formData.date.trim(),
        technologies: formData.technologies.split(',').map(tech => tech.trim()).filter(tech => tech),
        link: formData.link.trim() || ''
      };

      let response;
      if (editingId) {
        // Update existing project
        response = await projectsAPI.update(editingId, projectData);
        if (response.success) {
          // Refresh projects list
          const projectsResponse = await projectsAPI.getAll();
          if (projectsResponse.success && projectsResponse.data) {
            const transformedProjects = projectsResponse.data.map(project => ({
              id: project.id,
              title: project.title,
              description: project.description,
              image: project.image || '',
              date: project.date || '',
              technologies: project.technologies || [],
              link: project.link || '',
              images: project.images || [],
              descriptions: project.descriptions || [],
              contentTimeline: project.contentTimeline || [],
              createdBy: project.createdBy?._id || project.createdBy || null,
              creatorName: project.createdBy 
                ? `${project.createdBy.firstName || ''} ${project.createdBy.lastName || ''}`.trim()
                : 'Unknown'
            }));
            setItems(transformedProjects);
          }
          setEditingId(null);
        }
      } else {
        // Create new project
        response = await projectsAPI.create(projectData);
        if (response.success) {
          // Refresh projects list
          const projectsResponse = await projectsAPI.getAll();
          if (projectsResponse.success && projectsResponse.data) {
            const transformedProjects = projectsResponse.data.map(project => ({
              id: project.id,
              title: project.title,
              description: project.description,
              image: project.image || '',
              date: project.date || '',
              technologies: project.technologies || [],
              link: project.link || '',
              images: project.images || [],
              descriptions: project.descriptions || [],
              contentTimeline: project.contentTimeline || [],
              createdBy: project.createdBy?._id || project.createdBy || null,
              creatorName: project.createdBy 
                ? `${project.createdBy.firstName || ''} ${project.createdBy.lastName || ''}`.trim()
                : 'Unknown'
            }));
            setItems(transformedProjects);
          }
        }
      }
      
      // Reset form and hide it
      setFormData({
        title: '',
        description: '',
        image: '',
        date: '',
        technologies: '',
        link: ''
      });
      setImagePreview(null);
      setShowForm(false);
      setError('');
    } catch (error) {
      console.error('Error saving project:', error);
      setError(error.message || 'Failed to save project. Please try again.');
    }
  };

  const handleEdit = (project) => {
    if (!isAuthenticated) {
      setError('Please login to edit projects');
      return;
    }

    // Check if user owns this project or is admin
    const canEdit = user?.role === 'Me' || user?.role === 'Admin' || project.createdBy === user?.id;
    if (!canEdit) {
      setError('You can only edit your own projects');
      return;
    }

    // Find full project data from items
    const fullProject = items.find(item => item.id === project.id);
    if (!fullProject) return;
    
    setEditingId(fullProject.id);
    setFormData({
      title: fullProject.title,
      description: fullProject.description || '',
      image: fullProject.image,
      date: fullProject.date || '',
      technologies: fullProject.technologies ? fullProject.technologies.join(', ') : '',
      link: fullProject.link || ''
    });
    setImagePreview(fullProject.image);
    setShowForm(true);
    setError('');
    // Scroll to form
    setTimeout(() => {
      document.getElementById('portfolio-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDelete = async (projectId) => {
    if (!isAuthenticated) {
      setError('Please login to delete projects');
      return;
    }

    const project = items.find(item => item.id === projectId);
    if (!project) return;

    // Check if user owns this project or is admin
    const canDelete = user?.role === 'Me' || user?.role === 'Admin' || project.createdBy === user?.id;
    if (!canDelete) {
      setError('You can only delete your own projects');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await projectsAPI.delete(projectId);
      if (response.success) {
        // Refresh projects list
        const projectsResponse = await projectsAPI.getAll();
        if (projectsResponse.success && projectsResponse.data) {
          const transformedProjects = projectsResponse.data.map(project => ({
            id: project.id,
            title: project.title,
            description: project.description,
            image: project.image || '',
            date: project.date || '',
            technologies: project.technologies || [],
            link: project.link || '',
            images: project.images || [],
            descriptions: project.descriptions || [],
            contentTimeline: project.contentTimeline || [],
            createdBy: project.createdBy?._id || project.createdBy || null,
            creatorName: project.createdBy 
              ? `${project.createdBy.firstName || ''} ${project.createdBy.lastName || ''}`.trim()
              : 'Unknown'
          }));
          setItems(transformedProjects);
        }
        setError('');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      setError(error.message || 'Failed to delete project. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      image: '',
      date: '',
      technologies: '',
      link: ''
    });
    setImagePreview(null);
    setShowForm(false);
  };

  return (
    <section id="portfolio" className="portfolio">
      <div className="portfolio-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="portfolio-title">Portfolio Projects</h2>
            <p style={{ color: '#666', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              {loading ? 'Loading projects...' : `${items.length} ${items.length === 1 ? 'project' : 'projects'} from our community`}
            </p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => {
                if (showForm) {
                  handleCancel();
                } else {
                  setShowForm(true);
                }
              }}
              style={{
                padding: '12px 24px',
                background: showForm ? '#dc3545' : '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background 0.3s'
              }}
              onMouseOver={(e) => e.target.style.background = showForm ? '#c82333' : '#0056b3'}
              onMouseOut={(e) => e.target.style.background = showForm ? '#dc3545' : '#007bff'}
            >
              {showForm ? 'Cancel' : '+ Add Project'}
            </button>
          )}
        </div>

        {error && (
          <div style={{
            padding: '15px',
            background: '#fee',
            color: '#c33',
            borderRadius: '5px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p>Loading projects...</p>
          </div>
        )}

        {/* Add Project Form - Only show if authenticated */}
        {showForm && isAuthenticated && (
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '10px',
            marginBottom: '30px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333', fontSize: '1.5rem' }}>
              {editingId ? 'Edit Project' : 'Add New Project'}
            </h3>
            <form id="portfolio-form" onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <div>
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

                <div>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
                    Camera & Lens (comma-separated) *
                  </label>
                  <input
                    type="text"
                    name="technologies"
                    value={formData.technologies}
                    onChange={handleInputChange}
                    required
                    placeholder="Canon EOS R5, Sony 24-70mm f/2.8, Nikon D850"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '16px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
                    Link (optional)
                  </label>
                  <input
                    type="url"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#218838'}
                  onMouseOut={(e) => e.target.style.background = '#28a745'}
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
                      cursor: 'pointer',
                      transition: 'background 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#5a6268'}
                    onMouseOut={(e) => e.target.style.background = '#6c757d'}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {!loading && (
          <>
            {items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No projects yet</p>
                <p>Be the first to share your work!</p>
                {!isAuthenticated && (
                  <p style={{ marginTop: '1rem' }}>
                    <a href="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
                      Login to add a project
                    </a>
                  </p>
                )}
              </div>
            ) : (
              <div className="portfolio-grid">
                {items.map((item) => {
                  // Check if user can edit/delete this project
                  const canEdit = isAuthenticated && (
                    user?.role === 'Me' || 
                    user?.role === 'Admin' || 
                    item.createdBy === user?.id
                  );
                  
                  return (
                    <PortfolioCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      description={item.description}
                      image={item.image}
                      date={item.date}
                      creatorName={item.creatorName}
                      onEdit={canEdit ? handleEdit : null}
                      onDelete={canEdit ? () => handleDelete(item.id) : null}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Contact and Legal Footer */}
        <div className="portfolio-footer" style={{
          marginTop: '4rem',
          paddingTop: '3rem',
          paddingBottom: '0',
          marginBottom: '0',
          borderTop: '1px solid #e0e0e0'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            {/* Contact Information */}
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '1rem'
              }}>
                Contact
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                fontSize: '0.95rem',
                color: '#666'
              }}>
                <a 
                  href="mailto:contact@nhanstudio.com"
                  style={{
                    color: '#007bff',
                    textDecoration: 'none',
                    transition: 'color 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.color = '#0056b3'}
                  onMouseOut={(e) => e.target.style.color = '#007bff'}
                >
                  📧 contact@nhanstudio.com
                </a>
                <div>
                  📱 Available for freelance projects
                </div>
              </div>
            </div>

            {/* Legal Information */}
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '1rem'
              }}>
                Copyright & Legal
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                fontSize: '0.95rem',
                color: '#666',
                lineHeight: '1.6'
              }}>
                <div>
                  © {new Date().getFullYear()} NHAN STUDIO. All rights reserved.
                </div>
                <div>
                  All images and content on this website are the property of NHAN STUDIO and are protected by copyright law.
                </div>
                <div>
                  Copying, distributing, or using without permission is a violation of the law.
                </div>
              </div>
            </div>
          </div>

          {/* Copyright Notice */}
          <div style={{
            textAlign: 'center',
            paddingTop: '0.5rem',
            paddingBottom: '0',
            marginTop: '0',
            marginBottom: '0',
            borderTop: '1px solid #e0e0e0',
            fontSize: '0.85rem',
            color: '#999'
          }}>
            <p style={{ margin: 0, paddingBottom: '0' }}>
              This website and its content are protected by copyright law. Unauthorized use is prohibited.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Portfolio;
