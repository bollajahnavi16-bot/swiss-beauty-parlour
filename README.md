# Swiss Beauty Parlour — Premium Client Website

An editorial, luxury, and fully responsive client website created for **Swiss Beauty Parlour**, located in Patamata, Vijayawada, Andhra Pradesh, India.

---

## ✦ Verified Business Information

| Property | Details |
| :--- | :--- |
| **Business Name** | Swiss Beauty Parlour |
| **Category** | Beauty Parlour & Women's Grooming |
| **Address** | 74-8-16A, Vijayawada Road, JD Nagar, Patamata, Vijayawada, Andhra Pradesh 520010, India |
| **Phone** | +91 98660 55165 |
| **WhatsApp Direct** | 919866055165 |
| **Google Maps Plus Code** | `FMR9+M3`, Vijayawada, Andhra Pradesh |
| **Reported Rating** | 4.0 / 5.0 (4 reviews) — *Configurable, flagged for owner confirmation* |

---

## ✦ Luxury Design System & Aesthetic Vision

- **Palette**:
  - Primary Pink: `#D98FA3`
  - Soft Blush: `#F3DCE2`
  - Pale Pink Canvas: `#FFF8F9`
  - Warm Ivory: `#FFFCF8`
  - Deep Berry: `#713449`
  - Rose Gold: `#C49A8A`
  - Main Text: `#35272C`
- **Typography**:
  - Headings: *Cormorant Garamond* & *Playfair Display*
  - Body & UI: *DM Sans* & *Manrope*
- **Key Architectural Elements**:
  - Architectural rose-gold framed beauty portrait with `"SWISS BEAUTY ATELIER"` badge.
  - Verified local rating micro-badge (`4.0 Verified Local Rating`).
  - Professional salon interior atmosphere image in About section.
  - Curated, unique photography across all 6 service cards and 6 gallery cards (zero duplicate photography).
  - Prominent Deep Berry WhatsApp appointment booking CTA with real-world validation.

---

## ✦ Architecture & Technology Stack

- **Core Framework**: React 19 + TypeScript
- **Bundler & Dev Server**: Vite 8
- **Styling**: Vanilla CSS Design Tokens (Zero Tailwind bloat, maximum performance)
- **Icons**: Lucide React
- **Booking Flow**: Real-world WhatsApp Enquiry integration with 10-digit Indian phone validation and zero false backend claims
- **Code Health**: 0 errors, 0 warnings on Oxlint and TypeScript compiler

---

## ✦ Centralized Owner Configuration

All business information, service offerings, image assets, disclaimers, and contact details are centrally configurable in:
```
src/data/businessConfig.ts
```

Owners can directly update:
- Phone numbers and WhatsApp numbers
- Service names, descriptions, categories, and badges
- Gallery items and demonstration tags
- Pricing policies and location coordinates

---

## ✦ Setup & Local Run Instructions

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Open in browser
http://localhost:5173
```

---

## ✦ Production Build & Lint Verification

```bash
# Run Oxlint (0 errors, 0 warnings)
npm run lint

# Run TypeScript checks & Vite Production Bundle
npm run build

# Preview production build locally
npm run preview
```

---

## ✦ Owner Pre-Launch Approval Checklist

Before presenting as final to the public, the owner should confirm:
1. **Actual Salon Photographs**: Replace the inspirational demo imagery in `GALLERY_ITEMS` with genuine in-salon photos.
2. **Services & Pricing**: Confirm service descriptions and add exact service pricing/packages if desired.
3. **Operating Hours**: Specify salon opening and closing hours for weekdays and weekends.
4. **Google Business Profile Rating**: Verify the 4.0/5 rating and attach direct Google review links.
