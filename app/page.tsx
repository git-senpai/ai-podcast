"use client";

import { useState } from "react";
import PodcastForm from "@/components/PodcastForm";
import { PodcastFormData } from "@/lib/types";
import AudioPlayer from "@/components/AudioPlayer";

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);

  const handleSubmit = async (formData: PodcastFormData) => {
    try {
      setIsGenerating(true);
      setError(null);
      setGenerationProgress(0);

      // Simulate progress for script generation
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 1000);

      // Generate script
      console.log("Generating script with:", formData);
      const scriptResponse = await fetch("/api/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const scriptData = await scriptResponse.json();
      if (!scriptData.script) {
        throw new Error(scriptData.error || "Failed to generate script");
      }

      // Generate audio
      console.log("Generating audio with script:", scriptData.script);
      const audioResponse = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: scriptData.script,
          voiceSettings: formData.voiceSettings,
        }),
      });

      const audioData = await audioResponse.json();
      if (!audioData.success) {
        throw new Error(audioData.error || "Failed to generate audio");
      }

      setGenerationProgress(100);
      clearInterval(progressInterval);
      setAudioUrl(audioData.audioUrl);
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-16 relative">
          <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-1">
            AI Podcast Generator
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Transform your ideas into professional podcasts with AI. Create
            engaging content in minutes.
          </p>
        </div>

        {/* Form Section */}
        <div className="relative z-10">
          <PodcastForm onSubmit={handleSubmit} />
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
              <div className="flex flex-col items-center">
                <div className="w-full mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Generating your podcast...</span>
                    <span>{generationProgress}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div
                    className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-pink-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
                <p className="mt-4 text-lg font-medium text-white">
                  Creating your masterpiece...
                </p>
                <p className="mt-2 text-gray-400">
                  This may take a few moments
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mt-8">
            <div className="bg-red-900/50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audio Player Popup */}
        {audioUrl && (
          <AudioPlayer audioUrl={audioUrl} onClose={() => setAudioUrl(null)} />
        )}
      </div>
    </div>
  );
}
