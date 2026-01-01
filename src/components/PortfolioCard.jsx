import React from 'react';
import { useNavigate } from 'react-router-dom';

function PortfolioCard({ id, title, description, image, date, creatorName, onEdit, onDelete }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/project/${id}`);
  };

  const handleEditClick = (e) => {
    e.stopPropagation(); // Prevent navigation when clicking edit button
    if (onEdit) {
      onEdit({ id, title, description, image, date });
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent navigation when clicking delete button
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div 
      className="portfolio-card" 
      onClick={handleClick} 
      style={{ cursor: 'pointer', position: 'relative' }}
    >
      {(onEdit || onDelete) && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 10,
          display: 'flex',
          gap: '8px'
        }}>
          {onEdit && (
            <button
              onClick={handleEditClick}
              style={{
                padding: '8px 16px',
                background: 'rgba(0, 123, 255, 0.9)',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background 0.3s',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(0, 86, 179, 0.9)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(0, 123, 255, 0.9)'}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDeleteClick}
              style={{
                padding: '8px 16px',
                background: 'rgba(220, 53, 69, 0.9)',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background 0.3s',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(200, 35, 51, 0.9)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(220, 53, 69, 0.9)'}
            >
              Delete
            </button>
          )}
        </div>
      )}
      <div className="portfolio-card-image">
        <img src={image} alt={title} />
      </div>
      <div className="portfolio-card-content">
        <h3 className="portfolio-card-title">{title}</h3>
        {date && (
          <p className="portfolio-card-date" style={{ fontSize: '12px', color: '#999', marginBottom: '8px', fontStyle: 'italic' }}>
            {date}
          </p>
        )}
        <p className="portfolio-card-description">{description}</p>
        {creatorName && (
          <div style={{
            marginTop: 'auto',
            paddingTop: '12px',
            borderTop: '1px solid #eee',
            fontSize: '12px',
            color: '#999',
            fontWeight: '500'
          }}>
            By {creatorName}
          </div>
        )}
      </div>
    </div>
  );
}

export default PortfolioCard;

