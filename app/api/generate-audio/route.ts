import { NextResponse } from 'next/server';
import { fal } from "@fal-ai/client";

// Add type for fal.ai response
interface FalResponse {
  data: {
    audio: {
      url: string;
      duration: number;
    };
  };
}

if (!process.env.FAL_KEY) {
  throw new Error('FAL_KEY environment variable is not set');
}

fal.config({
  credentials: process.env.FAL_KEY
});

export async function POST(request: Request) {
  try {
    const { script, voiceSettings, format = 'dialogue' } = await request.json();

    // Format the script for dialogue if multiple speakers
    let formattedScript = script;
    if (format === 'dialogue' && voiceSettings.numberOfSpeakers > 1) {
      formattedScript = script.split('\n').map((line: string, index: number) => {
        const speaker = `Speaker ${(index % voiceSettings.numberOfSpeakers) + 1}: `;
        return speaker + line;
      }).join('\n');
    }

    // Configure voices based on settings
    const voices = Array(voiceSettings.numberOfSpeakers).fill(null).map((_, index) => ({
      voice: index === 0 ? "Jennifer (English (US)/American)" : "Furio (English (IT)/Italian)",
      turn_prefix: `Speaker ${index + 1}: `
    }));

    try {
      console.log('Calling fal.ai with input:', { formattedScript, voices });
      
      const result = await fal.subscribe("fal-ai/playai/tts/dialog", {
        input: {
          input: formattedScript,
          voices: voices,
          ar: null,
          lora: null,
          vocoder: null
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      }) as FalResponse;

      console.log('Received response from fal.ai:', result);

      if (!result.data?.audio?.url) {
        throw new Error('No audio URL in response');
      }

      return NextResponse.json({
        success: true,
        audioUrl: result.data.audio.url,
        metadata: {
          duration: result.data.audio?.duration || 0,
          format: 'mp3',
          voices: voices
        }
      });

    } catch (falError: any) {
      console.error('Fal.ai API error:', falError);
      return NextResponse.json({
        success: false,
        error: falError.message || 'Failed to generate audio with fal.ai',
        details: falError
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Request processing error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process request',
      details: 'Check server logs for more information'
    }, { status: 400 });
  }
}
