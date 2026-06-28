import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, AlertCircle, Building2, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google'; // 💡 Imported Google Login
import { apiRequest } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'owner' // Defaulting role to 'owner' so all users can add properties
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. Standard Registration (Email & Password)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiRequest('/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Account created successfully! Please login.');
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed. Try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Server connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Google Registration Handler (using the same login API)
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);

    try {
      const res = await apiRequest('/users/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();

      if (res.ok) {
        // Direct login upon receiving token from Google
        localStorage.setItem('userInfo', JSON.stringify(data));
        window.location.href = '/'; 
      } else {
        setError(data.message || 'Google signup failed');
      }
    } catch (err) {
      console.error('Google Signup error:', err);
      setError('Server connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 sm:py-12 relative overflow-hidden">
      
      {/* Decorative Blobs - Responsive Sizing to prevent overflow */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-48 h-48 md:w-72 md:h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-48 h-48 md:w-72 md:h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-lg p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 relative z-10"
      >
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex p-3 bg-green-600 text-white rounded-2xl shadow-md mb-3 sm:mb-4">
            <Building2 size={24} className="sm:w-[26px] sm:h-[26px]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Create Account</h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1 sm:mt-2">Join RentNest to find or list premium properties.</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 sm:mb-5 flex items-start sm:items-center gap-2 bg-red-50 border border-red-100 text-red-600 p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-semibold"
          >
            <AlertCircle size={18} className="shrink-0 mt-0.5 sm:mt-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 text-sm font-semibold text-slate-700 w-full">
          
          <div className="space-y-1.5">
            <label className="text-gray-500 uppercase tracking-wider text-[11px] sm:text-xs block ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                name="name" type="text" required placeholder="John Doe" 
                value={formData.name} onChange={handleChange} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 sm:py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-500 uppercase tracking-wider text-[11px] sm:text-xs block ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                name="email" type="email" required placeholder="name@example.com" 
                value={formData.email} onChange={handleChange} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 sm:py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-500 uppercase tracking-wider text-[11px] sm:text-xs block ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                name="password" type="password" required placeholder="••••••••" 
                value={formData.password} onChange={handleChange} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 sm:py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" 
              />
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }} 
            whileTap={{ scale: 0.99 }}
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white p-3.5 sm:p-4 rounded-xl font-bold transition-colors shadow-lg disabled:opacity-70 mt-2 sm:mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Sign Up <ArrowRight size={18} /></>
            )}
          </motion.button>
        </form>

        {/* --- Google Signup Section --- */}
        <div className="mt-6 flex items-center justify-between gap-3 w-full">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="text-[10px] sm:text-xs text-center text-gray-400 uppercase tracking-wider font-bold">or sign up with</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <div className="mt-6 flex justify-center w-full">
          <div className="w-full flex justify-center">
            <GoogleLogin 
              onSuccess={handleGoogleSuccess} 
              onError={() => setError('Google Signup Failed')} 
              theme="outline"
              size="large"
              width="100%"
              text="signup_with" // 💡 Display 'Sign up with Google' instead of 'Sign in'
            />
          </div>
        </div>
        {/* ----------------------------- */}

        <p className="text-center text-xs sm:text-sm text-gray-500 font-medium mt-6 sm:mt-8">
          Already have an account? <Link to="/login" className="text-green-600 font-bold hover:underline transition-all">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;