import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { analyzeResume } from "../utils/ai"; // ✅ Import AI Review Function

interface Applicant {
  id: number;
  name: string;
  email: string;
  resume_url?: string;
  created_at?: string;
  status: string;
  comments?: string;
}

export default function Dashboard() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("All");
  const [commentInput, setCommentInput] = useState<{ [id: number]: string }>({});
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
        setError("Failed to fetch applicants.");
      } else {
        setApplicants(data || []);
      }
      setLoading(false);
    };

    fetchApplicants();
  }, []);

  // ✅ AI Resume Review Function
  const analyzeAndSaveFeedback = async (id: number, resumeUrl: string) => {
    setAnalyzing(id);

    try {
      // ✅ Fetch resume file from Supabase Storage
      const response = await fetch(resumeUrl);
      const text = await response.text();

      console.log("📄 Extracted Resume Text:", text);

      // ✅ Analyze Resume using AI
      const feedback = await analyzeResume(text);
      console.log("🤖 AI Feedback:", feedback);

      // ✅ Save AI feedback in Supabase
      const { error } = await supabase.from("applications").update({ comments: feedback }).match({ id });

      if (!error) {
        setApplicants((prev) =>
          prev.map((app) => (app.id === id ? { ...app, comments: feedback } : app))
        );
      }
    } catch (error) {
      console.error("Error analyzing resume:", error);
    }

    setAnalyzing(null);
  };

  const filteredApplicants =
    filter === "All" ? applicants : applicants.filter((app) => app.status === filter);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 rounded-lg bg-gray-100 shadow-lg">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">HR Dashboard - AI Resume Review</h1>

      {/* ✅ Dropdown Filter */}
      <div className="mb-4">
        <label className="font-semibold mr-2 text-gray-700">Filter by Status:</label>
        <select
          className="border p-2 rounded bg-white text-gray-700"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Reviewed">Reviewed</option>
        </select>
      </div>

      {loading && <p className="text-gray-600">Loading applicants...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <table className="w-full border-collapse shadow-lg">
        <thead>
          <tr className="bg-gray-700 text-white">
            <th className="border p-3">Name</th>
            <th className="border p-3">Email</th>
            <th className="border p-3">Resume</th>
            <th className="border p-3">AI Feedback</th>
            <th className="border p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredApplicants.map((applicant) => (
            <tr key={applicant.id} className="border">
              <td className="border p-2 text-gray-800">{applicant.name}</td>
              <td className="border p-2 text-gray-800">{applicant.email}</td>
              <td className="border p-2">
                <a href={applicant.resume_url} target="_blank" className="text-blue-600 underline">
                  View Resume
                </a>
              </td>
              <td className="border p-2 text-gray-800">
                {applicant.comments || "No AI feedback yet"}
              </td>
              <td className="border p-2">
                {analyzing === applicant.id ? (
                  <span className="text-gray-500">Analyzing...</span>
                ) : (
                  <button
                    className="bg-purple-500 text-white px-3 py-1 rounded"
                    onClick={() => analyzeAndSaveFeedback(applicant.id, applicant.resume_url || "")}
                    disabled={!applicant.resume_url}
                  >
                    Analyze Resume
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
