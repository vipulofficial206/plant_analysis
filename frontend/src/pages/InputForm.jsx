import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import { Beaker, MapPin, TestTube, ThermometerSun, Sprout, LocateFixed, FileSpreadsheet, Keyboard, FileText, Search, Trash2, CheckCircle, AlertCircle, FileUp, Filter } from 'lucide-react';

const COMMON_CROPS = [
  "Rice (Paddy)", "Maize", "Wheat", "Sugarcane", "Cotton", "Groundnut", "Chilli", "Onion", "Tomato", "Mango", "Banana"
];

export default function InputForm({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [inputMode, setInputMode] = useState('manual'); // 'manual' or 'csv'
  const [targetCrop, setTargetCrop] = useState(''); // Optional specific crop selection
  
  // CSV State
  const [file, setFile] = useState(null);
  const [csvError, setCsvError] = useState(null);
  const [dfInfo, setDfInfo] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  const [formData, setFormData] = useState({
    location: '',
    n: '',
    p: '',
    k: '',
    ph: '',
    season: 'Kharif',
    texture: 'Well_drained'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getLocationDesktop = async () => {
    // 1. Try Browser Geolocation first
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Added User-Agent as per Nominatim Policy
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
             headers: { 'User-Agent': 'PlantAnalysisApp/1.0' }
          });
          if (res.data && res.data.address) {
            const city = res.data.address.city || res.data.address.county || res.data.address.state_district || res.data.address.town || res.data.address.village;
            if (city) {
              setFormData(prev => ({ ...prev, location: city }));
              return;
            }
          }
        } catch (error) {
          console.warn("Reverse geocode failed, trying IP fallback...");
          fetchIPLocation();
        }
      }, (error) => {
        console.warn("Geolocation permission denied, trying IP fallback...");
        fetchIPLocation();
      });
    } else {
      fetchIPLocation();
    }
  };

  const fetchIPLocation = async () => {
    try {
      // Free IP Geolocation Fallback
      const res = await axios.get('https://ipapi.co/json/');
      if (res.data && res.data.city) {
        setFormData(prev => ({ ...prev, location: res.data.city }));
      }
    } catch (err) {
      console.warn("IP Geolocation also failed.");
    }
  };

  useEffect(() => {
    getLocationDesktop();
  }, []);

  // CSV Handlers
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setCsvError(null);
    } else {
      setCsvError("Please select a valid .csv file.");
      setFile(null);
    }
  };

  const uploadCSV = async () => {
    if (!file) return;
    setLoading(true);
    setCsvError(null);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await axios.post(`${API_URL}/upload_csv`, fd);
      setDfInfo(res.data);
      const common = ['N', 'P', 'K', 'pH', 'Temperature', 'Humidity', 'Rainfall', 'season', 'texture', 'avg_n', 'avg_p', 'avg_k', 'avg_pH'];
      const autoSelected = res.data.columns.filter(c => common.some(cm => c.toLowerCase().includes(cm.toLowerCase())));
      setSelectedFeatures(autoSelected);
    } catch (err) {
      setCsvError("Failed to process CSV.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = (col) => {
    setSelectedFeatures(prev => prev.includes(col) ? prev.filter(f => f !== col) : [...prev, col]);
  };

  const handleCsvSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/predict_from_csv`, {
        filename: dfInfo.filename,
        features: selectedFeatures
      });
      const results = res.data.results;
      if (formData.location) results.params.location = formData.location;
      navigate('/results', { state: { results } });
    } catch (err) {
      setCsvError("CSV Prediction failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const weatherReq = await axios.post(`${API_URL}/weather`, { 
        location: formData.location,
        userId: user?._id // New: Send userId to link weather log
      }).catch(() => ({ data: { temp: 28.5, humidity: 65, description: "Sunny (mock)" }}));
      const weather = weatherReq.data;
      const predPayload = {
        n: parseFloat(formData.n),
        p: parseFloat(formData.p),
        k: parseFloat(formData.k),
        ph: parseFloat(formData.ph),
        temp: weather.temp,
        rainfall: 1200, 
        season: formData.season,
        texture: formData.texture,
        location: formData.location
      };

      if (targetCrop) {
        // Direct Variety Path
        const res = await axios.post(`${API_URL}/predict_varieties`, { ...predPayload, crop: targetCrop });
        const results = { 
          weather, 
          crops: [{ name: targetCrop, score: 100 }], 
          params: predPayload,
          autoOpenCrop: targetCrop,
          autoVarieties: res.data.varieties
        };

        // AUTO-SAVE
        await axios.post(`${API_URL}/save_query`, {
           ...predPayload,
           userId: user?._id,
           final_crop: targetCrop,
           final_variety: res.data.varieties[0]?.name || "Standard",
           weather_data: weather,
           top_crops: results.crops,
           variety_details: res.data.varieties[0]
        });

        navigate('/results', { state: { results } });
      } else {
        // Standard Crop list Path
        const cropRes = await axios.post(`${API_URL}/predict_crops`, predPayload);
        const results = { weather, crops: cropRes.data.crops, params: predPayload };

        // AUTO-SAVE (Default to top suggested crop + Fetch its varieties)
        const topCrop = cropRes.data.crops[0]?.name;
        let varietiesForTop = [];
        if (topCrop) {
           const varRes = await axios.post(`${API_URL}/predict_varieties`, { ...predPayload, crop: topCrop });
           varietiesForTop = varRes.data.varieties;
        }

        await axios.post(`${API_URL}/save_query`, {
           ...predPayload,
           userId: user?._id,
           final_crop: topCrop || "Unknown",
           final_variety: varietiesForTop[0]?.name || "Standard",
           weather_data: { ...weather, avg_rainfall: weather.avg_rainfall || 1200 },
           top_crops: cropRes.data.crops,
           varieties_list: varietiesForTop, // Save the whole seed variety list!
           variety_details: varietiesForTop[0] || {}
        });

        navigate('/results', { state: { results } });
      }
    } catch (error) {
      alert("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 bg-[#F8FAFC] flex items-center justify-center pt-24 pb-24 font-outfit">
      <div className="max-w-4xl w-full mx-auto px-4">
        <div className="bg-white p-8 sm:p-12 shadow-2xl rounded-[48px] relative overflow-hidden border border-gray-100">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-primary-100 opacity-50 blur-3xl"></div>
          
          <div className="relative">
            <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Farm <span className="text-primary-600">Assessment</span></h2>
            <p className="text-gray-500 mb-10 font-bold uppercase tracking-widest text-[10px]">Precision Intelligence for Sustainable Yields</p>
            
            {/* 1. Location & Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50/80 p-6 rounded-[32px] border border-gray-100">
                  <div className="flex items-center gap-2 mb-3 justify-between">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <MapPin size={14} className="text-primary-500"/> Farm Location
                    </label>
                    <button type="button" onClick={getLocationDesktop} className="text-primary-600 text-[10px] font-black uppercase flex items-center gap-1 hover:text-primary-700 transition-all">
                      <LocateFixed size={12} /> Auto-detect
                    </button>
                  </div>
                  <input required type="text" name="location" value={formData.location} onChange={handleChange} className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-gray-900 font-bold focus:ring-2 focus:ring-primary-500 outline-none shadow-sm transition-all" placeholder="Enter City (e.g., Pune)" />
                </div>
                <div className="bg-gray-50/80 p-6 rounded-[32px] border border-gray-100">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                      <Filter size={14} className="text-primary-500"/> Analyze Specific Crop? <span className="text-[8px] opacity-40 lowercase">(Optional)</span>
                    </label>
                    <select 
                      value={targetCrop} 
                      onChange={(e) => setTargetCrop(e.target.value)}
                      className="w-full bg-white border border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer"
                    >
                      <option value="">AI Recommended (Best Fit)</option>
                      {COMMON_CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-[28px] mb-8 max-w-md mx-auto shadow-inner">
               <button 
                 onClick={() => setInputMode('manual')}
                 className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all ${inputMode === 'manual' ? 'bg-white text-primary-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 <Keyboard size={18} /> Manual
               </button>
               <button 
                 onClick={() => setInputMode('csv')}
                 className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all ${inputMode === 'csv' ? 'bg-white text-primary-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 <FileSpreadsheet size={18} /> Batch CSV
               </button>
            </div>

            {inputMode === 'manual' ? (
              <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <ThermometerSun size={14} className="text-primary-500"/> Current Season
                    </label>
                    <select name="season" value={formData.season} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                      <option value="Kharif">Kharif (Monsoon)</option>
                      <option value="Rabi">Rabi (Winter)</option>
                      <option value="Zaid">Zaid (Summer)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Sprout size={14} className="text-primary-500"/> Soil Texture
                    </label>
                    <select name="texture" value={formData.texture} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                      <option value="Well_drained">Well Drained</option>
                      <option value="Poorly_drained">Poorly Drained</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-primary-600"><Beaker size={120} /></div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                    Chemical Composition
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    <InputField label="Nitrogen (N)" name="n" val={formData.n} change={handleChange} placeholder="120" />
                    <InputField label="Phosphorus (P)" name="p" val={formData.p} change={handleChange} placeholder="60" />
                    <InputField label="Potassium (K)" name="k" val={formData.k} change={handleChange} placeholder="100" />
                  </div>
                  <div className="relative z-10 pt-4">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">pH Level <span className="text-[8px] font-medium opacity-60">(Potential of Hydrogen)</span></label>
                    <input required type="number" step="0.1" name="ph" value={formData.ph} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 font-bold focus:ring-2 focus:ring-primary-500 outline-none" placeholder="6.5" />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full btn-primary py-6 rounded-[32px] font-black text-xl shadow-2xl shadow-primary-200 flex items-center justify-center gap-3 active:scale-95 transition-all">
                  {loading ? 'Crunching Numbers...' : <><Sprout size={28}/> {targetCrop ? `Predict Varieties for ${targetCrop}` : 'Discover Best Suitable Crops'}</>}
                </button>
              </form>
            ) : (
              <div className="space-y-8 animate-fade-in">
                 {!dfInfo ? (
                   <div className="space-y-6">
                      <div className={`border-4 border-dashed rounded-[40px] p-16 text-center transition-all ${file ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-gray-50 hover:border-primary-200'}`}>
                         <input type="file" id="inner-csv" className="hidden" onChange={handleFileChange} />
                         <label htmlFor="inner-csv" className="cursor-pointer flex flex-col items-center">
                            <div className="bg-white p-6 rounded-3xl shadow-xl mb-6 text-primary-600 transition-transform hover:scale-110"><FileUp size={48}/></div>
                            <p className="text-xl font-black text-gray-900 tracking-tight">{file ? file.name : 'Drop Soil CSV'}</p>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">{file ? `${(file.size / 1024).toFixed(1)} KB` : 'Analyze whole village data at once'}</p>
                         </label>
                      </div>
                      <button onClick={uploadCSV} disabled={!file || loading} className="w-full bg-gray-900 text-white py-5 rounded-[32px] font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl">
                         {loading ? 'Mapping Data...' : <><Search size={22}/> Sequence Spreadsheet</>}
                      </button>
                   </div>
                 ) : (
                   <div className="bg-gray-50 p-10 rounded-[40px] border border-gray-100 space-y-8 animate-in slide-in-from-bottom-5">
                      <div className="flex items-center justify-between">
                         <div>
                            <h4 className="font-black text-gray-900 text-xl tracking-tight leading-none mb-1">Feature Mapper</h4>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{dfInfo.row_count} soil profiles detected</p>
                         </div>
                         <button onClick={() => setDfInfo(null)} className="bg-white p-3 rounded-2xl text-red-500 shadow-sm hover:bg-red-50 transition-colors"><Trash2 size={20}/></button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                         {dfInfo.columns.map(c => (
                           <button key={c} onClick={() => toggleFeature(c)} className={`p-4 rounded-xl text-xs font-bold border transition-all truncate text-left shadow-sm ${selectedFeatures.includes(c) ? 'bg-primary-600 text-white border-primary-600 scale-[1.02]' : 'bg-white text-gray-600 border-white hover:border-primary-100'}`}>{c}</button>
                         ))}
                      </div>
                      <div className="pt-6 border-t border-gray-200">
                         <button onClick={handleCsvSubmit} disabled={selectedFeatures.length === 0 || loading} className="w-full btn-primary py-6 rounded-[32px] font-black text-xl shadow-2xl shadow-primary-200">
                            {loading ? 'Predicting Batch Intelligence...' : 'Generate Batch Predictions'}
                         </button>
                      </div>
                   </div>
                 )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, name, val, change, placeholder }) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-50 hover:border-primary-100 transition-colors shadow-sm">
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{label}</label>
      <input required type="number" step="0.1" name={name} value={val} onChange={change} className="w-full bg-transparent text-xl font-black text-gray-900 focus:outline-none placeholder:text-gray-200" placeholder={placeholder} />
    </div>
  );
}
