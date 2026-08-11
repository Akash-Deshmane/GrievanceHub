import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ProtectedRoute, RoleRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';

// Auth Pages
import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import SubmitComplaint  from './pages/student/SubmitComplaint';
import MyComplaints     from './pages/student/MyComplaints';
import ComplaintDetail  from './pages/student/ComplaintDetail';
import Profile          from './pages/student/Profile';

// Admin Pages
import AdminDashboard   from './pages/admin/AdminDashboard';
import ManageComplaints from './pages/admin/ManageComplaints';

// Super Admin Pages
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import ManageUsers         from './pages/superadmin/ManageUsers';
import ManageCategories    from './pages/superadmin/ManageCategories';

const AppRoutes = () => {
  const { theme } = useTheme();
  
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Layout (Sidebar) */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>

            {/* ── Student ── */}
            <Route path="/dashboard"        element={<RoleRoute roles={['student']}><StudentDashboard /></RoleRoute>} />
            <Route path="/submit-complaint" element={<RoleRoute roles={['student']}><SubmitComplaint /></RoleRoute>} />
            <Route path="/my-complaints"    element={<RoleRoute roles={['student']}><MyComplaints /></RoleRoute>} />
            <Route path="/complaint/:id"    element={<RoleRoute roles={['student']}><ComplaintDetail /></RoleRoute>} />
            <Route path="/profile"          element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* ── Dept Admin ── */}
            <Route path="/admin"             element={<RoleRoute roles={['dept_admin']}><AdminDashboard /></RoleRoute>} />
            <Route path="/admin/complaints"  element={<RoleRoute roles={['dept_admin']}><ManageComplaints /></RoleRoute>} />
            <Route path="/admin/complaint/:id" element={<RoleRoute roles={['dept_admin']}><ComplaintDetail /></RoleRoute>} />

            {/* ── Super Admin ── */}
            <Route path="/super"              element={<RoleRoute roles={['super_admin']}><SuperAdminDashboard /></RoleRoute>} />
            <Route path="/super/complaints"   element={<RoleRoute roles={['super_admin']}><ManageComplaints /></RoleRoute>} />
            <Route path="/super/users"        element={<RoleRoute roles={['super_admin']}><ManageUsers /></RoleRoute>} />
            <Route path="/super/categories"   element={<RoleRoute roles={['super_admin']}><ManageCategories /></RoleRoute>} />
            <Route path="/super/complaint/:id" element={<RoleRoute roles={['super_admin']}><ComplaintDetail /></RoleRoute>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme={theme === 'light' ? 'light' : 'dark'}
        toastStyle={
          theme === 'light'
            ? { background: 'var(--bg-card)', border: '1px solid var(--border-main)', color: 'var(--text-main)' }
            : { background: 'var(--bg-card)', border: '1px solid var(--border-main)', color: 'var(--text-main)' }
        }
      />
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
