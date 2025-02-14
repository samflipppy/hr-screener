import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Home, FileText, LayoutDashboard, Menu, Sun, Moon, Building2, Users, LogOut } from "lucide-react";
import { useAuth, useUserType } from '../utils/auth';
import LoadingSpinner from './LoadingSpinner';
import LoginRedirect from './LoginRedirect';
import { supabase } from '../utils/supabase';

export default function Sidebar() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { user, loading, userProfile } = useAuth();
  const userType = useUserType();

  const isActive = (path: string) => router.pathname === path;

  const toggleSidebar = () => setCollapsed(!collapsed);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
      return;
    }
    router.push('/login');
  };

  if (loading) return <LoadingSpinner />;
  if (!user) return <LoginRedirect />;

  const isCompany = userProfile?.type === 'company';

  const applicantLinks = [
    { href: "/", label: "Home", icon: <Home size={20} /> },
    { href: "/jobs", label: "Browse Jobs", icon: <Building2 size={20} /> },
    { href: "/applications", label: "My Applications", icon: <FileText size={20} /> },
  ];

  const companyLinks = [
    { href: "/", label: "Home", icon: <Home size={20} /> },
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { href: "/settings", label: "Company Settings", icon: <Building2 size={20} /> },
  ];

  const links = isCompany ? companyLinks : applicantLinks;

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-gray-900 text-white shadow-lg">
      <div className="flex flex-col h-full p-4">
        {/* Logo/Header */}
        <div className="mb-6">
          <button onClick={toggleSidebar} className="p-2 hover:bg-gray-800 rounded">
            <Menu size={24} />
          </button>
          <h1 className="text-2xl font-bold mt-4">
            {isCompany ? 'HR Dashboard' : 'Job Search'}
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.href}
              {...link}
              active={isActive(link.href)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* Footer Buttons */}
        <div className="border-t border-gray-800 pt-4 mt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-gray-800 rounded"
          >
            <LogOut size={20} />
            <span className="ml-3">Logout</span>
          </button>
          
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center px-4 py-2 mt-2 text-gray-300 hover:bg-gray-800 rounded"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span className="ml-3">{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

//penis

// ✅ Reusable Navigation Link Component
function NavLink({ href, label, icon, active, collapsed }: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link href={href} className={`flex items-center p-3 rounded-md space-x-2 ${
      active ? "bg-blue-600 font-bold" : "hover:bg-gray-700"
    }`}>
      {icon}
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
