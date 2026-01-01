import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Header Component
 * 
 * Desktop: Transparent header with navigation links (like original)
 * Mobile/Tablet: Hamburger menu with sidebar
 */
function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    // Check if mobile on resize
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMenuOpen(false); // Close menu when switching to desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Scroll effect for desktop header
    if (!isMobile) {
      const handleScroll = () => {
        const scrollPosition = window.scrollY;
        setScrolled(scrollPosition > 50);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isMobile]);

  useEffect(() => {
    // Close menu when route changes
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    // Close menu when clicking outside (mobile only)
    if (!isMobile) return;

    const handleClickOutside = (e) => {
      if (isMenuOpen && !e.target.closest('.sidebar') && !e.target.closest('.menu-toggle')) {
        setIsMenuOpen(false);
      }
    };

    // Prevent body scroll when menu is open
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen, isMobile]);

  // Handle navigation with scroll to section
  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    if (isMobile) {
      setIsMenuOpen(false);
    }
    
    // If not on home page, navigate to home first
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // Already on home page, just scroll to section
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Desktop Header - Transparent with navigation */}
      {!isMobile && (
        <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
          <div className="header-container">
            <div className={`logo ${scrolled ? 'logo-scrolled' : ''}`} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
              NHAN STUDIO
            </div>
            <nav className="nav">
              <a 
                href="#home" 
                onClick={(e) => handleNavClick(e, 'home')}
                className={scrolled ? 'nav-link-scrolled' : ''}
              >
                Home
              </a>
              <a 
                href="#portfolio" 
                onClick={(e) => handleNavClick(e, 'portfolio')}
                className={scrolled ? 'nav-link-scrolled' : ''}
              >
                Portfolio
              </a>
              {isAuthenticated ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: '15px' }}>
                  {/* Avatar */}
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: user?.avatar 
                        ? `url(${user.avatar}) center/cover`
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: '2px solid white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                    }}
                    title={`${user?.firstName} ${user?.lastName}`}
                  >
                    {!user?.avatar && (
                      <span>
                        {user?.firstName?.[0]?.toUpperCase() || ''}{user?.lastName?.[0]?.toUpperCase() || ''}
                      </span>
                    )}
                  </div>
                  
                  {/* User Name */}
                  <span 
                    className={scrolled ? 'nav-link-scrolled' : ''} 
                    style={{ 
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: scrolled ? '#333' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      textShadow: scrolled ? 'none' : '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.color = scrolled ? '#667eea' : '#ffd700';
                      e.target.style.textShadow = scrolled ? 'none' : '0 2px 4px rgba(255,215,0,0.5)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.color = scrolled ? '#333' : '#fff';
                      e.target.style.textShadow = scrolled ? 'none' : '0 1px 2px rgba(0,0,0,0.1)';
                    }}
                  >
                    {user?.firstName} {user?.lastName}
                  </span>
                  
                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className={scrolled ? 'nav-button-scrolled' : 'nav-button'}
                    style={{
                      padding: '8px 20px',
                      background: scrolled ? '#333' : 'transparent',
                      border: scrolled ? '1px solid #333' : '1px solid white',
                      color: scrolled ? '#fff' : 'white',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      transition: 'all 0.3s',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseOver={(e) => {
                      if (scrolled) {
                        e.target.style.background = '#dc3545';
                        e.target.style.borderColor = '#dc3545';
                      } else {
                        e.target.style.background = '#dc3545';
                        e.target.style.borderColor = '#dc3545';
                        e.target.style.color = 'white';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (scrolled) {
                        e.target.style.background = '#333';
                        e.target.style.borderColor = '#333';
                      } else {
                        e.target.style.background = 'transparent';
                        e.target.style.borderColor = 'white';
                        e.target.style.color = 'white';
                      }
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className={scrolled ? 'nav-button-scrolled' : 'nav-button'}
                  style={{
                    padding: '8px 20px',
                    background: scrolled ? '#333' : 'transparent',
                    border: scrolled ? '1px solid #333' : '1px solid white',
                    color: scrolled ? '#fff' : 'white',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginLeft: '15px',
                    transition: 'all 0.3s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseOver={(e) => {
                    if (scrolled) {
                      e.target.style.background = '#555';
                    } else {
                      e.target.style.background = 'white';
                      e.target.style.color = '#333';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (scrolled) {
                      e.target.style.background = '#333';
                      e.target.style.color = '#fff';
                    } else {
                      e.target.style.background = 'transparent';
                      e.target.style.color = 'white';
                    }
                  }}
                >
                  Login / Register
                </button>
              )}
            </nav>
          </div>
        </header>
      )}

      {/* Mobile/Tablet: Hamburger Menu Button */}
      {isMobile && (
        <>
          <button
            className="menu-toggle"
            onClick={toggleMenu}
            style={{
              position: 'fixed',
              top: '20px',
              left: '20px',
              zIndex: 1001,
              background: 'rgba(0, 0, 0, 0.7)',
              border: 'none',
              borderRadius: '5px',
              width: '50px',
              height: '50px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              padding: '10px'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.9)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.7)'}
          >
            <span
              style={{
                width: '25px',
                height: '3px',
                background: 'white',
                borderRadius: '2px',
                transition: 'all 0.3s',
                transform: isMenuOpen ? 'rotate(45deg) translate(8px, 8px)' : 'none'
              }}
            />
            <span
              style={{
                width: '25px',
                height: '3px',
                background: 'white',
                borderRadius: '2px',
                transition: 'all 0.3s',
                opacity: isMenuOpen ? 0 : 1
              }}
            />
            <span
              style={{
                width: '25px',
                height: '3px',
                background: 'white',
                borderRadius: '2px',
                transition: 'all 0.3s',
                transform: isMenuOpen ? 'rotate(-45deg) translate(7px, -7px)' : 'none'
              }}
            />
          </button>

          {/* Sidebar Overlay */}
          {isMenuOpen && (
            <div
              className="sidebar-overlay"
              onClick={() => setIsMenuOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 999,
                animation: 'fadeIn 0.3s ease'
              }}
            />
          )}

          {/* Sidebar Menu */}
          <aside
            className={`sidebar ${isMenuOpen ? 'sidebar-open' : ''}`}
            style={{
              position: 'fixed',
              top: 0,
              left: isMenuOpen ? 0 : '-300px',
              width: '300px',
              height: '100vh',
              background: 'white',
              zIndex: 1000,
              transition: 'left 0.3s ease',
              boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
              overflowY: 'auto',
              padding: '80px 0 20px'
            }}
          >
            <div className="sidebar-content" style={{ padding: '0 20px' }}>
              {/* Logo */}
              <div
                className="sidebar-logo"
                onClick={() => {
                  navigate('/');
                  setIsMenuOpen(false);
                }}
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '2rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  paddingBottom: '1rem',
                  borderBottom: '2px solid #eee'
                }}
              >
                NHAN STUDIO
              </div>

              {/* Navigation Links */}
              <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <a
                  href="#home"
                  onClick={(e) => handleNavClick(e, 'home')}
                  style={{
                    padding: '15px 20px',
                    color: '#333',
                    textDecoration: 'none',
                    fontSize: '1.1rem',
                    fontWeight: '500',
                    borderRadius: '5px',
                    transition: 'all 0.3s',
                    display: 'block'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#f5f5f5';
                    e.target.style.color = '#007bff';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#333';
                  }}
                >
                  Home
                </a>
                <a
                  href="#portfolio"
                  onClick={(e) => handleNavClick(e, 'portfolio')}
                  style={{
                    padding: '15px 20px',
                    color: '#333',
                    textDecoration: 'none',
                    fontSize: '1.1rem',
                    fontWeight: '500',
                    borderRadius: '5px',
                    transition: 'all 0.3s',
                    display: 'block'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#f5f5f5';
                    e.target.style.color = '#007bff';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#333';
                  }}
                >
                  Portfolio
                </a>
                {isAuthenticated ? (
                  <>
                    {/* User Info with Avatar */}
                    <div style={{
                      padding: '20px',
                      marginTop: '1rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '10px',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      {/* Avatar */}
                      <div
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          background: user?.avatar 
                            ? `url(${user.avatar}) center/cover`
                            : 'rgba(255,255,255,0.3)',
                          border: '3px solid white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '24px',
                          fontWeight: 'bold',
                          flexShrink: 0,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                      >
                        {!user?.avatar && (
                          <span>
                            {user?.firstName?.[0]?.toUpperCase() || ''}{user?.lastName?.[0]?.toUpperCase() || ''}
                          </span>
                        )}
                      </div>
                      
                      {/* User Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontSize: '0.85rem', 
                          color: 'rgba(255,255,255,0.8)', 
                          marginBottom: '5px' 
                        }}>
                          Logged in as:
                        </div>
                        <div 
                          style={{ 
                            fontSize: '1.1rem', 
                            fontWeight: 'bold', 
                            color: '#fff',
                            marginBottom: '3px',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.color = '#ffd700';
                            e.target.style.textShadow = '0 2px 4px rgba(255,215,0,0.5)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.color = '#fff';
                            e.target.style.textShadow = 'none';
                          }}
                        >
                          {user?.firstName} {user?.lastName}
                        </div>
                        <div style={{ 
                          fontSize: '0.8rem', 
                          color: 'rgba(255,255,255,0.7)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {user?.email}
                        </div>
                      </div>
                    </div>
                    
                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                        navigate('/');
                      }}
                      style={{
                        marginTop: '1rem',
                        padding: '15px 20px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        width: '100%',
                        boxShadow: '0 2px 8px rgba(220,53,69,0.3)'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = '#c82333';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(220,53,69,0.4)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = '#dc3545';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 8px rgba(220,53,69,0.3)';
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      navigate('/login');
                      setIsMenuOpen(false);
                    }}
                    style={{
                      marginTop: '1rem',
                      padding: '15px 20px',
                      background: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      width: '100%'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#0056b3'}
                    onMouseOut={(e) => e.target.style.background = '#007bff'}
                  >
                    Login / Register
                  </button>
                )}
              </nav>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

export default Header;

