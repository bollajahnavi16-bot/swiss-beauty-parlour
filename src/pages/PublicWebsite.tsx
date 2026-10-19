import { useState } from 'react';
import { Header } from '../components/Header';
import { Hero } from '../sections/Hero';
import { Services } from '../sections/Services';
import { About } from '../sections/About';
import { Gallery } from '../sections/Gallery';
import { AppointmentBooking } from '../sections/AppointmentBooking';
import { TrustReviews } from '../sections/TrustReviews';
import { ContactLocation } from '../sections/ContactLocation';
import { Footer } from '../components/Footer';
import { FloatingContact } from '../components/FloatingContact';
import { SERVICES_CATALOGUE } from '../data/businessConfig';

export function PublicWebsite() {
  const [selectedService, setSelectedService] = useState<string>(SERVICES_CATALOGUE[0].name);

  const scrollToBooking = (serviceName?: string) => {
    if (serviceName) {
      setSelectedService(serviceName);
    }
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToServices = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app-root">
      {/* Top Strip and Navigation */}
      <Header onBookClick={() => scrollToBooking()} />

      {/* Main Content Sections */}
      <main id="main-content">
        <Hero 
          onBookClick={() => scrollToBooking()} 
          onExploreClick={scrollToServices} 
        />
        
        <Services onSelectService={(serviceName) => scrollToBooking(serviceName)} />
        
        <About />
        
        <Gallery />
        
        <AppointmentBooking preselectedService={selectedService} />
        
        <TrustReviews />
        
        <ContactLocation />
      </main>

      {/* Footer */}
      <Footer onBookClick={() => scrollToBooking()} />

      {/* Floating Instant Call and WhatsApp Buttons */}
      <FloatingContact />
    </div>
  );
}
