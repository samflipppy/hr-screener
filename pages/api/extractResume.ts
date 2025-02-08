import type { NextApiRequest, NextApiResponse } from "next";
import pdfParse from "pdf-parse";

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
    const pdfData = await pdfParse(Buffer.from(pdfBuffer));

    console.log("✅ Extracted PDF text:", pdfData.text.slice(0, 300)); // Log first 300 chars
    return pdfData.text || "No text extracted.";
  } catch (error) {
    console.error("🚨 PDF Extraction Failed:", error);
    throw new Error("Failed to extract resume text.");
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  
    try {
      const { resumeUrl } = req.body;
  
      console.log("🔍 Received resumeUrl:", resumeUrl);
  
      // ✅ Make sure we're dealing with a proper URL
      if (!resumeUrl || typeof resumeUrl !== "string" || !resumeUrl.startsWith("http")) {
        console.error("🚨 Invalid PDF URL:", resumeUrl);
        return res.status(400).json({ error: "Invalid PDF URL." });
      }
  
      console.log(`📥 Fetching PDF from: ${resumeUrl}`);
  
      const response = await fetch(resumeUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }
  
      const pdfBuffer = await response.arrayBuffer();
      const pdfData = await pdfParse(Buffer.from(pdfBuffer));
  
      console.log("✅ Successfully extracted text:", pdfData.text.slice(0, 500));
  
      return res.status(200).json({ text: pdfData.text }); // ✅ Return extracted text
    } catch (error) {
      console.error("🚨 PDF Parsing Error:", error);
      return res.status(500).json({ error: "Failed to extract resume text." });
    }
  }
  