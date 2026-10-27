import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Building2, MapPin, User, Users, CheckCircle, Camera, Shield, ShieldAlert } from 'lucide-react';
import { getHouseById, updateHouse, uploadHousePhotos } from '../services/houseService';
import LocationPickerMap from '../components/map/LocationPickerMap';
import PhotoUploader from '../components/forms/PhotoUploader';
import FamilyMemberForm from '../components/forms/FamilyMemberForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const EditHousePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isStaff, isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState([]);

  const [formData, setFormData] = useState({
    houseNumber: '',
    streetName: '',
    beatNumber: '',
    village: '',
    locality: '',
    city: '',
    subdistrict: '',
    district: '',
    state: '',
    pincode: '',
    houseType: 'Independent house',
    numberOfFloors: 1,
    numberOfRooms: 1,
    ownershipType: 'Owned',
    registrationStatus: 'Registered',
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
      correspondenceAddress: '',
      age: '',
      idReference: ''
    },
    familyMembers: [],
    security: {
      cctvInstalled: 'No',
      securityGuardPresent: 'No',
      otherArrangements: ''
    }
  });

  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true);
      try {
        const data = await getHouseById(id);

        // Role-based staff jurisdiction check
        if (isStaff) {
          const assigned = (user?.assignedBeats || []).map((b) => b.trim().toLowerCase());
          if (!assigned.includes((data.beatNumber || '').trim().toLowerCase())) {
            toast.error(`Permission Denied: You cannot edit house registrations in ${data.beatNumber}.`);
            navigate('/houses');
            return;
          }
        }

        setFormData({
          houseNumber: data.houseNumber || '',
          streetName: data.streetName || '',
          beatNumber: data.beatNumber || 'Beat 01',
          village: data.village || '',
          locality: data.locality || '',
          city: data.city || '',
          subdistrict: data.subdistrict || '',
          district: data.district || '',
          state: data.state || '',
          pincode: data.pincode || '',
          houseType: data.houseType || 'Independent house',
          numberOfFloors: data.numberOfFloors || 1,
          numberOfRooms: data.numberOfRooms || 1,
          ownershipType: data.ownershipType || 'Owned',
          registrationStatus: data.registrationStatus || 'Registered',
          remarks: data.remarks || '',
          gps: {
            latitude: data.gps?.latitude || '',
            longitude: data.gps?.longitude || '',
            accuracy: data.gps?.accuracy || 0,
            source: data.gps?.source || 'gps'
          },
          owner: {
            fullName: data.owner?.fullName || '',
            contactNumber: data.owner?.contactNumber || '',
            email: data.owner?.email || '',
            ownershipType: data.owner?.ownershipType || data.ownershipType || 'Owned',
            correspondenceAddress: data.owner?.correspondenceAddress || '',
            age: data.owner?.age || '',
            idReference: data.owner?.idReference || ''
          },
          familyMembers: (data.familyMembers || []).map((m) => ({
            _id: m._id,
            memberId: m.memberId,
            fullName: m.fullName || '',
            relationship: m.relationship || 'Wife',
            age: m.age !== undefined && m.age !== null ? m.age : '',
            gender: m.gender || 'Prefer not to say',
            occupation: m.occupation || '',
            contactNumber: m.contactNumber || ''
          })),
          security: {
            cctvInstalled: data.security?.cctvInstalled || 'No',
            securityGuardPresent: data.security?.securityGuardPresent || 'No',
            otherArrangements: data.security?.otherArrangements || ''
          }
        });
        setPhotos(data.photos || []);
      } catch (err) {
        toast.error('Failed to load house record for editing.');
        navigate('/houses');
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id, isStaff, user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOwnerChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      owner: { ...prev.owner, [field]: value }
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updatePayload = { ...formData };
      if (
        !updatePayload.gps ||
        updatePayload.gps.latitude === '' ||
        updatePayload.gps.latitude === null ||
        isNaN(Number(updatePayload.gps.latitude))
      ) {
        updatePayload.gps = null;
      }

      const updatedRes = await updateHouse(id, updatePayload);
      const houseTargetId = updatedRes?.data?._id || id;

      // Upload newly added photos if any
      const newFiles = photos.filter((p) => p.file);
      if (newFiles.length > 0) {
        toast.info(`Uploading ${newFiles.length} photo(s)...`);
        const photoFormData = new FormData();
        newFiles.forEach((p) => {
          photoFormData.append('photos', p.file);
        });
        photoFormData.append('category', newFiles[0]?.category || 'Front view');
        await uploadHousePhotos(houseTargetId, photoFormData);
      }

      toast.success('House registration updated successfully.');
      navigate(`/houses/${id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update house registration.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading registration details..." size="large" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-12">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Edit House Registration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify address, structural attributes, status, owner details, or correct GPS coordinates.
          </p>
        </div>

        <Link
          to={`/houses/${id}`}
          className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Cancel & Return
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Property */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center border-b pb-2">
            <Building2 className="w-4 h-4 mr-2 text-blue-600" />
            House Address & Specifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">House Number *</label>
              <input
                type="text"
                required
                value={formData.houseNumber}
                onChange={(e) => handleInputChange('houseNumber', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Street Name (Optional)</label>
              <input
                type="text"
                value={formData.streetName}
                onChange={(e) => handleInputChange('streetName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Locality (Optional)</label>
              <input
                type="text"
                value={formData.locality}
                onChange={(e) => handleInputChange('locality', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">City / Village *</label>
              <input
                type="text"
                required
                value={formData.city || formData.village}
                onChange={(e) => {
                  handleInputChange('city', e.target.value);
                  handleInputChange('village', e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">PIN Code (Optional)</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">District (Optional)</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">State (Optional)</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Registration Status</label>
              <select
                value={formData.registrationStatus}
                onChange={(e) => handleInputChange('registrationStatus', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
              >
                <option value="Registered">Registered</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Approved">Approved</option>
                <option value="Flagged">Flagged</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">House Type</label>
              <select
                value={formData.houseType}
                onChange={(e) => handleInputChange('houseType', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
              >
                <option value="Independent house">Independent house</option>
                <option value="Apartment">Apartment</option>
                <option value="Rental house">Rental house</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Floors</label>
              <input
                type="number"
                min="1"
                value={formData.numberOfFloors}
                onChange={(e) => handleInputChange('numberOfFloors', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Rooms</label>
              <input
                type="number"
                min="1"
                value={formData.numberOfRooms}
                onChange={(e) => handleInputChange('numberOfRooms', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Section 2: GPS Location */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center border-b pb-2">
            <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
            Update GPS Coordinates & Pin (Optional)
          </h3>

          <LocationPickerMap
            latitude={formData.gps.latitude}
            longitude={formData.gps.longitude}
            accuracy={formData.gps.accuracy}
            source={formData.gps.source}
            onChange={(gpsObj) => handleInputChange('gps', gpsObj)}
          />
        </div>

        {/* Section 3: Owner Details */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center border-b pb-2">
            <User className="w-4 h-4 mr-2 text-indigo-600" />
            Owner Contact Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Owner Full Name *</label>
              <input
                type="text"
                required
                value={formData.owner.fullName}
                onChange={(e) => handleOwnerChange('fullName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone Number (Optional)</label>
              <input
                type="text"
                value={formData.owner.contactNumber}
                onChange={(e) => handleOwnerChange('contactNumber', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.owner.email}
                onChange={(e) => handleOwnerChange('email', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ID Reference</label>
              <input
                type="text"
                value={formData.owner.idReference}
                onChange={(e) => handleOwnerChange('idReference', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Family Members / ಕುಟುಂಬ ಸದಸ್ಯರ ವಿವರ */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <FamilyMemberForm
            members={formData.familyMembers || []}
            onChange={(updatedMembers) =>
              setFormData((prev) => ({ ...prev, familyMembers: updatedMembers }))
            }
          />
        </div>

        {/* Section 5: Security Present on Premises / ಭದ್ರತಾ ವ್ಯವಸ್ಥೆ */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center border-b pb-2">
            <Shield className="w-4 h-4 mr-2 text-amber-600" />
            Security Present on Premises / ಭದ್ರತಾ ವ್ಯವಸ್ಥೆ
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* CCTV Installed */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-800 mb-2">
                CCTV Installed / ಸಿ.ಸಿ.ಟಿ.ವಿ ಅಳವಡಿಸಲಾಗಿದೆಯೇ?
              </label>
              <div className="flex items-center space-x-3">
                {['Yes', 'No'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSecurityChange('cctvInstalled', opt)}
                    className={`flex-1 py-2 px-3 font-bold rounded-lg border transition ${
                      formData.security?.cctvInstalled === opt
                        ? opt === 'Yes'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-800 text-white border-slate-800 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {opt === 'Yes' ? 'ಹೌದು / Yes' : 'ಇಲ್ಲ / No'}
                  </button>
                ))}
              </div>
            </div>

            {/* Security Guard Present */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-800 mb-2">
                Security Guard Present / ಭದ್ರತಾ ಸಿಬ್ಬಂದಿ ಇದ್ದಾರೆಯೇ?
              </label>
              <div className="flex items-center space-x-3">
                {['Yes', 'No'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSecurityChange('securityGuardPresent', opt)}
                    className={`flex-1 py-2 px-3 font-bold rounded-lg border transition ${
                      formData.security?.securityGuardPresent === opt
                        ? opt === 'Yes'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-800 text-white border-slate-800 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {opt === 'Yes' ? 'ಹೌದು / Yes' : 'ಇಲ್ಲ / No'}
                  </button>
                ))}
              </div>
            </div>

            {/* Other Security Arrangements */}
            <div className="sm:col-span-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-800 mb-1">
                Other Security Arrangements / ಇತರ ಭದ್ರತಾ ವ್ಯವಸ್ಥೆಗಳು
              </label>
              <input
                type="text"
                value={formData.security?.otherArrangements || ''}
                onChange={(e) => handleSecurityChange('otherArrangements', e.target.value)}
                placeholder="e.g. Alarm system, compound fencing, guard dog / ಅಲಾರಾಂ, ಗೇಟೆಡ್ ಕಾಂಪೌಂಡ್, ಇತ್ಯಾದಿ"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 5: House Photos (Optional) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center border-b pb-2">
            <Camera className="w-4 h-4 mr-2 text-amber-600" />
            Upload House Photos (Optional)
          </h3>
          <p className="text-xs text-slate-500">
            Add or update photographs of the house. You can add new photos at any time.
          </p>
          <PhotoUploader photos={photos} onChange={setPhotos} maxPhotos={5} />
        </div>

        {/* Submit button bar */}
        <div className="flex items-center justify-end space-x-3 pt-3">
          <Link
            to={`/houses/${id}`}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {submitting ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditHousePage;
