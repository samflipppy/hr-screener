import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

interface Applicant {
  id: number;
  name: string;
  email: string;
}

export default function Dashboard() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  useEffect(() => {
    const fetchApplicants = async () => {
      const { data, error } = await supabase.from('applications').select('*');
      if (error) console.error(error);
      else setApplicants(data || []);
    };
    fetchApplicants();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">HR Dashboard</h1>
      <ul className="mt-4">
        {applicants.map((app) => (
          <li key={app.id} className="border-b p-2">{app.name} - {app.email}</li>
        ))}
      </ul>
    </div>
  );
}
