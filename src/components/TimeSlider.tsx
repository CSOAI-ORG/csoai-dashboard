"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface TimeSliderProps {
  timestamps: string[];
  onChange: (timestamp: string) => void;
  currentValue?: string;
}

export default function TimeSlider({ timestamps, onChange, currentValue }: TimeSliderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sort timestamps chronologically
  const sorted = [...timestamps].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value);
    onChange(sorted[index]);
  };

  const handlePlay = useCallback(() => {
    if (isPlaying) return;

    setIsPlaying(true);
    let i = 0;

    intervalRef.current = setInterval(() => {
      if (i >= sorted.length) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsPlaying(false);
        return;
      }
      onChange(sorted[i]);
      i++;
    }, 1000);
  }, [isPlaying, sorted, onChange]);

  const handleStop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const currentIndex = currentValue ? sorted.indexOf(currentValue) : sorted.length - 1;

  return (
    <div
      className="p-4 rounded-lg border"
      style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="time-slider" className="text-sm font-medium" style={{ color: "var(--csoai-text)" }}>
          Time Slider
        </label>
        <div className="text-xs" style={{ color: "var(--csoai-muted)" }}>
          render_at(T) — a query over hash lineage, not an animation
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={isPlaying ? handleStop : handlePlay}
          className="px-3 py-1 text-sm rounded transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            background: isPlaying ? "var(--csoai-red)" : "var(--csoai-accent)",
            color: "white",
            outlineColor: "var(--csoai-accent)",
          }}
          aria-label={isPlaying ? "Stop playback" : "Play timeline"}
        >
          {isPlaying ? "Stop" : "Play"}
        </button>

        <div className="flex-1">
          <input
            id="time-slider"
            type="range"
            min={0}
            max={sorted.length - 1}
            value={currentIndex >= 0 ? currentIndex : 0}
            onChange={handleChange}
            className="w-full"
            style={{ accentColor: "var(--csoai-accent)" }}
            aria-label="Select timestamp"
            aria-valuemin={0}
            aria-valuemax={sorted.length - 1}
            aria-valuenow={currentIndex >= 0 ? currentIndex : 0}
            aria-valuetext={currentValue ? new Date(currentValue).toLocaleDateString() : "now"}
          />
        </div>

        <div className="text-sm font-mono" style={{ color: "var(--csoai-text)" }} aria-live="polite">
          {currentValue ? new Date(currentValue).toLocaleDateString() : "now"}
        </div>
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-xs" style={{ color: "var(--csoai-muted)" }}>
          {sorted.length > 0 ? new Date(sorted[0]).toLocaleDateString() : "—"}
        </span>
        <span className="text-xs" style={{ color: "var(--csoai-muted)" }}>
          {sorted.length > 0 ? new Date(sorted[sorted.length - 1]).toLocaleDateString() : "—"}
        </span>
      </div>
    </div>
  );
}
