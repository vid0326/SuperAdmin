import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api"; 
import { User, Lock, LogIn as LogInIcon } from 'lucide-react'; 
import { AUTH_TOKEN_KEY } from '../utils/constants';
export default function Login() {
  const [email, setEmail] = useState("superadmin@example.com"); 
  const [password, setPassword] = useState("Test1234!"); 
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem(AUTH_TOKEN_KEY, data.token); 
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="p-8 max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <LogInIcon className="mx-auto h-12 w-12 text-indigo-600 dark:text-indigo-400" />
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">
            SuperAdmin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Access the dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-md text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Email address"
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}