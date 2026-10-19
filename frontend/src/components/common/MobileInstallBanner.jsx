import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';
import InstallAppModal from './InstallAppModal';

const MobileInstallBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(isStandaloneMode);

    const isDismissed = sessionStorage.getItem('mmp_install_banner_dismissed');
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('mmp_install_banner_dismissed', 'true');
  };

  if (isStandalone || dismissed) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-md z-40 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 border border-amber-500/40 rounded-2xl p-3.5 shadow-2xl shadow-black/60 flex items-center justify-between space-x-3 text-slate-100 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold text-lg shrink-0 shadow-md border border-amber-300">
            🛡️
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-white truncate">
              ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್ ಆಪ್
            </h4>
            <p className="text-[11px] text-amber-300 truncate">
              Download App for Easy Access
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setModalOpen(true)}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-md transition flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <InstallAppModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default MobileInstallBanner;
