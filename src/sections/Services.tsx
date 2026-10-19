import { useState } from 'react';
import { Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { SERVICES_CATALOGUE, SERVICE_CATEGORIES, type ServiceItem, BUSINESS_CONFIG } from '../data/businessConfig';
import './Services.css';

interface ServicesProps {
  onSelectService: (serviceName: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ onSelectService }) => {
  const [activeCategory, setActiveCategory] = useState<string>("All Services");

  const filteredServices = activeCategory === "All Services"
    ? SERVICES_CATALOGUE
    : SERVICES_CATALOGUE.filter(s => s.category === activeCategory);

  return (
    <section id="services" className="section services-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header text-center">
          <span className="eyebrow">Curated Menu of Care</span>
          <h2 className="section-title">Refined Beauty Services</h2>
          <div className="gold-rule center"></div>
          <p className="section-subtitle">
            Every service is tailored to enhance your natural beauty with precision techniques, premium care, and dedicated attention.
          </p>
        </div>

        {/* Category Filters */}
        <div className="category-filters" role="tablist" aria-label="Service Categories">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeCategory === cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="services-grid">
          {filteredServices.map((service: ServiceItem) => (
            <article key={service.id} className="service-card">
              <div className="service-image-container">
                <img 
                  src={service.image} 
                  alt={service.name} 
                  className="service-image" 
                  loading="lazy" 
                  width="400"
                  height="260"
                />
                {service.badge && (
                  <span className="service-badge">{service.badge}</span>
                )}
              </div>

              <div className="service-body">
                <div className="service-cat-tag">{service.category}</div>
                <h3 className="service-name">{service.name}</h3>
                <p className="service-desc">{service.description}</p>

                <div className="service-meta-row">
                  {service.durationNote && (
                    <span className="service-meta-item">
                      <Clock size={14} className="meta-icon" />
                      {service.durationNote}
                    </span>
                  )}
                  <span className="service-meta-item price-badge">
                    {service.startingPrice
                      ? `Starting from ₹${service.startingPrice.toLocaleString('en-IN')}`
                      : service.priceRange
                      ? service.priceRange
                      : service.priceNote || 'Contact for pricing'}
                  </span>
                </div>

                <div className="service-card-action">
                  <button
                    type="button"
                    className="btn btn-secondary btn-service-book"
                    onClick={() => onSelectService(service.name)}
                    aria-label={`Book ${service.name}`}
                  >
                    <span>Book This Service</span>
                    <ArrowRight size={14} className="service-cta-arrow" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pricing & Customization Transparency Note */}
        <div className="pricing-disclaimer-box">
          <CheckCircle size={18} className="disclaimer-icon" />
          <p className="disclaimer-text">
            <strong>Owner Note on Pricing & Packages:</strong> {BUSINESS_CONFIG.disclaimer.pricingNotice}
          </p>
        </div>
      </div>
    </section>
  );
};
