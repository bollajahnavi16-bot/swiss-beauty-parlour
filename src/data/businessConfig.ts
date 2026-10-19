// Centralized business configuration for Swiss Beauty Parlour
// All information is easily editable by the business owner.
// Note: Only verified information is enabled by default.

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  description: string;
  priceNote: string;
  startingPrice?: number;
  priceRange?: string;
  customPackage?: boolean;
  durationNote: string;
  badge?: string;
  image: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  alt: string;
  isDemoAsset: boolean;
}

export interface BusinessConfig {
  name: string;
  tagline: string;
  category: string;
  address: {
    line1: string;
    line2: string;
    landmark: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    full: string;
  };
  contact: {
    phoneDisplay: string;
    phoneRaw: string;
    whatsappRaw: string;
  };
  hours: {
    schedule: string;
    closedDays: string[];
    tentativeSlotHours: string;
    notice: string;
    needsOwnerConfirmation: boolean;
  };
  geo: {
    googlePlusCode: string;
    googleMapsDirectionsUrl: string;
    googleSearchListingUrl: string;
    embedMapUrl: string;
  };
  ratingStatus: {
    reportedRating: number;
    reportedReviewsCount: number;
    source: string;
    needsOwnerConfirmation: boolean;
  };
  disclaimer: {
    pricingNotice: string;
    photoNotice: string;
    bookingNotice: string;
  };
}

export const BUSINESS_CONFIG: BusinessConfig = {
  name: "Swiss Beauty Parlour",
  tagline: "Beauty, in Your Own Light",
  category: "Beauty Parlour & Women's Grooming",
  address: {
    line1: "74-8-16A, Vijayawada Road",
    line2: "JD Nagar, Patamata",
    landmark: "Near Patamata Center",
    area: "Patamata",
    city: "Vijayawada",
    state: "Andhra Pradesh",
    pincode: "520010",
    full: "74-8-16A, Vijayawada Road, JD Nagar, Patamata, Vijayawada, Andhra Pradesh 520010, India"
  },
  contact: {
    phoneDisplay: "+91 98660 55165",
    phoneRaw: "+919866055165",
    whatsappRaw: "919866055165" // International format digits-only
  },
  hours: {
    schedule: "Tuesday to Sunday",
    closedDays: ["Monday"],
    tentativeSlotHours: "10:00 AM – 8:00 PM",
    notice: "Operating hours are tentative and subject to confirmation upon appointment request.",
    needsOwnerConfirmation: true
  },
  geo: {
    googlePlusCode: "FMR9+M3, Vijayawada, Andhra Pradesh",
    googleMapsDirectionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Swiss+Beauty+Parlour+Patamata+Vijayawada+520010",
    googleSearchListingUrl: "https://www.google.com/maps/search/?api=1&query=Swiss+Beauty+Parlour+74-8-16A+Vijayawada+Road+JD+Nagar+Patamata+Vijayawada+520010",
    embedMapUrl: "https://maps.google.com/maps?q=Swiss%20Beauty%20Parlour%2074-8-16A%20Vijayawada%20Road%20JD%20Nagar%20Patamata%20Vijayawada%20520010&t=&z=16&ie=UTF8&iwloc=B&output=embed"
  },
  ratingStatus: {
    reportedRating: 4.0,
    reportedReviewsCount: 4,
    source: "Reported public local listing profile",
    needsOwnerConfirmation: true
  },
  disclaimer: {
    pricingNotice: "Treatment charges and customized bridal packages are finalized in-salon based on hair, skin, and styling consultation.",
    photoNotice: "Curated styling demonstrations are shown below for visual inspiration. Verified salon work will be uploaded upon owner confirmation.",
    bookingNotice: "Online submissions send an appointment request directly to Swiss Beauty Parlour on WhatsApp. Appointment slots are confirmed upon parlour review."
  }
};

export const SERVICE_CATEGORIES = [
  "All Services",
  "Hair Styling",
  "Facials",
  "Bridal Makeup",
  "Party Makeup",
  "Saree Draping",
  "Grooming"
] as const;

export const SERVICES_CATALOGUE: ServiceItem[] = [
  {
    id: "hair-styling",
    name: "Hair Styling",
    category: "Hair Styling",
    description: "Custom haircuts, blowouts, nourishing hair spa therapies, and deep conditioning hydration tailored to your hair texture.",
    priceNote: "Contact for pricing",
    durationNote: "45–90 min",
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "facials",
    name: "Facials",
    category: "Facials",
    description: "Deep cleansing, skin polishing, botanical rejuvenation masks, and revitalizing treatments for a natural, luminous glow.",
    priceNote: "Contact for pricing",
    durationNote: "60–75 min",
    badge: "Signature",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "bridal-makeup",
    name: "Bridal Makeup",
    category: "Bridal Makeup",
    description: "Bespoke bridal looks with long-lasting HD finishes, jewellery setting, hair artistry, and complete wedding-day styling.",
    priceNote: "Custom package",
    customPackage: true,
    durationNote: "120–180 min",
    badge: "Bespoke",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "party-makeup",
    name: "Party Makeup",
    category: "Party Makeup",
    description: "Radiant, camera-ready makeup tailored for receptions, festivities, and special occasions with flawless skin finishes.",
    priceNote: "Contact for pricing",
    durationNote: "60–90 min",
    image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "saree-draping",
    name: "Saree Draping",
    category: "Saree Draping",
    description: "Traditional South Indian bridal silk pleating, box pleating, and contemporary saree drape silhouettes styled for comfort and longevity.",
    priceNote: "Contact for pricing",
    durationNote: "30–45 min",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "grooming",
    name: "Grooming",
    category: "Grooming",
    description: "Precision eyebrow threading, gentle waxing, manicures, pedicures, and herbal de-tan skin care in a hygienic space.",
    priceNote: "Contact for pricing",
    durationNote: "30–60 min",
    badge: "Everyday Care",
    image: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?q=80&w=1000&auto=format&fit=crop"
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Editorial Bridal Artistry",
    category: "Bridal",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop",
    alt: "Refined bridal beauty aesthetic demonstration",
    isDemoAsset: true
  },
  {
    id: "gal-2",
    title: "Silk Hair Waves & Conditioning",
    category: "Hair",
    image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=1000&auto=format&fit=crop",
    alt: "Luxurious glossy styled hair waves demonstration",
    isDemoAsset: true
  },
  {
    id: "gal-3",
    title: "Radiance Facial & Botanical Care",
    category: "Skincare",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=1000&auto=format&fit=crop",
    alt: "Luminous skin hydration and facial therapy demonstration",
    isDemoAsset: true
  },
  {
    id: "gal-4",
    title: "Evening Glamour & High-Definition Makeup",
    category: "Makeup",
    image: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000&auto=format&fit=crop",
    alt: "Festive evening makeup artistry demonstration",
    isDemoAsset: true
  },
  {
    id: "gal-5",
    title: "South Indian Bridal Silk Draping",
    category: "Bridal",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop",
    alt: "Traditional saree drape and wedding styling demonstration",
    isDemoAsset: true
  },
  {
    id: "gal-6",
    title: "Precision Nail Care & Hand Spa",
    category: "Grooming",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1000&auto=format&fit=crop",
    alt: "Minimalist luxury manicured hands and nail therapy demonstration",
    isDemoAsset: true
  }
];
