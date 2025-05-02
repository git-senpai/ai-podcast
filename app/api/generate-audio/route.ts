import { NextResponse } from "next/server";
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
  throw new Error("FAL_KEY environment variable is not set");
}

fal.config({
  credentials: process.env.FAL_KEY,
});

// Helper function to add timeout to promises
const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);

    promise.then(
      (result) => {
        clearTimeout(timeout);
        resolve(result);
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      }
    );
  });
};

export async function POST(request: Request) {
  try {
    const { script, voiceSettings, format = "dialogue" } = await request.json();

    // Format the script for dialogue if multiple speakers
    let formattedScript = script;
    if (format === "dialogue" && voiceSettings.numberOfSpeakers > 1) {
      formattedScript = script
        .split("\n")
        .map((line: string, index: number) => {
          const speaker = `Speaker ${
            (index % voiceSettings.numberOfSpeakers) + 1
          }: `;
          return speaker + line;
        })
        .join("\n");
    }

    // Configure voices based on settings
    const voices = Array(voiceSettings.numberOfSpeakers)
      .fill(null)
      .map((_, index) => ({
        voice:
          index === 0
            ? "Jennifer (English (US)/American)"
            : "Furio (English (IT)/Italian)",
        turn_prefix: `Speaker ${index + 1}: `,
      }));

    try {
      console.log("Calling fal.ai with input:", { formattedScript, voices });

      // Add a timeout to the fal.ai call (8 seconds to keep under Vercel's 10s limit)
      const result = (await withTimeout(
        fal.subscribe("fal-ai/playai/tts/dialog", {
          input: {
            input: formattedScript,
            voices: voices,
            ar: null,
            lora: null,
            vocoder: null,
          },
          logs: true,
          onQueueUpdate: (update) => {
            if (update.status === "IN_PROGRESS") {
              update.logs.map((log) => log.message).forEach(console.log);
            }
          },
        }),
        8000, // 8 second timeout
        "Audio generation timed out. Try with a shorter script."
      )) as FalResponse;

      console.log("Received response from fal.ai:", result);

      if (!result.data?.audio?.url) {
        throw new Error("No audio URL in response");
      }

      return NextResponse.json({
        success: true,
        audioUrl: result.data.audio.url,
        metadata: {
          duration: result.data.audio?.duration || 0,
          format: "mp3",
          voices: voices,
        },
      });
    } catch (falError: unknown) {
      console.error("Fal.ai API error:", falError);
      return NextResponse.json(
        {
          success: false,
          error:
            falError instanceof Error
              ? falError.message
              : "Failed to generate audio with fal.ai",
          details: falError,
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Request processing error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to process request",
        details: "Check server logs for more information",
      },
      { status: 400 }
    );
  }
}
