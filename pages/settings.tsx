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
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

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
      console.error('No company_id found in userProfile:', userProfile);
      alert('Error: No company ID found');
      return;
    }
    setSaving(true);
  
    const job = jobPostings[index];
    console.log('Saving job posting:', job);
  
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .upsert({
          id: job.id,
          company_id: userProfile.company_id,
          position_name: job.position_name,
          description: job.description,
          preferences: job.preferences
        }, {
          onConflict: 'id'
        });
  
      console.log('Supabase response:', { data, error });
  
      if (error) {
        console.error('Error saving job posting:', error);
        alert(`Failed to save job posting: ${error.message}`);
      } else {
        // Refresh the job postings list
        const { data: updatedData, error: fetchError } = await supabase
          .from('job_postings')
          .select('*')
          .eq('company_id', userProfile.company_id);
  
        if (fetchError) {
          console.error('Error fetching updated job postings:', fetchError);
        } else {
          setJobPostings(updatedData || []);
          alert('Job posting saved successfully');
        }
      }
    } catch (err) {
      console.error('Exception while saving:', err);
      alert('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleAddJobPosting = () => {
    setJobPostings([...jobPostings, { 
      position_name: '',
      description: '',
      preferences: ''
    }]);
    setShowAddForm(true);
  };

  if (loading) return <div className="p-6">Loading settings...</div>;
  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Job Postings</h1>
          <button
            onClick={handleAddJobPosting}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Add New Position
          </button>
        </div>

        {/* Table of job postings */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preferences
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobPostings.map((job, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing === index || (showAddForm && !job.id) ? (
                      <input
                        type="text"
                        value={job.position_name}
                        onChange={(e) =>
                          setJobPostings((prev) =>
                            prev.map((j, i) => (i === index ? { ...j, position_name: e.target.value } : j))
                          )
                        }
                        className="w-full border rounded-md px-2 py-1"
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{job.position_name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing === index || (showAddForm && !job.id) ? (
                      <textarea
                        value={job.description}
                        onChange={(e) =>
                          setJobPostings((prev) =>
                            prev.map((j, i) => (i === index ? { ...j, description: e.target.value } : j))
                          )
                        }
                        rows={3}
                        className="w-full border rounded-md px-2 py-1"
                      />
                    ) : (
                      <div className="text-sm text-gray-500 line-clamp-2">{job.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing === index || (showAddForm && !job.id) ? (
                      <textarea
                        value={job.preferences}
                        onChange={(e) =>
                          setJobPostings((prev) =>
                            prev.map((j, i) => (i === index ? { ...j, preferences: e.target.value } : j))
                          )
                        }
                        rows={3}
                        className="w-full border rounded-md px-2 py-1"
                      />
                    ) : (
                      <div className="text-sm text-gray-500 line-clamp-2">{job.preferences}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isEditing === index || (showAddForm && !job.id) ? (
                      <div className="space-x-2">
                        <button
                          onClick={() => {
                            setIsEditing(null);
                            setShowAddForm(false);
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            handleSave(index);
                            setIsEditing(null);
                            setShowAddForm(false);
                          }}
                          disabled={saving}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    ) : (
                      <div className="space-x-2">
                        <button
                          onClick={() => setIsEditing(index)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            // Add delete functionality here
                            if (confirm('Are you sure you want to delete this position?')) {
                              // TODO: Implement delete
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}