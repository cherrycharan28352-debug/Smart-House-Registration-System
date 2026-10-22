import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  User,
  Users2,
  FileText,
  Download,
  Printer,
  Edit,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
  DoorOpen,
  Image as ImageIcon,
  CheckCircle,
  QrCode,
  Shield,
  ShieldAlert,
  Plus,
  AlertTriangle,
  MessageSquare,
  ClipboardList,
  CheckCircle2,
  Clock,
  Briefcase,
  Trash2
} from 'lucide-react';
import {
  getHouseById,
  addHouseIssue,
  updateIssueAction,
  updateHouseSecurity,
  deleteHouse
} from '../services/houseService';
import { downloadSingleHousePDF, downloadSingleHouseExcel } from '../services/exportService';
import HouseLocationMap from '../components/map/HouseLocationMap';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const HouseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStaff, isAdmin } = useAuth();
  const toast = useToast();

  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Security & Issues Survey Modal States
  const [isAddIssueModalOpen, setIsAddIssueModalOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({
    dateReported: new Date().toISOString().split('T')[0],
    category: 'Police-related',
    description: '',
    additionalRemarks: ''
  });
  const [savingIssue, setSavingIssue] = useState(false);

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [actionForm, setActionForm] = useState({
    responsibleDepartment: 'Police Department',
    actionTaken: '',
    actionDate: new Date().toISOString().split('T')[0],
    status: 'Pending',
    followUpRemarks: ''
  });
  const [savingAction, setSavingAction] = useState(false);

  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [securityForm, setSecurityForm] = useState({
    cctvInstalled: 'No',
    securityGuardPresent: 'No',
    otherArrangements: ''
  });
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchHouse = async () => {
    setLoading(true);
    try {
      const data = await getHouseById(id);
      setHouse(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load house record.');
      navigate('/houses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouse();
  }, [id]);

  const handleDeleteRecord = async () => {
    setDeleting(true);
    try {
      await deleteHouse(house._id || house.houseId);
      toast.success(`ಮನೆ ದಾಖಲೆ ${house.houseId} ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ / House record deleted successfully.`);
      setDeleteModalOpen(false);
      navigate('/houses');
    } catch (err) {
      toast.error(err.message || 'Failed to delete house registration.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      toast.info(`Generating official registration PDF...`);
      await downloadSingleHousePDF(house._id, house.houseId);
      toast.success('Registration PDF downloaded successfully.');
    } catch (err) {
      toast.error('Failed to generate PDF.');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      toast.info(`Generating Excel report...`);
      await downloadSingleHouseExcel(house._id, house.houseId);
      toast.success('Excel workbook downloaded successfully.');
    } catch (err) {
      toast.error('Failed to generate Excel workbook.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const canRecordIssue = isAdmin || (isStaff && user?.assignedBeats?.includes(house?.beatNumber));

  const handleOpenAddIssue = () => {
    setIssueForm({
      dateReported: new Date().toISOString().split('T')[0],
      category: 'Police-related',
      description: '',
      additionalRemarks: ''
    });
    setIsAddIssueModalOpen(true);
  };

  const handleSaveIssue = async (e) => {
    e.preventDefault();
    if (!issueForm.description.trim()) {
      toast.error('ದಯವಿಟ್ಟು ಸಮಸ್ಯೆಯ ವಿವರ ನಮೂದಿಸಿ / Please enter issue description.');
      return;
    }
    setSavingIssue(true);
    try {
      await addHouseIssue(house._id, issueForm);
      toast.success('ಹೊಸ ಸಮಸ್ಯೆ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ / Issue recorded successfully.');
      setIsAddIssueModalOpen(false);
      await fetchHouse();
    } catch (err) {
      toast.error(err.message || 'Failed to record issue.');
    } finally {
      setSavingIssue(false);
    }
  };

  const handleOpenActionModal = (iss) => {
    setSelectedIssue(iss);
    setActionForm({
      responsibleDepartment: iss.responsibleDepartment || (iss.category === 'Other department' ? 'Concerned Department' : 'Police Department'),
      actionTaken: iss.actionTaken || '',
      actionDate: iss.actionDate ? new Date(iss.actionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: iss.status || 'Pending',
      followUpRemarks: iss.followUpRemarks || ''
    });
    setIsActionModalOpen(true);
  };

  const handleSaveAction = async (e) => {
    e.preventDefault();
    if (!selectedIssue) return;
    setSavingAction(true);
    try {
      await updateIssueAction(house._id, selectedIssue.issueId || selectedIssue._id, actionForm);
      toast.success('ಇಲಾಖಾ ಕ್ರಮ ಮತ್ತು ಸ್ಥಿತಿ ನವೀಕರಿಸಲಾಗಿದೆ / Action and status updated.');
      setIsActionModalOpen(false);
      setSelectedIssue(null);
      await fetchHouse();
    } catch (err) {
      toast.error(err.message || 'Failed to update action.');
    } finally {
      setSavingAction(false);
    }
  };

  const handleOpenSecurityModal = () => {
    setSecurityForm({
      cctvInstalled: house.security?.cctvInstalled || 'No',
      securityGuardPresent: house.security?.securityGuardPresent || 'No',
      otherArrangements: house.security?.otherArrangements || ''
    });
    setIsSecurityModalOpen(true);
  };

  const handleSaveSecurity = async (e) => {
    e.preventDefault();
    setSavingSecurity(true);
    try {
      await updateHouseSecurity(house._id, securityForm);
      toast.success('ಭದ್ರತಾ ವಿವರಗಳನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ / Security survey updated.');
      setIsSecurityModalOpen(false);
      await fetchHouse();
    } catch (err) {
      toast.error(err.message || 'Failed to update security.');
    } finally {
      setSavingSecurity(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving validated house dossier..." size="large" />;
  }

  if (!house) {
    return (
      <div className="text-center p-12">
        <p className="text-sm text-slate-500">Record not found.</p>
        <Link to="/houses" className="text-xs text-blue-600 font-bold mt-2 inline-block">
          &larr; Back to Records Ledger
        </Link>
      </div>
    );
  }

  const hasGps = Boolean(house.gps && house.gps.latitude && house.gps.longitude);
  const googleMapsUrl = hasGps
    ? `https://www.google.com/maps?q=${house.gps.latitude},${house.gps.longitude}`
    : null;

  const photos = house.photos || [];
  const family = house.familyMembers || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in pb-12 print:p-0">
      {/* Top Action Bar (Hidden during window.print()) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <Link
          to="/houses"
          className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to House Records
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {(isAdmin || (isStaff && user?.assignedBeats?.includes(house.beatNumber))) && (
            <Link
              to={`/houses/${house.houseId || house._id}/edit`}
              className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition"
            >
              <Edit className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Edit Registration
            </Link>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
              Delete Registration
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Print Record
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Download PDF
          </button>

          <button
            type="button"
            onClick={handleDownloadExcel}
            className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download Excel
          </button>
        </div>
      </div>

      {/* Main Dossier Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold tracking-wide uppercase border border-blue-400/30">
              Registration ID: {house.houseId}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                house.registrationStatus === 'Approved'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : 'bg-blue-500/20 text-blue-200 border border-blue-400/30'
              }`}
            >
              {house.registrationStatus}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {house.houseNumber}, {house.streetName}
          </h1>
          <p className="text-sm text-slate-300 mt-1 flex items-center">
            <MapPin className="w-4 h-4 mr-1 text-blue-400" />
            {house.locality}, {house.city}, {house.district}, {house.state} - {house.pincode}
          </p>
        </div>

        {/* QR Verification Badge */}
        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 self-start md:self-auto">
          <div className="w-12 h-12 bg-white text-slate-900 rounded-xl flex items-center justify-center font-bold">
            <QrCode className="w-8 h-8 text-blue-900" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-white uppercase tracking-wider">
              Verification Code
            </p>
            <p className="text-[10px] text-slate-300 font-mono mt-0.5">SHMS-{house.houseId}</p>
            <span className="text-[9px] text-emerald-400 font-semibold flex items-center mt-0.5">
              <CheckCircle className="w-2.5 h-2.5 mr-1" />
              Verified Authenticated
            </span>
          </div>
        </div>
      </div>

      {/* Grid: House Property Details + GPS Geolocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Property Specifications */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <Building2 className="w-4 h-4 mr-2 text-blue-600" />
              Property Architecture & Census Specifications
            </h3>
            <span className="text-xs font-semibold text-slate-400">Section 1</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 text-xs">
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                House Type:
              </span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{house.houseType}</p>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                Floors & Rooms:
              </span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">
                {house.numberOfFloors} Floor(s) • {house.numberOfRooms} Room(s)
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                Tenancy / Ownership:
              </span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{house.ownershipType}</p>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                Locality / Sector:
              </span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{house.locality}</p>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                Village / City:
              </span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{house.city}</p>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                PIN Code:
              </span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{house.pincode}</p>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                District:
              </span>
              <p className="font-semibold text-slate-700 mt-0.5">{house.district}</p>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                State:
              </span>
              <p className="font-semibold text-slate-700 mt-0.5">{house.state}</p>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                Registration Date:
              </span>
              <p className="font-semibold text-slate-700 mt-0.5">
                {house.registrationDate ? new Date(house.registrationDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          {house.remarks && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600">
              <span className="font-bold text-slate-800 block text-[10px] uppercase mb-1">
                Administrative Remarks:
              </span>
              {house.remarks}
            </div>
          )}
        </div>

        {/* GPS Map & Coordinates */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
                GPS Geolocation
              </h3>
              {googleMapsUrl ? (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center"
                >
                  Google Maps <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              ) : (
                <span className="text-[11px] text-slate-400 italic">Optional / Not Tagged</span>
              )}
            </div>

            {/* Embedded interactive map */}
            <HouseLocationMap singleHouse={house} height="h-48" />

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Latitude:</span>
                <span className="font-mono font-bold text-slate-800">
                  {hasGps && !isNaN(Number(house.gps.latitude))
                    ? Number(house.gps.latitude).toFixed(6)
                    : 'Not Captured (Optional)'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Longitude:</span>
                <span className="font-mono font-bold text-slate-800">
                  {hasGps && !isNaN(Number(house.gps.longitude))
                    ? Number(house.gps.longitude).toFixed(6)
                    : 'Not Captured (Optional)'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">GPS Accuracy:</span>
                <span className={`font-semibold ${hasGps ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {hasGps
                    ? (house.gps?.accuracy ? `±${house.gps.accuracy} meters` : 'GPS Verified')
                    : 'Optional / Not Tagged'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 italic">
            OpenStreetMap geodetic coordinates. Does not imply legal boundary cadastral certification.
          </div>
        </div>
      </div>

      {/* Grid: Owner Details + Family Members */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Owner Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <User className="w-4 h-4 mr-2 text-blue-600" />
              Registered House Owner
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              {house.owner?.ownerId || 'OWN-ID'}
            </span>
          </div>

          {house.owner ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">
                  Full Name:
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{house.owner.fullName}</p>
              </div>

              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">
                  Contact Number:
                </span>
                <p className="font-semibold text-slate-800 mt-0.5">{house.owner.contactNumber}</p>
              </div>

              {house.owner.email && (
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">
                    Email:
                  </span>
                  <p className="font-semibold text-slate-800 mt-0.5">{house.owner.email}</p>
                </div>
              )}

              {house.owner.age && (
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Age:</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{house.owner.age} years old</p>
                </div>
              )}

              {house.owner.idReference && (
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">
                    ID Reference:
                  </span>
                  <p className="font-semibold text-slate-800 mt-0.5">{house.owner.idReference}</p>
                </div>
              )}

              {house.owner.correspondenceAddress && (
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">
                    Alt. Correspondence Address:
                  </span>
                  <p className="text-slate-700 mt-0.5">{house.owner.correspondenceAddress}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No owner recorded.</p>
          )}
        </div>

        {/* Family Members Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <Users2 className="w-4 h-4 mr-2 text-indigo-600" />
              Household & Family Members ({family.length})
            </h3>
            <Link
              to={`/family`}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Manage Family &rarr;
            </Link>
          </div>

          {family.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center italic">
              No family members registered for this house.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Member Name</th>
                    <th className="py-2.5 px-3">Relationship</th>
                    <th className="py-2.5 px-3">Age / Gender</th>
                    <th className="py-2.5 px-3">Occupation</th>
                    <th className="py-2.5 px-3">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {family.map((m, idx) => (
                    <tr key={m._id || idx} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{m.fullName}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                          {m.relationship}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {m.age ? `${m.age} yrs` : 'N/A'} • {m.gender || 'N/A'}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{m.occupation || 'N/A'}</td>
                      <td className="py-3 px-3 text-slate-600">{m.contactNumber || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION: ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್ — Security and Issues Survey */}
      {/* ============================================================== */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                ಅಧಿಕೃತ ಪೊಲೀಸ್ ಬೀಟ್ ಸಮೀಕ್ಷೆ • Official Police Survey
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-amber-600" />
              ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್ — Security and Issues Survey
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ಭದ್ರತಾ ವ್ಯವಸ್ಥೆ, ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆಗಳು ಮತ್ತು ಸಲಹೆಗಳ ಸಮೀಕ್ಷಾ ವಿವರಗಳು (Security Present on Premises & Grievances).
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {canRecordIssue && (
              <button
                type="button"
                onClick={handleOpenAddIssue}
                className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm transition"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                + Record New Issue / ಹೊಸ ಸಮಸ್ಯೆ ದಾಖಲಿಸಿ
              </button>
            )}
          </div>
        </div>

        {/* 1. Security Present on Premises / ಭದ್ರತಾ ವ್ಯವಸ್ಥೆ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
              <ShieldAlert className="w-4 h-4 mr-1.5 text-amber-600" />
              1. Security Present on Premises / ಭದ್ರತಾ ವ್ಯವಸ್ಥೆ
            </h4>
            {isAdmin && (
              <button
                type="button"
                onClick={handleOpenSecurityModal}
                className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center"
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit Security / ಭದ್ರತಾ ವಿವರ ಬದಲಿಸಿ
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* CCTV Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">CCTV Installed:</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block">ಸಿ.ಸಿ.ಟಿ.ವಿ ಕ್ಯಾಮೆರಾ</span>
              </div>
              <div>
                {house.security?.cctvInstalled === 'Yes' || house.security?.cctvInstalled === 'ಹೌದು' ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    ಹೌದು / Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                    ಇಲ್ಲ / No
                  </span>
                )}
              </div>
            </div>

            {/* Security Guard Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Security Guard Present:</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block">ಭದ್ರತಾ ಸಿಬ್ಬಂದಿ</span>
              </div>
              <div>
                {house.security?.securityGuardPresent === 'Yes' || house.security?.securityGuardPresent === 'ಹೌದು' ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    ಹೌದು / Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                    ಇಲ್ಲ / No
                  </span>
                )}
              </div>
            </div>

            {/* Other Security Arrangements Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Other Security Arrangements:</span>
              <p className="text-xs font-semibold text-slate-800 mt-0.5 truncate" title={house.security?.otherArrangements || 'None'}>
                {house.security?.otherArrangements || 'ಇತರ ವ್ಯವಸ್ಥೆಗಳಿಲ್ಲ / None specified'}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Issues and Suggestions Received / ಸ್ವೀಕರಿಸಲಾದ ಸಮಸ್ಯೆಗಳು ಮತ್ತು ಸಲಹೆಗಳು */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
              <ClipboardList className="w-4 h-4 mr-1.5 text-blue-600" />
              2. Issues / Suggestions Received / Date (ಸ್ವೀಕರಿಸಲಾದ ಸಮಸ್ಯೆಗಳು & ಸಲಹೆಗಳು)
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                {(house.issues && house.issues.length) || 0}
              </span>
            </h4>
          </div>

          {(!house.issues || house.issues.length === 0) ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <ShieldCheck className="w-8 h-8 mx-auto text-emerald-600 mb-2 opacity-80" />
              <p className="text-xs font-bold text-slate-700">ಯಾವುದೇ ಸಮಸ್ಯೆಗಳು ಅಥವಾ ದೂರುಗಳು ದಾಖಲಾಗಿಲ್ಲ</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                No public issues or grievance suggestions have been recorded for this household.
              </p>
              {canRecordIssue && (
                <button
                  type="button"
                  onClick={handleOpenAddIssue}
                  className="mt-3 inline-flex items-center px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  + Record Issue Now
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5">#</th>
                    <th className="py-3 px-3.5">Date Reported</th>
                    <th className="py-3 px-3.5">Category</th>
                    <th className="py-3 px-3.5 min-w-[200px]">Issue / Suggestion Description</th>
                    <th className="py-3 px-3.5 min-w-[200px]">Action Taken & Department</th>
                    <th className="py-3 px-3.5">Status</th>
                    {isAdmin && <th className="py-3 px-3.5 text-right">Admin Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {house.issues.map((iss, idx) => {
                    const statusBg =
                      iss.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : iss.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200';

                    return (
                      <tr key={iss._id || iss.issueId || idx} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-3.5 text-slate-400 font-bold">{idx + 1}</td>
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
                          <p className="font-bold text-slate-900 leading-snug">{iss.description}</p>
                          {iss.additionalRemarks && (
                            <p className="text-[11px] text-slate-500 mt-1 italic">
                              Remarks: {iss.additionalRemarks}
                            </p>
                          )}
                          {iss.reportedByName && (
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Reported by: {iss.reportedByName}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3.5">
                          {iss.actionTaken ? (
                            <div className="space-y-0.5">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold inline-block">
                                {iss.responsibleDepartment || 'Police'}
                              </span>
                              <p className="font-semibold text-slate-800 text-[11px] mt-0.5">
                                {iss.actionTaken}
                              </p>
                              {iss.followUpRemarks && (
                                <p className="text-[10px] text-slate-500 italic">
                                  Follow-up: {iss.followUpRemarks}
                                </p>
                              )}
                              {iss.actionDate && (
                                <span className="text-[10px] text-slate-400 block">
                                  Action date: {new Date(iss.actionDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">
                              Awaiting department review / ಕ್ರಮ ಬಾಕಿ
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${statusBg}`}>
                            {iss.status || 'Pending'}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-3.5 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleOpenActionModal(iss)}
                              className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition border border-blue-200/60"
                            >
                              Update Action
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* House Photographs Gallery */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center">
            <ImageIcon className="w-4 h-4 mr-2 text-blue-600" />
            House Photo Gallery & On-Site Imagery ({photos.length})
          </h3>
          <span className="text-xs text-slate-400 font-medium">Click to inspect</span>
        </div>

        {photos.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center italic">
            No photographs have been uploaded for this house yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {photos.map((p, idx) => {
              const src = p.filePath ? `/${p.filePath}` : '';

              return (
                <div
                  key={p._id || idx}
                  onClick={() => setSelectedPhoto(p)}
                  className="cursor-pointer group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative aspect-[4/3] shadow-sm hover:shadow-md transition"
                >
                  <img
                    src={src}
                    alt={p.category}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/400x300?text=House+Photo';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                      {p.category}
                    </span>
                    {p.caption && <span className="text-[10px] text-slate-300 truncate">{p.caption}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>


      {/* Photo Lightbox Modal */}
      <Modal
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        title={selectedPhoto?.category || 'House Photograph'}
        subtitle={`Captured on ${selectedPhoto ? new Date(selectedPhoto.createdAt).toLocaleDateString() : ''}`}
        maxWidth="max-w-3xl"
      >
        {selectedPhoto && (
          <div className="space-y-3">
            <div className="max-h-[60vh] overflow-hidden rounded-xl bg-slate-900 flex items-center justify-center">
              <img
                src={`/${selectedPhoto.filePath}`}
                alt={selectedPhoto.category}
                className="max-h-[60vh] w-auto object-contain mx-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/600x400?text=House+Image';
                }}
              />
            </div>
            {selectedPhoto.caption && (
              <p className="text-xs text-slate-600 font-medium italic text-center">
                "{selectedPhoto.caption}"
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* 1. Modal: Record New Issue / ಹೊಸ ಸಮಸ್ಯೆ ದಾಖಲಿಸಿ */}
      <Modal
        isOpen={isAddIssueModalOpen}
        onClose={() => setIsAddIssueModalOpen(false)}
        title="Record New Issue or Suggestion / ಹೊಸ ಸಮಸ್ಯೆ ದಾಖಲಿಸಿ"
        subtitle={`House: ${house.houseId} (${house.houseNumber}) • ${house.beatNumber} • ${house.village}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveIssue} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Date Reported / ವರದಿ ಮಾಡಿದ ದಿನಾಂಕ <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={issueForm.dateReported}
                onChange={(e) => setIssueForm({ ...issueForm, dateReported: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Category / ಇಲಾಖೆ ವರ್ಗ <span className="text-rose-500">*</span>
              </label>
              <select
                value={issueForm.category}
                onChange={(e) => setIssueForm({ ...issueForm, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
              >
                <option value="Police-related">Police-related / ಪೊಲೀಸ್ ಇಲಾಖೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ</option>
                <option value="Other department">Other department / ಇತರ ಇಲಾಖೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Issue or Suggestion Description / ಸಮಸ್ಯೆ ಅಥವಾ ಸಲಹೆಯ ವಿವರ <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={issueForm.description}
                onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                placeholder="ನಾಗರಿಕರು ನೀಡಿದ ಸಮಸ್ಯೆ, ದೂರು ಅಥವಾ ಸಲಹೆಯನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ನಮೂದಿಸಿ..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Additional Remarks / ಹೆಚ್ಚುವರಿ ಟಿಪ್ಪಣಿಗಳು (Optional)
              </label>
              <input
                type="text"
                value={issueForm.additionalRemarks}
                onChange={(e) => setIssueForm({ ...issueForm, additionalRemarks: e.target.value })}
                placeholder="ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ ಅಥವಾ ಸಾಕ್ಷಿಗಳು / Additional notes"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddIssueModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              ರದ್ದುಗೊಳಿಸಿ / Cancel
            </button>
            <button
              type="submit"
              disabled={savingIssue}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {savingIssue ? 'ದಾಖಲಾಗುತ್ತಿದೆ...' : 'ಸಮಸ್ಯೆ ದಾಖಲಿಸಿ / Save Issue'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Modal: Update Action Taken & Status (Admin Only) */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title="Update Action Taken & Status / ಕೈಗೊಂಡ ಕ್ರಮ ಮತ್ತು ಸ್ಥಿತಿ"
        subtitle={`Issue ID: ${selectedIssue?.issueId || 'ISSUE'} • ${selectedIssue?.category || 'Police'}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveAction} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
            <span className="font-bold text-slate-900 block mb-0.5">ವರದಿ ಮಾಡಿದ ಸಮಸ್ಯೆ (Reported Issue):</span>
            <p className="italic">{selectedIssue?.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Current Status / ಪ್ರಸ್ತುತ ಪರಿಹಾರ ಸ್ಥಿತಿ <span className="text-rose-500">*</span>
              </label>
              <select
                value={actionForm.status}
                onChange={(e) => setActionForm({ ...actionForm, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
              >
                <option value="Pending">Pending / ಬಾಕಿ ಇದೆ</option>
                <option value="In Progress">In Progress / ಪ್ರಗತಿಯಲ್ಲಿದೆ</option>
                <option value="Resolved">Resolved / ಪರಿಹರಿಸಲಾಗಿದೆ</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Action Date / ಕ್ರಮ ಕೈಗೊಂಡ ದಿನಾಂಕ
              </label>
              <input
                type="date"
                value={actionForm.actionDate}
                onChange={(e) => setActionForm({ ...actionForm, actionDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Responsible Department / ಜವಾಬ್ದಾರಿಯುತ ಇಲಾಖೆ <span className="text-rose-500">*</span>
              </label>
              <select
                value={actionForm.responsibleDepartment}
                onChange={(e) => setActionForm({ ...actionForm, responsibleDepartment: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
              >
                <option value="Police Department">Police Department / ಪೊಲೀಸ್ ಇಲಾಖೆ</option>
                <option value="Gram Panchayat">Gram Panchayat / ಗ್ರಾಮ ಪಂಚಾಯತಿ</option>
                <option value="BESCOM (Electricity)">BESCOM (Electricity) / ಬೆಸ್ಕಾಂ (ವಿದ್ಯುತ್)</option>
                <option value="Taluk Administration / Tahsildar">Taluk Administration / ತಹಶೀಲ್ದಾರ್ ಕಚೇರಿ</option>
                <option value="PWD (Public Works)">PWD (Public Works) / ಲೋಕೋಪಯೋಗಿ ಇಲಾಖೆ</option>
                <option value="Health & Family Welfare">Health & Family Welfare / ಆರೋಗ್ಯ ಇಲಾಖೆ</option>
                <option value="Revenue Department">Revenue Department / ಕಂದಾಯ ಇಲಾಖೆ</option>
                <option value="Forest Department">Forest Department / ಅರಣ್ಯ ಇಲಾಖೆ</option>
                <option value="Other Department">Other Department / ಇತರ ಇಲಾಖೆ</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Action Taken / ಇಲಾಖೆಯಿಂದ ಕೈಗೊಂಡ ಕ್ರಮ <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={actionForm.actionTaken}
                onChange={(e) => setActionForm({ ...actionForm, actionTaken: e.target.value })}
                placeholder="ಇಲಾಖೆಯಿಂದ ಕೈಗೊಂಡ ಕ್ರಮ ಅಥವಾ ಪರಿಹಾರ ಕ್ರಮಗಳನ್ನು ನಮೂದಿಸಿ..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Follow-up Remarks / ಮುಂದಿನ ಕ್ರಮದ ಟಿಪ್ಪಣಿಗಳು (Optional)
              </label>
              <input
                type="text"
                value={actionForm.followUpRemarks}
                onChange={(e) => setActionForm({ ...actionForm, followUpRemarks: e.target.value })}
                placeholder="ಮುಂದಿನ ಪರಿಶೀಲನಾ ದಿನಾಂಕ ಅಥವಾ ಹೆಚ್ಚಿನ ಸೂಚನೆಗಳು / Follow-up notes"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsActionModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              ರದ್ದುಗೊಳಿಸಿ / Cancel
            </button>
            <button
              type="submit"
              disabled={savingAction}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {savingAction ? 'ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ...' : 'ಕ್ರಮ ಉಳಿಸಿ / Save Action'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Modal: Edit Security Present on Premises (Admin Only) */}
      <Modal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        title="Edit Security Present on Premises / ಭದ್ರತಾ ವ್ಯವಸ್ಥೆ"
        subtitle={`House: ${house.houseId} • ${house.village}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveSecurity} className="space-y-4">
          <div className="space-y-3 text-xs">
            {/* CCTV Installed */}
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                CCTV Installed / ಸಿ.ಸಿ.ಟಿ.ವಿ ಅಳವಡಿಸಲಾಗಿದೆಯೇ?
              </label>
              <div className="flex items-center space-x-3">
                {['Yes', 'No'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSecurityForm({ ...securityForm, cctvInstalled: opt })}
                    className={`flex-1 py-2 px-3 font-bold rounded-xl border transition ${
                      securityForm.cctvInstalled === opt
                        ? opt === 'Yes'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-800 text-white border-slate-800 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {opt === 'Yes' ? 'ಹೌದು / Yes' : 'ಇಲ್ಲ / No'}
                  </button>
                ))}
              </div>
            </div>

            {/* Security Guard Present */}
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                Security Guard Present / ಭದ್ರತಾ ಸಿಬ್ಬಂದಿ ಇದ್ದಾರೆಯೇ?
              </label>
              <div className="flex items-center space-x-3">
                {['Yes', 'No'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSecurityForm({ ...securityForm, securityGuardPresent: opt })}
                    className={`flex-1 py-2 px-3 font-bold rounded-xl border transition ${
                      securityForm.securityGuardPresent === opt
                        ? opt === 'Yes'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-800 text-white border-slate-800 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {opt === 'Yes' ? 'ಹೌದು / Yes' : 'ಇಲ್ಲ / No'}
                  </button>
                ))}
              </div>
            </div>

            {/* Other Security Arrangements */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Other Security Arrangements / ಇತರ ಭದ್ರತಾ ವ್ಯವಸ್ಥೆಗಳು
              </label>
              <input
                type="text"
                value={securityForm.otherArrangements}
                onChange={(e) => setSecurityForm({ ...securityForm, otherArrangements: e.target.value })}
                placeholder="e.g. Alarm system, fenced boundary, guard dog"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSecurityModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              ರದ್ದುಗೊಳಿಸಿ / Cancel
            </button>
            <button
              type="submit"
              disabled={savingSecurity}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {savingSecurity ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'ಉಳಿಸಿ / Save Security'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Admin Delete House Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="ದಾಖಲೆ ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಿ / Delete House Registration"
      >
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-900 text-xs flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">ಎಚ್ಚರಿಕೆ: ಈ ಕ್ರಮವನ್ನು ರದ್ದುಗೊಳಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ!</p>
              <p className="mt-1">
                ನೀವು ಮನೆ ಸಂಖ್ಯೆ <strong>{house?.houseNumber}</strong> (ID: {house?.houseId}), ಸಂಬಂಧಿಸಿದ ಎಲ್ಲಾ ಕುಟುಂಬ ಸದಸ್ಯರು ಮತ್ತು ಫೋಟೋಗಳನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಲು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              ರದ್ದುಮಾಡಿ / Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDeleteRecord}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {deleting ? 'ಅಳಿಸಲಾಗುತ್ತಿದೆ...' : 'ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಿ / Delete Permanently'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HouseDetailsPage;
