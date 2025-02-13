import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../utils/auth';
import Layout from '../components/Layout';

type Applicant = {
  id: number;
  name: string;
  email: string;
  resume_url: string;
  resume_feedback: string;
  test_feedback: string;
  status: string;
  created_at: string;
};

export default function Applicants() {
  const { userProfile } = useAuth();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApplicants() {
      if (!userProfile?.company_id) return;

      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applicants:', error);
        return;
      }

      setApplicants(data || []);
      setLoading(false);
    }

    fetchApplicants();
  }, [userProfile]);

  const handleStatusChange = async (applicantId: number, newStatus: string) => {
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', applicantId);

    if (error) {
      console.error('Error updating status:', error);
      return;
    }

    setApplicants(prev =>
      prev.map(app =>
        app.id === applicantId ? { ...app, status: newStatus } : app
      )
    );
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Applicants</h1>

        {loading ? (
          <div>Loading applicants...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resume</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applicants.map((applicant) => (
                  <tr key={applicant.id}>
                    <td className="px-6 py-4">{applicant.name}</td>
                    <td className="px-6 py-4">{applicant.email}</td>
                    <td className="px-6 py-4">
                      <a 
                        href={applicant.resume_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        View Resume
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={applicant.status}
                        onChange={(e) => handleStatusChange(applicant.id, e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        <option value="sent">Sent</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="interviewed">Interviewed</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button 
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        onClick={() => {/* TODO: View details */}}
                      >
                        Details
                      </button>
                      <button 
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        onClick={() => {/* TODO: Send test */}}
                      >
                        Send Test
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