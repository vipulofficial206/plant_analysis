import pandas as pd
import numpy as np
import os

# Create folder
folder = "sample_data"
if not os.path.exists(folder):
    os.makedirs(folder)

# Helper for heavy data (1000+ rows)
def generate_heavy(rows, name):
    df = pd.DataFrame({
        'N': np.random.uniform(5, 200, rows),
        'P': np.random.uniform(2, 100, rows),
        'K': np.random.uniform(10, 250, rows),
        'pH': np.random.uniform(4.0, 9.5, rows),
        'Season': np.random.choice(['Kharif', 'Rabi', 'Zaid'], rows),
        'Texture': np.random.choice(['Well_drained', 'Poorly_drained'], rows),
        'Humidity': np.random.uniform(10, 95, rows),
        'Temperature': np.random.uniform(15, 45, rows),
        'Rainfall_mm': np.random.uniform(200, 3000, rows),
        'MarketDist_km': np.random.uniform(1, 50, rows),
        'IrrigationMethod': np.random.choice(['Drip', 'TubeWell', 'Canal'], rows),
        'LegacyRecordUID': [f"UID-{i}" for i in range(rows)],
        'Audit_Status': np.random.choice(['Verified', 'Pending', 'Rejected'], rows),
        'FarmerID': [f"F-{i}" for i in range(rows)]
    })
    df.to_csv(f"{folder}/{name}.csv", index=False)

# Create 10 Heavy variants
# 1. Standard Heavy (1000 rows)
generate_heavy(1000, "01_heavy_standard")
# 2. Extreme Heavy (5000 rows)
generate_heavy(5000, "02_heavy_extreme")
# 3. Super Heavy (10000 rows, Many Columns)
generate_heavy(10000, "03_heavy_super")

# 4. Heavy with Unneeded Noise (50+ Columns)
rows = 2000
df4 = pd.DataFrame({
    'N': np.random.uniform(5, 150, rows),
    'P': np.random.uniform(5, 150, rows),
    'K': np.random.uniform(5, 150, rows),
    'pH': np.random.uniform(5, 8.5, rows),
    'Season': ['Kharif'] * rows,
    'Texture': ['Well_drained'] * rows
})
# Add 45 Noise columns
for i in range(45):
    df4[f'Noise_Column_{i+1}'] = np.random.uniform(0, 100, rows)
df4.to_csv(f"{folder}/04_heavy_wide_noise.csv", index=False)

# 5. Heavy with Missing Data
df5 = pd.DataFrame({
    'N': np.random.choice([120, np.nan, 90], 3000),
    'P': np.random.uniform(20, 100, 3000),
    'K': np.random.uniform(20, 100, 3000),
    'pH': np.random.uniform(5.5, 7.5, 3000)
})
df5.to_csv(f"{folder}/05_heavy_sparse_data.csv", index=False)

# 6-10 Specialized Heavy variants
generate_heavy(2000, "06_heavy_monsoon_focus")
generate_heavy(1500, "07_heavy_winter_focus")
generate_heavy(500, "08_heavy_metadata_only")
generate_heavy(2500, "09_heavy_village_master")
generate_heavy(3000, "10_heavy_national_audit")

print(f"Created 10 HEAVY datasets with 500-10,000 rows in '{folder}'")
