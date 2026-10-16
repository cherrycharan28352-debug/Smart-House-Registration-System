import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Building2,
  Users,
  Home,
  RefreshCw,
  Plus,
  ArrowRight,
  Search,
  CheckCircle2,
  Edit3,
  Layers,
  Info,
  ShieldAlert,
  ClipboardList,
  AlertTriangle
} from 'lucide-react';
import { getBeats, updateBeat } from '../services/beatService';
import { getDashboardStats } from '../services/dashboardService';
import { getIssuesLedger } from '../services/houseService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatCard from '../components/common/StatCard';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { isStaff } = useAuth();
  const toast = useToast();

  const [beats, setBeats] = useState([]);
  const [stats, setStats] = useState(null);
  const [issuesLedger, setIssuesLedger] = useState({
    data: [],
    stats: { total: 0, pending: 0, inProgress: 0, resolved: 0, policeRelated: 0, otherDept: 0 }
  });
  const [issueStatusFilter, setIssueStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Edit Beat Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingBeat, setEditingBeat] = useState(null);
  const [savingBeat, setSavingBeat] = useState(false);
  const [beatFormData, setBeatFormData] = useState({
    beatName: '',
    beatNameKannada: '',
    officerName: '',
    officerContact: '',
    description: ''
  });

  const loadDashboard = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [beatData, statsData, issuesData] = await Promise.all([
        getBeats(),
        getDashboardStats(),
        getIssuesLedger({ limit: 20, status: issueStatusFilter })
      ]);
      setBeats(beatData || []);
      setStats(statsData);
      setIssuesLedger(issuesData || { data: [], stats: {} });
      if (isManual) toast.success('ಬೀಟ್ ಅಂಕಿಅಂಶಗಳನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ / Dashboard Refreshed');
    } catch (err) {
      toast.error('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [issueStatusFilter]);

  const openEditBeatModal = (e, beat) => {
    e.stopPropagation(); // Don't navigate to beat villages
    setEditingBeat(beat);
    setBeatFormData({
      beatName: beat.beatName || beat.beatNumber,
      beatNameKannada: beat.beatNameKannada || beat.beatNumber,
      officerName: beat.officerName || '',
      officerContact: beat.officerContact || '',
      description: beat.description || ''
    });
    setEditModalOpen(true);
  };

  const handleSaveBeat = async (e) => {
    e.preventDefault();
    if (!editingBeat) return;

    setSavingBeat(true);
    try {
      await updateBeat(editingBeat.beatNumber, beatFormData);
      toast.success(`${editingBeat.beatNumber} ವಿವರಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.`);
      setEditModalOpen(false);
      loadDashboard();
    } catch (err) {
      toast.error(err.message || 'Failed to update beat.');
    } finally {
      setSavingBeat(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="ಲೋಡ್ ಆಗುತ್ತಿದೆ / Loading 11 Police Beats..." size="large" />;
  }

  const totalVillages = beats.reduce((acc, b) => acc + (b.villageCount || 0), 0);
  const totalHouses = stats?.summary?.totalHouses || 0;
  const totalFamily = stats?.summary?.totalFamilyMembers || 0;

  // Filter beats by number, name, or officer
  const filteredBeats = beats.filter((b) => {
    if (!searchFilter) return true;
    const term = searchFilter.toLowerCase();
    return (
      b.beatNumber.toLowerCase().includes(term) ||
      b.beatName?.toLowerCase().includes(term) ||
      b.beatNameKannada?.toLowerCase().includes(term) ||
      b.officerName?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ • ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್ ಆಡಳಿತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            ಪೊಲೀಸ್ ಬೀಟ್ ನಿರ್ವಹಣಾ ವ್ಯವಸ್ಥೆ (11 Beats)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            ಠಾಣಾ ವ್ಯಾಪ್ತಿಯ ೧೧ ಬೀಟ್‌ಗಳ ಗ್ರಾಮಗಳು, ಮನೆಗಳ ಸಮೀಕ್ಷೆ ವಿವರಗಳು ಮತ್ತು ಜಿಪಿಎಸ್ ಮ್ಯಾಪಿಂಗ್ ನಿಯಂತ್ರಣ ಕೊಠಡಿ.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2.5 text-xs font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            ನವೀಕರಿಸಿ / Refresh
          </button>
          <Link
            to="/register-house"
            className="inline-flex items-center px-4 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition"
          >
            <Plus className="w-4 h-4 mr-1.5 text-slate-950" />
            ಹೊಸ ಮನೆ ನೋಂದಣಿ
          </Link>
        </div>
      </div>

      {/* 6 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Police Beats"
          value="11 Beats"
          subtitle="Beat 01 - 11 ಸಕ್ರಿಯ ಬೀಟ್‌ಗಳು"
          icon={Shield}
          color="amber"
        />
        <StatCard
          title="Assigned Villages"
          value={totalVillages}
          subtitle="ಒಟ್ಟು ನಿಯೋಜಿತ ಗ್ರಾಮಗಳು"
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Surveyed Houses"
          value={totalHouses}
          subtitle="ಸಮೀಕ್ಷೆಗೊಂಡ ಒಟ್ಟು ಮನೆಗಳು"
          icon={Home}
          color="emerald"
        />
        <StatCard
          title="Census Individuals"
          value={totalFamily}
          subtitle="ನೋಂದಾಯಿತ ಕುಟುಂಬ ಸದಸ್ಯರು"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="CCTV Monitored"
          value={`${issuesLedger.data.filter((i) => i.cctvInstalled === 'Yes').length} Houses`}
          subtitle="ಸಿ.ಸಿ.ಟಿ.ವಿ ಅಳವಡಿತ ಮನೆಗಳು"
          icon={ShieldAlert}
          color="emerald"
        />
        <StatCard
          title="Survey Grievances"
          value={`${issuesLedger.stats?.pending || 0} Pending`}
          subtitle={`${issuesLedger.stats?.total || 0} ಒಟ್ಟು ದಾಖಲಾದ ಸಮಸ್ಯೆಗಳು`}
          icon={ClipboardList}
          color="amber"
        />
      </div>

      {/* Empty Database State Notice (When 0 Houses Registered) */}
      {totalHouses === 0 && (
        <div className="p-6 bg-amber-500/10 border border-amber-400/30 rounded-3xl text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಸಿದ್ಧವಾಗಿದೆ: ಯಾವುದೇ ಮನೆಗಳನ್ನು ಇನ್ನೂ ನೋಂದಾಯಿಸಲಾಗಿಲ್ಲ (No houses registered yet)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                ನಿಮ್ಮ ನೈಜ ಸಮೀಕ್ಷೆ ಡೇಟಾ ದಾಖಲಿಸಲು ಕೆಳಗಿನ ಯಾವುದೇ ಬೀಟ್ (Beat 01 - Beat 11) ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಗ್ರಾಮಗಳನ್ನು ಸೇರಿಸಿ ಮತ್ತು ಮನೆಗಳನ್ನು ನೋಂದಾಯಿಸಿ.
              </p>
            </div>
          </div>
          <Link
            to="/register-house"
            className="px-4 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm whitespace-nowrap self-start sm:self-auto transition"
          >
            ಹೊಸ ಮನೆ ನೋಂದಣಿ / Register First House &rarr;
          </Link>
        </div>
      )}

      {/* Exactly 11 Beat Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center">
              <Layers className="w-5 h-5 mr-2 text-amber-600" />
              ಠಾಣಾ ವ್ಯಾಪ್ತಿಯ ೧೧ ಬೀಟ್‌ಗಳು (11 Beat Administrative Cards)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ಯಾವುದೇ ಬೀಟ್ ಕಾರ್ಡ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಅದರ ವ್ಯಾಪ್ತಿಯ ಗ್ರಾಮಗಳ ಪಟ್ಟಿ ನೋಡಿ ಅಥವಾ ಹೊಸ ಗ್ರಾಮಗಳನ್ನು ಸೇರಿಸಿ.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Beat 01 - 11..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 w-52 bg-white"
            />
          </div>
        </div>

        {/* The 11 Beat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredBeats.map((beat) => (
            <div
              key={beat.beatNumber}
              onClick={() => navigate(`/beats/${encodeURIComponent(beat.beatNumber)}`)}
              className="cursor-pointer group bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-400/80 transition-all flex flex-col justify-between relative overflow-hidden transform hover:-translate-y-1"
            >
              {/* Top Accent line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-700 via-amber-500 to-blue-700 opacity-80 group-hover:h-2 transition-all" />

              <div>
                <div className="flex items-center justify-between mb-3 pt-1">
                  <span className="px-3 py-1 rounded-xl text-xs font-black font-mono tracking-wider bg-slate-900 text-amber-400 border border-slate-800 shadow-sm">
                    {beat.beatNumber}
                  </span>

                  <div className="flex items-center space-x-1.5">
                    {isStaff && (
                      <button
                        type="button"
                        onClick={(e) => openEditBeatModal(e, beat)}
                        className="p-1 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 transition"
                        title="Edit Beat Name / Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        beat.villageCount === 0
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {beat.villageCount === 0
                        ? '0 Villages'
                        : `${beat.villageCount} ${beat.villageCount === 1 ? 'Village' : 'Villages'}`}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-600 transition">
                  {beat.beatNameKannada || beat.beatName || beat.beatNumber}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {beat.beatName && beat.beatName !== beat.beatNumber ? beat.beatName : 'Jurisdiction Area'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">ಗ್ರಾಮಗಳ ಸಂಖ್ಯೆ:</span>
                    {beat.villageCount === 0 ? (
                      <span className="text-[11px] font-semibold text-slate-400 italic">
                        ಸೇರಿಸಲಾಗಿಲ್ಲ (None)
                      </span>
                    ) : (
                      <span className="font-bold text-slate-800">{beat.villageCount} ಗ್ರಾಮಗಳು</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">ನೋಂದಾಯಿತ ಮನೆಗಳು:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-md text-xs ${
                        beat.houseCount > 0
                          ? 'text-emerald-700 bg-emerald-50'
                          : 'text-slate-500 bg-slate-50'
                      }`}
                    >
                      {beat.houseCount} ಮನೆಗಳು
                    </span>
                  </div>

                  {beat.officerName ? (
                    <div className="flex items-center text-slate-600 text-[11px] pt-1">
                      <Shield className="w-3 h-3 mr-1 text-amber-500 flex-shrink-0" />
                      <span className="truncate">{beat.officerName}</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 pt-1 italic">
                      ಅಧಿಕಾರಿ ವಿವರ ನಮೂದಿಸಿಲ್ಲ
                    </div>
                  )}
                </div>
              </div>

              {/* Action link */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700 group-hover:text-amber-600 transition">
                <span>ಗ್ರಾಮಗಳ ಪಟ್ಟಿ / Open Beat</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION: ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್ — Security and Issues Survey Ledger */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆಗಳು & ಇಲಾಖಾ ಪರಿಹಾರ ಸಮೀಕ್ಷೆ
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5 flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2 text-amber-600" />
              ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್ — Security and Issues Survey Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ಬೀಟ್ ಸಮೀಕ್ಷೆಯ ಸಮಯದಲ್ಲಿ ಸಾರ್ವಜನಿಕರಿಂದ ಸ್ವೀಕರಿಸಲಾದ ಸಮಸ್ಯೆಗಳು, ಸಲಹೆಗಳು ಮತ್ತು ಇಲಾಖಾ ಕ್ರಮಗಳು.
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
            {[
              { id: '', label: 'All Issues', count: issuesLedger.stats?.total || 0 },
              { id: 'Pending', label: 'Pending', count: issuesLedger.stats?.pending || 0 },
              { id: 'In Progress', label: 'In Progress', count: issuesLedger.stats?.inProgress || 0 },
              { id: 'Resolved', label: 'Resolved', count: issuesLedger.stats?.resolved || 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setIssueStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center space-x-1.5 ${
                  issueStatusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    issueStatusFilter === tab.id ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Issues List Table */}
        {issuesLedger.data.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <ClipboardList className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-bold text-slate-700">ಯಾವುದೇ ಸಮಸ್ಯೆಗಳು ಅಥವಾ ಸಲಹೆಗಳು ದಾಖಲಾಗಿಲ್ಲ</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {issueStatusFilter
                ? `No issues found with status "${issueStatusFilter}".`
                : 'Zero community issues logged across beats so far. Clean ledger ready for survey entry.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">#</th>
                  <th className="py-3 px-3.5">Beat & Village</th>
                  <th className="py-3 px-3.5">House / Owner</th>
                  <th className="py-3 px-3.5">Date</th>
                  <th className="py-3 px-3.5">Category</th>
                  <th className="py-3 px-3.5 min-w-[200px]">Issue / Suggestion</th>
                  <th className="py-3 px-3.5 min-w-[180px]">Action Taken & Department</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">View Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {issuesLedger.data.map((iss, idx) => {
                  const statusBg =
                    iss.status === 'Resolved'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : iss.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200';

                  return (
                    <tr key={iss._id || iss.issueId || idx} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3.5 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{iss.beatNumber}</span>
                        <span className="text-[11px] text-slate-500">{iss.village}</span>
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{iss.houseId}</span>
                        <span className="text-[11px] text-slate-500">{iss.ownerName || 'House ' + iss.houseNumber}</span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                        {iss.dateReported ? new Date(iss.dateReported).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            iss.category === 'Police-related'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                              : 'bg-purple-50 text-purple-700 border border-purple-100'
                          }`}
                        >
                          {iss.category}
                        </span>
                      </td>
                      <td className="py-3 px-3.5">
                        <p className="font-bold text-slate-900 leading-snug line-clamp-2">{iss.description}</p>
                        {iss.additionalRemarks && (
                          <p className="text-[11px] text-slate-500 mt-0.5 italic truncate">
                            {iss.additionalRemarks}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-3.5">
                        {iss.actionTaken ? (
                          <div className="space-y-0.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold inline-block">
                              {iss.responsibleDepartment || 'Police'}
                            </span>
                            <p className="font-semibold text-slate-800 text-[11px] mt-0.5 truncate">
                              {iss.actionTaken}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Pending Action</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${statusBg}`}>
                          {iss.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <Link
                          to={`/houses/${iss.houseId}`}
                          className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition border border-blue-200/60 inline-flex items-center"
                        >
                          View & Act &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rules & Help Notice */}
      <div className="p-5 bg-blue-50/70 rounded-3xl border border-blue-200/80 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-blue-600 text-white">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-extrabold text-sm">ಬೀಟ್-ವಾರು ಮನೆ ಮನೆ ಸಮೀಕ್ಷೆ ನಿಯಮಾವಳಿ</p>
            <p className="text-blue-800 mt-0.5 text-xs">
              ಬೀಟ್ ಕಾರ್ಡ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿದಾಗ ಆ ಬೀಟ್‌ಗೆ ನೀವು ಸೇರಿಸಿದ ಗ್ರಾಮಗಳು ಮಾತ್ರ ಕಾಣಿಸುತ್ತವೆ. ಯಾವುದೇ ಗ್ರಾಮವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ ಹೊಸ ಮನೆಯನ್ನು ನೋಂದಾಯಿಸಿದರೆ ಆಯಾ ಬೀಟ್ ಮತ್ತು ಗ್ರಾಮ ತಾನಾಗಿಯೇ ಲಿಂಕ್ ಆಗುತ್ತದೆ.
            </p>
          </div>
        </div>

        <Link
          to="/houses"
          className="px-4 py-2 text-xs font-bold text-blue-900 bg-white hover:bg-blue-100 border border-blue-300 rounded-xl whitespace-nowrap self-start sm:self-auto transition"
        >
          ಎಲ್ಲಾ ಮನೆಗಳ ಪಟ್ಟಿ / All House Records &rarr;
        </Link>
      </div>

      {/* Edit Beat Modal */}
      {editModalOpen && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`Edit ${editingBeat?.beatNumber}`}
          subtitle="Customize beat name, Kannada title, and assigned police officer."
        >
          <form onSubmit={handleSaveBeat} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Beat Designation
              </label>
              <input
                type="text"
                disabled
                value={editingBeat?.beatNumber || ''}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed font-mono font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Beat Name (English)
                </label>
                <input
                  type="text"
                  value={beatFormData.beatName}
                  onChange={(e) => setBeatFormData({ ...beatFormData, beatName: e.target.value })}
                  placeholder="e.g. North Ward Jurisdiction"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ಬೀಟ್ ಹೆಸರು (ಕನ್ನಡದಲ್ಲಿ / Kannada)
                </label>
                <input
                  type="text"
                  value={beatFormData.beatNameKannada}
                  onChange={(e) => setBeatFormData({ ...beatFormData, beatNameKannada: e.target.value })}
                  placeholder="ಉದಾಹರಣೆಗೆ: ಉತ್ತರ ವಾರ್ಡ್ ಬೀಟ್"
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
                  value={beatFormData.officerName}
                  onChange={(e) => setBeatFormData({ ...beatFormData, officerName: e.target.value })}
                  placeholder="Officer Name / Designation"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Officer Contact / Help Desk
                </label>
                <input
                  type="text"
                  value={beatFormData.officerContact}
                  onChange={(e) => setBeatFormData({ ...beatFormData, officerContact: e.target.value })}
                  placeholder="Phone number / 112"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Jurisdiction Description / Remarks
              </label>
              <textarea
                rows={2}
                value={beatFormData.description}
                onChange={(e) => setBeatFormData({ ...beatFormData, description: e.target.value })}
                placeholder="Optional notes regarding this police beat territory"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
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

export default DashboardPage;
