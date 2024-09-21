"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, CloudRain, Sun, ArrowUp, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import html2canvas from "html2canvas";

const provinces = [
  "Bac Lieu",
  "Ho Chi Minh City",
  "Tam Ky",
  "Ben Tre",
  "Hoa Binh",
  "Tan An",
  "Bien Hoa",
  "Hong Gai",
  "Thai Nguyen",
  "Buon Me Thuot",
  "Hue",
  "Thanh Hoa",
  "Ca Mau",
  "Long Xuyen",
  "Tra Vinh",
  "Cam Pha",
  "My Tho",
  "Tuy Hoa",
  "Cam Ranh",
  "Nam Dinh",
  "Uong Bi",
  "Can Tho",
  "Nha Trang",
  "Viet Tri",
  "Chau Doc",
  "Phan Rang",
  "Vinh",
  "Da Lat",
  "Phan Thiet",
  "Vinh Long",
  "Ha Noi",
  "Play Cu",
  "Vung Tau",
  "Hai Duong",
  "Qui Nhon",
  "Yen Bai",
  "Hai Phong",
  "Rach Gia",
  "Hanoi",
  "Soc Trang",
];

interface WeatherPrediction {
  cloud: number;
  have_rain: boolean;
  humidity: number;
  max_temperature: number;
  min_temperature: number;
  pressure: number;
  rain: number;
  wind_degree: number;
  wind_speed: number;
}

interface WeatherPredictionProps {
  initialPrediction?: WeatherPrediction;
  initialDate?: string;
  initialProvince?: string;
}

const getWindDirection = (degree: number): string => {
  const directions = [
    { direction: "N", min: 348.75, max: 11.25 },
    { direction: "NNE", min: 11.25, max: 33.75 },
    { direction: "NE", min: 33.75, max: 56.25 },
    { direction: "ENE", min: 56.25, max: 78.75 },
    { direction: "E", min: 78.75, max: 101.25 },
    { direction: "ESE", min: 101.25, max: 123.75 },
    { direction: "SE", min: 123.75, max: 146.25 },
    { direction: "SSE", min: 146.25, max: 168.75 },
    { direction: "S", min: 168.75, max: 191.25 },
    { direction: "SSW", min: 191.25, max: 213.75 },
    { direction: "SW", min: 213.75, max: 236.25 },
    { direction: "WSW", min: 236.25, max: 258.75 },
    { direction: "W", min: 258.75, max: 281.25 },
    { direction: "WNW", min: 281.25, max: 303.75 },
    { direction: "NW", min: 303.75, max: 326.25 },
    { direction: "NNW", min: 326.25, max: 348.75 },
  ];

  const normalizedDegree = degree >= 0 ? degree % 360 : 360 + (degree % 360);
  return (
    directions.find(
      (dir) =>
        (dir.min <= dir.max && normalizedDegree >= dir.min && normalizedDegree < dir.max) ||
        (dir.min > dir.max && (normalizedDegree >= dir.min || normalizedDegree < dir.max))
    )?.direction || "N"
  );
};

export default function WeatherPrediction({ initialPrediction, initialDate, initialProvince }: WeatherPredictionProps) {
  const [date, setDate] = useState<Date | undefined>(initialDate ? new Date(initialDate) : new Date());
  const [province, setProvince] = useState<string>(initialProvince || "");
  const [prediction, setPrediction] = useState<WeatherPrediction | null>(initialPrediction || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const predictionRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !province) {
      setError("Please select both date and province");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:5011/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: date.toISOString().split("T")[0], // Format: YYYY-MM-DD
          province: province,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch prediction: ${response.status} ${response.statusText}. ${errorText}`);
      }
      const data: WeatherPrediction = await response.json();
      setPrediction(data);
      savePredictionToLocalStorage(data, date, province);
    } catch (err) {
      console.error("Error details:", err);
      setError(
        `An error occurred while fetching the prediction: ${
          err instanceof Error ? err.message : String(err)
        }. Please check the console for more details and ensure the API server is running.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const savePredictionToLocalStorage = (prediction: WeatherPrediction, date: Date, province: string) => {
    const key = `weather_${date.toISOString().split("T")[0]}_${province}`;
    const data = { prediction, date: date.toISOString(), province };
    localStorage.setItem(key, JSON.stringify(data));
  };

  const saveAsImage = async () => {
    if (!prediction || !predictionRef.current) return;

    try {
      const canvas = await html2canvas(predictionRef.current, {
        backgroundColor: "#ffffff",
        scale: 3,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `weather_prediction_${province}_${formatDate(date as Date)}.jpg`;
      link.click();
    } catch (error) {
      console.error("Error saving image:", error);
      setError("Failed to save the image. Please try again.");
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Weather Prediction</CardTitle>
        <CardDescription>Enter a date and select a province to get the weather prediction.</CardDescription>
      </CardHeader>
      <CardContent>
        {!initialPrediction && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="flex justify-center">
                <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Select onValueChange={setProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Predicting...
                </>
              ) : (
                "Predict Weather"
              )}
            </Button>
          </form>
        )}

        {error && <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

        {prediction && (
          <div className="mt-8 space-y-4 bg-white p-6 rounded-lg shadow-md" ref={predictionRef}>
            <h3 className="text-xl font-semibold text-center mb-4">
              Weather Prediction for {province} on {formatDate(date as Date)}
            </h3>
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="text-6xl">{prediction.have_rain ? <CloudRain className="text-blue-500" /> : <Sun className="text-yellow-500" />}</div>
              <Badge variant={prediction.have_rain ? "destructive" : "secondary"} className="text-lg px-4 py-1">
                {prediction.have_rain ? "Rain Expected" : "No Rain Expected"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div>
                <Label className="text-sm text-gray-600">Max Temperature</Label>
                <Input value={`${prediction.max_temperature.toFixed(1)}°C`} readOnly className="text-lg font-semibold" />
              </div>
              <div>
                <Label className="text-sm text-gray-600">Min Temperature</Label>
                <Input value={`${prediction.min_temperature.toFixed(1)}°C`} readOnly className="text-lg font-semibold" />
              </div>
              <div>
                <Label className="text-sm text-gray-600">Wind Speed</Label>
                <Input value={`${prediction.wind_speed.toFixed(1)} km/h`} readOnly className="text-lg font-semibold" />
              </div>
              <div>
                <Label className="text-sm text-gray-600">Wind Direction</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={`${prediction.wind_degree.toFixed(1)}° ${getWindDirection(prediction.wind_degree)}`}
                    readOnly
                    className="text-lg font-semibold"
                  />
                  <div className="relative w-8 h-8">
                    <ArrowUp className="absolute inset-0 w-full h-full text-primary" style={{ transform: `rotate(${prediction.wind_degree}deg)` }} />
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Rainfall</Label>
                <Input value={`${prediction.rain.toFixed(1)} mm`} readOnly className="text-lg font-semibold" />
              </div>
              <div>
                <Label className="text-sm text-gray-600">Humidity</Label>
                <Input value={`${prediction.humidity.toFixed(1)}%`} readOnly className="text-lg font-semibold" />
              </div>
              <div>
                <Label className="text-sm text-gray-600">Cloud Cover</Label>
                <Input value={`${prediction.cloud.toFixed(1)}%`} readOnly className="text-lg font-semibold" />
              </div>
              <div>
                <Label className="text-sm text-gray-600">Pressure</Label>
                <Input value={`${prediction.pressure.toFixed(1)} hPa`} readOnly className="text-lg font-semibold" />
              </div>
            </div>
          </div>
        )}

        {prediction && !initialPrediction && (
          <div className="flex justify-center space-x-4 mt-6">
            <Button onClick={saveAsImage} className="px-6 py-2">
              <Save className="mr-2 h-5 w-5" />
              Save as Image
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
