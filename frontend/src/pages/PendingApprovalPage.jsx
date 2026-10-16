import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, ShieldAlert, RefreshCw, LogOut, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PendingApprovalPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/staff/login');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 text-slate-100 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl text-center space-y-6 relative z-10">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">
            ಖಾತೆ ಅನುಮೋದನೆ ಬಾಕಿ ಇದೆ
          </h2>
          <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Account Pending Administrator Approval
          </p>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          ನಿಮ್ಮ ಬೀಟ್ ಸಿಬ್ಬಂದಿ ನೋಂದಣಿ ಅರ್ಜಿಯನ್ನು ಸ್ವೀಕರಿಸಲಾಗಿದೆ. ಪೊಲೀಸ್ ಠಾಣೆಯ ಮುಖ್ಯ ನಿರ್ವಾಹಕರು (Admin) ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ ಅನುಮೋದಿಸಿದ ಬಳಿಕ ನೀವು ಸಮೀಕ್ಷಾ ದಾಖಲೆಗಳನ್ನು ವೀಕ್ಷಿಸಲು ಮತ್ತು ಹೊಸ ಮನೆಗಳನ್ನು ನೋಂದಾಯಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತದೆ.
        </p>

        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2 text-slate-300">
          <div className="flex justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400">ಸಿಬ್ಬಂದಿ ಹೆಸರು:</span>
            <span className="font-bold text-white">{user?.fullName || '—'}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400">ಸಿಬ್ಬಂದಿ ಐಡಿ:</span>
            <span className="font-mono text-blue-400 font-bold">{user?.staffId || '—'}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400">ಇಮೇಲ್:</span>
            <span className="text-white">{user?.email || '—'}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-slate-400">ಸ್ಥಿತಿ:</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Pending Approval
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRefresh}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ / Refresh Status
          </button>

          <button
            onClick={handleLogout}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition border border-slate-700"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            ಲಾಗ್‌ಔಟ್ / Logout
          </button>
        </div>

        <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500">
          ತುರ್ತು ಸಹಾಯ ಅಥವಾ ಅನುಮೋದನೆಗಾಗಿ ಠಾಣಾ ನಿರ್ವಾಹಕರನ್ನು ಸಂಪರ್ಕಿಸಿ.
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
