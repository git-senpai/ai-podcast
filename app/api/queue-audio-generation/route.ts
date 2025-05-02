import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

// Type definitions for better type safety
interface VoiceSettings {
  numberOfSpeakers: number;
  [key: string]: any; // Allow additional properties
}

interface FalResponse {
  data: {
    audio: {
      url: string;
      duration: number;
    };
  };
}

interface PendingRequest {
  status: string;
  timestamp: number;
  script: string;
  voiceSettings: VoiceSettings;
  format: string;
}

interface CompletedRequest {
  status: string;
  timestamp: number;
  error?: string;
  audioUrl?: string;
  metadata?: {
    duration: number;
    format: string;
    voices: any[];
  };
}

// In-memory storage (note: will be cleared on serverless function cold starts)
const pendingRequests = new Map<string, PendingRequest>();
const completedRequests = new Map<string, CompletedRequest>();

// Check for API key
if (!process.env.FAL_KEY) {
  throw new Error("FAL_KEY environment variable is not set");
}

// Configure fal client
fal.config({
  credentials: process.env.FAL_KEY,
});

// POST endpoint - Queue an audio generation task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { script, voiceSettings, format = "dialogue" } = body;

    // Validate required fields
    if (!script || typeof script !== "string") {
      return NextResponse.json(
        { success: false, error: "Script is required and must be a string" },
        { status: 400 }
      );
    }

    if (
      !voiceSettings ||
      typeof voiceSettings !== "object" ||
      !voiceSettings.numberOfSpeakers
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid voiceSettings with numberOfSpeakers is required",
        },
        { status: 400 }
      );
    }

    // Generate a unique request ID
    const requestId =
      Date.now().toString(36) + Math.random().toString(36).substring(2);

    // Store in pending requests
    pendingRequests.set(requestId, {
      status: "queued",
      timestamp: Date.now(),
      script,
      voiceSettings,
      format,
    });

    // Start processing in background
    void processAudioGeneration(requestId, script, voiceSettings, format);

    // Return immediately with request ID
    return NextResponse.json({
      success: true,
      requestId,
      status: "queued",
      message: "Audio generation has been queued",
    });
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

// GET endpoint - Check status of a request
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const requestId = url.searchParams.get("requestId");

    if (!requestId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing requestId parameter",
        },
        { status: 400 }
      );
    }

    // Check if completed
    if (completedRequests.has(requestId)) {
      const result = completedRequests.get(requestId);

      if (!result) {
        return NextResponse.json(
          {
            success: false,
            status: "error",
            error: "Request data is missing",
          },
          { status: 500 }
        );
      }

      // Handle successful completion
      if (result.status === "completed") {
        // Cleanup after a delay
        setTimeout(() => {
          completedRequests.delete(requestId);
        }, 1000 * 60 * 10); // 10 minutes

        return NextResponse.json({
          success: true,
          status: "completed",
          audioUrl: result.audioUrl,
          metadata: result.metadata,
        });
      }

      // Handle errors
      if (result.status === "error") {
        return NextResponse.json(
          {
            success: false,
            status: "error",
            error: result.error || "Unknown error occurred",
          },
          { status: 500 }
        );
      }
    }

    // Check if pending
    if (pendingRequests.has(requestId)) {
      const pendingRequest = pendingRequests.get(requestId);

      if (!pendingRequest) {
        return NextResponse.json(
          {
            success: false,
            status: "error",
            error: "Request data is missing",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        status: "pending",
        message: "Your audio is still being generated",
        queuedAt: pendingRequest.timestamp,
      });
    }

    // Request not found
    return NextResponse.json(
      {
        success: false,
        status: "not_found",
        error: "Request not found",
      },
      { status: 404 }
    );
  } catch (error: unknown) {
    console.error("Error checking request status:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check request status",
      },
      { status: 500 }
    );
  }
}

// Background processing function
async function processAudioGeneration(
  requestId: string,
  script: string,
  voiceSettings: VoiceSettings,
  format: string
): Promise<void> {
  try {
    // Update status
    const pendingRequest = pendingRequests.get(requestId);
    if (!pendingRequest) {
      throw new Error(`Request ${requestId} not found in pending requests`);
    }

    pendingRequests.set(requestId, {
      ...pendingRequest,
      status: "processing",
    });

    // Format script for dialogue if needed
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

    // Configure voices
    const voices = Array(voiceSettings.numberOfSpeakers)
      .fill(null)
      .map((_, index) => ({
        voice:
          index === 0
            ? "Jennifer (English (US)/American)"
            : "Furio (English (IT)/Italian)",
        turn_prefix: `Speaker ${index + 1}: `,
      }));

    console.log(`Processing request ${requestId} with fal.ai`);

    // Call fal.ai API
    const result = (await fal.subscribe("fal-ai/playai/tts/dialog", {
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
    })) as FalResponse;

    console.log(`Completed request ${requestId}`);

    // Check for valid response
    if (!result?.data?.audio?.url) {
      throw new Error("No audio URL in response");
    }

    // Store successful result
    completedRequests.set(requestId, {
      status: "completed",
      timestamp: Date.now(),
      audioUrl: result.data.audio.url,
      metadata: {
        duration: result.data.audio?.duration || 0,
        format: "mp3",
        voices: voices,
      },
    });

    // Clean up pending request
    pendingRequests.delete(requestId);
  } catch (error: unknown) {
    console.error(`Error processing request ${requestId}:`, error);

    // Store error result
    completedRequests.set(requestId, {
      status: "error",
      timestamp: Date.now(),
      error:
        error instanceof Error
          ? error.message
          : "Unknown error during audio generation",
    });

    // Clean up pending request
    pendingRequests.delete(requestId);
  }
}
