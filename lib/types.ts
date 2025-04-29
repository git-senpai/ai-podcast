export interface VoiceSettings {
  numberOfSpeakers: number;
  speaker1Voice: string;
  speaker2Voice: string;
  format: 'monologue' | 'dialogue';
}

export interface PodcastFormData {
  topic: string;
  subtopic: string;
  duration: number;
  voiceSettings: VoiceSettings;
  language: string;
}

export interface GenerateTextResponse {
  script: string;
  error?: string;
}

export interface GenerateAudioResponse {
  audioUrl: string;
  error?: string;
}

export interface PodcastState {
  isGenerating: boolean;
  script: string | null;
  audioUrl: string | null;
  error: string | null;
  setGenerating: (isGenerating: boolean) => void;
  setScript: (script: string) => void;
  setAudioUrl: (audioUrl: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
} 