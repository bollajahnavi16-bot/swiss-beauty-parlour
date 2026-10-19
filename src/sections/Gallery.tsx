import { useState, useEffect, useCallback } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { GALLERY_ITEMS, type GalleryItem, BUSINESS_CONFIG } from '../data/businessConfig';
import './Gallery.css';

export const Gallery: React.FC = () => {
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedItemIndex(index);
  };

  const closeLightbox = useCallback(() => {
    setSelectedItemIndex(null);
  }, []);

  // Synchronize body overflow with lightbox state
  useEffect(() => {
    if (selectedItemIndex !== null) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedItemIndex]);

  const nextImage = useCallback(() => {
    if (selectedItemIndex !== null) {
      setSelectedItemIndex((selectedItemIndex + 1) % GALLERY_ITEMS.length);
    }
  }, [selectedItemIndex]);

  const prevImage = useCallback(() => {
    if (selectedItemIndex !== null) {
      setSelectedItemIndex((selectedItemIndex - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length);
    }
  }, [selectedItemIndex]);

  // Handle escape key and arrow keys navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedItemIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemIndex, closeLightbox, nextImage, prevImage]);

  const activeItem: GalleryItem | null = selectedItemIndex !== null ? GALLERY_ITEMS[selectedItemIndex] : null;

  return (
    <section id="gallery" className="section gallery-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header text-center">
          <span className="eyebrow">Visual Inspiration</span>
          <h2 className="section-title">Artistry & Styling Showcase</h2>
          <div className="gold-rule center"></div>
          <p className="section-subtitle">
            Explore curated bridal looks, hair transformations, and skincare therapies for aesthetic inspiration.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="gallery-grid">
          {GALLERY_ITEMS.map((item, index) => (
            <div 
              key={item.id} 
              className="gallery-card"
              onClick={() => openLightbox(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openLightbox(index);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`View enlarged photo: ${item.title}`}
            >
              <span className="gallery-card-badge">Inspiration</span>
              <img 
                src={item.image} 
                alt={item.alt} 
                className="gallery-thumb"
                loading="lazy"
                width="400"
                height="320"
              />
              <div className="gallery-overlay">
                <span className="gallery-cat">{item.category}</span>
                <h4 className="gallery-item-title">{item.title}</h4>
                <div className="gallery-action-hint">
                  <Maximize2 size={16} />
                  <span>Enlarge</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Owner Asset Transparency Notice */}
        <div className="gallery-demo-notice">
          <Info size={16} className="notice-icon" />
          <p className="notice-text">
            <strong>Demonstration Notice:</strong> {BUSINESS_CONFIG.disclaimer.photoNotice}
          </p>
        </div>
      </div>

      {/* Accessible Full-screen Lightbox */}
      {activeItem && (
        <div 
          className="lightbox-backdrop" 
          role="dialog" 
          aria-modal="true" 
          aria-label={activeItem.title}
          onClick={closeLightbox}
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button"
              className="lightbox-close-btn"
              onClick={closeLightbox}
              aria-label="Close image preview (Escape)"
            >
              <X size={24} />
            </button>

            <button 
              type="button"
              className="lightbox-nav-btn prev-btn"
              onClick={prevImage}
              aria-label="Previous image"
            >
              <ChevronLeft size={28} />
            </button>

            <button 
              type="button"
              className="lightbox-nav-btn next-btn"
              onClick={nextImage}
              aria-label="Next image"
            >
              <ChevronRight size={28} />
            </button>

            <div className="lightbox-image-container">
              <img 
                src={activeItem.image} 
                alt={activeItem.alt} 
                className="lightbox-full-img"
              />
            </div>

            <div className="lightbox-caption">
              <div>
                <span className="lightbox-cat">{activeItem.category}</span>
                <h3 className="lightbox-title">{activeItem.title}</h3>
                <span className="lightbox-inspiration-note">Styling Demonstration & Inspiration</span>
              </div>
              <span className="lightbox-counter">
                {(selectedItemIndex ?? 0) + 1} / {GALLERY_ITEMS.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
