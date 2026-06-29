import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userPrompt = body.prompt || "Give me list of 5 fun activities to do in New York on a weekend.";

    console.log(`Sending prompt to Groq: '${userPrompt}'...\n`);

    // TODO: Replace with actual Groq API call
    // For now, returning a mock response
    const chatCompletion = {
      choices: [
        {
          message: {
            content: "1. Visit Central Park\n2. Walk the High Line\n3. Explore museums\n4. Try local food\n5. See a Broadway show",
          },
        },
      ],
    };

    const responseText = chatCompletion.choices[0].message.content;

    console.log("Groq Response:");
    console.log(responseText);

    return NextResponse.json({
      success: true,
      response: responseText,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
