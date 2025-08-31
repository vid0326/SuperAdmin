import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { Plus, Eye, Edit, Trash2, UserCheck, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 10;

  // Fetch users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/superadmin/users");
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Could not load user data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Handle user deletion
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await api.delete(`/superadmin/users/${id}`);
        setUsers(users.filter(user => user.id !== id));
      } catch (err) {
        console.error("Failed to delete user:", err);
        setError("Failed to delete user. They may have related records.");
      }
    }
  };

  // Memoized filtering and pagination logic
  const paginatedUsers = useMemo(() => {
    const filteredUsers = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  }, [users, searchTerm, currentPage]);

  const totalPages = Math.ceil(users.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())).length / USERS_PER_PAGE);

  if (loading) return <p className="p-4 text-center text-gray-500 dark:text-gray-400">Loading users...</p>;
  if (error) return <p className="p-4 text-center text-red-500">{error}</p>;

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">User Management</h1>
        <div className="flex space-x-2">
          <Link 
            to="/assign-role" 
            className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center transition-colors text-sm"
          >
            <UserCheck size={18} className="mr-2" />
            Assign Roles
          </Link>
          <Link 
            to="/users/new" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center transition-colors text-sm"
          >
            <Plus size={18} className="mr-2" />
            Add User
          </Link>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="w-full sm:w-72 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Roles</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedUsers.length > 0 ? paginatedUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 align-middle">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {user.roles?.map(userRole => userRole.role.name).join(', ') || 'No roles'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  <Link to={`/users/${user.id}`} className="inline-block text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400" title="View">
                    <Eye size={18} />
                  </Link>
                  <Link to={`/users/edit/${user.id}`} className="inline-block text-gray-500 hover:text-green-600 dark:hover:text-green-400" title="Edit">
                    <Edit size={18} />
                  </Link>
                  <button onClick={() => handleDelete(user.id)} className="inline-block text-gray-500 hover:text-red-600 dark:hover:text-red-400" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="text-center py-10 text-gray-500 dark:text-gray-400">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm flex items-center bg-gray-200 dark:bg-gray-600 rounded-md disabled:opacity-50"
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm flex items-center bg-gray-200 dark:bg-gray-600 rounded-md disabled:opacity-50"
            >
              Next
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}