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
export async function analyzeResume(resumeText: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert HR assistant. Analyze resumes and provide concise feedback in the following format:
          
          Skills: [Key skills identified]
          Experience: [Years and relevance]
          Strengths: [Top 3 strengths]
          Areas for Growth: [2-3 areas]
          Overall Fit: [Brief assessment]`
        },
        {
          role: "user",
          content: `Analyze this resume text:\n\n${resumeText}`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "No analysis generated.";
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new Error("Failed to analyze resume");
  }
}
