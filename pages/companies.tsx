import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import Layout from '../components/Layout';

type Company = {
  id: string;
  name: string;
  description: string;
};

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompanies() {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching companies:', error);
        return;
      }
      
      setCompanies(data || []);
      setLoading(false);
    }

    fetchCompanies();
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Browse Companies</h1>
        
        {loading ? (
          <div>Loading companies...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div key={company.id} className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-semibold mb-2">{company.name}</h2>
                <p className="text-gray-600 mb-4">{company.description}</p>
                <button 
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={() => {/* TODO: Handle apply */}}
                >
                  View Jobs
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
} 