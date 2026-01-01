import React from 'react';

function Contact() {
  return (
    <section id="contact" className="contact" style={{
      minHeight: '100vh',
      padding: '6rem 2rem',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div className="contact-container" style={{
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h2 className="contact-title" style={{
          fontSize: '3rem',
          marginBottom: '2rem',
          color: '#333',
          fontWeight: '700'
        }}>
          Get In Touch
        </h2>
        <p className="contact-description" style={{
          fontSize: '1.25rem',
          color: '#666',
          marginBottom: '3rem',
          lineHeight: '1.8',
          padding: '0 1rem'
        }}>
          Have a project in mind? Let's work together to bring your ideas to life.
        </p>
        <div className="contact-info" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          alignItems: 'center'
        }}>
          <a 
            href="mailto:contact@nhanstudio.com" 
            style={{
              fontSize: '1.1rem',
              color: '#007bff',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.color = '#0056b3'}
            onMouseOut={(e) => e.target.style.color = '#007bff'}
          >
            contact@nhanstudio.com
          </a>
          <div style={{
            fontSize: '1rem',
            color: '#999'
          }}>
            Available for freelance projects
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;


