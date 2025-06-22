"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "./ui/textarea";
import { useWeatherHistory } from "@/hooks/useWeatherHistory";

interface WeatherFormData {
  date: string;
  location: string;
  notes: string;
}

function formatDateForDisplay(date: Date | undefined): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateForAPI(date: Date | undefined): string {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}

function isValidDate(date: Date | undefined): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

export function WeatherForm() {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date | undefined>(new Date());
  const [displayValue, setDisplayValue] = useState(formatDateForDisplay(new Date()));

  const [formData, setFormData] = useState<WeatherFormData>({
    date: formatDateForAPI(new Date()),
    location: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; id?: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { addToHistory } = useWeatherHistory();
  const submittedRef = useRef<WeatherFormData | null>(null);
  const hasAddedToHistory = useRef(false);

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setDisplayValue(formatDateForDisplay(date));
    setFormData((prev) => ({
      ...prev,
      date: formatDateForAPI(date),
    }));
    setCalendarOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    const parsedDate = new Date(inputValue);
    if (isValidDate(parsedDate)) {
      setSelectedDate(parsedDate);
      setCalendarMonth(parsedDate);
      setFormData((prev) => ({
        ...prev,
        date: formatDateForAPI(parsedDate),
      }));
    }
  };

  const validateForm = () => {
    if (!formData.location.trim()) {
      setFormError("Location is required.");
      return false;
    }
    if (!formData.date) {
      setFormError("Date is invalid or missing.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setResult(null);
    hasAddedToHistory.current = false;

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8000/weather", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        submittedRef.current = { ...formData };

        setResult({
          success: true,
          message: "Weather request submitted successfully!",
          id: data.id,
        });

        const today = new Date();
        setSelectedDate(today);
        setDisplayValue(formatDateForDisplay(today));
        setFormData({
          date: formatDateForAPI(today),
          location: "",
          notes: "",
        });
      } else {
        const errorData = await response.json();
        setResult({
          success: false,
          message: "Could not fetch weather data. Please try again with a valid location.",
        });
      }
    } catch (err) {
      console.error("Submit error:", err);
      setResult({
        success: false,
        message: "Could not fetch weather data. Please try again with a valid location.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (
      result?.success &&
      result.id &&
      submittedRef.current &&
      !hasAddedToHistory.current
    ) {
      addToHistory({
        id: result.id,
        location: submittedRef.current.location,
        date: submittedRef.current.date,
        notes: submittedRef.current.notes,
      });
      hasAddedToHistory.current = true;
      submittedRef.current = null;
    }
  }, [result?.id]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Weather Data Request</CardTitle>
        <CardDescription>
          Submit a weather data request for a specific location and date
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="date" className="px-1">
              Date
            </Label>
            <div className="relative flex gap-2">
              <Input
                id="date"
                value={displayValue}
                placeholder="Select a date"
                className="bg-background pr-10"
                onChange={handleDateInputChange}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setCalendarOpen(true);
                  }
                }}
                required
              />
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                  >
                    <CalendarIcon className="size-3.5" />
                    <span className="sr-only">Select date</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="end"
                  alignOffset={-8}
                  sideOffset={10}
                >
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    captionLayout="dropdown"
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    onSelect={handleDateChange}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              type="text"
              placeholder="e.g., New York, London, Tokyo"
              value={formData.location}
              onChange={handleInputChange}
              className={formError?.includes("Location") ? "border-red-500" : ""}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Any additional notes about this weather request..."
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Weather Request"}
          </Button>

          {formError && (
            <div className="text-sm text-red-500 border border-red-300 rounded px-3 py-2 bg-red-50">
              {formError}
            </div>
          )}

          {result && (
            <div
              className={`p-3 rounded-md ${
                result.success
                  ? "bg-green-900/20 text-green-500 border border-green-500"
                  : "bg-red-900/20 text-red-500 border border-red-500"
              }`}
            >
              <p className="text-sm font-medium">{result.message}</p>
              {result.success && result.id && (
                <p className="text-xs mt-1">
                  Your weather request ID:{" "}
                  <code className="bg-green-500/20 text-green-400 px-1 rounded">
                    {result.id}
                  </code>
                </p>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
