import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import { Star, Sprout, TrendingUp, Calendar, MapPin, Award, CheckCircle2, FlaskConical } from 'lucide-react';

export default function TopRecommendations({ user }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecos = async () => {
      try {
        const res = await axios.get(`${API_URL}/top_recommendations?userId=${user?._id || ''}`);
        setRecommendations(res.data.history);
      } catch (err) {
        console.error("Reco Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecos();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24 pb-20 font-outfit relative overflow-hidden">
      {/* Decorative Gradient */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-green-50 rounded-full blur-[140px] opacity-40 -ml-64 -mt-64"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <h4 className="text-primary-600 font-black uppercase tracking-[0.3em] text-[10px] mb-2 px-1">Winning Matches</h4>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                  Recommendation <span className="text-primary-600 underline decoration-primary-100 underline-offset-8">Vault</span>
                </h2>
                <p className="text-gray-500 mt-4 max-w-xl font-medium">A curated selection of the best crop and variety matches predicted for your specific soil profiles.</p>
            </div>
            <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="bg-amber-50 p-2.5 rounded-2xl text-amber-600"><Award size={24} /></div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Total Winners</p>
                   <p className="text-lg font-black text-gray-900">{recommendations.length}</p>
                </div>
            </div>
        </header>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-40 text-gray-400 gap-4">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-sm tracking-widest uppercase">Fetching Top Matches...</p>
            </div>
        ) : recommendations.length === 0 ? (
            <div className="bg-white rounded-[40px] p-20 text-center border border-gray-100 shadow-sm">
                <div className="bg-primary-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-300">
                    <Star size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No "Best-Fit" medals yet</h3>
                <p className="text-gray-500">Perform an assessment and save your top choice to see it featured here.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {recommendations.map((reco) => (
                    <div key={reco._id} className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:border-primary-200 transition-all flex flex-col sm:flex-row gap-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-primary-600 transform group-hover:scale-110 transition-transform">
                            <Sprout size={150} strokeWidth={1} />
                        </div>

                        <div className="sm:w-1/3 flex flex-col items-center justify-center text-center bg-gray-50 rounded-[32px] p-6 border border-gray-100 relative z-10">
                            <div className="bg-primary-600 text-white p-4 rounded-full shadow-lg shadow-primary-200 mb-4 transform group-hover:rotate-12 transition-transform">
                                <Award size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 leading-tight mb-2">{reco.crop}</h3>
                            <span className="bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary-100">
                                {reco.variety}
                            </span>
                        </div>

                        <div className="sm:w-2/3 space-y-6 relative z-10 flex flex-col justify-between">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><FlaskConical size={12} /> Soil Balance</p>
                                    <p className="text-sm font-bold text-gray-800">pH {reco.soil_stats.ph} · N{reco.soil_stats.n}</p>
                                </div>
                                <div className="space-y-1 text-right sm:text-left">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-end sm:justify-start gap-1.5"><TrendingUp size={12} /> Predicted Yield</p>
                                    <p className="text-sm font-bold text-gray-800">{reco.variety_details?.yield || "N/A"}</p>
                                </div>
                            </div>

                            <div className="bg-primary-50/50 p-4 rounded-2xl border border-primary-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 size={18} className="text-primary-600" />
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Assessment Cycle</p>
                                        <p className="text-xs font-bold text-gray-900">{new Date(reco.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase">
                                    <MapPin size={12} className="text-red-500" /> {reco.location}
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
