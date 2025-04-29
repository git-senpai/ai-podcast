"use client";

import { useState, useRef } from "react";

interface AudioPlayerProps {
  audioUrl: string;
  onClose: () => void;
}

export default function AudioPlayer({ audioUrl, onClose }: AudioPlayerProps) {
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-xl max-w-md w-full mx-4 text-white">
        <h2 className="text-2xl font-bold mb-4">Your Podcast is Ready!</h2>

        <audio
          ref={audioRef}
          className="w-full mb-4"
          controls
          onError={(e) => console.error("Audio playback error:", e)}
          onLoadedData={(e) => console.log("Audio loaded successfully")}
        >
          <source src={audioUrl} type="audio/wav" />
          Your browser does not support the audio element.
        </audio>

        <div className="flex justify-between">
          <button
            onClick={() => {
              const link = document.createElement("a");
              link.href = audioUrl;
              link.download = "podcast.wav";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
          >
            Download
          </button>
          <button
            onClick={onClose}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
