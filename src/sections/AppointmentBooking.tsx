import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Send,
  CheckCircle,
  AlertCircle,
  Phone,
  Clock,
  Sparkles,
  MessageSquare,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { BUSINESS_CONFIG, SERVICES_CATALOGUE } from '../data/businessConfig';
import { submitAppointment, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './AppointmentBooking.css';

interface AppointmentBookingProps {
  preselectedService: string;
}

interface FormData {
  fullName: string;
  phone: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  service?: string;
  preferredDate?: string;
  preferredTime?: string;
}

const TIME_SLOTS = [
  '10:30 AM',
  '11:30 AM',
  '01:00 PM',
  '02:30 PM',
  '03:30 PM',
  '05:00 PM',
  '06:30 PM',
  '07:30 PM'
];

// Helper: Calculate today's date in Asia/Kolkata timezone (YYYY-MM-DD)
const getKolkataDateString = (): string => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
};

// Helper: Get current minutes of the day in Asia/Kolkata (0 to 1439)
const getKolkataMinutesNow = (): number => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(new Date());
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
  return hour * 60 + minute;
};

// Helper: Convert time string like '10:30 AM' or '05:00 PM' to minutes of day
const parseTimeToMinutes = (timeStr: string): number => {
  const [time, modifier] = timeStr.trim().split(' ');
  const [hoursStr, minutesStr] = time.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

// Helper: Get day of week for a YYYY-MM-DD date string (0=Sun, 1=Mon, ..., 6=Sat)
const getDayOfWeek = (dateStr: string): number => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return dateObj.getUTCDay();
};

export const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ preselectedService }) => {
  const { user, customerProfile } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    fullName: customerProfile?.full_name || '',
    phone: customerProfile?.phone || '',
    service: preselectedService || SERVICES_CATALOGUE[0].name,
    preferredDate: '',
    preferredTime: TIME_SLOTS[0],
    notes: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [appointmentRef, setAppointmentRef] = useState<string>('');
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');
  const [rawMessageText, setRawMessageText] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Today in Asia/Kolkata timezone
  const minDate = useMemo(() => getKolkataDateString(), []);

  // Autofill user profile when available
  useEffect(() => {
    if (!customerProfile) return;
    setFormData(prev => ({
      ...prev,
      fullName: prev.fullName || customerProfile.full_name || '',
      phone: prev.phone || customerProfile.phone || '',
    }));
  }, [customerProfile]);

  // Synchronize when preselectedService prop changes from external action (e.g. Services card click)
  useEffect(() => {
    if (preselectedService) {
      setFormData(prev => ({ ...prev, service: preselectedService }));
    }
  }, [preselectedService]);

  // Filter available time slots if today is selected in Asia/Kolkata
  const availableSlots = useMemo(() => {
    if (formData.preferredDate !== minDate) {
      return TIME_SLOTS;
    }
    const currentMins = getKolkataMinutesNow();
    // Allow slots starting at least 15 minutes in the future
    return TIME_SLOTS.filter(slot => parseTimeToMinutes(slot) > currentMins + 15);
  }, [formData.preferredDate, minDate]);

  // Ensure preferredTime is valid when availableSlots change
  useEffect(() => {
    if (availableSlots.length > 0 && !availableSlots.includes(formData.preferredTime)) {
      setFormData(prev => ({ ...prev, preferredTime: availableSlots[0] }));
    }
  }, [availableSlots, formData.preferredTime]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // 1. Full Name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters long.';
    }

    // 2. Mobile Number (Strict 10-digit Indian Mobile Validation)
    const rawPhone = formData.phone.trim().replace(/\D/g, '');
    let cleanPhone = rawPhone;
    if (rawPhone.length === 11 && rawPhone.startsWith('0')) {
      cleanPhone = rawPhone.slice(1);
    } else if (rawPhone.length === 12 && rawPhone.startsWith('91')) {
      cleanPhone = rawPhone.slice(2);
    }

    if (!cleanPhone) {
      newErrors.phone = 'Please enter your 10-digit mobile number.';
    } else if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
    }

    // 3. Service
    if (!formData.service) {
      newErrors.service = 'Please select a desired service.';
    }

    // 4. Preferred Date
    if (!formData.preferredDate) {
      newErrors.preferredDate = 'Please select your preferred appointment date.';
    } else if (formData.preferredDate < minDate) {
      newErrors.preferredDate = 'Past dates cannot be selected.';
    } else {
      // Check Monday closure
      const day = getDayOfWeek(formData.preferredDate);
      if (day === 1) {
        newErrors.preferredDate = 'Swiss Beauty Parlour is closed on Mondays. Please choose Tuesday through Sunday.';
      }
    }

    // 5. Preferred Time (Check if slots are exhausted for today or past)
    if (!formData.preferredTime) {
      newErrors.preferredTime = 'Please select a preferred time slot.';
    } else if (formData.preferredDate === minDate) {
      const slotMins = parseTimeToMinutes(formData.preferredTime);
      const currentMins = getKolkataMinutesNow();
      if (slotMins <= currentMins) {
        newErrors.preferredTime = 'This time has already passed for today. Please select an upcoming slot or future date.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    // Clean phone number for storage and messaging
    const rawDigits = formData.phone.trim().replace(/\D/g, '');
    let cleanPhone = rawDigits;
    if (rawDigits.length === 11 && rawDigits.startsWith('0')) cleanPhone = rawDigits.slice(1);
    if (rawDigits.length === 12 && rawDigits.startsWith('91')) cleanPhone = rawDigits.slice(2);

    // 1. Save to Supabase database (with resilient memory fallback)
    const { data: savedRecord, error: dbError } = await submitAppointment({
      customer_name: formData.fullName.trim(),
      phone: cleanPhone,
      service: formData.service,
      appointment_date: formData.preferredDate,
      appointment_time: formData.preferredTime,
      notes: formData.notes.trim() || undefined,
      user_id: user?.id,
      customer_email: user?.email,
    });

    if (dbError || !savedRecord) {
      setIsSubmitting(false);
      const isMissingConfig = !isSupabaseConfigured();
      setSubmitError(
        isMissingConfig
          ? 'Database connection is being initialized. You can still send your request directly via WhatsApp below.'
          : (dbError?.message || 'Unable to record appointment request. Please contact us directly via WhatsApp.')
      );
      return;
    }

    // Reference code generated from database primary key UUID
    const refCode = `SWISS-${savedRecord.id.slice(0, 8).toUpperCase()}`;
    setAppointmentRef(refCode);

    // 2. Build verified WhatsApp request message
    const message =
      `*New Appointment Request — Swiss Beauty Parlour*\n` +
      `*Reference:* ${refCode}\n\n` +
      `*Client Name:* ${formData.fullName.trim()}\n` +
      `*Mobile Number:* +91 ${cleanPhone}\n` +
      `*Requested Service:* ${formData.service}\n` +
      `*Preferred Date:* ${formData.preferredDate}\n` +
      `*Preferred Time:* ${formData.preferredTime}\n` +
      (formData.notes.trim() ? `*Special Notes:* ${formData.notes.trim()}\n\n` : `\n`) +
      `*Status:* Awaiting parlour schedule confirmation\n\n` +
      `_Sent via Swiss Beauty Parlour Website (Patamata, Vijayawada)_`;

    setRawMessageText(message);
    const encodedMessage = encodeURIComponent(message);
    const generatedUrl = `https://wa.me/${BUSINESS_CONFIG.contact.whatsappRaw}?text=${encodedMessage}`;
    setWhatsappUrl(generatedUrl);

    setIsSubmitting(false);
    setSubmittedSuccess(true);

    // Attempt to open WhatsApp in a new tab
    try {
      window.open(generatedUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // Browser popup blocker fallback handled by the success screen button
    }
  };

  const handleCopyMessage = useCallback(() => {
    if (!rawMessageText) return;
    navigator.clipboard.writeText(rawMessageText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [rawMessageText]);

  const handleReset = () => {
    setSubmittedSuccess(false);
    setSubmitError(null);
    setAppointmentRef('');
    setWhatsappUrl('');
    setRawMessageText('');
    setCopied(false);
    setFormData({
      fullName: '',
      phone: '',
      service: SERVICES_CATALOGUE[0].name,
      preferredDate: '',
      preferredTime: TIME_SLOTS[0],
      notes: ''
    });
    setErrors({});
  };

  return (
    <section id="booking" className="section booking-section" aria-labelledby="booking-heading">
      <div className="container">
        <div className="booking-card-wrapper">
          {/* Left Pane: Concierge Desk in Rich Royal Berry */}
          <div className="booking-info-pane">
            <span className="eyebrow" style={{ color: 'var(--color-soft-gold-light)' }}>
              <Sparkles size={14} className="strip-icon" aria-hidden="true" /> Reservation Desk
            </span>
            <h2 id="booking-heading" className="booking-pane-title">Request Your Appointment</h2>
            <div className="gold-rule"></div>
            <p className="booking-pane-desc">
              Share your preferred service and schedule. Online requests are sent directly to the parlour on WhatsApp and confirmed based on schedule availability.
            </p>

            <div className="booking-highlights">
              <div className="highlight-row">
                <Phone size={20} className="highlight-icon" aria-hidden="true" />
                <div>
                  <span className="highlight-label">Direct Parlour Line</span>
                  <a href={`tel:${BUSINESS_CONFIG.contact.phoneRaw}`} className="highlight-val-link">
                    {BUSINESS_CONFIG.contact.phoneDisplay}
                  </a>
                </div>
              </div>
              <div className="highlight-row">
                <Clock size={20} className="highlight-icon" aria-hidden="true" />
                <div>
                  <span className="highlight-label">Operating Schedule</span>
                  <span className="highlight-val">{BUSINESS_CONFIG.hours.schedule} (Closed Mon)</span>
                  <span className="highlight-sub">{BUSINESS_CONFIG.hours.tentativeSlotHours}</span>
                </div>
              </div>
            </div>

            {/* Note on Confirmation Panel (Styled for High Contrast AA Compliance) */}
            <div className="booking-transparency-pill" role="note">
              <span className="pill-title">Note on Confirmation:</span>
              <p className="pill-text">
                Submitting this form records your appointment request. The parlour team will review schedule availability and confirm your final booking slot via WhatsApp or phone call.
              </p>
            </div>
          </div>

          {/* Right Pane: Interactive Form in Pearl Ivory */}
          <div className="booking-form-pane">
            {submittedSuccess ? (
              <div className="submission-success-banner" role="status" aria-live="polite">
                <div className="success-icon-wrap">
                  <CheckCircle size={44} className="success-icon" aria-hidden="true" />
                </div>
                <h3 className="success-title">Appointment Request Received</h3>
                
                {appointmentRef && (
                  <div className="booking-ref-box">
                    <span className="ref-label">Request Reference</span>
                    <strong className="ref-code">{appointmentRef}</strong>
                  </div>
                )}

                <div className="booking-status-notice">
                  <span className="status-badge-pending">Status: Awaiting Salon Confirmation</span>
                  <p className="success-text">
                    Your appointment details have been recorded. To finalize your slot, please open WhatsApp to send your pre-filled request to <strong>Swiss Beauty Parlour</strong>.
                  </p>
                </div>

                {whatsappUrl && (
                  <div className="success-action-group">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp full-width-btn"
                      id="whatsapp-finalize-btn"
                    >
                      <Send size={16} aria-hidden="true" />
                      <span>Open WhatsApp to Finalize</span>
                    </a>

                    <button
                      type="button"
                      className="btn btn-secondary full-width-btn copy-details-btn"
                      onClick={handleCopyMessage}
                      title="Copy request message to clipboard"
                    >
                      {copied ? (
                        <>
                          <Check size={16} aria-hidden="true" />
                          <span>Request Details Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={16} aria-hidden="true" />
                          <span>Copy Request Details</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="success-footer-note">
                  <span>Need instant help? Call us directly: </span>
                  <a href={`tel:${BUSINESS_CONFIG.contact.phoneRaw}`} className="direct-call-link">
                    {BUSINESS_CONFIG.contact.phoneDisplay}
                  </a>
                </div>

                <button
                  type="button"
                  className="btn btn-ghost reset-booking-btn"
                  onClick={handleReset}
                >
                  Submit Another Appointment Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="appointment-form" aria-label="Appointment Request Form">
                <h3 className="form-heading">Appointment Details</h3>
                <p className="form-subheading">Fill out the details below. All fields marked with * are required.</p>

                {submitError && (
                  <div className="submit-error-banner" role="alert">
                    <AlertCircle size={20} className="error-icon" aria-hidden="true" />
                    <div className="submit-error-content">
                      <h4 className="submit-error-title">Database Notice</h4>
                      <p className="submit-error-text">{submitError}</p>
                      <div className="submit-error-actions">
                        <a
                          href={`https://wa.me/${BUSINESS_CONFIG.contact.whatsappRaw}?text=${encodeURIComponent(`Hello Swiss Beauty Parlour, I would like to book ${formData.service || 'an appointment'} on ${formData.preferredDate || 'an upcoming date'}. Name: ${formData.fullName || ''}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-whatsapp btn-sm"
                        >
                          <MessageSquare size={14} aria-hidden="true" />
                          <span>Send WhatsApp Request Directly</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Full Name */}
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label">
                    Full Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                    placeholder="e.g. Ananya Rao"
                    value={formData.fullName}
                    onChange={handleChange}
                    aria-required="true"
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={errors.fullName ? "name-error" : undefined}
                    disabled={isSubmitting}
                  />
                  {errors.fullName && (
                    <span id="name-error" className="error-msg" role="alert">
                      <AlertCircle size={13} aria-hidden="true" /> {errors.fullName}
                    </span>
                  )}
                </div>

                {/* Mobile Phone */}
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Mobile Number <span className="req">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={`form-input ${errors.phone ? 'input-error' : ''}`}
                    placeholder="e.g. 98660 55165"
                    value={formData.phone}
                    onChange={handleChange}
                    aria-required="true"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
                    disabled={isSubmitting}
                  />
                  <span id="phone-hint" className="form-hint">
                    Enter a 10-digit Indian mobile number (e.g. 98660 55165 or +91 98660 55165)
                  </span>
                  {errors.phone && (
                    <span id="phone-error" className="error-msg" role="alert">
                      <AlertCircle size={13} aria-hidden="true" /> {errors.phone}
                    </span>
                  )}
                </div>

                {/* Service Selection */}
                <div className="form-group">
                  <label htmlFor="service" className="form-label">
                    Select Desired Service <span className="req">*</span>
                  </label>
                  <select
                    id="service"
                    name="service"
                    className={`form-select ${errors.service ? 'input-error' : ''}`}
                    value={formData.service}
                    onChange={handleChange}
                    aria-required="true"
                    aria-invalid={Boolean(errors.service)}
                    aria-describedby={errors.service ? "service-error" : undefined}
                    disabled={isSubmitting}
                  >
                    {SERVICES_CATALOGUE.map(s => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.durationNote} • {s.priceNote})
                      </option>
                    ))}
                    <option value="In-Salon Consultation">In-Salon Consultation / Multiple Services</option>
                  </select>
                  {errors.service && (
                    <span id="service-error" className="error-msg" role="alert">
                      <AlertCircle size={13} aria-hidden="true" /> {errors.service}
                    </span>
                  )}
                </div>

                {/* Date & Time Row */}
                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="preferredDate" className="form-label">
                      Preferred Date <span className="req">*</span>
                    </label>
                    <input
                      type="date"
                      id="preferredDate"
                      name="preferredDate"
                      min={minDate}
                      className={`form-input ${errors.preferredDate ? 'input-error' : ''}`}
                      value={formData.preferredDate}
                      onChange={handleChange}
                      aria-required="true"
                      aria-invalid={Boolean(errors.preferredDate)}
                      aria-describedby={errors.preferredDate ? "date-error" : "date-hint"}
                      disabled={isSubmitting}
                    />
                    <span id="date-hint" className="form-hint">Open Tuesday – Sunday (Closed Mondays)</span>
                    {errors.preferredDate && (
                      <span id="date-error" className="error-msg" role="alert">
                        <AlertCircle size={13} aria-hidden="true" /> {errors.preferredDate}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="preferredTime" className="form-label">
                      Preferred Time <span className="req">*</span>
                    </label>
                    <select
                      id="preferredTime"
                      name="preferredTime"
                      className={`form-select ${errors.preferredTime ? 'input-error' : ''}`}
                      value={formData.preferredTime}
                      onChange={handleChange}
                      aria-required="true"
                      aria-invalid={Boolean(errors.preferredTime)}
                      aria-describedby={errors.preferredTime ? "time-error" : "time-hint"}
                      disabled={isSubmitting || availableSlots.length === 0}
                    >
                      {availableSlots.length > 0 ? (
                        availableSlots.map(time => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))
                      ) : (
                        <option value="">No remaining slots today</option>
                      )}
                    </select>
                    <span id="time-hint" className="form-hint">Slots are subject to salon confirmation</span>
                    {errors.preferredTime && (
                      <span id="time-error" className="error-msg" role="alert">
                        <AlertCircle size={13} aria-hidden="true" /> {errors.preferredTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* Optional Message */}
                <div className="form-group">
                  <label htmlFor="notes" className="form-label">
                    Special Notes or Preferences <span className="opt">(Optional)</span>
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="form-textarea"
                    placeholder="E.g. Hair length, skin allergies, bridal event timing..."
                    value={formData.notes}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary btn-submit-booking"
                  disabled={isSubmitting}
                  id="submit-booking-btn"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={17} className="btn-spinner" aria-hidden="true" />
                      <span>Recording Request...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare size={17} aria-hidden="true" />
                      <span>Request Appointment (Awaiting Confirmation)</span>
                    </>
                  )}
                </button>

                <p className="form-disclaimer-note">
                  Submitting this request connects you with Swiss Beauty Parlour on WhatsApp. Appointment slots are finalized upon parlour team review.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
