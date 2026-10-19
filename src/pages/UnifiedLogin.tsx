import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, UserCheck, AlertCircle, RefreshCw, ArrowLeft, Sparkles, Heart, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured, getSupabaseConfigValidation } from '../lib/supabase';
import './UnifiedLogin.css';

export const UnifiedLogin: React.FC = () => {
  const { user, role, loading: authLoading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'signin' | 'register'
  const [mode, setMode] = useState<'signin' | 'register'>('signin');

  // Sign In Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Form State (Customer Sign Up)
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Processing & Error State
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Check for reset password success notification or notice passed in location state
  useEffect(() => {
    if (location.state?.resetSuccess) {
      setSuccessNotice(location.state.resetSuccess);
      // Clean up history state so reloading doesn't re-trigger it
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // If user is already authenticated, redirect them automatically based on their role
  useEffect(() => {
    if (!authLoading && user && role) {
      const fromPath = (location.state as any)?.from?.pathname;
      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(fromPath && fromPath !== '/login' ? fromPath : '/customer', { replace: true });
      }
    }
  }, [user, role, authLoading, navigate, location]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSuccessNotice(null);

    if (!isSupabaseConfigured()) {
      const { error: configError } = getSupabaseConfigValidation();
      setAuthError(
        configError ||
        'Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
      );
      return;
    }

    setSubmitting(true);

    const { error, role: detectedRole } = await signIn(email, password);
    setSubmitting(false);

    if (error) {
      setAuthError(error.message);
      return;
    }

    // Role-based automatic redirection (NO manual role selection required!)
    const fromPath = (location.state as any)?.from?.pathname;
    if (detectedRole === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate(fromPath && fromPath !== '/login' ? fromPath : '/customer', { replace: true });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSuccessNotice(null);

    if (!isSupabaseConfigured()) {
      const { error: configError } = getSupabaseConfigValidation();
      setAuthError(
        configError ||
        'Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
      );
      return;
    }

    // Basic client validation
    if (regFullName.trim().length < 2) {
      setAuthError('Please enter your full name (at least 2 characters).');
      return;
    }

    const cleanPhone = regPhone.replace(/[\s\-()]/g, '');
    if (cleanPhone.length < 10) {
      setAuthError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (regPassword.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);

    const { error } = await signUp(regEmail, regPassword, regFullName, regPhone);
    setSubmitting(false);

    if (error) {
      setAuthError(error.message);
      return;
    }

    setSuccessNotice(
      'Account created successfully! Redirecting to your personal Customer Portal...'
    );

    setTimeout(() => {
      navigate('/customer', { replace: true });
    }, 900);
  };

  return (
    <div className="unified-login-page">
      <div className="unified-login-container">
        {/* Brand Header */}
        <div className="login-branding">
          <a href="/" className="login-logo-link" title="Return to Swiss Beauty Parlour Home">
            <span className="brand-wordmark">SWISS</span>
            <span className="brand-sub">BEAUTY PARLOUR</span>
          </a>
          <div className="unified-auth-badge">
            <Sparkles size={12} className="auth-badge-icon" />
            <span>Unified Salon Portal</span>
          </div>
        </div>

        {/* Card Frame */}
        <div className="login-card-box">
          {/* Mode Switch Tabs */}
          <div className="auth-mode-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signin'}
              className={`mode-tab ${mode === 'signin' ? 'active' : ''}`}
              onClick={() => {
                setMode('signin');
                setAuthError(null);
                setSuccessNotice(null);
              }}
            >
              <UserCheck size={16} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={`mode-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setMode('register');
                setAuthError(null);
                setSuccessNotice(null);
              }}
            >
              <Heart size={16} />
              <span>Customer Registration</span>
            </button>
          </div>

          {/* Heading */}
          <div className="auth-card-header">
            <h1 className="auth-card-title">
              {mode === 'signin' ? 'Welcome Back' : 'Create Client Account'}
            </h1>
            <p className="auth-card-sub">
              {mode === 'signin'
                ? 'Sign in with your email and password. Your dashboard will open automatically.'
                : 'Register as a client to manage appointments, track services, and enjoy personalized care.'}
            </p>
          </div>

          {/* Unconfigured Notice */}
          {!isSupabaseConfigured() && (
            <div className="auth-warning-alert">
              <AlertCircle size={18} className="warn-icon" />
              <div>
                <strong>Supabase Setup Required:</strong>
                <p>
                  Please configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your root <code>.env</code> file to enable database authentication.
                </p>
              </div>
            </div>
          )}

          {/* Error & Success Alerts */}
          {authError && (
            <div className="auth-error-alert" role="alert">
              <AlertCircle size={16} className="error-icon" />
              <span>{authError}</span>
            </div>
          )}

          {successNotice && (
            <div className="auth-success-alert" role="status">
              <Sparkles size={16} className="success-icon" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Sign In Form (For Both Admins and Customers) */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="auth-form" noValidate>
              <div className="form-group">
                <label htmlFor="loginEmail" className="form-label">
                  Email Address <span className="req">*</span>
                </label>
                <input
                  type="email"
                  id="loginEmail"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                  className="form-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="loginPassword" className="form-label">
                  Password <span className="req">*</span>
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="loginPassword"
                    name="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••••••"
                    className="form-input password-input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <div className="forgot-password-row">
                  <Link
                    to="/forgot-password"
                    className="forgot-password-link"
                    id="forgot-password-link"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary auth-submit-btn"
                disabled={submitting}
                id="unified-signin-btn"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={16} className="btn-spinner" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>Sign In to Portal</span>
                  </>
                )}
              </button>

              <div className="auth-helper-note">
                <p>
                  Admins and registered clients sign in above. You will be routed directly to your authorized portal.
                </p>
              </div>
            </form>
          ) : (
            /* Customer Registration Form */
            <form onSubmit={handleRegister} className="auth-form" noValidate>
              <div className="form-group">
                <label htmlFor="regFullName" className="form-label">
                  Full Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id="regFullName"
                  name="fullName"
                  required
                  placeholder="e.g. Ananya Rao"
                  className="form-input"
                  value={regFullName}
                  onChange={e => setRegFullName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="regPhone" className="form-label">
                  Mobile Number (10 digits) <span className="req">*</span>
                </label>
                <input
                  type="tel"
                  id="regPhone"
                  name="phone"
                  required
                  placeholder="e.g. 9876543210"
                  className="form-input"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="regEmail" className="form-label">
                  Email Address <span className="req">*</span>
                </label>
                <input
                  type="email"
                  id="regEmail"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="ananya@example.com"
                  className="form-input"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="regPassword" className="form-label">
                  Create Password (minimum 6 characters) <span className="req">*</span>
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    id="regPassword"
                    name="password"
                    autoComplete="new-password"
                    required
                    placeholder="••••••••••••"
                    className="form-input password-input"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                    title={showRegPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showRegPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary auth-submit-btn"
                disabled={submitting}
                id="unified-signup-btn"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={16} className="btn-spinner" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <Heart size={15} />
                    <span>Create Customer Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Back Link */}
          <div className="auth-card-footer">
            <a href="/" className="back-home-link">
              <ArrowLeft size={14} />
              <span>Back to Swiss Beauty Parlour</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
