import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="w-20 h-20 bg-blue-600/20 text-blue-400 rounded-3xl border border-blue-500/30 flex items-center justify-center text-4xl mb-6 shadow-2xl">
        🏛️
      </div>

      <h1 className="text-6xl font-black tracking-tight text-white mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-200 mb-2">Registration Page Not Found</h2>
      <p className="text-xs text-slate-400 max-w-md mb-8">
        The requested record, dossier route, or resource path could not be located in the municipal registry system.
      </p>

      <div className="flex items-center space-x-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg transition"
        >
          <Home className="w-4 h-4 mr-2" />
          Return to Dashboard
        </Link>
        <Link
          to="/houses"
          className="inline-flex items-center px-4 py-2.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          House Records
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
