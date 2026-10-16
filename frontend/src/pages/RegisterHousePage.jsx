import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  User,
  Users2,
  Camera,
  CheckCircle,
  AlertCircle,
  Save,
  RotateCcw,
  X,
  ChevronRight,
  ChevronLeft,
  Shield,
  Plus,
  Trash2,
  ShieldAlert,
  ClipboardList
} from 'lucide-react';
import LocationPickerMap from '../components/map/LocationPickerMap';
import FamilyMemberForm from '../components/forms/FamilyMemberForm';
import PhotoUploader from '../components/forms/PhotoUploader';
import { createHouse, uploadHousePhotos, getLocalitiesMeta } from '../services/houseService';
import { getBeatByNumber } from '../services/beatService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const RegisterHousePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { user, isStaff, isAdmin } = useAuth();

  const beatsList = [
    'Beat 01', 'Beat 02', 'Beat 03', 'Beat 04', 'Beat 05',
    'Beat 06', 'Beat 07', 'Beat 08', 'Beat 09', 'Beat 10', 'Beat 11'
  ];

  const staffBeats = user?.assignedBeats || [];
  const selectableBeats = isStaff ? staffBeats : beatsList;

  const defaultBeat = selectableBeats.length > 0 ? (selectableBeats.includes(searchParams.get('beat')) ? searchParams.get('beat') : selectableBeats[0]) : 'Beat 01';
  const paramBeat = searchParams.get('beat') || defaultBeat;
  const paramVillage = searchParams.get('village') || '';

  const [activeTab, setActiveTab] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [meta, setMeta] = useState({ beats: [], villages: [] });
  const [beatVillages, setBeatVillages] = useState([]);

  // Initial Form State
  const initialFormState = {
    houseNumber: '',
    streetName: '',
    beatNumber: paramBeat,
    village: paramVillage,
    locality: paramVillage || '',
    city: paramVillage || '',
    subdistrict: '',
    district: '',
    state: 'Karnataka',
    pincode: '',
    houseType: 'Independent house',
    numberOfFloors: 1,
    numberOfRooms: 1,
    ownershipType: 'Owned',
    remarks: '',
    gps: {
      latitude: '',
      longitude: '',
      accuracy: 0,
      source: 'gps'
    },
    owner: {
      fullName: '',
      contactNumber: '',
      email: '',
      ownershipType: 'Owned',
      representativeStatus: 'Owner',
      correspondenceAddress: '',
      age: '',
      idReference: ''
    },
    familyMembers: [],
    security: {
      cctvInstalled: 'No',
      securityGuardPresent: 'No',
      otherArrangements: ''
    },
    issues: []
  };

  const [formData, setFormData] = useState(initialFormState);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const m = await getLocalitiesMeta();
        setMeta(m);
      } catch (err) {
        console.warn('Meta load error:', err);
      }
    };
    loadMeta();
  }, []);

  // Update when URL query params change
  useEffect(() => {
    if (paramBeat) handleInputChange('beatNumber', paramBeat);
    if (paramVillage) {
      handleInputChange('village', paramVillage);
      handleInputChange('locality', paramVillage);
      handleInputChange('city', paramVillage);
    }
  }, [paramBeat, paramVillage]);

  // Fetch official villages for the selected beat
  useEffect(() => {
    const fetchBeatVillages = async () => {
      if (!formData.beatNumber) return;
      try {
        const data = await getBeatByNumber(formData.beatNumber);
        if (data?.villages) {
          setBeatVillages(data.villages);
        }
      } catch (err) {
        console.warn('Failed to load beat villages:', err);
      }
    };
    fetchBeatVillages();
  }, [formData.beatNumber]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleOwnerChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      owner: {
        ...prev.owner,
        [field]: value
      }
    }));
    if (errors[`owner.${field}`]) {
      setErrors((prev) => ({ ...prev, [`owner.${field}`]: null }));
    }
  };

  const handleSecurityChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      security: {
        ...prev.security,
        [field]: value
      }
    }));
  };

  const handleAddIssue = () => {
    setFormData((prev) => ({
      ...prev,
      issues: [
        ...prev.issues,
        {
          dateReported: new Date().toISOString().split('T')[0],
          category: 'Police-related',
          description: '',
          additionalRemarks: ''
        }
      ]
    }));
  };

  const handleRemoveIssue = (index) => {
    setFormData((prev) => ({
      ...prev,
      issues: prev.issues.filter((_, i) => i !== index)
    }));
  };

  const handleIssueChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      issues: prev.issues.map((iss, i) => (i === index ? { ...iss, [field]: value } : iss))
    }));
    if (errors[`issue_${index}`]) {
      setErrors((prev) => ({ ...prev, [`issue_${index}`]: null }));
    }
  };

  // Reset form
  const handleResetForm = () => {
    if (window.confirm('Are you sure you want to reset all inputs on this form? / ನೀವು ನಮೂದಿಸಿದ ವಿವರಗಳನ್ನು ಮರುಹೊಂದಿಸಲು ಖಚಿತವಾಗಿದೆಯೇ?')) {
      setFormData(initialFormState);
      setPhotos([]);
      setErrors({});
      setActiveTab(1);
      toast.info('Form has been reset / ಫಾರ್ಮ್ ಮರುಹೊಂದಿಸಲಾಗಿದೆ.');
    }
  };

  // Validation
  const validateTab = (tabNumber) => {
    const newErrors = {};

    if (tabNumber === 1) {
      if (!formData.houseNumber.trim()) newErrors.houseNumber = 'ಮನೆ ಸಂಖ್ಯೆ ಕಡ್ಡಾಯ / House number is required.';
      if (!formData.village.trim()) newErrors.village = 'ಗ್ರಾಮ ಕಡ್ಡಾಯ / Village name is required.';
      if (!formData.beatNumber) newErrors.beatNumber = 'ಬೀಟ್ ಸಂಖ್ಯೆ ಕಡ್ಡಾಯ / Beat number is required.';
    }

    if (tabNumber === 2) {
      // GPS is completely optional; validate coordinates only if entered/captured
      if (formData.gps.latitude !== '' && formData.gps.latitude !== null && formData.gps.latitude !== undefined) {
        const lat = parseFloat(formData.gps.latitude);
        const lng = parseFloat(formData.gps.longitude);
        if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180) {
          newErrors.gps = 'Please enter valid GPS coordinates or clear the selection.';
        }
      }
    }

    if (tabNumber === 3) {
      if (!formData.owner.fullName.trim()) newErrors['owner.fullName'] = 'ಮನೆಯ ಮುಖ್ಯಸ್ಥ/ಮಾಲೀಕರ ಹೆಸರು ಕಡ್ಡಾಯ / Owner name is required.';
    }

    if (tabNumber === 5) {
      formData.issues.forEach((iss, idx) => {
        if (!iss.description || !iss.description.trim()) {
          newErrors[`issue_${idx}`] = 'ಸಮಸ್ಯೆ ಅಥವಾ ಸಲಹೆಯ ವಿವರ ಕಡ್ಡಾಯ / Description is required.';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextTab = () => {
    if (validateTab(activeTab)) {
      setActiveTab((prev) => Math.min(prev + 1, 6));
    } else {
      toast.error('ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಕಡ್ಡಾಯ ಕ್ಷೇತ್ರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ / Please resolve highlighted fields.');
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateTab(1) || !validateTab(2) || !validateTab(3) || !validateTab(5)) {
      toast.error('Validation errors found in one or more sections. Please review.');
      return;
    }

    setSubmitting(true);
    try {
      toast.info('ಮನೆ ನೋಂದಣಿ ವಿವರಗಳನ್ನು ಉಳಿಸಲಾಗುತ್ತಿದೆ / Submitting registration to database...');

      // Prepare payload with clean optional GPS
      const submissionData = { ...formData };
      if (
        !submissionData.gps ||
        submissionData.gps.latitude === '' ||
        submissionData.gps.latitude === null ||
        isNaN(Number(submissionData.gps.latitude))
      ) {
        submissionData.gps = null;
      }

      // 1. Create House and Owner & Family Members & Security & Issues
      const result = await createHouse(submissionData);
      const createdHouse = result.data;

      // 2. Upload Photos if any were attached (photos are optional)
      if (photos.length > 0) {
        toast.info(`Uploading ${photos.length} house photographs...`);
        const photoFormData = new FormData();
        photos.forEach((p) => {
          if (p.file) {
            photoFormData.append('photos', p.file);
          }
        });
        photoFormData.append('category', photos[0]?.category || 'Front view');

        await uploadHousePhotos(createdHouse._id, photoFormData);
      }

      toast.success(`ಮನೆ ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ! / House registered with ID: ${createdHouse.houseId}`);
      navigate(`/houses/${createdHouse.houseId}`);
    } catch (err) {
      toast.error(err.message || 'Failed to complete registration.');
      setSubmitting(false);
    }
  };

  const tabs = [
    { id: 1, label: '1. House Details / ಮನೆ ವಿವರ *', icon: Building2 },
    { id: 2, label: '2. GPS Coordinates / ಜಿಪಿಎಸ್ (Optional)', icon: MapPin },
    { id: 3, label: '3. Owner Details / ಮಾಲೀಕರು *', icon: User },
    { id: 4, label: '4. Family Members / ಕುಟುಂಬ (Optional)', icon: Users2 },
    { id: 5, label: '5. Security & Issues / ಭದ್ರತೆ & ಸಮಸ್ಯೆಗಳು', icon: Shield },
    { id: 6, label: '6. Photos & Review / ಪರಿಶೀಲನೆ (Optional)', icon: Camera }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್ ಸಮೀಕ್ಷೆ • House Survey Form
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            ಹೊಸ ಮನೆ ನೋಂದಣಿ (New House Registration)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ಬೀಟ್ ಮತ್ತು ಗ್ರಾಮವಾರು ನಿವಾಸ, ಜಿಪಿಎಸ್ ಅಕ್ಷಾಂಶ, ಕುಟುಂಬ ಸದಸ್ಯರು ಮತ್ತು ಭಾವಚಿತ್ರಗಳ ನೋಂದಣಿ.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleResetForm}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            title="Reset form"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            ಮರುಹೊಂದಿಸಿ / Reset
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            ರದ್ದುಮಾಡಿ / Cancel
          </button>
        </div>
      </div>

      {/* Progress Tabs Header */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-100/80 p-1.5 rounded-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isPassed = activeTab > tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : isPassed
                  ? 'bg-white text-blue-900 hover:bg-slate-50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content Cards */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        {/* ============================================================== */}
        {/* SECTION 1: House Details */}
        {/* ============================================================== */}
        {activeTab === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                  ವಿಭಾಗ A: ಮನೆ ಮತ್ತು ಆಡಳಿತಾತ್ಮಕ ವಿಳಾಸ (House Details)
                </h3>
                <p className="text-xs text-slate-500">
                  Unique Registration ID will be automatically generated upon submission (e.g. MMP-100X).
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Auto-assigned MMP ID
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Beat Number selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ಬೀಟ್ ಸಂಖ್ಯೆ / Beat Number <span className="text-rose-500">*</span>
                </label>
                {isStaff && selectableBeats.length === 0 ? (
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                    ⚠️ ನಿಮ್ಮ ಖಾತೆಗೆ ಯಾವುದೇ ಬೀಟ್ ನಿಯೋಜನೆಯಾಗಿಲ್ಲ (No beats assigned).
                  </div>
                ) : (
                  <select
                    value={formData.beatNumber}
                    onChange={(e) => handleInputChange('beatNumber', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-blue-900 focus:ring-2 focus:ring-amber-500"
                  >
                    {selectableBeats.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                )}
                {errors.beatNumber && <p className="text-[11px] text-rose-500 mt-1">{errors.beatNumber}</p>}
              </div>

              {/* Village Name with quick dropdown from beatVillages */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ಗ್ರಾಮ / Village or Ward <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-1.5">
                  {beatVillages.length > 0 && (
                    <select
                      value={beatVillages.some((v) => v.name === formData.village || v.nameKannada === formData.village) ? formData.village : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          handleInputChange('village', val);
                          handleInputChange('locality', val);
                          handleInputChange('city', val);
                        }
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 shadow-sm"
                    >
                      <option value="">-- ಗ್ರಾಮ ಆಯ್ಕೆ ಮಾಡಿ ({beatVillages.length} ಗ್ರಾಮಗಳು) --</option>
                      {beatVillages.map((v) => (
                        <option key={v._id || v.villageId} value={v.nameKannada || v.name}>
                          {v.nameKannada || v.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    type="text"
                    required
                    value={formData.village}
                    onChange={(e) => {
                      handleInputChange('village', e.target.value);
                      handleInputChange('locality', e.target.value);
                      handleInputChange('city', e.target.value);
                    }}
                    placeholder="ಗ್ರಾಮದ ಹೆಸರು / Village name"
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-slate-50/50 focus:bg-white transition ${
                      errors.village ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.village && <p className="text-[11px] text-rose-500 mt-1">{errors.village}</p>}
              </div>

              {/* House Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ಮನೆ ಸಂಖ್ಯೆ / House Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.houseNumber}
                  onChange={(e) => handleInputChange('houseNumber', e.target.value)}
                  placeholder="e.g. 14/B or Flat 204"
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-slate-50/50 focus:bg-white transition ${
                    errors.houseNumber ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
                {errors.houseNumber && <p className="text-[11px] text-rose-500 mt-1">{errors.houseNumber}</p>}
              </div>

              {/* Street & Full Address */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ರಸ್ತೆ / ಬಡಾವಣೆ ಮತ್ತು ಸಂಪೂರ್ಣ ವಿಳಾಸ (Street & Address) (Optional)
                </label>
                <input
                  type="text"
                  value={formData.streetName}
                  onChange={(e) => handleInputChange('streetName', e.target.value)}
                  placeholder="e.g. Kuvempu Road, 4th Cross, Near Anjaneya Temple"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ತಾಲ್ಲೂಕು / Taluk (Optional)
                </label>
                <input
                  type="text"
                  value={formData.subdistrict}
                  onChange={(e) => handleInputChange('subdistrict', e.target.value)}
                  placeholder="ತಾಲ್ಲೂಕು / Taluk"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ಜಿಲ್ಲೆ / District (Optional)
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  placeholder="ಜಿಲ್ಲೆ / District"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ರಾಜ್ಯ / State (Optional)
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ಪಿನ್ ಕೋಡ್ / PIN Code (Optional)
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  placeholder="PIN Code"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ಮನೆಯ ವಿಧ / House Type (Optional)
                </label>
                <select
                  value={formData.houseType}
                  onChange={(e) => handleInputChange('houseType', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value="Independent house">ಸ್ವತಂತ್ರ ಮನೆ (Independent house)</option>
                  <option value="Apartment">ಅಪಾರ್ಟ್‌ಮೆಂಟ್ (Apartment)</option>
                  <option value="Rental house">ಬಾಡಿಗೆ ಮನೆ (Rental house)</option>
                  <option value="Other">ಇತರೆ (Other)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ಮಾಲೀಕತ್ವ / Ownership Type (Optional)
                </label>
                <select
                  value={formData.ownershipType}
                  onChange={(e) => handleInputChange('ownershipType', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value="Owned">ಸ್ವಂತ (Owned)</option>
                  <option value="Rented">ಬಾಡಿಗೆ (Rented)</option>
                  <option value="Other">ಇತರೆ (Other)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ಅಂತಸ್ತುಗಳ ಸಂಖ್ಯೆ / Number of Floors
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.numberOfFloors}
                  onChange={(e) => handleInputChange('numberOfFloors', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ಕೊಠಡಿಗಳ ಸಂಖ್ಯೆ / Number of Rooms
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.numberOfRooms}
                  onChange={(e) => handleInputChange('numberOfRooms', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ಹೆಚ್ಚುವರಿ ಟಿಪ್ಪಣಿಗಳು / Additional Police Remarks & Notes
              </label>
              <textarea
                rows={2}
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                placeholder="e.g. ಬೀಟ್ ಅಧಿಕಾರಿಯ ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಂಡಿದೆ. ಹಿರಿಯ ನಾಗರಿಕರು ವಾಸವಿದ್ದಾರೆ."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 2: GPS Location */}
        {/* ============================================================== */}
        {activeTab === 2 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
                ವಿಭಾಗ D: GPS ಲೊಕೇಶನ್ ಮತ್ತು ಮ್ಯಾಪಿಂಗ್ (GPS Geolocation)
              </h3>
              <p className="text-xs text-slate-500">
                Click "Capture Current GPS Location" or reposition the map pin to precisely tag the house geocoordinates.
              </p>
            </div>

            <LocationPickerMap
              latitude={formData.gps.latitude}
              longitude={formData.gps.longitude}
              accuracy={formData.gps.accuracy}
              source={formData.gps.source}
              onChange={(gpsObj) => handleInputChange('gps', gpsObj)}
            />
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 3: Owner Details */}
        {/* ============================================================== */}
        {activeTab === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <User className="w-4 h-4 mr-2 text-amber-600" />
                ವಿಭಾಗ B: ಮನೆಯ ಮಾಲೀಕರು / ಪ್ರತಿನಿಧಿಯ ವಿವರಗಳು (Owner / Representative)
              </h3>
              <p className="text-xs text-slate-500">
                ಪೊಲೀಸ್ ಸಮೀಕ್ಷೆಯ ಉದ್ದೇಶಕ್ಕಾಗಿ ಮಾತ್ರ ಅಗತ್ಯವಿರುವ ಪ್ರಾಥಮಿಕ ಸಂಪರ್ಕ ವಿವರಗಳು.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ಮಾಲೀಕರು / ಪ್ರತಿನಿಧಿಯ ಪೂರ್ಣ ಹೆಸರು (Full Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.owner.fullName}
                  onChange={(e) => handleOwnerChange('fullName', e.target.value)}
                  placeholder="ಮಾಲೀಕರ ಪೂರ್ಣ ಹೆಸರು / Full Name"
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50/50 focus:bg-white transition ${
                    errors['owner.fullName'] ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
                {errors['owner.fullName'] && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors['owner.fullName']}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ಸಂಪರ್ಕ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Contact Number) (Optional)
                </label>
                <input
                  type="text"
                  value={formData.owner.contactNumber}
                  onChange={(e) => handleOwnerChange('contactNumber', e.target.value)}
                  placeholder="10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ / Mobile Number (Optional)"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ಮಾಲೀಕರು ಅಥವಾ ಪ್ರತಿನಿಧಿ ಸ್ಥಾನ (Owner / Representative Status)
                </label>
                <select
                  value={formData.owner.representativeStatus}
                  onChange={(e) => handleOwnerChange('representativeStatus', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value="Owner">ಸ್ವಂತ ಮಾಲೀಕರು (Owner)</option>
                  <option value="Representative / Co-resident">ಕುಟುಂಬ ಪ್ರತಿನಿಧಿ (Representative / Co-resident)</option>
                  <option value="Tenant">ಬಾಡಿಗೆದಾರರು (Tenant)</option>
                  <option value="Caregiver">ಪಾಲಕರು / ಆರೈಕೆದಾರರು (Caregiver)</option>
                  <option value="Other">ಇತರೆ (Other)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ಇಮೇಲ್ ವಿಳಾಸ (Optional Email)
                </label>
                <input
                  type="email"
                  value={formData.owner.email}
                  onChange={(e) => handleOwnerChange('email', e.target.value)}
                  placeholder="e.g. citizen@example.com"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ಪರ್ಯಾಯ ವಿಳಾಸ (Correspondence Address, if different from house address)
                </label>
                <input
                  type="text"
                  value={formData.owner.correspondenceAddress}
                  onChange={(e) => handleOwnerChange('correspondenceAddress', e.target.value)}
                  placeholder="Leave blank if correspondence is identical to house address"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 4: Family Details */}
        {/* ============================================================== */}
        {activeTab === 4 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <Users2 className="w-4 h-4 mr-2 text-indigo-600" />
                ವಿಭಾಗ C: ಕುಟುಂಬದ ಸದಸ್ಯರ ವಿವರಗಳು (Family & Household Members)
              </h3>
              <p className="text-xs text-slate-500">
                ಮನೆಯಲ್ಲಿ ವಾಸವಿರುವ ಕುಟುಂಬ ಸದಸ್ಯರು, ಹಿರಿಯರು, ಅವಲಂಬಿತರು ಮತ್ತು ಸಂಬಂಧಿಕರ ಹೆಸರುಗಳನ್ನು ಸೇರಿಸಿ.
              </p>
            </div>

            <FamilyMemberForm
              members={formData.familyMembers}
              onChange={(updatedMembers) => handleInputChange('familyMembers', updatedMembers)}
            />
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 5: Security and Issues Survey */}
        {/* ============================================================== */}
        {activeTab === 5 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್ — ಅಧಿಕೃತ ಸಮೀಕ್ಷೆ
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-amber-600" />
                ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್ — Security and Issues Survey
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ಭದ್ರತಾ ವ್ಯವಸ್ಥೆ, ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆಗಳು ಮತ್ತು ಸಲಹೆಗಳ ನೋಂದಣಿ (Security Present on Premises & Public Issues Survey).
              </p>
            </div>

            {/* 1. Security Present on Premises / ಭದ್ರತಾ ವ್ಯವಸ್ಥೆ */}
            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200/60 pb-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  1. Security Present on Premises / ಭದ್ರತಾ ವ್ಯವಸ್ಥೆ
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CCTV Installed */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    CCTV Installed / ಸಿ.ಸಿ.ಟಿ.ವಿ ಅಳವಡಿಸಲಾಗಿದೆಯೇ?
                  </label>
                  <div className="flex items-center space-x-3">
                    {['Yes', 'No'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSecurityChange('cctvInstalled', opt)}
                        className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg border transition ${
                          formData.security?.cctvInstalled === opt
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
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Security Guard Present / ಭದ್ರತಾ ಸಿಬ್ಬಂದಿ ಇದ್ದಾರೆಯೇ?
                  </label>
                  <div className="flex items-center space-x-3">
                    {['Yes', 'No'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSecurityChange('securityGuardPresent', opt)}
                        className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg border transition ${
                          formData.security?.securityGuardPresent === opt
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
                <div className="sm:col-span-2 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Other Security Arrangements / ಇತರ ಭದ್ರತಾ ವ್ಯವಸ್ಥೆಗಳು (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.security?.otherArrangements || ''}
                    onChange={(e) => handleSecurityChange('otherArrangements', e.target.value)}
                    placeholder="e.g. Security Alarm, Guard Dog, Gated Compound / ಅಲಾರಾಂ, ಗೇಟೆಡ್ ಕಾಂಪೌಂಡ್, ಕಾವಲು ನಾಯಿ, ಇತ್ಯಾದಿ"
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>
            </div>

            {/* 2. Issues and Suggestions Received / ದಿನಾಂಕ & ಸಮಸ್ಯೆಗಳು */}
            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                <div className="flex items-center space-x-2">
                  <ClipboardList className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    2. Issues / Suggestions Received / Date / ಸ್ವೀಕರಿಸಲಾದ ಸಮಸ್ಯೆಗಳು & ಸಲಹೆಗಳು
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleAddIssue}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-100/80 hover:bg-blue-200 rounded-lg transition"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  + Add Issue or Suggestion / ಸಮಸ್ಯೆ ಸೇರಿಸಿ
                </button>
              </div>

              {formData.issues.length === 0 ? (
                <div className="p-6 text-center bg-white rounded-xl border border-dashed border-slate-300">
                  <p className="text-xs text-slate-500">
                    ಯಾವುದೇ ಸಮಸ್ಯೆಗಳು ಅಥವಾ ಸಲಹೆಗಳು ದಾಖಲಾಗಿಲ್ಲ (No issues recorded yet).
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    ಸಮೀಕ್ಷೆಯ ಸಮಯದಲ್ಲಿ ನಾಗರಿಕರು ವ್ಯಕ್ತಪಡಿಸಿದ ಪೊಲೀಸ್ ಅಥವಾ ಇತರ ಇಲಾಖೆಯ ಸಮಸ್ಯೆಗಳನ್ನು ಸೇರಿಸಲು ಮೇಲಿನ ಬಟನ್ ಒತ್ತಿ.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.issues.map((iss, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 relative animate-in fade-in"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-slate-700 flex items-center">
                          <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center mr-2">
                            {idx + 1}
                          </span>
                          Issue / Suggestion #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveIssue(idx)}
                          className="text-slate-400 hover:text-rose-600 transition p-1"
                          title="Remove Issue"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Date Reported / ದಿನಾಂಕ <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={iss.dateReported}
                            onChange={(e) => handleIssueChange(idx, 'dateReported', e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Category / ಇಲಾಖೆ ವಿಭಾಗ <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={iss.category}
                            onChange={(e) => handleIssueChange(idx, 'category', e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium"
                          >
                            <option value="Police-related">Police-related / ಪೊಲೀಸ್ ಇಲಾಖೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ</option>
                            <option value="Other department">Other department / ಇತರ ಇಲಾಖೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Issue or Suggestion Description / ಸಮಸ್ಯೆ ಅಥವಾ ಸಲಹೆಯ ವಿವರ <span className="text-rose-500">*</span>
                          </label>
                          <textarea
                            rows={2}
                            value={iss.description}
                            onChange={(e) => handleIssueChange(idx, 'description', e.target.value)}
                            placeholder="ಸಮಸ್ಯೆ ಅಥವಾ ನಾಗರಿಕರ ಸಲಹೆಯನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ನಮೂದಿಸಿ / Enter police or departmental issue..."
                            className={`w-full px-3 py-2 text-xs rounded-lg border bg-slate-50/50 focus:bg-white transition ${
                              errors[`issue_${idx}`] ? 'border-rose-400' : 'border-slate-200'
                            }`}
                          />
                          {errors[`issue_${idx}`] && (
                            <p className="text-[10px] text-rose-500 mt-0.5">{errors[`issue_${idx}`]}</p>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Additional Remarks / ಹೆಚ್ಚುವರಿ ಟಿಪ್ಪಣಿಗಳು (Optional)
                          </label>
                          <input
                            type="text"
                            value={iss.additionalRemarks}
                            onChange={(e) => handleIssueChange(idx, 'additionalRemarks', e.target.value)}
                            placeholder="ಹೆಚ್ಚುವರಿ ವಿವರಗಳು ಅಥವಾ ಸ್ಥಳೀಯ ಸಂವೇದನಾತ್ಮಕ ಮಾಹಿತಿ / Additional notes"
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Action Taken on Issues or Suggestions / ಕೈಗೊಂಡ ಕ್ರಮಗಳು */}
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                3. Action Taken by Department / ಇಲಾಖೆಯಿಂದ ಕೈಗೊಂಡ ಕ್ರಮಗಳು
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                ಸಮೀಕ್ಷಾ ನೋಂದಣಿ ಸಮಯದಲ್ಲಿ ದಾಖಲಿಸಲಾದ ಎಲ್ಲಾ ಸಮಸ್ಯೆಗಳು ಆರಂಭದಲ್ಲಿ <strong>"Pending / ಬಾಕಿ"</strong> ಸ್ಥಿತಿಯಲ್ಲಿರುತ್ತವೆ. ಪೊಲೀಸ್ ನಿರ್ವಾಹಕರು (Administrator) ಇಲಾಖಾ ಕ್ರಮ, ಜವಾಬ್ದಾರಿಯುತ ಇಲಾಖೆ (Police, BESCOM, Gram Panchayat, PWD, Health, etc.) ಹಾಗೂ ಪರಿಹಾರ ಸ್ಥಿತಿಯನ್ನು (Pending &rarr; In Progress &rarr; Resolved) ನವೀಕರಿಸಲು ಅಧಿಕಾರ ಹೊಂದಿರುತ್ತಾರೆ.
              </p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 6: Photos & Final Review */}
        {/* ============================================================== */}
        {activeTab === 6 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <Camera className="w-4 h-4 mr-2 text-amber-600" />
                ವಿಭಾಗ F: ಮನೆಯ ಮುಂಭಾಗದ ಛಾಯಾಚಿತ್ರಗಳು & ಅಂತಿಮ ಪರಿಶೀಲನೆ (House Photos & Review)
              </h3>
              <p className="text-xs text-slate-500">
                ಮನೆಯ ಮುಂಭಾಗ (Front View) ಅಥವಾ ಪ್ರವೇಶ ದ್ವಾರದ ಛಾಯಾಚಿತ್ರಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ನಂತರ ದೃಢೀಕರಿಸಿ.
              </p>
            </div>

            {/* Photo Uploader */}
            <PhotoUploader photos={photos} onChange={setPhotos} maxPhotos={5} />

            {/* Review Summary Card */}
            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-600" />
                  ಅಂತಿಮ ಸಮೀಕ್ಷಾ ಪರಿಶೀಲನಾ ಸಾರಾಂಶ (Pre-Submission Summary)
                </h4>
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  {formData.beatNumber} • {formData.village}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">
                    ವಿಳಾಸ / Property Address:
                  </span>
                  <p className="font-semibold text-slate-800">
                    {formData.houseNumber}, {formData.streetName}, {formData.village}, {formData.district} - {formData.pincode}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">
                    ಮನೆಯ ವಿಧ ಮತ್ತು ರಚನೆ:
                  </span>
                  <p className="font-semibold text-slate-800">
                    {formData.houseType} ({formData.numberOfFloors} Floor, {formData.numberOfRooms} Room)
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">
                    GPS Coordinates (Optional):
                  </span>
                  <p className="font-semibold text-slate-800">
                    {formData.gps?.latitude !== '' &&
                    formData.gps?.latitude !== null &&
                    !isNaN(Number(formData.gps?.latitude))
                      ? `Lat: ${Number(formData.gps.latitude).toFixed(6)}, Lng: ${Number(formData.gps.longitude).toFixed(6)}`
                      : 'ದಾಖಲಿಸಿಲ್ಲ / Not Captured (Optional)'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">
                    ಮಾಲೀಕರು / ಪ್ರತಿನಿಧಿ:
                  </span>
                  <p className="font-semibold text-slate-800">
                    {formData.owner.fullName || 'Not specified'} ({formData.owner.contactNumber || 'No phone'}) - {formData.owner.representativeStatus}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">
                    ಭದ್ರತಾ ವ್ಯವಸ್ಥೆ (Security):
                  </span>
                  <p className="font-semibold text-slate-800">
                    CCTV: {formData.security?.cctvInstalled === 'Yes' ? 'ಹೌದು (Yes)' : 'ಇಲ್ಲ (No)'} • Guard: {formData.security?.securityGuardPresent === 'Yes' ? 'ಹೌದು (Yes)' : 'ಇಲ್ಲ (No)'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">
                    ದಾಖಲಾದ ಸಮಸ್ಯೆಗಳು (Issues):
                  </span>
                  <p className="font-semibold text-slate-800">
                    {formData.issues.length} issue(s) recorded
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">
                    ಕುಟುಂಬ ಸದಸ್ಯರು:
                  </span>
                  <p className="font-semibold text-slate-800">
                    {formData.familyMembers.length} member(s) listed
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">
                    ಛಾಯಾಚಿತ್ರಗಳು:
                  </span>
                  <p className="font-semibold text-slate-800">
                    {photos.length} photo(s) attached
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Navigation & Action Buttons */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            disabled={activeTab === 1}
            onClick={() => setActiveTab((prev) => Math.max(prev - 1, 1))}
            className="inline-flex items-center px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            ಹಿಂದಿನ ಹಂತ / Previous
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
            >
              ಮರುಹೊಂದಿಸಿ / Reset
            </button>

            {activeTab < 6 ? (
              <button
                type="button"
                onClick={handleNextTab}
                className="inline-flex items-center px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition"
              >
                ಮುಂದಿನ ಹಂತ / Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="inline-flex items-center px-6 py-2.5 text-xs font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 rounded-xl shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
              >
                {submitting ? (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    ಉಳಿಸಲಾಗುತ್ತಿದೆ...
                  </span>
                ) : (
                  <span className="inline-flex items-center">
                    <Save className="w-4 h-4 mr-1.5" />
                    ನೋಂದಣಿ ದೃಢೀಕರಿಸಿ / Save Registration
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterHousePage;
