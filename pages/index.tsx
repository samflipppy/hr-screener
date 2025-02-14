import { useAuth } from '../utils/auth';
import Layout from '../components/Layout';

export default function Home() {
  const { userProfile } = useAuth();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          {userProfile?.type === 'company' 
            ? 'Welcome to HR Dashboard' 
            : 'Find Your Next Opportunity'
          }
        </h1>
        <p className="text-gray-600">
          {userProfile?.type === 'company'
            ? 'Manage your applications and find great talent.'
            : 'Browse companies and find your perfect role.'
          }
        </p>
      </div>
    </Layout>
  );
}
