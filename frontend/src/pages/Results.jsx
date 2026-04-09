import { useState, useEffect } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import { ArrowLeft, CheckCircle2, ChevronRight, X, Sprout, Gauge, Beaker, Calendar, TrendingUp, Info, Droplets } from 'lucide-react';

export default function Results({ user }) {
  const location = useLocation();
  const results = location.state?.results;
  
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [varieties, setVarieties] = useState([]);
  const [loadingVarieties, setLoadingVarieties] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (results?.autoOpenCrop) {
      setSelectedCrop(results.autoOpenCrop);
      setVarieties(results.autoVarieties || []);
      setIsDrawerOpen(true);
    }
  }, [results]);

  if (!results) {
    return <Navigate to="/form" />;
  }

  const { crops, params, weather } = results;

  const handleSelectCrop = async (cropName) => {
    setLoadingVarieties(true);
    setSelectedCrop(cropName);
    setIsDrawerOpen(true);
    
    try {
      const payload = {
        ...params,
        crop: cropName
      };
      const res = await axios.post(`${API_URL}/predict_varieties`, payload);
      setVarieties(res.data.varieties);
    } catch (err) {
      setVarieties([
        { name: "Optimal Variety", duration: "120 days", ideal_ph: "6.0-7.0", score: 88, yield: "8.5 tons/acre" }
      ]);
    } finally {
      setLoadingVarieties(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-outfit relative overflow-x-hidden">
      {/* Immersive Dynamic Backgrounds */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-100/40 rounded-full blur-[120px] -mr-64 -mt-64"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-100/40 rounded-full blur-[100px] -ml-48 -mb-48"></div>

      <div className="max-w-5xl mx-auto px-6 pt-24 relative z-10">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
             <h4 className="text-primary-600 font-black uppercase tracking-[0.3em] text-[10px] mb-2 px-1">AI Recommendation Engine</h4>
             <h1 className="text-4xl font-black text-gray-900 tracking-tight">Your Soil <span className="text-primary-600">Intelligence.</span></h1>
          </div>
          <Link to="/form" className="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm hover:shadow-md transition-all text-gray-400 hover:text-primary-600">
            <X size={24} />
          </Link>
        </div>

        {/* Intelligence Context Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5 group hover:border-primary-100 transition-all">
                <div className="bg-primary-50 p-4 rounded-2xl text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all">
                    <Droplets size={24} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Environment</p>
                    <p className="text-lg font-black text-gray-800">{weather?.temp}°C · {weather?.humidity}% RH</p>
                    <p className="text-[10px] font-bold text-primary-500 capitalize">{weather?.description}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5 group hover:border-primary-100 transition-all">
                <div className="bg-green-50 p-4 rounded-2xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                    <Beaker size={24} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Soil Texture</p>
                    <p className="text-lg font-black text-gray-800">{params.texture.replace('_', ' ')}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5 group hover:border-primary-100 transition-all">
                <div className="bg-amber-50 p-4 rounded-2xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
                    <Calendar size={24} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Planned Season</p>
                    <p className="text-lg font-black text-gray-800">{params.season} Cycle</p>
                </div>
            </div>
        </div>

        {/* Crop Selection Grid */}
        <div className="mb-8">
           <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8 px-1 flex items-center gap-2">
             <TrendingUp size={16} className="text-primary-600" /> Optimal Crop Suitability Ranking
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {crops.map((crop, idx) => (
               <div 
                 key={idx} 
                 onClick={() => handleSelectCrop(crop.name)}
                 className="group bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:border-primary-300 transition-all cursor-pointer relative overflow-hidden"
               >
                 <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-full -mr-12 -mt-12 group-hover:bg-primary-600 transition-all"></div>
                 <div className="relative z-10">
                    <div className="bg-primary-50 w-14 h-14 rounded-2xl flex items-center justify-center text-primary-600 group-hover:bg-white transition-all mb-6">
                        <Sprout size={28} />
                    </div>
                    <div className="flex items-end justify-between mb-2">
                       <h3 className="text-2xl font-black text-gray-900 tracking-tight">{crop.name}</h3>
                       <div className="text-primary-600 font-black text-lg">{crop.score}%</div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
                       <div className="h-full bg-primary-600 transition-all duration-1000" style={{ width: `${crop.score}%` }}></div>
                    </div>
                    <button className="flex items-center gap-2 text-xs font-black text-primary-600 uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                      Explore Varieties <ChevronRight size={14} />
                    </button>
                 </div>
               </div>
             ))}
           </div>
        </div>

      </div>

      {/* 🚀 Drawer Implementation for Varieties */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setIsDrawerOpen(false)}></div>
           
           <div className="relative bg-white w-full max-w-4xl h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-[40px] sm:rounded-[48px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-20 duration-500">
              {/* Drawer Header */}
              <div className="bg-gray-900 p-8 text-white relative">
                 <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight">{selectedCrop} <span className="text-primary-400">Varieties</span></h2>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Recommended for current soil parameters</p>
                    </div>
                    <button onClick={() => setIsDrawerOpen(false)} className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-colors">
                        <X size={24} />
                    </button>
                 </div>
                 <div className="absolute top-0 right-0 h-full w-64 bg-primary-600 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32"></div>
              </div>

              {/* Drawer Body */}
              <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                {loadingVarieties ? (
                   <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                      <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="font-bold text-sm tracking-widest uppercase">Crunching Yield Data...</p>
                   </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                     {varieties.map((vari, idx) => (
                       <div key={idx} className="bg-gray-50 border border-gray-100 rounded-[32px] p-8 group hover:bg-white hover:shadow-xl transition-all">
                          <div className="flex items-center justify-between mb-6">
                             <div className="bg-white p-3 rounded-xl shadow-sm"><Sprout className="text-primary-600" /></div>
                             <div className="bg-primary-600 text-white px-4 py-1 rounded-full text-xs font-black shadow-lg shadow-primary-200">{vari.score}% Match</div>
                          </div>
                          <h3 className="text-2xl font-black text-gray-900 mb-6">{vari.name}</h3>
                          
                          <div className="space-y-4 mb-8">
                             <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase">Crop Duration</span>
                                <span className="text-sm font-bold text-gray-800">{vari.duration}</span>
                             </div>
                             <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase">Ideal pH Range</span>
                                <span className="text-sm font-bold text-gray-800">{vari.ideal_ph}</span>
                             </div>
                             <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-amber-500 uppercase">Expected Yield</span>
                                <span className="text-lg font-black text-gray-900 flex items-center gap-1"><TrendingUp size={16} className="text-green-500" /> {vari.yield}</span>
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
                )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
