import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import { Sprout, CloudRain, TrendingUp, ShieldCheck, ArrowRight, Zap, Target, Gauge, FileText } from 'lucide-react';

const features = [
  {
    icon: <Sprout className="text-emerald-500" size={32} />,
    title: 'Crop Selection',
    description: 'Get perfect crop recommendations based on your soil nutrients (NPK), pH, and season.'
  },
  {
    icon: <ShieldCheck className="text-blue-500" size={32} />,
    title: 'Variety Suggestion',
    description: 'Discover the most resistant and high-yielding crop varieties for your local conditions.'
  },
  {
    icon: <TrendingUp className="text-amber-500" size={32} />,
    title: 'Yield Prediction',
    description: 'Estimate your future harvest with our advanced XGBoost regression models.'
  },
  {
    icon: <CloudRain className="text-sky-500" size={32} />,
    title: 'Weather Insights',
    description: 'Real-time weather data fetched from OpenWeather to refine your advisory.'
  }
];

export default function Home() {
  const [stats, setStats] = useState({ total_assessments: 0, active_crops: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/stats`);
        setStats(res.data);
      } catch (err) {
        console.warn("Stats API failed");
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="bg-white min-h-screen overflow-x-hidden font-outfit">
      
      {/* 🚀 Hero Section - Immersive Design */}
      <div className="relative isolate pt-14 lg:px-8 bg-white selection:bg-primary-100 min-h-screen flex items-center">
        {/* Abstract Background Blobs */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-primary-400 to-green-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
            <div className="flex mb-8">
             
            </div>
            <h1 className="mt-10 max-w-lg text-4xl font-extrabold tracking-tight text-gray-900 sm:text-7xl">
              Precision Farming <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-green-500">Powered by AI.</span>
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-600 font-medium">
              Transform your soil test reports into actionable intelligent decisions. We bridge the gap between complex science and profitable farming.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link to="/form" className="btn-primary px-10 py-4 text-lg rounded-2xl shadow-2xl shadow-primary-200 flex items-center group">
                Get Your Advisory <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="text-sm font-bold leading-6 text-gray-900 flex items-center gap-1 hover:text-primary-600 transition-colors">
                Sign In to Dashboard <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          
          {/* Animated Stats Card Sidebar */}
          <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-green-400 rounded-[40px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white rounded-[40px] border border-gray-100 p-8 shadow-2xl space-y-8">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                   <Gauge size={16} className="text-primary-600" /> Platform Live Snapshot
                </h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-primary-50 rounded-3xl border border-primary-100 group/item hover:bg-primary-600 transition-all">
                      <Zap className="text-primary-600 mb-4 group-hover/item:text-white" size={32} />
                      <div className="text-3xl font-black text-gray-900 group-hover/item:text-white leading-none">{stats.total_assessments}+</div>
                      <div className="text-xs font-bold text-primary-700/60 uppercase group-hover/item:text-white/80 mt-2">Assessments Logged</div>
                   </div>
                   <div className="p-6 bg-green-50 rounded-3xl border border-green-100 group/item hover:bg-green-600 transition-all">
                      <Target className="text-green-600 mb-4 group-hover/item:text-white" size={32} />
                      <div className="text-3xl font-black text-gray-900 group-hover/item:text-white leading-none">{stats.active_crops}+</div>
                      <div className="text-xs font-bold text-green-700/60 uppercase group-hover/item:text-white/80 mt-2">Crops Calibrated</div>
                   </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between">
                   <div className="flex -space-x-3">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                           <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-primary-600 flex items-center justify-center text-white font-bold text-[10px]">+2k</div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Community</p>
                      <p className="text-sm font-bold text-gray-900">Active Farmers</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🛠 Features Section */}
      <div className="py-24 sm:py-32 bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
             <h2 className="text-base font-black leading-7 text-primary-600 uppercase tracking-widest">Scientific Core</h2>
             <p className="mt-2 text-4xl font-black tracking-tight text-gray-900 sm:text-6xl">Everything you need to succeed.</p>
          </div>
          <div className="mx-auto mt-24 max-w-2xl sm:mt-20 lg:mt-32 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-12 gap-y-16 lg:max-w-none lg:grid-cols-4">
              {features.map((feature, index) => (
                <div key={index} className="relative group p-8 bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-gray-100">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-50 shadow-inner group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <dt className="text-2xl font-black leading-7 text-gray-900 mb-4">
                    {feature.title}
                  </dt>
                  <dd className="text-md leading-relaxed text-gray-500 font-medium tracking-tight">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* 📊 Dedicated CSV Section */}
      <div className="py-24 bg-primary-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600 rounded-full blur-[100px] opacity-10 -mr-48 -mt-48"></div>
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
           <h2 className="text-3xl font-black text-white sm:text-5xl mb-6">Have bulk soil reports?</h2>
           <p className="text-primary-100 text-lg mb-10 max-w-2xl mx-auto font-medium">Use our batch CSV analyzer to process large amounts of farmer data in seconds and get instant intelligence.</p>
           <Link to="/csv-analyzer" className="inline-flex items-center gap-3 bg-white text-primary-900 px-10 py-5 rounded-2xl font-black text-xl hover:bg-primary-50 transition-all shadow-2xl">
              <FileText size={24} /> Try CSV Intelligence Engine
           </Link>
        </div>
      </div>
    </div>
  );
}
