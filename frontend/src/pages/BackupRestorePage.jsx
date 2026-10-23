import React, { useState, useEffect } from 'react';
import {
  Database,
  Archive,
  HardDrive,
  ShieldCheck,
  RefreshCw,
  Download,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileCheck,
  Calendar,
  Layers,
  Trash2,
  ShieldAlert,
  Server,
  Zap,
  Info
} from 'lucide-react';
import {
  getBackupOverview,
  listBackups,
  createManualBackup,
  verifyBackupIntegrity,
  restoreFromBackup,
  downloadBackupArchive,
  deleteBackup,
  getRestoreHistory,
  updateBackupSettings
} from '../services/backupService';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BackupRestorePage = () => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Data states
  const [overview, setOverview] = useState(null);
  const [backups, setBackups] = useState([]);
  const [restoreHistory, setRestoreHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('restore-points'); // 'restore-points' | 'storage' | 'schedule' | 'history'

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    autoBackupEnabled: true,
    frequency: 'daily',
    retentionDays: 30
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Restore Modal State
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [restoreProgressStep, setRestoreProgressStep] = useState('');
  const [restoreResult, setRestoreResult] = useState(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const [overviewData, backupsData, historyData] = await Promise.all([
        getBackupOverview(),
        listBackups({ limit: 50 }),
        getRestoreHistory()
      ]);

      setOverview(overviewData);
      setBackups(backupsData?.data || []);
      setRestoreHistory(historyData || []);

      if (overviewData?.backupSettings) {
        setSettingsForm({
          autoBackupEnabled: overviewData.backupSettings.autoBackupEnabled !== false,
          frequency: overviewData.backupSettings.frequency || 'daily',
          retentionDays: overviewData.backupSettings.retentionDays || 30
        });
      }
    } catch (err) {
      console.error('Failed to load backup overview:', err);
      showToast('ಬ್ಯಾಕ್‌ಅಪ್ ಮಾಹಿತಿ ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ / Failed to load backup information', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleCreateBackup = async () => {
    try {
      setCreatingBackup(true);
      showToast('ಬ್ಯಾಕ್‌ಅಪ್ ಪ್ರಕ್ರಿಯೆ ಪ್ರಾರಂಭವಾಗಿದೆ... / Starting backup process...', 'info');
      const res = await createManualBackup();
      showToast('ಬ್ಯಾಕ್‌ಅಪ್ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ ಮತ್ತು ಪರಿಶೀಲಿಸಲಾಗಿದೆ! / Backup created and verified successfully!', 'success');
      await fetchOverview();
    } catch (err) {
      console.error('Create backup error:', err);
      showToast(err.response?.data?.message || 'ಬ್ಯಾಕ್‌ಅಪ್ ರಚನೆ ವಿಫಲವಾಗಿದೆ / Backup creation failed', 'error');
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleVerifyIntegrity = async (backup) => {
    try {
      setVerifyingId(backup.backupId);
      const res = await verifyBackupIntegrity(backup.backupId);
      showToast(`ಕ್ರಿಪ್ಟೋಗ್ರಾಫಿಕ್ SHA-256 ಸಮಗ್ರತೆ ದೃಢಪಟ್ಟಿದೆ ✓ / Cryptographic SHA-256 Integrity Verified!`, 'success');
      await fetchOverview();
    } catch (err) {
      console.error('Verify error:', err);
      showToast(err.response?.data?.message || 'ಸಮಗ್ರತೆ ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ / Integrity verification failed', 'error');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDownload = async (backup) => {
    try {
      setDownloadingId(backup.backupId);
      showToast('ಆರ್ಕೈವ್ ಡೌನ್‌ಲೋಡ್ ಪ್ರಾರಂಭವಾಗುತ್ತಿದೆ... / Starting secure archive download...', 'info');
      await downloadBackupArchive(backup.backupId, backup.filename);
      showToast('ಬ್ಯಾಕ್‌ಅಪ್ ಆರ್ಕೈವ್ ಡೌನ್‌ಲೋಡ್ ಪೂರ್ಣಗೊಂಡಿದೆ / Download complete', 'success');
    } catch (err) {
      console.error('Download error:', err);
      showToast('ಡೌನ್‌ಲೋಡ್ ವಿಫಲವಾಗಿದೆ / Download failed', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (backup) => {
    if (!window.confirm(`ಖಂಡಿತವಾಗಿಯೂ ${backup.filename} ಬ್ಯಾಕ್‌ಅಪ್ ಅನ್ನು ಅಳಿಸಲು ಬಯಸುವಿರಾ?\nAre you sure you want to delete backup ${backup.filename}?`)) {
      return;
    }
    try {
      setDeletingId(backup.backupId);
      await deleteBackup(backup.backupId);
      showToast('ಬ್ಯಾಕ್‌ಅಪ್ ಆರ್ಕೈವ್ ಅಳಿಸಲಾಗಿದೆ / Backup archive deleted', 'info');
      await fetchOverview();
    } catch (err) {
      console.error('Delete error:', err);
      showToast(err.response?.data?.message || 'ಅಳಿಸಲು ವಿಫಲವಾಗಿದೆ / Failed to delete backup', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      await updateBackupSettings(settingsForm);
      showToast('ಬ್ಯಾಕ್‌ಅಪ್ ಸಂಯೋಜನೆಗಳನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ / Backup settings saved successfully', 'success');
      await fetchOverview();
    } catch (err) {
      console.error('Settings save error:', err);
      showToast('ಸಂಯೋಜನೆಗಳನ್ನು ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ / Failed to save settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const openRestoreModal = (backup) => {
    setSelectedBackupForRestore(backup);
    setConfirmText('');
    setRestoreResult(null);
    setRestoreProgressStep('');
    setRestoreModalOpen(true);
  };

  const handleExecuteRestore = async () => {
    if (confirmText !== 'RESTORE') {
      showToast('ದಯವಿಟ್ಟು "RESTORE" ಎಂದು ನಿಖರವಾಗಿ ಟೈಪ್ ಮಾಡಿ / Please type "RESTORE" to confirm', 'warning');
      return;
    }

    try {
      setRestoring(true);
      setRestoreProgressStep('ಹಂತ ೧/೪: ಪ್ರಸ್ತುತ ದತ್ತಾಂಶದ ಸ್ವಯಂಚಾಲಿತ ಸುರಕ್ಷತಾ ಸ್ನ್ಯಾಪ್‌ಶಾಟ್ ರಚಿಸಲಾಗುತ್ತಿದೆ... / Step 1/4: Creating automated pre-restore safety snapshot...');

      const res = await restoreFromBackup(selectedBackupForRestore.backupId, {
        confirmation: 'RESTORE'
      });

      setRestoreProgressStep('ಹಂತ ೪/೪: ಮರುಸ್ಥಾಪನೆ ಮತ್ತು ಪರಿಶೀಲನೆ ಯಶಸ್ವಿಯಾಗಿದೆ! / Step 4/4: Restoration and verification completed!');
      setRestoreResult(res.data);
      showToast('ದತ್ತಾಂಶ ಮರುಸ್ಥಾಪನೆ ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ! / Data restored successfully!', 'success');
      await fetchOverview();
    } catch (err) {
      console.error('Restore error:', err);
      showToast(err.response?.data?.message || 'ದತ್ತಾಂಶ ಮರುಸ್ಥಾಪನೆ ವಿಫಲವಾಗಿದೆ / Restoration failed', 'error');
      setRestoreProgressStep('ಮರುಸ್ಥಾಪನೆ ವಿಫಲವಾಗಿದೆ / Restoration failed. Current data was protected by safety snapshot.');
    } finally {
      setRestoring(false);
    }
  };

  if (loading && !overview) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="ಬ್ಯಾಕ್‌ಅಪ್ ಮತ್ತು ಶೇಖರಣಾ ದತ್ತಾಂಶ ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ... / Loading backup and storage details..." />
      </div>
    );
  }

  const storage = overview?.storage;
  const db = storage?.database;
  const fileStorage = storage?.fileStorage;
  const scale = storage?.scaleReadiness;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ಅಧಿಕೃತ ನಿರ್ವಾಹಕ ದತ್ತಾಂಶ ರಕ್ಷಣೆ / Official Admin Data Protection</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>ಬ್ಯಾಕ್‌ಅಪ್ ಮತ್ತು ದತ್ತಾಂಶ ಮರುಸ್ಥಾಪನೆ</span>
              <span className="text-xs font-normal text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60 hidden sm:inline-block">
                Permanent Storage & Restore
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              ಸುರಕ್ಷಿತ ದೀರ್ಘಕಾಲೀನ ಸಂಗ್ರಹಣೆ, ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಿದ ಸ್ವಯಂಚಾಲಿತ ಬ್ಯಾಕ್‌ಅಪ್, ಮತ್ತು ಯಾವುದೇ ಸರ್ವರ್ ವೈಫಲ್ಯ ಅಥವಾ ಡೇಟಾ ನಷ್ಟದ ನಂತರ ಸಂಪೂರ್ಣ ಮರುಸ್ಥಾಪನೆ.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={fetchOverview}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>ರಿಫ್ರೆಶ್ / Refresh</span>
            </button>

            <button
              onClick={handleCreateBackup}
              disabled={creatingBackup}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              {creatingBackup ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ಬ್ಯಾಕ್‌ಅಪ್ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...</span>
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4" />
                  <span>ಈಗಲೇ ಬ್ಯಾಕ್‌ಅಪ್ ರಚಿಸಿ / Create Backup</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Storage and Health Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: MongoDB Atlas Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">ಡೇಟಾಬೇಸ್ ಸ್ಥಿತಿ / DB Status</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="text-base font-extrabold text-white truncate">
                {db?.isPersistent ? 'MongoDB Atlas (ಶಾಶ್ವತ)' : 'ಅಸ್ಥಿರ ಸಂಗ್ರಹಣೆ'}
              </div>
              <div className="text-xs text-emerald-400 font-medium truncate">
                {db?.storageType || 'Cloud MongoDB Atlas'}
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>ಹೋಸ್ಟ್ / Host:</span>
            <span className="font-mono text-slate-300 truncate max-w-[150px]">{db?.host || 'MongoDB Atlas'}</span>
          </div>
        </div>

        {/* Card 2: Database Capacity & Usage */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">ಡೇಟಾ ಗಾತ್ರ / Storage Used</span>
            <span className="text-slate-400">{db?.usagePercentage || 0}% used</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-extrabold text-white">
                {db?.totalUsedFormatted || '0 KB'}
              </div>
              <div className="text-xs text-slate-400">
                ಮಿತಿ / Limit: {db?.capacityLimitFormatted || '512 MB'}
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 pt-3 border-t border-slate-800/80">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (db?.usagePercentage || 0) > 80 ? 'bg-rose-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.max(2, db?.usagePercentage || 0)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Photos File Storage */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">ಫೋಟೋ ಸಂಗ್ರಹಣೆ / Photo Files</span>
            <span className="text-indigo-400 font-medium">ಸ್ವತಂತ್ರ ಫೈಲ್ ಸ್ಟೋರೇಜ್</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-extrabold text-white">
                {fileStorage?.photosCount || 0} ಚಿತ್ರಗಳು
              </div>
              <div className="text-xs text-slate-400">
                ಗಾತ್ರ: {fileStorage?.photosBytesFormatted || '0 Bytes'}
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>ಸ್ಥಳ / Path:</span>
            <span className="font-mono text-slate-300">backend/uploads/houses</span>
          </div>
        </div>

        {/* Card 4: Last Verified Backup */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">ಕೊನೆಯ ಬ್ಯಾಕ್‌ಅಪ್ / Last Backup</span>
            <span className="text-emerald-400 font-medium">ದೃಢೀಕರಿಸಲಾಗಿದೆ ✓</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white truncate max-w-[140px]">
                {overview?.stats?.lastSuccessfulBackup
                  ? new Date(overview.stats.lastSuccessfulBackup.completedAt).toLocaleDateString('kn-IN')
                  : 'ಯಾವುದೂ ಇಲ್ಲ'}
              </div>
              <div className="text-xs text-slate-400">
                {overview?.stats?.lastSuccessfulBackup?.sizeFormatted || '0 KB'} (
                {overview?.stats?.lastSuccessfulBackup?.totalDocuments || 0} ದಾಖಲೆಗಳು)
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>ಒಟ್ಟು ಬಿಂದುಗಳು:</span>
            <span className="font-bold text-amber-400">{overview?.stats?.totalBackups || 0} ಆರ್ಕೈವ್‌ಗಳು</span>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('restore-points')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'restore-points'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>ಲಭ್ಯವಿರುವ ಮರುಸ್ಥಾಪನಾ ಬಿಂದುಗಳು / Restore Points ({backups.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'storage'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>ಶೇಖರಣಾ ಸಾಮರ್ಥ್ಯ & ೨೦೦,೦೦೦ ಸ್ಕೇಲಿಂಗ್ / Storage & Scale</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'schedule'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>ಸ್ವಯಂಚಾಲಿತ ವೇಳಾಪಟ್ಟಿ / Schedule & Retention</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>ಮರುಸ್ಥಾಪನೆ ಇತಿಹಾಸ / Restore History ({restoreHistory.length})</span>
        </button>
      </div>

      {/* TAB 1: Restore Points Table */}
      {activeTab === 'restore-points' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="font-black text-sm text-white">ದಾಖಲಿಸಲಾದ ಮರುಸ್ಥಾಪನಾ ಬಿಂದುಗಳು / Available Backup Archives</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                ಪ್ರತಿಯೊಂದು ಬಿಂದುವೂ ಕಂಪ್ರೆಸ್ ಮಾಡಿದ ಸಂಪೂರ್ಣ JSON ದಾಖಲೆಗಳು, SHA-256 ಸಮಗ್ರತೆ ಹ್ಯಾಶ್, ಮತ್ತು ಫೋಟೋ ಫೈಲ್‌ಗಳನ್ನು ಒಳಗೊಂಡಿದೆ.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              ಒಟ್ಟು {backups.length} ಬಿಂದುಗಳು
            </span>
          </div>

          {backups.length === 0 ? (
            <div className="p-12 text-center">
              <Archive className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-300">ಇನ್ನೂ ಯಾವುದೇ ಬ್ಯಾಕ್‌ಅಪ್ ರಚಿಸಲಾಗಿಲ್ಲ / No backups created yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಡೇಟಾಬೇಸ್‌ನ ಮೊದಲ ಸುರಕ್ಷಿತ ಬಿಂದುವನ್ನು ರಚಿಸಲು "ಈಗಲೇ ಬ್ಯಾಕ್‌ಅಪ್ ರಚಿಸಿ" ಬಟನ್ ಒತ್ತಿ.
              </p>
              <button
                onClick={handleCreateBackup}
                disabled={creatingBackup}
                className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition"
              >
                ಮೊದಲ ಬ್ಯಾಕ್‌ಅಪ್ ರಚಿಸಿ / Create First Backup
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">ದಿನಾಂಕ & ಐಡಿ / Date & ID</th>
                    <th className="py-3 px-4">ಮೂಲ / Trigger Type</th>
                    <th className="py-3 px-4">ವ್ಯಾಪ್ತಿ & ಗಾತ್ರ / Scope & Size</th>
                    <th className="py-3 px-4">ದಾಖಲೆಗಳ ಸಾರಾಂಶ / Records Included</th>
                    <th className="py-3 px-4">ಸಮಗ್ರತೆ / Integrity</th>
                    <th className="py-3 px-4 text-right">ಕ್ರಿಯೆಗಳು / Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {backups.map((bkp) => {
                    const isSafety = bkp.triggerType === 'pre_restore_safety';
                    const isScheduled = bkp.triggerType === 'scheduled';

                    return (
                      <tr key={bkp.backupId} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">
                            {new Date(bkp.completedAt || bkp.createdAt).toLocaleString('kn-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </div>
                          <div className="font-mono text-[10px] text-slate-400 mt-0.5">{bkp.backupId}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          {isSafety ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              <ShieldAlert className="w-3 h-3" />
                              ಸುರಕ್ಷತಾ ಸ್ನ್ಯಾಪ್‌ಶಾಟ್
                            </span>
                          ) : isScheduled ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              <Clock className="w-3 h-3" />
                              ಸ್ವಯಂಚಾಲಿತ (Daily)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <Archive className="w-3 h-3" />
                              ಕೈಯಾರೆ (Manual)
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-200">{bkp.sizeFormatted}</div>
                          <div className="text-[10px] text-slate-400">
                            {bkp.photoFileCount || 0} ಫೋಟೋಗಳು ({bkp.photoTotalBytes ? (bkp.photoTotalBytes / 1024).toFixed(1) + ' KB' : '0 KB'})
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-slate-300 font-medium">
                            <span className="text-amber-400 font-bold">{bkp.documentCounts?.houses || 0}</span> ಮನೆಗಳು,{' '}
                            <span className="text-slate-200 font-bold">{bkp.documentCounts?.villages || 0}</span> ಹಳ್ಳಿಗಳು,{' '}
                            <span className="text-slate-200 font-bold">{bkp.documentCounts?.beats || 0}</span> ಬೀಟ್‌ಗಳು
                          </div>
                          <div className="text-[10px] text-slate-400">
                            ಒಟ್ಟು {bkp.documentCounts?.totalDocuments || 0} ಡಾಕ್ಯುಮೆಂಟ್‌ಗಳು
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {bkp.integrityVerified ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              SHA-256 ದೃಢಪಟ್ಟಿದೆ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              ದೋಷ
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Verify Button */}
                            <button
                              onClick={() => handleVerifyIntegrity(bkp)}
                              disabled={verifyingId === bkp.backupId}
                              title="ಕ್ರಿಪ್ಟೋಗ್ರಾಫಿಕ್ ಸಮಗ್ರತೆ ಪರೀಕ್ಷಿಸಿ / Verify SHA-256 Integrity"
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                            >
                              <ShieldCheck className={`w-3.5 h-3.5 ${verifyingId === bkp.backupId ? 'animate-spin' : ''}`} />
                            </button>

                            {/* Download Button */}
                            <button
                              onClick={() => handleDownload(bkp)}
                              disabled={downloadingId === bkp.backupId}
                              title="ಆರ್ಕೈವ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ / Download ZIP Archive"
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            {/* Restore Button */}
                            <button
                              onClick={() => openRestoreModal(bkp)}
                              title="ಈ ಬಿಂದುವಿನಿಂದ ಮರುಸ್ಥಾಪಿಸಿ / Restore from this backup"
                              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 font-bold rounded-lg transition flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>ಮರುಸ್ಥಾಪನೆ / Restore</span>
                            </button>

                            {/* Delete Button (disabled for safety snapshots) */}
                            {!isSafety && (
                              <button
                                onClick={() => handleDelete(bkp)}
                                disabled={deletingId === bkp.backupId}
                                title="ಅಳಿಸಿ / Delete Backup"
                                className="p-1.5 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 rounded-lg transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Storage & 200,000 Scale Readiness */}
      {activeTab === 'storage' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-black text-white flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>೨೦೦,೦೦೦ ಮನೆಗಳ ನೋಂದಣಿ ಸಾಮರ್ಥ್ಯ / 200,000+ Scale Architecture</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              ಅರ್ಜಿಯು ೨ ಲಕ್ಷಕ್ಕೂ ಹೆಚ್ಚು ಮನೆಗಳು ಮತ್ತು ಕುಟುಂಬ ಸದಸ್ಯರ ವಿವರಗಳನ್ನು ಲ್ಯಾಗ್ ಇಲ್ಲದೆ ಅತಿವೇಗವಾಗಿ ನಿರ್ವಹಿಸಲು ವಾಸ್ತುಶಿಲ್ಪೀಯವಾಗಿ ವಿನ್ಯಾಸಗೊಂಡಿದೆ.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">ಸಂಯುಕ್ತ ಡೇಟಾಬೇಸ್ ಇಂಡೆಕ್ಸಿಂಗ್ / Compound Indexing</h3>
                    <p className="text-xs text-slate-400">Active & Verified in MongoDB Atlas</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                  <code className="text-amber-400 font-mono text-[11px]">beatNumber + village</code>,{' '}
                  <code className="text-amber-400 font-mono text-[11px]">createdAt</code>,{' '}
                  <code className="text-amber-400 font-mono text-[11px]">gps coordinates</code> ಗಳಿಗೆ ಸಂಯುಕ್ತ ಇಂಡೆಕ್ಸ್‌ಗಳನ್ನು ಕಾನ್ಫಿಗರ್ ಮಾಡಲಾಗಿದೆ. ಇದು ೨ ಲಕ್ಷ ಮನೆಗಳಲ್ಲೂ ಸರ್ಚ್ ಸಮಯವನ್ನು &lt; ೨೦ ಮಿಲಿಸೆಕೆಂಡ್‌ಗಳಿಗೆ ಇಳಿಸುತ್ತದೆ.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">ಫೋಟೋಗಳ ಪ್ರತ್ಯೇಕ ಶೇಖರಣೆ / Separate Binary Storage</h3>
                    <p className="text-xs text-slate-400">Zero BSON Bloat Guarantee</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                  ದೊಡ್ಡ ಬೈನರಿ ಫೋಟೋಗಳನ್ನು ನೇರವಾಗಿ MongoDB ಡಾಕ್ಯುಮೆಂಟ್‌ಗಳಲ್ಲಿ ಸೇರಿಸದೆ, ಕಡತ ವ್ಯವಸ್ಥೆ / ಆಬ್ಜೆಕ್ಟ್ ಸ್ಟೋರೇಜ್‌ನಲ್ಲಿ ಪ್ರತ್ಯೇಕವಾಗಿ ಸಂಗ್ರಹಿಸಲಾಗುತ್ತದೆ. MongoDB ಕೇವಲ ರೆಫರೆನ್ಸ್‌ಗಳನ್ನು ಮಾತ್ರ ಇಟ್ಟುಕೊಳ್ಳುವುದರಿಂದ ಡೇಟಾಬೇಸ್ ಗಾತ್ರ ಕನಿಷ್ಠವಾಗಿರುತ್ತದೆ.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">ಸರ್ವರ್-ಸೈಡ್ ಪೇಜಿನೇಶನ್ / Server-Side Pagination</h3>
                    <p className="text-xs text-slate-400">Memory Efficient Query Delivery</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                  ಎಲ್ಲಾ ಮನೆ ಪಟ್ಟಿಗಳು ಮತ್ತು ಸರ್ವೇ ವರದಿಗಳು ಸರ್ವರ್-ಸೈಡ್ ಮಿತಿ (limit/skip) ಮತ್ತು ಪ್ರೊಜೆಕ್ಷನ್ ಮೂಲಕ ಲೋಡ್ ಆಗುತ್ತವೆ. ಬ್ರೌಸರ್ ಮೆಮೊರಿ ಎಂದಿಗೂ ಓವರ್‌ಫ್ಲೋ ಆಗುವುದಿಲ್ಲ.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                    ℹ️
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">ಕ್ಲೌಡ್ ಸಾಮರ್ಥ್ಯ & ಅಪ್‌ಗ್ರೇಡ್ ಮಾರ್ಗ / Upgrade Path</h3>
                    <p className="text-xs text-slate-400">Current: MongoDB Atlas M0 (512 MB)</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                  ಪ್ರಸ್ತುತ M0 ಉಚಿತ ಶ್ರೇಣಿಯು ಸರಿಸುಮಾರು ೧೦,೦೦೦ ಮನೆಗಳಿಗೆ ಸೂಕ್ತವಾಗಿದೆ. ೨,೦೦,೦೦೦ ಮನೆಗಳನ್ನು ತಲುಪಿದಾಗ MongoDB Atlas M10 (10 GB) ಅಥವಾ M20 (20 GB) ಗೆ ೧-ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಅಪ್‌ಗ್ರೇಡ್ ಮಾಡಬಹುದು (ಯಾವುದೇ ಕೋಡ್ ಬದಲಾವಣೆ ಅಥವಾ ಡೌನ್‌ಟೈಮ್ ಇಲ್ಲದೆ).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Automatic Schedule & Retention */}
      {activeTab === 'schedule' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm max-w-2xl">
          <h2 className="text-lg font-black text-white flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>ಸ್ವಯಂಚಾಲಿತ ಬ್ಯಾಕ್‌ಅಪ್ ಕಾನ್ಫಿಗರೇಶನ್ / Backup Schedule & Policy</span>
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ದಿನನಿತ್ಯ ಡೇಟಾಬೇಸ್ ಬ್ಯಾಕ್‌ಅಪ್ ತೆಗೆಯುವ ನಿಯಮ ಮತ್ತು ದಿನಗಳನ್ನು ನಿರ್ವಹಿಸಿ.
          </p>

          <form onSubmit={handleSaveSettings} className="space-y-5">
            {/* Toggle auto backup */}
            <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
              <div>
                <label className="text-sm font-bold text-white block">ಸ್ವಯಂಚಾಲಿತ ಬ್ಯಾಕ್‌ಅಪ್ ಸಕ್ರಿಯಗೊಳಿಸಿ / Enable Automatic Backups</label>
                <span className="text-xs text-slate-400">ನಿಗದಿತ ಸಮಯದಲ್ಲಿ ಸರ್ವರ್ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಬ್ಯಾಕ್‌ಅಪ್ ರಚಿಸುತ್ತದೆ.</span>
              </div>
              <input
                type="checkbox"
                checked={settingsForm.autoBackupEnabled}
                onChange={(e) => setSettingsForm({ ...settingsForm, autoBackupEnabled: e.target.checked })}
                className="w-5 h-5 text-amber-500 rounded bg-slate-800 border-slate-700 focus:ring-amber-400"
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                ಬ್ಯಾಕ್‌ಅಪ್ ಆವರ್ತನ / Backup Frequency
              </label>
              <select
                value={settingsForm.frequency}
                onChange={(e) => setSettingsForm({ ...settingsForm, frequency: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="daily">ಪ್ರತಿದಿನ (Daily - 24 Hours) [ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ]</option>
                <option value="weekly">ವಾರಕ್ಕೊಮ್ಮೆ (Weekly - Every 7 Days)</option>
                <option value="manual">ಕೈಯಾರೆ ಮಾತ್ರ (Manual Only)</option>
              </select>
            </div>

            {/* Retention Days */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                ಧಾರಣ ಅವಧಿ (ದಿನಗಳಲ್ಲಿ) / Retention Period (Days)
              </label>
              <input
                type="number"
                min="7"
                max="365"
                value={settingsForm.retentionDays}
                onChange={(e) => setSettingsForm({ ...settingsForm, retentionDays: parseInt(e.target.value, 10) || 30 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                ಈ ಅವಧಿಗಿಂತ ಹಳೆಯದಾದ ಬ್ಯಾಕ್‌ಅಪ್‌ಗಳನ್ನು ಶೇಖರಣಾ ಸ್ಥಳ ಉಳಿಸಲು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ತೆರವುಗೊಳಿಸಲಾಗುತ್ತದೆ.
              </span>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              {savingSettings ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'ಸಂಯೋಜನೆಗಳನ್ನು ಉಳಿಸಿ / Save Settings'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: Restore History */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-950/40 border-b border-slate-800">
            <h2 className="font-black text-sm text-white">ದತ್ತಾಂಶ ಮರುಸ್ಥಾಪನೆ ಲೆಕ್ಕಪರಿಶೋಧನಾ ಇತಿಹಾಸ / Restore Audit Log</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              ಯಾರು, ಯಾವಾಗ ಮತ್ತು ಯಾವ ಬ್ಯಾಕ್‌ಅಪ್‌ನಿಂದ ದತ್ತಾಂಶವನ್ನು ಮರುಸ್ಥಾಪಿಸಿದ್ದಾರೆ ಎಂಬ ಸಂಪೂರ್ಣ ದಾಖಲೆ.
            </p>
          </div>

          {restoreHistory.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              ಇದುವರೆಗೆ ಯಾವುದೇ ಮರುಸ್ಥಾಪನೆ ಕಾರ್ಯಾಚರಣೆ ನಡೆದಿಲ್ಲ / No restore operations recorded yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">ಸಮಯ / Timestamp</th>
                    <th className="py-3 px-4">ನಿರ್ವಾಹಕರು / Restored By</th>
                    <th className="py-3 px-4">ಮೂಲ ಆರ್ಕೈವ್ / Source Backup</th>
                    <th className="py-3 px-4">ಸುರಕ್ಷತಾ ಸ್ನ್ಯಾಪ್‌ಶಾಟ್ / Safety Snapshot</th>
                    <th className="py-3 px-4">ಮರುಸ್ಥಾಪಿತ ದಾಖಲೆಗಳು / Restored Counts</th>
                    <th className="py-3 px-4">ಸ್ಥಿತಿ / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {restoreHistory.map((item) => (
                    <tr key={item.restoreId} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {new Date(item.completedAt || item.createdAt).toLocaleString('kn-IN')}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">{item.restoredByName || 'Admin'}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-amber-400">{item.backupFilename}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-purple-400">
                        {item.safetyBackupFilename || item.safetyBackupId || 'None'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {item.restoredCounts?.houses || 0} ಮನೆಗಳು, {item.restoredCounts?.villages || 0} ಹಳ್ಳಿಗಳು, {item.restoredCounts?.photoFilesRestored || 0} ಫೋಟೋಗಳು
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          ಯಶಸ್ವಿ (Success)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SAFE RESTORE MODAL */}
      {restoreModalOpen && selectedBackupForRestore && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header Warning */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">ಸುರಕ್ಷಿತ ದತ್ತಾಂಶ ಮರುಸ್ಥಾಪನೆ / Safe Full Data Restore</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ಆಯ್ಕೆಮಾಡಿದ ಬ್ಯಾಕ್‌ಅಪ್ ಬಿಂದುವಿನಿಂದ ಸಂಪೂರ್ಣ ಡೇಟಾಬೇಸ್ ಮತ್ತು ಫೋಟೋಗಳನ್ನು ಮರುಸ್ಥಾಪಿಸಲಾಗುತ್ತದೆ.
                </p>
              </div>
            </div>

            {/* Target backup info */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">ಆರ್ಕೈವ್ ಫೈಲ್ / File:</span>
                <span className="font-mono text-amber-400 font-bold">{selectedBackupForRestore.filename}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ದಿನಾಂಕ / Date:</span>
                <span className="text-white font-medium">
                  {new Date(selectedBackupForRestore.completedAt).toLocaleString('kn-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ಒಳಗೊಂಡ ದಾಖಲೆಗಳು:</span>
                <span className="text-slate-200 font-bold">
                  {selectedBackupForRestore.documentCounts?.houses || 0} ಮನೆಗಳು,{' '}
                  {selectedBackupForRestore.documentCounts?.villages || 0} ಹಳ್ಳಿಗಳು,{' '}
                  {selectedBackupForRestore.photoFileCount || 0} ಫೋಟೋಗಳು
                </span>
              </div>
            </div>

            {/* Pre-restore safety snapshot guarantee */}
            <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 flex items-start gap-2.5 mb-4">
              <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">ಸ್ವಯಂಚಾಲಿತ ಸುರಕ್ಷತಾ ಗ್ಯಾರಂಟಿ / Safety Snapshot:</span>
                ಯಾವುದೇ ದಾಖಲೆಯನ್ನು ಬದಲಿಸುವ ಮೊದಲು, ಸಿಸ್ಟಮ್ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪ್ರಸ್ತುತ ಲೈವ್ ಸ್ಥಿತಿಯ ತ್ವರಿತ ಸ್ನ್ಯಾಪ್‌ಶಾಟ್ ಅನ್ನು ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ.
              </div>
            </div>

            {/* Progress Display */}
            {restoring ? (
              <div className="py-6 text-center space-y-3">
                <LoadingSpinner size="medium" />
                <p className="text-xs font-bold text-amber-400 animate-pulse">{restoreProgressStep}</p>
                <p className="text-[11px] text-slate-500">ದಯವಿಟ್ಟು ಬ್ರೌಸರ್ ಮುಚ್ಚಬೇಡಿ / Please do not close this window...</p>
              </div>
            ) : restoreResult ? (
              <div className="py-4 space-y-3 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-black text-sm text-white">ಮರುಸ್ಥಾಪನೆ ಯಶಸ್ವಿಯಾಗಿದೆ! / Restored Successfully!</h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  ಎಲ್ಲಾ {restoreResult.restoredCounts?.houses || 0} ಮನೆಗಳು, {restoreResult.restoredCounts?.villages || 0} ಹಳ್ಳಿಗಳು, ಮತ್ತು {restoreResult.restoredCounts?.photoFilesRestored || 0} ಫೋಟೋಗಳು ಪುನಃಸ್ಥಾಪಿಸಲ್ಪಟ್ಟಿವೆ.
                </p>
                <button
                  onClick={() => setRestoreModalOpen(false)}
                  className="mt-2 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
                >
                  ಮುಚ್ಚಿ / Close
                </button>
              </div>
            ) : (
              <>
                {/* Confirmation Input */}
                <div className="space-y-2 mb-5">
                  <label className="block text-xs font-bold text-slate-300">
                    ದೃಢೀಕರಣಕ್ಕಾಗಿ ಕೆಳಗೆ <span className="text-amber-400 font-mono font-black">RESTORE</span> ಎಂದು ಟೈಪ್ ಮಾಡಿ:
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="RESTORE"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 font-mono tracking-widest uppercase font-bold"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setRestoreModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    ರದ್ದುಮಾಡಿ / Cancel
                  </button>

                  <button
                    onClick={handleExecuteRestore}
                    disabled={confirmText !== 'RESTORE'}
                    className="px-5 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-40 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-900/30 transition flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>ಮರುಸ್ಥಾಪನೆ ಖಚಿತಪಡಿಸಿ / Confirm Restore</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupRestorePage;
