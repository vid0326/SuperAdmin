import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import api from "../api/api";
import Joi from "joi";
import { UserCog } from 'lucide-react'; 

const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};


const editUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Name is required.',
    'string.min': 'Name must be at least 2 characters long.',
  }),
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.empty': 'Email is required.',
    'string.email': 'Please enter a valid email address.',
  }),
  
  password: Joi.string().allow('').min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/).messages({
    'string.min': 'New password must be at least 8 characters long.',
    'string.pattern.base': 'Password needs uppercase, lowercase, number, and special character.',
  }),
  roleIds: Joi.array().items(Joi.number()),
});

export default function EditUser() {
  const { id } = useParams(); 
  const [formData, setFormData] = useState({ name: "", email: "", password: "", roleIds: [] });
  const [allRoles, setAllRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, rolesRes] = await Promise.all([
          api.get(`/superadmin/users/${id}`),
          api.get("/superadmin/roles")
        ]);

        const userData = userRes.data;
        setFormData({
          name: userData.name,
          email: userData.email,
          password: "", 
          roleIds: userData.roles.map(userRole => userRole.role.id) 
        });
        setAllRoles(rolesRes.data);

      } catch (err) {
        setApiError("Failed to load user data or roles.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const validateField = (name, value) => {
    const fieldSchema = Joi.object({ [name]: editUserSchema.extract(name) });
    const { error } = fieldSchema.validate({ [name]: value });
    return error ? error.details[0].message : null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    const errorMessage = validateField(name, value);
    setErrors({ ...errors, [name]: errorMessage });
  };
  
  const handleRoleChange = (roleId) => {
    const newRoleIds = formData.roleIds.includes(roleId)
      ? formData.roleIds.filter(id => id !== roleId)
      : [...formData.roleIds, roleId];
    setFormData({ ...formData, roleIds: newRoleIds });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const { error } = editUserSchema.validate(formData, { abortEarly: false });
    if (error) {
      const newErrors = {};
      error.details.forEach(detail => { newErrors[detail.path[0]] = detail.message; });
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);

    // Only include the password in the payload if a new one was entered
    const payload = { ...formData };
    if (!payload.password) {
      delete payload.password;
    }

    try {
      await api.put(`/superadmin/users/${id}`, payload);
      navigate("/users");
    } catch (err) {
      setApiError(err.response?.data?.error || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <p className="p-4 text-center text-gray-400">Loading user data...</p>;

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <UserCog className="mx-auto h-10 w-10 text-indigo-400" />
          <h1 className="text-2xl font-bold mt-4 text-gray-800 dark:text-white">Edit User</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Update the details for {formData.name}.</p>
        </div>
        
        <form onSubmit={handleSubmit} noValidate>
          {apiError && <div className="bg-red-900/50 text-red-300 p-3 rounded-md mb-6 text-center">{apiError}</div>}
          
          <div className="space-y-6">
            {/* Name, Email, Password Inputs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} 
                className={`mt-2 block w-full bg-transparent border-0 border-b-2 ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-800 dark:text-white appearance-none focus:outline-none focus:ring-0 ${errors.name ? 'focus:border-red-500' : 'focus:border-indigo-500'} transition-colors`} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} 
                className={`mt-2 block w-full bg-transparent border-0 border-b-2 ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-800 dark:text-white appearance-none focus:outline-none focus:ring-0 ${errors.email ? 'focus:border-red-500' : 'focus:border-indigo-500'} transition-colors`} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">New Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep unchanged"
                className={`mt-2 block w-full bg-transparent border-0 border-b-2 ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-800 dark:text-white appearance-none focus:outline-none focus:ring-0 ${errors.password ? 'focus:border-red-500' : 'focus:border-indigo-500'} transition-colors`} />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
          </div>

          {/* Assign Roles Section */}
          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-3">Assign Roles</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
              {allRoles.map(role => (
                <label key={role.id} className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" checked={formData.roleIds.includes(role.id)} onChange={() => handleRoleChange(role.id)} 
                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500" />
                  <span className="text-gray-700 dark:text-gray-300">{capitalizeFirstLetter(role.name)}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-5 border-t border-gray-200 dark:border-gray-700">
            <Link to="/users" className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</Link>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-600/20">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}