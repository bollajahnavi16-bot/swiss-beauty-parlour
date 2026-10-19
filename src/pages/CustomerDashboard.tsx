import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  LogOut,
  PlusCircle,
  MessageSquare,
  Phone,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  fetchCustomerAppointments,
  cancelCustomerAppointment,
  submitAppointment,
  type Appointment
} from '../lib/supabase';
import { BUSINESS_CONFIG, SERVICES_CATALOGUE } from '../data/businessConfig';
import './CustomerDashboard.css';

export const CustomerDashboard: React.FC = () => {
  const { user, customerProfile, signOut, role } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick New Booking Modal
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [bookService, setBookService] = useState<string>(SERVICES_CATALOGUE[0].name);
  const [bookDate, setBookDate] = useState<string>('');
  const [bookTime, setBookTime] = useState<string>('11:00 AM');
  const [bookNotes, setBookNotes] = useState<string>('');
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Cancellation State
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Minimum date is today
  const [minDate] = useState(() => new Date().toISOString().split('T')[0]);

  const loadAppointments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setErrorMsg(null);

    const { data, error } = await fetchCustomerAppointments(user);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setAppointments(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    async function execute() {
      if (!user) return;
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await fetchCustomerAppointments(user);
      if (!cancelled) {
        if (error) {
          setErrorMsg(error.message);
        } else {
          setAppointments(data);
        }
        setLoading(false);
      }
    }

    execute();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!window.confirm('Are you sure you want to cancel this pending appointment enquiry?')) {
      return;
    }

    setCancellingId(appointmentId);
    const { success, error } = await cancelCustomerAppointment(appointmentId);
    setCancellingId(null);

    if (success) {
      setAppointments(prev =>
        prev.map(app => (app.id === appointmentId ? { ...app, status: 'cancelled' } : app))
      );
      showToast('Appointment enquiry cancelled.');
    } else {
      alert(`Could not cancel appointment: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleNewBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!bookDate) {
      setBookingError('Please select your preferred date.');
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    const customerName = customerProfile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Valued Client';
    const customerPhone = customerProfile?.phone || user.user_metadata?.phone || BUSINESS_CONFIG.contact.phoneRaw;

    const { data, error } = await submitAppointment({
      customer_name: customerName,
      phone: customerPhone,
      service: bookService,
      appointment_date: bookDate,
      appointment_time: bookTime,
      notes: bookNotes,
      user_id: user.id,
      customer_email: user.email || undefined,
    });

    setBookingLoading(false);

    if (error || !data) {
      setBookingError(error?.message || 'Failed to submit appointment.');
      return;
    }

    // Insert into local state
    setAppointments(prev => [data, ...prev]);
    setShowBookingModal(false);
    setBookNotes('');
    showToast('New appointment request registered!');

    // Open WhatsApp confirmation
    const refCode = `SWISS-${data.id.slice(0, 8).toUpperCase()}`;
    const whatsappMsg =
      `*New Appointment Request — Swiss Beauty Parlour*\n` +
      `*Booking Ref:* ${refCode}\n\n` +
      `*Customer Name:* ${customerName}\n` +
      `*Requested Service:* ${bookService}\n` +
      `*Preferred Date:* ${bookDate}\n` +
      `*Preferred Time:* ${bookTime}\n` +
      (bookNotes.trim() ? `*Special Notes:* ${bookNotes.trim()}\n\n` : `\n`) +
      `*Status:* Pending salon confirmation`;

    window.open(
      `https://wa.me/${BUSINESS_CONFIG.contact.whatsappRaw}?text=${encodeURIComponent(whatsappMsg)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const displayName = customerProfile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Client';

  return (
    <div className="customer-dashboard-layout">
      {/* Top Header */}
      <header className="customer-header">
        <div className="customer-header-inner">
          <div className="customer-brand">
            <a href="/" className="brand-link" title="Visit Swiss Beauty Parlour">
              <span className="customer-wordmark">SWISS</span>
              <span className="customer-sub">CLIENT ATELIER</span>
            </a>
            <div className="verified-pill">
              <ShieldCheck size={13} className="pill-icon" />
              <span>Verified Client</span>
            </div>
          </div>

          <div className="customer-header-actions">
            {role === 'admin' && (
              <a href="/admin" className="btn btn-secondary btn-sm" style={{ borderColor: 'var(--color-berry)' }}>
                <span>Switch to Admin Atelier</span>
              </a>
            )}

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowBookingModal(true)}
            >
              <PlusCircle size={15} />
              <span>Book Service</span>
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleSignOut}
              title="Sign Out of Portal"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="customer-main">
        <div className="customer-container">
          {/* Feedback Toast */}
          {feedbackToast && (
            <div className="customer-toast" role="status">
              <CheckCircle2 size={16} />
              <span>{feedbackToast}</span>
            </div>
          )}

          {/* Hero Welcome Banner */}
          <div className="customer-welcome-card">
            <div className="welcome-text-col">
              <span className="eyebrow">
                <Sparkles size={12} />
                Client Dashboard
              </span>
              <h1 className="welcome-heading">Welcome, {displayName}</h1>
              <p className="welcome-sub">
                Track your appointments, view salon status updates, and request personalized beauty treatments with Swiss Beauty Parlour.
              </p>
            </div>

            <div className="quick-stats-row">
              <div className="stat-card">
                <span className="stat-number">{appointments.length}</span>
                <span className="stat-label">Total Requests</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">
                  {appointments.filter(a => a.status === 'confirmed').length}
                </span>
                <span className="stat-label">Confirmed</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">
                  {appointments.filter(a => a.status === 'pending').length}
                </span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
          </div>

          {/* Appointments Section Header */}
          <div className="appointments-section-header">
            <div>
              <h2 className="section-title">My Appointment History</h2>
              <p className="section-desc">
                Appointments requested through your account at Swiss Beauty Parlour, Patamata.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={loadAppointments}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? 'btn-spinner' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="customer-error-banner" role="alert">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Appointments Content */}
          {loading ? (
            <div className="customer-loading-box">
              <RefreshCw size={32} className="btn-spinner" />
              <p>Retrieving your appointment records...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="customer-empty-box">
              <Calendar size={52} className="empty-icon" />
              <h3 className="empty-title">No Appointments Yet</h3>
              <p className="empty-sub">
                You haven't requested any beauty or styling sessions yet. Book your first appointment to experience tailored care in Patamata.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowBookingModal(true)}
                style={{ marginTop: '1.25rem' }}
              >
                <PlusCircle size={16} />
                <span>Book Your First Session</span>
              </button>
            </div>
          ) : (
            <div className="appointments-grid">
              {appointments.map(app => {
                const refCode = `SWISS-${app.id.slice(0, 8).toUpperCase()}`;

                return (
                  <article key={app.id} className={`appointment-card card-status-${app.status}`}>
                    <div className="app-card-top">
                      <div className="app-ref-badge">
                        <span>Ref:</span>
                        <strong>{refCode}</strong>
                      </div>
                      <span className={`status-badge status-${app.status}`}>
                        {app.status === 'pending' && '⏳ Pending Confirmation'}
                        {app.status === 'confirmed' && '✓ Confirmed'}
                        {app.status === 'completed' && '★ Completed'}
                        {app.status === 'cancelled' && '✕ Cancelled'}
                      </span>
                    </div>

                    <h3 className="app-service-title">{app.service}</h3>

                    <div className="app-details-list">
                      <div className="app-detail-item">
                        <Calendar size={15} className="detail-icon" />
                        <span>Date: <strong>{app.appointment_date}</strong></span>
                      </div>
                      <div className="app-detail-item">
                        <Clock size={15} className="detail-icon" />
                        <span>Slot: <strong>{app.appointment_time}</strong></span>
                      </div>
                      {app.notes && (
                        <div className="app-detail-notes">
                          <span className="notes-label">Special Notes:</span>
                          <p className="notes-text">{app.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="app-card-actions">
                      {/* WhatsApp Enquiry Button */}
                      <a
                        href={`https://wa.me/${BUSINESS_CONFIG.contact.whatsappRaw}?text=${encodeURIComponent(
                          `Hello Swiss Beauty Parlour, I am inquiring about my appointment booking ${refCode} for ${app.service} on ${app.appointment_date}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp btn-sm"
                        title="Chat with parlour team on WhatsApp"
                      >
                        <MessageSquare size={13} />
                        <span>WhatsApp Chat</span>
                      </a>

                      {/* Cancel Button if Pending */}
                      {app.status === 'pending' && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm btn-cancel-req"
                          onClick={() => handleCancelAppointment(app.id)}
                          disabled={cancellingId === app.id}
                        >
                          {cancellingId === app.id ? 'Cancelling...' : 'Cancel Request'}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Quick Help Strip */}
          <div className="customer-help-banner">
            <div className="help-text">
              <h4>Need Immediate Assistance or Schedule Adjustments?</h4>
              <p>
                Reach our Patamata salon reception directly at <strong>{BUSINESS_CONFIG.contact.phoneDisplay}</strong> during salon hours.
              </p>
            </div>
            <div className="help-actions">
              <a href={`tel:${BUSINESS_CONFIG.contact.phoneRaw}`} className="btn btn-secondary btn-sm">
                <Phone size={14} />
                <span>Call Salon</span>
              </a>
              <a href="/" className="btn btn-ghost btn-sm" target="_blank" rel="noopener noreferrer">
                <span>View Full Services</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Book New Appointment Modal */}
      {showBookingModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-book-title">
          <div className="modal-card">
            <div className="modal-header">
              <h3 id="modal-book-title" className="modal-title">Book a Beauty Treatment</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowBookingModal(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {bookingError && (
              <div className="modal-error-alert" role="alert">
                <AlertCircle size={16} />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleNewBookingSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="modalService" className="form-label">Select Service</label>
                <select
                  id="modalService"
                  className="form-select"
                  value={bookService}
                  onChange={e => setBookService(e.target.value)}
                >
                  {SERVICES_CATALOGUE.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                  <option value="Consultation / Multiple Services">Other / In-Salon Consultation</option>
                </select>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="modalDate" className="form-label">Preferred Date</label>
                  <input
                    type="date"
                    id="modalDate"
                    required
                    min={minDate}
                    className="form-input"
                    value={bookDate}
                    onChange={e => setBookDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="modalTime" className="form-label">Preferred Time</label>
                  <select
                    id="modalTime"
                    className="form-select"
                    value={bookTime}
                    onChange={e => setBookTime(e.target.value)}
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

              <div className="form-group">
                <label htmlFor="modalNotes" className="form-label">Notes or Preferences (Optional)</label>
                <textarea
                  id="modalNotes"
                  rows={2}
                  className="form-textarea"
                  placeholder="Hair length, skin allergies, bridal event timing..."
                  value={bookNotes}
                  onChange={e => setBookNotes(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowBookingModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <>
                      <RefreshCw size={14} className="btn-spinner" />
                      <span>Saving Request...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Request & Open WhatsApp</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
