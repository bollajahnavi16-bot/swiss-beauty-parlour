import React from 'react';
import { Star, ShieldAlert, ExternalLink, CheckCircle } from 'lucide-react';
import { BUSINESS_CONFIG } from '../data/businessConfig';
import './TrustReviews.css';

export const TrustReviews: React.FC = () => {
  return (
    <section className="section trust-section">
      <div className="container">
        <div className="trust-card">
          <div className="trust-rating-col">
            <div className="rating-number-badge">
              <span className="rating-big">{BUSINESS_CONFIG.ratingStatus.reportedRating.toFixed(1)}</span>
              <div className="rating-stars">
                {[1, 2, 3, 4].map(star => (
                  <Star key={star} size={18} className="star-filled" fill="currentColor" />
                ))}
                <Star size={18} className="star-empty" />
              </div>
              <span className="rating-count-label">Based on {BUSINESS_CONFIG.ratingStatus.reportedReviewsCount} reported Google reviews</span>
            </div>
          </div>

          <div className="trust-info-col">
            <div className="trust-status-badge">
              <ShieldAlert size={14} className="badge-icon" />
              <span>Public Listing Information</span>
            </div>

            <h3 className="trust-title">Client Satisfaction & Local Reputation</h3>
            
            <p className="trust-desc">
              Swiss Beauty Parlour is a recognized neighbourhood beauty stop on Vijayawada Road, Patamata. 
              The business profile reports a 4.0/5 average rating based on local customer feedback.
            </p>

            <div className="trust-verification-note">
              <CheckCircle size={15} className="verify-icon" />
              <span>
                To preserve integrity, individual reviews and ratings are linked directly to verified Google search listings rather than simulated on-site.
              </span>
            </div>

            <a 
              href={BUSINESS_CONFIG.geo.googleSearchListingUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-secondary btn-review-link"
            >
              View Listing on Google Maps
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
