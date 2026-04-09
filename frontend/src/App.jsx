import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import InputForm from './pages/InputForm';
import Results from './pages/Results';
import Login from './pages/Login';
import CSVAnalyzer from './pages/CSVAnalyzer';
import AssessmentHistory from './pages/History';
import WeatherHistory from './pages/WeatherHistory';
import TopRecommendations from './pages/TopRecommendations';

function App() {
  const [isAuth, setIsAuth] = useState(localStorage.getItem('isAuth') === 'true');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  const updateAuth = (val, userData = null) => {
    localStorage.setItem('isAuth', val);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuth(val);
    setUser(userData);
  };

  // Simple Route Protection
  const PrivateRoute = ({ children }) => {
    return isAuth ? children : <Navigate to="/login" />;
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col font-outfit selection:bg-primary-500 selection:text-white">
        <Navbar isAuth={isAuth} user={user} onLogout={() => updateAuth(false)} />
        <main className="flex-grow">
          <Routes>
            <Route 
              path="/" 
              element={isAuth ? <Navigate to="/form" /> : <Home isAuth={isAuth} />} 
            />
            <Route path="/form" element={<InputForm isAuth={isAuth} user={user} />} />
            <Route path="/results" element={<PrivateRoute><Results user={user} /></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute><AssessmentHistory user={user} /></PrivateRoute>} />
            <Route path="/weather-history" element={<PrivateRoute><WeatherHistory user={user} /></PrivateRoute>} />
            <Route path="/best-picks" element={<PrivateRoute><TopRecommendations user={user} /></PrivateRoute>} />
            <Route path="/login" element={isAuth ? <Navigate to="/form" /> : <Login onLogin={(data) => updateAuth(true, data)} />} />
            <Route path="/csv-analyzer" element={<PrivateRoute><CSVAnalyzer user={user} /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <footer className="bg-gray-950 border-t border-white/5 text-white py-16 mt-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600 rounded-full blur-[120px] opacity-10 -mr-48 -mt-48"></div>
          <div className="max-w-7xl mx-auto px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
               <div className="md:col-span-2">
                  <h3 className="text-2xl font-black mb-6">Krishi<span className="text-primary-400">Saathi</span> AI</h3>
                  <p className="text-gray-400 max-w-sm text-sm font-medium leading-relaxed">
                    Empowering manual and batch farming intelligence through deep-soil analytics, real-time satellite weather, and variety-level yield prediction.
                  </p>
               </div>
               <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6">Navigation</h4>
                  <ul className="space-y-4 text-sm font-bold text-gray-500 hover:text-primary-400">
                    <li><Link to="/">Home Intelligence</Link></li>
                    <li><Link to="/form">Manual Advisory</Link></li>
                    <li><Link to="/csv-analyzer">CSV Processing</Link></li>
                  </ul>
               </div>
               <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6">Connect</h4>
                  <p className="text-gray-500 text-sm font-medium">support@krishisaathi.ai</p>
                  <p className="text-gray-500 text-sm font-medium mt-2">+91 800-AGRI-AI</p>
               </div>
            </div>
            <div className="pt-12 border-t border-white/5 text-[10px] uppercase font-black tracking-[0.4em] text-white/20 text-center">
              © 2026 Smart Agriculture Advisory System. Built for Sustainable Yields.
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
