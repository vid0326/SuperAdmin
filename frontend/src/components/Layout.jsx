import { Outlet, NavLink, useNavigate } from "react-router-dom";

import { LayoutDashboard, Users, Shield, FileText, LogOut } from 'lucide-react';


const navItems = [
  { path: "/", name: "Analytics", icon: LayoutDashboard },
  { path: "/users", name: "Users", icon: Users },
  { path: "/roles", name: "Roles", icon: Shield },
  { path: "/audit-logs", name: "Audit Logs", icon: FileText },
];

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col fixed h-screen">
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">SuperAdmin</h2>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isActive ? 'bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-white font-semibold' : ''
                }`
              }
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center p-3 rounded-lg transition-colors duration-200 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area with Header */}
      <div className="ml-64">
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto">
             <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Dashboard</h1>
          </div>
        </header>
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}