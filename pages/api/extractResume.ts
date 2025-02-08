import { NextApiRequest, NextApiResponse } from "next";
import pdfParse from "pdf-parse";
import Tesseract from "tesseract.js";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // Increase size to handle large PDFs
    },
  },
};

// ✅ Extract text from PDF
async function extractTextFromPDF(pdfUrl: string): Promise<string> {
  try {
    const response = await fetch(pdfUrl);
    const pdfBuffer = await response.arrayBuffer();
    const pdfData = await pdfParse(Buffer.from(pdfBuffer));

    if (pdfData.text.trim().length > 0) {
      return pdfData.text; // ✅ Use text if available
    }

    console.log("⚠️ PDF has no text! Running OCR...");

    // ✅ Convert PDF to image and extract text using OCR (Tesseract.js)
    const ocrResult = await Tesseract.recognize(Buffer.from(pdfBuffer), "eng");
    return ocrResult.data.text || "No text extracted via OCR.";
  } catch (error) {
    console.error("PDF Extraction Error:", error);
    throw new Error("Failed to extract resume text.");
  }
}

// ✅ API Route for Resume Extraction
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { resumeUrl } = req.body;
    if (!resumeUrl) {
      return res.status(400).json({ error: "Missing resume URL" });
    }

    const text = await extractTextFromPDF(resumeUrl);
    return res.status(200).json({ text });
  } catch (error) {
    console.error("PDF Extraction Failed:", error);
    return res.status(500).json({ error: "Failed to extract resume text" });
  }
}
