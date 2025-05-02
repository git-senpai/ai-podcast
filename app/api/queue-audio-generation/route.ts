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

// Define voice settings interface
interface VoiceSettings {
  numberOfSpeakers: number;
  [key: string]: any; // Allow additional properties
}

// This would ideally be stored in a database like MongoDB, Redis, or a serverless database
// For now, we'll use a simple in-memory map (note: this will be cleared on function cold starts)
const pendingRequests = new Map();
const completedRequests = new Map();

if (!process.env.FAL_KEY) {
  throw new Error("FAL_KEY environment variable is not set");
}

fal.config({
  credentials: process.env.FAL_KEY,
});

// This endpoint queues a task and returns immediately with a requestId
export async function POST(request: Request) {
  try {
    const { script, voiceSettings, format = "dialogue" } = await request.json();

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
      Date.now().toString(36) + Math.random().toString(36).substr(2);

    // Store the request in our pending map
    pendingRequests.set(requestId, {
      status: "queued",
      timestamp: Date.now(),
      script,
      voiceSettings,
      format,
    });

    // Start the generation process in the background
    // This won't block the response
    processAudioGeneration(requestId, script, voiceSettings, format).catch(
      (error) => {
        console.error(`Error processing request ${requestId}:`, error);
        completedRequests.set(requestId, {
          status: "error",
          error: error.message,
          timestamp: Date.now(),
        });
        pendingRequests.delete(requestId);
      }
    );

    // Return the request ID immediately
    return NextResponse.json({
      success: true,
      requestId: requestId,
      status: "queued",
      message: "Audio generation has been queued",
    });
  } catch (error: any) {
    console.error("Request processing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process request",
        details: "Check server logs for more information",
      },
      { status: 400 }
    );
  }
}

// This endpoint checks the status of a previously queued task
export async function GET(request: Request) {
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

  // Check if the request is completed
  if (completedRequests.has(requestId)) {
    const result = completedRequests.get(requestId);

    // For successful requests, we can clean up after sending the response
    if (result.status === "completed") {
      // Keep the result for a while in case of client retries, but eventually clean up
      // In a real system this would be handled by a database TTL or cleanup job
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

    // For failed requests
    return NextResponse.json(
      {
        success: false,
        status: "error",
        error: result.error,
      },
      { status: 500 }
    );
  }

  // Check if the request is still pending
  if (pendingRequests.has(requestId)) {
    const pendingRequest = pendingRequests.get(requestId);
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
}

// Function to process the audio generation in the background
async function processAudioGeneration(
  requestId: string,
  script: string,
  voiceSettings: VoiceSettings,
  format: string
) {
  try {
    // Update status to processing
    pendingRequests.set(requestId, {
      ...pendingRequests.get(requestId),
      status: "processing",
    });

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

    console.log(`Processing request ${requestId} with fal.ai`);

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

    if (!result.data?.audio?.url) {
      throw new Error("No audio URL in response");
    }

    // Store the completed result
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

    // Remove from pending requests
    pendingRequests.delete(requestId);
  } catch (error) {
    console.error(`Error processing request ${requestId}:`, error);
    completedRequests.set(requestId, {
      status: "error",
      error: error.message || "Unknown error during audio generation",
      timestamp: Date.now(),
    });
    pendingRequests.delete(requestId);
  }
}
