import React, { useState } from 'react';
import { Eye, EyeOff, TrendingUp, ArrowLeft, Mail, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { setUserToken, setUserData } from '../../../lib/cookies';

interface LoginPageProps {
  onLogin?: (credentials: { email: string; password: string }) => void;
  onBack?: () => void;
  selectedPlan?: string;
  onShowRegister?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onBack, selectedPlan, onShowRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Store user data in cookies
        setUserToken(data.token || 'demo-token');
        setUserData(data.user);
        
        // Route based on user role
        if (data.user.role === 'ADMIN') {
          router.push('/admin');
        } else if (data.user.role === 'SALES_EXECUTIVE') {
          router.push('/sales-dashboard'); // Future sales dashboard
        } else {
          router.push('/dashboard'); // Regular user dashboard
        }
        
        // Call onLogin callback if provided
        onLogin && onLogin(formData);
      } else {
        // Handle login error
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'from-gray-500 to-gray-600';
      case 'BASIC': return 'from-blue-500 to-blue-600';
      case 'PREMIUM': return 'from-purple-500 to-pink-600';
      case 'ENTERPRISE': return 'from-yellow-500 to-orange-600';
      default: return 'from-purple-500 to-pink-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-6">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center space-x-2 text-purple-200 hover:text-white transition-all duration-200"
        >
          <ArrowLeft size={20} />
          <span>Back to Plans</span>
        </button>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 transform transition-all duration-500 hover:scale-105">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back!</h1>
            <p className="text-purple-200">Sign in to access your trading dashboard</p>
            
            {selectedPlan && (
              <div className="mt-4">
                <div className={`bg-gradient-to-r ${getPlanColor(selectedPlan)} px-4 py-2 rounded-full inline-block`}>
                  <span className="text-white font-semibold text-sm">{selectedPlan} Plan Selected</span>
                </div>
              </div>
            )}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-4 bg-white/5 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-purple-200">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-200"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <TrendingUp size={20} />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
            {onShowRegister && (
              <button
                type="button"
                onClick={onShowRegister}
                className="w-full mt-2 text-purple-300 hover:text-white text-sm"
              >
                Sign Up Free
              </button>
            )}
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-purple-200 text-sm">
              Don&apos;t have an account?{' '}
              <button 
                onClick={() => router.push('/auth/register')}
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
              >
                Sign up for free
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;