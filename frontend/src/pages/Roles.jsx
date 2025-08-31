import { useState, useEffect } from "react";
import api from "../api/api"; 
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';

const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [newRoleName, setNewRoleName] = useState("");
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingRoleName, setEditingRoleName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRoles = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/superadmin/roles");
      setRoles(data);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      setError("Could not load roles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    try {
      const { data: newRole } = await api.post("/superadmin/roles", { name: newRoleName });
      setRoles([...roles, newRole]);
      setNewRoleName("");
    } catch (err) {
      console.error("Failed to create role:", err);
      setError(err.response?.data?.message || "Failed to create role.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await api.delete(`/superadmin/roles/${id}`);
        setRoles(roles.filter(role => role.id !== id));
      } catch (err) {
        console.error("Failed to delete role:", err);
        setError(err.response?.data?.message || "Failed to delete role.");
      }
    }
  };

  const handleEdit = (role) => {
    setEditingRoleId(role.id);
    setEditingRoleName(role.name);
  };

  const handleCancelEdit = () => {
    setEditingRoleId(null);
    setEditingRoleName("");
  };

  const handleUpdate = async (id) => {
    if (!editingRoleName.trim()) return;
    try {
      const { data: updatedRole } = await api.put(`/superadmin/roles/${id}`, { name: editingRoleName });
      setRoles(roles.map(role => (role.id === id ? updatedRole : role)));
      handleCancelEdit();
    } catch (err) {
      console.error("Failed to update role:", err);
      setError(err.response?.data?.message || "Failed to update role.");
    }
  };

  if (loading) return <p className="p-4 text-center">Loading roles...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Role Management</h1>
      </div>

      {error && <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-3 rounded-md mb-4">{error}</div>}

      <form onSubmit={handleCreate} className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center space-x-3">
        <input
          type="text"
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
          className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter new role name"
        />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center transition-colors">
          <Plus size={20} className="mr-2" />
          Create Role
        </button>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {roles.map(role => (
              <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 align-middle">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{role.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {editingRoleId === role.id ? (
                    <input
                      type="text"
                      value={editingRoleName}
                      onChange={(e) => setEditingRoleName(e.target.value)}
                      className="p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                      autoFocus
                    />
                  ) : (
                    
                    capitalizeFirstLetter(role.name)
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  {editingRoleId === role.id ? (
                    <>
                      <button onClick={() => handleUpdate(role.id)} className="text-green-600 hover:text-green-800" title="Save">
                        <Check size={18} />
                      </button>
                      <button onClick={handleCancelEdit} className="text-gray-500 hover:text-gray-700" title="Cancel">
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(role)} className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(role.id)} className="text-gray-500 hover:text-red-600 dark:hover:text-red-400" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}