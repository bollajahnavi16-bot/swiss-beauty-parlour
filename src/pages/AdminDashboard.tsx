import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Calendar,
  Clock,
  Phone,
  Search,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  X,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  fetchAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  type Appointment,
  type AppointmentStatus
} from '../lib/supabase';
import { BUSINESS_CONFIG } from '../data/businessConfig';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  const { user, role, loading: authChecking, signOut } = useAuth();
  const navigate = useNavigate();

  const isAdmin = role === 'admin';
  const sessionUser = user;

  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Delete modal state
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Status updating state map (appointmentId -> boolean)
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Success flash feedback
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Fetch appointments when admin is authenticated
  const loadAppointments = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingAppointments(true);
    setFetchError(null);

    const { data, error } = await fetchAppointments({
      status: statusFilter,
      search: searchQuery,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      limit: 100
    });

    if (error) {
      setFetchError(error.message);
    } else {
      setAppointments(data);
    }
    setLoadingAppointments(false);
  }, [isAdmin, statusFilter, searchQuery, dateFrom, dateTo]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;

    async function executeFetch() {
      setLoadingAppointments(true);
      setFetchError(null);

      const { data, error } = await fetchAppointments({
        status: statusFilter,
        search: searchQuery,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        limit: 100
      });

      if (!cancelled) {
        if (error) {
          setFetchError(error.message);
        } else {
          setAppointments(data);
        }
        setLoadingAppointments(false);
      }
    }

    executeFetch();

    return () => {
      cancelled = true;
    };
  }, [isAdmin, statusFilter, searchQuery, dateFrom, dateTo]);

  // Handle Logout
  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  // Handle Status Update
  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    setUpdatingStatusId(appointmentId);
    const { success, error } = await updateAppointmentStatus(appointmentId, newStatus);
    setUpdatingStatusId(null);

    if (success) {
      setAppointments(prev =>
        prev.map(app => (app.id === appointmentId ? { ...app, status: newStatus } : app))
      );
      showFeedback(`Status updated to ${newStatus}`);
    } else {
      alert(`Failed to update status: ${error?.message || 'Unknown error'}`);
    }
  };

  // Handle Delete Confirmation
  const confirmDelete = async () => {
    if (!appointmentToDelete) return;
    setDeleting(true);

    const { success, error } = await deleteAppointment(appointmentToDelete.id);
    setDeleting(false);

    if (success) {
      setAppointments(prev => prev.filter(app => app.id !== appointmentToDelete.id));
      setAppointmentToDelete(null);
      showFeedback('Appointment deleted successfully.');
    } else {
      alert(`Failed to delete appointment: ${error?.message || 'Unknown error'}`);
    }
  };

  // Format Helpers
  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(Number(year), Number(month) - 1, Number(day));
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatCreatedAt = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('en-IN', {
        dateStyle: 'short',
        timeStyle: 'short'
      });
    } catch {
      return isoStr;
    }
  };

  // Loading Screen
  if (authChecking) {
    return (
      <div className="admin-loading-screen">
        <RefreshCw size={36} className="btn-spinner" />
        <p>Verifying secure administrative session...</p>
      </div>
    );
  }

  // Fallback if accessed directly without admin privileges
  if (!sessionUser || !isAdmin) {
    return (
      <div className="admin-login-layout">
        <div className="admin-login-card">
          <div className="admin-login-brand">
            <span className="login-wordmark">SWISS</span>
            <span className="login-sub">BEAUTY PARLOUR</span>
          </div>

          <h2 className="admin-login-title">Admin Access Required</h2>
          <p className="admin-login-desc">
            This dashboard is restricted to verified administrators. Please sign in via the unified login portal with an administrator account.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            onClick={() => navigate('/login')}
          >
            Go to Unified Login
          </button>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="admin-dashboard-layout">
      {/* Top Admin Navigation Header */}
      <header className="admin-header">
        <div className="admin-header-container">
          <div className="admin-header-brand">
            <div className="admin-logo-lockup">
              <span className="admin-wordmark">SWISS</span>
              <span className="admin-sub">PARLOUR DASHBOARD</span>
            </div>
            <div className="admin-security-pill">
              <ShieldCheck size={14} className="shield-icon" />
              <span>RLS Protected</span>
            </div>
          </div>

          <div className="admin-header-actions">
            <a href="/" className="btn btn-secondary btn-sm" target="_blank" rel="noopener noreferrer">
              <span>View Website</span>
              <ExternalLink size={14} />
            </a>

            <div className="admin-user-info">
              <span className="admin-email">{sessionUser?.email || 'Admin'}</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleSignOut}
                title="Sign out of administrative session"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <main className="admin-main">
        <div className="admin-container">
          {/* Status Feedback Toast */}
          {feedbackMessage && (
            <div className="admin-toast" role="status">
              <CheckCircle2 size={16} />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {/* Dashboard Header Bar */}
          <div className="dashboard-title-row">
            <div>
              <h1 className="dashboard-heading">Appointment Requests</h1>
              <p className="dashboard-sub">
                Manage incoming bookings submitted via website. Verified destination: <strong>{BUSINESS_CONFIG.contact.phoneDisplay}</strong>
              </p>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-refresh"
              onClick={loadAppointments}
              disabled={loadingAppointments}
            >
              <RefreshCw size={15} className={loadingAppointments ? 'btn-spinner' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Filter & Search Bar */}
          <div className="admin-filters-card">
            {/* Status Tabs */}
            <div className="status-tabs" role="tablist">
              {[
                { key: 'all', label: 'All Requests' },
                { key: 'pending', label: 'Pending' },
                { key: 'confirmed', label: 'Confirmed' },
                { key: 'completed', label: 'Completed' },
                { key: 'cancelled', label: 'Cancelled' }
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={statusFilter === tab.key}
                  className={`status-tab ${statusFilter === tab.key ? 'active' : ''}`}
                  onClick={() => setStatusFilter(tab.key)}
                >
                  {tab.label}
                  {statusFilter === tab.key && (
                    <span className="tab-count">{appointments.length}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Controls Row: Search + Dates */}
            <div className="controls-row">
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by customer name, phone, or service..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="date-filter-group">
                <div className="date-input-wrapper">
                  <span className="date-label">From:</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="date-input"
                  />
                </div>
                <div className="date-input-wrapper">
                  <span className="date-label">To:</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="date-input"
                  />
                </div>
                {(dateFrom || dateTo) && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setDateFrom('');
                      setDateTo('');
                    }}
                  >
                    Clear Dates
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Fetch Error Display */}
          {fetchError && (
            <div className="dashboard-error-banner" role="alert">
              <AlertCircle size={20} />
              <div>
                <strong>Database Query Error:</strong>
                <p>{fetchError}</p>
              </div>
            </div>
          )}

          {/* Appointments Table / Cards View */}
          <div className="appointments-table-container">
            {loadingAppointments ? (
              <div className="table-loading-state">
                <RefreshCw size={28} className="btn-spinner" />
                <p>Loading appointments from Supabase...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="table-empty-state">
                <Calendar size={48} className="empty-icon" />
                <h3 className="empty-title">No Appointments Found</h3>
                <p className="empty-text">
                  {searchQuery || statusFilter !== 'all' || dateFrom || dateTo
                    ? 'No appointment records match your active search filters.'
                    : 'There are currently no appointment requests registered in the database.'}
                </p>
                {(searchQuery || statusFilter !== 'all' || dateFrom || dateTo) && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '1rem' }}
                    onClick={() => {
                      setStatusFilter('all');
                      setSearchQuery('');
                      setDateFrom('');
                      setDateTo('');
                    }}
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="table-responsive-wrapper">
                <table className="appointments-table">
                  <thead>
                    <tr>
                      <th>Ref & Date Requested</th>
                      <th>Customer</th>
                      <th>Service</th>
                      <th>Scheduled Slot</th>
                      <th>Special Notes</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(app => {
                      const refCode = `SWISS-${app.id.slice(0, 8).toUpperCase()}`;
                      const cleanPhone = app.phone.replace(/[\s\-()]/g, '');

                      return (
                        <tr key={app.id} className={`row-status-${app.status}`}>
                          {/* Ref Code & Submission Time */}
                          <td>
                            <strong className="app-ref-code">{refCode}</strong>
                            <div className="app-meta-sub">
                              Created: {formatCreatedAt(app.created_at)}
                            </div>
                          </td>

                          {/* Customer */}
                          <td>
                            <div className="customer-name">{app.customer_name}</div>
                            <div className="customer-contact-links">
                              <a
                                href={`tel:${cleanPhone}`}
                                className="contact-action-link"
                                title="Call customer"
                              >
                                <Phone size={12} />
                                {app.phone}
                              </a>
                              <a
                                href={`https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone.replace(/^0+/, '')}?text=${encodeURIComponent(
                                  `Hello ${app.customer_name}, regards from Swiss Beauty Parlour regarding your appointment request ${refCode} for ${app.service}.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="contact-action-link whatsapp-link"
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare size={12} />
                                WhatsApp
                              </a>
                            </div>
                          </td>

                          {/* Service */}
                          <td>
                            <span className="app-service-name">{app.service}</span>
                          </td>

                          {/* Appointment Date & Time */}
                          <td>
                            <div className="slot-date">
                              <Calendar size={13} className="slot-icon" />
                              <span>{formatDate(app.appointment_date)}</span>
                            </div>
                            <div className="slot-time">
                              <Clock size={13} className="slot-icon" />
                              <span>{app.appointment_time}</span>
                            </div>
                          </td>

                          {/* Notes */}
                          <td>
                            {app.notes ? (
                              <span className="app-notes-text" title={app.notes}>
                                {app.notes}
                              </span>
                            ) : (
                              <span className="app-no-notes">—</span>
                            )}
                          </td>

                          {/* Status Dropdown */}
                          <td>
                            <div className="status-dropdown-wrapper">
                              <select
                                value={app.status}
                                disabled={updatingStatusId === app.id}
                                onChange={e =>
                                  handleStatusChange(app.id, e.target.value as AppointmentStatus)
                                }
                                className={`status-badge-select badge-${app.status}`}
                              >
                                <option value="pending">⏳ Pending</option>
                                <option value="confirmed">✓ Confirmed</option>
                                <option value="completed">★ Completed</option>
                                <option value="cancelled">✕ Cancelled</option>
                              </select>
                            </div>
                          </td>

                          {/* Delete Action */}
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn-delete-row"
                              onClick={() => setAppointmentToDelete(app)}
                              title="Delete appointment permanently"
                              aria-label={`Delete appointment for ${app.customer_name}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Explicit Delete Confirmation Dialog */}
      {appointmentToDelete && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-icon-circle delete-icon">
                <Trash2 size={24} />
              </div>
              <h3 id="modal-title" className="modal-title">Delete Appointment Request?</h3>
            </div>

            <p className="modal-desc">
              Are you sure you want to permanently delete the booking request for{' '}
              <strong>{appointmentToDelete.customer_name}</strong> on{' '}
              <strong>{formatDate(appointmentToDelete.appointment_date)}</strong> (
              {appointmentToDelete.service})?
            </p>
            <p className="modal-warn">
              This action cannot be undone. The database record will be removed permanently under Row Level Security.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={deleting}
                onClick={() => setAppointmentToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={deleting}
                onClick={confirmDelete}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
