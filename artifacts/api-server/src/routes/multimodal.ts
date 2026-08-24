import { Router, type Request, type Response } from "express";
import { Groq } from "groq-sdk";
import { z } from "zod";

const router = Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Zod schemas for validation
const VoiceMetadataSchema = z.object({
  transcription: z.string(),
  detectedTone: z.enum(["sarcastic", "angry", "excited", "sad", "neutral", "confused", "happy"]).optional(),
  pace: z.enum(["slow", "normal", "fast"]).optional(),
  volume: z.enum(["quiet", "normal", "loud"]).optional(),
});

const SocialContextSchema = z.object({
  relationship: z.enum(["friend", "family", "teacher", "coworker", "boss", "stranger", "group"]),
  setting: z.enum(["school", "work", "home", "public", "online", "other"]),
  conversationHistory: z.array(z.string()).optional(),
  emotionalCues: z.array(z.string()).optional(),
  recentEvents: z.string().optional(),
});

const MultimodalInputSchema = z.object({
  text: z.string().min(1, "Text is required"),
  voice: VoiceMetadataSchema.optional(),
  context: SocialContextSchema.optional(),
  userObservations: z.string().optional(),
});

type MultimodalInput = z.infer<typeof MultimodalInputSchema>;

function buildMultimodalPrompt(input: MultimodalInput): string {
  let prompt = "You are an expert communication coach helping an autistic teen understand a confusing social interaction.\n\n";
  prompt += "Analyze this multimodal interaction and explain what's REALLY happening:\n\n";

  prompt += "=== THE WORDS (LITERAL TEXT) ===\n";
  prompt += `"${input.text}"\n\n`;

  if (input.voice) {
    prompt += "=== VOICE & TONE METADATA ===\n";
    if (input.voice.detectedTone) {
      prompt += `Detected tone: ${input.voice.detectedTone}\n`;
    }
    if (input.voice.pace) {
      prompt += `Pace: ${input.voice.pace}\n`;
    }
    if (input.voice.volume) {
      prompt += `Volume: ${input.voice.volume}\n`;
    }
    prompt += "\n";
  }

  if (input.context) {
    prompt += "=== SOCIAL CONTEXT ===\n";
    prompt += `Relationship: ${input.context.relationship}\n`;
    prompt += `Setting: ${input.context.setting}\n`;

    if (input.context.emotionalCues && input.context.emotionalCues.length > 0) {
      prompt += `Observed emotional cues: ${input.context.emotionalCues.join(", ")}\n`;
    }

    if (input.context.recentEvents) {
      prompt += `Recent context: ${input.context.recentEvents}\n`;
    }

    if (input.context.conversationHistory && input.context.conversationHistory.length > 0) {
      prompt += `Conversation so far:\n${input.context.conversationHistory.join("\n")}\n`;
    }
    prompt += "\n";
  }

  if (input.userObservations) {
    prompt += "=== WHAT CONFUSED THE USER ===\n";
    prompt += `${input.userObservations}\n\n`;
  }

  prompt += "=== YOUR ANALYSIS ===\n";
  prompt += "Break this down into these sections (use clear headers):\n\n";
  prompt += "1. **What the words literally say**: Just the facts, no interpretation\n";
  prompt += "2. **What they probably MEANT**: The real intention behind the words\n";
  prompt += "3. **How tone/context changes meaning**: Explain how the tone, relationship, and setting shift the message\n";
  prompt += "4. **Why this might be confusing**: Explain the disconnect between literal words and actual meaning\n";
  prompt += "5. **Hidden social rules at play**: What unspoken expectations or social norms are involved?\n";
  prompt += "6. **What to do next**: Suggest responses or actions\n\n";
  prompt += "Use plain, clear language. Be direct. No jargon.";

  return prompt;
}

router.post("/analyze", async (req: Request, res: Response) => {
  try {
    // Validate input
    const input = MultimodalInputSchema.parse(req.body);

    // Build the analysis prompt
    const analysisPrompt = buildMultimodalPrompt(input);

    // Call Groq API
    const message = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a compassionate and direct communication coach for autistic teens. Explain social interactions clearly, literally, and without jargon. Always be honest about what's happening and why it might be confusing.",
        },
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const analysis = message.choices[0]?.message?.content;

    if (!analysis) {
      return res.status(500).json({ error: "Failed to generate analysis" });
    }

    res.json({
      success: true,
      analysis,
      inputSummary: {
        hasText: !!input.text,
        hasVoiceMetadata: !!input.voice,
        hasSocialContext: !!input.context,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid input",
        details: error.errors,
      });
    }

    if (error instanceof Error) {
      req.log.error({ error: error.message }, "Error in multimodal analysis");
    }

    res.status(500).json({
      error: "Failed to analyze interaction",
    });
  }
});

export default router;
