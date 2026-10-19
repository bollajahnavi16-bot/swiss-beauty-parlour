import { Phone, MapPin, ArrowUp } from 'lucide-react';
import { BUSINESS_CONFIG } from '../data/businessConfig';
import './Footer.css';

interface FooterProps {
  onBookClick: () => void;
}

const CURRENT_YEAR = 2026;

export const Footer: React.FC<FooterProps> = ({ onBookClick }) => {
  const currentYear = CURRENT_YEAR;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="container">
        {/* Main Footer Row */}
        <div className="footer-main-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <div className="footer-brand-header">
              <span className="footer-wordmark">SWISS</span>
              <span className="footer-brand-sub">BEAUTY PARLOUR</span>
            </div>
            <p className="footer-description">
              Dedicated women's beauty & grooming destination in Patamata, Vijayawada. Experience personalized hair care, skin radiance, and occasion artistry.
            </p>
            <div className="footer-phone-cta">
              <span className="footer-phone-label">Direct Contact:</span>
              <a href={`tel:${BUSINESS_CONFIG.contact.phoneRaw}`} className="footer-phone-val">
                <Phone size={14} className="f-icon" />
                {BUSINESS_CONFIG.contact.phoneDisplay}
              </a>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="footer-col">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#services">Services Catalogue</a></li>
              <li><a href="#about">About The Parlour</a></li>
              <li><a href="#gallery">Artistry Gallery</a></li>
              <li><a href="#contact">Contact & Location</a></li>
            </ul>
          </div>

          {/* Services Column */}
          <div className="footer-col">
            <h4 className="footer-heading">Care Categories</h4>
            <ul className="footer-links">
              <li><a href="#services">Hair Care & Therapy</a></li>
              <li><a href="#services">Facials & Polishing</a></li>
              <li><a href="#services">Bridal & Party Artistry</a></li>
              <li><a href="#services">Saree Draping</a></li>
              <li><a href="#services">Everyday Grooming</a></li>
            </ul>
          </div>

          {/* Location Column & Action */}
          <div className="footer-col">
            <h4 className="footer-heading">Parlour Location</h4>
            <div className="footer-loc-info">
              <MapPin size={16} className="f-icon-loc" />
              <p className="footer-address-text">
                {BUSINESS_CONFIG.address.full}
              </p>
            </div>
            <button 
              type="button" 
              className="btn btn-primary footer-book-btn"
              onClick={onBookClick}
            >
              Book an Appointment
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="copyright-text">
            © {currentYear} {BUSINESS_CONFIG.name}. All rights reserved.
          </p>

          <div className="footer-bottom-middle">
            <span>Crafted for Elegance & Genuine Client Care</span>
            <span style={{ margin: '0 0.5rem', opacity: 0.5 }}>•</span>
            <a href="/login" className="footer-owner-link" title="Unified Client & Management Portal">
              Portal Sign In
            </a>
          </div>

          <button 
            type="button" 
            className="scroll-top-btn" 
            onClick={scrollToTop}
            aria-label="Scroll back to top of page"
          >
            <span>Top</span>
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
};
