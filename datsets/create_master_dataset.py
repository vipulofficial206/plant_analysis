import os
import glob
import pandas as pd
import numpy as np
import re
from thefuzz import process, fuzz

def run():
    print("STEP 1: LOAD DATA")
    # Load crop_master
    crop_master = pd.read_csv('crop_master.csv')
    
    variety_files = [f for f in os.listdir('.') if f.endswith('dataset.csv') and f != 'master_dataset.csv']
    variety_dfs = []
    for f in variety_files:
        df = pd.read_csv(f)
        # Extract base name from file for matching
        base_name = f.split('_')[0].lower()
        df['extracted_crop_name'] = base_name
        variety_dfs.append(df)

    variety_df = pd.concat(variety_dfs, ignore_index=True)

    print("STEP 2: CLEAN DATA")
    # Clean variety_df
    for col in variety_df.columns:
        if pd.api.types.is_numeric_dtype(variety_df[col]):
            variety_df.fillna({col: variety_df[col].median()}, inplace=True)
        else:
            variety_df.fillna({col: variety_df[col].mode()[0]}, inplace=True)
            
    # Clean crop_master
    for col in crop_master.columns:
        if pd.api.types.is_numeric_dtype(crop_master[col]):
            crop_master.fillna({col: crop_master[col].median()}, inplace=True)
        else:
            crop_master.fillna({col: crop_master[col].mode()[0]}, inplace=True)

    print("STEP 3: EXTRACT NPK")
    def extract_npk(nutrient_str):
        if not isinstance(nutrient_str, str):
            return pd.Series([np.nan]*9)
        n_match = re.search(r'N:(\d+)(?:-(\d+))?', nutrient_str)
        p_match = re.search(r'P:(\d+)(?:-(\d+))?', nutrient_str)
        k_match = re.search(r'K:(\d+)(?:-(\d+))?', nutrient_str)
        
        def parse_match(match):
            if match:
                v1 = float(match.group(1))
                v2 = float(match.group(2)) if match.group(2) else v1
                return v1, v2
            return np.nan, np.nan

        n_min, n_max = parse_match(n_match)
        p_min, p_max = parse_match(p_match)
        k_min, k_max = parse_match(k_match)
        
        avg_n = (n_min + n_max) / 2 if pd.notna(n_min) else np.nan
        avg_p = (p_min + p_max) / 2 if pd.notna(p_min) else np.nan
        avg_k = (k_min + k_max) / 2 if pd.notna(k_min) else np.nan

        return pd.Series([n_min, n_max, p_min, p_max, k_min, k_max, avg_n, avg_p, avg_k])

    crop_master[['n_min', 'n_max', 'p_min', 'p_max', 'k_min', 'k_max', 'avg_n', 'avg_p', 'avg_k']] = crop_master['nutrient_demand_level'].apply(extract_npk)

    print("STEP 4: FIX CROP MISMATCH")
    crop_choices = crop_master['crop_name'].tolist()
    
    # Custom keyword overrides if fuzzy is not enough
    keyword_map = {
        'rice': 'Rice (Paddy)',
        'blackgram': 'Black Gram (Urad)',
        'bengalgram': 'Bengal Gram (Chickpea)',
        'redgram': 'Red Gram (Pigeon Pea)',
        'greengram': 'Green Gram (Moong)',
        'moong': 'Green Gram (Moong)',
        'chickpea': 'Bengal Gram (Chickpea)',
        'jowar': 'Sorghum (Jowar)',
        'bajra': 'Pearl Millet (Bajra)',
        'ragi': 'Finger Millet (Ragi)'
    }

    def get_unified_name(name):
        # Keyword detection
        for key, val in keyword_map.items():
            if key in name:
                return val
                
        # Fuzzy matching
        match = process.extractOne(name, crop_choices, scorer=fuzz.token_set_ratio)
        if match and match[1] > 60:
            return match[0]
        return name

    variety_df['unified_crop_name'] = variety_df['extracted_crop_name'].apply(get_unified_name)
    crop_master['unified_crop_name'] = crop_master['crop_name']

    print("STEP 5: CREATE MASTER DATASET")
    # Identify overlaps to drop
    cols_to_drop = [c for c in crop_master.columns if c in variety_df.columns and c != 'unified_crop_name']
    crop_master_clean = crop_master.drop(columns=cols_to_drop)
    
    master_dataset = pd.merge(variety_df, crop_master_clean, how='left', on='unified_crop_name')

    master_dataset.to_csv('master_dataset.csv', index=False)
    print(f"Master Dataset created successfully with {len(master_dataset)} records.")

if __name__ == "__main__":
    run()
