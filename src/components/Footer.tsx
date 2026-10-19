import { useState, useEffect } from 'react';
import { Phone, MapPin, ArrowUp, ShieldCheck, X } from 'lucide-react';
import { BUSINESS_CONFIG } from '../data/businessConfig';
import './Footer.css';

interface FooterProps {
  onBookClick: () => void;
}

const CURRENT_YEAR = 2026;

export const Footer: React.FC<FooterProps> = ({ onBookClick }) => {
  const currentYear = CURRENT_YEAR;
  const [showPrivacy, setShowPrivacy] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close modal on Escape
  useEffect(() => {
    if (!showPrivacy) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowPrivacy(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPrivacy]);

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
            <span>Client Care & Quality Services</span>
            <span style={{ margin: '0 0.5rem', opacity: 0.5 }}>•</span>
            <button
              type="button"
              className="footer-privacy-btn"
              onClick={() => setShowPrivacy(true)}
              aria-haspopup="dialog"
            >
              Privacy Notice
            </button>
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

      {/* Privacy Notice Modal */}
      {showPrivacy && (
        <div 
          className="privacy-modal-backdrop" 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="privacy-modal-title"
          onClick={() => setShowPrivacy(false)}
        >
          <div 
            className="privacy-modal-content" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="privacy-modal-header">
              <div className="privacy-title-wrap">
                <ShieldCheck size={20} className="privacy-modal-icon" aria-hidden="true" />
                <h3 id="privacy-modal-title" className="privacy-modal-title">Client Privacy Notice</h3>
              </div>
              <button 
                type="button" 
                className="privacy-close-btn" 
                onClick={() => setShowPrivacy(false)}
                aria-label="Close Privacy Notice"
              >
                <X size={18} />
              </button>
            </div>

            <div className="privacy-modal-body">
              <p className="privacy-intro">
                At <strong>{BUSINESS_CONFIG.name}</strong>, we respect your personal privacy and are committed to protecting the information you share with us.
              </p>

              <div className="privacy-section">
                <h4>1. Information We Collect</h4>
                <p>
                  When you request an appointment, we collect basic details including your name, contact phone number, preferred service, date, time, and optional styling notes.
                </p>
              </div>

              <div className="privacy-section">
                <h4>2. Purpose of Use</h4>
                <p>
                  Your details are used strictly to coordinate your beauty service appointments, confirm slot availability, and communicate relevant parlour scheduling updates.
                </p>
              </div>

              <div className="privacy-section">
                <h4>3. Direct WhatsApp & Salon Communication</h4>
                <p>
                  Appointment requests submitted via our website connect directly with our salon team on WhatsApp (+91 98660 55165). We do not send marketing spam or promotional broadcasts without consent.
                </p>
              </div>

              <div className="privacy-section">
                <h4>4. Zero Third-Party Sharing</h4>
                <p>
                  We do not sell, rent, trade, or share your personal contact details with third-party advertisers or external data brokers under any circumstances.
                </p>
              </div>

              <div className="privacy-section">
                <h4>5. Contact & Questions</h4>
                <p>
                  If you have questions about your information or wish to modify or delete your booking history, please reach out to us at <strong>{BUSINESS_CONFIG.contact.phoneDisplay}</strong> or visit our salon at <strong>{BUSINESS_CONFIG.address.full}</strong>.
                </p>
              </div>
            </div>

            <div className="privacy-modal-footer">
              <button 
                type="button" 
                className="btn btn-primary privacy-done-btn"
                onClick={() => setShowPrivacy(false)}
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
