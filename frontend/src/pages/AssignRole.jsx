import { useState, useEffect } from "react";
import api from "../api/api"; // Ensure this path is correct
import { UserCheck } from 'lucide-react';

// Helper function to capitalize role names
const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export default function AssignRole() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserRoles, setSelectedUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch all users and all roles when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, rolesRes] = await Promise.all([
          api.get("/superadmin/users"),
          api.get("/superadmin/roles")
        ]);
        setUsers(usersRes.data);
        setRoles(rolesRes.data);
      } catch (err) {
        setError("Failed to load initial data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

 
  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUserRoles([]);
      return;
    }

    const selectedUser = users.find(u => u.id === parseInt(selectedUserId));
    if (selectedUser) {
      const currentUserRoleIds = selectedUser.roles.map(userRole => userRole.role.id);
      setSelectedUserRoles(currentUserRoleIds);
    }
  }, [selectedUserId, users]);

  const handleRoleChange = (roleId) => {
    const newRoles = selectedUserRoles.includes(roleId)
      ? selectedUserRoles.filter(id => id !== roleId)
      : [...selectedUserRoles, roleId];
    setSelectedUserRoles(newRoles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!selectedUserId) {
      setError("Please select a user first.");
      return;
    }

    try {
      
      await api.put(`/superadmin/users/${selectedUserId}`, {
        roleIds: selectedUserRoles
      });
      setSuccess("User roles updated successfully!");
      
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update roles.");
    }
  };

  if (loading) return <p className="p-4 text-center text-gray-400">Loading data...</p>;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Assign Roles to User</h1>
      
      {error && <div className="bg-red-900/50 text-red-300 p-3 rounded-md mb-6 text-center">{error}</div>}
      {success && <div className="bg-green-900/50 text-green-300 p-3 rounded-md mb-6 text-center">{success}</div>}
      
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl">
        <form onSubmit={handleSubmit}>
         
          <div className="mb-8">
            <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
              Select User
            </label>
            <select
              id="user-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Please choose a user --</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

         
          {selectedUserId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-3">
                Manage Roles
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                {roles.map(role => (
                  <label key={role.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedUserRoles.includes(role.id)}
                      onChange={() => handleRoleChange(role.id)}
                      className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{capitalizeFirstLetter(role.name)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              type="submit"
              disabled={!selectedUserId}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-600/20 flex items-center"
            >
              <UserCheck size={18} className="mr-2" />
              Save Role Assignments
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}