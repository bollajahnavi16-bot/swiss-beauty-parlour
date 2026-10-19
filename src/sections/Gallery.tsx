import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight, Info, ImageOff } from 'lucide-react';
import { GALLERY_ITEMS, type GalleryItem, BUSINESS_CONFIG } from '../data/businessConfig';
import './Gallery.css';

export const Gallery: React.FC = () => {
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [imgLoadError, setImgLoadError] = useState<boolean>(false);

  // References to keep track of triggering button and trap focus in modal
  const triggerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  const openLightbox = (index: number) => {
    setImgLoadError(false);
    setSelectedItemIndex(index);
  };

  const closeLightbox = useCallback(() => {
    const lastIndex = selectedItemIndex;
    setSelectedItemIndex(null);
    setImgLoadError(false);
    // Restore focus to the card that opened the lightbox
    if (lastIndex !== null && triggerRefs.current[lastIndex]) {
      setTimeout(() => {
        triggerRefs.current[lastIndex]?.focus();
      }, 0);
    }
  }, [selectedItemIndex]);

  // Lock background scroll when lightbox is open
  useEffect(() => {
    if (selectedItemIndex !== null) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      // Auto-focus the close button for accessibility
      setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [selectedItemIndex]);

  const nextImage = useCallback(() => {
    if (selectedItemIndex !== null) {
      setImgLoadError(false);
      setSelectedItemIndex((selectedItemIndex + 1) % GALLERY_ITEMS.length);
    }
  }, [selectedItemIndex]);

  const prevImage = useCallback(() => {
    if (selectedItemIndex !== null) {
      setImgLoadError(false);
      setSelectedItemIndex((selectedItemIndex - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length);
    }
  }, [selectedItemIndex]);

  // Handle escape key, arrow keys, and tab focus trapping inside modal
  useEffect(() => {
    if (selectedItemIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextImage();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevImage();
        return;
      }

      // Focus trap for Tab key
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemIndex, closeLightbox, nextImage, prevImage]);

  const activeItem: GalleryItem | null =
    selectedItemIndex !== null ? GALLERY_ITEMS[selectedItemIndex] : null;

  return (
    <section id="gallery" className="section gallery-section" aria-labelledby="gallery-heading">
      <div className="container">
        {/* Section Header */}
        <div className="section-header text-center">
          <span className="eyebrow">Visual Inspiration</span>
          <h2 id="gallery-heading" className="section-title">Artistry &amp; Styling Showcase</h2>
          <div className="gold-rule center"></div>
          <p className="section-subtitle">
            Explore curated bridal looks, hair transformations, and skincare therapies for aesthetic inspiration.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="gallery-grid" role="region" aria-label="Styling demonstrations gallery">
          {GALLERY_ITEMS.map((item, index) => (
            <div
              key={item.id}
              ref={(el) => { triggerRefs.current[index] = el; }}
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
              aria-haspopup="dialog"
            >
              <span className="gallery-card-badge">Inspiration</span>
              <img
                src={item.image}
                alt={item.alt}
                className="gallery-thumb"
                loading="lazy"
                width="400"
                height="320"
                onError={(e) => {
                  // Fallback for network image issues
                  (e.currentTarget as HTMLImageElement).style.opacity = '0.6';
                }}
              />
              <div className="gallery-overlay">
                <span className="gallery-cat">{item.category}</span>
                <h3 className="gallery-item-title">{item.title}</h3>
                <div className="gallery-action-hint">
                  <Maximize2 size={16} aria-hidden="true" />
                  <span>Enlarge</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Owner Asset Transparency Notice */}
        <div className="gallery-demo-notice">
          <Info size={18} className="notice-icon" aria-hidden="true" />
          <p className="notice-text">
            <strong>Demonstration Notice:</strong> {BUSINESS_CONFIG.disclaimer.photoNotice}
          </p>
        </div>
      </div>

      {/* Accessible Full-screen Lightbox Modal */}
      {activeItem && selectedItemIndex !== null && (
        <div
          ref={modalRef}
          className="lightbox-modal lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`Image preview: ${activeItem.title}`}
          onClick={closeLightbox}
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              ref={closeBtnRef}
              type="button"
              className="lightbox-close-btn"
              onClick={closeLightbox}
              aria-label="Close image preview (Escape)"
              title="Close (Escape)"
            >
              <X size={24} aria-hidden="true" />
            </button>

            <button
              type="button"
              className="lightbox-nav-btn lightbox-prev prev-btn"
              onClick={prevImage}
              aria-label="Previous image (Left Arrow)"
              title="Previous image"
            >
              <ChevronLeft size={28} aria-hidden="true" />
            </button>

            <button
              type="button"
              className="lightbox-nav-btn lightbox-next next-btn"
              onClick={nextImage}
              aria-label="Next image (Right Arrow)"
              title="Next image"
            >
              <ChevronRight size={28} aria-hidden="true" />
            </button>

            <div className="lightbox-image-wrapper lightbox-image-container">
              {!imgLoadError ? (
                <img
                  src={activeItem.image}
                  alt={activeItem.alt}
                  className="lightbox-image lightbox-full-img"
                  onError={() => setImgLoadError(true)}
                />
              ) : (
                <div className="lightbox-fallback-frame">
                  <ImageOff size={48} className="fallback-icon" aria-hidden="true" />
                  <p className="fallback-text">Demonstration photo preview currently unavailable.</p>
                </div>
              )}
            </div>

            <div className="lightbox-caption-bar lightbox-caption">
              <div className="lightbox-caption-text">
                <span className="lightbox-cat">{activeItem.category}</span>
                <h3 className="lightbox-title">{activeItem.title}</h3>
                <span className="lightbox-inspiration-note">Styling Demonstration &amp; Inspiration</span>
              </div>
              <span className="lightbox-counter" aria-label={`Image ${selectedItemIndex + 1} of ${GALLERY_ITEMS.length}`}>
                {selectedItemIndex + 1} / {GALLERY_ITEMS.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
