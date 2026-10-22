import React, { useState, useEffect } from 'react';
import { Settings, Save, Shield, Building, MapPin, KeyRound, CheckCircle } from 'lucide-react';
import { getSettings, updateSettings } from '../services/settingsService';
import { changeUserPassword } from '../services/authService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const SettingsPage = () => {
  const { user, isAdmin } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settings, setSettings] = useState({
    organizationName: '',
    department: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    defaultMapLat: 28.6139,
    defaultMapLng: 77.2090,
    defaultZoom: 13,
    pdfDisclaimer: ''
  });

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSettings();
        if (data) setSettings(data);
      } catch (err) {
        console.warn('Settings load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('Only administrators can update authority system settings.');
      return;
    }

    setSavingSettings(true);
    try {
      await updateSettings(settings);
      toast.success('Authority configuration updated successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to update settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    setChangingPassword(true);
    try {
      await changeUserPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Your account password has been updated.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading system settings..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          System Settings & Registry Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure police department parameters, default map coordinates, report settings, and account security.
        </p>
      </div>

      {/* Agency Configuration Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Issuing Authority Profile & Document Branding
            </h3>
          </div>
          {!isAdmin && (
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              Read-Only for Non-Admin
            </span>
          )}
        </div>

        <form onSubmit={handleSettingsSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Organization / Authority Name
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={settings.organizationName}
                onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Department Division
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={settings.department}
                onChange={(e) => setSettings({ ...settings, department: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Official Contact Email
              </label>
              <input
                type="email"
                disabled={!isAdmin}
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Official Helpline / Phone
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 disabled:bg-slate-50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Administrative Headquarters Address
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 disabled:bg-slate-50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Statutory PDF & Certificate Report Disclaimer
              </label>
              <textarea
                rows={3}
                disabled={!isAdmin}
                value={settings.pdfDisclaimer}
                onChange={(e) => setSettings({ ...settings, pdfDisclaimer: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 disabled:bg-slate-50"
              />
            </div>
          </div>

          {isAdmin && (
            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={savingSettings}
                className="inline-flex items-center px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-1.5" />
                {savingSettings ? 'Saving...' : 'Save Authority Settings'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Account Security & Password Change */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center space-x-2">
          <KeyRound className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">
            Account Security & Password Update
          </h3>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs max-w-md">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Current Password *</label>
            <input
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">New Password * (Min 6 chars)</label>
            <input
              type="password"
              required
              minLength={6}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Confirm New Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={changingPassword}
              className="inline-flex items-center px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4 mr-1.5" />
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
