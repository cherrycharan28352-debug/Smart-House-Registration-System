import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Home,
  Plus,
  Search,
  Eye,
  Edit,
  MapPin,
  Users,
  Clock,
  LogOut,
  RefreshCw,
  AlertCircle,
  FileCheck2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getHouses } from '../services/houseService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

const StaffDashboardPage = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const assignedBeats = user?.assignedBeats || [];
  const assignedVillages = user?.assignedVillages || [];

  const fetchAuthorizedHouses = async () => {
    setLoading(true);
    try {
      const res = await getHouses({
        page,
        limit: 10,
        search: searchTerm
      });
      setHouses(res.data || []);
      setPagination(res.pagination || { total: 0, totalPages: 1 });
    } catch (err) {
      toast.error('Failed to load authorized house survey records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthorizedHouses();
  }, [page, searchTerm]);

  const handleLogout = async () => {
    await logout();
    navigate('/staff/login');
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Officer Profile & Assigned Beats Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white border border-blue-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center text-3xl font-black shadow-lg flex-shrink-0">
              👮
            </div>
            <div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-extrabold uppercase border border-blue-400/30 mb-1">
                <ShieldCheck className="w-3 h-3 mr-1" />
                ಅಧಿಕೃತ ಬೀಟ್ ಪೊಲೀಸ್ ಅಧಿಕಾರಿ • Authorized Field Staff
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {user?.fullName || 'Beat Police Officer'}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
                <span><strong>ಸಿಬ್ಬಂದಿ ಐಡಿ / Staff ID:</strong> <span className="font-mono text-amber-400">{user?.staffId || '—'}</span></span>
                <span>•</span>
                <span><strong>ಮೊಬೈಲ್:</strong> {user?.mobileNumber || '—'}</span>
                <span>•</span>
                <span><strong>ಇಮೇಲ್:</strong> {user?.email || '—'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to={assignedBeats.length > 0 ? `/register-house?beat=${encodeURIComponent(assignedBeats[0])}` : '/register-house'}
              className="inline-flex items-center px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-2xl shadow-lg transition active:scale-95"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              ಹೊಸ ಮನೆ ನೋಂದಣಿ / Register House
            </Link>
          </div>
        </div>

        {/* Assigned Jurisdiction Box */}
        <div className="mt-6 pt-5 border-t border-blue-800/40">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-2 flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            ನಿಮಗೆ ನಿಯೋಜಿಸಲಾದ ಅಧಿಕೃತ ಕಾರ್ಯವ್ಯಾಪ್ತಿ (Assigned Beat & Village Jurisdiction)
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {assignedBeats.length === 0 ? (
              <span className="text-xs text-amber-300 italic bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
                ಇನ್ನೂ ಯಾವುದೇ ಬೀಟ್ ನಿಯೋಜಿಸಲಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಠಾಣಾ ನಿರ್ವಾಹಕರನ್ನು (Admin) ಸಂಪರ್ಕಿಸಿ.
              </span>
            ) : (
              assignedBeats.map((beat) => (
                <span
                  key={beat}
                  className="inline-flex items-center px-3 py-1 rounded-xl bg-blue-950/80 border border-blue-400/40 text-blue-200 text-xs font-extrabold shadow-sm"
                >
                  🏛️ {beat}
                </span>
              ))
            )}

            {assignedVillages.length > 0 && (
              <div className="w-full mt-2 text-[11px] text-slate-300">
                <span className="font-semibold text-slate-400">ಗ್ರಾಮಗಳು:</span> {assignedVillages.join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* House Records Header & Search */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center">
              <Home className="w-5 h-5 mr-2 text-blue-600" />
              ನಿಮ್ಮ ಬೀಟ್ ವ್ಯಾಪ್ತಿಯ ನೋಂದಾಯಿತ ಮನೆಗಳು / Authorized Beat Records
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ನಿಮಗೆ ನಿಯೋಜಿಸಲಾದ ಬೀಟ್ ವ್ಯಾಪ್ತಿಯಲ್ಲಿರುವ ಮನೆಗಳ ವಿವರಗಳು (ಒಟ್ಟು {pagination.total} ದಾಖಲೆಗಳು).
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchAuthorizedHouses}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="ಹುಡುಕಿ / Search house ID, owner..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Records Table */}
        {loading ? (
          <LoadingSpinner message="ದಾಖಲೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ / Loading authorized survey records..." />
        ) : houses.length === 0 ? (
          <EmptyState
            title="ಯಾವುದೇ ಮನೆಗಳು ನೋಂದಣಿಯಾಗಿಲ್ಲ / No Registered Houses"
            description={
              assignedBeats.length === 0
                ? "ನಿಮ್ಮ ಖಾತೆಗೆ ಇನ್ನೂ ಬೀಟ್ ನಿಯೋಜನೆಯಾಗಿಲ್ಲ. ನಿರ್ವಾಹಕರು ಬೀಟ್ ನಿಯೋಜಿಸಿದ ಬಳಿಕ ಸಮೀಕ್ಷೆ ಆರಂಭಿಸಬಹುದು."
                : `ನಿಮ್ಮ ಬೀಟ್ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ (${assignedBeats.join(', ')}) ಇನ್ನೂ ಯಾವುದೇ ಮನೆಗಳು ನೋಂದಣಿಯಾಗಿಲ್ಲ. ಸಮೀಕ್ಷೆ ಆರಂಭಿಸಲು 'ಹೊಸ ಮನೆ ನೋಂದಣಿ' ಕ್ಲಿಕ್ ಮಾಡಿ.`
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">House ID</th>
                  <th className="py-3 px-4">Beat & Village</th>
                  <th className="py-3 px-4">House Number</th>
                  <th className="py-3 px-4">Owner Name</th>
                  <th className="py-3 px-4">Security & Issues</th>
                  <th className="py-3 px-4">GPS Coordinates</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {houses.map((h) => (
                  <tr key={h._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {h.houseId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{h.village || '—'}</div>
                      <div className="text-[11px] text-slate-400 font-semibold">{h.beatNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {h.houseNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {h.owner?.fullName || '—'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-wrap items-center gap-1">
                        {h.security?.cctvInstalled === 'Yes' && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            CCTV
                          </span>
                        )}
                        {h.security?.securityGuardPresent === 'Yes' && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                            Guard
                          </span>
                        )}
                        {h.issues && h.issues.length > 0 ? (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                            {h.issues.length} Issue(s)
                          </span>
                        ) : (
                          (!h.security?.cctvInstalled || h.security?.cctvInstalled === 'No') &&
                          (!h.security?.securityGuardPresent || h.security?.securityGuardPresent === 'No') && (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {h.gps?.latitude ? (
                        <span className="inline-flex items-center text-emerald-600 font-semibold">
                          <MapPin className="w-3 h-3 mr-1" />
                          {h.gps.latitude.toFixed(4)}, {h.gps.longitude.toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Optional (Not Captured)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {h.registrationDate ? new Date(h.registrationDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <Link
                        to={`/houses/${h._id}`}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg inline-flex"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/houses/${h._id}/edit`}
                        className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-lg inline-flex"
                        title="Edit Details / Upload Photos"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page} of {pagination.totalPages} ({pagination.total} total records)
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboardPage;
