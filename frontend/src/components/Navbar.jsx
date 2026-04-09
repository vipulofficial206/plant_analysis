import { Link, useNavigate } from 'react-router-dom';
import { Leaf, LogOut, UserCircle } from 'lucide-react';

export default function Navbar({ isAuth, user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-primary-600 p-2.5 rounded-2xl text-white shadow-lg shadow-primary-200 group-hover:rotate-12 transition-transform">
              <Leaf size={24} />
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tighter">
              Krishi<span className="text-primary-600">Saathi</span>
            </span>
          </Link>

          <div className="flex items-center space-x-8">
            <Link to="/" className="text-sm font-bold text-gray-500 hover:text-primary-600 transition-all uppercase tracking-widest">
              Home
            </Link>
            
            {isAuth ? (
              <>
                <Link to="/history" className="text-sm font-bold text-gray-500 hover:text-primary-600 transition-all uppercase tracking-widest hidden md:block">
                  History
                </Link>
                <Link to="/weather-history" className="text-sm font-bold text-gray-500 hover:text-primary-600 transition-all uppercase tracking-widest hidden md:block">
                  Weather Journal
                </Link>
                <Link to="/best-picks" className="text-sm font-bold text-gray-500 hover:text-primary-600 transition-all uppercase tracking-widest hidden md:block">
                  Crop Vault
                </Link>
                <div className="flex items-center gap-2 bg-primary-50 px-3 py-1.5 rounded-xl border border-primary-100">
                    <UserCircle size={18} className="text-primary-600" />
                    <span className="text-xs font-black text-primary-700 truncate max-w-[100px]">{user?.fullname.split(' ')[0]}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 transition-all uppercase tracking-widest"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 transition-all uppercase tracking-widest">
                <UserCircle size={18} /> Login
              </Link>
            )}

            <Link to="/form" className="bg-gray-900 text-white px-8 py-3 rounded-2xl text-sm font-black hover:bg-black transition-all shadow-xl shadow-gray-200">
              Get Advisory
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
