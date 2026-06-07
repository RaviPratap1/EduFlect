import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { GraduationCap, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLink = 'text-gray-600 hover:text-primary-600 font-medium transition-colors';
  const activeLink = 'text-primary-600 font-semibold';
  const dashboardPath = user?.role === 'admin' ? '/dashboard/admin' : user?.role === 'instructor' ? '/dashboard/instructor' : '/dashboard/student';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-600">
            <GraduationCap className="w-7 h-7" /> EduFlect
          </Link>
          <nav className="items-center hidden gap-6 md:flex">
            <NavLink to="/" end className={({ isActive }) => isActive ? activeLink : navLink}>Home</NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? activeLink : navLink}>About</NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? activeLink : navLink}>Dashboard</NavLink>
            <NavLink to="/courses" className={({ isActive }) => isActive ? activeLink : navLink}>Courses</NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? activeLink : navLink}>Contact</NavLink>
          </nav>
          <div className="items-center hidden gap-3 md:flex">
            {isAuthenticated ? (
              <div className="relative">
                <button onClick={() => setDropdownOpen((p) => !p)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-center w-8 h-8 text-sm font-semibold text-white rounded-full bg-primary-600 overflow-hidden">
                    {user?.profile?.avatar ? <img src={user.profile.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" /> : <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>}
                  </div>
                  <span className="text-sm font-medium">{user?.firstName}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 z-50 w-48 py-1 mt-2 bg-white border border-gray-100 shadow-lg rounded-xl">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                    <Link to={dashboardPath} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <button onClick={handleLogout} className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm btn-secondary">Login</Link>
                <Link to="/register" className="text-sm btn-primary">Sign Up</Link>
              </>
            )}
          </div>
          <button className="p-2 md:hidden" onClick={() => setMenuOpen((p) => !p)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="px-4 py-4 space-y-3 bg-white border-t border-gray-100 md:hidden">
          <NavLink to="/" end className="block font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/courses" className="block font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Courses</NavLink>
          {isAuthenticated ? (
            <>
              <Link to={dashboardPath} className="block font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="font-medium text-red-600">Logout</button>
            </>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="justify-center flex-1 text-sm btn-secondary" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="justify-center flex-1 text-sm btn-primary" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
