import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock, ArrowRight, MapPin, Type } from 'lucide-react';
import axios from 'axios';
import API_URL from '../api';

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const endpoint = isLogin ? 'login' : 'signup';
    const payload = isLogin 
      ? { username, password } 
      : { username, password, fullname, location };

    try {
      const res = await axios.post(`${API_URL}/${endpoint}`, payload);
      if (res.data.status === 'success') {
        onLogin(res.data.user);
        navigate('/history');
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Authentication failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-24 pb-20 font-outfit">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 relative overflow-hidden border border-gray-100">
        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-full -mr-16 -mt-16 blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-100 rounded-full -ml-12 -mb-12 blur-3xl opacity-60"></div>

        <div className="relative text-center mb-10">
          <div className="bg-primary-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-200 text-white transform hover:rotate-6 transition-transform">
            <LogIn size={40} />
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">{isLogin ? 'Welcome Back' : 'Join the Force'}</h2>
          <p className="text-gray-500 mt-3 font-medium">
            {isLogin ? 'Access your smart farming dashboard.' : 'Start your journey to zero waste and higher yield.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5 relative">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                  <Type size={14} className="text-primary-500" /> Full Name
                </label>
                <input 
                  required 
                  type="text" 
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 text-gray-900 font-bold rounded-2xl focus:ring-2 focus:ring-primary-500 block p-4 shadow-inner outline-none transition-all" 
                  placeholder="John Doe" 
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                  <MapPin size={14} className="text-primary-500" /> Location
                </label>
                <input 
                  required 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 text-gray-900 font-bold rounded-2xl focus:ring-2 focus:ring-primary-500 block p-4 shadow-inner outline-none transition-all" 
                  placeholder="Pune, Maharashtra" 
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
              <User size={14} className="text-primary-500" /> Username
            </label>
            <input 
              required 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 text-gray-900 font-bold rounded-2xl focus:ring-2 focus:ring-primary-500 block p-4 shadow-inner outline-none transition-all" 
              placeholder="farmer_john" 
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
              <Lock size={14} className="text-primary-500" /> Password
            </label>
            <input 
              required 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 text-gray-900 font-bold rounded-2xl focus:ring-2 focus:ring-primary-500 block p-4 shadow-inner outline-none transition-all" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full ${loading ? 'opacity-70' : ''} bg-primary-600 text-white py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-xl mt-4 shadow-2xl shadow-primary-200 active:scale-95 hover:scale-[1.02] transition-all`}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In Now' : 'Register Now')} 
            {!loading && <ArrowRight size={22} className="opacity-50" />}
          </button>
        </form>

        <div className="mt-10 text-center text-sm">
          <p className="text-gray-500 font-medium tracking-tight">
            {isLogin ? "New to Krishi Saathi?" : 'Already have an account?'}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="ml-2 text-primary-600 font-black hover:text-primary-700 hover:underline transition-colors capitalize"
            >
              {isLogin ? 'Create one here' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
