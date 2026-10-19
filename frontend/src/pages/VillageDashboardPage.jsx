import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Home,
  Plus,
  Search,
  ArrowLeft,
  MapPin,
  Eye,
  Edit,
  FileText,
  Download,
  Users2,
  RefreshCw,
  Phone,
  ShieldAlert
} from 'lucide-react';
import { getVillageDetails } from '../services/beatService';
import { downloadSingleHousePDF, downloadSingleHouseExcel } from '../services/exportService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const VillageDashboardPage = () => {
  const { villageId } = useParams();
  const navigate = useNavigate();
  const { isStaff, isAdmin, user } = useAuth();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchVillageData = async () => {
    setLoading(true);
    try {
      const res = await getVillageDetails(villageId);
      setData(res);
    } catch (err) {
      toast.error('Failed to load village details.');
      navigate(isAdmin ? '/dashboard' : '/staff/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVillageData();
  }, [villageId]);

  const handleDownloadPDF = async (id, houseId) => {
    try {
      toast.info(`Generating PDF for ${houseId}...`);
      await downloadSingleHousePDF(id, houseId);
      toast.success(`PDF downloaded.`);
    } catch (err) {
      toast.error('Failed to export PDF.');
    }
  };

  const handleDownloadExcel = async (id, houseId) => {
    try {
      toast.info(`Generating Excel for ${houseId}...`);
      await downloadSingleHouseExcel(id, houseId);
      toast.success(`Excel downloaded.`);
    } catch (err) {
      toast.error('Failed to export Excel.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="ಲೋಡ್ ಆಗುತ್ತಿದೆ / Loading village dashboard..." size="large" />;
  }

  const village = data?.village;
  const houses = data?.houses || [];

  const assignedBeats = (user?.assignedBeats || []).map((b) => b.trim().toLowerCase());
  const isAuthorizedVillage =
    isAdmin || (village?.beatNumber && assignedBeats.includes(village.beatNumber.trim().toLowerCase()));

  if (!isAuthorizedVillage) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6 animate-in fade-in">
        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-rose-200">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            ಅನಧಿಕೃತ ಪ್ರವೇಶ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ / Access Denied
          </h1>
          <p className="text-sm text-slate-600">
            ಈ ಗ್ರಾಮವು (<strong>{village?.name}</strong>) ನಿಮ್ಮ ಅಧಿಕೃತ ಬೀಟ್ ವ್ಯಾಪ್ತಿಯಲ್ಲಿಲ್ಲ.
          </p>
          <div className="p-4 bg-slate-100 rounded-2xl text-xs text-slate-700 max-w-md mx-auto">
            <strong>ನಿಮಗೆ ನಿಯೋಜಿಸಲಾದ ಅಧಿಕೃತ ಬೀಟ್‌ಗಳು:</strong>{' '}
            {user?.assignedBeats?.length > 0 ? user.assignedBeats.join(', ') : 'ಯಾವುದೂ ನಿಯೋಜಿಸಲಾಗಿಲ್ಲ'}
          </div>
        </div>
        <div>
          <button
            onClick={() => navigate('/staff/dashboard')}
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            ನನ್ನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ / Return to Staff Dashboard
          </button>
        </div>
      </div>
    );
  }

  const filteredHouses = houses.filter((h) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      h.houseNumber?.toLowerCase().includes(term) ||
      h.houseId?.toLowerCase().includes(term) ||
      h.owner?.fullName?.toLowerCase().includes(term) ||
      h.streetName?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in pb-12">
      {/* Top back nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          ಹಿಂದಿನ ಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ / Back
        </button>

        {(isAdmin || isStaff) && (
          <Link
            to={`/register-house?beat=${encodeURIComponent(village?.beatNumber || 'Beat 01')}&village=${encodeURIComponent(village?.name || '')}`}
            className="inline-flex items-center px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition"
          >
            <Plus className="w-4 h-4 mr-1.5 text-slate-950" />
            ಹೊಸ ಮನೆ ನೋಂದಣಿ / Register New House
          </Link>
        )}
      </div>

      {/* Village Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase font-mono shadow-sm">
              {village?.beatNumber}
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              ಗ್ರಾಮ ಕೋಡ್: {village?.villageId || 'VIL'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {village?.nameKannada && village?.name && village.nameKannada !== village.name
              ? `${village.nameKannada} (${village.name})`
              : (village?.nameKannada || village?.name)}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-amber-400" />
            {village?.taluk}, {village?.district}, {village?.state} - {village?.pincode}
          </p>
        </div>

        {/* Total Registered Houses Stat Card */}
        <div className="bg-white/10 backdrop-blur-md p-4 px-6 rounded-2xl border border-white/10 text-center self-start md:self-auto">
          <span className="text-3xl font-black text-amber-400 block">{houses.length}</span>
          <span className="text-xs uppercase font-bold text-slate-300">
            ನೋಂದಾಯಿತ ಮನೆಗಳು / Total Registered Houses
          </span>
        </div>
      </div>

      {/* House List Section */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <Home className="w-4 h-4 mr-2 text-blue-600" />
              {village?.name} ಗ್ರಾಮದ ಮನೆಗಳ ವಿವರಗಳು (Registered House Records)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ಈ ಗ್ರಾಮದಲ್ಲಿ ಮನೆ ಮನೆ ಸಮೀಕ್ಷೆಯ ಮೂಲಕ ಸಂಗ್ರಹಿಸಲಾದ ಕುಟುಂಬ ಮತ್ತು ನಿವಾಸಗಳ ಅಧಿಕೃತ ಪಟ್ಟಿ.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by house # or owner name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-slate-50 focus:bg-white"
            />
          </div>
        </div>

        {filteredHouses.length === 0 ? (
          <EmptyState
            title="ಈ ಗ್ರಾಮದಲ್ಲಿ ಯಾವುದೇ ಮನೆಗಳು ಇನ್ನೂ ನೋಂದಣಿಯಾಗಿಲ್ಲ"
            description="Start the survey by clicking 'Register New House' below. The beat and village will be automatically assigned."
            actionLabel="ಹೊಸ ಮನೆ ನೋಂದಣಿ ಮಾಡಿ / Register First House"
            actionLink={`/register-house?beat=${encodeURIComponent(village?.beatNumber || 'Beat 01')}&village=${encodeURIComponent(village?.name || '')}`}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">House ID</th>
                  <th className="py-3 px-4">House # & Street</th>
                  <th className="py-3 px-4">House Type</th>
                  <th className="py-3 px-4">Registered Owner / Custodian</th>
                  <th className="py-3 px-4">Family Count</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredHouses.map((h) => (
                  <tr key={h._id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-blue-700">
                      <Link to={`/houses/${h.houseId || h._id}`} className="hover:underline">
                        {h.houseId}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 text-slate-900">
                      <div className="font-bold">{h.houseNumber}</div>
                      <div className="text-[11px] text-slate-500">{h.streetName}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {h.houseType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-900">
                      <div className="font-bold">{h.owner?.fullName || 'Not recorded'}</div>
                      <div className="text-[11px] text-slate-400">{h.owner?.contactNumber || '—'}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="font-bold text-slate-900">
                        {h.familyMembers ? h.familyMembers.length : 0}
                      </span>{' '}
                      members
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          h.registrationStatus === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {h.registrationStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <Link
                        to={`/houses/${h.houseId || h._id}`}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg inline-flex"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {isStaff && (
                        <Link
                          to={`/houses/${h.houseId || h._id}/edit`}
                          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-lg inline-flex"
                          title="Edit House"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDownloadPDF(h._id, h.houseId)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg inline-flex"
                        title="Download PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadExcel(h._id, h.houseId)}
                        className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-lg inline-flex"
                        title="Download Excel"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VillageDashboardPage;
