import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../utils/auth';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

type JobPosting = {
  id?: number;
  company_id?: string;
  position_name: string;
  description: string;
  preferences: string;
  created_at?: string;
};

export default function Settings() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    async function fetchJobPostings() {
      if (!userProfile?.company_id) return;

      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('company_id', userProfile.company_id);

      if (error) {
        console.error('Error fetching job postings:', error);
        return;
      }

      setJobPostings(data || []);
    }

    fetchJobPostings();
  }, [userProfile]);

  const handleSave = async (index: number) => {
    console.log('handleSave called for index:', index);
    if (!userProfile?.company_id) {
      console.error('No company_id found');
      return;
    }
    setSaving(true);
  
    const job = jobPostings[index];
    console.log('Saving job posting:', job);
  
    const { data, error } = await supabase
      .from('job_postings')
      .upsert({
        id: job.id,
        company_id: userProfile.company_id,
        position_name: job.position_name,
        description: job.description,
        preferences: job.preferences
      });
  
    console.log('Supabase response:', data, error);
  
    if (error) {
      console.error('Error saving job posting:', error);
      alert('Failed to save job posting');
    } else {
      alert('Job posting saved successfully');
    }
    setSaving(false);
  };


  const handleAddJobPosting = () => {
    setJobPostings([...jobPostings, { 
      position_name: '',
      description: '',
      preferences: ''
    }]);
  };

  if (loading) return <div className="p-6">Loading settings...</div>;
  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Job Postings</h1>
        <div className="space-y-8">
          {jobPostings.map((job, index) => (
            <section key={index} className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Position Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position Name</label>
                  <input
                    type="text"
                    value={job.position_name}
                    onChange={(e) =>
                      setJobPostings((prev) =>
                        prev.map((j, i) => (i === index ? { ...j, position_name: e.target.value } : j))
                      )
                    }
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={job.description}
                    onChange={(e) =>
                      setJobPostings((prev) =>
                        prev.map((j, i) => (i === index ? { ...j, description: e.target.value } : j))
                      )
                    }
                    rows={4}
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preferences</label>
                  <textarea
                    value={job.preferences}
                    onChange={(e) =>
                      setJobPostings((prev) =>
                        prev.map((j, i) => (i === index ? { ...j, preferences: e.target.value } : j))
                      )
                    }
                    rows={6}
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                    placeholder="Describe the ideal candidate's skills, experience, and traits..."
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => handleSave(index)}
                  disabled={saving}
                  className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Job Posting'}
                </button>
              </div>
            </section>
          ))}
          <button
            onClick={handleAddJobPosting}
            className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
          >
            Add Job Posting
          </button>
        </div>
      </div>
    </Layout>
  );
}