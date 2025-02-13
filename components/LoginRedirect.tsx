import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function LoginRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/login');
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      Redirecting to login...
    </div>
  );
} 