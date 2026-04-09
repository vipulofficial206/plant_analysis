import { useState } from 'react';
import axios from 'axios';
import API_URL from '../api';
import { FileUp, Search, Database, Sprout, AlertCircle, FileText, CheckCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CSVAnalyzer() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dfInfo, setDfInfo] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please select a valid .csv file.");
      setFile(null);
    }
  };

  const uploadCSV = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_URL}/upload_csv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDfInfo(res.data);
      // Auto-select common features if found
      const common = ['N', 'P', 'K', 'pH', 'Temperature', 'Humidity', 'Rainfall', 'season', 'texture', 'avg_n', 'avg_p', 'avg_k', 'avg_pH'];
      const autoSelected = res.data.columns.filter(c => common.some(cm => c.toLowerCase().includes(cm.toLowerCase())));
      setSelectedFeatures(autoSelected);
    } catch (err) {
      setError("Failed to process CSV. Ensure it is a valid table format.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = (col) => {
    setSelectedFeatures(prev => 
      prev.includes(col) ? prev.filter(f => f !== col) : [...prev, col]
    );
  };

  const runPrediction = async () => {
    if (selectedFeatures.length === 0) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/predict_from_csv`, {
        filename: dfInfo.filename,
        features: selectedFeatures
      });
      
      // Navigate to Results with CSV-derived predictions
      navigate('/results', { state: { results: res.data.results } });
    } catch (err) {
      setError("Prediction failed. Ensure selected columns contain numeric/categorical data aligned with the model.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 px-4 font-outfit">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-green-600 p-10 text-white relative">
            <div className="relative z-10">
              <h2 className="text-4xl font-black mb-2 tracking-tight">CSV Intelligence Engine</h2>
              <p className="text-white/80 font-medium max-w-lg">Batch analyze soil reports from any spreadsheet. Select your columns and let the AI handle the rest.</p>
            </div>
            <div className="absolute right-10 bottom-0 top-0 flex items-center opacity-10">
               <Database size={180} />
            </div>
          </div>

          <div className="p-10">
            {!dfInfo ? (
              <div className="space-y-8">
                <div 
                  className={`border-4 border-dashed rounded-[32px] p-12 text-center transition-all ${file ? 'border-primary-500 bg-primary-50/50' : 'border-gray-100 hover:border-primary-200 bg-gray-50/30'}`}
                >
                  <input type="file" id="csv-upload" className="hidden" onChange={handleFileChange} accept=".csv" />
                  <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
                    <div className="bg-white p-6 rounded-3xl shadow-xl mb-6 text-primary-600 group hover:scale-110 transition-transform">
                      <FileUp size={48} strokeWidth={1.5} />
                    </div>
                    <span className="text-xl font-bold text-gray-900 mb-1">{file ? file.name : 'Choose CSV File'}</span>
                    <span className="text-gray-500 text-sm font-medium">{file ? `${(file.size / 1024).toFixed(1)} KB` : 'Drop your soil data spreadsheet here'}</span>
                  </label>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm">
                    <AlertCircle size={20} /> {error}
                  </div>
                )}

                <button 
                  onClick={uploadCSV}
                  disabled={!file || loading}
                  className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-lg disabled:opacity-50 shadow-xl shadow-primary-200"
                >
                  {loading ? 'Crunching Numbers...' : <><Search size={22} /> Process Spreadsheet</>}
                </button>
              </div>
            ) : (
              <div className="animate-fade-in space-y-10">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="bg-green-100 text-green-700 p-3 rounded-2xl">
                         <FileText size={24} />
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-gray-900 leading-none">{dfInfo.filename}</h3>
                         <p className="text-gray-500 text-sm font-bold mt-1 uppercase tracking-widest">{dfInfo.row_count} Rows Detected</p>
                      </div>
                   </div>
                   <button onClick={() => {setDfInfo(null); setFile(null);}} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={24} />
                   </button>
                </div>

                <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100">
                  <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                    <CheckCircle size={16} className="text-primary-600" /> Feature Selection (Mapper)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {dfInfo.columns.map(col => (
                      <button
                        key={col}
                        onClick={() => toggleFeature(col)}
                        className={`px-4 py-3 rounded-xl text-sm font-bold border transition-all text-left truncate ${selectedFeatures.includes(col) ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-200 ring-2 ring-primary-100 ring-offset-2' : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'}`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                  <p className="mt-6 text-xs text-gray-400 font-bold leading-relaxed">
                    * Select the columns that contain N, P, K, pH, and Temperature data. We will use the **averages** from these columns to generate your customized regional advisory.
                  </p>
                </div>

                <button 
                  onClick={runPrediction}
                  disabled={selectedFeatures.length === 0 || loading}
                  className="w-full bg-gray-900 text-white py-6 rounded-2xl flex items-center justify-center gap-3 font-black text-xl hover:bg-black transition-all shadow-2xl shadow-gray-200"
                >
                  {loading ? 'AI Engines Running...' : <><Sprout size={24} /> Generate Predictions from CSV</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
