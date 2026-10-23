import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  FileSpreadsheet,
  Users2,
  Image as ImageIcon,
  MapPin,
  FileCheck2,
  DownloadCloud,
  UserCog,
  Settings,
  LogOut,
  Building2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const wasAdmin = isAdmin;
    await logout();
    navigate(wasAdmin ? '/admin/login' : '/staff/login');
  };

  const navItems = isAdmin
    ? [
        { name: '11 Beats Dashboard', kannada: '೧೧ ಬೀಟ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Register House', kannada: 'ಹೊಸ ಮನೆ ನೋಂದಣಿ', path: '/register-house', icon: Building2 },
        { name: 'House Records', kannada: 'ಎಲ್ಲಾ ಮನೆ ದಾಖಲೆಗಳು', path: '/houses', icon: Home },
        { name: 'Owner Details', kannada: 'ಮಾಲೀಕರ ವಿವರಗಳು', path: '/owners', icon: User },
        { name: 'Family Members', kannada: 'ಕುಟುಂಬ ಸದಸ್ಯರು', path: '/family', icon: Users2 },
        { name: 'Photo Gallery', kannada: 'ಫೋಟೋ ಗ್ಯಾಲರಿ', path: '/gallery', icon: ImageIcon },
        { name: 'GPS & Map View', kannada: 'ಜಿಪಿಎಸ್ ನಕ್ಷೆ', path: '/map', icon: MapPin },
        { name: 'Registration Summary', kannada: 'ನೋಂದಣಿ ಸಾರಾಂಶ', path: '/summary', icon: FileCheck2 },
        { name: 'Export Reports', kannada: 'ವರದಿಗಳು (PDF/Excel)', path: '/exports', icon: DownloadCloud },
        { name: 'Staff & Access Control', kannada: 'ಸಿಬ್ಬಂದಿ ನಿರ್ವಹಣೆ & ಅನುಮೋದನೆ', path: '/users', icon: UserCog },
        { name: 'Backup & Restore', kannada: 'ಬ್ಯಾಕ್‌ಅಪ್ & ಮರುಸ್ಥಾಪನೆ', path: '/backup', icon: Database },
        { name: 'Settings', kannada: 'ಸಂಯೋಜನೆಗಳು', path: '/settings', icon: Settings },
        { name: 'Public Portal', kannada: 'ಮುಖ್ಯ ಪುಟ', path: '/', icon: ShieldCheck }
      ]
    : [
        { name: 'Staff Dashboard', kannada: 'ನನ್ನ ಬೀಟ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', path: '/staff/dashboard', icon: LayoutDashboard },
        { name: 'Register House', kannada: 'ಹೊಸ ಮನೆ ನೋಂದಣಿ', path: '/register-house', icon: Building2 },
        { name: 'My Beat Records', kannada: 'ಬೀಟ್ ಮನೆ ದಾಖಲೆಗಳು', path: '/houses', icon: Home },
        { name: 'Owner Details', kannada: 'ಮಾಲೀಕರ ವಿವರಗಳು', path: '/owners', icon: User },
        { name: 'Family Members', kannada: 'ಕುಟುಂಬ ಸದಸ್ಯರು', path: '/family', icon: Users2 },
        { name: 'Photo Gallery', kannada: 'ಫೋಟೋ ಗ್ಯಾಲರಿ', path: '/gallery', icon: ImageIcon },
        { name: 'GPS & Map View', kannada: 'ಜಿಪಿಎಸ್ ನಕ್ಷೆ', path: '/map', icon: MapPin },
        { name: 'Registration Summary', kannada: 'ನೋಂದಣಿ ಸಾರಾಂಶ', path: '/summary', icon: FileCheck2 },
        { name: 'Public Portal', kannada: 'ಮುಖ್ಯ ಪುಟ', path: '/', icon: ShieldCheck }
      ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-inner flex-shrink-0">
              🛡️
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-extrabold text-sm text-white tracking-tight">
                  ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್
                </span>
                <span className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">
                  MANE MANEGE POLICE
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all group ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
                title={isCollapsed ? `${item.name} (${item.kannada})` : undefined}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isCollapsed ? '' : 'mr-3'
                  }`}
                />
                {!isCollapsed && (
                  <div className="truncate flex flex-col leading-tight">
                    <span className="truncate">{item.name}</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-slate-300 font-normal">
                      {item.kannada}
                    </span>
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User profile card & logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-blue-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <p className="text-xs font-semibold text-white truncate">{user?.fullName || 'Registry User'}</p>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/50">
                      {user?.role || 'staff'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
