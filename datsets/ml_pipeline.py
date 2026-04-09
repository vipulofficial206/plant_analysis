import os
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
import xgboost as xgb
import joblib

def run():
    print("STEP 7: EDA")
    df = pd.read_csv('master_dataset.csv')
    
    # 1. Clean up user's modified column names
    rename_map = {
        'reco ended_season': 'recommended_season',
        'min_rainfall_ ': 'min_rainfall_mm',
        'max_rainfall_ ': 'max_rainfall_mm',
        'reco endation_score': 'recommendation_score',
        'N': 'avg_n'
    }
    df.rename(columns=rename_map, inplace=True)
    
    if 'Unnamed: 29' in df.columns:
        df.drop(columns=['Unnamed: 29'], inplace=True)

    # Summary statistics
    summary_stats = df.describe()
    
    # Generate EDA Report
    report = "# Exploratory Data Analysis & Insights (Updated Model)\n\n"
    report += "## Summary Statistics\n"
    report += summary_stats.to_markdown() + "\n\n"
    
    os.makedirs('models', exist_ok=True)
    os.makedirs('artifacts', exist_ok=True)
    
    numeric_df = df.select_dtypes(include=[np.number])
    
    if not numeric_df.empty:
        # Correlation Heatmap
        plt.figure(figsize=(12, 10))
        corr = numeric_df.corr()
        sns.heatmap(corr, cmap="coolwarm")
        plt.title('Correlation Heatmap')
        plt.tight_layout()
        plt.savefig('artifacts/correlation_heatmap.png')
        plt.close()
        
        report += "## Correlation Heatmap\n"
        report += "![Correlation Heatmap](artifacts/correlation_heatmap.png)\n\n"

        # Yield vs Nutrients
        if 'nitrogen_requirement_kg_ha' in df.columns and 'yield_q_per_acre' in df.columns:
            plt.figure(figsize=(8, 6))
            sns.scatterplot(x='nitrogen_requirement_kg_ha', y='yield_q_per_acre', data=df)
            plt.title('Yield vs Nitrogen Requirement')
            plt.tight_layout()
            plt.savefig('artifacts/yield_vs_nitrogen.png')
            plt.close()
            report += "## Yield vs Nitrogen\n"
            report += "![Yield vs Nitrogen](artifacts/yield_vs_nitrogen.png)\n\n"
            
        # Profit analysis
        if 'profit_per_ha' in df.columns:
            top_crops = df.groupby('unified_crop_name')['profit_per_ha'].mean().sort_values(ascending=False).head(10)
            plt.figure(figsize=(10, 6))
            sns.barplot(x=top_crops.values, y=top_crops.index)
            plt.title('Top 10 Most Profitable Crops')
            plt.tight_layout()
            plt.savefig('artifacts/profit_analysis.png')
            plt.close()
            report += "## Profit Analysis\n"
            report += "![Profit Analysis](artifacts/profit_analysis.png)\n\n"
            
    with open('eda_report.md', 'w') as f:
        f.write(report)
        
    print("STEP 8: FEATURE ENGINEERING")
    # Feature Engineering
    # 1. soil_fertility_index
    if 'avg_n' in df.columns and 'avg_p' in df.columns and 'avg_k' in df.columns:
        df['soil_fertility_index'] = (df['avg_n'] + df['avg_p'] + df['avg_k']) / 3
    else:
        df['soil_fertility_index'] = 0.5
        
    # 2. climate_score
    if 'max_temp_c' in df.columns and 'min_temp_c' in df.columns:
        df['avg_temp'] = (df['max_temp_c'] + df['min_temp_c']) / 2
    else:
        df['avg_temp'] = 25
        
    if 'max_rainfall_mm' in df.columns and 'min_rainfall_mm' in df.columns:
        df['avg_rainfall'] = (df['max_rainfall_mm'] + df['min_rainfall_mm']) / 2
    else:
        df['avg_rainfall'] = 500
        
    df['climate_score'] = (df['avg_temp'] / 50 + df['avg_rainfall'] / 3000) / 2
    
    # 3. resistance_index
    res_cols = ['disease_resistance_score', 'pest_resistance_score', 'drought_tolerance_score', 'heat_tolerance_score']
    existing_res_cols = [c for c in res_cols if c in df.columns]
    if existing_res_cols:
        df['resistance_index'] = df[existing_res_cols].mean(axis=1)
    else:
        df['resistance_index'] = 50
        
    # pH calculation
    if 'min_pH' in df.columns and 'max_pH' in df.columns:
        df['avg_pH'] = (df['min_pH'] + df['max_pH']) / 2
    elif 'min_pH_y' in df.columns and 'max_pH_y' in df.columns:
        df['avg_pH'] = (df['min_pH_y'] + df['max_pH_y']) / 2
    else:
        df['avg_pH'] = 6.5

    # Encode categorical
    le_crop = LabelEncoder()
    le_variety = LabelEncoder()
    le_season = LabelEncoder()
    le_texture = LabelEncoder()
    
    df['unified_crop_name'] = df['unified_crop_name'].fillna('Unknown')
    df['crop_encoded'] = le_crop.fit_transform(df['unified_crop_name'])
    
    if 'variety_name' in df.columns:
        df['variety_name'] = df['variety_name'].fillna('Unknown')
        df['variety_encoded'] = le_variety.fit_transform(df['variety_name'])
    else:
        df['variety_name'] = 'Unknown'
        df['variety_encoded'] = 0

    if 'recommended_season' in df.columns:
        df['recommended_season'] = df['recommended_season'].fillna('Unknown')
        df['season_encoded'] = le_season.fit_transform(df['recommended_season'])
    else:
        df['season_encoded'] = 0

    if 'suitable_texture' in df.columns:
        df['suitable_texture'] = df['suitable_texture'].fillna('Well_drained')
        df['texture_encoded'] = le_texture.fit_transform(df['suitable_texture'])
    else:
        df['texture_encoded'] = 0

    print("STEP 9: ML MODELS")
    # Define features
    features_crop = ['avg_n', 'avg_p', 'avg_k', 'avg_pH', 'avg_temp', 'avg_rainfall', 'season_encoded', 'texture_encoded']
    for c in features_crop:
        if c not in df.columns:
            df[c] = 0

    X_crop = df[features_crop]
    y_crop = df['unified_crop_name']
    
    X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(X_crop, y_crop, test_size=0.2, random_state=42)
    
    crop_model = RandomForestClassifier(n_estimators=100, random_state=42)
    crop_model.fit(X_train_c, y_train_c)
    
    print("Crop Model Training complete. Score:", crop_model.score(X_test_c, y_test_c))
    
    # 2. Variety Recommendation
    features_variety = ['crop_encoded', 'avg_n', 'avg_p', 'avg_k', 'avg_pH', 'avg_temp', 'avg_rainfall', 'texture_encoded']
    for c in features_variety:
        if c not in df.columns:
            df[c] = 0
            
    X_var = df[features_variety]
    y_var = df['variety_name']
    
    X_train_v, X_test_v, y_train_v, y_test_v = train_test_split(X_var, y_var, test_size=0.2, random_state=42)
    var_model = RandomForestClassifier(n_estimators=100, random_state=42)
    var_model.fit(X_train_v, y_train_v)
    print("Variety Model Training complete. Score:", var_model.score(X_test_v, y_test_v))

    # 3. Yield Prediction
    if 'yield_q_per_acre' in df.columns:
        features_yield = ['crop_encoded', 'avg_n', 'avg_p', 'avg_k', 'avg_pH', 'avg_temp', 'avg_rainfall', 'texture_encoded', 'variety_encoded']
        if 'water_requirement_level' in df.columns:
            df['water_requirement_level'] = df['water_requirement_level'].fillna(0)
            features_yield.append('water_requirement_level')

        X_yield = df[features_yield]
        y_yield = df['yield_q_per_acre']
        
        X_train_y, X_test_y, y_train_y, y_test_y = train_test_split(X_yield, y_yield, test_size=0.2, random_state=42)
        yield_model = xgb.XGBRegressor(n_estimators=100, random_state=42)
        yield_model.fit(X_train_y, y_train_y)
        print("Yield Model Training complete. Score (R2):", yield_model.score(X_test_y, y_test_y))
    else:
        yield_model = None

    # Save models
    joblib.dump(crop_model, 'models/crop_model.pkl')
    joblib.dump(var_model, 'models/variety_model.pkl')
    if yield_model:
        joblib.dump(yield_model, 'models/yield_model.pkl')
        
    # Save LabelEncoders
    encoders = {'crop': le_crop, 'variety': le_variety, 'season': le_season, 'texture': le_texture}
    if 'water_requirement_level' in df.columns:
        # Just passing an indicator that we use water requirement
        encoders['has_water_req'] = True
    joblib.dump(encoders, 'models/encoders.pkl')
    print("All models and encoders saved in 'models/' directory.")

if __name__ == "__main__":
    run()
