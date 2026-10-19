import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  Phone,
  Home,
  Users,
  MapPin,
  Lock,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileCheck,
  EyeOff,
  Clock,
  Download
} from 'lucide-react';
import InstallAppButton from '../components/common/InstallAppButton';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-900">
      {/* Top Police Administration Bar */}
      <div className="bg-slate-950 border-b border-slate-800 text-slate-300 text-xs py-2 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-300">
            ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಇಲಾಖೆ • Karnataka State Police
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-amber-400 font-bold">
            ತುರ್ತು ಸಹಾಯವಾಣಿ: 112 (Emergency 24x7)
          </span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <InstallAppButton variant="header" className="hidden md:inline-flex text-[11px] py-1" />
          <Link
            to="/staff/login"
            className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition"
          >
            <Users className="w-3 h-3 mr-1" />
            Staff Login / ಸಿಬ್ಬಂದಿ ಲಾಗಿನ್
          </Link>
          <Link
            to="/admin/login"
            className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition"
          >
            <Lock className="w-3 h-3 mr-1" />
            Admin Login / ನಿರ್ವಾಹಕರ ಲಾಗಿನ್
          </Link>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/20 border border-amber-300/40">
            🛡️
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center">
              ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್
              <span className="ml-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Mane Manege Police
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              ಗೃಹ ಭೇಟಿ, ನಾಗರಿಕರ ಸುರಕ್ಷತೆ ಮತ್ತು ಜನಗಣತಿ ಸಮೀಕ್ಷಾ ಪೋರ್ಟಲ್
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <InstallAppButton variant="header" />
          <Link
            to="/staff/login"
            className="inline-flex items-center px-3.5 py-2 text-xs font-extrabold text-blue-200 bg-blue-950 hover:bg-blue-900 border border-blue-700/60 rounded-xl transition shadow-sm"
          >
            <Users className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
            ಸಿಬ್ಬಂದಿ ಲಾಗಿನ್
          </Link>
          <Link
            to="/admin/login"
            className="inline-flex items-center px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-md transition"
          >
            <Lock className="w-3.5 h-3.5 mr-1.5 text-slate-900" />
            ನಿರ್ವಾಹಕರ ಲಾಗಿನ್
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-8 border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-amber-400 text-xs font-bold shadow-inner">
            <ShieldCheck className="w-4 h-4 mr-1.5 text-amber-400" />
            ಕರ್ನಾಟಕ ಪೊಲೀಸ್ ಇಲಾಖೆಯ ಅಧಿಕೃತ ಮನೆ ಮನೆ ಸಮೀಕ್ಷಾ ಅಭಿಯಾನ
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್
          </h2>

          <p className="text-lg sm:text-2xl font-bold text-amber-400 max-w-3xl mx-auto leading-relaxed">
            ಮನೆ ಮನೆಗೆ ಭೇಟಿ ನೀಡಿ ಕುಟುಂಬ ಮತ್ತು ಮನೆಗಳ ವಿವರಗಳ ನೋಂದಣಿ ವ್ಯವಸ್ಥೆ
          </p>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            ನಾಗರಿಕರ ಸುರಕ್ಷತೆ, ಅಪರಾಧ ತಡೆಗಟ್ಟುವಿಕೆ, ಹಿರಿಯ ನಾಗರಿಕರ ರಕ್ಷಣೆ ಮತ್ತು ಆಪತ್ಕಾಲೀನ ಸಹಾಯಕ್ಕಾಗಿ ೧೧ (11) ಪೊಲೀಸ್ ಬೀಟ್‌ಗಳ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಮನೆಗಳ ಪರಿಶೀಲನೆ ಮತ್ತು ಕುಟುಂಬ ಸದಸ್ಯರ ಅಧಿಕೃತ ನೋಂದಣಿ ವ್ಯವಸ್ಥೆ.
          </p>

          {/* Action Buttons: Separate Admin and Staff options + App Download */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <InstallAppButton
              variant="primary"
              className="w-full sm:w-auto px-6 py-3.5 text-xs sm:text-sm font-extrabold shadow-amber-500/30"
            />

            <Link
              to="/admin/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-xs sm:text-sm font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-500 rounded-2xl shadow-xl shadow-amber-500/20 transition-transform active:scale-95"
            >
              <Lock className="w-4 h-4 mr-2" />
              ನಿರ್ವಾಹಕರ ಲಾಗಿನ್ / Admin Portal
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              to="/staff/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl shadow-xl shadow-blue-600/20 transition-transform active:scale-95"
            >
              <Users className="w-4 h-4 mr-2" />
              ಸಿಬ್ಬಂದಿ ಲಾಗಿನ್ / Staff Login
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              to="/staff/register"
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3.5 text-xs sm:text-sm font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl transition"
            >
              ಸಿಬ್ಬಂದಿ ನೋಂದಣಿ / Register Staff
            </Link>
          </div>

          {/* Privacy Protection Banner */}
          <div className="mt-8 inline-flex items-center px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400 max-w-xl mx-auto">
            <EyeOff className="w-4 h-4 mr-2 text-amber-400 flex-shrink-0" />
            <span>
              ಗೌಪ್ಯತೆ ರಕ್ಷಣೆ: ನಾಗರಿಕರ ವೈಯಕ್ತಿಕ ವಿವರಗಳು ಮತ್ತು ಮನೆಯ ಮಾಹಿತಿಯು ಕೇವಲ ಅಧಿಕೃತ ಪೊಲೀಸ್ ಅಧಿಕಾರಿಗಳಿಗೆ ಮಾತ್ರ ಲಭ್ಯವಿರುತ್ತದೆ. ಸಾರ್ವಜನಿಕ ಪ್ರವೇಶವನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ.
            </span>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Community Policing */}
      <section id="about" className="py-16 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            POLICE BEAT SURVEILLANCE & CITIZEN SAFETY
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            ಯೋಜನೆಯ ಪ್ರಮುಖ ಉದ್ದೇಶಗಳು ಮತ್ತು ಸೇವೆಗಳು
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            ಪೊಲೀಸ್ ಮತ್ತು ಸಾರ್ವಜನಿಕರ ನಡುವೆ ಉತ್ತಮ ಬಾಂಧವ್ಯ ಬೆಳೆಸಲು ಮತ್ತು ಬೀಟ್ ವ್ಯವಸ್ಥೆಯ ಮೂಲಕ ಗ್ರಾಮಗಳ ಸುರಕ್ಷತೆ ಒದಗಿಸಲು ಈ ತಂತ್ರಜ್ಞಾನ ವ್ಯವಸ್ಥೆಯನ್ನು ಅಭಿವೃದ್ಧಿಪಡಿಸಲಾಗಿದೆ.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-slate-800/60 border border-slate-700/80 p-6 rounded-3xl hover:border-amber-400/50 transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center font-bold text-xl">
              🏘️
            </div>
            <h4 className="text-base font-bold text-white">
              ೧೧ ಬೀಟ್‌ಗಳ ಆಡಳಿತ ವ್ಯಾಪ್ತಿ
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              ಪ್ರತಿಯೊಂದು ಠಾಣಾ ವ್ಯಾಪ್ತಿಯನ್ನು ೧೧ (Beat 01 to Beat 11) ಸುಸಜ್ಜಿತ ಬೀಟ್‌ಗಳಾಗಿ ವಿಭಾಗಿಸಿ ಗ್ರಾಮವಾರು ಸಮೀಕ್ಷೆ ನಡೆಸಲಾಗುತ್ತದೆ.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-800/60 border border-slate-700/80 p-6 rounded-3xl hover:border-amber-400/50 transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center font-bold text-xl">
              📍
            </div>
            <h4 className="text-base font-bold text-white">
              GPS ಲೊಕೇಶನ್ ಮ್ಯಾಪಿಂಗ್
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              ಪ್ರತಿ ಮನೆಯ ನಿಖರವಾದ ಜಿಪಿಎಸ್ ಅಕ್ಷಾಂಶ-ರೇಖಾಂಶಗಳನ್ನು ನಕ್ಷೆಯಲ್ಲಿ ಗುರುತಿಸಿ ಆಪತ್ಕಾಲೀನ ಸಂದರ್ಭದಲ್ಲಿ ಕ್ಷಿಪ್ರ ಸಹಾಯಕ್ಕೆ ಬಳಸಲಾಗುತ್ತದೆ.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-800/60 border border-slate-700/80 p-6 rounded-3xl hover:border-amber-400/50 transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center font-bold text-xl">
              👥
            </div>
            <h4 className="text-base font-bold text-white">
              ಕುಟುಂಬ ಸದಸ್ಯರ ಸಮೀಕ್ಷೆ
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              ಮನೆಯಲ್ಲಿ ವಾಸಿಸುವ ಸದಸ್ಯರು, ಉದ್ಯೋಗ, ಹಿರಿಯ ನಾಗರಿಕರು ಮತ್ತು ವಿಶೇಷ ಅಗತ್ಯತೆಯ ವಿವರಗಳನ್ನು ಸಮೀಕ್ಷೆಯಲ್ಲಿ ದಾಖಲಿಸಲಾಗುತ್ತದೆ.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-slate-800/60 border border-slate-700/80 p-6 rounded-3xl hover:border-amber-400/50 transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-400/30 flex items-center justify-center font-bold text-xl">
              🚨
            </div>
            <h4 className="text-base font-bold text-white">
              ತುರ್ತು ಸ್ಪಂದನ ೧೧೨
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              ಯಾವುದೇ ಅಹಿತಕರ ಘಟನೆ ಅಥವಾ ಸಹಾಯಕ್ಕಾಗಿ ತುರ್ತು ಸಹಾಯವಾಣಿ ೧೧೨ ಗೆ ಕರೆ ಮಾಡಿ ನಿಮ್ಮ ಬೀಟ್ ಅಧಿಕಾರಿಯ ನೇರ ನೆರವು ಪಡೆಯಿರಿ.
            </p>
          </div>
        </div>
      </section>

      {/* 11 Beats Preview List (Public View: Shows only jurisdiction names, no private records) */}
      <section className="py-14 px-4 sm:px-8 bg-slate-950 border-t border-b border-slate-800">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                OFFICIAL JURISDICTION SUMMARY
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                ಠಾಣಾ ವ್ಯಾಪ್ತಿಯ ೧೧ ಬೀಟ್‌ಗಳ ಪಟ್ಟಿ (Beat 01 - Beat 11)
              </h3>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center text-xs font-bold text-amber-400 hover:text-amber-300 transition"
            >
              ನಿರ್ವಾಹಕರಾಗಿ ಲಾಗಿನ್ ಆಗಿ ಗ್ರಾಮವಾರು ವಿವರಗಳನ್ನು ನೋಡಿ &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { num: 'Beat 01', kn: 'ಕೇಂದ್ರ ಬೀಟ್ ೦೧' },
              { num: 'Beat 02', kn: 'ಉತ್ತರ ಮಾರುಕಟ್ಟೆ ೦೨' },
              { num: 'Beat 03', kn: 'ಪೂರ್ವ ಕೆರೆ ವಲಯ ೦೩' },
              { num: 'Beat 04', kn: 'ದಕ್ಷಿಣ ತಾಂತ್ರಿಕ ೦೪' },
              { num: 'Beat 05', kn: 'ಪಶ್ಚಿಮ ಪರಂಪರೆ ೦೫' },
              { num: 'Beat 06', kn: 'ಕೈಗಾರಿಕಾ ಪ್ರದೇಶ ೦೬' },
              { num: 'Beat 07', kn: 'ಗ್ರಾಮೀಣ ಹೊರವಲಯ ೦೭' },
              { num: 'Beat 08', kn: 'ಹೆದ್ದಾರಿ ಗಸ್ತು ೦೮' },
              { num: 'Beat 09', kn: 'ನದೀತೀರ ವಲಯ ೦೯' },
              { num: 'Beat 10', kn: 'ಬೆಟ್ಟದ ವಸತಿ ೧೦' },
              { num: 'Beat 11', kn: 'ಉಪನಗರ ಪ್ರವೇಶ ೧೧' }
            ].map((b) => (
              <div
                key={b.num}
                className="bg-slate-900 border border-slate-800 p-3 rounded-2xl text-center space-y-1 hover:border-amber-400/40 transition"
              >
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full inline-block">
                  {b.num}
                </span>
                <p className="text-xs font-bold text-white truncate">{b.kn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Assistance Footer */}
      <footer className="mt-auto bg-slate-950 py-10 px-4 sm:px-8 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <p className="font-extrabold text-white text-sm">
                ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್ • Mane Manege Police
              </p>
              <p className="text-[11px] text-slate-500">
                ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಇಲಾಖೆಯ ಸಮಗ್ರ ಬೀಟ್ ನಿರ್ವಹಣಾ ಮತ್ತು ಸಮೀಕ್ಷಾ ತಂತ್ರಾಂಶ
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center text-amber-400 font-bold">
              <Phone className="w-3.5 h-3.5 mr-1" />
              ತುರ್ತು ಸಹಾಯ: 112
            </div>
            <Link to="/privacy-policy" className="text-slate-300 hover:text-white font-semibold">
              ಗೌಪ್ಯತಾ ನೀತಿ / Privacy Policy
            </Link>
            <Link to="/login" className="text-slate-300 hover:text-white font-semibold">
              ನಿರ್ವಾಹಕರ ಪ್ರವೇಶ / Admin Portal
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-slate-800/60 text-center text-[11px] text-slate-500">
          © 2026 ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್ (Mane Manege Police) • ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಇಲಾಖೆ • All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
