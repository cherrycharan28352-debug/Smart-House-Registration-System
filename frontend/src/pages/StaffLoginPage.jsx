import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Lock, User, AlertCircle, KeyRound, ArrowLeft, UserPlus, Clock, LockKeyhole } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const StaffLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingNotice, setPendingNotice] = useState(null);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/staff/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPendingNotice(null);
    setLoading(true);

    try {
      const res = await login({ username, password, portalType: 'staff' });
      toast.success('ಸಿಬ್ಬಂದಿ ಲಾಗಿನ್ ಯಶಸ್ವಿಯಾಗಿದೆ / Staff Login Successful!');
      navigate(from, { replace: true });
    } catch (err) {
      const respData = err.response?.data;
      if (respData?.accountStatus === 'pending') {
        setPendingNotice({
          message: respData.message,
          user: respData.user
        });
      } else {
        const errMsg = respData?.message || err.message || 'ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.';
        setError(errMsg);
        toast.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

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
          to="/admin/login"
          className="inline-flex items-center text-xs font-bold text-amber-400 hover:text-amber-300 transition"
        >
          <LockKeyhole className="w-3.5 h-3.5 mr-1" />
          ನಿರ್ವಾಹಕರ ಲಾಗಿನ್ / Admin Login &rarr;
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-3xl shadow-xl shadow-blue-500/20 border border-blue-400/30">
            👮
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-black text-white tracking-tight">
          ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್
        </h2>
        <div className="mt-1 flex items-center justify-center space-x-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
            ಸಿಬ್ಬಂದಿ ಲಾಗಿನ್ • Beat Staff Portal
          </span>
        </div>
        <p className="mt-1 text-center text-xs text-slate-400">
          ಬೀಟ್ ಗಸ್ತು ಪೊಲೀಸ್ ಅಧಿಕಾರಿಗಳ ಸಮೀಕ್ಷಾ ಪೋರ್ಟಲ್
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/80 py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          {pendingNotice ? (
            <div className="mb-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-3">
              <div className="flex items-center space-x-2 font-bold text-amber-300 text-sm">
                <Clock className="w-5 h-5 flex-shrink-0 text-amber-400 animate-pulse" />
                <span>ಅನುಮೋದನೆ ಬಾಕಿ ಇದೆ / Pending Admin Approval</span>
              </div>
              <p className="leading-relaxed">
                {pendingNotice.message}
              </p>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700 space-y-1 text-[11px] text-slate-300">
                <p><span className="text-slate-400 font-semibold">ಸಿಬ್ಬಂದಿ ಹೆಸರು:</span> {pendingNotice.user?.fullName || '—'}</p>
                <p><span className="text-slate-400 font-semibold">ಸಿಬ್ಬಂದಿ ಐಡಿ:</span> {pendingNotice.user?.staffId || '—'}</p>
                <p><span className="text-slate-400 font-semibold">ಸ್ಥಿತಿ:</span> <span className="text-amber-400 font-bold uppercase">Pending Verification</span></p>
              </div>
              <p className="text-[11px] text-slate-400">
                ಠಾಣೆಯ ಮುಖ್ಯ ನಿರ್ವಾಹಕರು (Admin) ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಅನುಮೋದಿಸಿದ ಬಳಿಕ ನೀವು ಲಾಗಿನ್ ಆಗಿ ಮನೆ ನೋಂದಣಿ ಮಾಡಬಹುದು.
              </p>
            </div>
          ) : error ? (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                ಸಿಬ್ಬಂದಿ ಐಡಿ / ಇಮೇಲ್ / ಬಳಕೆದಾರ ಹೆಸರು (Staff ID / Email)
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
                  placeholder="e.g. BEAT-OFFICER-01 or staff@police.karnataka.gov.in"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    ದೃಢೀಕರಿಸಲಾಗುತ್ತಿದೆ / Authenticating...
                  </span>
                ) : (
                  <span className="inline-flex items-center">
                    <KeyRound className="w-4 h-4 mr-2" />
                    ಸಿಬ್ಬಂದಿ ಲಾಗಿನ್ / Staff Login
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* New Staff Registration Link */}
          <div className="mt-6 pt-5 border-t border-slate-700/80 text-center space-y-2">
            <p className="text-xs text-slate-400">
              ಹೊಸ ಬೀಟ್ ಪೊಲೀಸ್ ಅಧಿಕಾರಿಯೇ? ಖಾತೆ ಇಲ್ಲವೇ?
            </p>
            <Link
              to="/staff/register"
              className="w-full inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl transition shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              ಹೊಸ ಸಿಬ್ಬಂದಿ ನೋಂದಣಿ / Register New Staff Account
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಇಲಾಖೆ • Unauthorized access will be prosecuted under the IT Act.
        </p>
      </div>
    </div>
  );
};

export default StaffLoginPage;
