import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import InstallAppModal from './InstallAppModal';

const InstallAppButton = ({ className = '', variant = 'primary' }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const baseStyle =
    variant === 'header'
      ? 'inline-flex items-center px-3 py-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md shadow-amber-500/10 transition-all transform hover:-translate-y-0.5'
      : variant === 'navbar'
      ? 'inline-flex items-center px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition'
      : 'inline-flex items-center px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 rounded-xl shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5';

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`${baseStyle} ${className}`}
        title="Download and Install Mobile App"
      >
        <Smartphone className="w-3.5 h-3.5 mr-1.5 animate-bounce" />
        <span>ಆಪ್ ಡೌನ್‌ಲೋಡ್ / Install App</span>
      </button>

      <InstallAppModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default InstallAppButton;
