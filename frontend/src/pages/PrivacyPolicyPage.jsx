import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Lock, Database, Eye, FileText, CheckCircle2 } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Go to Homepage"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-sm">
              🛡️
            </div>
            <div>
              <h1 className="text-sm font-black text-white">ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್</h1>
              <p className="text-[10px] text-slate-400">Mane Manege Police Registry</p>
            </div>
          </div>
        </div>

        <Link
          to="/"
          className="text-xs font-bold text-amber-400 hover:text-amber-300 transition"
        >
          ಮುಖಪುಟ / Home
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-10 space-y-8">
        <div className="space-y-3 text-center sm:text-left border-b border-slate-800 pb-6">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>ಅಧಿಕೃತ ಗೌಪ್ಯತಾ ನೀತಿ • Official Privacy Policy</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            ಗೌಪ್ಯತಾ ನೀತಿ ಮತ್ತು ದತ್ತಾಂಶ ಸಂರಕ್ಷಣೆ (Privacy Policy)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            ಕೊನೆಯ ನವೀಕರಣ / Last Updated: October 2026 • Karnataka State Police Survey Initiative
          </p>
        </div>

        {/* Section 1: Introduction */}
        <section className="space-y-3 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <h3 className="text-lg font-bold text-amber-400 flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>೧. ಪರಿಚಯ ಮತ್ತು ಉದ್ದೇಶ / 1. Introduction &amp; Purpose</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಇಲಾಖೆಯ <strong>"ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್" (Mane Manege Police)</strong> ಅಪ್ಲಿಕೇಶನ್ ನಾಗರಿಕರ ರಕ್ಷಣೆ, ಅಪರಾಧ ತಡೆಗಟ್ಟುವಿಕೆ, ಹಿರಿಯ ನಾಗರಿಕರು ಮತ್ತು ದುರ್ಬಲ ವರ್ಗಗಳ ಸುರಕ್ಷತೆಗಾಗಿ ಮನೆಗಳ ಪರಿಶೀಲನೆ ಹಾಗೂ ಅಧಿಕೃತ ದತ್ತಾಂಶ ಸಂಗ್ರಹಣೆ ಮಾಡುವ ಆಡಳಿತಾತ್ಮಕ ತಂತ್ರಾಂಶವಾಗಿದೆ. ಈ ನೀತಿಯು ನಾಗರಿಕರ ದತ್ತಾಂಶವನ್ನು ಹೇಗೆ ಸುರಕ್ಷಿತವಾಗಿ ಸಂಗ್ರಹಿಸಲಾಗುತ್ತದೆ ಮತ್ತು ನಿರ್ವಹಿಸಲಾಗುತ್ತದೆ ಎಂಬುದನ್ನು ವಿವರಿಸುತ್ತದೆ.
          </p>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            The "Mane Manege Police" application is deployed for official policing purposes including community safety, senior citizen monitoring, emergency response, and verified household registry across official police beats.
          </p>
        </section>

        {/* Section 2: Data Collected */}
        <section className="space-y-4 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <h3 className="text-lg font-bold text-amber-400 flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>೨. ಸಂಗ್ರಹಿಸಲಾಗುವ ವಿವರಗಳು / 2. Information We Collect</span>
          </h3>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
            <li className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>ಮನೆಯ ಮಾಹಿತಿ:</strong> ಮನೆ ಸಂಖ್ಯೆ, ಗ್ರಾಮ/ಬಡಾವಣೆ, ಬೀಟ್ ಸಂಖ್ಯೆ, ತಾಲೂಕು, ಜಿಲ್ಲೆ ಮತ್ತು ನಿವಾಸ ಪ್ರಕಾರ (ಸ್ವಂತ/ಬಾಡಿಗೆ).</span>
            </li>
            <li className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>ಕುಟುಂಬ ಸದಸ್ಯರ ವಿವರಗಳು:</strong> ಹೆಸರು, ವಯಸ್ಸು, ಲಿಂಗ, ವೃತ್ತಿ, ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಮತ್ತು ತುರ್ತು ಸಂಪರ್ಕ ವಿವರಗಳು.</span>
            </li>
            <li className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>ಸ್ಥಳದ ಜಿಪಿಎಸ್ ನಿರ್ದೇಶಾಂಕಗಳು (GPS Location):</strong> ತುರ್ತು ಸಮಯದಲ್ಲಿ ಪೊಲೀಸರು ತಕ್ಷಣ ಮನೆ ತಲುಪಲು ಅಧಿಕೃತ ಅನುಮತಿಯೊಂದಿಗೆ ಜಿಪಿಎಸ್ ಅಕ್ಷಾಂಶ/ರೇಖಾಂಶ ಸಂಗ್ರಹಿಸಲಾಗುತ್ತದೆ.</span>
            </li>
            <li className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>ಮನೆಯ ಛಾಯಾಚಿತ್ರಗಳು:</strong> ಮನೆ ಗುರುತಿಸುವಿಕೆಗಾಗಿ ಮುಂಭಾಗದ ಭಾವಚಿತ್ರ (ಐಚ್ಛಿಕ).</span>
            </li>
            <li className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>ಸುರಕ್ಷತಾ ಸಮೀಕ್ಷೆ:</strong> ಸಿಸಿಟಿವಿ ಕ್ಯಾಮೆರಾ, ಭದ್ರತಾ ಸಿಬ್ಬಂದಿ ಲಭ್ಯತೆ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆಗಳ ವಿವರಗಳು.</span>
            </li>
          </ul>
        </section>

        {/* Section 3: Data Protection & Access Control */}
        <section className="space-y-3 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <h3 className="text-lg font-bold text-amber-400 flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>೩. ದತ್ತಾಂಶ ಭದ್ರತೆ ಮತ್ತು ಪ್ರವೇಶ ನಿಯಂತ್ರಣ / 3. Data Protection &amp; Security</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            ಸಂಗ್ರಹಿಸಲಾದ ಎಲ್ಲಾ ದಾಖಲೆಗಳನ್ನು ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಲಾದ ಕ್ಲೌಡ್ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿರಿಸಲಾಗುತ್ತದೆ. ಯಾವುದೇ ಸಾರ್ವಜನಿಕ ಬಳಕೆದಾರರಿಗೆ ನಾಗರಿಕರ ಖಾಸಗಿ ವಿವರಗಳು ಕಾಣಿಸುವುದಿಲ್ಲ.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <strong className="text-white">Role-Based Access Control (RBAC):</strong>
              <p className="text-slate-400">
                ಪ್ರತಿಯೊಬ್ಬ ಬೀಟ್ ಅಧಿಕಾರಿಯು ಕೇವಲ ತಮಗೆ ವಹಿಸಲಾದ ಬೀಟ್ ಮತ್ತು ಗ್ರಾಮಗಳ ದಾಖಲೆಗಳನ್ನು ಮಾತ್ರ ವೀಕ್ಷಿಸಲು ಸಾಧ್ಯ.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <strong className="text-white">Zero Third-Party Sharing:</strong>
              <p className="text-slate-400">
                ಯಾವುದೇ ಖಾಸಗಿ ಸಂಸ್ಥೆಗಳಿಗೆ ಅಥವಾ ಜಾಹೀರಾತುದಾರರಿಗೆ ದತ್ತಾಂಶವನ್ನು ಮಾರಾಟ ಮಾಡಲಾಗುವುದಿಲ್ಲ ಅಥವಾ ಹಂಚಿಕೊಳ್ಳಲಾಗುವುದಿಲ್ಲ.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Device Permissions */}
        <section className="space-y-3 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <h3 className="text-lg font-bold text-amber-400 flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>೪. ಮೊಬೈಲ್ ಸಾಧನ ಅನುಮತಿಗಳು / 4. Device Permissions</span>
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
            <li>• <strong>ಸ್ಥಳ ಅನುಮತಿ (Location Permission):</strong> ನಿಖರವಾದ ಜಿಪಿಎಸ್ ಗುರುತಿಸುವಿಕೆಗಾಗಿ ಮಾತ್ರ.</li>
            <li>• <strong>ಕ್ಯಾಮೆರಾ/ಸ್ಟೋರೇಜ್ ಅನುಮತಿ (Camera / Photos):</strong> ಮನೆಯ ಭಾವಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಮಾತ್ರ.</li>
            <li>• <strong>ನೆಟ್‌ವರ್ಕ್ ಅನುಮತಿ (Internet Access):</strong> ದತ್ತಾಂಶವನ್ನು ಸರ್ವರ್‌ಗೆ ಕಳುಹಿಸಲು.</li>
          </ul>
        </section>

        {/* Section 5: Contact Information */}
        <section className="space-y-3 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <h3 className="text-lg font-bold text-amber-400">
            ೫. ಸಂಪರ್ಕ ಮತ್ತು ಸಹಾಯವಾಣಿ / 5. Contact &amp; Support
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            ಈ ಗೌಪ್ಯತಾ ನೀತಿಯ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳು ಅಥವಾ ಸ್ಪಷ್ಟೀಕರಣಗಳಿದ್ದಲ್ಲಿ, ದಯವಿಟ್ಟು ನಿಮ್ಮ ವ್ಯಾಪ್ತಿಯ ಪೊಲೀಸ್ ಠಾಣೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ:
          </p>
          <div className="p-4 rounded-2xl bg-slate-800/90 text-xs text-slate-300 space-y-1">
            <p><strong>ಇಲಾಖೆ:</strong> ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಇಲಾಖೆ (Karnataka State Police)</p>
            <p><strong>ತುರ್ತು ಸಹಾಯವಾಣಿ:</strong> 112 (24x7 Emergency)</p>
            <p><strong>ವೆಬ್‌ಸೈಟ್:</strong> https://smart-house-registration-system.vercel.app</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-6 px-4 text-center text-xs text-slate-500">
        © 2026 ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್ • Karnataka State Police • All Rights Reserved.
      </footer>
    </div>
  );
};

export default PrivacyPolicyPage;
