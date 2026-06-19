import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, AlertCircle, Building2, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google'; // 💡 Google Login Import ചെയ്തു
import { apiRequest } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'owner' // എല്ലാവർക്കും പ്രോപ്പർട്ടി ആഡ് ചെയ്യാൻ ഡിഫോൾട്ട് ആയി 'owner' ആക്കി
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. സാധാരണ Registration (Email & Password)
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

  // 2. Google Registration ഹാൻഡ്ലർ (ലോഗിൻ ചെയ്യുന്ന അതേ API തന്നെ ഉപയോഗിക്കാം)
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
        // ഗൂഗിൾ ലോഗിൻ ചെയ്യുമ്പോൾ നേരിട്ട് ടോക്കൺ ലഭിക്കുന്നതിനാൽ, അപ്പോൾ തന്നെ ലോഗിൻ ചെയ്യിപ്പിക്കാം
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
    <div className="min-h-[90vh] flex items-center justify-center bg-gray-50 px-4 py-10 relative overflow-hidden">
      
      {/* Decorative Blobs */}
      <div className="absolute top-10 right-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob" />
      <div className="absolute bottom-10 left-20 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/20 relative z-10"
      >
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-green-600 text-white rounded-2xl shadow-md mb-3">
            <Building2 size={26} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Create Account</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Join RentNest to find or list premium properties.</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-semibold"
          >
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm font-semibold text-slate-700">
          
          <div className="space-y-1">
            <label className="text-gray-500 uppercase tracking-wider text-xs block">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input 
                name="name" type="text" required placeholder="John Doe" 
                value={formData.name} onChange={handleChange} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-gray-500 uppercase tracking-wider text-xs block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input 
                name="email" type="email" required placeholder="name@example.com" 
                value={formData.email} onChange={handleChange} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-gray-500 uppercase tracking-wider text-xs block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input 
                name="password" type="password" required placeholder="••••••••" 
                value={formData.password} onChange={handleChange} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500" 
              />
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }} 
            whileTap={{ scale: 0.99 }}
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white p-3.5 rounded-xl font-bold transition-colors shadow-lg disabled:opacity-70 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Sign Up <ArrowRight size={18} /></>
            )}
          </motion.button>
        </form>

        {/* --- Google Signup Section --- */}
        <div className="mt-5 flex items-center justify-between">
          <span className="border-b border-gray-200 w-1/5 lg:w-1/4"></span>
          <span className="text-xs text-center text-gray-500 uppercase tracking-wider font-semibold">or sign up with</span>
          <span className="border-b border-gray-200 w-1/5 lg:w-1/4"></span>
        </div>

        <div className="mt-5 flex justify-center">
          <GoogleLogin 
            onSuccess={handleGoogleSuccess} 
            onError={() => setError('Google Signup Failed')} 
            theme="outline"
            size="large"
            width="100%"
            text="signup_with" // 💡 ബട്ടണിൽ 'Sign in' നു പകരം 'Sign up with Google' എന്ന് കാണിക്കാൻ
          />
        </div>
        {/* ----------------------------- */}

        <p className="text-center text-sm text-gray-500 font-medium mt-6">
          Already have an account? <Link to="/login" className="text-green-600 font-bold hover:underline">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;