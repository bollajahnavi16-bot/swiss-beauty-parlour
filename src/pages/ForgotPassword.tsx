import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, RefreshCw, KeyRound, Sparkles, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured, getSupabaseConfigValidation } from '../lib/supabase';
import './ForgotPassword.css';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const COOLDOWN_SECONDS = 60;

export const ForgotPassword: React.FC = () => {
  const { sendPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [rateLimitNotice, setRateLimitNotice] = useState<string | null>(null);

  // Timer countdown for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setClientError('Please enter your email address.');
      return false;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setClientError('Please enter a valid email address (e.g. name@example.com).');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    setRateLimitNotice(null);

    const trimmedEmail = email.trim();
    if (!validateEmail(trimmedEmail)) return;

    if (cooldown > 0) {
      setClientError(`Please wait ${cooldown} seconds before requesting another reset email.`);
      return;
    }

    if (!isSupabaseConfigured()) {
      const { error: configError } = getSupabaseConfigValidation();
      setClientError(
        configError ||
        'Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
      );
      return;
    }

    setSubmitting(true);

    try {
      const { error, isRateLimited } = await sendPasswordReset(trimmedEmail);
      setSubmitting(false);

      if (isRateLimited || (error && error.message.toLowerCase().includes('rate limit'))) {
        setCooldown(COOLDOWN_SECONDS);
        setClientError(
          'Email not sent (Supabase hourly limit reached). Supabase free tier restricts built-in email delivery to 3 emails per hour for this project. To send password reset emails immediately without rate limits, please configure Custom SMTP in your Supabase Dashboard (Project Settings > Authentication > SMTP Settings).'
        );
        setIsSuccess(false);
        return;
      }

      if (error) {
        console.error('Password reset request error:', error);
        setClientError(
          'We encountered an issue processing your request: ' + error.message
        );
        setIsSuccess(false);
        return;
      }

      // Successful request: Email dispatched by provider
      setCooldown(COOLDOWN_SECONDS);
      setSubmittedEmail(trimmedEmail);
      setIsSuccess(true);
    } catch (err) {
      setSubmitting(false);
      console.error('Unexpected password reset error:', err);
      setClientError('An unexpected error occurred. Please try again.');
    }
  };

  const handleResetAnother = () => {
    setIsSuccess(false);
    setEmail('');
    setClientError(null);
    setRateLimitNotice(null);
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        {/* Brand Header */}
        <div className="forgot-branding">
          <Link to="/" className="forgot-logo-link" title="Return to Swiss Beauty Parlour Home">
            <span className="brand-wordmark">SWISS</span>
            <span className="brand-sub">BEAUTY PARLOUR</span>
          </Link>
          <div className="forgot-auth-badge">
            <Sparkles size={12} className="auth-badge-icon" />
            <span>Secure Account Recovery</span>
          </div>
        </div>

        {/* Card Box */}
        <div className="forgot-card-box">
          {!isSuccess ? (
            /* Reset Request Form */
            <>
              <div className="forgot-card-header">
                <div className="forgot-header-icon-wrap">
                  <KeyRound size={26} className="forgot-header-icon" />
                </div>
                <h1 className="forgot-card-title">Forgot Password?</h1>
                <p className="forgot-card-sub">
                  Enter your registered email address and we will send you secure, single-use instructions to reset your password.
                </p>
              </div>

              {/* Error Alert */}
              {clientError && (
                <div className="auth-error-alert" role="alert">
                  <AlertCircle size={16} className="error-icon" />
                  <span>{clientError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form" noValidate>
                <div className="form-group">
                  <label htmlFor="resetEmail" className="form-label">
                    Registered Email Address <span className="req">*</span>
                  </label>
                  <div className="forgot-input-wrapper">
                    <Mail size={18} className="forgot-input-icon" />
                    <input
                      type="email"
                      id="resetEmail"
                      name="email"
                      autoComplete="email"
                      required
                      placeholder="name@example.com"
                      className="form-input forgot-input"
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value);
                        if (clientError) setClientError(null);
                      }}
                      disabled={submitting}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary auth-submit-btn"
                  disabled={submitting || (cooldown > 0 && isSuccess)}
                  id="send-reset-link-btn"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={16} className="btn-spinner" />
                      <span>Sending Secure Link...</span>
                    </>
                  ) : cooldown > 0 ? (
                    <>
                      <Clock size={16} />
                      <span>Wait {cooldown}s to Resend</span>
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      <span>Send Password Reset Link</span>
                    </>
                  )}
                </button>
              </form>

              <div className="forgot-security-tip">
                <p>
                  <strong>Security Guarantee:</strong> Reset links are encrypted, valid for a single use, and expire automatically after a limited time.
                </p>
              </div>
            </>
          ) : (
            /* Success / Neutral Confirmation State */
            <div className="forgot-success-view">
              <div className="forgot-success-icon-wrap">
                <CheckCircle2 size={36} className="forgot-success-icon" />
              </div>

              <h2 className="forgot-card-title">Check Your Inbox</h2>

              {/* NEUTRAL CONFIRMATION MESSAGE (Prevents Email Enumeration) */}
              <div className="neutral-confirmation-box" role="status">
                <p>
                  If an account is associated with <strong>{submittedEmail}</strong>, you will receive password reset instructions shortly.
                </p>
              </div>

              {rateLimitNotice && (
                <div className="auth-warning-alert rate-limit-alert">
                  <Clock size={16} className="warn-icon" />
                  <span>{rateLimitNotice}</span>
                </div>
              )}

              <div className="next-steps-list">
                <div className="next-step-item">
                  <span className="step-num">1</span>
                  <span>Open your email client and look for an email from <strong>Swiss Beauty Parlour</strong>.</span>
                </div>
                <div className="next-step-item">
                  <span className="step-num">2</span>
                  <span>Click the secure button or link inside to set a new password.</span>
                </div>
                <div className="next-step-item">
                  <span className="step-num">3</span>
                  <span>If it doesn&apos;t arrive in 3 minutes, check your Spam or Promotions folder.</span>
                </div>
              </div>

              <div className="forgot-success-actions">
                <button
                  type="button"
                  className="btn btn-secondary forgot-resend-btn"
                  onClick={handleSubmit}
                  disabled={submitting || cooldown > 0}
                  id="resend-reset-btn"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={15} className="btn-spinner" />
                      <span>Resending...</span>
                    </>
                  ) : cooldown > 0 ? (
                    <>
                      <Clock size={15} />
                      <span>Resend available in {cooldown}s</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={15} />
                      <span>Resend Email</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="forgot-different-email-btn"
                  onClick={handleResetAnother}
                >
                  Try a different email address
                </button>
              </div>
            </div>
          )}

          {/* Card Footer Navigation */}
          <div className="auth-card-footer forgot-footer">
            <Link to="/login" className="back-login-link" id="back-to-login-link">
              <ArrowLeft size={14} />
              <span>Return to Sign In</span>
            </Link>
            <span className="footer-dot">•</span>
            <Link to="/" className="back-home-link">
              <span>Return to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
