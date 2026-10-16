import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading records...', size = 'default' }) => {
  const iconSize = size === 'small' ? 'w-5 h-5' : size === 'large' ? 'w-10 h-10' : 'w-7 h-7';

  return (
    <div className="flex flex-col items-center justify-center p-8 text-slate-500">
      <Loader2 className={`${iconSize} animate-spin text-blue-600 mb-2`} />
      {message && <p className="text-sm font-medium tracking-wide text-slate-600">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
