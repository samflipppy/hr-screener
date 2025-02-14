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
  job_postings?: {
    id: number;
    position_name: string;
    description: string;
    preferences: string;
  };
}

type JobPosting = {
  id: number;
  position_name: string;
  description: string;
  preferences: string;
};

export default function Dashboard() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const userType = useUserType();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && userType !== 'company') {
      router.push('/companies');
    }
  }, [loading, user, userType, router]);

  useEffect(() => {
    async function fetchData() {
      if (!userProfile?.company_id) return;

      // Fetch applications with job posting information
      const { data, error } = await supabase
        .from('applications_with_jobs')
        .select(`
          *,
          job_postings!inner (
            id,
            position_name,
            description,
            preferences
          )
        `)
        .eq('company_id', userProfile.company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applicants:', error);
        setError('Failed to fetch applicants.');
        return;
      }

      setApplicants(data || []);
    }

    fetchData();
  }, [userProfile]);

  useEffect(() => {
    async function fetchJobPostings() {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*');

      if (error) {
        console.error('Error fetching job postings:', error);
        return;
      }

      setJobPostings(data || []);
    }

    fetchJobPostings();
  }, []);

  const handleAnalyzeResume = async (applicant: Applicant) => {
    if (!applicant.resume_url) {
      alert("No resume URL found");
      return;
    }

    setAnalyzing(applicant.id);
    try {
      // Extract text from PDF
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

      // Get AI feedback including job requirements
      const aiResponse = await fetch('/api/analyzeResume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resumeText: text,
          jobDescription: applicant.job_postings?.description,
          jobPreferences: applicant.job_postings?.preferences
        }),
      });

      if (!aiResponse.ok) throw new Error('Failed to analyze resume');
      
      const { feedback } = await aiResponse.json();

      // Save feedback to database
      const { error: updateError } = await supabase
        .from("applications")
        .update({ ai_feedback: feedback })
        .eq("id", applicant.id);

      if (updateError) throw updateError;

      // Update local state
      setApplicants(prev =>
        prev.map(a => a.id === applicant.id ? { ...a, ai_feedback: feedback } : a)
      );

    } catch (error: any) {
      console.error("Resume Analysis Error:", error);
      alert(`Analysis failed: ${error.message}`);
    } finally {
      setAnalyzing(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedJob) return;

    setLoading(true);
    try {
      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      // Extract text from resume
      const response = await fetch('/api/extractResume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeUrl: publicUrl }),
      });

      if (!response.ok) throw new Error('Failed to extract resume text');
      
      const { text } = await response.json();

      // Get AI feedback including job requirements
      const aiResponse = await fetch('/api/analyzeResume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resumeText: text,
          jobDescription: selectedJob.description,
          jobPreferences: selectedJob.preferences
        }),
      });

      if (!aiResponse.ok) throw new Error('Failed to analyze resume');
      
      const { feedback } = await aiResponse.json();
      setFeedback(feedback);

    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process resume');
    } finally {
      setLoading(false);
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
              <th className="border p-2">Position</th>
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
                  <td className="border p-2">{applicant.job_postings?.position_name || "N/A"}</td>
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
                <td colSpan={6} className="text-center p-4">
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
