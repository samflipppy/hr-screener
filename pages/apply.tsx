import { useState } from "react";
import { supabase } from "../utils/supabase";

export default function Apply() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file && file.type !== "application/pdf") {
      setError("Only PDF resumes are allowed.");
      setResume(null);
    } else {
      setError(null);
      setResume(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !email || !resume) {
      setError("Please fill out all fields.");
      setLoading(false);
      return;
    }

    const fileExt = resume.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from("resumes").upload(fileName, resume);

    if (error) {
      setError("Error uploading resume.");
      setLoading(false);
      return;
    }

    const resumeUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/resumes/${fileName}`;
    const { error: insertError } = await supabase
      .from("applications")
      .insert([{ name, email, resume_url: resumeUrl }]);

    if (insertError) {
      setError("Error saving application.");
    } else {
      alert("Application submitted successfully!");
      setName("");
      setEmail("");
      setResume(null);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center mt-10 p-6 max-w-md mx-auto border shadow-lg rounded-lg bg-white">
      <h1 className="text-2xl font-bold mb-4">Job Application</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <input
          className="border p-2 w-full"
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="border p-2 w-full"
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="border p-2 w-full"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
