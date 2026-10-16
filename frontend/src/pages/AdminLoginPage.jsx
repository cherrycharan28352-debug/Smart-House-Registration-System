import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Lock, User, AlertCircle, KeyRound, ArrowLeft, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login({ username, password, portalType: 'admin' });
      toast.success('ನಿರ್ವಾಹಕರ ದೃಢೀಕರಣ ಯಶಸ್ವಿಯಾಗಿದೆ / Admin Authentication Successful!');
      navigate(from, { replace: true });
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top navigation row */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 mb-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          ಮುಖಪುಟ / Home
        </Link>

        <Link
          to="/staff/login"
          className="inline-flex items-center text-xs font-bold text-blue-400 hover:text-blue-300 transition"
        >
          <UserCheck className="w-4 h-4 mr-1.5" />
          ಸಿಬ್ಬಂದಿ ಲಾಗಿನ್ / Staff Login &rarr;
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/20 border border-amber-300/40">
            🛡️
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-black text-white tracking-tight">
          ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್
        </h2>
        <div className="mt-1 flex items-center justify-center space-x-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
            ನಿರ್ವಾಹಕರ ಪ್ರವೇಶ • Admin Portal
          </span>
        </div>
        <p className="mt-1 text-center text-xs text-slate-400">
          ಪೊಲೀಸ್ ಠಾಣಾ ಆಡಳಿತಾಧಿಕಾರಿಗಳ ಅಧಿಕೃತ ಲಾಗಿನ್
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                ನಿರ್ವಾಹಕರ ಬಳಕೆದಾರ ಹೆಸರು ಅಥವಾ ಇಮೇಲ್ / Admin Username or Email
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or admin@police.karnataka.gov.in"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                ಪಾಸ್‌ವರ್ಡ್ / Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    ದೃಢೀಕರಿಸಲಾಗುತ್ತಿದೆ / Authenticating...
                  </span>
                ) : (
                  <span className="inline-flex items-center">
                    <KeyRound className="w-4 h-4 mr-2" />
                    ನಿರ್ವಾಹಕರ ಲಾಗಿನ್ / Admin Login
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Alternative login portal link */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              ನೀವು ಬೀಟ್ ಪೊಲೀಸ್ ಸಿಬ್ಬಂದಿಯಾಗಿದ್ದೀರಾ?
            </p>
            <Link
              to="/staff/login"
              className="mt-2 inline-flex items-center px-4 py-2 text-xs font-bold text-blue-400 hover:text-white bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/60 rounded-xl transition"
            >
              <UserCheck className="w-3.5 h-3.5 mr-1.5" />
              ಸಿಬ್ಬಂದಿ ಲಾಗಿನ್ ಪೋರ್ಟಲ್‌ಗೆ ಹೋಗಿ / Switch to Staff Login
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಇಲಾಖೆ • Administrative access is restricted and audit-logged under IT Act.
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
