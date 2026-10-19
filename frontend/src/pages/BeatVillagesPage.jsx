import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Building2,
  Plus,
  Search,
  ArrowLeft,
  ArrowRight,
  Home,
  MapPin,
  RefreshCw,
  Phone,
  CheckCircle2,
  Edit3,
  Trash2,
  FileText,
  ShieldAlert
} from 'lucide-react';
import {
  getBeatByNumber,
  addVillageToBeat,
  updateBeat,
  updateVillage,
  deleteVillage
} from '../services/beatService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const BeatVillagesPage = () => {
  const { beatNumber } = useParams();
  const navigate = useNavigate();
  const { isStaff, isAdmin, user } = useAuth();
  const toast = useToast();

  const assignedBeats = (user?.assignedBeats || []).map((b) => b.trim().toLowerCase());
  const isAuthorizedBeat = isAdmin || assignedBeats.includes((beatNumber || '').trim().toLowerCase());

  const [beatData, setBeatData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add Village Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [villageForm, setVillageForm] = useState({
    name: '',
    nameKannada: '',
    taluk: '',
    district: '',
    pincode: '',
    landmark: ''
  });
  const [adding, setAdding] = useState(false);

  // Edit Village Modal State
  const [editVillageModalOpen, setEditVillageModalOpen] = useState(false);
  const [editingVillage, setEditingVillage] = useState(null);
  const [savingVillage, setSavingVillage] = useState(false);

  // Edit Beat Modal State
  const [editBeatModalOpen, setEditBeatModalOpen] = useState(false);
  const [savingBeat, setSavingBeat] = useState(false);
  const [beatForm, setBeatForm] = useState({
    beatName: '',
    beatNameKannada: '',
    officerName: '',
    officerContact: '',
    description: ''
  });

  const fetchBeatDetails = async () => {
    setLoading(true);
    try {
      const data = await getBeatByNumber(beatNumber);
      setBeatData(data);
      if (data?.beat) {
        setBeatForm({
          beatName: data.beat.beatName || data.beat.beatNumber,
          beatNameKannada: data.beat.beatNameKannada || data.beat.beatNumber,
          officerName: data.beat.officerName || '',
          officerContact: data.beat.officerContact || '',
          description: data.beat.description || ''
        });
      }
    } catch (err) {
      toast.error('Failed to load beat details.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeatDetails();
  }, [beatNumber]);

  // Handle Add Village
  const handleAddVillage = async (e) => {
    e.preventDefault();
    if (!villageForm.name.trim()) {
      toast.error('ಗ್ರಾಮದ ಹೆಸರು ಕಡ್ಡಾಯ / Village name is required.');
      return;
    }

    setAdding(true);
    try {
      await addVillageToBeat(beatNumber, villageForm);
      toast.success(`ಗ್ರಾಮ "${villageForm.name}" ಯಶಸ್ವಿಯಾಗಿ ${beatNumber} ಗೆ ಸೇರಿಸಲಾಗಿದೆ.`);
      setAddModalOpen(false);
      setVillageForm({
        name: '',
        nameKannada: '',
        taluk: '',
        district: '',
        pincode: '',
        landmark: ''
      });
      fetchBeatDetails();
    } catch (err) {
      toast.error(err.message || 'Failed to add village.');
    } finally {
      setAdding(false);
    }
  };

  // Open Edit Village Modal
  const openEditVillage = (e, village) => {
    e.stopPropagation();
    setEditingVillage({ ...village });
    setEditVillageModalOpen(true);
  };

  // Handle Save Edited Village
  const handleSaveVillage = async (e) => {
    e.preventDefault();
    if (!editingVillage) return;

    setSavingVillage(true);
    try {
      await updateVillage(editingVillage._id || editingVillage.villageId, editingVillage);
      toast.success(`ಗ್ರಾಮ "${editingVillage.name}" ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.`);
      setEditVillageModalOpen(false);
      fetchBeatDetails();
    } catch (err) {
      toast.error(err.message || 'Failed to update village.');
    } finally {
      setSavingVillage(false);
    }
  };

  // Handle Delete Village
  const handleDeleteVillage = async (e, village) => {
    e.stopPropagation();
    if (!window.confirm(`ಗ್ರಾಮ "${village.name}" ಅನ್ನು ಈ ಬೀಟ್‌ನಿಂದ ತೆಗೆದುಹಾಕಬೇಕೇ?`)) {
      return;
    }

    try {
      await deleteVillage(village._id || village.villageId);
      toast.success(`ಗ್ರಾಮ "${village.name}" ತೆಗೆದುಹಾಕಲಾಗಿದೆ.`);
      fetchBeatDetails();
    } catch (err) {
      toast.error(err.message || 'Failed to delete village.');
    }
  };

  // Handle Save Beat
  const handleSaveBeat = async (e) => {
    e.preventDefault();
    setSavingBeat(true);
    try {
      await updateBeat(beatNumber, beatForm);
      toast.success(`${beatNumber} ವಿವರಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.`);
      setEditBeatModalOpen(false);
      fetchBeatDetails();
    } catch (err) {
      toast.error(err.message || 'Failed to update beat.');
    } finally {
      setSavingBeat(false);
    }
  };

  if (!isAuthorizedBeat) {
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
            ನೀವು <strong>{beatNumber}</strong> ಮತ್ತು ಅದರ ಗ್ರಾಮಗಳನ್ನು ಪ್ರವೇಶಿಸಲು ಅಧಿಕಾರ ಹೊಂದಿಲ್ಲ.
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

  if (loading) {
    return <LoadingSpinner message={`ಲೋಡ್ ಆಗುತ್ತಿದೆ / Loading villages for ${beatNumber}...`} size="large" />;
  }

  const beat = beatData?.beat;
  const villages = beatData?.villages || [];

  const filteredVillages = villages.filter((v) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(term) ||
      v.nameKannada?.toLowerCase().includes(term) ||
      v.taluk?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in pb-12">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center justify-between">
        <Link
          to={isAdmin ? '/dashboard' : '/staff/dashboard'}
          className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {isAdmin ? 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ / Back to 11 Beats Dashboard' : 'ನನ್ನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ / Back to My Dashboard'}
        </Link>

        {isAdmin && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setEditBeatModalOpen(true)}
              className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
              ಬೀಟ್ ಸಂಪಾದಿಸಿ / Edit Beat
            </button>
            <button
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4 mr-1 text-slate-950" />
              ಹೊಸ ಗ್ರಾಮ ಸೇರಿಸಿ / Add Village
            </button>
          </div>
        )}
      </div>

      {/* Beat Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase font-mono shadow-sm">
              {beat?.beatNumber}
            </span>
            <span className="text-xs text-slate-300 font-semibold">
              ಕರ್ನಾಟಕ ಪೊಲೀಸ್ ಇಲಾಖೆ ಬೀಟ್ ಆಡಳಿತ ವ್ಯಾಪ್ತಿ
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {beat?.beatNameKannada || beat?.beatName || beat?.beatNumber}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {beat?.beatName && beat.beatName !== beat.beatNumber ? beat.beatName : 'Jurisdiction Area'}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center">
              <Shield className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              <span>ಬೀಟ್ ಅಧಿಕಾರಿ: {beat?.officerName || 'ಹೆಸರು ದಾಖಲಿಸಿಲ್ಲ (Not assigned)'}</span>
            </div>
            {beat?.officerContact && (
              <div className="flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                <span>ಸಂಪರ್ಕ: {beat.officerContact}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats on the right */}
        <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 self-start md:self-auto">
          <div className="text-center px-3 border-r border-white/20">
            <span className="text-2xl font-black text-amber-400 block">{villages.length}</span>
            <span className="text-[10px] uppercase font-bold text-slate-300">ಗ್ರಾಮಗಳು / Villages</span>
          </div>
          <div className="text-center px-3">
            <span className="text-2xl font-black text-emerald-400 block">{beatData?.totalHouses || 0}</span>
            <span className="text-[10px] uppercase font-bold text-slate-300">ಮನೆಗಳು / Houses</span>
          </div>
        </div>
      </div>

      {/* Villages List and Search */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <Building2 className="w-4 h-4 mr-2 text-blue-600" />
              {beat?.beatNumber} ವ್ಯಾಪ್ತಿಯ ಗ್ರಾಮಗಳು (Assigned Villages)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ಗ್ರಾಮದ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ನೇರವಾಗಿ ಹೊಸ ಮನೆಯನ್ನು ನೋಂದಾಯಿಸಿ ಅಥವಾ ನೋಂದಾಯಿತ ಮನೆಗಳ ಪಟ್ಟಿ ನೋಡಿ.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search villages in beat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56 bg-slate-50 focus:bg-white"
            />
          </div>
        </div>

        {filteredVillages.length === 0 ? (
          <EmptyState
            title="ಯಾವುದೇ ಗ್ರಾಮಗಳನ್ನು ಸೇರಿಸಲಾಗಿಲ್ಲ / No villages added yet"
            description={`ಈ ಬೀಟ್‌ಗೆ (${beat?.beatNumber}) ನೀವು ಇನ್ನೂ ಯಾವುದೇ ಗ್ರಾಮಗಳನ್ನು ನಿಯೋಜಿಸಿಲ್ಲ.`}
            actionLabel="ಹೊಸ ಗ್ರಾಮ ಸೇರಿಸಿ / Add First Village"
            onAction={() => setAddModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVillages.map((v) => (
              <div
                key={v._id || v.villageId}
                onClick={() => navigate(`/villages/${v._id || v.villageId || v.name}`)}
                className="cursor-pointer group bg-slate-50 hover:bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-400/80 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {v.villageId || 'VIL'}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {v.houseCount || 0} ಮನೆಗಳು
                      </span>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => openEditVillage(e, v)}
                          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-200 transition"
                          title="Edit Village"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteVillage(e, v)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Village"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-800 transition">
                    {v.nameKannada || v.name}
                  </h3>
                  {v.name && v.nameKannada && v.name !== v.nameKannada && (
                    <p className="text-xs text-slate-500 font-medium">{v.name}</p>
                  )}

                  <div className="mt-3 pt-2 border-t border-slate-200/70 text-[11px] text-slate-500 space-y-1">
                    {(v.taluk || v.district) && (
                      <p className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                        {v.taluk && `ತಾಲ್ಲೂಕು: ${v.taluk}`} {v.district && `• ಜಿಲ್ಲೆ: ${v.district}`}
                      </p>
                    )}
                    {v.pincode && <p className="text-[10px] text-slate-400">ಪಿನ್ ಕೋಡ್: {v.pincode}</p>}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-700 group-hover:underline flex items-center">
                    ಗ್ರಾಮ ಪುಟ / View Village &rarr;
                  </span>
                  <Link
                    to={`/register-house?beat=${encodeURIComponent(beat?.beatNumber || 'Beat 01')}&village=${encodeURIComponent(v.name)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    ಮನೆ ನೋಂದಣಿ
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Village Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title={`Add New Village to ${beat?.beatNumber}`}
        subtitle="Assign a village territory to this police beat jurisdiction."
      >
        <form onSubmit={handleAddVillage} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Village Name (English) *
            </label>
            <input
              type="text"
              required
              value={villageForm.name}
              onChange={(e) => setVillageForm({ ...villageForm, name: e.target.value })}
              placeholder="e.g. Rampura or Ward 12"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              ಗ್ರಾಮದ ಹೆಸರು (ಕನ್ನಡದಲ್ಲಿ / Kannada)
            </label>
            <input
              type="text"
              value={villageForm.nameKannada}
              onChange={(e) => setVillageForm({ ...villageForm, nameKannada: e.target.value })}
              placeholder="ಉದಾಹರಣೆಗೆ: ರಾಮಪುರ"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Taluk / Subdistrict</label>
              <input
                type="text"
                value={villageForm.taluk}
                onChange={(e) => setVillageForm({ ...villageForm, taluk: e.target.value })}
                placeholder="ತಾಲ್ಲೂಕು"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">District</label>
              <input
                type="text"
                value={villageForm.district}
                onChange={(e) => setVillageForm({ ...villageForm, district: e.target.value })}
                placeholder="ಜಿಲ್ಲೆ"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">PIN Code</label>
              <input
                type="text"
                value={villageForm.pincode}
                onChange={(e) => setVillageForm({ ...villageForm, pincode: e.target.value })}
                placeholder="6-digit PIN code"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Landmark</label>
              <input
                type="text"
                value={villageForm.landmark}
                onChange={(e) => setVillageForm({ ...villageForm, landmark: e.target.value })}
                placeholder="ಗುರುತು / Landmark"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              ರದ್ದು / Cancel
            </button>
            <button
              type="submit"
              disabled={adding}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {adding ? 'ಸೇರಿಸಲಾಗುತ್ತಿದೆ...' : 'ಗ್ರಾಮ ಸೇರಿಸಿ / Add Village'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Village Modal */}
      {editVillageModalOpen && editingVillage && (
        <Modal
          isOpen={editVillageModalOpen}
          onClose={() => setEditVillageModalOpen(false)}
          title={`Edit Village: ${editingVillage.name}`}
          subtitle="Update village name, Kannada title, or taluk details."
        >
          <form onSubmit={handleSaveVillage} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Village Name (English) *
              </label>
              <input
                type="text"
                required
                value={editingVillage.name || ''}
                onChange={(e) => setEditingVillage({ ...editingVillage, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                ಗ್ರಾಮದ ಹೆಸರು (ಕನ್ನಡದಲ್ಲಿ / Kannada)
              </label>
              <input
                type="text"
                value={editingVillage.nameKannada || ''}
                onChange={(e) => setEditingVillage({ ...editingVillage, nameKannada: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Taluk</label>
                <input
                  type="text"
                  value={editingVillage.taluk || ''}
                  onChange={(e) => setEditingVillage({ ...editingVillage, taluk: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  value={editingVillage.district || ''}
                  onChange={(e) => setEditingVillage({ ...editingVillage, district: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  value={editingVillage.pincode || ''}
                  onChange={(e) => setEditingVillage({ ...editingVillage, pincode: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Landmark</label>
                <input
                  type="text"
                  value={editingVillage.landmark || ''}
                  onChange={(e) => setEditingVillage({ ...editingVillage, landmark: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditVillageModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                ರದ್ದು / Cancel
              </button>
              <button
                type="submit"
                disabled={savingVillage}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {savingVillage ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'ಬದಲಾವಣೆ ಉಳಿಸಿ / Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Beat Modal */}
      {editBeatModalOpen && (
        <Modal
          isOpen={editBeatModalOpen}
          onClose={() => setEditBeatModalOpen(false)}
          title={`Edit Beat: ${beat?.beatNumber}`}
          subtitle="Customize beat title and officer details."
        >
          <form onSubmit={handleSaveBeat} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Beat Name (English)
                </label>
                <input
                  type="text"
                  value={beatForm.beatName}
                  onChange={(e) => setBeatForm({ ...beatForm, beatName: e.target.value })}
                  placeholder="e.g. Market Beat"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ಬೀಟ್ ಹೆಸರು (ಕನ್ನಡದಲ್ಲಿ / Kannada)
                </label>
                <input
                  type="text"
                  value={beatForm.beatNameKannada}
                  onChange={(e) => setBeatForm({ ...beatForm, beatNameKannada: e.target.value })}
                  placeholder="ಉದಾ: ಮಾರುಕಟ್ಟೆ ಬೀಟ್"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Beat Police Officer Name
                </label>
                <input
                  type="text"
                  value={beatForm.officerName}
                  onChange={(e) => setBeatForm({ ...beatForm, officerName: e.target.value })}
                  placeholder="Officer Name / Rank"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Officer Contact
                </label>
                <input
                  type="text"
                  value={beatForm.officerContact}
                  onChange={(e) => setBeatForm({ ...beatForm, officerContact: e.target.value })}
                  placeholder="Phone number / 112"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Description / Remarks
              </label>
              <textarea
                rows={2}
                value={beatForm.description}
                onChange={(e) => setBeatForm({ ...beatForm, description: e.target.value })}
                placeholder="Optional notes regarding this territory"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditBeatModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                ರದ್ದು / Cancel
              </button>
              <button
                type="submit"
                disabled={savingBeat}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {savingBeat ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'ಬದಲಾವಣೆ ಉಳಿಸಿ / Save Beat'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default BeatVillagesPage;
