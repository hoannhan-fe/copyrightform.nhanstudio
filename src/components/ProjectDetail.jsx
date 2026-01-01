import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../contexts/AuthContext';
import { projectsAPI } from '../services/api';
import { resizeImage } from '../utils/imageResize';

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddImageForm, setShowAddImageForm] = useState(false);
  const [showAddDescriptionForm, setShowAddDescriptionForm] = useState(false);
  const [showAddToolForm, setShowAddToolForm] = useState(false);
  const [showEditProjectForm, setShowEditProjectForm] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [newDescription, setNewDescription] = useState('');
  const [newTool, setNewTool] = useState('');
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    date: '',
    technologies: '',
    link: '',
    image: ''
  });
  const [editImagePreview, setEditImagePreview] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await projectsAPI.getById(id);
        if (response.success && response.data) {
          // Transform backend data to frontend format
          const transformedProject = {
            id: response.data.id,
            title: response.data.title,
            description: response.data.description,
            image: response.data.image || '',
            date: response.data.date || '',
            technologies: response.data.technologies || [],
            link: response.data.link || '',
            images: response.data.images || [],
            descriptions: response.data.descriptions || [],
            contentTimeline: response.data.contentTimeline || [],
            createdBy: response.data.createdBy?._id || response.data.createdBy || null,
            creatorName: response.data.createdBy 
              ? `${response.data.createdBy.firstName || ''} ${response.data.createdBy.lastName || ''}`.trim()
              : 'Unknown'
          };
          setProject(transformedProject);
        } else {
          setProject(null);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Failed to load project. Please try again later.');
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  // Initialize edit form when project loads or when opening edit form
  useEffect(() => {
    if (project && showEditProjectForm) {
      setEditFormData({
        title: project.title || '',
        description: project.description || '',
        date: project.date || '',
        technologies: project.technologies ? project.technologies.join(', ') : '',
        link: project.link || '',
        image: project.image || ''
      });
      setEditImagePreview(project.image || null);
    }
  }, [project, showEditProjectForm]);

  if (loading) {
    return (
      <div>
        <Header />
        <div style={{ paddingTop: '80px', paddingBottom: '40px', paddingLeft: '20px', paddingRight: '20px', textAlign: 'center', minHeight: '100vh' }}>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div>
        <Header />
        <div style={{ paddingTop: '80px', paddingBottom: '40px', paddingLeft: '20px', paddingRight: '20px', textAlign: 'center', minHeight: '100vh' }}>
          <h2>Project not found</h2>
          {error && <p style={{ color: '#dc3545', marginTop: '10px' }}>{error}</p>}
          <button 
            onClick={() => navigate('/')}
            style={{
              padding: '10px 20px',
              background: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              marginTop: '20px'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Create a combined timeline of content (images and descriptions in order)
  // Only calculate if project exists (after early returns)
  const contentTimeline = project ? (
    project.contentTimeline && project.contentTimeline.length > 0
      ? project.contentTimeline
      : [
          ...(project.image ? [{ type: 'image', content: project.image, id: 'initial-image' }] : []),
          ...(project.description ? [{ type: 'description', content: project.description, id: 'initial-desc' }] : [])
        ]
  ) : [];

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      try {
        const resizedBase64 = await resizeImage(file, 800, 600, 0.85);
        setNewImage(resizedBase64);
        setNewImagePreview(resizedBase64);
      } catch (error) {
        console.error('Error resizing image:', error);
        alert('Error processing image. Please try again.');
      }
    }
  };

  const handleEditImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      try {
        const resizedBase64 = await resizeImage(file, 800, 600, 0.85);
        setEditFormData(prev => ({ ...prev, image: resizedBase64 }));
        setEditImagePreview(resizedBase64);
      } catch (error) {
        console.error('Error resizing image:', error);
        alert('Error processing image. Please try again.');
      }
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert('Please login to edit projects');
      return;
    }

    // Check permissions
    const canEdit = user?.role === 'Me' || user?.role === 'Admin' || project.createdBy === user?.id;
    if (!canEdit) {
      alert('You can only edit your own projects');
      return;
    }

    try {
      const projectData = {
        title: editFormData.title.trim(),
        description: editFormData.description.trim(),
        image: editFormData.image,
        date: editFormData.date.trim(),
        technologies: editFormData.technologies.split(',').map(tech => tech.trim()).filter(tech => tech),
        link: editFormData.link.trim() || ''
      };

      const response = await projectsAPI.update(id, projectData);

      if (response.success) {
        // Refresh project data
        const projectResponse = await projectsAPI.getById(id);
        if (projectResponse.success && projectResponse.data) {
          const transformedProject = {
            id: projectResponse.data.id,
            title: projectResponse.data.title,
            description: projectResponse.data.description,
            image: projectResponse.data.image || '',
            date: projectResponse.data.date || '',
            technologies: projectResponse.data.technologies || [],
            link: projectResponse.data.link || '',
            images: projectResponse.data.images || [],
            descriptions: projectResponse.data.descriptions || [],
            contentTimeline: projectResponse.data.contentTimeline || [],
            createdBy: projectResponse.data.createdBy?._id || projectResponse.data.createdBy || null,
            creatorName: projectResponse.data.createdBy 
              ? `${projectResponse.data.createdBy.firstName || ''} ${projectResponse.data.createdBy.lastName || ''}`.trim()
              : 'Unknown'
          };
          setProject(transformedProject);
        }
        
        setShowEditProjectForm(false);
        setError('');
        alert('Project updated successfully!');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      setError(error.message || 'Error updating project. Please try again.');
    }
  };

  const handleAddImage = async () => {
    if (!newImage) {
      alert('Please select an image first');
      return;
    }

    if (!isAuthenticated) {
      alert('Please login to add images');
      return;
    }

    // Check permissions
    const canEdit = user?.role === 'Me' || user?.role === 'Admin' || project.createdBy === user?.id;
    if (!canEdit) {
      alert('You can only edit your own projects');
      return;
    }
    
    const newContentItem = { 
      type: 'image', 
      content: newImage, 
      id: `image-${Date.now()}` 
    };
    const updatedTimeline = [...contentTimeline, newContentItem];
    const updatedImages = [...(project.images || []), newImage];
    
    try {
      const response = await projectsAPI.update(id, {
        images: updatedImages,
        contentTimeline: updatedTimeline
      });

      if (response.success) {
        // Refresh project data
        const projectResponse = await projectsAPI.getById(id);
        if (projectResponse.success && projectResponse.data) {
          const transformedProject = {
            id: projectResponse.data.id,
            title: projectResponse.data.title,
            description: projectResponse.data.description,
            image: projectResponse.data.image || '',
            date: projectResponse.data.date || '',
            technologies: projectResponse.data.technologies || [],
            link: projectResponse.data.link || '',
            images: projectResponse.data.images || [],
            descriptions: projectResponse.data.descriptions || [],
            contentTimeline: projectResponse.data.contentTimeline || [],
            createdBy: projectResponse.data.createdBy?._id || projectResponse.data.createdBy || null,
            creatorName: projectResponse.data.createdBy 
              ? `${projectResponse.data.createdBy.firstName || ''} ${projectResponse.data.createdBy.lastName || ''}`.trim()
              : 'Unknown'
          };
          setProject(transformedProject);
        }
        
        setNewImage(null);
        setNewImagePreview(null);
        setShowAddImageForm(false);
        setError('');
        
        // Scroll to newly added image
        setTimeout(() => {
          const newElement = document.getElementById(newContentItem.id);
          if (newElement) {
            newElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error saving image:', error);
      setError(error.message || 'Error saving image. Please try again.');
    }
  };

  const handleAddDescription = async () => {
    if (!newDescription.trim()) {
      alert('Please enter a description');
      return;
    }

    if (!isAuthenticated) {
      alert('Please login to add descriptions');
      return;
    }

    // Check permissions
    const canEdit = user?.role === 'Me' || user?.role === 'Admin' || project.createdBy === user?.id;
    if (!canEdit) {
      alert('You can only edit your own projects');
      return;
    }
    
    const newContentItem = { 
      type: 'description', 
      content: newDescription.trim(), 
      id: `desc-${Date.now()}` 
    };
    const updatedTimeline = [...contentTimeline, newContentItem];
    const updatedDescriptions = [...(project.descriptions || []), newDescription.trim()];
    
    try {
      const response = await projectsAPI.update(id, {
        descriptions: updatedDescriptions,
        contentTimeline: updatedTimeline
      });

      if (response.success) {
        // Refresh project data
        const projectResponse = await projectsAPI.getById(id);
        if (projectResponse.success && projectResponse.data) {
          const transformedProject = {
            id: projectResponse.data.id,
            title: projectResponse.data.title,
            description: projectResponse.data.description,
            image: projectResponse.data.image || '',
            date: projectResponse.data.date || '',
            technologies: projectResponse.data.technologies || [],
            link: projectResponse.data.link || '',
            images: projectResponse.data.images || [],
            descriptions: projectResponse.data.descriptions || [],
            contentTimeline: projectResponse.data.contentTimeline || [],
            createdBy: projectResponse.data.createdBy?._id || projectResponse.data.createdBy || null,
            creatorName: projectResponse.data.createdBy 
              ? `${projectResponse.data.createdBy.firstName || ''} ${projectResponse.data.createdBy.lastName || ''}`.trim()
              : 'Unknown'
          };
          setProject(transformedProject);
        }
        
        setNewDescription('');
        setShowAddDescriptionForm(false);
        setError('');
        
        // Scroll to newly added description
        setTimeout(() => {
          const newElement = document.getElementById(newContentItem.id);
          if (newElement) {
            newElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error saving description:', error);
      setError(error.message || 'Error saving description. Please try again.');
    }
  };

  const handleAddTool = async () => {
    if (!newTool.trim()) {
      alert('Please enter a tool name');
      return;
    }

    if (!isAuthenticated) {
      alert('Please login to add tools');
      return;
    }

    // Check permissions
    const canEdit = user?.role === 'Me' || user?.role === 'Admin' || project.createdBy === user?.id;
    if (!canEdit) {
      alert('You can only edit your own projects');
      return;
    }
    
    const updatedTools = [...(project.technologies || []), newTool.trim()];
    
    try {
      const response = await projectsAPI.update(id, {
        technologies: updatedTools
      });

      if (response.success) {
        // Refresh project data
        const projectResponse = await projectsAPI.getById(id);
        if (projectResponse.success && projectResponse.data) {
          const transformedProject = {
            id: projectResponse.data.id,
            title: projectResponse.data.title,
            description: projectResponse.data.description,
            image: projectResponse.data.image || '',
            date: projectResponse.data.date || '',
            technologies: projectResponse.data.technologies || [],
            link: projectResponse.data.link || '',
            images: projectResponse.data.images || [],
            descriptions: projectResponse.data.descriptions || [],
            contentTimeline: projectResponse.data.contentTimeline || [],
            createdBy: projectResponse.data.createdBy?._id || projectResponse.data.createdBy || null,
            creatorName: projectResponse.data.createdBy 
              ? `${projectResponse.data.createdBy.firstName || ''} ${projectResponse.data.createdBy.lastName || ''}`.trim()
              : 'Unknown'
          };
          setProject(transformedProject);
        }
        
        setNewTool('');
        setShowAddToolForm(false);
        setError('');
      }
    } catch (error) {
      console.error('Error saving tool:', error);
      setError(error.message || 'Error saving tool. Please try again.');
    }
  };

  const handleDeleteTool = async (toolToDelete) => {
    if (!window.confirm(`Are you sure you want to remove "${toolToDelete}"?`)) {
      return;
    }

    if (!isAuthenticated) {
      alert('Please login to delete tools');
      return;
    }

    // Check permissions
    const canEdit = user?.role === 'Me' || user?.role === 'Admin' || project.createdBy === user?.id;
    if (!canEdit) {
      alert('You can only edit your own projects');
      return;
    }
    
    const updatedTools = project.technologies.filter(tool => tool !== toolToDelete);
    
    try {
      const response = await projectsAPI.update(id, {
        technologies: updatedTools
      });

      if (response.success) {
        // Refresh project data
        const projectResponse = await projectsAPI.getById(id);
        if (projectResponse.success && projectResponse.data) {
          const transformedProject = {
            id: projectResponse.data.id,
            title: projectResponse.data.title,
            description: projectResponse.data.description,
            image: projectResponse.data.image || '',
            date: projectResponse.data.date || '',
            technologies: projectResponse.data.technologies || [],
            link: projectResponse.data.link || '',
            images: projectResponse.data.images || [],
            descriptions: projectResponse.data.descriptions || [],
            contentTimeline: projectResponse.data.contentTimeline || [],
            createdBy: projectResponse.data.createdBy?._id || projectResponse.data.createdBy || null,
            creatorName: projectResponse.data.createdBy 
              ? `${projectResponse.data.createdBy.firstName || ''} ${projectResponse.data.createdBy.lastName || ''}`.trim()
              : 'Unknown'
          };
          setProject(transformedProject);
        }
        setError('');
      }
    } catch (error) {
      console.error('Error deleting tool:', error);
      setError(error.message || 'Error deleting tool. Please try again.');
    }
  };

  return (
    <div>
      <Header />
      <div className="project-detail" style={{ paddingTop: '80px', paddingBottom: '40px', paddingLeft: '20px', paddingRight: '20px', minHeight: '100vh' }}>
        <div className="project-detail-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
          <div className="project-detail-content">
            <h1 className="project-detail-title" style={{ fontSize: 'clamp(2rem, 5vw, 48px)', marginBottom: '10px', color: '#333' }}>
              {project.title}
            </h1>
            {project.date && (
              <p className="project-detail-date" style={{ fontSize: '16px', color: '#999', marginBottom: '20px', fontStyle: 'italic' }}>
                {project.date}
              </p>
            )}
            {project.creatorName && (
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                By {project.creatorName}
              </p>
            )}

            {/* Content Timeline - Images and Descriptions in order */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '28px', color: '#333', marginBottom: '20px' }}>Project Content</h2>

              {/* Content Timeline - Display in order */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginBottom: '30px' }}>
                {contentTimeline.map((item, index) => (
                  <div key={item.id || index} id={item.id}>
                    {item.type === 'image' ? (
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%'
                      }}>
                        <img
                          src={item.content}
                          alt={`${project.title} - Image ${index + 1}`}
                          style={{
                            maxWidth: '100%',
                            height: 'auto',
                            borderRadius: '10px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            objectFit: 'contain',
                            display: 'block'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            console.error('Image failed to load:', item.content);
                          }}
                        />
                      </div>
                    ) : (
                      <p 
                        style={{ 
                          fontSize: '18px', 
                          lineHeight: '1.8', 
                          color: '#333', 
                          margin: '0 0 20px 0',
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word'
                        }}
                      >
                        {item.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Buttons - Below content - Only show if user can edit */}
              {isAuthenticated && (user?.role === 'Me' || user?.role === 'Admin' || project.createdBy === user?.id) && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px' }}>
                  <button
                    onClick={() => {
                      setShowAddImageForm(!showAddImageForm);
                      setShowAddDescriptionForm(false);
                      setShowEditProjectForm(false);
                    }}
                    style={{
                      padding: '10px 20px',
                      background: showAddImageForm ? '#dc3545' : '#007bff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {showAddImageForm ? 'Cancel' : '+ Add Image'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddDescriptionForm(!showAddDescriptionForm);
                      setShowAddImageForm(false);
                      setShowEditProjectForm(false);
                    }}
                    style={{
                      padding: '10px 20px',
                      background: showAddDescriptionForm ? '#dc3545' : '#007bff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {showAddDescriptionForm ? 'Cancel' : '+ Add Description'}
                  </button>
                  <button
                    onClick={() => {
                      setShowEditProjectForm(!showEditProjectForm);
                      setShowAddImageForm(false);
                      setShowAddDescriptionForm(false);
                    }}
                    style={{
                      padding: '10px 20px',
                      background: showEditProjectForm ? '#dc3545' : '#28a745',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {showEditProjectForm ? 'Cancel' : '✏️ Edit Project'}
                  </button>
                </div>
              )}

              {/* Add Image Form */}
              {showAddImageForm && (
                <div style={{
                  background: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '8px',
                  marginTop: '20px'
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginBottom: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px'
                    }}
                  />
                  {newImagePreview && (
                    <div style={{ marginBottom: '10px' }}>
                      <img
                        src={newImagePreview}
                        alt="Preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '300px',
                          borderRadius: '5px',
                          border: '1px solid #ddd',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                  )}
                  <button
                    onClick={handleAddImage}
                    style={{
                      padding: '10px 20px',
                      background: '#28a745',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Add Image
                  </button>
                </div>
              )}

              {/* Add Description Form */}
              {showAddDescriptionForm && (
                <div style={{
                  background: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '8px',
                  marginTop: '20px'
                }}>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Enter new description..."
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginBottom: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '16px',
                      resize: 'vertical'
                    }}
                  />
                  <button
                    onClick={handleAddDescription}
                    style={{
                      padding: '10px 20px',
                      background: '#28a745',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Add Description
                  </button>
                </div>
              )}

              {/* Edit Project Form */}
              {showEditProjectForm && (
                <div style={{
                  background: '#f8f9fa',
                  padding: '30px',
                  borderRadius: '8px',
                  marginTop: '20px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ marginBottom: '20px', color: '#333', fontSize: '1.5rem' }}>
                    Edit Project
                  </h3>
                  <form onSubmit={handleUpdateProject}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
                          Title *
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={editFormData.title}
                          onChange={handleEditInputChange}
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
                          value={editFormData.date}
                          onChange={handleEditInputChange}
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
                        value={editFormData.description}
                        onChange={handleEditInputChange}
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
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
                        Project Image *
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageUpload}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '5px',
                          fontSize: '16px',
                          marginBottom: '10px'
                        }}
                      />
                      {editImagePreview && (
                        <div style={{ marginTop: '10px' }}>
                          <img
                            src={editImagePreview}
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
                              setEditImagePreview(null);
                              setEditFormData(prev => ({ ...prev, image: '' }));
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
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
                          Camera & Lens (comma-separated) *
                        </label>
                        <input
                          type="text"
                          name="technologies"
                          value={editFormData.technologies}
                          onChange={handleEditInputChange}
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
                          value={editFormData.link}
                          onChange={handleEditInputChange}
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
                        Update Project
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditProjectForm(false);
                          setEditFormData({
                            title: '',
                            description: '',
                            date: '',
                            technologies: '',
                            link: '',
                            image: ''
                          });
                          setEditImagePreview(null);
                        }}
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
                    </div>
                  </form>
                </div>
              )}
            </div>
            
            <div className="project-technologies" style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ fontSize: '24px', color: '#333', margin: 0 }}>Camera & Lens:</h3>
                {isAuthenticated && (user?.role === 'Me' || user?.role === 'Admin' || project.createdBy === user?.id) && (
                  <button
                    onClick={() => {
                      setShowAddToolForm(!showAddToolForm);
                    }}
                    style={{
                      padding: '8px 16px',
                      background: showAddToolForm ? '#dc3545' : '#007bff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {showAddToolForm ? 'Cancel' : '+ Add Tool'}
                  </button>
                )}
              </div>

              {/* Add Tool Form */}
              {showAddToolForm && (
                <div style={{
                  background: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}>
                  <input
                    type="text"
                    value={newTool}
                    onChange={(e) => setNewTool(e.target.value)}
                    placeholder="Enter tool name (e.g., Canon EOS R5, Adobe Lightroom)"
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginBottom: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '16px'
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTool();
                      }
                    }}
                  />
                  <button
                    onClick={handleAddTool}
                    style={{
                      padding: '8px 16px',
                      background: '#28a745',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  >
                    Add Tool
                  </button>
                </div>
              )}

              <div className="tech-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {project.technologies && project.technologies.map((tech, index) => {
                  const canEdit = isAuthenticated && (user?.role === 'Me' || user?.role === 'Admin' || project.createdBy === user?.id);
                  return (
                    <span 
                      key={index} 
                      className="tech-tag"
                      style={{
                        padding: '8px 16px',
                        background: '#f0f0f0',
                        borderRadius: '20px',
                        fontSize: '14px',
                        color: '#333',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {tech}
                      {canEdit && (
                        <button
                          onClick={() => handleDeleteTool(tech)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#dc3545',
                            cursor: 'pointer',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            padding: '0',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            transition: 'all 0.2s',
                            lineHeight: '1'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.background = '#dc3545';
                            e.target.style.color = '#fff';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.color = '#dc3545';
                          }}
                          title="Remove tool"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  );
                })}
                {(!project.technologies || project.technologies.length === 0) && (
                  <p style={{ color: '#999', fontStyle: 'italic' }}>No tools added yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;

