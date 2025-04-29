import { create } from 'zustand';
import { PodcastState } from './types';

export const usePodcastStore = create<PodcastState>((set) => ({
  isGenerating: false,
  script: null,
  audioUrl: null,
  error: null,
  setGenerating: (isGenerating: boolean) => set({ isGenerating }),
  setScript: (script: string) => set({ script }),
  setAudioUrl: (audioUrl: string) => set({ audioUrl }),
  setError: (error: string | null) => set({ error }),
  reset: () => set({ isGenerating: false, script: null, audioUrl: null, error: null }),
})); 