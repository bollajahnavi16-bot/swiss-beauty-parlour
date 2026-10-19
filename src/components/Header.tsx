import React, { useState } from 'react';
import { Phone, MapPin, Sparkles, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BUSINESS_CONFIG } from '../data/businessConfig';
import './Header.css';

interface HeaderProps {
  onBookClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onBookClick }) => {
  const { user, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="site-header">
      {/* Top Announcement & Quick Contact Strip */}
      <div className="top-strip">
        <div className="container top-strip-inner">
          <div className="strip-info">
            <span className="strip-location">
              <MapPin size={12} className="strip-icon" />
              Patamata, Vijayawada, AP
            </span>
            <span className="strip-divider">|</span>
            <a 
              href={`tel:${BUSINESS_CONFIG.contact.phoneRaw}`} 
              className="strip-link" 
              title="Call parlour"
              aria-label={`Call Swiss Beauty Parlour at ${BUSINESS_CONFIG.contact.phoneDisplay}`}
            >
              <Phone size={12} className="strip-icon" />
              {BUSINESS_CONFIG.contact.phoneDisplay}
            </a>
          </div>
          <div className="strip-badge">
            <Sparkles size={12} className="strip-icon" />
            <span>Ladies Beauty & Self-Care Destination</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="main-nav" aria-label="Main Navigation">
        <div className="container nav-container">
          <a href="#home" className="brand-logo" onClick={closeMenu}>
            <span className="brand-wordmark">SWISS</span>
            <span className="brand-sub">BEAUTY PARLOUR</span>
          </a>

          {/* Desktop Navigation Links */}
          <div className="nav-links desktop-only">
            <a href="#home" className="nav-link">Home</a>
            <a href="#services" className="nav-link">Services</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#gallery" className="nav-link">Gallery</a>
            <a href="#contact" className="nav-link">Contact</a>
            {user ? (
              <a
                href={role === 'admin' ? '/admin' : '/customer'}
                className="nav-link"
                style={{ fontWeight: 600, color: 'var(--color-primary)' }}
              >
                <UserIcon size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                {role === 'admin' ? 'Admin Atelier' : 'My Account'}
              </a>
            ) : (
              <a href="/login" className="nav-link" style={{ fontWeight: 600 }}>
                Sign In
              </a>
            )}
          </div>

          {/* Header Action Button */}
          <div className="header-actions desktop-only">
            <button 
              type="button"
              className="btn btn-primary btn-sm" 
              onClick={onBookClick}
              id="header-book-btn"
            >
              Book Appointment
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            type="button"
            className="mobile-toggle"
            onClick={toggleMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu-drawer"
            aria-label="Toggle navigation menu"
          >
            <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <div 
          id="mobile-menu-drawer"
          className={`mobile-drawer ${mobileMenuOpen ? 'drawer-open' : ''}`}
          aria-hidden={!mobileMenuOpen}
        >
          <div className="mobile-drawer-content">
            <a href="#home" className="mobile-nav-link" onClick={closeMenu}>Home</a>
            <a href="#services" className="mobile-nav-link" onClick={closeMenu}>Services</a>
            <a href="#about" className="mobile-nav-link" onClick={closeMenu}>About The Parlour</a>
            <a href="#gallery" className="mobile-nav-link" onClick={closeMenu}>Gallery Showcase</a>
            <a href="#contact" className="mobile-nav-link" onClick={closeMenu}>Contact & Location</a>
            {user ? (
              <a
                href={role === 'admin' ? '/admin' : '/customer'}
                className="mobile-nav-link"
                onClick={closeMenu}
                style={{ color: 'var(--color-primary)', fontWeight: 600 }}
              >
                {role === 'admin' ? 'Admin Atelier' : 'My Account'}
              </a>
            ) : (
              <a href="/login" className="mobile-nav-link" onClick={closeMenu}>
                Sign In / Register
              </a>
            )}
            
            <div className="mobile-drawer-cta">
              <button 
                type="button"
                className="btn btn-primary" 
                style={{ width: '100%' }}
                onClick={() => {
                  closeMenu();
                  onBookClick();
                }}
              >
                Book Appointment
              </button>
              
              <a 
                href={`tel:${BUSINESS_CONFIG.contact.phoneRaw}`} 
                className="btn btn-secondary" 
                style={{ width: '100%', marginTop: '0.75rem' }}
              >
                <Phone size={15} />
                Call Salon
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
