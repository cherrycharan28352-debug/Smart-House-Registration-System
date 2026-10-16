import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Search, Phone, Mail, Home, Shield, RefreshCw } from 'lucide-react';
import { getAllOwners } from '../services/houseService';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

const OwnerDetailsPage = () => {
  const [owners, setOwners] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ownershipType, setOwnershipType] = useState('');
  const toast = useToast();

  const fetchOwners = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAllOwners({
        page,
        limit: 10,
        search,
        ownershipType
      });
      setOwners(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error('Failed to load owner records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners(1);
  }, [ownershipType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOwners(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Registered Property Owners Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Directory of validated house custodians, correspondence addresses, and ownership credentials.
          </p>
        </div>

        <button
          onClick={() => fetchOwners(pagination.page)}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by owner name, contact number, email, or owner ID..."
            className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <select
          value={ownershipType}
          onChange={(e) => setOwnershipType(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium"
        >
          <option value="">All Ownership Types</option>
          <option value="Owned">Owned</option>
          <option value="Rented">Rented</option>
          <option value="Other">Other</option>
        </select>

        <button
          onClick={() => fetchOwners(1)}
          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
        >
          Search
        </button>
      </div>

      {/* Owners Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching owner records..." />
        ) : owners.length === 0 ? (
          <EmptyState
            title="No owners found"
            description="No owner records match your search query."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Owner ID</th>
                  <th className="py-3.5 px-6">Full Name</th>
                  <th className="py-3.5 px-6">Contact Phone</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">Ownership Type</th>
                  <th className="py-3.5 px-6">Associated House</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {owners.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-bold text-slate-700">
                      {o.ownerId || 'N/A'}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {o.fullName}
                      {o.age && <span className="text-[10px] text-slate-400 font-normal ml-1.5">({o.age} yrs)</span>}
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      <div className="flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        {o.contactNumber}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {o.email ? (
                        <div className="flex items-center">
                          <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                          {o.email}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                        {o.ownershipType}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {o.house ? (
                        <Link
                          to={`/houses/${o.house.houseId || o.house._id}`}
                          className="font-bold text-blue-600 hover:underline flex items-center"
                        >
                          <Home className="w-3.5 h-3.5 mr-1" />
                          {o.house.houseId} ({o.house.locality})
                        </Link>
                      ) : (
                        <span className="text-slate-400">Unlinked</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {o.house && (
                        <Link
                          to={`/houses/${o.house.houseId || o.house._id}`}
                          className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                        >
                          View House
                        </Link>
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
          onPageChange={(p) => fetchOwners(p)}
        />
      </div>
    </div>
  );
};

export default OwnerDetailsPage;
