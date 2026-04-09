import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import { CloudRain, Thermometer, Droplets, Calendar, MapPin, ChevronRight, Share2, Wind } from 'lucide-react';

export default function WeatherHistory({ user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeatherHistory = async () => {
      try {
        const res = await axios.get(`${API_URL}/weather_history?userId=${user?._id || ''}`);
        setHistory(res.data.history);
      } catch (err) {
        console.error("Weather History Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeatherHistory();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#FDFCFB] pt-24 pb-20 font-outfit relative overflow-hidden">
      {/* Decorative Aura */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[140px] opacity-40 -mr-64 -mt-64"></div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <header className="mb-12">
            <h4 className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mb-2 px-1">Environmental Logs</h4>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
               Weather <span className="text-blue-600 underline decoration-blue-100 underline-offset-8">Journal</span>
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl font-medium">Historical climate observations captured during your soil assessments. Linked to your unique farmer identity.</p>
        </header>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-40 text-gray-400 gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-sm tracking-widest uppercase">Syncing Atmospheric Data...</p>
            </div>
        ) : history.length === 0 ? (
            <div className="bg-white rounded-[40px] p-20 text-center border border-gray-100 shadow-sm">
                <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-300">
                    <CloudRain size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No climate logs yet</h3>
                <p className="text-gray-500">Weather data is automatically archived here whenever you perform a soil analysis.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((log) => (
                    <div key={log._id} className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 text-gray-100 group-hover:text-blue-50 transition-colors">
                            <Wind size={60} strokeWidth={1} />
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 shadow-sm">
                                    <Thermometer size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 text-lg leading-tight">{log.temp}°C</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Read at {log.location}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50/50 rounded-3xl p-5 border border-gray-100 mb-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Max/Min</p>
                                        <p className="text-sm font-bold text-gray-800">{log.temp_max}° / {log.temp_min}°</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Humidity</p>
                                        <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5"><Droplets size={12} className="text-blue-500" /> {log.humidity}%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-400 font-bold border-t border-gray-50 pt-6">
                                <div className="flex items-center gap-2 uppercase tracking-widest">
                                    <Calendar size={14} className="text-blue-600" /> {new Date(log.timestamp).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2 uppercase tracking-widest">
                                    <MapPin size={14} className="text-red-500" /> {log.location}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
