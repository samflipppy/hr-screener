import { useState } from 'react';
import { supabase } from '../utils/supabase';

export default function Apply() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('applications').insert([{ name, email }]);
    if (error) console.error(error);
    else alert('Application submitted!');
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-2xl font-bold">Job Application</h1>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col space-y-4">
        <input className="border p-2" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="border p-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">Submit</button>
      </form>
    </div>
  );
}
