import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, RefreshCw, Lock, ShieldCheck, ShieldAlert } from 'lucide-react';
import copyMLogo from '../image/logo.png';
import authHeroImg from '../assets/auth-hero.png';
import { PortalMode } from '../types';
import { api } from '../services/api';
import { MERCHANT, PLATFORM } from '../utils/sharedMockStore';

export type AuthMode = 'login' | 'register' | 'mfa' | 'forgot';

export interface AuthPageProps {
  onSuccessLogin: (merchantInfo?: { name: string; email: string }) => void;
  initialMode?: AuthMode;
  portalMode?: PortalMode;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onSuccessLogin,
  initialMode = 'login',
  portalMode = 'merchant'
}) => {
  const isAdmin = portalMode === 'admin';
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [activeMerchantName, setActiveMerchantName] = useState<string>(
    isAdmin ? PLATFORM.superAdmin : MERCHANT.signedInUser
  );
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states - Register
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<'terms' | 'privacy' | null>(null);

  // Form states - Forgot Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Live password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: '', color: 'bg-gray-200' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, text: 'Weak', color: 'bg-red-400' };
    if (score <= 2) return { score: 2, text: 'Fair', color: 'bg-amber-400' };
    if (score <= 3) return { score: 3, text: 'Good', color: 'bg-blue-400' };
    return { score: 4, text: 'Strong', color: 'bg-[#007F4E]' };
  };

  // Form states - MFA
  const [mfaDigits, setMfaDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [focusedMfaIndex, setFocusedMfaIndex] = useState<number>(0);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [isRecoveryMode, setIsRecoveryMode] = useState<boolean>(false);
  const [recoveryCode, setRecoveryCode] = useState<string>('');

  // Handler: Sign In
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailTrimmed = loginEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailTrimmed || !emailRegex.test(emailTrimmed)) {
      setErrorMessage(
        isAdmin
          ? 'Please enter a valid platform operator work email.'
          : 'Please enter a valid merchant email address.'
      );
      return;
    }
    if (!loginPassword.trim()) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Send credentials to backend (sets HttpOnly cookie)
      if (isAdmin) {
        await api.adminLogin({ email: emailTrimmed, password: loginPassword });
      } else {
        await api.login({ email: emailTrimmed, password: loginPassword });
      }

      // 2. Fetch authenticated merchant & user profile
      let profile: any = null;
      try {
        profile = await api.getMe();
      } catch {
        // profile fetch fallback if session initialized without getMe
      }

      // 3. Save display info for fast UI hydration
      const merchantName =
        profile?.merchant?.displayName ||
        profile?.merchant?.name ||
        profile?.user?.name ||
        (isAdmin ? PLATFORM.superAdmin : MERCHANT.name);
      const merchantEmail = profile?.user?.email || profile?.email || emailTrimmed;

      setActiveMerchantName(merchantName);
      if (isAdmin) {
        localStorage.removeItem('copym_merchant_session');
        localStorage.setItem('copym_admin_session', 'true');
        localStorage.setItem('copym_session_role', 'admin');
        localStorage.setItem('copym_admin_session_started_at', Date.now().toString());
        localStorage.setItem('copym_admin_name', merchantName);
        localStorage.setItem('copym_admin_email', merchantEmail);
      } else {
        localStorage.removeItem('copym_admin_session');
        localStorage.setItem('copym_merchant_session', 'true');
        localStorage.setItem('copym_session_role', 'merchant');
        localStorage.setItem('copym_merchant_name', merchantName);
        localStorage.setItem('copym_merchant_email', merchantEmail);
      }

      // Notify parent component state
      onSuccessLogin({
        name: merchantName,
        email: merchantEmail,
      });

      // 4. Redirect to dashboard / admin KYT queue
      window.location.pathname = isAdmin ? '/admin/kyt' : '/dashboard';
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Register with validation
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailTrimmed = regEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regBusinessName.trim()) {
      setErrorMessage('Please enter your legal business or merchant name.');
      return;
    }
    if (!emailTrimmed || !emailRegex.test(emailTrimmed)) {
      setErrorMessage('Please enter a valid corporate or work email address.');
      return;
    }
    const hasMinLen = regPassword.length >= 8;
    const hasNumber = /[0-9]/.test(regPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(regPassword);

    if (!hasMinLen || !hasNumber || !hasSpecial) {
      setErrorMessage('Password must be at least 8 characters and include at least 1 number and 1 special character.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please ensure both passwords match.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('You must agree to the Terms of Service and Privacy Policy before proceeding.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.register({
        email: emailTrimmed,
        password: regPassword,
        business_name: regBusinessName.trim(),
        businessName: regBusinessName.trim(),
        display_name: regBusinessName.trim(),
        name: regBusinessName.trim(),
      });

      setActiveMerchantName(regBusinessName.trim());
      localStorage.setItem('copym_merchant_session', 'true');
      localStorage.setItem('copym_merchant_name', regBusinessName.trim());
      localStorage.setItem('copym_merchant_email', emailTrimmed);

      onSuccessLogin({
        name: regBusinessName.trim(),
        email: emailTrimmed,
      });

      window.location.pathname = '/dashboard';
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dummy Handler: MFA Verify
  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError(null);

    if (isRecoveryMode) {
      if (!recoveryCode.trim()) {
        setMfaError('Please enter a valid recovery backup code.');
        return;
      }
    } else {
      const enteredCode = mfaDigits.join('');
      if (enteredCode.length < 6) {
        setMfaError('Please enter all 6 verification digits.');
        return;
      }
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccessLogin({
        name: activeMerchantName || (isAdmin ? PLATFORM.superAdmin : MERCHANT.signedInUser),
        email: loginEmail || (isAdmin ? `operator.am@${PLATFORM.domain}` : 'nora@apexforex.example.com')
      });
    }, 600);
  };

  // Dummy Handler: MFA digit change
  const handleMfaChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newDigits = [...mfaDigits];
    newDigits[index] = val.slice(-1);
    setMfaDigits(newDigits);

    // Auto advance next input
    if (val && index < 5) {
      setFocusedMfaIndex(index + 1);
      const nextInput = document.getElementById(`mfa-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handler: Keyboard navigation in MFA (Backspace & Arrow keys)
  const handleMfaKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !mfaDigits[index] && index > 0) {
      setFocusedMfaIndex(index - 1);
      const prevInput = document.getElementById(`mfa-${index - 1}`);
      prevInput?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setFocusedMfaIndex(index - 1);
      const prevInput = document.getElementById(`mfa-${index - 1}`);
      prevInput?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      setFocusedMfaIndex(index + 1);
      const nextInput = document.getElementById(`mfa-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Dummy Handler: Paste 6 digits
  const handleMfaPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    if (pasted.length > 0) {
      const newDigits = [...mfaDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setMfaDigits(newDigits);
      const targetIndex = Math.min(pasted.length, 5);
      setFocusedMfaIndex(targetIndex);
      const targetInput = document.getElementById(`mfa-${targetIndex}`);
      targetInput?.focus();
    }
  };

  // Dummy Handler: Forgot Password Submit
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setForgotSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row items-stretch select-none font-sans">
      {/* LEFT COLUMN: 3D Hand Holding CopyM Green Token (Hidden on mobile for clean & focused experience, scaled & centered on desktop) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8 lg:p-12 xl:p-16 relative bg-[#FAFAFA] lg:bg-white overflow-hidden border-b lg:border-b-0 lg:border-r border-gray-100 min-h-screen">
        {/* Subtle ambient radial background glow */}
        <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />

        <div className="relative z-10 w-full max-w-[380px] xl:max-w-[420px] flex items-center justify-center">
          <img
            src={authHeroImg}
            alt="CopyM Pay 3D Token"
            className="w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,192,118,0.15)] transition-transform duration-700 hover:scale-[1.02]"
          />
        </div>
      </div>

      {/* RIGHT COLUMN: Authentication Forms */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-10 sm:px-12 lg:px-16 xl:px-20 bg-white min-h-screen">
        <div className="w-full max-w-[400px] mx-auto">
          {/* ========================================================= */}
          {/* SCREEN 1: LOGIN / SIGN IN (Matches Exact Spec)            */}
          {/* ========================================================= */}
          {mode === 'login' && (
            <div className="animate-fadeIn">
              {/* Brand Header: Centered on mobile, Left-aligned on desktop */}
              <div className="flex items-center justify-center lg:justify-start gap-2.5 mb-7 sm:mb-8">
                <img
                  src={copyMLogo}
                  alt="CopyM Pay"
                  className="w-8 h-8 object-contain flex-shrink-0"
                />
                <h2 className="text-xl font-bold text-[#14171A] tracking-tight leading-tight flex items-center gap-1">
                  <span>CopyM</span>
                  <span className="text-[#007F4E]">Pay</span>
                </h2>
                {isAdmin && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-bold tracking-wider uppercase bg-slate-900 text-white rounded-md">
                    Admin
                  </span>
                )}
              </div>

              {/* Title & Subtitle: Centered on mobile, Left-aligned on desktop */}
              <div className="text-center lg:text-left mb-6 sm:mb-7">
                <h1 className="text-2xl sm:text-[28px] font-bold text-[#14171A] tracking-tight leading-tight">
                  {isAdmin ? 'Platform Admin Sign In' : 'Welcome back'}
                </h1>
                <p className="text-[13px] text-[#6B7280] mt-1.5 leading-relaxed">
                  {isAdmin
                    ? 'Sign in with your platform operator credentials.'
                    : 'Log in with your registered merchant credentials.'}
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div role="alert" aria-live="polite" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs animate-fadeIn">
                  {errorMessage}
                </div>
              )}

              {/* Form: Consistent left alignment & full-width matching button */}
              <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
                {/* Email Address */}
                <div>
                  <label htmlFor="loginEmail" className="block text-xs font-semibold text-[#14171A] mb-1.5 cursor-pointer">
                    {isAdmin ? 'Operator Work Email' : 'Email Address'}
                  </label>
                  <input
                    id="loginEmail"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder={isAdmin ? `operator.am@${PLATFORM.domain}` : 'name@example.com'}
                    required
                    className="w-full px-3.5 py-2.5 sm:py-3 bg-white border border-[#E2E4E9] rounded-xl text-sm text-[#14171A] placeholder-[#6B7280] focus:outline-none focus:border-[#007F4E] focus:ring-1 focus:ring-[#007F4E] transition shadow-2xs"
                  />
                </div>

                {/* Password with Eye Toggle and Forgot password? link */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="loginPassword" className="text-xs font-semibold text-[#14171A] cursor-pointer">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs font-semibold text-[#007F4E] hover:underline transition cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="loginPassword"
                      name="password"
                      type={showLoginPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-3.5 pr-11 py-2.5 sm:py-3 bg-white border border-[#E2E4E9] rounded-xl text-sm text-[#14171A] placeholder-[#6B7280] focus:outline-none focus:border-[#007F4E] focus:ring-1 focus:ring-[#007F4E] transition shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-gray-600 p-0.5 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 sm:py-3.5 bg-[#007F4E] hover:bg-[#00663F] active:bg-[#00563A] text-white rounded-xl text-sm font-bold tracking-wide transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        {isAdmin && <ShieldCheck className="w-4 h-4 text-white" />}
                        <span>{isAdmin ? 'Sign In to Admin Portal' : 'Sign In to Portal'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Bottom Section: Clean centered Register Merchant / Admin Security Notice */}
                {isAdmin ? (
                  <div className="pt-6 border-t border-gray-100 text-center text-xs text-[#6B7280] space-y-1">
                    <div className="flex items-center justify-center gap-1.5 font-semibold text-slate-800">
                      <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                      <span>Platform Operator Access</span>
                    </div>
                    <p className="text-xs text-[#6B7280]">
                      Use your provisioned operator account. Follow your organization's access policy for this console.
                    </p>
                  </div>
                ) : (
                  <div className="pt-5 text-center text-xs text-[#6B7280]">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setMode('register');
                      }}
                      className="font-semibold text-[#007F4E] hover:underline transition ml-1 cursor-pointer"
                    >
                      Register Merchant
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 2: REGISTER                                         */}
          {/* ========================================================= */}
          {mode === 'register' && (
            <div className="animate-fadeIn">
              {isAdmin ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center mx-auto border border-slate-200">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Platform Admin Registration Disabled</h1>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                      Platform administrator accounts cannot be self-registered. Ask your administrator to provision an operator account.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="px-5 py-2.5 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    ← Return to Admin Sign In
                  </button>
                </div>
              ) : (
                <>
                  {/* Brand Header */}
                  <div className="flex items-center justify-center lg:justify-start gap-2.5 mb-7 sm:mb-8">
                    <img
                      src={copyMLogo}
                      alt="CopyM Pay"
                      className="w-8 h-8 object-contain flex-shrink-0"
                    />
                    <h2 className="text-xl font-bold text-[#14171A] tracking-tight leading-tight flex items-center gap-1">
                      <span>CopyM</span>
                      <span className="text-[#007F4E]">Pay</span>
                    </h2>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="text-center lg:text-left mb-6 sm:mb-7">
                    <h1 className="text-2xl sm:text-[28px] font-bold text-[#14171A] tracking-tight leading-tight">
                      Get started with CopyM Pay
                    </h1>
                    <p className="text-[13px] text-[#6B7280] mt-1.5 leading-relaxed">
                      Create your merchant account to start accepting crypto payments.
                    </p>
                  </div>

                  {/* Error Alert */}
                  {errorMessage && (
                    <div role="alert" aria-live="polite" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs animate-fadeIn">
                      {errorMessage}
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleRegisterSubmit} noValidate className="space-y-3.5">
                    {/* Business Name */}
                    <div>
                      <label className="block text-xs font-semibold text-[#14171A] mb-1.5">
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={regBusinessName}
                        onChange={(e) => setRegBusinessName(e.target.value)}
                        placeholder={MERCHANT.name}
                        required
                        className="w-full px-3.5 py-2.5 sm:py-3 bg-white border border-[#E2E4E9] rounded-xl text-sm text-[#14171A] placeholder-[#6B7280] focus:outline-none focus:border-[#007F4E] focus:ring-1 focus:ring-[#007F4E] transition shadow-2xs"
                      />
                    </div>

                    {/* Work Email Address */}
                    <div>
                      <label className="block text-xs font-semibold text-[#14171A] mb-1.5">
                        Work Email Address
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="name@company.com"
                        required
                        className="w-full px-3.5 py-2.5 sm:py-3 bg-white border border-[#E2E4E9] rounded-xl text-sm text-[#14171A] placeholder-[#6B7280] focus:outline-none focus:border-[#007F4E] focus:ring-1 focus:ring-[#007F4E] transition shadow-2xs"
                      />
                    </div>

                    {/* Password with Eye Toggle */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-[#14171A]">
                          Password
                        </label>
                        {regPassword && (
                          <span className="text-xs font-semibold text-gray-500">
                            Strength: <span className={getPasswordStrength(regPassword).score >= 3 ? 'text-[#007F4E]' : 'text-amber-600'}>{getPasswordStrength(regPassword).text}</span>
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-3.5 pr-11 py-2.5 sm:py-3 bg-white border border-[#E2E4E9] rounded-xl text-sm text-[#14171A] placeholder-[#6B7280] focus:outline-none focus:border-[#007F4E] focus:ring-1 focus:ring-[#007F4E] transition shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-gray-600 p-0.5"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {/* Live Segmented Strength Bar */}
                      {regPassword && (
                        <div className="grid grid-cols-4 gap-1 mt-1.5">
                          {[1, 2, 3, 4].map((step) => {
                            const strength = getPasswordStrength(regPassword);
                            const isFilled = strength.score >= step;
                            return (
                              <div
                                key={step}
                                className={`h-1 rounded-full transition-all duration-300 ${isFilled ? strength.color : 'bg-gray-200'}`}
                              />
                            );
                          })}
                        </div>
                      )}
                      {/* Live 3-point Requirements Checklist */}
                      <div className="mt-2 space-y-1 text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <div className={`flex items-center gap-1.5 ${regPassword.length >= 8 ? 'text-[#007F4E] font-semibold' : 'text-[#6B7280]'}`}>
                          <span>{regPassword.length >= 8 ? '✓' : '○'}</span>
                          <span>Minimum 8 characters</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${/[0-9]/.test(regPassword) ? 'text-[#007F4E] font-semibold' : 'text-[#6B7280]'}`}>
                          <span>{/[0-9]/.test(regPassword) ? '✓' : '○'}</span>
                          <span>At least 1 number</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${/[^A-Za-z0-9]/.test(regPassword) ? 'text-[#007F4E] font-semibold' : 'text-[#6B7280]'}`}>
                          <span>{/[^A-Za-z0-9]/.test(regPassword) ? '✓' : '○'}</span>
                          <span>At least 1 special character</span>
                        </div>
                      </div>
                    </div>

                    {/* Confirm Password with Eye Toggle */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-[#14171A]">
                          Confirm Password
                        </label>
                        {regConfirmPassword && (
                          <span className={`text-xs font-semibold ${regPassword === regConfirmPassword ? 'text-[#007F4E]' : 'text-red-500'}`}>
                            {regPassword === regConfirmPassword ? '✓ Passwords match' : '✕ Passwords do not match'}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className={`w-full pl-3.5 pr-11 py-2.5 sm:py-3 bg-white border rounded-xl text-sm text-[#14171A] placeholder-[#6B7280] focus:outline-none focus:ring-1 transition shadow-2xs ${
                            regConfirmPassword && regPassword !== regConfirmPassword
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-400'
                              : 'border-[#E2E4E9] focus:border-[#007F4E] focus:ring-[#007F4E]'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-gray-600 p-0.5 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Checkbox: Terms of Service & Privacy Policy */}
                    <div className="flex items-start gap-2.5 pt-1">
                      <input
                        type="checkbox"
                        id="terms"
                        required
                        autoComplete="off"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-[#007F4E] focus:ring-[#007F4E] border-gray-300 accent-[#007F4E] cursor-pointer"
                      />
                      <label htmlFor="terms" className="text-xs text-[#6B7280] leading-snug cursor-pointer select-none">
                        I agree to the{' '}
                        <a
                          href="/terms"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveLegalModal('terms'); }}
                          className="text-[#007F4E] hover:underline font-semibold cursor-pointer rounded-sm focus:outline-none focus:ring-1 focus:ring-[#007F4E]"
                        >
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a
                          href="/privacy"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveLegalModal('privacy'); }}
                          className="text-[#007F4E] hover:underline font-semibold cursor-pointer rounded-sm focus:outline-none focus:ring-1 focus:ring-[#007F4E]"
                        >
                          Privacy Policy
                        </a>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting || !agreeTerms}
                        className="w-full py-3.5 bg-[#007F4E] hover:bg-[#00663F] active:bg-[#00563A] text-white rounded-xl text-sm font-bold tracking-wide transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Creating Merchant Account...</span>
                          </>
                        ) : (
                          <span>Create Merchant Account</span>
                        )}
                      </button>
                    </div>

                    {/* Bottom Sign In Link */}
                    <div className="pt-4 text-center text-xs text-[#6B7280]">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMessage(null);
                          setMode('login');
                        }}
                        className="font-semibold text-[#007F4E] hover:underline transition ml-1 cursor-pointer"
                      >
                        Sign In
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 3: 2FA VERIFICATION                                 */}
          {/* ========================================================= */}
          {mode === 'mfa' && (
            <div className="animate-fadeIn">
              {/* Brand Header */}
              <div className="flex items-center justify-center lg:justify-start gap-2.5 mb-7 sm:mb-8">
                <img
                  src={copyMLogo}
                  alt="CopyM Pay"
                  className="w-8 h-8 object-contain flex-shrink-0"
                />
                <h2 className="text-xl font-bold text-[#14171A] tracking-tight leading-tight flex items-center gap-1">
                  <span>CopyM</span>
                  <span className="text-[#007F4E]">Pay</span>
                </h2>
                {isAdmin && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-bold tracking-wider uppercase bg-slate-900 text-white rounded-md">
                    Admin
                  </span>
                )}
              </div>

              {!isRecoveryMode ? (
                <>
                  {/* Title & Subtitle */}
                  <div className="text-center lg:text-left mb-6 sm:mb-7">
                    <h1 className="text-2xl sm:text-[28px] font-bold text-[#14171A] tracking-tight leading-tight">
                      {isAdmin ? 'Platform admin verification' : 'Verify your identity'}
                    </h1>
                    <p className="text-[13px] text-[#6B7280] mt-1.5 leading-relaxed">
                      {isAdmin
                        ? 'Enter the 6-digit code from your authenticator app to continue.'
                        : 'Open your authenticator app and enter the 6-digit code for your CopyM Pay account.'}
                    </p>
                  </div>

                  {mfaError && (
                    <div role="alert" aria-live="polite" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs animate-fadeIn">
                      {mfaError}
                    </div>
                  )}

                  <form onSubmit={handleMfaSubmit}>
                    {/* Verification Code Label */}
                    <label className="block text-xs font-semibold text-[#14171A] mb-2.5">
                      Verification code
                    </label>

                    {/* 6 Digit Input Matrix */}
                    <div className="flex items-center justify-between gap-2 sm:gap-2.5">
                      {mfaDigits.map((digit, i) => {
                        const isFocused = focusedMfaIndex === i;
                        return (
                          <input
                            key={i}
                            id={`mfa-${i}`}
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            aria-label={`Verification digit ${i + 1} of 6`}
                            maxLength={1}
                            value={digit}
                            autoFocus={i === 0}
                            onFocus={() => setFocusedMfaIndex(i)}
                            onChange={(e) => handleMfaChange(i, e.target.value)}
                            onKeyDown={(e) => handleMfaKeyDown(i, e)}
                            onPaste={handleMfaPaste}
                            className={`w-12 h-14 sm:w-14 sm:h-16 text-center font-mono text-xl sm:text-2xl font-bold rounded-xl bg-white text-[#14171A] transition-all ${
                              isFocused
                                ? 'border-[1.5px] border-[#007F4E] shadow-xs outline-none ring-0'
                                : 'border border-[#E2E4E9] outline-none hover:border-gray-300'
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Trust this device checkbox */}
                    <div className="flex items-center gap-2 mt-4 mb-5">
                      <input
                        type="checkbox"
                        id="mfaRemember"
                        checked={rememberDevice}
                        onChange={(e) => setRememberDevice(e.target.checked)}
                        className="w-4 h-4 rounded text-[#007F4E] focus:ring-[#007F4E] accent-[#007F4E] border-gray-300 cursor-pointer"
                      />
                      <label htmlFor="mfaRemember" className="text-xs text-[#6B7280] select-none cursor-pointer">
                        Trust this device for 30 days
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 sm:py-4 bg-[#007F4E] hover:bg-[#00663F] active:bg-[#00563A] text-white rounded-xl text-sm font-bold tracking-wide transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{isAdmin ? 'Verifying code...' : 'Verifying & signing in...'}</span>
                        </>
                      ) : (
                        <span>{isAdmin ? 'Verify & continue' : 'Verify & sign in'}</span>
                      )}
                    </button>

                    {/* Recovery Code Option */}
                    <div className="pt-6 text-center">
                      <p className="text-xs text-[#6B7280]">
                        Can't access your authenticator app?
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setMfaError(null);
                          setIsRecoveryMode(true);
                        }}
                        className="text-xs font-semibold text-[#007F4E] hover:underline transition mt-0.5 inline-block cursor-pointer"
                      >
                        Use a recovery code
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                /* Emergency Recovery Code View */
                <>
                  <div className="text-center lg:text-left mb-6 sm:mb-7">
                    <h1 className="text-2xl sm:text-[28px] font-bold text-[#14171A] tracking-tight leading-tight">
                      Use a recovery code
                    </h1>
                    <p className="text-[13px] text-[#6B7280] mt-1.5 leading-relaxed">
                      Enter one of your 8-digit emergency recovery codes generated when you enabled two-factor authentication.
                    </p>
                  </div>

                  {mfaError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                      {mfaError}
                    </div>
                  )}

                  <form onSubmit={handleMfaSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#14171A] mb-1.5">
                        Recovery backup code
                      </label>
                      <input
                        type="text"
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value)}
                        placeholder="Enter recovery code"
                        required
                        className="w-full px-3.5 py-3 bg-white border border-[#E2E4E9] rounded-xl text-sm font-mono text-[#14171A] placeholder-[#6B7280] focus:outline-none focus:border-[#007F4E] focus:ring-1 focus:ring-[#007F4E] transition shadow-2xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 sm:py-4 bg-[#007F4E] hover:bg-[#00663F] active:bg-[#00563A] text-white rounded-xl text-sm font-bold tracking-wide transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verifying Recovery Code...</span>
                        </>
                      ) : (
                        <span>Verify & sign in</span>
                      )}
                    </button>

                    <div className="pt-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setMfaError(null);
                          setIsRecoveryMode(false);
                        }}
                        className="text-xs font-semibold text-[#007F4E] hover:underline transition cursor-pointer"
                      >
                        Use authenticator app instead
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Bottom Divider & Back to Sign In Link */}
              <div className="border-t border-[#E2E4E9] my-6" />

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setMfaError(null);
                    setIsRecoveryMode(false);
                    setMode('login');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#007F4E] hover:underline transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to sign in</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 4: FORGOT PASSWORD                                  */}
          {/* ========================================================= */}
          {mode === 'forgot' && (
            <div className="animate-fadeIn">
              {!forgotSubmitted && (
                <button
                  type="button"
                  onClick={() => {
                    setForgotSubmitted(false);
                    setMode('login');
                  }}
                  className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1.5 mb-6 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to sign in</span>
                </button>
              )}

              {/* Brand Header */}
              <div className="flex items-center justify-center lg:justify-start gap-2.5 mb-6">
                <img
                  src={copyMLogo}
                  alt="CopyM Pay"
                  className="w-8 h-8 object-contain flex-shrink-0"
                />
                <h2 className="text-xl font-bold text-[#14171A] tracking-tight leading-tight flex items-center gap-1">
                  <span>CopyM</span>
                  <span className="text-[#007F4E]">Pay</span>
                </h2>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#007F4E] flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>

              <div className="text-center lg:text-left mb-6">
                <h1 className="text-2xl sm:text-[28px] font-bold text-[#14171A] tracking-tight leading-tight">
                  {forgotSubmitted
                    ? 'Check your inbox'
                    : 'Reset your password'}
                </h1>
                <p className="text-[13px] text-[#6B7280] mt-1.5 leading-relaxed">
                  {forgotSubmitted
                    ? "If an account exists for this email, we've sent a link."
                    : isAdmin
                    ? 'Enter your platform operator email to receive password reset instructions.'
                    : 'Enter your registered work email to receive password reset instructions.'}
                </p>
              </div>

              {forgotSubmitted ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-[#065F46] rounded-xl text-xs leading-relaxed">
                    <p className="font-bold text-sm text-[#065F46] mb-1">
                      Check your inbox
                    </p>
                    If an account exists for this email, we've sent a link to <span className="font-semibold text-gray-900">{forgotEmail}</span>.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotSubmitted(false);
                      setMode('login');
                    }}
                    className="w-full py-3 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-xl text-sm font-semibold transition cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} noValidate className="space-y-4">
                  <div>
                    <label htmlFor="forgotEmail" className="block text-xs font-semibold text-[#14171A] mb-1.5 cursor-pointer">
                      Work Email Address
                    </label>
                    <input
                      id="forgotEmail"
                      type="email"
                      autoComplete="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder={isAdmin ? `operator.am@${PLATFORM.domain}` : 'name@example.com'}
                      required
                      className="w-full px-3.5 py-2.5 sm:py-3 bg-white border border-[#E2E4E9] rounded-xl text-sm text-[#14171A] placeholder-[#6B7280] focus:outline-none focus:border-[#007F4E] focus:ring-1 focus:ring-[#007F4E] transition shadow-2xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#007F4E] hover:bg-[#00663F] active:bg-[#00563A] text-white rounded-xl text-sm font-bold tracking-wide transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      <span>Send Recovery Link</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Terms of Service & Privacy Policy Modal */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-modal-title"
            className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 id="legal-modal-title" className="text-base font-bold text-gray-900">
                {activeLegalModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
              </h3>
              <button
                type="button"
                autoFocus
                aria-label="Close legal document"
                onClick={() => setActiveLegalModal(null)}
                className="text-[#6B7280] hover:text-gray-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="py-4 overflow-y-auto space-y-3 text-xs text-gray-600 leading-relaxed pr-1">
              {activeLegalModal === 'terms' ? (
                <>
                  <p className="font-semibold text-gray-800">1. Acceptance of Terms</p>
                  <p>
                    By registering for a CopyM Pay account, you agree to these terms and any account terms provided to you.
                  </p>
                  <p className="font-semibold text-gray-800">2. Merchant Responsibilities</p>
                  <p>
                    Keep your account credentials and API keys confidential, and review account activity regularly.
                  </p>
                  <p className="font-semibold text-gray-800">3. Use of the Service</p>
                  <p>
                    Service availability and features may change. Contact support if you have questions about your account.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-gray-800">1. Data Collection & Processing</p>
                  <p>
                    We collect the information you provide, such as your business details and contact email, to create and administer your account.
                  </p>
                  <p className="font-semibold text-gray-800">2. Use of Information</p>
                  <p>
                    We use account information to provide the services you request and to respond to support inquiries.
                  </p>
                  <p className="font-semibold text-gray-800">3. Retention & Sharing</p>
                  <p>
                    We keep account information to administer your account and may use service providers that support the platform.
                  </p>
                </>
              )}
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                className="px-4 py-2 bg-[#007F4E] hover:bg-[#00663F] text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
