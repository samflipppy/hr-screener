import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Home, FileText, LayoutDashboard, Menu, Sun, Moon } from "lucide-react";
import { useAuth } from '../utils/auth';
import LoadingSpinner from './LoadingSpinner';
import LoginRedirect from './LoginRedirect';

export default function Sidebar() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { user, loading } = useAuth();

  const isActive = (path: string) => router.pathname === path;

  const toggleSidebar = () => setCollapsed(!collapsed);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  if (loading) return <LoadingSpinner />;
  if (!user) return <LoginRedirect />;

  return (
    <div className={`fixed top-0 left-0 h-screen ${collapsed ? "w-16" : "w-60"} bg-gray-900 text-white flex flex-col p-4 shadow-lg transition-all z-50`}>
      {/* ✅ Sidebar Toggle Button */}
      <button onClick={toggleSidebar} className="mb-4 text-gray-300 hover:text-white">
        <Menu size={24} />
      </button>

      {/* ✅ Logo */}
      {!collapsed && <h1 className="text-2xl font-bold mb-6">HR Screening</h1>}

      {/* ✅ Navigation Links */}
      <nav className="flex flex-col space-y-4">
        <NavLink href="/" label="Home" icon={<Home size={20} />} active={isActive("/")} collapsed={collapsed} />
        <NavLink href="/apply" label="Apply" icon={<FileText size={20} />} active={isActive("/apply")} collapsed={collapsed} />
        <NavLink href="/dashboard" label="Dashboard" icon={<LayoutDashboard size={20} />} active={isActive("/dashboard")} collapsed={collapsed} />
      </nav>

      {/* ✅ Dark Mode Toggle */}
      <button onClick={toggleDarkMode} className="mt-auto flex items-center space-x-2 text-gray-300 hover:text-white">
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        {!collapsed && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
      </button>
    </div>
  );
}

//penis

// ✅ Reusable Navigation Link Component
function NavLink({ href, label, icon, active, collapsed }: { href: string; label: string; icon: React.ReactNode; active: boolean; collapsed: boolean }) {
  return (
    <Link href={href} className={`flex items-center p-3 rounded-md space-x-2 ${active ? "bg-blue-600 font-bold" : "hover:bg-gray-700"}`}>
      {icon}
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
