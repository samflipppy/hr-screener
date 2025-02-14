import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../utils/auth';
import Layout from '../components/Layout';

type JobPosting = {
  id: number;
  company_id: string;
  position_name: string;
  description: string;
  preferences: string;
  companies: {
    name: string;
  };
};

export default function Jobs() {
  const { user } = useAuth();
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<number | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      const { data, error } = await supabase
        .from('job_postings')
        .select(`
          *,
          companies (
            name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching jobs:', error);
        return;
      }
      
      setJobPostings(data || []);
      setLoading(false);
    }

    fetchJobs();
  }, []);

  const handleApply = async (jobId: number) => {
    if (!user) {
      alert('Please sign in to apply');
      return;
    }

    setApplying(jobId);
    try {
      // Create application record
      const { error } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          job_posting_id: jobId,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying:', error);
      alert('Failed to submit application');
    } finally {
      setApplying(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Browse Jobs</h1>
        
        {loading ? (
          <div>Loading jobs...</div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requirements
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobPostings.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {job.companies?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{job.position_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {job.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {job.preferences}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={applying === job.id}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      >
                        {applying === job.id ? 'Applying...' : 'Apply'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
} 