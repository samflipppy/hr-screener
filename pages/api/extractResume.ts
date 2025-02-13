import type { NextApiRequest, NextApiResponse } from "next";
import pdf from "pdf-parse";

// ✅ Function to validate a URL
function isValidHttpUrl(url: string): boolean {
  try {
    const newUrl = new URL(url);
    return newUrl.protocol === "http:" || newUrl.protocol === "https:";
  } catch (_) {
    return false;
  }
}

// ✅ Extract text from a PDF file URL
async function extractTextFromPDF(pdfUrl: string): Promise<string> {
  try {
    console.log("📥 Fetching PDF from:", pdfUrl);

    // ✅ Check if the URL is valid
    if (!isValidHttpUrl(pdfUrl)) {
      console.error("🚨 Invalid PDF URL:", pdfUrl);
      throw new Error("Invalid PDF URL.");
    }

    // ✅ Fetch the PDF file
    const response = await fetch(pdfUrl);
    if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`);

    // ✅ Convert PDF buffer to text
    const pdfBuffer = await response.arrayBuffer();
    const pdfData = await pdf(Buffer.from(pdfBuffer));

    console.log("✅ Extracted PDF text:", pdfData.text.slice(0, 300)); // Log first 300 chars
    return pdfData.text || "No text extracted.";
  } catch (error) {
    console.error("🚨 PDF Extraction Failed:", error);
    throw new Error("Failed to extract resume text.");
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { resumeUrl } = req.body;
    
    // Fetch the PDF file
    const response = await fetch(resumeUrl);
    if (!response.ok) throw new Error("Failed to fetch PDF");
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Parse PDF to text
    const data = await pdf(buffer);
    
    // Clean and format the extracted text
    const cleanText = data.text
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 2000); // Limit text length for OpenAI
    
    return res.status(200).json({ 
      text: cleanText,
      pages: data.numpages 
    });
  } catch (error: any) {
    console.error("🚨 PDF Processing Error:", error);
    return res.status(500).json({ 
      error: "Failed to process PDF",
      details: error.message 
    });
  }
}
  