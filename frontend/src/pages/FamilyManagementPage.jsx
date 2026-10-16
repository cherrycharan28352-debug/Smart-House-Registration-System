import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users2, Search, Edit2, Trash2, Plus, Home, RefreshCw } from 'lucide-react';
import { getAllFamilyMembers, updateFamilyMember, deleteFamilyMember } from '../services/houseService';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const FamilyManagementPage = () => {
  const { isStaff } = useAuth();
  const toast = useToast();

  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [relationship, setRelationship] = useState('');

  // Edit Modal State
  const [editingMember, setEditingMember] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState(null);

  const fetchMembers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAllFamilyMembers({
        page,
        limit: 10,
        search,
        relationship
      });
      setMembers(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error('Failed to load family members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers(1);
  }, [relationship]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMembers(1);
  };

  const handleOpenEdit = (m) => {
    setEditingMember({ ...m });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingMember) return;
    setSavingEdit(true);
    try {
      await updateFamilyMember(editingMember._id, editingMember);
      toast.success('Family member record updated successfully.');
      setEditModalOpen(false);
      fetchMembers(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to update member.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from household records?`)) return;
    try {
      await deleteFamilyMember(id);
      toast.success(`Removed ${name} from registry.`);
      fetchMembers(pagination.page);
    } catch (err) {
      toast.error('Failed to delete member.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Family & Household Census Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Comprehensive ledger of all co-residents, dependents, and family relations registered across houses.
          </p>
        </div>

        <button
          onClick={() => fetchMembers(pagination.page)}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by member name, member ID, occupation, or contact..."
            className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <select
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium"
        >
          <option value="">All Relationships</option>
          <option value="Spouse">Spouse</option>
          <option value="Child">Child</option>
          <option value="Parent">Parent</option>
          <option value="Sibling">Sibling</option>
          <option value="Relative">Relative</option>
          <option value="Tenant">Tenant</option>
          <option value="Other">Other</option>
        </select>

        <button
          onClick={() => fetchMembers(1)}
          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
        >
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching household member records..." />
        ) : members.length === 0 ? (
          <EmptyState
            title="No family members found"
            description="No members match your criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Member ID</th>
                  <th className="py-3.5 px-6">Full Name</th>
                  <th className="py-3.5 px-6">Relationship</th>
                  <th className="py-3.5 px-6">Age / Gender</th>
                  <th className="py-3.5 px-6">Occupation</th>
                  <th className="py-3.5 px-6">Contact Number</th>
                  <th className="py-3.5 px-6">Registered House</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {members.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-bold text-slate-700">
                      {m.memberId || 'N/A'}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">{m.fullName}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                        {m.relationship}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {m.age ? `${m.age} yrs` : 'N/A'} • {m.gender || 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-slate-700">{m.occupation || '—'}</td>
                    <td className="py-4 px-6 text-slate-600">{m.contactNumber || '—'}</td>
                    <td className="py-4 px-6">
                      {m.house ? (
                        <Link
                          to={`/houses/${m.house.houseId || m.house._id}`}
                          className="font-bold text-blue-600 hover:underline flex items-center"
                        >
                          <Home className="w-3.5 h-3.5 mr-1" />
                          {m.house.houseId}
                        </Link>
                      ) : (
                        <span className="text-slate-400">Unlinked</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right space-x-1">
                      {isStaff && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                            title="Edit Member"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(m._id, m.fullName)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Remove Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pagination.limit}
          onPageChange={(p) => fetchMembers(p)}
        />
      </div>

      {/* Edit Member Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Family Member Record"
        subtitle={`Updating information for ${editingMember?.fullName || ''}`}
      >
        {editingMember && (
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={editingMember.fullName}
                onChange={(e) => setEditingMember({ ...editingMember, fullName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Relationship *</label>
                <select
                  value={editingMember.relationship}
                  onChange={(e) => setEditingMember({ ...editingMember, relationship: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Relative">Relative</option>
                  <option value="Tenant">Tenant</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={editingMember.gender}
                  onChange={(e) => setEditingMember({ ...editingMember, gender: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  min="0"
                  max="130"
                  value={editingMember.age || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, age: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Number</label>
                <input
                  type="text"
                  value={editingMember.contactNumber || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, contactNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Occupation</label>
              <input
                type="text"
                value={editingMember.occupation || ''}
                onChange={(e) => setEditingMember({ ...editingMember, occupation: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div className="pt-3 border-t flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm disabled:opacity-50"
              >
                {savingEdit ? 'Saving...' : 'Save Updates'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default FamilyManagementPage;
