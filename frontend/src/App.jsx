import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import Roles from "./pages/Roles";
import AuditLogs from "./pages/AuditLogs";
import Analytics from "./pages/Analytics";
import Layout from "./components/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import AddUser from './pages/AddUser'
import EditUser from './pages/EditUser';
import AssignRole from './pages/AssignRole'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Analytics />} />
          <Route path="users" element={<Users />} />
          <Route path="/assign-role" element={<AssignRole />} />
          <Route path="/users/new" element={<AddUser />} />
          <Route path="/users/edit/:id" element={<EditUser />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="roles" element={<Roles />} />
          
          <Route path="audit-logs" element={<AuditLogs />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
