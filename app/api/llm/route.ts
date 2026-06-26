function generateTextGroq() {
  const prompt = "Give me list of 5 fun activities to do in New York on a weekend.";

  console.log(`Sending prompt to Groq: '${prompt}'...\n`);

  // Fake chat completion object to match the Python structure
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
}

// This is like: if __name__ == "__main__":
generateTextGroq();
