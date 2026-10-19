import { useState, useEffect } from 'react';
import { Send, CheckCircle, AlertCircle, Phone, Clock, Sparkles, MessageSquare, RefreshCw } from 'lucide-react';
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

export const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ preselectedService }) => {
  const { user, customerProfile } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    fullName: customerProfile?.full_name || '',
    phone: customerProfile?.phone || '',
    service: preselectedService || SERVICES_CATALOGUE[0].name,
    preferredDate: '',
    preferredTime: '11:00 AM',
    notes: ''
  });

  useEffect(() => {
    if (!customerProfile) return;
    const timer = setTimeout(() => {
      setFormData(prev => {
        if (prev.fullName && prev.phone) return prev;
        return {
          ...prev,
          fullName: prev.fullName || customerProfile.full_name || '',
          phone: prev.phone || customerProfile.phone || '',
        };
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [customerProfile]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [appointmentRef, setAppointmentRef] = useState<string>('');
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');

  // Minimum date is today (calculated once or derived)
  const [minDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Synchronize service selection if preselectedService changes externally
  const [currentSelectedService, setCurrentSelectedService] = useState(preselectedService);
  if (preselectedService && preselectedService !== currentSelectedService) {
    setCurrentSelectedService(preselectedService);
    setFormData(prev => ({ ...prev, service: preselectedService }));
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters long.';
    }

    // Indian mobile number validation: 10 digits, optionally prefixed with +91 or 0
    const cleanPhone = formData.phone.replace(/[\s\-()]/g, '');
    const indianPhoneRegex = /^(?:(?:\+|0{0,2})91(\s*-\s*)?|[0]?)?[6789]\d{9}$/;
    
    if (!cleanPhone) {
      newErrors.phone = 'Please enter your mobile number.';
    } else if (!indianPhoneRegex.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number (e.g., 9876543210).';
    }

    if (!formData.service) {
      newErrors.service = 'Please select a service.';
    }

    if (!formData.preferredDate) {
      newErrors.preferredDate = 'Please select your preferred date.';
    } else if (formData.preferredDate < minDate) {
      newErrors.preferredDate = 'Past dates cannot be selected.';
    }

    if (!formData.preferredTime) {
      newErrors.preferredTime = 'Please select a preferred time.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    // Save to real Supabase backend database
    const { data: savedRecord, error: dbError } = await submitAppointment({
      customer_name: formData.fullName,
      phone: formData.phone,
      service: formData.service,
      appointment_date: formData.preferredDate,
      appointment_time: formData.preferredTime,
      notes: formData.notes,
      user_id: user?.id,
      customer_email: user?.email,
    });

    if (dbError || !savedRecord) {
      setIsSubmitting(false);
      const isMissingConfig = !isSupabaseConfigured();
      setSubmitError(
        isMissingConfig
          ? 'Database connection is being initialized. You can still send your request directly via WhatsApp below.'
          : (dbError?.message || 'Unable to save appointment request. Please try again or contact us directly.')
      );
      return;
    }

    // Reference code generated from database primary key UUID
    const refCode = `SWISS-${savedRecord.id.slice(0, 8).toUpperCase()}`;
    setAppointmentRef(refCode);

    // Build verified WhatsApp message referencing saved database ID
    const message = 
      `*New Appointment Request — Swiss Beauty Parlour*\n` +
      `*Booking Ref:* ${refCode}\n\n` +
      `*Customer Name:* ${formData.fullName.trim()}\n` +
      `*Contact Number:* ${formData.phone.trim()}\n` +
      `*Requested Service:* ${formData.service}\n` +
      `*Preferred Date:* ${formData.preferredDate}\n` +
      `*Preferred Time:* ${formData.preferredTime}\n` +
      (formData.notes.trim() ? `*Special Notes:* ${formData.notes.trim()}\n\n` : `\n`) +
      `*Status:* Pending confirmation by parlour\n\n` +
      `_Submitted via Swiss Beauty Parlour Official Website_`;

    const encodedMessage = encodeURIComponent(message);
    const generatedUrl = `https://wa.me/${BUSINESS_CONFIG.contact.whatsappRaw}?text=${encodedMessage}`;
    setWhatsappUrl(generatedUrl);

    setIsSubmitting(false);
    setSubmittedSuccess(true);

    // Open WhatsApp in a new tab
    try {
      window.open(generatedUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // Browser popup blocker fallback handled by the success screen button
    }
  };

  const handleReset = () => {
    setSubmittedSuccess(false);
    setSubmitError(null);
    setAppointmentRef('');
    setWhatsappUrl('');
    setFormData({
      fullName: '',
      phone: '',
      service: SERVICES_CATALOGUE[0].name,
      preferredDate: '',
      preferredTime: '11:00 AM',
      notes: ''
    });
    setErrors({});
  };

  return (
    <section id="booking" className="section booking-section">
      <div className="container">
        <div className="booking-card-wrapper">
          <div className="booking-info-pane">
            <span className="eyebrow" style={{ color: 'var(--color-gold-light)' }}>
              <Sparkles size={13} className="strip-icon" /> Reservation Desk
            </span>
            <h2 className="booking-pane-title">Request Your Appointment</h2>
            <div className="gold-rule"></div>
            <p className="booking-pane-desc">
              Share your preferred service and schedule. Your request will open directly in WhatsApp for prompt confirmation by Swiss Beauty Parlour.
            </p>

            <div className="booking-highlights">
              <div className="highlight-row">
                <Phone size={18} className="highlight-icon" />
                <div>
                  <span className="highlight-label">Direct Parlour Line</span>
                  <span className="highlight-val">{BUSINESS_CONFIG.contact.phoneDisplay}</span>
                </div>
              </div>
              <div className="highlight-row">
                <Clock size={18} className="highlight-icon" />
                <div>
                  <span className="highlight-label">Appointment Enquiries</span>
                  <span className="highlight-val">Tues – Sun | Morning to Evening</span>
                </div>
              </div>
            </div>

            <div className="booking-transparency-pill">
              <span className="pill-title">Note on Confirmation:</span>
              <p className="pill-text">
                Submitting this form connects you with Swiss Beauty Parlour on WhatsApp. Appointment slots are confirmed by the parlour team upon reviewing schedule availability.
              </p>
            </div>
          </div>

          <div className="booking-form-pane">
            {submittedSuccess ? (
              <div className="submission-success-banner" role="status">
                <CheckCircle size={48} className="success-icon" />
                <h3 className="success-title">Appointment Request Saved!</h3>
                {appointmentRef && (
                  <div className="booking-ref-box">
                    <span className="ref-label">Booking Reference</span>
                    <strong className="ref-code">{appointmentRef}</strong>
                  </div>
                )}
                <p className="success-text">
                  Your appointment request has been recorded in our parlour database with status <strong>Pending Confirmation</strong>. 
                  We have pre-filled your request details for <strong>Swiss Beauty Parlour</strong> on WhatsApp.
                </p>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp"
                    style={{ width: '100%', marginBottom: '0.85rem' }}
                  >
                    <Send size={16} />
                    Open WhatsApp to Finalize
                  </a>
                )}
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleReset}
                  style={{ width: '100%' }}
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="appointment-form" aria-label="Appointment Request Form">
                <h3 className="form-heading">Appointment Details</h3>

                {submitError && (
                  <div className="submit-error-banner" role="alert">
                    <AlertCircle size={20} className="error-icon" />
                    <div className="submit-error-content">
                      <h4 className="submit-error-title">Unable to Save to Database</h4>
                      <p className="submit-error-text">{submitError}</p>
                      <div className="submit-error-actions">
                        <a 
                          href={`https://wa.me/${BUSINESS_CONFIG.contact.whatsappRaw}?text=${encodeURIComponent(`Hello Swiss Beauty Parlour, I would like to book ${formData.service || 'an appointment'} on ${formData.preferredDate || 'an upcoming date'}. Name: ${formData.fullName || ''}`)}`}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-whatsapp btn-sm"
                        >
                          <MessageSquare size={14} /> Send WhatsApp Enquiry Instead
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
                    aria-invalid={!!errors.fullName}
                    aria-describedby={errors.fullName ? "name-error" : undefined}
                  />
                  {errors.fullName && (
                    <span id="name-error" className="error-msg">
                      <AlertCircle size={13} /> {errors.fullName}
                    </span>
                  )}
                </div>

                {/* Mobile Phone */}
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Mobile Number (10-digit) <span className="req">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={`form-input ${errors.phone ? 'input-error' : ''}`}
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    aria-required="true"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                  />
                  {errors.phone && (
                    <span id="phone-error" className="error-msg">
                      <AlertCircle size={13} /> {errors.phone}
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
                  >
                    {SERVICES_CATALOGUE.map(s => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                    <option value="Consultation / Multiple Services">Other / In-Salon Consultation</option>
                  </select>
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
                      aria-invalid={!!errors.preferredDate}
                    />
                    {errors.preferredDate && (
                      <span className="error-msg">
                        <AlertCircle size={13} /> {errors.preferredDate}
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
                      className="form-select"
                      value={formData.preferredTime}
                      onChange={handleChange}
                    >
                      <option value="10:30 AM">10:30 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="01:00 PM">01:00 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="04:30 PM">04:30 PM</option>
                      <option value="06:00 PM">06:00 PM</option>
                      <option value="07:00 PM">07:00 PM</option>
                    </select>
                  </div>
                </div>

                {/* Optional Message */}
                <div className="form-group">
                  <label htmlFor="notes" className="form-label">
                    Special Notes or Inquiries <span className="opt">(Optional)</span>
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="form-textarea"
                    placeholder="E.g. Hair length, bridal event date, skin allergies..."
                    value={formData.notes}
                    onChange={handleChange}
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
                      <RefreshCw size={17} className="btn-spinner" />
                      <span>Recording Request...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare size={17} />
                      <span>Request Appointment & WhatsApp Confirmation</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
