declare module "elevenlabs-node" {
  export class ElevenLabs {
    constructor(config: { apiKey: string });

    textToSpeech(params: {
      text: string;
      voiceId: string;
      modelId: string;
      voiceSettings: {
        stability: number;
        similarityBoost: number;
        style: number;
        useCase: string;
      };
    }): Promise<Buffer>;

    combineAudio(audioSegments: Buffer[]): Promise<Buffer>;
    saveAudio(audio: Buffer, filename: string): Promise<string>;
    getAudioDuration(audio: Buffer): Promise<number>;
  }
}
