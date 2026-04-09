import os
import requests
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

def test_mongo():
    uri = os.getenv("MONGO_URI")
    print(f"Testing MongoDB with URI: {uri[:20]}...")
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print("✅ MongoDB Connection: SUCCESS")
        db = client['agri_advisory_db']
        print(f"✅ DB Access: SUCCESS ('{db.name}')")
    except Exception as e:
        print(f"❌ MongoDB Connection: FAILED - {e}")

def test_weather():
    key = os.getenv("OPENWEATHER_API_KEY")
    print(f"Testing Weather API with Key: {key[:5]}...")
    url = f"http://api.openweathermap.org/data/2.5/weather?q=London&units=metric&appid={key}"
    try:
        resp = requests.get(url)
        if resp.status_code == 200:
            print("✅ Weather API: SUCCESS")
            print(f"   Data: {resp.json().get('main', {}).get('temp')}°C")
        else:
            print(f"❌ Weather API: FAILED ({resp.status_code}) - {resp.text}")
    except Exception as e:
        print(f"❌ Weather API: ERROR - {e}")

if __name__ == "__main__":
    test_mongo()
    print("-" * 20)
    test_weather()
