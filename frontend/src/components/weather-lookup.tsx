"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWeatherHistory } from "@/hooks/useWeatherHistory";
import {
  CalendarDays,
  MapPin,
  StickyNote,
  Thermometer,
  CloudSun,
} from "lucide-react";

export function WeatherLookup() {
  const [lookupId, setLookupId] = useState("");
  const [weatherDetails, setWeatherDetails] = useState<any>(null);
  const [lookupError, setLookupError] = useState("");
  const [loading, setLoading] = useState(false);
  const { history, clearHistory } = useWeatherHistory();
  const [_, forceRerender] = useState(0);

  const handleLookup = async (idToUse?: string) => {
    const id = idToUse || lookupId.trim();
    if (!id) {
      setLookupError("Please enter a request ID.");
      return;
    }

    setWeatherDetails(null);
    setLookupError("");
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/weather/${id}`);
      if (response.status === 404) {
        setLookupError("No weather data found for that ID.");
        return;
      }
      if (!response.ok) {
        throw new Error("Unexpected error");
      }
      const data = await response.json();
      setWeatherDetails(data);
    } catch (err) {
      console.error(err);
      setLookupError("Could not fetch weather data. Please try again with a valid location.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Lookup Weather Data</CardTitle>
        <CardDescription>Enter a request ID to retrieve saved weather info</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); handleLookup(); }} className="space-y-4">
          <div className="space-y-2">
            <Label>Weather Request ID</Label>
            <div className="flex gap-2">
              <Input value={lookupId} onChange={(e) => setLookupId(e.target.value)} placeholder="Enter your request ID" />
              <Button type="submit" disabled={loading}>{loading ? "Looking up..." : "Lookup"}</Button>
            </div>
          </div>

          {lookupError && (
            <div className="text-sm text-red-500 border border-red-300 rounded px-3 py-2 bg-red-50">
              {lookupError}
            </div>
          )}

          {weatherDetails && (
            <Card className="bg-card border text-sm shadow-md animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg">Weather Details</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Retrieved weather for: <span className="font-medium">{weatherDetails.location}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="w-4 h-4" />
                  <span className="font-medium">Date:</span>
                  <span className="text-foreground">{weatherDetails.date}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">Location:</span>
                  <span className="text-foreground">{weatherDetails.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Thermometer className="w-4 h-4" />
                  <span className="font-medium">Temperature:</span>
                  <span className="text-foreground">{weatherDetails.weather?.current?.temperature}°C</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CloudSun className="w-4 h-4" />
                  <span className="font-medium">Condition:</span>
                  <span className="text-foreground">{weatherDetails.weather?.current?.weather_descriptions?.[0]}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <StickyNote className="w-4 h-4" />
                  <span className="font-medium">Notes:</span>
                  <span className="text-foreground">{weatherDetails.notes || "None"}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {history.length > 0 && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold text-muted-foreground">Recently Submitted Requests</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearHistory();
                    forceRerender((x) => x + 1);
                  }}
                >
                  Clear
                </Button>
              </div>
              <ul className="space-y-1 max-h-60 overflow-y-auto pr-1">
                {history.map((item) => (
                  <li key={item.id} className="flex flex-col gap-1 border px-3 py-2 rounded text-sm bg-muted">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-muted-foreground truncate">{item.location}</p>
                        <p className="text-xs text-muted-foreground">{item.date} — {item.notes || "No notes"}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setLookupId(item.id);
                          setTimeout(() => handleLookup(item.id), 0);
                        }}
                      >
                        View
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
