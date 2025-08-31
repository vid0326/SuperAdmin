import axios from "axios";
import { AUTH_TOKEN_KEY } from '../utils/constants';
const api = axios.create({
  baseURL: "http://localhost:3000/api/v1", // your backend URL
});

export function setAuthToken(token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}


api.interceptors.request.use(config => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
