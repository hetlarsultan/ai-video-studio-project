import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scissors, Play, Pause } from 'lucide-react';

interface TrimCutProps {
  duration?: number;
  onTrimChange?: (startTime: number, endTime: number) => void;
}

export default function TrimCut({ duration = 100, onTrimChange }: TrimCutProps) {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(duration);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime] = useState(0);

  const handleStartTimeChange = (value: number) => {
    if (value < endTime) {
      setStartTime(value);
      onTrimChange?.(value, endTime);
    }
  };

  const handleEndTimeChange = (value: number) => {
    if (value > startTime) {
      setEndTime(value);
      onTrimChange?.(startTime, value);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const trimmedDuration = endTime - startTime;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Trim & Cut</h3>
        </div>
      </div>

      <Card className="bg-slate-800/50 border-slate-700 p-4 space-y-4">
        {/* Timeline visualization */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Start: {formatTime(startTime)}</span>
            <span>Duration: {formatTime(trimmedDuration)}</span>
            <span>End: {formatTime(endTime)}</span>
          </div>

          {/* Visual timeline */}
          <div className="relative h-12 bg-slate-700 rounded-lg overflow-hidden">
            {/* Trimmed area */}
            <div
              className="absolute h-full bg-green-500/30 border-l-2 border-r-2 border-green-500"
              style={{
                left: `${(startTime / duration) * 100}%`,
                right: `${100 - (endTime / duration) * 100}%`,
              }}
            />

            {/* Playhead */}
            {isPlaying && (
              <div
                className="absolute h-full w-1 bg-cyan-400 transition-all"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              />
            )}

            {/* Start handle */}
            <input
              type="range"
              min="0"
              max={duration}
              value={startTime}
              onChange={(e) => handleStartTimeChange(parseFloat(e.target.value))}
              className="absolute w-full h-full opacity-0 cursor-pointer z-10"
              style={{ pointerEvents: 'auto' }}
            />
          </div>

          {/* Sliders */}
          <div className="space-y-2">
            <div>
              <label className="text-xs text-slate-400">Start Time</label>
              <input
                type="range"
                min="0"
                max={duration}
                value={startTime}
                onChange={(e) => handleStartTimeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400">End Time</label>
              <input
                type="range"
                min="0"
                max={duration}
                value={endTime}
                onChange={(e) => handleEndTimeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Play
              </>
            )}
          </Button>
          <span className="text-sm text-slate-400">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Info */}
        <div className="text-xs text-slate-400 bg-slate-900/50 rounded p-2">
          <p>• Drag the timeline or use sliders to set trim points</p>
          <p>• Trimmed portion will be removed from the final video</p>
          <p>• Trimmed duration: <span className="text-green-400">{formatTime(trimmedDuration)}</span></p>
        </div>
      </Card>
    </div>
  );
}
