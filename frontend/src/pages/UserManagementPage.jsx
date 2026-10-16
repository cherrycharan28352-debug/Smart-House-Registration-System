import React, { useState, useEffect } from 'react';
import {
  UserCog,
  Plus,
  ShieldCheck,
  UserCheck,
  Trash2,
  Edit2,
  Mail,
  Lock,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Power,
  MapPin,
  FileText,
  Search,
  Filter,
  Users2
} from 'lucide-react';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  approveStaff,
  rejectStaff,
  updateStaffStatus,
  assignStaffJurisdiction,
  getAuditLogs
} from '../services/userService';
import { getBeats } from '../services/beatService';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('staff'); // 'staff', 'users', 'audit'
  const [staffList, setStaffList] = useState([]);
  const [allUsersList, setAllUsersList] = useState([]);
  const [auditLogsList, setAuditLogsList] = useState([]);
  const [beatsList, setBeatsList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [assignedBeats, setAssignedBeats] = useState([]);
  const [submittingAction, setSubmittingAction] = useState(false);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [assignModalOpen, setAssignModalOpen] = useState(false);

  // Create User Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: '',
    email: '',
    staffId: '',
    mobileNumber: '',
    password: '',
    fullName: '',
    role: 'staff',
    accountStatus: 'approved'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, beatsData, logsData] = await Promise.all([
        getUsers(),
        getBeats().catch(() => []),
        getAuditLogs().catch(() => ({ data: [] }))
      ]);

      const all = usersData || [];
      setAllUsersList(all);
      setStaffList(all.filter((u) => u.role === 'staff'));
      setBeatsList(beatsData || []);
      setAuditLogsList(logsData.data || []);
    } catch (err) {
      toast.error('Failed to load user administration data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pendingCount = staffList.filter((s) => s.accountStatus === 'pending').length;

  const filteredStaff = staffList.filter((s) => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'approved') {
        if (s.accountStatus !== 'approved' && s.accountStatus !== 'active') return false;
      } else if (s.accountStatus !== statusFilter) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.fullName?.toLowerCase().includes(q) ||
        s.staffId?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.mobileNumber?.includes(q)
      );
    }
    return true;
  });

  // Handle Approve
  const openApproveModal = (staff) => {
    setSelectedStaff(staff);
    // Pre-populate with requested beat if available
    const initialBeats = staff.assignedBeats && staff.assignedBeats.length > 0
      ? staff.assignedBeats
      : staff.requestedBeat
      ? [staff.requestedBeat]
      : ['Beat 01'];
    setAssignedBeats(initialBeats);
    setApproveModalOpen(true);
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setSubmittingAction(true);
    try {
      await approveStaff(selectedStaff._id, {
        assignedBeats,
        assignedVillages: []
      });
      toast.success(`Staff member "${selectedStaff.fullName}" has been approved!`);
      setApproveModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Approval failed.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle Reject
  const openRejectModal = (staff) => {
    setSelectedStaff(staff);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setSubmittingAction(true);
    try {
      await rejectStaff(selectedStaff._id, { reason: rejectReason });
      toast.success(`Staff application for "${selectedStaff.fullName}" rejected.`);
      setRejectModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Rejection failed.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle Toggle Status (Active / Deactivated)
  const handleToggleStatus = async (staff) => {
    const isCurrentlyActive = staff.accountStatus === 'approved' || staff.accountStatus === 'active';
    const newStatus = isCurrentlyActive ? 'deactivated' : 'approved';
    const actionLabel = isCurrentlyActive ? 'deactivate' : 'activate';

    if (!window.confirm(`Are you sure you want to ${actionLabel} account for "${staff.fullName}"?`)) {
      return;
    }

    try {
      await updateStaffStatus(staff._id, { status: newStatus });
      toast.success(`Account for ${staff.fullName} ${newStatus === 'deactivated' ? 'deactivated' : 'activated'}.`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Status update failed.');
    }
  };

  // Handle Edit Beat Assignment
  const openAssignModal = (staff) => {
    setSelectedStaff(staff);
    setAssignedBeats(staff.assignedBeats || []);
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setSubmittingAction(true);
    try {
      await assignStaffJurisdiction(selectedStaff._id, {
        assignedBeats,
        assignedVillages: []
      });
      toast.success(`Beat assignments updated for ${selectedStaff.fullName}.`);
      setAssignModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Assignment failed.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const toggleBeatSelection = (beatNum) => {
    setAssignedBeats((prev) =>
      prev.includes(beatNum) ? prev.filter((b) => b !== beatNum) : [...prev, beatNum]
    );
  };

  // Handle User Create
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      await createUser(createForm);
      toast.success(`User ${createForm.fullName} created successfully.`);
      setCreateModalOpen(false);
      setCreateForm({
        username: '',
        email: '',
        staffId: '',
        mobileNumber: '',
        password: '',
        fullName: '',
        role: 'staff',
        accountStatus: 'approved'
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create user.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle User Delete
  const handleDeleteUser = async (u) => {
    if (u._id === currentUser?.id || u._id === currentUser?._id) {
      toast.error('Security alert: You cannot delete your own logged-in admin account.');
      return;
    }
    if (!window.confirm(`Permanently delete account for "${u.fullName}"?`)) return;

    try {
      await deleteUser(u._id);
      toast.success(`User account ${u.fullName} deleted.`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            ಸಿಬ್ಬಂದಿ ಮತ್ತು ಬಳಕೆದಾರರ ನಿರ್ವಹಣೆ
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Staff Approvals, Beat Jurisdiction Assignments, and System Audit Logs
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Refresh All"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            ಹೊಸ ಖಾತೆ ಸೇರಿಸಿ / Add User
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-1 text-xs">
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center px-4 py-2.5 rounded-xl font-bold transition ${
            activeTab === 'staff'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4 mr-2" />
          ಸಿಬ್ಬಂದಿ ಅನುಮೋದನೆ & ನಿಯೋಜನೆ (Staff Approvals)
          {pendingCount > 0 && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'staff' ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-800'
            }`}>
              {pendingCount} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center px-4 py-2.5 rounded-xl font-bold transition ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users2 className="w-4 h-4 mr-2" />
          ಎಲ್ಲಾ ಬಳಕೆದಾರರು (All System Users)
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center px-4 py-2.5 rounded-xl font-bold transition ${
            activeTab === 'audit'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4 mr-2" />
          ಲೆಕ್ಕಪರಿಶೋಧನಾ ದಾಖಲೆಗಳು (Audit Logs)
        </button>
      </div>

      {/* TAB 1: STAFF APPROVALS & JURISDICTION */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {[
                { id: 'all', label: 'ಎಲ್ಲಾ ಸಿಬ್ಬಂದಿ (All)' },
                { id: 'pending', label: `ಅನುಮೋದನೆ ಬಾಕಿ (${pendingCount})` },
                { id: 'approved', label: 'ಅನುಮೋದಿತ (Approved)' },
                { id: 'deactivated', label: 'ನಿಷ್ಕ್ರಿಯ (Deactivated)' },
                { id: 'rejected', label: 'ತಿರಸ್ಕೃತ (Rejected)' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                    statusFilter === f.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ಹೆಸರು, ಸಿಬ್ಬಂದಿ ಐಡಿ, ಮೊಬೈಲ್..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            {loading ? (
              <LoadingSpinner message="ಸಿಬ್ಬಂದಿ ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ..." />
            ) : filteredStaff.length === 0 ? (
              <EmptyState
                title="ಯಾವುದೇ ಸಿಬ್ಬಂದಿ ಖಾತೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ"
                description="ಆಯ್ಕೆಮಾಡಿದ ಫಿಲ್ಟರ್‌ಗೆ ಸರಿಹೊಂದುವ ಯಾವುದೇ ಸಿಬ್ಬಂದಿ ಖಾತೆಗಳಿಲ್ಲ."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Staff Details</th>
                      <th className="py-3.5 px-4">Staff / Badge ID</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Requested Jurisdiction</th>
                      <th className="py-3.5 px-4">Assigned Beats</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Approval & Jurisdiction Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredStaff.map((s) => {
                      const isPending = s.accountStatus === 'pending';
                      const isApproved = s.accountStatus === 'approved' || s.accountStatus === 'active';
                      const isDeactivated = s.accountStatus === 'deactivated';
                      const isRejected = s.accountStatus === 'rejected';

                      return (
                        <tr key={s._id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{s.fullName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{s.userId}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                            {s.staffId || '—'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            <div>{s.email}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{s.mobileNumber || '—'}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {s.requestedBeat ? (
                              <span className="font-semibold text-slate-800">
                                {s.requestedBeat}
                                {s.requestedVillage ? ` (${s.requestedVillage})` : ''}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">None Specified</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {s.assignedBeats && s.assignedBeats.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {s.assignedBeats.map((b) => (
                                  <span
                                    key={b}
                                    className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold"
                                  >
                                    {b}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-amber-600 text-[11px] italic font-semibold">
                                Not Assigned
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                isApproved
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isPending
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                                  : isDeactivated
                                  ? 'bg-slate-100 text-slate-700'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {s.accountStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                            {isPending ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openApproveModal(s)}
                                  className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                  ಅನುಮೋದಿಸಿ (Approve)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openRejectModal(s)}
                                  className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-1" />
                                  ತಿರಸ್ಕರಿಸಿ (Reject)
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openAssignModal(s)}
                                  className="inline-flex items-center px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg transition"
                                  title="Change Beat Assignment"
                                >
                                  <MapPin className="w-3 h-3 mr-1" />
                                  ಬೀಟ್ ನಿಯೋಜನೆ
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(s)}
                                  className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-lg transition border ${
                                    isDeactivated
                                      ? 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                                      : 'text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                  title={isDeactivated ? 'Activate Staff' : 'Deactivate Staff'}
                                >
                                  <Power className="w-3 h-3 mr-1" />
                                  {isDeactivated ? 'ಸಕ್ರಿಯಗೊಳಿಸಿ' : 'ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಿ'}
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ALL SYSTEM USERS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">User ID</th>
                  <th className="py-3.5 px-4">Full Name & Email</th>
                  <th className="py-3.5 px-4">Username</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {allUsersList.map((u) => {
                  const isCurrent = u._id === currentUser?.id || u._id === currentUser?._id;

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {u.userId || 'USR'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-900">
                        <div className="font-bold flex items-center">
                          {u.fullName}
                          {isCurrent && (
                            <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">{u.username}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'staff'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.accountStatus === 'approved' || u.accountStatus === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : u.accountStatus === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.accountStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg inline-flex"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                ಪೊಲೀಸ್ ಆಡಳಿತಾತ್ಮಕ ಲೆಕ್ಕಪರಿಶೋಧನಾ ದಾಖಲೆಗಳು (Administrative Audit Trail)
              </h2>
              <p className="text-xs text-slate-500">
                All staff approvals, beat assignments, and registration events are recorded securely.
              </p>
            </div>
            <button
              onClick={fetchData}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {auditLogsList.length === 0 ? (
            <EmptyState
              title="No audit entries recorded yet"
              description="System activities such as staff registration, approval, and house registration will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action Event</th>
                    <th className="py-3 px-4">Performed By</th>
                    <th className="py-3 px-4">Target Resource</th>
                    <th className="py-3 px-4">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {auditLogsList.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-sans">
                        {log.performedByName || log.performedBy?.fullName || 'System / Anonymous'}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-sans">
                        {log.targetResource || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 truncate max-w-xs font-sans text-xs">
                        {log.details ? JSON.stringify(log.details) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* APPROVE STAFF MODAL */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title="ಸಿಬ್ಬಂದಿ ಖಾತೆ ಅನುಮೋದಿಸಿ / Approve Staff Account"
        subtitle={`Assign beats and authorize ${selectedStaff?.fullName || 'Officer'}`}
      >
        {selectedStaff && (
          <form onSubmit={handleApproveSubmit} className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 space-y-1">
              <p><strong>ಹೆಸರು:</strong> {selectedStaff.fullName}</p>
              <p><strong>ಸಿಬ್ಬಂದಿ ಐಡಿ:</strong> <span className="font-mono text-blue-600 font-bold">{selectedStaff.staffId}</span></p>
              <p><strong>ಇಮೇಲ್:</strong> {selectedStaff.email}</p>
              {selectedStaff.requestedBeat && (
                <p><strong>ಕೋರಿದ ಬೀಟ್ (Requested):</strong> <span className="text-amber-700 font-bold">{selectedStaff.requestedBeat}</span></p>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-2">
                ಈ ಸಿಬ್ಬಂದಿಗೆ ಅಧಿಕೃತ ಬೀಟ್(ಗಳನ್ನು) ನಿಯೋಜಿಸಿ / Assign Beat(s) *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                {beatsList.map((b) => {
                  const isChecked = assignedBeats.includes(b.beatNumber);
                  return (
                    <label
                      key={b.beatNumber}
                      onClick={() => toggleBeatSelection(b.beatNumber)}
                      className={`cursor-pointer p-2 rounded-xl border flex items-center space-x-2 transition ${
                        isChecked
                          ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="truncate">{b.beatNumber}</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                ಆಯ್ಕೆಮಾಡಿದ ಬೀಟ್‌ಗಳಲ್ಲಿ ಮಾತ್ರ ಈ ಸಿಬ್ಬಂದಿಗೆ ಮನೆ ಸಮೀಕ್ಷೆ ನಡೆಸಲು ಮತ್ತು ದಾಖಲೆಗಳನ್ನು ವೀಕ್ಷಿಸಲು ಅನುಮತಿ ಇರುತ್ತದೆ.
              </p>
            </div>

            <div className="pt-3 border-t flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setApproveModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                ರದ್ದು / Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAction || assignedBeats.length === 0}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm disabled:opacity-50"
              >
                {submittingAction ? 'ಅನುಮೋದಿಸಲಾಗುತ್ತಿದೆ...' : 'ಅನುಮೋದಿಸಿ & ನಿಯೋಜಿಸಿ / Approve & Assign'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* REJECT STAFF MODAL */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="ಸಿಬ್ಬಂದಿ ಅರ್ಜಿ ತಿರಸ್ಕರಿಸಿ / Reject Staff Application"
        subtitle={`Reject registration request for ${selectedStaff?.fullName || ''}`}
      >
        {selectedStaff && (
          <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                ತಿರಸ್ಕಾರದ ಕಾರಣ / Rejection Reason (Optional)
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. ಸಿಬ್ಬಂದಿ ಐಡಿ ಪರಿಶೀಲನೆಯಲ್ಲಿ ಹೊಂದಿಕೆಯಾಗಿಲ್ಲ / Staff ID could not be verified."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="pt-3 border-t flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                ರದ್ದು / Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAction}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm disabled:opacity-50"
              >
                {submittingAction ? 'ತಿರಸ್ಕರಿಸಲಾಗುತ್ತಿದೆ...' : 'ಖಚಿತವಾಗಿ ತಿರಸ್ಕರಿಸಿ / Confirm Rejection'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ASSIGN JURISDICTION MODAL */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="ಬೀಟ್ ನಿಯೋಜನೆ ಬದಲಾಯಿಸಿ / Update Beat Jurisdiction"
        subtitle={`Configure authorized beats for ${selectedStaff?.fullName || 'Staff'}`}
      >
        {selectedStaff && (
          <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-2">
                ಅಧಿಕೃತ ಬೀಟ್‌ಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ (Select Beats) *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                {beatsList.map((b) => {
                  const isChecked = assignedBeats.includes(b.beatNumber);
                  return (
                    <label
                      key={b.beatNumber}
                      onClick={() => toggleBeatSelection(b.beatNumber)}
                      className={`cursor-pointer p-2 rounded-xl border flex items-center space-x-2 transition ${
                        isChecked
                          ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="truncate">{b.beatNumber}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                ರದ್ದು / Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAction || assignedBeats.length === 0}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm disabled:opacity-50"
              >
                {submittingAction ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'ನಿಯೋಜನೆ ಉಳಿಸಿ / Save Assignments'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="ಹೊಸ ಖಾತೆ ಸೃಷ್ಟಿ / Add System User"
        subtitle="Provision an authorized administrative or field staff user account."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">ಪೂರ್ಣ ಹೆಸರು / Full Name *</label>
            <input
              type="text"
              required
              value={createForm.fullName}
              onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
              placeholder="e.g. ರವಿಶಂಕರ್ / Ravi Shankar"
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ಸಿಬ್ಬಂದಿ ಐಡಿ / Staff ID</label>
              <input
                type="text"
                value={createForm.staffId}
                onChange={(e) => setCreateForm({ ...createForm, staffId: e.target.value })}
                placeholder="e.g. POL-1090"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 uppercase"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ಮೊಬೈಲ್ / Mobile</label>
              <input
                type="tel"
                value={createForm.mobileNumber}
                onChange={(e) => setCreateForm({ ...createForm, mobileNumber: e.target.value })}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ಬಳಕೆದಾರ ಹೆಸರು / Username *</label>
              <input
                type="text"
                required
                value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                placeholder="e.g. rshankar"
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ಇಮೇಲ್ / Email *</label>
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="e.g. rshankar@ksp.gov.in"
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">ಪಾಸ್‌ವರ್ಡ್ / Password * (Min 6 chars)</label>
            <input
              type="password"
              required
              minLength={6}
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ಪಾತ್ರ / Role *</label>
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="staff">ಬೀಟ್ ಸಿಬ್ಬಂದಿ / Staff</option>
                <option value="admin">ನಿರ್ವಾಹಕ / Administrator</option>
                <option value="viewer">ಮೇಲ್ವಿಚಾರಕ / Viewer</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ಖಾತೆ ಸ್ಥಿತಿ / Status</label>
              <select
                value={createForm.accountStatus}
                onChange={(e) => setCreateForm({ ...createForm, accountStatus: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="approved">Approved / Active</option>
                <option value="pending">Pending</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingAction}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {submittingAction ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
