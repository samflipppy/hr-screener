import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// ✅ Function to call API for PDF text extraction
async function extractTextFromPDF(resumeUrl: string): Promise<string> {
  try {
    const response = await fetch("/api/extractResume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeUrl }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    return data.text;
  } catch (error) {
    console.error("PDF Extraction Error:", error);
    return "Error extracting text from PDF.";
  }
}

// ✅ Function to analyze resume using AI
export async function analyzeResume(resumeUrl: string): Promise<string> {
  try {
    // ✅ Extract text via API route
    const resumeText = await extractTextFromPDF(resumeUrl);

    // ✅ Limit resume text to 2000 characters
    const truncatedText = resumeText.length > 2000 ? resumeText.slice(0, 2000) + "..." : resumeText;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI that reviews resumes and provides feedback on job suitability.",
        },
        {
          role: "user",
          content: `Analyze this resume and provide feedback:\n\n${truncatedText}`,
        },
      ],
      max_tokens: 250,
    });

    return response.choices[0].message.content || "No feedback generated.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Error generating feedback.";
  }
}
