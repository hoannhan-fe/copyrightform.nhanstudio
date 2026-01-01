import React, { useState, useEffect } from 'react';

/**
 * Hero Component with Auto-Slideshow
 * 
 * How the slideshow works:
 * 1. Maintains current image index in state (currentIndex)
 * 2. Array of image URLs (heroImages) - using placeholder images
 * 3. useEffect sets up setInterval to change index every 5 seconds
 * 4. When currentIndex changes, CSS opacity transition creates fade effect
 * 5. Images are absolutely positioned and layered
 * 6. Only the current image has opacity: 1, others have opacity: 0
 * 7. Cleanup function clears interval on unmount to prevent memory leaks
 */

// Photography-themed hero images - Photographer focused
const heroImages = [
  'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1920&q=80', // Camera lens with reflection
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1920&q=80', // Photographer holding camera
  'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1920&q=80', // Professional camera close-up
  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1920&q=80', // Photographer in action
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&q=80', // Photographer with camera
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80'  // Portrait photographer
];

function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Set up interval to change image every 5 seconds (5000ms)
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        // Move to next image, loop back to 0 when reaching the end
        return (prevIndex + 1) % heroImages.length;
      });
    }, 5000);

    // Cleanup: clear interval when component unmounts
    return () => clearInterval(interval);
  }, []); // Empty dependency array means this effect runs once on mount

  // Smooth scroll to portfolio section
  const handleViewPortfolio = (e) => {
    e.preventDefault();
    const element = document.getElementById('portfolio');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="hero">
      {/* Slideshow container */}
      <div className="hero-slideshow">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`hero-slide ${index === currentIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
      </div>

      {/* Hero content overlay */}
      <div className="hero-content">
        <h1 className="hero-title">Moments That Stay — Photography by Nhan</h1>
        <p className="hero-subtitle">
        A personal photography and storytelling space — where images and words meet.
        </p>
        <button className="hero-button" onClick={handleViewPortfolio}>
          View Portfolio
        </button>
      </div>
    </section>
  );
}

export default Hero;

