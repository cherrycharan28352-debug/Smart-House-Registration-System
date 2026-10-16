import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileCheck2,
  Printer,
  Download,
  Building,
  QrCode,
  MapPin,
  User,
  Users2,
  Search,
  CheckCircle2
} from 'lucide-react';
import { getHouses, getHouseById } from '../services/houseService';
import { downloadSingleHousePDF } from '../services/exportService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';

const RegistrationSummaryPage = () => {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [houseList, setHouseList] = useState([]);
  const [selectedHouseId, setSelectedHouseId] = useState(initialId);
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Load house list for selector
  useEffect(() => {
    const loadList = async () => {
      try {
        const res = await getHouses({ limit: 50 });
        setHouseList(res.data);
        if (!selectedHouseId && res.data.length > 0) {
          setSelectedHouseId(res.data[0].houseId || res.data[0]._id);
        }
      } catch (err) {
        console.warn('Could not load house list:', err);
      }
    };
    loadList();
  }, []);

  // Fetch house detail when selected
  useEffect(() => {
    if (!selectedHouseId) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await getHouseById(selectedHouseId);
        setHouse(data);
      } catch (err) {
        toast.error('Could not load house registration summary.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [selectedHouseId]);

  const handleDownloadPDF = async () => {
    if (!house) return;
    try {
      toast.info(`Generating official PDF report for ${house.houseId}...`);
      await downloadSingleHousePDF(house._id, house.houseId);
      toast.success('Registration PDF downloaded.');
    } catch (err) {
      toast.error('Failed to generate PDF.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-12 print:p-0">
      {/* Top Controls Bar (Hidden on print) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-3">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
            Select House Record:
          </label>
          <select
            value={selectedHouseId}
            onChange={(e) => setSelectedHouseId(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-blue-900 focus:ring-2 focus:ring-blue-500"
          >
            {houseList.map((h) => (
              <option key={h._id} value={h.houseId || h._id}>
                {h.houseId} — {h.houseNumber}, {h.streetName} ({h.locality})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition"
          >
            <Printer className="w-4 h-4 mr-1.5 text-slate-500" />
            Print Certificate
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Download PDF
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Rendering official certificate summary..." />
      ) : !house ? (
        <p className="text-center text-xs text-slate-400 py-12">Please select a house record above.</p>
      ) : (
        /* Printable Certificate / Summary Document Card */
        <div className="bg-white rounded-3xl border border-slate-300 shadow-md p-8 sm:p-12 space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Official Document Banner */}
          <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🏛️</span>
                <span className="text-xs font-black tracking-widest uppercase text-blue-900">
                  MUNICIPAL CENSUS & URBAN HOUSING AUTHORITY
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                OFFICIAL HOUSE REGISTRATION CERTIFICATE
              </h2>
              <p className="text-xs text-slate-500">
                Official Administrative Dossier & Family Census Extract • Issued under Municipal Regulations
              </p>
            </div>

            {/* QR Code Block */}
            <div className="border border-slate-200 p-2 rounded-xl bg-slate-50 text-center flex-shrink-0">
              <QrCode className="w-14 h-14 text-slate-900 mx-auto" />
              <span className="text-[9px] font-mono font-bold text-slate-600 block mt-1">
                {house.houseId}
              </span>
            </div>
          </div>

          {/* Registration Metadata Bar */}
          <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400 uppercase text-[10px] block font-bold">Registration ID</span>
              <span className="font-mono font-black text-sm text-blue-300">{house.houseId}</span>
            </div>

            <div>
              <span className="text-slate-400 uppercase text-[10px] block font-bold">Registration Date</span>
              <span className="font-semibold">
                {house.registrationDate ? new Date(house.registrationDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 uppercase text-[10px] block font-bold">Status</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase">
                {house.registrationStatus}
              </span>
            </div>

            <div>
              <span className="text-slate-400 uppercase text-[10px] block font-bold">Document Ref</span>
              <span className="font-mono text-slate-300">SHMS-DOC-{house._id?.slice(-6)?.toUpperCase()}</span>
            </div>
          </div>

          {/* Section 1: House Property */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-blue-100 pb-1.5 flex items-center">
              <Building className="w-3.5 h-3.5 mr-1.5 text-blue-700" />
              1. House Property & Physical Address
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">House Number:</span>
                <span className="font-bold text-slate-900">{house.houseNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Street:</span>
                <span className="font-bold text-slate-900">{house.streetName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Locality / Sector:</span>
                <span className="font-bold text-slate-900">{house.locality}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">City / Village:</span>
                <span className="font-bold text-slate-900">{house.city}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">District & State:</span>
                <span className="font-bold text-slate-900">{house.district}, {house.state}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">PIN Code:</span>
                <span className="font-bold text-slate-900">{house.pincode}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">House Type:</span>
                <span className="font-bold text-slate-900">{house.houseType}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Floors & Rooms:</span>
                <span className="font-bold text-slate-900">
                  {house.numberOfFloors} Floor(s) / {house.numberOfRooms} Room(s)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Ownership Classification:</span>
                <span className="font-bold text-slate-900">{house.ownershipType}</span>
              </div>
            </div>
          </div>

          {/* Section 2: GPS Geolocation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-blue-100 pb-1.5 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-700" />
              2. GPS Geodetic Positioning
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Latitude:</span>
                <span className="font-mono font-bold text-slate-900">
                  {house.gps?.latitude?.toFixed(6) || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Longitude:</span>
                <span className="font-mono font-bold text-slate-900">
                  {house.gps?.longitude?.toFixed(6) || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Accuracy:</span>
                <span className="font-semibold text-slate-700">
                  {house.gps?.accuracy ? `±${house.gps.accuracy} meters` : 'Verified Fix'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Map Fix Source:</span>
                <span className="font-semibold text-slate-700 uppercase">{house.gps?.source || 'GPS'}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Owner Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-blue-100 pb-1.5 flex items-center">
              <User className="w-3.5 h-3.5 mr-1.5 text-blue-700" />
              3. Registered House Owner
            </h4>

            {house.owner ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Owner Name:</span>
                  <span className="font-bold text-slate-900">{house.owner.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Phone:</span>
                  <span className="font-bold text-slate-900">{house.owner.contactNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Email:</span>
                  <span className="font-semibold text-slate-700">{house.owner.email || 'None'}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No primary owner recorded.</p>
            )}
          </div>

          {/* Section 4: Family Members */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-blue-100 pb-1.5 flex items-center">
              <Users2 className="w-3.5 h-3.5 mr-1.5 text-blue-700" />
              4. Household Census Members ({(house.familyMembers && house.familyMembers.length) || 0})
            </h4>

            {house.familyMembers && house.familyMembers.length > 0 ? (
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2 border-b">#</th>
                    <th className="p-2 border-b">Member Name</th>
                    <th className="p-2 border-b">Relationship</th>
                    <th className="p-2 border-b">Age / Gender</th>
                    <th className="p-2 border-b">Occupation</th>
                    <th className="p-2 border-b">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {house.familyMembers.map((m, idx) => (
                    <tr key={idx}>
                      <td className="p-2 text-slate-400">{idx + 1}</td>
                      <td className="p-2 font-bold text-slate-900">{m.fullName}</td>
                      <td className="p-2 font-semibold text-blue-700">{m.relationship}</td>
                      <td className="p-2 text-slate-600">{m.age ? `${m.age} yrs` : 'N/A'} • {m.gender || 'N/A'}</td>
                      <td className="p-2 text-slate-600">{m.occupation || '—'}</td>
                      <td className="p-2 text-slate-600">{m.contactNumber || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-slate-400 italic">No additional family members registered.</p>
            )}
          </div>

          {/* Statutory Disclaimer & Signature Block */}
          <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="max-w-md text-[10px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-700">Official Municipal Notice:</p>
              <p>
                This official summary report is issued for municipal administrative and census reference purposes. It does not constitute a legal property ownership deed or land boundary title.
              </p>
            </div>

            <div className="text-center sm:text-right text-xs">
              <div className="w-44 border-b border-slate-400 pb-1 mb-1 mx-auto sm:ml-auto">
                <span className="text-[10px] font-mono text-slate-400">[Digital Seal Verified]</span>
              </div>
              <p className="font-bold text-slate-900">Registrar / Issuing Officer</p>
              <p className="text-[10px] text-slate-500">Municipal Housing Department</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationSummaryPage;
