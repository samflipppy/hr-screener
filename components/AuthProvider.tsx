import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import { AuthContext, UserProfile } from '../utils/auth';
import { useRouter } from 'next/router';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<number[]>([]);
  const [applying, setApplying] = useState<number | null>(null);
  const router = useRouter();

  async function fetchUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single(); // Ensure only one row is returned
  
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchApplications() {
      if (!user) return;

      const { data, error } = await supabase
        .from('applications')
        .select('job_posting_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching applications:', error);
        return;
      }

      setApplications(data.map((app) => app.job_posting_id));
    }

    fetchApplications();
  }, [user]);

  const handleApply = async (jobId: number) => {
    if (!user) {
      alert('Please sign in to apply');
      return;
    }

    setApplying(jobId);
    try {
      console.log('Applying for job ID:', jobId);

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
      setApplications((prev) => [...prev, jobId]);
    } catch (error) {
      console.error('Error applying:', error);
      alert('Failed to submit application');
    } finally {
      setApplying(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
} 