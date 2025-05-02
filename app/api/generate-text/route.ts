import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Helper to calculate tokens for target duration
function getTargetWordCount(minutes: number): number {
  // Average speaking rate is ~150 words per minute
  const wordsPerMinute = 150;
  return minutes * wordsPerMinute;
}

export async function POST(request: Request) {
  try {
    const { topic, subtopic, duration, voiceSettings, language } =
      await request.json();

    const targetWordCount = getTargetWordCount(duration);
    const speakerFormat =
      voiceSettings.numberOfSpeakers > 1 ? "dialogue" : "monologue";

    const prompt = `Generate a precisely ${duration}-minute ${speakerFormat} script about ${topic}${
      subtopic ? `, focusing on ${subtopic}` : ""
    }.

    Target length: ${targetWordCount} words (${duration} minutes at 150 words per minute)
    
    Structure:
    - Brief Introduction (${Math.max(0.5, duration * 0.1)} min)
    - Main Content (${duration * 0.8} min)
    - Conclusion (${Math.max(0.5, duration * 0.1)} min)
    
    Style:
    ${
      voiceSettings.numberOfSpeakers > 1
        ? '- Format as natural dialogue with "Speaker 1:" or "Speaker 2:" prefixes\n- Aim for roughly equal speaking time between speakers'
        : "- Use conversational monologue style\n- Include pauses and natural breaks"
    }
    - Keep sentences concise and naturally paced
    - Target exactly ${targetWordCount} words
    
    Language: ${language}
    Duration: Exactly ${duration} minutes
    Format: ${speakerFormat}`;

    // Initialize the model with Gemini Flash 2.0
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    // Generate content with the correct format
    const result = await model.generateContent(
      `You are a professional podcast script writer. Create exactly ${duration}-minute scripts by targeting ${targetWordCount} words. Maintain consistent pacing and natural dialogue flow.\n\n${prompt}`
    );

    const response = await result.response;
    const script = response.text();
    const wordCount = script?.split(/\s+/).length || 0;
    const estimatedDuration = wordCount / 150; // minutes

    console.log(
      `Generated script stats: ${wordCount} words, ~${estimatedDuration.toFixed(
        1
      )} minutes`
    );

    return NextResponse.json({
      success: true,
      script,
      metadata: {
        duration,
        estimatedDuration,
        wordCount,
        format: speakerFormat,
        language,
        topic,
        subtopic: subtopic || null,
      },
    });
  } catch (error: unknown) {
    console.error("Script generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate script",
      },
      { status: 500 }
    );
  }
}
