"use client";

import { useEffect, useState } from "react";

export type WeatherHistoryItem = {
  id: string;
  location: string;
  date: string;
  notes?: string;
};

const STORAGE_KEY = "weather_lookup_history";
const HISTORY_EVENT = "weather-history-updated";

export function useWeatherHistory() {
  const [history, setHistory] = useState<WeatherHistoryItem[]>([]);

  // Load initial history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  // Listen for updates dispatched by other components
  useEffect(() => {
    const handleUpdate = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      } else {
        setHistory([]);
      }
    };

    window.addEventListener(HISTORY_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(HISTORY_EVENT, handleUpdate);
    };
  }, []);

  const addToHistory = (item: WeatherHistoryItem) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const currentHistory: WeatherHistoryItem[] = stored ? JSON.parse(stored) : [];

    const filtered = currentHistory.filter((entry) => entry.id !== item.id);
    const updated = [item, ...filtered].slice(0, 10);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(HISTORY_EVENT)); 
    setHistory(updated);
  };

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
    window.dispatchEvent(new Event(HISTORY_EVENT));
  };

  return {
    history,
    addToHistory,
    clearHistory,
  };
}
