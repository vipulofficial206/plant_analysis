import os
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

def run():
    print("STEP 6: STORE IN MONGODB")
    
    # Use online MONGO_URI if present, else fallback to standard local
    mongo_uri = os.getenv('MONGO_URI', "mongodb://localhost:27017/")
    
    print(f"Connecting to MongoDB...")
    client = MongoClient(mongo_uri)
    try:
        # Test connection
        client.admin.command('ismaster')
        print("Connected successfully!")
    except Exception as e:
        print("MongoDB is not running or accessible. Error:", e)
        print("Please ensure MongoDB is installed and running, or MONGO_URI is correct.")
        return

    db = client['agri_advisory_db']
    
    # Load datasets
    try:
        master_df = pd.read_csv('master_dataset.csv')
        crop_master_df = pd.read_csv('crop_master.csv')
    except FileNotFoundError as e:
        print("File not found:", e)
        return

    # Clean up column names from master_dataset that might have been corrupted
    master_df.rename(columns={
        'reco ended_season': 'recommended_season',
        'min_rainfall_ ': 'min_rainfall_mm',
        'max_rainfall_ ': 'max_rainfall_mm',
        'reco endation_score': 'recommendation_score',
        'N': 'avg_n'
    }, inplace=True)

    # Drop collections if they exist to start fresh
    db.crops.drop()
    db.varieties.drop()
    # The user specifically requested NOT to send the whole dataset into the database
    db.master_dataset.drop()

    # Prepare crops data
    crop_records = crop_master_df.to_dict(orient='records')
    if crop_records:
        db.crops.insert_many(crop_records)
        print(f"Inserted {len(crop_records)} records into 'crops' collection.")
        
    # Isolate uniquely named varieties to save space
    variety_cols = [c for c in master_df.columns if c not in crop_master_df.columns or c == 'unified_crop_name']
    varieties_df = master_df[variety_cols].copy()
    
    if 'variety_name' in varieties_df.columns:
        varieties_df.drop_duplicates(subset=['variety_name'], inplace=True)
    
    variety_records = varieties_df.to_dict(orient='records')

    if variety_records:
        db.varieties.insert_many(variety_records)
        print(f"Inserted {len(variety_records)} records into 'varieties' collection.")

    print("Skipped inserting 'master_dataset' as per user request to save online storage space.")

if __name__ == "__main__":
    run()
