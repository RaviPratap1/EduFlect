import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import HomePage from './pages/home/HomePage';
import CoursesPage from './pages/course/CoursesPage';
import CourseDetailPage from './pages/course/CourseDetailPage';
import CoursePlayerPage from './pages/course/CoursePlayerPage';
import ContactPage from './pages/extraInfo/ContactPage';
import AboutPage from './pages/extraInfo/AboutPge';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

import AdminDashboard from './pages/dashboard/admin/AdminDashboard';
import InstructorDashboard from './pages/dashboard/instructor/InstructorDashboard';
import StudentDashboard from './pages/dashboard/student/StudentDashboard';

const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-10 h-10 border-b-2 rounded-full animate-spin border-primary-600" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicOnly = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
  if (user?.role === 'instructor') return <Navigate to="/dashboard/instructor" replace />;
  return <Navigate to="/dashboard/student" replace />;
};

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />

          <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
          <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<PublicOnly><ForgotPasswordPage /></PublicOnly>} />
          <Route path="/reset-password" element={<PublicOnly><ResetPasswordPage /></PublicOnly>} />

          <Route path="/dashboard" element={<PrivateRoute><DashboardRedirect /></PrivateRoute>} />
          <Route path="/dashboard/admin/*" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/dashboard/instructor/*" element={<PrivateRoute roles={['instructor', 'admin']}><InstructorDashboard /></PrivateRoute>} />
          <Route path="/dashboard/student/*" element={<PrivateRoute roles={['student', 'admin']}><StudentDashboard /></PrivateRoute>} />
          <Route path="/learn/:courseId" element={<PrivateRoute><CoursePlayerPage /></PrivateRoute>} />

          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />

          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <h1 className="text-6xl font-bold text-primary-600">404</h1>
              <p className="text-xl text-gray-600">Page not found</p>
              <a href="/" className="btn-primary">Go Home</a>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
