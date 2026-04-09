import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import { History, Calendar, MapPin, Eye, Clock, Info, CheckCircle2, ChevronRight, Search, Droplets, TrendingUp, Trash2, Award } from 'lucide-react';

export default function AssessmentHistory({ user }) {
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history?userId=${user?._id || ''}`);
      setHistory(res.data.history);
    } catch (err) {
      console.error("DB Fetch Error:", err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent selection when clicking delete
    if (!window.confirm("Are you sure you want to delete this assessment record?")) return;
    
    try {
      await axios.delete(`${API_URL}/delete_query/${id}`);
      setHistory(prev => prev.filter(item => item._id !== id));
      if (selectedHistory?._id === id) setSelectedHistory(null);
    } catch (err) {
      alert("Failed to delete record.");
    }
  };

  const filteredHistory = history.filter(item => 
    item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.final_crop?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.final_variety?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-24 pb-20 font-outfit relative overflow-hidden">
      {/* Immersive Dynamic Backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100 rounded-full blur-[120px] opacity-20 -mr-64 -mt-64"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-100 rounded-full blur-[100px] opacity-20 -ml-48 -mb-48"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* History List Container */}
          <div className="lg:w-1/2 flex flex-col">
            <div className="bg-white/70 backdrop-blur-xl border border-white p-6 rounded-t-3xl shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-600 p-2.5 rounded-2xl shadow-lg shadow-primary-200 text-white">
                            <History size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Assessment History</h2>
                    </div>
                    <span className="bg-green-50 text-green-700 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-green-100 italic">
                      Latest First
                    </span>
                </div>

                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-primary-600 transition-colors">
                        <Search size={18} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search by crop, location, or variety..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-primary-500 focus:border-primary-500 shadow-sm outline-none transition-all placeholder:text-gray-400"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3 mt-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
              {loading ? (
                <div className="bg-white p-8 rounded-2xl flex flex-col items-center justify-center text-gray-400 gap-2 border border-dashed">
                  <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  <p>Loading records...</p>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl text-center border-2 border-dashed border-gray-100">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <Calendar size={32} />
                    </div>
                    <p className="text-gray-500 font-medium">No assessment history found matching your search.</p>
                </div>
              ) : filteredHistory.map((item) => (
                <div 
                  key={item._id} 
                  onClick={() => setSelectedHistory(item)}
                  className={`group relative text-left p-5 transition-all duration-300 border cursor-pointer ${selectedHistory?._id === item._id ? 'bg-primary-50/50 border-primary-200 ring-2 ring-primary-500 ring-offset-0 scale-[1.02] shadow-xl shadow-primary-900/5' : 'bg-white border-white hover:border-primary-100 hover:shadow-lg hover:scale-[1.01] shadow-sm'} rounded-3xl overflow-hidden`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl transition-colors ${selectedHistory?._id === item._id ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white group-hover:shadow-lg'}`}>
                        <CheckCircle2 size={24} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight flex items-center gap-2">
                           {item.final_crop} <span className="text-gray-300">•</span> <span className="text-primary-600">{item.final_variety}</span>
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold text-gray-500 uppercase tracking-widest">
                          <span className="flex items-center gap-1"><MapPin size={12} className="text-primary-500"/> {item.location}</span>
                          <span className="flex items-center gap-1"><Clock size={12} className="text-primary-500"/> {new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => handleDelete(e, item._id)}
                          className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                        <ChevronRight size={20} className={`transition-transform duration-300 ${selectedHistory?._id === item._id ? 'text-primary-600 translate-x-1' : 'text-gray-200 group-hover:text-primary-400 group-hover:translate-x-1'}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Details Sidebar Container */}
          <div className="lg:w-1/2 h-full lg:sticky lg:top-24">
            {selectedHistory ? (
              <div className="bg-white rounded-[40px] shadow-2xl p-8 border border-gray-100 ring-1 ring-black/5 relative overflow-hidden group/detail flex flex-col h-full animate-fade-in">
                {/* Visual Header */}
                <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-br from-primary-600 via-green-600 to-green-800"></div>
                <div className="relative z-10 flex flex-col items-center pt-6">
                    <div className="bg-white/10 backdrop-blur-xl p-4 rounded-[28px] mb-4 border border-white/20 shadow-2xl group-hover/detail:scale-110 transition-all duration-500">
                        <Info size={40} className="text-white drop-shadow-md" />
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] mb-2 text-center px-4 leading-none">
                      {selectedHistory.final_crop}
                    </h2>
                    <div className="bg-white px-5 py-1.5 rounded-full text-primary-700 font-black tracking-widest text-[10px] border border-white/50 uppercase shadow-lg shadow-black/5">
                        {selectedHistory.final_variety}
                    </div>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-4 mt-6 bg-gray-50/50 p-6 rounded-[32px] border border-gray-100 shadow-inner">
                    <DetailStat label="Primary Tracking ID" value={selectedHistory._id.substring(0, 12)} color="text-primary-600" />
                    <DetailStat label="Nitrogen (N)" value={selectedHistory.n} unit="kg/ha" />
                    <DetailStat label="Phosphorus (P)" value={selectedHistory.p} unit="kg/ha" />
                    <DetailStat label="Potassium (K)" value={selectedHistory.k} unit="kg/ha" />
                    <DetailStat label="pH Level" value={selectedHistory.ph} unit="pH" />
                    <DetailStat label="Annual Rainfall" value={selectedHistory.rainfall} unit="mm" color="text-blue-600" />
                </div>

                <div className="relative z-10 mt-8 pt-6 border-t border-gray-100">
                    <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                        <Droplets size={16} className="text-primary-600" /> Micro-Climate Analytics
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest mb-1">Avg Temp</p>
                            <p className="text-sm font-bold text-gray-800">{selectedHistory.weather_data?.temp}°C</p>
                        </div>
                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest mb-1">Humidity</p>
                            <p className="text-sm font-bold text-gray-800">{selectedHistory.weather_data?.humidity ? `${selectedHistory.weather_data.humidity}%` : 'N/A'}</p>
                        </div>
                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest mb-1">Avg Rainfall</p>
                            <p className="text-sm font-bold text-blue-600">{selectedHistory.weather_data?.avg_rainfall || 1200} mm</p>
                        </div>
                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest mb-1">Peak High</p>
                            <p className="text-sm font-bold text-red-600">{selectedHistory.weather_data?.temp_max || selectedHistory.weather_data?.temp + 3}°C</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-6 pt-6 border-t border-gray-100">
                    <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                        <TrendingUp size={16} className="text-green-600" /> Plant Recommendation Details
                    </h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-green-50/50 rounded-2xl border border-green-100">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Expected Yield</span>
                            <span className="text-sm font-black text-green-700">{selectedHistory.variety_details?.yield || "8.5 tons/acre"}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Growth Duration</span>
                            <span className="text-sm font-black text-gray-800">{selectedHistory.variety_details?.duration || "120 days"}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-blue-50/30 rounded-2xl border border-blue-100">
                            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Ideal Rainfall Range</span>
                            <span className="text-sm font-black text-blue-800">
                              {selectedHistory.variety_details?.ideal_rainfall_min} - {selectedHistory.variety_details?.ideal_rainfall_max} mm
                            </span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-6 pt-6 border-t border-gray-100">
                    <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                        <Award size={16} className="text-amber-500" /> Suggested Seed Varieties
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {selectedHistory.varieties_list?.length > 0 ? (
                          selectedHistory.varieties_list.map((v, i) => (
                            <span key={i} className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${v.name === selectedHistory.final_variety ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                              {v.name} {v.yield ? `(${v.yield})` : ''}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">No alternative varieties archived for this session.</span>
                        )}
                    </div>
                </div>

                <div className="relative z-10 mt-6 pt-6 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                        {selectedHistory.top_crops?.map((c, i) => (
                          <span key={i} className="px-3 py-1 bg-white border border-gray-100 text-primary-600 text-[10px] font-black rounded-full shadow-sm">
                            {c.name} ({c.score}%)
                          </span>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 mt-auto pt-8">
                    <button onClick={() => window.print()} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black shadow-xl shadow-gray-200 transition-all flex items-center justify-center gap-3 group/print">
                       Download Report <div className="bg-white/10 p-1.5 rounded-lg group-hover/print:bg-white/20"><ChevronRight size={20} /></div>
                    </button>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm border-2 border-dashed border-gray-200 rounded-[40px] text-center p-12 transition-all">
                <div className="relative mb-8">
                    <div className="absolute -inset-4 bg-primary-100 rounded-full blur-2xl animate-pulse"></div>
                    <div className="relative bg-white w-24 h-24 rounded-[32px] shadow-2xl flex items-center justify-center text-primary-600 rotate-6 hover:rotate-0 transition-transform">
                        <Eye size={48} strokeWidth={1.5} />
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Detailed Analytics</h3>
                <p className="text-gray-500 max-w-sm font-medium">Select an assessment from your history to view the complete soil health map and predicted recommendations.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailStat({ label, value, unit = '', color = 'text-gray-900' }) {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-white hover:border-primary-100 transition-colors">
            <p className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] mb-1">{label}</p>
            <p className={`text-lg font-black ${color}`}>{value}<span className="text-xs font-bold text-gray-400 ml-1">{unit}</span></p>
        </div>
    );
}
