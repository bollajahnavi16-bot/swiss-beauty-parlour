import React from 'react';
import { MessageSquare, Phone } from 'lucide-react';
import { BUSINESS_CONFIG } from '../data/businessConfig';
import './FloatingContact.css';

export const FloatingContact: React.FC = () => {
  return (
    <div className="floating-actions-container" aria-label="Quick Contact Actions">
      {/* Quick Phone Call Button */}
      <a 
        href={`tel:${BUSINESS_CONFIG.contact.phoneRaw}`} 
        className="floating-btn call-btn"
        title={`Call ${BUSINESS_CONFIG.name}`}
        aria-label="Direct Phone Call to Swiss Beauty Parlour"
      >
        <Phone size={20} />
      </a>

      {/* Quick WhatsApp Button */}
      <a 
        href={`https://wa.me/${BUSINESS_CONFIG.contact.whatsappRaw}?text=${encodeURIComponent("Hello Swiss Beauty Parlour, I would like to inquire about appointments and beauty services.")}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="floating-btn whatsapp-btn"
        title="WhatsApp Enquiry"
        aria-label="Chat with Swiss Beauty Parlour on WhatsApp"
      >
        <MessageSquare size={20} />
        <span className="floating-btn-text">WhatsApp Enquiry</span>
      </a>
    </div>
  );
};
