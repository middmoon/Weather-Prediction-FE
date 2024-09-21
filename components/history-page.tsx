"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import WeatherPrediction from "./weather-prediction";

interface StoredPrediction {
  prediction: any;
  date: string;
  province: string;
}

export default function HistoryPage() {
  const [predictions, setPredictions] = useState<StoredPrediction[]>([]);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = () => {
    const storedPredictions: StoredPrediction[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("weather_")) {
        const item = localStorage.getItem(key);
        if (item) {
          storedPredictions.push(JSON.parse(item));
        }
      }
    }
    setPredictions(storedPredictions);
  };

  const clearHistory = () => {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith("weather_")) {
        localStorage.removeItem(key);
      }
    }
    setPredictions([]);
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Prediction History</span>
            <div className="space-x-2">
              <Button variant="outline" onClick={clearHistory}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear History
              </Button>
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Prediction
                </Button>
              </Link>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {predictions.length === 0 ? (
            <p>No predictions saved yet.</p>
          ) : (
            predictions.map((item, index) => (
              <div key={index} className="mb-8">
                <h3 className="text-lg font-semibold mb-2">
                  {item.province} - {new Date(item.date).toLocaleDateString()}
                </h3>
                <WeatherPrediction initialPrediction={item.prediction} initialDate={item.date} initialProvince={item.province} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
