from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uuid
import requests

from backend.config import settings 

app = FastAPI(title="Weather Data System", version="1.0.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store
weather_storage: Dict[str, Dict[str, Any]] = {}

# Request and Response models
class WeatherRequest(BaseModel):
    date: str
    location: str
    notes: Optional[str] = ""

class WeatherResponse(BaseModel):
    id: str

@app.post("/weather", response_model=WeatherResponse)
def create_weather_request(request: WeatherRequest):
    if not request.location or not request.date:
        raise HTTPException(status_code=400, detail="Location and date are required")

    # Call WeatherStack API using requests (blocking)
    try:
        response = requests.get(settings.WEATHERSTACK_BASE_URL, params={
            "access_key": settings.WEATHERSTACK_API_KEY,
            "query": request.location
        })
        weather_data = response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather API error: {str(e)}")

    # Handle API failure
    if response.status_code != 200 or "error" in weather_data:
        error_info = weather_data.get("error", {}).get("info", "Weather API request failed")
        raise HTTPException(status_code=400, detail=error_info)

    # Create and store entry
    weather_id = str(uuid.uuid4())
    weather_storage[weather_id] = {
        "id": weather_id,
        "date": request.date,
        "location": request.location,
        "notes": request.notes,
        "weather": weather_data
    }

    return WeatherResponse(id=weather_id)

@app.get("/weather/{weather_id}")
def get_weather_data(weather_id: str):
    if weather_id not in weather_storage:
        raise HTTPException(status_code=404, detail="Weather data not found")
    return weather_storage[weather_id]
