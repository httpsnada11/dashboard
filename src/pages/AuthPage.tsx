import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, RefreshCw, Sparkles, Lock } from 'lucide-react';
import copyMLogo from '../image/logo.png';
import authHeroImg from '../assets/auth-hero.png';

export type AuthMode = 'login' | 'register' | 'mfa' | 'forgot';

export interface AuthPageProps {
  onSuccessLogin: (merchantInfo?: { name: string; email: string }) => void;
  initialMode?: AuthMode;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccessLogin, initialMode = 'login' }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState('merchant@gmail.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states - Register
  const [regBusinessName, setRegBusinessName] = useState('Apex Forex Global');
  const [regEmail, setRegEmail] = useState('name@company.com');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Form states - MFA
  const [mfaDigits, setMfaDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [focusedMfaIndex, setFocusedMfaIndex] = useState<number>(0);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [isRecoveryMode, setIsRecoveryMode] = useState<boolean>(false);
  const [recoveryCode, setRecoveryCode] = useState<string>('');

  // Form states - Forgot Password
  const [forgotEmail, setForgotEmail] = useState('merchant@gmail.com');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Dummy Handler: Sign In
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    setIsSubmitting(true);
    // Simulate API authorization check
    setTimeout(() => {
      setIsSubmitting(false);
      // Advance to MFA verification (Task FE-01 compliance)
      setMode('mfa');
    }, 600);
  };

  // Dummy Handler: Quick direct login bypass
  const handleQuickLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccessLogin({
        name: 'Daniel Vance',
        email: loginEmail || 'merchant@gmail.com'
      });
    }, 400);
  };

  // Dummy Handler: Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regBusinessName.trim() || !regEmail.trim()) {
      setErrorMessage('Please fill in your business name and work email.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsSubmitting(true);
    // Simulate registration
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccessLogin({
        name: regBusinessName,
        email: regEmail
      });
    }, 700);
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
        name: 'Daniel Vance',
        email: loginEmail || 'merchant@gmail.com'
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

  // Dummy Handler: Backspace navigation in MFA
  const handleMfaKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !mfaDigits[index] && index > 0) {
      setFocusedMfaIndex(index - 1);
      const prevInput = document.getElementById(`mfa-${index - 1}`);
      prevInput?.focus();
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
      {/* LEFT COLUMN: 3D Hand Holding CopyM Green Token */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16 relative bg-[#FAFAFA] lg:bg-white overflow-hidden border-b lg:border-b-0 lg:border-r border-gray-100">
        {/* Subtle radial ambient background glow */}
        <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />

        <div className="relative z-10 max-w-[420px] sm:max-w-[480px] lg:max-w-[540px] flex flex-col items-center justify-center">
          <img
            src={authHeroImg}
            alt="CopyM Pay 3D Token"
            className="w-full h-auto object-contain drop-shadow-[0_25px_35px_rgba(0,135,90,0.18)] transition-transform duration-700 hover:scale-[1.02]"
          />
        </div>
      </div>

      {/* RIGHT COLUMN: Authentication Forms */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-10 sm:px-12 lg:px-20 bg-white">
        <div className="w-full max-w-[440px] mx-auto">
          {/* ========================================================= */}
          {/* SCREEN 1: LOGIN / SIGN IN (Matches Image 2 Exactly)      */}
          {/* ========================================================= */}
          {mode === 'login' && (
            <div className="animate-fadeIn">
              {/* Brand Header */}
              <div className="flex items-center gap-3 mb-8">
                <img
                  src={copyMLogo}
                  alt="CopyM Pay"
                  className="w-9 h-9 object-contain flex-shrink-0"
                />
                <div>
                  <h2 className="text-[19px] font-bold text-[#14171A] tracking-tight leading-tight flex items-center gap-1">
                    <span>CopyM</span>
                    <span className="text-[#00875A]">Pay</span>
                  </h2>
                  <p className="text-[12.5px] text-[#6B7280] font-normal leading-tight">
                    Merchant Operations Portal
                  </p>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="mb-6">
                <h1 className="text-[26px] sm:text-[28px] font-bold text-[#14171A] tracking-tight">
                  Welcome back
                </h1>
                <p className="text-[13.5px] text-[#6B7280] mt-1">
                  Log in with your registered merchant credentials.
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                  {errorMessage}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email Address */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#14171A] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="merchant@gmail.com"
                    required
                    className="w-full px-4 py-3 bg-white border border-[#E2E4E9] rounded-xl text-sm text-[#14171A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition shadow-2xs"
                  />
                </div>

                {/* Password with Forgot password? link */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[13px] font-semibold text-[#14171A]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[13px] font-medium text-[#00875A] hover:underline transition"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full px-4 py-3 bg-white border border-[#E2E4E9] rounded-xl text-sm text-[#14171A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition shadow-2xs"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#00875A] hover:bg-[#00734D] text-white rounded-xl text-sm font-semibold tracking-wide transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <span>Sign In to Portal</span>
                    )}
                  </button>
                </div>

                {/* Quick 1-Click Demo Sign-in Pill for reviewers */}
                <div className="pt-2 flex items-center justify-between bg-emerald-50/70 border border-emerald-100 rounded-xl px-3 py-2 text-xs">
                  <span className="text-[#00875A] font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Sandbox Quick Test
                  </span>
                  <button
                    type="button"
                    onClick={handleQuickLogin}
                    className="text-[#00875A] hover:underline font-bold text-xs"
                  >
                    Bypass to Console →
                  </button>
                </div>

                {/* Register Link */}
                <div className="pt-5 text-center text-sm text-[#6B7280]">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setMode('register');
                    }}
                    className="font-semibold text-[#00875A] hover:underline transition ml-1"
                  >
                    Register Merchant
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 2: REGISTER (Matches Image 3 Exactly)              */}
          {/* ========================================================= */}
          {mode === 'register' && (
            <div className="animate-fadeIn">
              {/* Brand Header */}
              <div className="flex items-center gap-2.5 mb-7">
                <img
                  src={copyMLogo}
                  alt="CopyM Pay"
                  className="w-8 h-8 object-contain flex-shrink-0"
                />
                <h2 className="text-[19px] font-bold text-[#14171A] tracking-tight leading-tight flex items-center gap-1">
                  <span>CopyM</span>
                  <span className="text-[#00875A]">Pay</span>
                </h2>
              </div>

              {/* Title & Subtitle */}
              <div className="mb-6">
                <h1 className="text-[26px] sm:text-[28px] font-bold text-[#14171A] tracking-tight">
                  Get started with CopyM-Pay
                </h1>
                <p className="text-[13.5px] text-[#6B7280] mt-1">
                  Create your merchant account to start accepting crypto payments.
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                  {errorMessage}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Business Name */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#14171A] mb-1.5">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={regBusinessName}
                    onChange={(e) => setRegBusinessName(e.target.value)}
                    placeholder="Apex Forex Global"
                    required
                    className="w-full px-4 py-2.5 sm:py-3 bg-white border border-[#E2E4E9] rounded-xl text-sm text-[#14171A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition shadow-2xs"
                  />
                </div>

                {/* Work Email Address */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#14171A] mb-1.5">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full px-4 py-2.5 sm:py-3 bg-white border border-[#E2E4E9] rounded-xl text-sm text-[#14171A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition shadow-2xs"
                  />
                </div>

                {/* Password with Eye Toggle */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#14171A] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-4 pr-11 py-2.5 sm:py-3 bg-white border border-[#E2E4E9] rounded-xl text-sm text-[#14171A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11.5px] text-[#6B7280] mt-1">
                    Minimum 8 characters, 1 number, 1 special character
                  </p>
                </div>

                {/* Confirm Password with Eye Toggle */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#14171A] mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-4 pr-11 py-2.5 sm:py-3 bg-white border border-[#E2E4E9] rounded-xl text-sm text-[#14171A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
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
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-[#00875A] focus:ring-[#00875A] border-gray-300 accent-[#00875A] cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-xs text-[#6B7280] leading-snug cursor-pointer">
                    I agree to the{' '}
                    <span className="text-[#00875A] hover:underline font-medium">Terms of Service</span>{' '}
                    and{' '}
                    <span className="text-[#00875A] hover:underline font-medium">Privacy Policy</span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#00875A] hover:bg-[#00734D] text-white rounded-xl text-sm font-semibold tracking-wide transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
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
                <div className="pt-4 text-center text-sm text-[#6B7280]">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setMode('login');
                    }}
                    className="font-semibold text-[#00875A] hover:underline transition ml-1"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 3: 2FA VERIFICATION (Matches Uploaded Image Exactly)*/}
          {/* ========================================================= */}
          {mode === 'mfa' && (
            <div className="animate-fadeIn">
              {/* Brand Header */}
              <div className="flex items-center gap-3 mb-8">
                <img
                  src={copyMLogo}
                  alt="CopyM Pay"
                  className="w-9 h-9 object-contain flex-shrink-0"
                />
                <div>
                  <h2 className="text-[19px] font-bold text-[#14171A] tracking-tight leading-tight flex items-center gap-1">
                    <span>CopyM</span>
                    <span className="text-[#00875A]">Pay</span>
                  </h2>
                  <p className="text-[12.5px] text-[#6B7280] font-normal leading-tight">
                    Merchant Operations Portal
                  </p>
                </div>
              </div>

              {!isRecoveryMode ? (
                <>
                  {/* Title & Subtitle */}
                  <div className="mb-6">
                    <h1 className="text-[26px] sm:text-[28px] font-bold text-[#14171A] tracking-tight">
                      Verify your identity
                    </h1>
                    <p className="text-[13.5px] text-[#6B7280] mt-1.5 leading-relaxed">
                      Open your authenticator app and enter the 6-digit code for your CopyM Pay account.
                    </p>
                  </div>

                  {mfaError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                      {mfaError}
                    </div>
                  )}

                  <form onSubmit={handleMfaSubmit}>
                    {/* Verification Code Label */}
                    <label className="block text-[13px] font-semibold text-[#14171A] mb-2.5">
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
                            maxLength={1}
                            value={digit}
                            autoFocus={i === 0}
                            onFocus={() => setFocusedMfaIndex(i)}
                            onChange={(e) => handleMfaChange(i, e.target.value)}
                            onKeyDown={(e) => handleMfaKeyDown(i, e)}
                            onPaste={handleMfaPaste}
                            className={`w-12 h-14 sm:w-14 sm:h-16 text-center font-mono text-xl sm:text-2xl font-bold rounded-xl bg-white text-[#14171A] transition-all ${
                              isFocused
                                ? 'border-[1.5px] border-[#00875A] shadow-xs outline-none ring-0'
                                : 'border border-[#E2E4E9] outline-none hover:border-gray-300'
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Helper Subtext below boxes */}
                    <div className="flex items-center justify-between text-[12.5px] text-[#6B7280] mt-2.5 mb-6">
                      <span>Use the current code shown in your app.</span>
                      <button
                        type="button"
                        onClick={() => {
                          setMfaDigits(['8', '4', '9', '2', '0', '1']);
                          setFocusedMfaIndex(5);
                        }}
                        className="text-[#00875A] hover:underline font-medium text-xs"
                      >
                        Paste code (849201)
                      </button>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 sm:py-4 bg-[#00875A] hover:bg-[#00734D] text-white rounded-xl text-sm font-semibold tracking-wide transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verifying & signing in...</span>
                        </>
                      ) : (
                        <span>Verify & sign in</span>
                      )}
                    </button>

                    {/* Recovery Code Option */}
                    <div className="pt-6 text-center">
                      <p className="text-[12.5px] text-[#6B7280]">
                        Can't access your authenticator app?
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setMfaError(null);
                          setIsRecoveryMode(true);
                        }}
                        className="text-[13px] font-medium text-[#00875A] hover:underline transition mt-0.5 inline-block cursor-pointer"
                      >
                        Use a recovery code
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                /* Emergency Recovery Code View */
                <>
                  <div className="mb-6">
                    <h1 className="text-[26px] sm:text-[28px] font-bold text-[#14171A] tracking-tight">
                      Use a recovery code
                    </h1>
                    <p className="text-[13.5px] text-[#6B7280] mt-1.5 leading-relaxed">
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
                      <label className="block text-[13px] font-semibold text-[#14171A] mb-1.5">
                        Recovery backup code
                      </label>
                      <input
                        type="text"
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value)}
                        placeholder="CPYM-8492-X7"
                        required
                        className="w-full px-4 py-3 bg-white border border-[#E2E4E9] rounded-xl text-sm font-mono text-[#14171A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition shadow-2xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 sm:py-4 bg-[#00875A] hover:bg-[#00734D] text-white rounded-xl text-sm font-semibold tracking-wide transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
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
                        className="text-[13px] font-medium text-[#00875A] hover:underline transition cursor-pointer"
                      >
                        Use authenticator app instead
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Bottom Divider & Back to Sign In Link (Exact Image Spec) */}
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
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#00875A] hover:underline transition cursor-pointer"
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
              <button
                type="button"
                onClick={() => {
                  setForgotSubmitted(false);
                  setMode('login');
                }}
                className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1.5 mb-6"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to sign in</span>
              </button>

              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00875A] flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>

              <div className="mb-6">
                <h1 className="text-[26px] font-bold text-[#14171A] tracking-tight">
                  Reset your password
                </h1>
                <p className="text-[13.5px] text-[#6B7280] mt-1">
                  Enter your registered work email to receive password reset instructions.
                </p>
              </div>

              {forgotSubmitted ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-[#065F46] rounded-xl text-xs leading-relaxed">
                    <p className="font-bold text-sm text-[#065F46] mb-1">
                      Check your inbox
                    </p>
                    A password recovery link has been dispatched to{' '}
                    <span className="font-semibold text-gray-900">{forgotEmail}</span>.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotSubmitted(false);
                      setMode('login');
                    }}
                    className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#14171A] mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="merchant@gmail.com"
                      required
                      className="w-full px-4 py-3 bg-white border border-[#E2E4E9] rounded-xl text-sm text-[#14171A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] transition shadow-2xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#00875A] hover:bg-[#00734D] text-white rounded-xl text-sm font-semibold tracking-wide transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
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
    </div>
  );
};

export default AuthPage;
