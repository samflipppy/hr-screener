import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { analyzeResume } from "../utils/ai"; // Ensure AI function is included
import { useRouter } from 'next/router';
import { useAuth, useUserType } from '../utils/auth';
import Layout from '../components/Layout';

interface Applicant {
  id: number;
  name: string;
  email: string;
  resume_url: string;
  created_at: string;
  ai_feedback?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const userType = useUserType();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && userType !== 'company') {
      router.push('/companies');
    }
  }, [loading, user, userType, router]);

  useEffect(() => {
    const fetchApplicants = async () => {
      setError(null);

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching applicants:", error);
        setError("Failed to fetch applicants.");
      } else {
        console.log("✅ Fetched applicants with feedback:", data);
        setApplicants(data || []);
      }
    };

    fetchApplicants();
  }, []);

  const handleAnalyzeResume = async (applicant: Applicant) => {
    if (!applicant.resume_url) {
      alert("No resume URL found");
      return;
    }

    setAnalyzing(applicant.id);
    try {
      // Step 1: Extract text from PDF
      const extractResponse = await fetch("/api/extractResume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeUrl: applicant.resume_url }),
      });

      if (!extractResponse.ok) {
        const error = await extractResponse.json();
        throw new Error(error.details || 'Failed to extract PDF text');
      }

      const { text } = await extractResponse.json();
      if (!text) throw new Error("No text extracted from PDF");

      // Step 2: Analyze with AI
      const analysis = await analyzeResume(text);

      // Step 3: Save to database
      const { data, error: updateError } = await supabase
        .from("applications")
        .update({ ai_feedback: analysis })
        .eq("id", applicant.id)
        .select();

      if (updateError) {
        console.error("Save Error:", updateError);
        throw updateError;
      }

      console.log("Saved feedback:", data); // Debug log

      // Step 4: Update UI
      setApplicants(prev =>
        prev.map(a => a.id === applicant.id ? { ...a, ai_feedback: analysis } : a)
      );

    } catch (error: any) {
      console.error("Resume Analysis Error:", error);
      alert(`Analysis failed: ${error.message}`);
    } finally {
      setAnalyzing(null);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user || userType !== 'company') return null;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto mt-10 p-6 border shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-4">HR Dashboard - AI Resume Review</h1>

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
    </Layout>
  );
}
