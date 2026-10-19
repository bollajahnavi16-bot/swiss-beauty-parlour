import React from 'react';
import { MapPin, Phone, MessageSquare, Navigation, ExternalLink, Clock } from 'lucide-react';
import { BUSINESS_CONFIG } from '../data/businessConfig';
import './ContactLocation.css';

export const ContactLocation: React.FC = () => {
  return (
    <section id="contact" className="section contact-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header text-center">
          <span className="eyebrow">Visit & Connect</span>
          <h2 className="section-title">Location & Contact</h2>
          <div className="gold-rule center"></div>
          <p className="section-subtitle">
            Easily accessible in Patamata, Vijayawada. Stop by for personal care or get in touch ahead of time.
          </p>
        </div>

        <div className="contact-grid">
          {/* Contact Details Card */}
          <div className="contact-info-card">
            <h3 className="contact-card-title">Swiss Beauty Parlour</h3>

            <div className="contact-details-list">
              {/* Address */}
              <div className="contact-detail-item">
                <div className="detail-icon-circle">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="detail-label">Address</h4>
                  <p className="detail-text">{BUSINESS_CONFIG.address.line1}</p>
                  <p className="detail-text">{BUSINESS_CONFIG.address.line2}</p>
                  <p className="detail-text">{BUSINESS_CONFIG.address.city}, {BUSINESS_CONFIG.address.state} — {BUSINESS_CONFIG.address.pincode}</p>
                  <p className="detail-subtext">Plus Code: {BUSINESS_CONFIG.geo.googlePlusCode}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="contact-detail-item">
                <div className="detail-icon-circle">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="detail-label">Phone Enquiries</h4>
                  <p className="detail-text">
                    <a href={`tel:${BUSINESS_CONFIG.contact.phoneRaw}`} className="contact-link">
                      {BUSINESS_CONFIG.contact.phoneDisplay}
                    </a>
                  </p>
                  <p className="detail-subtext">Direct line for booking updates</p>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="contact-detail-item">
                <div className="detail-icon-circle">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h4 className="detail-label">Instant WhatsApp</h4>
                  <p className="detail-text">
                    <a 
                      href={`https://wa.me/${BUSINESS_CONFIG.contact.whatsappRaw}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="contact-link"
                    >
                      Chat on WhatsApp (+91 63033 38549)
                    </a>
                  </p>
                  <p className="detail-subtext">Quick service enquiries and questions</p>
                </div>
              </div>

              {/* Opening Note */}
              <div className="contact-detail-item">
                <div className="detail-icon-circle">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="detail-label">Operating Schedule</h4>
                  <p className="detail-text">Tuesday through Sunday</p>
                  <p className="detail-subtext">Please call ahead or book via WhatsApp to reserve your slot.</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="contact-action-buttons">
              <a 
                href={BUSINESS_CONFIG.geo.googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                id="get-directions-btn"
              >
                <Navigation size={16} />
                Get Driving Directions
              </a>

              <a 
                href={`tel:${BUSINESS_CONFIG.contact.phoneRaw}`}
                className="btn btn-secondary"
              >
                <Phone size={16} />
                Call Salon
              </a>
            </div>
          </div>

          {/* Interactive Google Map Embed */}
          <div className="contact-map-card">
            <div className="map-top-bar">
              <div className="map-top-title">
                <MapPin size={16} className="map-pin-icon" />
                <span>Vijayawada Road, JD Nagar, Patamata</span>
              </div>
              <a 
                href={BUSINESS_CONFIG.geo.googleMapsDirectionsUrl}
                target="_blank" 
                rel="noopener noreferrer" 
                className="map-directions-badge"
                title="Get driving directions in Google Maps"
              >
                <Navigation size={12} />
                <span>Directions</span>
              </a>
            </div>

            <div className="map-frame-wrapper">
              <iframe
                title="Swiss Beauty Parlour Location on Google Maps"
                src={BUSINESS_CONFIG.geo.embedMapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <div className="map-caption-bar">
              <span>Plus Code: <strong>{BUSINESS_CONFIG.geo.googlePlusCode}</strong></span>
              <a 
                href={BUSINESS_CONFIG.geo.googleSearchListingUrl}
                target="_blank" 
                rel="noopener noreferrer" 
                className="map-open-link"
                title="Open larger map in Google Maps"
              >
                Open Google Maps <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
