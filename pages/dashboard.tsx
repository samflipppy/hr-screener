import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { analyzeResume } from "../utils/ai"; // Ensure AI function is included

interface Applicant {
  id: number;
  name: string;
  email: string;
  resume_url: string;
  created_at: string;
  ai_feedback?: string;
}

export default function Dashboard() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<number | null>(null);

  useEffect(() => {
    const fetchApplicants = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching applicants:", error);
        setError("Failed to fetch applicants.");
      } else {
        console.log("✅ Applicants fetched:", data);
        setApplicants(data || []);
      }
      setLoading(false);
    };

    fetchApplicants();
  }, []);

  const handleAnalyzeResume = async (applicant: Applicant) => {
    console.log(`🔍 Starting analysis for ${applicant.name}`);
  
    if (!applicant.resume_url || !applicant.resume_url.startsWith("http")) {
      console.error("🚨 Invalid Resume URL:", applicant.resume_url);
      alert("Invalid resume URL. Please check the uploaded file.");
      return;
    };
  
    setAnalyzing(applicant.id);
  
    try {
      console.log(`📤 Sending resume URL to API: ${applicant.resume_url}`);
  
      // ✅ Send correct URL to extractResume API
      const response = await fetch("/api/extractResume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeUrl: applicant.resume_url }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        console.error("🚨 API Error:", result.error);
        alert(`Error extracting resume text: ${result.error}`);
        return;
      }
  
      const extractedText = result.text;
      if (!extractedText || extractedText.length < 50) {
        console.error("🚨 No text extracted.");
        alert("Failed to extract text from resume.");
        return;
      }
  
      console.log("📄 Resume Text Extracted:", extractedText.slice(0, 300)); // Log preview
  
      // ✅ Send extracted text to AI for analysis
      console.log("🤖 Sending extracted text to AI...");
      const aiFeedback = await analyzeResume(extractedText);
  
      // ✅ Save AI feedback in Supabase
      const { error } = await supabase
        .from("applications")
        .update({ ai_feedback: aiFeedback })
        .eq("id", applicant.id);
  
      if (error) {
        console.error("🚨 Error updating AI feedback:", error);
        alert("Failed to save AI feedback.");
        return;
      }
  
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === applicant.id ? { ...a, ai_feedback: aiFeedback } : a
        )
      );
  
      console.log("✅ AI Feedback Saved!");
    } catch (error) {
      console.error("🚨 AI Analysis Failed:", error);
      alert("Error analyzing resume.");
    } finally {
      setAnalyzing(null);
    }
  };
  
  
  

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 border shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">HR Dashboard - AI Resume Review</h1>

      {loading && <p className="text-gray-600">Loading applicants...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Resume</th>
            <th className="border p-2">AI Feedback</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {applicants.length > 0 ? (
            applicants.map((applicant) => (
              <tr key={applicant.id} className="border">
                <td className="border p-2">{applicant.name}</td>
                <td className="border p-2">{applicant.email}</td>
                <td className="border p-2">
                  <a href={applicant.resume_url} target="_blank" className="text-blue-500 underline">
                    View Resume
                  </a>
                </td>
                <td className="border p-2">
                  {applicant.ai_feedback || "No AI feedback yet"}
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => handleAnalyzeResume(applicant)}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    disabled={analyzing === applicant.id}
                  >
                    {analyzing === applicant.id ? "Analyzing..." : "Analyze Resume"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center p-4">
                No applications found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
