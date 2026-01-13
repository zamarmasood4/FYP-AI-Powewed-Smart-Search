import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Eye, EyeOff, ArrowLeft, Key } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = 'http://localhost:3001/api/auth';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // 1: Login form, 2: OTP verification
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: Email, 2: OTP, 3: New password
  const [resetPasswordData, setResetPasswordData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResetPasswordInputChange = (field, value) => {
    setResetPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setFormError('Please enter both email and password');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const validateResetPasswordForm = () => {
    if (!resetPasswordData.newPassword || !resetPasswordData.confirmPassword) {
      setFormError('Please enter both password fields');
      return false;
    }

    if (resetPasswordData.newPassword.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return false;
    }

    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      toast({
        title: "OTP Sent",
        description: data.message || "We've sent a 6-digit verification code to your email",
      });
      
      setCurrentStep(2);
    } catch (error) {
      setFormError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

 const handleVerifyOtp = async (e) => {
  e.preventDefault();
  setFormError('');
  
  const otpString = otp.join('');
  if (otpString.length !== 6) {
    setFormError('Please enter the complete 6-digit OTP');
    return;
  }

  setIsLoading(true);
  
  try {
    const response = await fetch(`${API_BASE_URL}/verify-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        token: otpString
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify OTP');
    }

    // Store session data in localStorage
    if (data.session) {
      localStorage.setItem('access_token', data.session.access_token);
      localStorage.setItem('refresh_token', data.session.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.session.user));
    }

    // Store user info for easy access - IMPORTANT: Store the user object directly
    if (data.user) {
      localStorage.setItem('user_info', JSON.stringify(data.user));
    }

    toast({
      title: "Logged in successfully!",
      description: `Welcome back, ${data.user.first_name || data.user.full_name || 'User'}!`,
    });
    
    // Redirect to dashboard or home page
    navigate('/');
    
  } catch (error) {
    setFormError(error.message || 'Invalid OTP. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!resetPasswordData.email) {
      setFormError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetPasswordData.email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: resetPasswordData.email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send password reset OTP');
      }

      toast({
        title: "OTP Sent",
        description: data.message || "We've sent a 6-digit verification code to your email",
      });
      
      setForgotPasswordStep(2);
    } catch (error) {
      setFormError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyResetOtp = async (e) => {
    e.preventDefault();
    setFormError('');
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setFormError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/verify-reset-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: resetPasswordData.email,
          token: otpString
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify OTP');
      }

      toast({
        title: "OTP Verified",
        description: data.message || "OTP verified successfully. You can now reset your password.",
      });
      
      setForgotPasswordStep(3);
    } catch (error) {
      setFormError(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!validateResetPasswordForm()) return;

    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: resetPasswordData.email,
          newPassword: resetPasswordData.newPassword,
          confirmPassword: resetPasswordData.confirmPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      toast({
        title: "Password Reset Successful",
        description: data.message || "Your password has been updated successfully.",
      });
      
      // Reset states and go back to login
      setForgotPasswordMode(false);
      setForgotPasswordStep(1);
      setResetPasswordData({
        email: '',
        newPassword: '',
        confirmPassword: ''
      });
      setOtp(['', '', '', '', '', '']);
      
    } catch (error) {
      setFormError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setFormError('');
    setIsLoading(true);
    
    try {
      const endpoint = forgotPasswordMode ? 'forgot-password' : 'login';
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotPasswordMode ? resetPasswordData.email : formData.email,
          ...(forgotPasswordMode ? {} : { password: formData.password })
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      toast({
        title: "OTP Resent",
        description: data.message || "A new verification code has been sent to your email",
      });
      setOtp(['', '', '', '', '', '']);
      // Focus on first OTP input
      const firstInput = document.getElementById('otp-0');
      if (firstInput) firstInput.focus();
    } catch (error) {
      setFormError(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // For now, show a toast. You can implement Google OAuth later
    toast({
      title: "Google login",
      description: "Google login functionality would be implemented here",
    });
  };

  const startForgotPassword = () => {
    setForgotPasswordMode(true);
    setForgotPasswordStep(1);
    setFormError('');
    setResetPasswordData(prev => ({ ...prev, email: formData.email }));
  };

  const goBackToLogin = () => {
    setForgotPasswordMode(false);
    setForgotPasswordStep(1);
    setFormError('');
    setResetPasswordData({
      email: '',
      newPassword: '',
      confirmPassword: ''
    });
    setOtp(['', '', '', '', '', '']);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-blue-950 -z-10" />
      
      <Link to="/" className="flex items-center space-x-2 group mb-8">
        <div className="relative w-10 h-10 bg-gradient-to-tr from-blue-600 to-teal-400 rounded-xl flex items-center justify-center shadow-lg overflow-hidden group-hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/80 to-teal-400/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">SearchAI</span>
      </Link>

      <div className="w-full max-w-md glass-card p-8 animate-fade-in">
        {forgotPasswordMode ? (
          <>
            {forgotPasswordStep === 1 && (
              <>
                <button
                  onClick={goBackToLogin}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </button>
                
                <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>
                
                {formError && (
                  <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{formError}</span>
                  </div>
                )}
                
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="forgot-email" className="block text-sm font-medium">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        id="forgot-email"
                        type="email"
                        value={resetPasswordData.email}
                        onChange={(e) => handleResetPasswordInputChange('email', e.target.value)}
                        className="search-input pl-10"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full btn-gradient rounded-full py-3 font-medium flex items-center justify-center transition-all ${
                      isLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending OTP...
                      </>
                    ) : (
                      "Send Reset Code"
                    )}
                  </button>
                </form>
              </>
            )}

            {forgotPasswordStep === 2 && (
              <>
                <button
                  onClick={() => setForgotPasswordStep(1)}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                
                <h1 className="text-2xl font-bold text-center mb-2">Verify Your Email</h1>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                  We sent a 6-digit code to <span className="font-medium">{resetPasswordData.email}</span>
                </p>
                
                {formError && (
                  <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{formError}</span>
                  </div>
                )}
                
                <form onSubmit={handleVerifyResetOtp} className="space-y-6">
                  <div className="flex justify-center gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-800 transition-colors"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full btn-gradient rounded-full py-3 font-medium flex items-center justify-center transition-all ${
                      isLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </button>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Didn't receive code? Resend OTP
                    </button>
                  </div>
                </form>
              </>
            )}

            {forgotPasswordStep === 3 && (
              <>
                <button
                  onClick={() => setForgotPasswordStep(2)}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                
                <h1 className="text-2xl font-bold text-center mb-6">Set New Password</h1>
                
                {formError && (
                  <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{formError}</span>
                  </div>
                )}
                
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="block text-sm font-medium">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                        <Key className="w-5 h-5" />
                      </div>
                      <input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={resetPasswordData.newPassword}
                        onChange={(e) => handleResetPasswordInputChange('newPassword', e.target.value)}
                        className="search-input pl-10 pr-10"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="confirmNewPassword" className="block text-sm font-medium">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                        <Key className="w-5 h-5" />
                      </div>
                      <input
                        id="confirmNewPassword"
                        type={showConfirmNewPassword ? "text" : "password"}
                        value={resetPasswordData.confirmPassword}
                        onChange={(e) => handleResetPasswordInputChange('confirmPassword', e.target.value)}
                        className="search-input pl-10 pr-10"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      >
                        {showConfirmNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full btn-gradient rounded-full py-3 font-medium flex items-center justify-center transition-all ${
                      isLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating Password...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </form>
              </>
            )}
          </>
        ) : currentStep === 1 ? (
          <>
            <h1 className="text-2xl font-bold text-center mb-6">Welcome Back</h1>
            
            {formError && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{formError}</span>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="search-input pl-10"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <button 
                    type="button"
                    onClick={startForgotPassword}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="search-input pl-10 pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full btn-gradient rounded-full py-3 font-medium flex items-center justify-center transition-all ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <button 
                onClick={handleGoogleLogin}
                className="mt-4 w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 rounded-full py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" className="w-4 h-4">
                  <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" fill="#4285f4"/>
                </svg>
                <span>Google</span>
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link to="/auth/register" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <h1 className="text-2xl font-bold text-center mb-2">Verify Your Email</h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              We sent a 6-digit code to <span className="font-medium">{formData.email}</span>
            </p>
            
            {formError && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{formError}</span>
              </div>
            )}
            
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-800 transition-colors"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full btn-gradient rounded-full py-3 font-medium flex items-center justify-center transition-all ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Didn't receive code? Resend OTP
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;