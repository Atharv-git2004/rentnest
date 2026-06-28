import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Building2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { apiRequest } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Standard Email/Password login handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiRequest('/users/login', {
        method: 'POST',
        body: { email, password },
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        const userRole = data.role ? data.role.toLowerCase() : '';
        
        if (userRole === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Server connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth success handler
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);

    try {
      const res = await apiRequest('/users/google', {
        method: 'POST',
        body: { token: credentialResponse.credential },
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        const userRole = data.role ? data.role.toLowerCase() : '';
        
        if (userRole === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      } else {
        setError(data.message || 'Google login failed');
      }
    } catch (err) {
      console.error('Google Login error:', err);
      setError('Server connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-20 left-10 md:left-20 w-64 h-64 md:w-72 md:h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" />
        <div className="absolute bottom-20 right-10 md:right-20 w-64 h-64 md:w-72 md:h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl border border-white/50 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-green-600 text-white rounded-2xl shadow-lg shadow-green-100 mb-4">
            <Building2 size={28} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Welcome Back</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Sign in to manage your rental spaces.</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex items-start gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-semibold"
          >
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-sm font-semibold text-slate-700">
          
          <div className="space-y-1.5">
            <label className="text-gray-500 uppercase tracking-wider text-xs block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input 
                type="email" required placeholder="name@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-slate-800 placeholder-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-500 uppercase tracking-wider text-xs">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input 
                type={showPassword ? 'text' : 'password'} required placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-12 py-3.5 text-slate-800 placeholder-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-xl font-bold transition-colors shadow-lg disabled:opacity-70 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </motion.button>
        </form>

        {/* Google Login Section */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <div className="h-px bg-gray-200 flex-grow"></div>
          <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold whitespace-nowrap">or continue with</span>
          <div className="h-px bg-gray-200 flex-grow"></div>
        </div>

        <div className="mt-6 flex justify-center w-full">
          <GoogleLogin 
            onSuccess={handleGoogleSuccess} 
            onError={() => setError('Google Login Failed')} 
            theme="outline"
            size="large"
            width="100%"
          />
        </div>

        <p className="text-center text-sm text-gray-500 font-medium mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-green-600 font-bold hover:underline">
            Create account
          </Link>
        </p>

      </motion.div>
    </div>
  );
};

export default Login;