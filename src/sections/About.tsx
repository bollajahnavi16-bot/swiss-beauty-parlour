import { Heart, MapPin, CheckCircle2 } from 'lucide-react';
import { BUSINESS_CONFIG } from '../data/businessConfig';
import './About.css';

export const About: React.FC = () => {
  return (
    <section id="about" className="section about-section">
      <div className="container">
        <div className="about-grid">
          {/* Left Column: Visual Collage */}
          <div className="about-visual-column">
            <div className="about-visual-frame-wrapper">
              <div className="about-frame-accent-border"></div>
              <div className="about-image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop" 
                  alt="Swiss Beauty Parlour luxury salon interior atmosphere"
                  className="about-primary-image"
                  loading="lazy"
                  width="480"
                  height="600"
                />
                <div className="about-badge-card">
                  <Heart size={20} className="about-heart-icon" />
                  <span className="about-badge-text">Dedicated to Ladies Self-Care & Artistry</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Salon Philosophy */}
          <div className="about-content-column">
            <span className="eyebrow">Our Philosophy</span>
            <h2 className="about-title">A Welcoming Haven for Personal Care</h2>
            <div className="gold-rule"></div>

            <p className="about-lead">
              At Swiss Beauty Parlour, located on Vijayawada Road in Patamata, we believe beauty care should feel thoughtful, relaxing, and true to who you are.
            </p>

            <p className="about-body">
              Whether you are preparing for a wedding milestone, seeking restorative hair therapy, maintaining your regular grooming ritual, or refreshing your glow with a radiance facial, our goal is to deliver an attentive and comfortable experience in a hygienic environment.
            </p>

            {/* Core Values */}
            <div className="about-values-list">
              <div className="value-item">
                <CheckCircle2 size={18} className="value-icon" />
                <div>
                  <h4 className="value-title">Personalized Consultations</h4>
                  <p className="value-desc">Every treatment begins with understanding your skin type, hair needs, and personal styling preferences.</p>
                </div>
              </div>

              <div className="value-item">
                <CheckCircle2 size={18} className="value-icon" />
                <div>
                  <h4 className="value-title">Hygienic & Gentle Standards</h4>
                  <p className="value-desc">Sanitized equipment, clean practice, and gentle products chosen to protect and pamper your skin.</p>
                </div>
              </div>

              <div className="value-item">
                <CheckCircle2 size={18} className="value-icon" />
                <div>
                  <h4 className="value-title">Convenient Patamata Location</h4>
                  <p className="value-desc">Easily accessible on Vijayawada Road, JD Nagar with prompt WhatsApp and phone appointment scheduling.</p>
                </div>
              </div>
            </div>

            {/* Address Banner */}
            <div className="about-location-pill">
              <MapPin size={16} className="loc-icon" />
              <span>{BUSINESS_CONFIG.address.full}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
