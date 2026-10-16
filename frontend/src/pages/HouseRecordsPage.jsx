import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  FileText,
  Download,
  Trash2,
  Edit,
  Eye,
  CheckSquare,
  Square,
  Building,
  RefreshCw,
  X,
  AlertTriangle
} from 'lucide-react';
import { getHouses, deleteHouse, getLocalitiesMeta } from '../services/houseService';
import {
  downloadSingleHousePDF,
  downloadSingleHouseExcel,
  downloadBulkHousesPDF,
  downloadBulkHousesExcel
} from '../services/exportService';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const HouseRecordsPage = () => {
  const navigate = useNavigate();
  const { isAdmin, isStaff } = useAuth();
  const toast = useToast();

  const [houses, setHouses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [locality, setLocality] = useState('');
  const [houseType, setHouseType] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Metadata for filter dropdowns
  const [metaOptions, setMetaOptions] = useState({ localities: [], houseTypes: [] });

  // Multi-Selection State
  const [selectedHouseIds, setSelectedHouseIds] = useState([]);

  // Delete Modal state
  const [houseToDelete, setHouseToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchRecords = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getHouses({
        page,
        limit: pagination.limit,
        search,
        locality,
        houseType,
        status,
        sortBy,
        sortOrder
      });
      setHouses(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error('Failed to load house records.');
    } finally {
      setLoading(false);
    }
  };

  const loadMeta = async () => {
    try {
      const meta = await getLocalitiesMeta();
      setMetaOptions(meta);
    } catch (err) {
      console.warn('Could not load locality metadata:', err.message);
    }
  };

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    fetchRecords(1);
  }, [locality, houseType, status, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecords(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setLocality('');
    setHouseType('');
    setStatus('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setSelectedHouseIds([]);
  };

  // Selection toggles
  const handleSelectAll = () => {
    if (selectedHouseIds.length === houses.length) {
      setSelectedHouseIds([]);
    } else {
      setSelectedHouseIds(houses.map((h) => h.houseId || h._id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedHouseIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Single Exports
  const handleSinglePDF = async (id, houseId) => {
    try {
      toast.info(`Generating PDF for ${houseId}...`);
      await downloadSingleHousePDF(id, houseId);
      toast.success(`PDF downloaded for ${houseId}`);
    } catch (err) {
      toast.error('Failed to export PDF.');
    }
  };

  const handleSingleExcel = async (id, houseId) => {
    try {
      toast.info(`Generating Excel for ${houseId}...`);
      await downloadSingleHouseExcel(id, houseId);
      toast.success(`Excel downloaded for ${houseId}`);
    } catch (err) {
      toast.error('Failed to export Excel.');
    }
  };

  // Bulk Exports
  const handleBulkPDF = async () => {
    if (!selectedHouseIds.length) return;
    try {
      toast.info(`Compiling bulk PDF for ${selectedHouseIds.length} properties...`);
      await downloadBulkHousesPDF(selectedHouseIds);
      toast.success(`Bulk PDF downloaded successfully.`);
    } catch (err) {
      toast.error('Bulk PDF generation failed.');
    }
  };

  const handleBulkExcel = async () => {
    if (!selectedHouseIds.length) return;
    try {
      toast.info(`Compiling 4-sheet Excel workbook for ${selectedHouseIds.length} properties...`);
      await downloadBulkHousesExcel(selectedHouseIds);
      toast.success(`Bulk Excel workbook downloaded successfully.`);
    } catch (err) {
      toast.error('Bulk Excel generation failed.');
    }
  };

  // Deletion
  const confirmDelete = (house) => {
    setHouseToDelete(house);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!houseToDelete) return;
    setDeleting(true);
    try {
      await deleteHouse(houseToDelete._id);
      toast.success(`House ${houseToDelete.houseId} and associated records deleted.`);
      setDeleteModalOpen(false);
      setHouseToDelete(null);
      fetchRecords(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to delete house.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            House Records Master Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, search, edit, inspect geocoordinates, and download verified PDF & Excel registration reports.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchRecords(pagination.page)}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Refresh records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/register-house"
            className="inline-flex items-center px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Register House
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by House ID (e.g. HR-1001), Owner name, street, locality, city..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Filters:</span>
          </div>

          {/* Locality Filter */}
          <select
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="">All Localities</option>
            {metaOptions.localities.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          {/* House Type Filter */}
          <select
            value={houseType}
            onChange={(e) => setHouseType(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="">All House Types</option>
            <option value="Independent house">Independent house</option>
            <option value="Apartment">Apartment</option>
            <option value="Rental house">Rental house</option>
            <option value="Other">Other</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="Registered">Registered</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Approved">Approved</option>
            <option value="Flagged">Flagged</option>
          </select>

          {/* Sort By */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-');
              setSortBy(sb);
              setSortOrder(so);
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="houseId-asc">House ID (A-Z)</option>
            <option value="locality-asc">Locality (A-Z)</option>
          </select>

          {(search || locality || houseType || status) && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center text-xs font-bold text-rose-600 hover:text-rose-800 ml-auto"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Floating Multi-Selection Action Bar (Section 14) */}
      {selectedHouseIds.length > 0 && (
        <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl animate-in slide-in-from-top-2">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 rounded-lg bg-blue-600 font-bold text-xs">
              {selectedHouseIds.length} Selected
            </span>
            <span className="text-xs text-slate-300">
              Bulk actions for selected registration records:
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleBulkPDF}
              className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Export Selected as PDF
            </button>

            <button
              type="button"
              onClick={handleBulkExcel}
              className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export Selected as Excel
            </button>

            <button
              type="button"
              onClick={() => setSelectedHouseIds([])}
              className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Main Records Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching house registration ledger..." />
        ) : houses.length === 0 ? (
          <EmptyState
            title="No house registrations found"
            description="No records match your search query or filter combination."
            actionLabel="Register a New House"
            actionLink="/register-house"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 w-10 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-slate-500 hover:text-slate-800"
                      title="Select all on this page"
                    >
                      {selectedHouseIds.length === houses.length ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4">House ID</th>
                  <th className="py-3.5 px-4">Address Details</th>
                  <th className="py-3.5 px-4">Type & Structure</th>
                  <th className="py-3.5 px-4">Registered Owner</th>
                  <th className="py-3.5 px-4">GPS Fix</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {houses.map((house) => {
                  const isSelected = selectedHouseIds.includes(house.houseId || house._id);

                  return (
                    <tr
                      key={house._id}
                      className={`hover:bg-slate-50/80 transition ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(house.houseId || house._id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                      </td>

                      <td className="py-4 px-4 font-extrabold text-blue-700">
                        <Link to={`/houses/${house.houseId || house._id}`} className="hover:underline">
                          {house.houseId}
                        </Link>
                      </td>

                      <td className="py-4 px-4 text-slate-800">
                        <div className="font-bold text-slate-900">
                          {house.houseNumber}, {house.streetName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {house.locality}, {house.city} - {house.pincode}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-600">
                        <div className="font-semibold text-slate-800">{house.houseType}</div>
                        <div className="text-[11px] text-slate-400">
                          {house.numberOfFloors} Flr • {house.numberOfRooms} Rms • {house.ownershipType}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-800">
                        <div className="font-semibold">{house.owner?.fullName || 'Not recorded'}</div>
                        <div className="text-[11px] text-slate-400">
                          {house.owner?.contactNumber || 'No contact'}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-600">
                        {house.gps ? (
                          <div className="text-[11px] font-mono text-slate-700">
                            {house.gps.latitude?.toFixed(4)}, {house.gps.longitude?.toFixed(4)}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            house.registrationStatus === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : house.registrationStatus === 'Pending Verification'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {house.registrationStatus}
                        </span>
                        {(house.security?.cctvInstalled === 'Yes' || (house.issues && house.issues.length > 0)) && (
                          <div className="flex flex-wrap items-center gap-1 mt-1.5">
                            {house.security?.cctvInstalled === 'Yes' && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold">
                                CCTV
                              </span>
                            )}
                            {house.issues && house.issues.length > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold">
                                {house.issues.length} Issue(s)
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right space-x-1 whitespace-nowrap">
                        <Link
                          to={`/houses/${house.houseId || house._id}`}
                          title="View Details"
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg inline-flex"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {isStaff && (
                          <Link
                            to={`/houses/${house.houseId || house._id}/edit`}
                            title="Edit House"
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg inline-flex"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={() => handleSinglePDF(house._id, house.houseId)}
                          title="Download PDF"
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg inline-flex"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSingleExcel(house._id, house.houseId)}
                          title="Download Excel Workbook"
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-lg inline-flex"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => confirmDelete(house)}
                            title="Delete House"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg inline-flex"
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
        )}

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pagination.limit}
          onPageChange={(p) => fetchRecords(p)}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm House Registration Deletion"
        subtitle="This action will permanently erase this record and its associated data."
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={executeDelete}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Permanently Delete Record'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start text-xs text-rose-900">
            <AlertTriangle className="w-5 h-5 mr-2 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Are you sure you want to delete {houseToDelete?.houseId}?</p>
              <p className="mt-1 text-rose-700">
                In compliance with database integrity rules, this will cascade and cleanly delete the owner record, all associated family members, and unlink and remove uploaded photo files from disk storage.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HouseRecordsPage;
