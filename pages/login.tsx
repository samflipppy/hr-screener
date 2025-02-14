import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabase';

type UserType = 'applicant' | 'company';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [userType, setUserType] = useState<UserType>('applicant');

  const validatePassword = (pass: string) => {
    if (pass.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (isSignUp && !validatePassword(password)) {
        throw new Error('Password must be at least 6 characters');
      }

      if (isSignUp) {
        console.log('Starting signup process...');
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              type: userType
            }
          }
        });

        console.log('Auth signup response:', authData);

        if (signUpError) throw signUpError;

        if (userType === 'company' && authData?.user) {
          console.log('Creating company record for user:', authData.user.id);
          const { error: companyError } = await supabase
            .from('companies')
            .insert([
              {
                id: authData.user.id,
                name: email.split('@')[0],
                created_at: new Date().toISOString()
              }
            ]);

          console.log('Company creation result:', companyError || 'Success');

          if (companyError) throw companyError;

          console.log('Creating user profile...');
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert([
              {
                user_id: authData.user.id,
                type: userType,
                company_id: authData.user.id
              }
            ]);

          console.log('Profile creation result:', profileError || 'Success');

          if (profileError) throw profileError;
        }

        setError("Please check your email for the verification link before signing in!");
        setIsSignUp(false);
      } else {
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        // Get user profile to determine redirect
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('type')
          .eq('user_id', authData.user.id)
          .single();

        // Redirect based on user type
        if (profile?.type === 'company') {
          router.push('/dashboard');
        } else {
          router.push('/companies'); // For job seekers
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">
          {isSignUp ? `Create an account as ${userType}` : 'Sign in to your account'}
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (isSignUp) validatePassword(e.target.value);
              }}
              className={`mt-1 block w-full px-3 py-2 border ${
                passwordError ? 'border-red-500' : 'border-gray-300'
              } rounded-md`}
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-500">{passwordError}</p>
            )}
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a...
              </label>
              <div className="mt-2 space-x-4 flex">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setUserType('applicant');
                  }}
                  className={`
                    flex-1 px-4 py-2 rounded-md 
                    ${userType === 'applicant' 
                      ? 'bg-blue-600 text-white border-2 border-blue-600 shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                    }
                    transition-all duration-200 ease-in-out
                  `}
                >
                  Job Seeker
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setUserType('company');
                  }}
                  className={`
                    flex-1 px-4 py-2 rounded-md
                    ${userType === 'company'
                      ? 'bg-blue-600 text-white border-2 border-blue-600 shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                    }
                    transition-all duration-200 ease-in-out
                  `}
                >
                  Company
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign up' : 'Sign in')}
          </button>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-sm text-blue-600 hover:text-blue-500"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </form>
      </div>
    </div>
  );
} 