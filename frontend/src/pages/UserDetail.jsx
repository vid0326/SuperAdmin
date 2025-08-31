import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/api"; 
import { User, Mail, Shield, LogIn, Hash, CalendarPlus, CalendarClock } from 'lucide-react';

export default function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get(`/superadmin/users/${id}`);
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setError("User not found or an error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) return <p className="p-4 text-center">Loading user details...</p>;
  if (error) return <p className="p-4 text-center text-red-500">{error}</p>;
  if (!user) return <p className="p-4 text-center">No user data available.</p>;

  const displayRoles = user.roles && user.roles.length > 0
    ? user.roles.map(userRole => userRole.role.name).join(", ")
    : "No roles assigned";

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString() : "Never";
  const displayLastLogin = formatDate(user.lastLogin);
  const displayCreatedAt = formatDate(user.createdAt);
  const displayUpdatedAt = formatDate(user.updatedAt);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-5 text-gray-800 dark:text-white">User Detail</h1>
      
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-lg mx-auto">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          <DetailItem icon={<Hash />} label="User ID" value={user.id} />
          <DetailItem icon={<User />} label="Name" value={user.name} />
          <DetailItem icon={<Mail />} label="Email" value={user.email} />
          <DetailItem icon={<Shield />} label="Roles" value={displayRoles} />
          <DetailItem icon={<LogIn />} label="Last Login" value={displayLastLogin} />
          <DetailItem icon={<CalendarPlus />} label="Account Created" value={displayCreatedAt} />
          <DetailItem icon={<CalendarClock />} label="Last Updated" value={displayUpdatedAt} />
        </div>
      </div>
    </div>
  );
}

// Helper component for consistent item styling
const DetailItem = ({ icon, label, value }) => (
  // ✅ **2. Reduced Vertical Padding and Font Size**
  <div className="py-3 flex items-center">
    <div className="text-gray-400 mr-4">{icon}</div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-semibold text-gray-800 dark:text-white">{value}</p> {/* text-base is default */}
    </div>
  </div>
);