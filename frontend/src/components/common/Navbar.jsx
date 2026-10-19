import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Plus,
  Bell,
  Search,
  Building,
  Shield,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import InstallAppButton from './InstallAppButton';

const Navbar = ({ setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const wasAdmin = user?.role === 'admin';
    await logout();
    navigate(wasAdmin ? '/admin/login' : '/staff/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left items: Mobile toggle + Breadcrumb / Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden transition"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <Link to="/" className="flex items-center text-slate-700 hover:text-blue-600 transition">
            <Shield className="w-3.5 h-3.5 mr-1 text-blue-600" />
            <span className="font-bold">ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್</span>
          </Link>
          <span>/</span>
          <span className="text-blue-600 font-medium">Police Survey & House Registry</span>
        </div>
      </div>

      {/* Right items: Install App + Quick Register House + Notifications + Profile dropdown */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <InstallAppButton variant="navbar" className="hidden sm:inline-flex" />

        {/* Quick action button */}
        <Link
          to="/register-house"
          className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span className="hidden md:inline">Register House</span>
          <span className="md:hidden">New</span>
        </Link>

        {/* Status notification */}
        <div className="relative">
          <button
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition relative"
            title="System status: Online"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>
        </div>

        {/* User Pill */}
        <div className="flex items-center pl-2 border-l border-slate-200">
          <div className="flex items-center space-x-2 text-left">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                {user?.fullName || 'Registry User'}
              </p>
              <p className="text-[10px] text-slate-500 capitalize">{user?.role || 'Staff'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="ml-2 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
