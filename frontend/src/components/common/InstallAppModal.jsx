import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  Share2,
  PlusSquare,
  X,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

const InstallAppModal = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' or 'apk'

  useEffect(() => {
    // Check if already installed / running as PWA
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // Listen for beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredInstallPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.deferredInstallPrompt) {
      setDeferredPrompt(window.deferredInstallPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
      }
      setDeferredPrompt(null);
      window.deferredInstallPrompt = null;
      onClose();
    } else if (isIOS) {
      // iOS doesn't support programmatic prompt, instructions shown in modal
    } else {
      // Direct instructions for Android/Chrome
      alert(
        'ಆಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಲು:\n1. ಬ್ರೌಸರ್ ಮೆನು (⋮) ಅನ್ನು ಒತ್ತಿರಿ\n2. "Add to Home screen" ಅಥವಾ "Install app" ಆಯ್ಕೆಮಾಡಿ.\n\nTo install:\n1. Tap the browser menu (⋮)\n2. Select "Add to Home screen" or "Install App"'
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Header with Police Shield Accent */}
        <div className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg border border-amber-300">
              🛡️
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" />
                <span>ಅಧಿಕೃತ ಮೊಬೈಲ್ ಆಪ್ / Official App</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್
              </h2>
              <p className="text-xs text-slate-300">
                Mane Manege Police — Android &amp; iOS Mobile App
              </p>
            </div>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-bold">
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-3 px-4 text-center flex items-center justify-center space-x-2 transition ${
              activeTab === 'direct'
                ? 'text-amber-400 border-b-2 border-amber-400 bg-slate-800/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>1-Click Install (ರೆಕಮೆಂಡೆಡ್)</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-3 px-4 text-center flex items-center justify-center space-x-2 transition ${
              activeTab === 'apk'
                ? 'text-amber-400 border-b-2 border-amber-400 bg-slate-800/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Android APK Package</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {isStandalone ? (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-emerald-300">
                ಅಪ್ಲಿಕೇಶನ್ ಈಗಾಗಲೇ ಸ್ಥಾಪಿಸಲಾಗಿದೆ! / App Already Installed!
              </h3>
              <p className="text-xs text-emerald-200/80">
                ನೀವು ಈ ಅಪ್ಲಿಕೇಶನ್ ಅನ್ನು ಅಧಿಕೃತ ಮೊಬೈಲ್ ಮೋಡ್‌ನಲ್ಲಿ ಬಳಸುತ್ತಿದ್ದೀರಿ.
              </p>
            </div>
          ) : activeTab === 'direct' ? (
            <>
              {/* Features Pill List */}
              <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-300">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ಯಾವುದೇ Play Store ಶುಲ್ಕವಿಲ್ಲ</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ಆಫ್‌ಲೈನ್ ಹಾಗೂ ವೇಗದ ಕೆಲಸ</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ಫುಲ್ ಸ್ಕ್ರೀನ್ ಮೊಬೈಲ್ ಮೋಡ್</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ಆಟೋಮ್ಯಾಟಿಕ್ ಅಪ್‌ಡೇಟ್‌ಗಳು</span>
                </div>
              </div>

              {/* Instructions per OS */}
              {isIOS ? (
                <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/60 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-blue-300">
                    <Smartphone className="w-4 h-4" />
                    <span>Apple iPhone / iPad ಇನ್‌ಸ್ಟಾಲೇಶನ್ ಸೂಚನೆಗಳು:</span>
                  </div>
                  <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside">
                    <li>
                      Safari ಬ್ರೌಸರ್‌ನ ಕೆಳಭಾಗದಲ್ಲಿರುವ{' '}
                      <strong className="text-amber-400">Share (ಹಂಚಿಕೊಳ್ಳಿ ⬆️)</strong> ಐಕಾನ್ ಒತ್ತಿರಿ.
                    </li>
                    <li>
                      ಸ್ವಲ್ಪ ಕೆಳಗೆ ಸ್ಕ್ರಾಲ್ ಮಾಡಿ{' '}
                      <strong className="text-amber-400">"Add to Home Screen (ಮುಖಪುಟಕ್ಕೆ ಸೇರಿಸಿ ➕)"</strong>{' '}
                      ಆಯ್ಕೆಮಾಡಿ.
                    </li>
                    <li>
                      ಮೇಲಿನ ಬಲಭಾಗದಲ್ಲಿರುವ{' '}
                      <strong className="text-emerald-400">Add (ಸೇರಿಸಿ)</strong> ಒತ್ತಿರಿ. ಅಪ್ಲಿಕೇಶನ್ ನಿಮ್ಮ ಸ್ಕ್ರೀನ್‌ನಲ್ಲಿ ಇನ್‌ಸ್ಟಾಲ್ ಆಗುತ್ತದೆ!
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    ಈ ಬಟನ್ ಒತ್ತಿದ ತಕ್ಷಣ ಅಪ್ಲಿಕೇಶನ್ ನಿಮ್ಮ ಮೊಬೈಲ್ ಮುಖಪುಟಕ್ಕೆ (Home Screen) ನೇರವಾಗಿ ಇನ್‌ಸ್ಟಾಲ್ ಆಗುತ್ತದೆ. ನಂತರ ಯಾವುದೇ ಬ್ರೌಸರ್ ಇಲ್ಲದೆ ನೇರ ಆಪ್ ರೀತಿಯಲ್ಲಿ ಬಳಸಬಹುದು.
                  </p>

                  <button
                    onClick={handleInstallClick}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2.5 transition-all transform active:scale-[0.99]"
                  >
                    <Download className="w-5 h-5" />
                    <span>ಈಗಲೇ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ / Download &amp; Install App</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            /* APK Download Tab */
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Google Play / PWABuilder Package</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  ನೀವು ಈ ವೆಬ್ ಆ್ಯಪ್ ಅನ್ನು ಅಧಿಕೃತ **Android APK** ಆಗಿ ಪರಿವರ್ತಿಸಲು Microsoft ನಿರ್ಮಿತ **PWABuilder** ಬಳಸಿ ಕೇವಲ 1 ಕ್ಲಿಕ್‌ನಲ್ಲಿ `.apk` ಅಥವಾ Google Play Store `.aab` ಪ್ಯಾಕೇಜ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿಕೊಳ್ಳಬಹುದು:
                </p>
                <div className="pt-2">
                  <a
                    href={`https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(
                      window.location.origin
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow transition"
                  >
                    <span>PWABuilder ನಲ್ಲಿ APK ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl text-slate-400 text-[11px] space-y-1">
                <p>
                  💡 <strong>ಗಮನಿಸಿ:</strong> ಮೇಲಿನ <strong>1-Click Install</strong> ಆಯ್ಕೆಯು ಯಾವುದೇ ಪ್ರತ್ಯೇಕ ಫೈಲ್ ಇಲ್ಲದೆ ಮೊಬೈಲ್‌ನಲ್ಲಿ ತಕ್ಷಣವೇ ಇನ್‌ಸ್ಟಾಲ್ ಆಗುವ ಅಧಿಕೃತ ಮಾರ್ಗವಾಗಿದೆ (Android &amp; iOS).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಇಲಾಖೆ</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 underline font-medium"
          >
            ಮುಚ್ಚಿ / Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallAppModal;
