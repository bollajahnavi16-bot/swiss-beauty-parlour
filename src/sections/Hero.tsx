import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import './Hero.css';

interface HeroProps {
  onBookClick: () => void;
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBookClick, onExploreClick }) => {
  return (
    <section id="home" className="editorial-hero-section">
      <div className="container hero-container">
        <div className="hero-asymmetric-grid">
          
          {/* 1. Large Ivory Brand Panel (Upper Left) */}
          <div className="hero-brand-panel">
            <div className="hero-brand-header">
              <div className="brand-monogram-lockup">
                <span className="brand-wordmark-title">SWISS</span>
                <span className="brand-wordmark-subtitle">BEAUTY PARLOUR</span>
              </div>
              <div className="hero-atelier-pill">
                <Sparkles size={11} className="atelier-icon" />
                <span>ATELIER • PATAMATA</span>
              </div>
            </div>

            <div className="hero-brand-main">
              <span className="hero-eyebrow-text">LADIES CARE & BESPOKE ARTISTRY</span>
              <h1 className="hero-headline">
                Beauty, in <br />
                <span className="headline-emphasis">Your Own Light.</span>
              </h1>
              <p className="hero-subtext">
                Thoughtful beauty services and personalised care in Patamata, Vijayawada.
              </p>

              <div className="hero-cta-group">
                <button
                  type="button"
                  className="btn btn-primary hero-primary-btn"
                  onClick={onBookClick}
                  id="hero-book-btn"
                >
                  <span>BOOK AN APPOINTMENT</span>
                  <ArrowRight size={15} />
                </button>

                <button
                  type="button"
                  className="hero-secondary-link"
                  onClick={onExploreClick}
                  id="hero-explore-btn"
                >
                  <span>EXPLORE SERVICES</span>
                  <span className="link-hover-line"></span>
                </button>
              </div>
            </div>

            <div className="hero-brand-footer">
              <div className="brand-footer-item">
                <span className="meta-caption">LOCATION</span>
                <span className="meta-text">Vijayawada Road, Patamata</span>
              </div>
              <div className="brand-footer-separator"></div>
              <div className="brand-footer-item">
                <span className="meta-caption">REPUTATION</span>
                <span className="meta-text">4.0 Verified Local Rating</span>
              </div>
            </div>
          </div>

          {/* 2. Large Vertical Beauty Portrait (Spanning Right Column) */}
          <div className="hero-vertical-panel">
            <div className="vertical-image-box">
              <img
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop"
                alt="Swiss Beauty Parlour bespoke beauty styling and radiant hair portrait"
                className="vertical-hero-img"
                width="800"
                height="1100"
                loading="eager"
              />
              <div className="image-vignette-overlay"></div>

              {/* Minimal floating labels */}
              <div className="floating-editorial-label label-top-right">
                <span className="label-code">01</span>
                <span className="label-title">BESPOKE RADIANCE</span>
              </div>

              <div className="floating-editorial-caption">
                <span className="caption-tag">ARTISTRY & CARE</span>
                <span className="caption-text">Tailored to your authentic light</span>
              </div>
            </div>
          </div>

          {/* 3. Supporting Image Panel 1: Skincare & Facial Details */}
          <div className="hero-support-panel support-panel-one">
            <div className="support-image-box">
              <img
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=900&auto=format&fit=crop"
                alt="Swiss Beauty Parlour revitalizing facial skincare treatment"
                className="support-hero-img"
                width="600"
                height="450"
                loading="eager"
              />
              <div className="image-vignette-overlay"></div>
              <div className="floating-editorial-label label-bottom-left">
                <span className="label-code">02</span>
                <span className="label-title">SKIN THERAPY & FACIALS</span>
              </div>
            </div>
          </div>

          {/* 4. Supporting Image Panel 2: Occasion & Hair Artistry */}
          <div className="hero-support-panel support-panel-two">
            <div className="support-image-box">
              <img
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=900&auto=format&fit=crop"
                alt="Swiss Beauty Parlour elegant hair styling and occasion artistry"
                className="support-hero-img"
                width="600"
                height="450"
                loading="eager"
              />
              <div className="image-vignette-overlay"></div>
              <div className="floating-editorial-label label-bottom-left">
                <span className="label-code">03</span>
                <span className="label-title">OCCASION & HAIR ARTISTRY</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
