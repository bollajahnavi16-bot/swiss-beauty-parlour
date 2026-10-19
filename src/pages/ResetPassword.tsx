import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  KeyRound,
  Check
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './ResetPassword.css';

type TokenStatus = 'verifying' | 'valid' | 'invalid' | 'success';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { updatePassword, signOut } = useAuth();

  // Verification & Form State
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Inputs
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(4);

  // Parse hash and search parameters
  const { hashError, hasRecoveryTokens, isExplicitRecovery } = useMemo(() => {
    const hash = window.location.hash || '';
    const search = window.location.search || '';

    const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
    const searchParams = new URLSearchParams(search);

    const errorParam =
      hashParams.get('error_description') ||
      searchParams.get('error_description') ||
      hashParams.get('error') ||
      searchParams.get('error');

    const typeParam = hashParams.get('type') || searchParams.get('type');
    const accessToken = hashParams.get('access_token');
    const code = searchParams.get('code');

    return {
      hashError: errorParam ? decodeURIComponent(errorParam.replace(/\+/g, ' ')) : null,
      hasRecoveryTokens: Boolean(accessToken || code),
      isExplicitRecovery: typeParam === 'recovery' || Boolean(accessToken || code),
    };
  }, []);

  // Securely validate the recovery token / session
  useEffect(() => {
    let isMounted = true;

    async function checkRecoverySession() {
      if (!isSupabaseConfigured()) {
        if (isMounted) {
          setTokenStatus('invalid');
          setErrorMessage('Your password reset link is invalid or has expired. Please request a new one.');
        }
        return;
      }

      // Check if URL directly contains an error (e.g. otp_expired, link invalid)
      if (hashError) {
        if (isMounted) {
          setTokenStatus('invalid');
          setErrorMessage('Your password reset link is invalid or has expired. Please request a new one.');
        }
        return;
      }

      // Check if there is an authorization code in query params (PKCE flow)
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      if (code) {
        try {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('Code exchange failed:', exchangeError);
            if (isMounted) {
              setTokenStatus('invalid');
              setErrorMessage('Your password reset link is invalid or has expired. Please request a new one.');
            }
            return;
          }
        } catch (err) {
          console.error('Code exchange exception:', err);
          if (isMounted) {
            setTokenStatus('invalid');
            setErrorMessage('Your password reset link is invalid or has expired. Please request a new one.');
          }
          return;
        }
      }

      // Check active session established by Supabase client
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session retrieval error:', sessionError);
          if (isMounted) {
            setTokenStatus('invalid');
            setErrorMessage('Your password reset link is invalid or has expired. Please request a new one.');
          }
          return;
        }

        // Valid session exists under recovery context
        if (session && (isExplicitRecovery || session.user)) {
          if (isMounted) {
            setTokenStatus('valid');
            setErrorMessage(null);
          }
          return;
        }

        // Direct navigation without recovery token or session
        if (!hasRecoveryTokens && !session) {
          if (isMounted) {
            setTokenStatus('invalid');
            setErrorMessage('Your password reset link is invalid or has expired. Please request a new one.');
          }
          return;
        }

        // Fallback wait for onAuthStateChange to fire if tokens are being processed asynchronously
        const timeout = setTimeout(() => {
          if (isMounted && tokenStatus === 'verifying') {
            setTokenStatus('invalid');
            setErrorMessage('Your password reset link is invalid or has expired. Please request a new one.');
          }
        }, 2000);

        return () => clearTimeout(timeout);
      } catch (err) {
        console.error('Token verification exception:', err);
        if (isMounted) {
          setTokenStatus('invalid');
          setErrorMessage('Your password reset link is invalid or has expired. Please request a new one.');
        }
      }
    }

    checkRecoverySession();

    // Listen for auth state change specifically for PASSWORD_RECOVERY or SIGNED_IN
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setTokenStatus('valid');
        setErrorMessage(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [hashError, hasRecoveryTokens, isExplicitRecovery, tokenStatus]);

  // Validation rules criteria
  const criteria = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=\\/[\]]/.test(password),
      passwordsMatch: password.length > 0 && password === confirmPassword,
    };
  }, [password, confirmPassword]);

  // Password strength score calculation (0 to 4)
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: 'None', color: 'none', percent: 0 };
    let score = 0;
    if (criteria.minLength) score += 1;
    if (criteria.hasUpper && criteria.hasLower) score += 1;
    if (criteria.hasNumber) score += 1;
    if (criteria.hasSpecial) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'weak', percent: 25 };
      case 2:
        return { score: 2, label: 'Fair', color: 'fair', percent: 50 };
      case 3:
        return { score: 3, label: 'Good', color: 'good', percent: 75 };
      case 4:
        return { score: 4, label: 'Strong', color: 'strong', percent: 100 };
      default:
        return { score: 0, label: 'Weak', color: 'weak', percent: 15 };
    }
  }, [password, criteria]);

  const isFormValid =
    criteria.minLength &&
    criteria.hasUpper &&
    criteria.hasLower &&
    criteria.hasNumber &&
    criteria.hasSpecial &&
    criteria.passwordsMatch;

  // Handle password update submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isFormValid) {
      setErrorMessage('Please ensure your new password meets all security criteria below.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { success, error } = await updatePassword(password);
      setIsSubmitting(false);

      if (error || !success) {
        const errorMsg = error?.message || 'Failed to update your password.';
        console.error('Password update failure:', errorMsg);

        if (
          errorMsg.toLowerCase().includes('expired') ||
          errorMsg.toLowerCase().includes('jwt') ||
          errorMsg.toLowerCase().includes('not authorized') ||
          errorMsg.toLowerCase().includes('session')
        ) {
          setTokenStatus('invalid');
          setErrorMessage('Your password reset link is invalid or has expired. Please request a new one.');
          return;
        }

        setErrorMessage(errorMsg);
        return;
      }

      // Success: Clear sensitive fields immediately
      setPassword('');
      setConfirmPassword('');
      setTokenStatus('success');

      // Clear tokens from URL for clean browser state
      if (window.history?.replaceState) {
        window.history.replaceState(null, document.title, window.location.pathname);
      }

      // Sign out of the temporary recovery session
      await signOut();
    } catch (err) {
      setIsSubmitting(false);
      console.error('Unexpected reset error:', err);
      setErrorMessage('An unexpected error occurred while updating your password. Please try again.');
    }
  };

  // Redirect countdown on success
  useEffect(() => {
    if (tokenStatus !== 'success') return;

    const timer = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/login', {
            replace: true,
            state: {
              resetSuccess: 'Your password has been successfully reset. Please sign in with your new password.',
            },
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [tokenStatus, navigate]);

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        {/* Brand Header */}
        <div className="reset-branding">
          <Link to="/" className="reset-logo-link" title="Return to Swiss Beauty Parlour Home">
            <span className="brand-wordmark">SWISS</span>
            <span className="brand-sub">BEAUTY PARLOUR</span>
          </Link>
          <div className="reset-auth-badge">
            <Sparkles size={12} className="auth-badge-icon" aria-hidden="true" />
            <span>Secure Password Recovery</span>
          </div>
        </div>

        {/* Card Box */}
        <div className="reset-card-box">
          {/* STATE 1: VERIFYING TOKEN */}
          {tokenStatus === 'verifying' && (
            <div className="reset-state-center">
              <div className="reset-loading-spinner-wrap">
                <RefreshCw size={36} className="btn-spinner reset-spinner" aria-hidden="true" />
              </div>
              <h1 className="reset-card-title">Verifying Reset Link</h1>
              <p className="reset-card-sub">
                Please wait while we verify your security credentials...
              </p>
            </div>
          )}

          {/* STATE 2: INVALID OR EXPIRED TOKEN */}
          {tokenStatus === 'invalid' && (
            <div className="reset-state-center">
              <div className="reset-invalid-icon-wrap">
                <ShieldAlert size={36} className="reset-invalid-icon" aria-hidden="true" />
              </div>
              <h1 className="reset-card-title">Link Invalid or Expired</h1>
              <p className="reset-card-sub reset-error-explanation">
                {errorMessage || 'Your password reset link is invalid or has expired. Please request a new one.'}
              </p>

              <div className="reset-action-buttons">
                <Link
                  to="/forgot-password"
                  className="btn btn-primary reset-request-new-btn"
                  id="request-new-link-btn"
                >
                  <KeyRound size={16} aria-hidden="true" />
                  <span>Request New Reset Link</span>
                </Link>

                <Link to="/login" className="back-login-link">
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          )}

          {/* STATE 3: VALID TOKEN - ENTER NEW PASSWORD */}
          {tokenStatus === 'valid' && (
            <>
              <div className="reset-card-header">
                <div className="reset-header-icon-wrap">
                  <Lock size={26} className="reset-header-icon" aria-hidden="true" />
                </div>
                <h1 className="reset-card-title">Create New Password</h1>
                <p className="reset-card-sub">
                  Set a new, secure password for your Swiss Beauty Parlour account.
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="auth-error-alert" role="alert">
                  <AlertCircle size={16} className="error-icon" aria-hidden="true" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form" noValidate>
                {/* New Password */}
                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">
                    New Password <span className="req">*</span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      autoComplete="new-password"
                      required
                      placeholder="Enter new password"
                      className="form-input password-input"
                      value={password}
                      onChange={e => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      disabled={isSubmitting}
                      autoFocus
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

                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <div className="password-strength-container" aria-live="polite">
                      <div className="strength-header">
                        <span className="strength-caption">Password Strength:</span>
                        <span className={`strength-label ${strength.color}`}>{strength.label}</span>
                      </div>
                      <div className="strength-track">
                        <div
                          className={`strength-bar ${strength.color}`}
                          style={{ width: `${strength.percent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="form-group">
                  <label htmlFor="confirmNewPassword" className="form-label">
                    Confirm New Password <span className="req">*</span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      autoComplete="new-password"
                      required
                      placeholder="Re-type new password"
                      className="form-input password-input"
                      value={confirmPassword}
                      onChange={e => {
                        setConfirmPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Password Criteria Real-Time Checklist */}
                <div className="password-criteria-card" aria-live="polite">
                  <span className="criteria-header">Password Requirements:</span>
                  <ul className="criteria-list">
                    <li className={`criteria-item ${criteria.minLength ? 'valid' : ''}`}>
                      {criteria.minLength ? (
                        <Check size={14} className="crit-icon check" aria-hidden="true" />
                      ) : (
                        <span className="crit-dot" aria-hidden="true" />
                      )}
                      <span>At least 8 characters long</span>
                    </li>
                    <li className={`criteria-item ${criteria.hasUpper && criteria.hasLower ? 'valid' : ''}`}>
                      {criteria.hasUpper && criteria.hasLower ? (
                        <Check size={14} className="crit-icon check" aria-hidden="true" />
                      ) : (
                        <span className="crit-dot" aria-hidden="true" />
                      )}
                      <span>Uppercase &amp; lowercase letters</span>
                    </li>
                    <li className={`criteria-item ${criteria.hasNumber ? 'valid' : ''}`}>
                      {criteria.hasNumber ? (
                        <Check size={14} className="crit-icon check" aria-hidden="true" />
                      ) : (
                        <span className="crit-dot" aria-hidden="true" />
                      )}
                      <span>At least one number (0–9)</span>
                    </li>
                    <li className={`criteria-item ${criteria.hasSpecial ? 'valid' : ''}`}>
                      {criteria.hasSpecial ? (
                        <Check size={14} className="crit-icon check" aria-hidden="true" />
                      ) : (
                        <span className="crit-dot" aria-hidden="true" />
                      )}
                      <span>At least one special character (!@#$%^&amp;*)</span>
                    </li>
                    <li className={`criteria-item ${criteria.passwordsMatch ? 'valid' : ''}`}>
                      {criteria.passwordsMatch ? (
                        <Check size={14} className="crit-icon check" aria-hidden="true" />
                      ) : (
                        <span className="crit-dot" aria-hidden="true" />
                      )}
                      <span>Passwords match</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary auth-submit-btn"
                  disabled={isSubmitting || !isFormValid}
                  id="update-password-btn"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={16} className="btn-spinner" aria-hidden="true" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={16} aria-hidden="true" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* STATE 4: SUCCESS STATE */}
          {tokenStatus === 'success' && (
            <div className="reset-state-center">
              <div className="reset-success-icon-wrap">
                <CheckCircle2 size={42} className="reset-success-icon" aria-hidden="true" />
              </div>
              <h1 className="reset-card-title">Password Reset Complete!</h1>
              <p className="reset-card-sub">
                Your password has been securely updated. You can now sign in to your Swiss Beauty Parlour account using your new password.
              </p>

              <div className="reset-redirect-box">
                <span>Redirecting to Sign In in {redirectCountdown} seconds...</span>
              </div>

              <Link
                to="/login"
                state={{
                  resetSuccess:
                    'Your password has been successfully reset. Please sign in with your new password.',
                }}
                className="btn btn-primary auth-submit-btn reset-success-btn"
                id="reset-success-signin-btn"
              >
                <span>Back to Login</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          )}

          {/* Footer Back Link */}
          {tokenStatus !== 'success' && (
            <div className="auth-card-footer">
              <Link to="/login" className="back-login-link">
                <span>Back to Login</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
