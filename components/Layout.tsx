import { ReactNode } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-60"> {/* ml-60 matches sidebar width */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 