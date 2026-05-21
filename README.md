# 🌱 Krishi Saathi AI - Smart Farming Solutions

**Krishi Saathi AI** is a comprehensive, AI-Based Soil Intelligence System designed to help farmers make data-driven decisions. By analyzing real-world soil test reports, local agro-climatic conditions, and environmental metrics, the system recommends the most suitable crops, outlines the perfect seed varieties, and estimates exact yield potentials.

---

## ✨ Features

- **📊 Comprehensive Soil & Climate Analysis:** Consumes macronutrients (Nitrogen, Phosphorus, Potassium), pH levels, soil texture, local rainfall, temperature, and seasonal data.
- **📍 Real-time Weather Integration:** Uses the browser's Geolocation API to auto-detect farms and fetch real-time weather conditions (via OpenWeather API).
- **🚀 Machine Learning Powered Advisory:**
  - **Crop Recommendation Engine:** Uses a Random Forest Classifier to score and return the **Top 5** most suitable crops for your exact environment.
  - **Variety Engine & Yield Estimator:** Once a crop is selected, an XGBoost Regression stack dynamically assesses and calculates the expected yield (tons/acre), ideal pH ranges, and suitability percentage for multiple seed varieties.
- **🎨 State-of-the-Art UX:** An incredibly immersive frontend built with React and Tailwind CSS v4, featuring dynamically rendered percentage gauges and beautiful step-by-step advisory results.
- **🗄️ Database Intelligent Subsystems:** Stores resolved farmer queries natively in a MongoDB Atlas `user_queries` collection for future aggregation without storing unnecessary dataset bloat.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS v4, Axios, Lucide React Icons.
- **Backend:** Python, FastAPI, Uvicorn.
- **Machine Learning:** Scikit-Learn (Random Forest Models), XGBoost.
- **Database:** MongoDB (via PyMongo).

---

## 🚀 Getting Started

Follow these steps to spin up the local development environments!

### 1. Environment Variables
Create or open the `.env` file in the root directory and add your private API keys:
```env
MONGO_URI=mongodb+srv://<replace_with_your_username>:<replace_with_your_password>@<replace_with_your_cluster>.mongodb.net/?retryWrites=true&w=majority
OPENWEATHER_API_KEY=your_api_key_here
```

### 2. Conda Environment
Make sure your Conda environment containing all required Python and ML dependencies is activated. 
*(If you haven't created one, you will need to install dependencies like `fastapi`, `uvicorn`, `pandas`, `scikit-learn`, `xgboost`, `python-dotenv`, and `pymongo`.)*
```bash
# Activate your local AI environment
conda activate agri_ai_env
```

### 3. Start the FastAPI Backend
Launch the backend models API on your local port `8000`:
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```
*(The backend will securely load the saved ML models from the `/models` directory and establish a connection utilizing the Mongo URI).*

### 4. Start the React Frontend
Open a new, separate terminal window, navigate to the frontend directory, and spin up the Vite development server:
```bash
cd frontend
npm run dev
```

Visit the `localhost` URL provided by Vite in your browser to access the beautiful Farm Assessment UI natively!

---

## 📚 Technical Documentation
For a precise breakdown of the underlying Database Architecture, ML Mapping methodologies, and Future Enhancements, please view the [Project Documentation](project_documentation.md) file included in this repository.
