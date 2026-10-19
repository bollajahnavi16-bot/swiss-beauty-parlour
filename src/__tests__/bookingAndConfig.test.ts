import { describe, it, expect } from 'vitest';
import { BUSINESS_CONFIG, SERVICE_CATEGORIES, SERVICES_CATALOGUE } from '../data/businessConfig';

describe('Business Configuration & Services Integrity', () => {
  it('has verified phone and WhatsApp number 9866055165', () => {
    expect(BUSINESS_CONFIG.contact.whatsappRaw).toBe('919866055165');
    expect(BUSINESS_CONFIG.contact.phoneDisplay).toContain('98660 55165');
    expect(BUSINESS_CONFIG.contact.phoneRaw).toBe('+919866055165');
  });

  it('declares business schedule with Monday closed', () => {
    expect(BUSINESS_CONFIG.hours.closedDays).toContain('Monday');
    expect(BUSINESS_CONFIG.hours.schedule).toContain('Tuesday to Sunday');
  });

  it('contains standardized, professional service names', () => {
    const validNames = [
      'Hair Styling',
      'Facials',
      'Bridal Makeup',
      'Party Makeup',
      'Saree Draping',
      'Grooming'
    ];
    const serviceNames = SERVICES_CATALOGUE.map(s => s.name);
    validNames.forEach(name => {
      expect(serviceNames).toContain(name);
    });
  });

  it('contains NO fake prices, negative prices, or 0-rupee placeholders', () => {
    SERVICES_CATALOGUE.forEach(service => {
      if (service.startingPrice !== undefined) {
        expect(service.startingPrice).toBeGreaterThan(0);
      }
      // Never fabricate a price if not available; priceNote must be truthful
      expect(['Contact for pricing', 'Custom package', 'Starting from ₹' + service.startingPrice]).toContain(service.priceNote);
    });
  });

  it('provides treatment duration for all services', () => {
    SERVICES_CATALOGUE.forEach(service => {
      expect(service.durationNote).toBeDefined();
      expect(service.durationNote.length).toBeGreaterThan(0);
    });
  });

  it('supports categories with all items accounted for', () => {
    expect(SERVICE_CATEGORIES).toContain('All Services');
    expect(SERVICE_CATEGORIES.length).toBeGreaterThanOrEqual(6);
  });
});

describe('Booking Validation Rules', () => {
  it('validates 10-digit Indian phone numbers starting with 6-9', () => {
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    
    // Valid numbers
    expect(indianPhoneRegex.test('9866055165')).toBe(true);
    expect(indianPhoneRegex.test('9123456789')).toBe(true);
    expect(indianPhoneRegex.test('6303338549')).toBe(true);
    expect(indianPhoneRegex.test('8888888888')).toBe(true);
    expect(indianPhoneRegex.test('7000000000')).toBe(true);

    // Invalid numbers
    expect(indianPhoneRegex.test('1234567890')).toBe(false); // starts with 1
    expect(indianPhoneRegex.test('5555555555')).toBe(false); // starts with 5
    expect(indianPhoneRegex.test('986605516')).toBe(false);  // 9 digits
    expect(indianPhoneRegex.test('98660551655')).toBe(false); // 11 digits
    expect(indianPhoneRegex.test('986605516a')).toBe(false); // contains letter
    expect(indianPhoneRegex.test('')).toBe(false);
  });

  it('identifies Mondays as closed in date validation', () => {
    const isMonday = (dateStr: string) => {
      const parts = dateStr.split('-');
      const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return date.getDay() === 1; // 1 is Monday
    };

    // 2026-10-19 is a Monday
    expect(isMonday('2026-10-19')).toBe(true);
    // 2026-10-20 is a Tuesday (open)
    expect(isMonday('2026-10-20')).toBe(false);
    // 2026-10-25 is a Sunday (open)
    expect(isMonday('2026-10-25')).toBe(false);
  });

  it('correctly constructs WhatsApp booking request URI with encoded fields', () => {
    const formData = {
      fullName: 'Ananya Sharma',
      phone: '9866055165',
      service: 'Bridal Makeup',
      preferredDate: '2026-10-24',
      preferredTime: '11:00 AM',
      notes: 'Bridal trial session request'
    };

    const text = 
      `*New Appointment Request — Swiss Beauty Parlour*\n\n` +
      `*Client Name:* ${formData.fullName}\n` +
      `*Contact Phone:* +91 ${formData.phone}\n` +
      `*Requested Service:* ${formData.service}\n` +
      `*Preferred Date:* ${formData.preferredDate}\n` +
      `*Preferred Time:* ${formData.preferredTime}\n` +
      `*Special Notes / Requests:* ${formData.notes}\n\n` +
      `_Note: This is an appointment request subject to salon confirmation._`;

    const encoded = encodeURIComponent(text);
    const waUrl = `https://wa.me/${BUSINESS_CONFIG.contact.whatsappRaw}?text=${encoded}`;

    expect(waUrl).toContain('https://wa.me/919866055165?text=');
    expect(waUrl).toContain(encodeURIComponent('Ananya Sharma'));
    expect(waUrl).toContain(encodeURIComponent('Bridal Makeup'));
    expect(waUrl).toContain(encodeURIComponent('appointment request subject to salon confirmation'));
  });
});

describe('Supabase Password Reset & Recovery Flow', () => {
  it('strictly targets the production reset-password URL and avoids localhost', async () => {
    const { getPasswordResetRedirectUrl, PRODUCTION_RESET_URL } = await import('../lib/supabase');
    expect(PRODUCTION_RESET_URL).toBe('https://swiss-beauty-parlour.vercel.app/reset-password');
    const redirectUrl = getPasswordResetRedirectUrl();
    expect(redirectUrl).toContain('https://swiss-beauty-parlour.vercel.app/reset-password');
    expect(redirectUrl).not.toContain('localhost');
  });

  it('validates password criteria strictly', () => {
    const validate = (pwd: string, confirm: string) => ({
      minLength: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=\\/[\]]/.test(pwd),
      passwordsMatch: pwd.length > 0 && pwd === confirm,
    });

    // Valid password
    const valid = validate('SwissSalon@2026', 'SwissSalon@2026');
    expect(valid.minLength).toBe(true);
    expect(valid.hasUpper).toBe(true);
    expect(valid.hasLower).toBe(true);
    expect(valid.hasNumber).toBe(true);
    expect(valid.hasSpecial).toBe(true);
    expect(valid.passwordsMatch).toBe(true);

    // Mismatched password
    const mismatch = validate('SwissSalon@2026', 'DifferentPass@2026');
    expect(mismatch.passwordsMatch).toBe(false);

    // Short password (< 8 chars)
    const short = validate('Pass1!', 'Pass1!');
    expect(short.minLength).toBe(false);

    // Missing uppercase
    const noUpper = validate('swisssalon@2026', 'swisssalon@2026');
    expect(noUpper.hasUpper).toBe(false);

    // Missing number
    const noNumber = validate('SwissSalon@Demo', 'SwissSalon@Demo');
    expect(noNumber.hasNumber).toBe(false);

    // Missing special character
    const noSpecial = validate('SwissSalon2026', 'SwissSalon2026');
    expect(noSpecial.hasSpecial).toBe(false);
  });

  it('computes password strength scores accurately', () => {
    const calcStrength = (pwd: string) => {
      let score = 0;
      if (pwd.length >= 8) score += 1;
      if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
      if (/[0-9]/.test(pwd)) score += 1;
      if (/[!@#$%^&*(),.?":{}|<>_\-+=\\/[\]]/.test(pwd)) score += 1;

      switch (score) {
        case 1:
          return 'Weak';
        case 2:
          return 'Fair';
        case 3:
          return 'Good';
        case 4:
          return 'Strong';
        default:
          return 'Weak';
      }
    };

    expect(calcStrength('abc')).toBe('Weak');
    expect(calcStrength('abcdefgh')).toBe('Weak'); // length only
    expect(calcStrength('Abcdefgh')).toBe('Fair'); // length + upper/lower
    expect(calcStrength('Abcdefgh1')).toBe('Good'); // length + upper/lower + number
    expect(calcStrength('Swiss@2026')).toBe('Strong'); // all 4 criteria
  });
});

