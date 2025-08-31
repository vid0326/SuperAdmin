import React, { useState, useEffect } from "react";
import api from "../api/api"; 
import { Users, UserCheck, UserX, Shield, UserPlus, FileText } from 'lucide-react'; 

const StatCard = ({ title, value, icon, description }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
    <div className="flex items-center">
      <div className="p-3 bg-indigo-100 dark:bg-gray-700 rounded-full mr-4">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
      </div>
    </div>
    {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{description}</p>}
  </div>
);

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get("/superadmin/analytics/summary");
        setSummary(data);
      } catch (err) {
        console.error("Failed to fetch summary:", err);
        setError("Could not load analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <p className="p-4 text-center">Loading analytics...</p>;
  if (error) return <p className="p-4 text-center text-red-500">{error}</p>;
  if (!summary) return <p className="p-4 text-center">No analytics data available.</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Analytics Summary</h1>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Users" value={summary.totalUsers} icon={<Users className="text-indigo-500" />} />
        <StatCard title="Active Users (7d)" value={summary.activeUsers} description={`${summary.activePercentage}% of total users`} icon={<UserCheck className="text-green-500" />} />
        <StatCard title="Inactive Users" value={summary.inactiveUsers} description={`${summary.inactivePercentage}% of total users`} icon={<UserX className="text-red-500" />} />
        <StatCard title="Total Roles" value={summary.totalRoles} icon={<Shield className="text-blue-500" />} />
        <StatCard title="New Users (7d)" value={summary.newUsers} icon={<UserPlus className="text-yellow-500" />} />
        <StatCard title="Audit Log Entries" value={summary.totalAuditLogs} icon={<FileText className="text-gray-500" />} />
      </div>
      
      {/* Users by Role Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Users by Role</h2>
        <div className="space-y-4">
          {Object.entries(summary.usersByRole).map(([role, count]) => (
            <div key={role}>
              <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-gray-700 dark:text-gray-300">{role}</span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{count} {count === 1 ? 'user' : 'users'}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full" 
                  style={{ width: `${(count / summary.totalUsers) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}