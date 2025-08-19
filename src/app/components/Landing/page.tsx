'use client'

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Crown, 
  Check, 
  ArrowRight, 
  Star,
  BarChart3,
  Target,
  Activity,
  Users,
  Sparkles,
  Bell,
  X,
  Twitter,
  Facebook,
  Linkedin
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getUserToken, getUserData, setSelectedPlan, removeUserAuth } from '../../../lib/cookies';

const LandingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
    setTimeout(() => setAnimateStats(true), 1000);
    
    // Check if user is logged in
    const userToken = getUserToken();
    const userData = getUserData();
    
    if (userToken && userData) {
        setIsLoggedIn(true);
      setUserRole(userData.role || 'USER');
    }
  }, []);

  const plans = [
    {
      id: 'FREE',
      name: 'Free',
      price: 0,
      period: 'Forever',
      description: 'Perfect for beginners to explore trading',
      features: [
        'Basic Backtesting',
        'Community Support',
        'Basic Analytics'
      ],
      color: 'from-gray-500 to-gray-600',
      icon: Shield,
      popular: false
    },
    {
      id: 'BASIC',
      name: 'Basic',
      price: 5999,
      period: 'per month',
      description: 'Great for individual traders',
      features: [
        '2 Trading Strategies',
        'Advanced Backtesting',
        'Live Trading',
        'Email Support',
        'Advanced Analytics'
      ],
      color: 'from-blue-500 to-blue-600',
      icon: TrendingUp,
      popular: false
    },
    {
      id: 'PREMIUM',
      name: 'Premium',
      price: 10999,
      period: 'per month',
      description: 'Most popular for serious traders',
      features: [
        '5 Trading Strategies',
        'Real-time Data',
        'Advanced Analytics',
        'Priority Support',
        'Custom Indicators',
        'Portfolio Management',
        'API Access'
      ],
      color: 'from-purple-500 to-pink-600',
      icon: Crown,
      popular: true
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      price: 15999,
      period: 'per month',
      description: 'For professional trading firms',
      features: [
        'Everything in Premium',
        'White-label Solution',
        'Custom Development',
        'Dedicated Support',
        'Advanced Security',
        'Multi-user Access',
        'Custom Integrations'
      ],
      color: 'from-yellow-500 to-orange-600',
      icon: Zap,
      popular: false
    }
  ];

  const stats = [
    { label: 'Active Traders', value: '10,000+', icon: Users },
    { label: 'Strategies Created', value: '50,000+', icon: Target },
    { label: 'Total Trades', value: '1M+', icon: Activity },
    { label: 'Success Rate', value: '78%', icon: BarChart3 }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    // Store selected plan in cookies
    setSelectedPlan(planId);
    router.push('/auth/register');
  };

  const handleGetStarted = () => {
    // Check if user is already logged in
    const userToken = getUserToken();
    const userData = getUserData();
    
    if (userToken && userData) {
        // Route based on user role
      if (userData.role === 'ADMIN') {
          router.push('/admin');
      } else if (userData.role === 'SALES_EXECUTIVE') {
        router.push('/sales-dashboard');
        } else {
          router.push('/dashboard'); // Regular user dashboard
      }
    } else {
      // Not logged in, go to login page
      router.push('/auth/login');
    }
  };

  const handleLogout = () => {
    removeUserAuth();
    setIsLoggedIn(false);
    setUserRole('');
    router.push('/');
  };

  return (
    <>
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10">
          {/* User Info Section - Only show if logged in */}
          {isLoggedIn && (
            <div className="absolute top-6 right-6 z-20">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-full">
                    <Users size={16} className="text-white" />
                  </div>
                  <div className="text-white">
                    <p className="text-sm font-semibold">
                      {userRole === 'ADMIN' ? 'Admin' : userRole === 'SALES_EXECUTIVE' ? 'Sales Executive' : 'User'}
                    </p>
                    <p className="text-xs text-purple-200">Logged In</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hero Section */}
          <div className={`text-center py-20 px-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-2xl">
                  <TrendingUp size={48} className="text-white" />
                </div>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                TradeSetu
              </h1>
              
              <p className="text-2xl md:text-3xl text-blue-200 mb-4 font-light">
                Advanced Trading Platform
              </p>
              
              <p className="text-lg text-purple-200 mb-8 max-w-2xl mx-auto leading-relaxed">
                Automate your trading strategies with AI-powered backtesting, real-time execution, 
                and comprehensive analytics. Join thousands of successful traders.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <div className="bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 border border-white/20">
                  <span className="text-green-400 font-semibold">✓ No Setup Fees</span>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 border border-white/20">
                  <span className="text-blue-400 font-semibold">✓ 24/7 Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className={`py-16 px-6 transition-all duration-1000 delay-500 ${animateStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div 
                      key={stat.label}
                      className={`text-center transform transition-all duration-500 delay-${index * 100} hover:scale-105`}
                    >
                      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300">
                        <Icon size={32} className="text-purple-400 mx-auto mb-4" />
                        <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                        <div className="text-purple-200">{stat.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="py-20 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Choose Your Trading Plan
                </h2>
                <p className="text-xl text-purple-200 max-w-2xl mx-auto">
                  Start with our free plan and upgrade as you grow. All plans include our core trading features.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {plans.map((plan, index) => {
                  const Icon = plan.icon;
                  const isSelected = selectedPlan === plan.id;
                  
                  return (
                    <div
                      key={plan.id}
                      className={`relative transform transition-all duration-500 hover:scale-105 ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                      }`}
                      style={{ transitionDelay: `${index * 200}ms` }}
                    >
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                            <Star size={16} />
                            <span>Most Popular</span>
                          </div>
                        </div>
                      )}
                      
                      <div className={`bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-2 transition-all duration-300 h-full ${
                        isSelected 
                          ? 'border-purple-400 shadow-2xl shadow-purple-500/25 scale-105' 
                          : plan.popular 
                            ? 'border-purple-400/50 hover:border-purple-400' 
                            : 'border-white/20 hover:border-white/40'
                      }`}>
                        <div className="text-center mb-8">
                          <div className={`bg-gradient-to-r ${plan.color} p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                            <Icon size={32} className="text-white" />
                          </div>
                          
                          <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                          <p className="text-purple-200 text-sm mb-4">{plan.description}</p>
                          
                          <div className="mb-6">
                            <span className="text-4xl font-bold text-white">
                              {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString()}`}
                            </span>
                            {plan.price > 0 && (
                              <span className="text-purple-200 text-sm ml-2">/{plan.period}</span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4 mb-8">
                          {plan.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center space-x-3">
                              <div className="bg-green-500/20 rounded-full p-1">
                                <Check size={16} className="text-green-400" />
                              </div>
                              <span className="text-purple-200">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => handlePlanSelect(plan.id)}
                          disabled={isSelected}
                          className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                            isSelected
                              ? 'bg-green-500 text-white cursor-not-allowed'
                              : plan.popular
                                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700'
                                : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check size={20} />
                              <span>Selected</span>
                            </>
                          ) : (
                            <>
                              <span>{plan.price === 0 ? 'Start Free' : 'Get Started'}</span>
                              <ArrowRight size={20} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Get Started Button */}
              <div className="text-center mt-16">
                <button
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-12 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-3 mx-auto transform hover:scale-105 shadow-2xl"
                >
                  <span>{isLoggedIn ? 'Continue to Dashboard' : 'Get Started'}</span>
                  <ArrowRight size={24} />
                </button>
                <p className="text-purple-200 text-sm mt-4">
                  {isLoggedIn 
                    ? `Welcome back! Continue to your ${userRole === 'ADMIN' ? 'Admin' : userRole === 'SALES_EXECUTIVE' ? 'Sales' : 'Trading'} Dashboard`
                    : 'No credit card required • Start trading in minutes'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Features Preview */}
          <div className="py-20 px-6 bg-white/5 backdrop-blur-lg">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-6">
                  Powerful Trading Features
                </h2>
                <p className="text-xl text-purple-200">
                  Everything you need to succeed in algorithmic trading
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* 1 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border-2 border-transparent hover:border-gradient-to-r hover:from-purple-400 hover:to-pink-400 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl w-12 h-12 mb-4 flex items-center justify-center shadow-md">
                    <Zap size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Backtesting Engine</h3>
                  <p className="text-purple-200 text-sm">
                    Simulate Your Strategy Before Going Live<br />
                    Test your strategies on historical data to optimize performance before deploying them in real trades.
                  </p>
                </div>
                {/* 2 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border-2 border-transparent hover:border-gradient-to-r hover:from-green-400 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl">
                  <div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 rounded-2xl w-12 h-12 mb-4 flex items-center justify-center shadow-md">
                    <BarChart3 size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Smart Strategy Builder</h3>
                  <p className="text-purple-200 text-sm">
                    No-Code Strategy Design<br />
                    Create complex trading strategies with a drag-and-drop interface or simple logic blocks. No coding required.
                  </p>
                </div>
                {/* 3 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border-2 border-transparent hover:border-gradient-to-r hover:from-purple-400 hover:to-pink-400 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-2xl w-12 h-12 mb-4 flex items-center justify-center shadow-md">
                    <TrendingUp size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Real-Time Market Scanner</h3>
                  <p className="text-purple-200 text-sm">
                    Identify Opportunities Instantly<br />
                    Automatically scan the market for your pre-defined conditions or setups like VCP, breakout, etc.
                  </p>
                </div>
                {/* 4 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border-2 border-transparent hover:border-gradient-to-r hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-3 rounded-2xl w-12 h-12 mb-4 flex items-center justify-center shadow-md">
                    <Crown size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Auto Execution & Monitoring</h3>
                  <p className="text-purple-200 text-sm">
                    Set & Forget Trading<br />
                    Automated strategy execution with real-time monitoring and alerts via email, SMS, or Telegram.
                  </p>
                </div>
                {/* 5 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border-2 border-transparent hover:border-gradient-to-r hover:from-pink-400 hover:to-purple-400 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-2xl w-12 h-12 mb-4 flex items-center justify-center shadow-md">
                    <Bell size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Custom Alerts & Notifications</h3>
                  <p className="text-purple-200 text-sm">
                    Stay Informed Instantly<br />
                    Get notified immediately when your strategy hits the target or condition using multi-channel alerts.
                  </p>
                </div>
                {/* 6 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border-2 border-transparent hover:border-gradient-to-r hover:from-green-300 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl">
                  <div className="bg-gradient-to-r from-green-400 to-blue-500 p-3 rounded-2xl w-12 h-12 mb-4 flex items-center justify-center shadow-md">
                    <Sparkles size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">AI-Powered Insights</h3>
                  <p className="text-purple-200 text-sm">
                    Get Smarter With Every Trade<br />
                    Leverage machine learning to identify patterns, optimize entries/exits, and improve profitability.
                  </p>
                </div>
                {/* 7 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border-2 border-transparent hover:border-gradient-to-r hover:from-blue-400 hover:to-green-400 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl">
                  <div className="bg-gradient-to-r from-blue-400 to-green-500 p-3 rounded-2xl w-12 h-12 mb-4 flex items-center justify-center shadow-md">
                    <Shield size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Paper Trading Mode</h3>
                  <p className="text-purple-200 text-sm">
                    Risk-Free Testing<br />
                    Test your strategy in live market conditions without risking real money.
                  </p>
                </div>
                {/* 8 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 border-2 border-transparent hover:border-gradient-to-r hover:from-purple-300 hover:to-pink-400 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-3 rounded-2xl w-12 h-12 mb-4 flex items-center justify-center shadow-md">
                    <Users size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Community & Marketplace</h3>
                  <p className="text-purple-200 text-sm">
                    Share & Monetize Strategies<br />
                    Discover strategies from other traders or publish your own to earn passive income.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer with Terms link */}
      <footer className="w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-blue-100 py-8 px-4 mt-12 relative z-20 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-bold text-2xl tracking-wider flex items-center gap-2">
            <Sparkles size={20} className="text-yellow-300" /> TradeSetu
          </div>
          <div className="flex items-center gap-6">
            <button
              className="underline underline-offset-4 hover:text-yellow-200 transition text-lg font-medium"
              onClick={() => setShowTerms(true)}
            >
              Terms of Use
            </button>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a href="#" aria-label="X (Twitter)" className="hover:text-blue-300 transition font-extrabold text-xl flex items-center justify-center w-[22px] h-[22px]">X</a>
            <a href="#" aria-label="Facebook" className="hover:text-blue-200 transition"><Facebook size={22} /></a>
            <a href="#" aria-label="LinkedIn" className="hover:opacity-80 transition" style={{width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="7" fill="#0A66C2"/>
                <path d="M10.666 13.333h2.667v8h-2.667v-8zm1.333-4a1.333 1.333 0 1 1 0 2.667 1.333 1.333 0 0 1 0-2.667zm3.334 4h2.56v1.093h.037c.356-.675 1.226-1.387 2.523-1.387 2.7 0 3.2 1.776 3.2 4.084v4.21h-2.667v-3.733c0-.89-.016-2.034-1.24-2.034-1.24 0-1.427.97-1.427 1.97v3.797h-2.667v-8z" fill="#fff"/>
              </svg>
            </a>
          </div>
        </div>
        <div className="text-sm opacity-80 mt-2 md:mt-0">© {new Date().getFullYear()} TradeSetu. All rights reserved.</div>
      </footer>
      {/* Terms Modal with gradient background */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-blue-100 rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative overflow-y-auto max-h-[90vh] border border-white/10">
            <button
              className="absolute top-4 right-4 text-gray-200 hover:text-red-300"
              onClick={() => setShowTerms(false)}
              aria-label="Close Terms"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-center mb-4">Terms of Use</h2>
            <hr className="border-white/30 mb-6 w-32 mx-auto" />
            <ol className="list-decimal list-inside space-y-3 text-base">
              <li>
                <span className="font-bold">Agreement</span><br />
                By using this platform, you agree to follow these Terms of Use. If you disagree, please do not use the service.
              </li>
              <li>
                <span className="font-bold">Eligibility</span><br />
                This service is for users legally allowed to trade. You are responsible for your own financial decisions.
              </li>
              <li>
                <span className="font-bold">Account</span><br />
                Creating an account may be required. Keep your login credentials secure and report any misuse.
              </li>
              <li>
                <span className="font-bold">License</span><br />
                We offer a limited, non-commercial license to use this platform for personal or educational purposes only.
              </li>
              <li>
                <span className="font-bold">Disclaimer</span><br />
                The platform provides information tools only and is not financial advice. We don’t guarantee data accuracy.
              </li>
              <li>
                <span className="font-bold">Access Rights</span><br />
                We may suspend your access anytime without notice if you violate our terms.
              </li>
              <li>
                <span className="font-bold">Intellectual Property</span><br />
                All content and code are our property. Copying, resale, or reverse engineering is strictly prohibited.
              </li>
              <li>
                <span className="font-bold">Security</span><br />
                Unauthorized access or system misuse is illegal and may result in legal action.
              </li>
              <li>
                <span className="font-bold">Compliance</span><br />
                You agree to follow all relevant laws related to trading and data privacy.
              </li>
              <li>
                <span className="font-bold">Changes</span><br />
                Terms may change anytime. Continued use means you accept the latest version.
              </li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
};

export default LandingPage;