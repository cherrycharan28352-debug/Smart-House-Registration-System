import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Badge,
  Phone,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Building2,
  Clock,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { registerStaffUser } from '../services/authService';
import { getBeats } from '../services/beatService';
import { useToast } from '../context/ToastContext';

const StaffRegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    staffId: '',
    mobileNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    requestedBeat: '',
    requestedVillage: ''
  });

  const [beatsList, setBeatsList] = useState([]);
  const [villagesForBeat, setVillagesForBeat] = useState([]);
  const [loadingBeats, setLoadingBeats] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBeatsData = async () => {
      try {
        const beats = await getBeats();
        setBeatsList(beats || []);
      } catch (err) {
        console.warn('Could not load beats for registration dropdown:', err.message);
      } finally {
        setLoadingBeats(false);
      }
    };
    fetchBeatsData();
  }, []);

  const handleBeatChange = (e) => {
    const selectedBeatNum = e.target.value;
    setFormData((prev) => ({
      ...prev,
      requestedBeat: selectedBeatNum,
      requestedVillage: ''
    }));

    if (!selectedBeatNum) {
      setVillagesForBeat([]);
      return;
    }

    const matchedBeat = beatsList.find((b) => b.beatNumber === selectedBeatNum);
    if (matchedBeat && matchedBeat.villages) {
      setVillagesForBeat(matchedBeat.villages);
    } else {
      setVillagesForBeat([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (formData.password.length < 6) {
      setError('ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ ೬ ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು / Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತು ದೃಢೀಕರಣ ಪಾಸ್‌ವರ್ಡ್ ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ / Passwords do not match.');
      return;
    }

    const mobileDigits = formData.mobileNumber.replace(/\D/g, '');
    if (mobileDigits.length < 10) {
      setError('ದಯವಿಟ್ಟು ೧೦ ಅಂಕಿಗಳ ಮಾನ್ಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ / Please enter a valid 10-digit mobile number.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await registerStaffUser(formData);
      setSuccessData(res.data || formData);
      toast.success('ಸಿಬ್ಬಂದಿ ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ / Registration submitted!');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ / Registration failed.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Return to homepage */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl mb-4 flex items-center justify-between">
        <Link
          to="/staff/login"
          className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          ಸಿಬ್ಬಂದಿ ಲಾಗಿನ್‌ಗೆ ಹಿಂತಿರುಗಿ / Back to Staff Login
        </Link>
        <span className="text-xs text-blue-400 font-semibold">
          ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ • KSP
        </span>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-3xl shadow-xl shadow-blue-500/20 border border-blue-400/30 mb-3">
            👮
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ಬೀಟ್ ಸಿಬ್ಬಂದಿ ಖಾತೆ ನೋಂದಣಿ
          </h2>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-blue-400">
            Field Staff Account Registration Portal
          </p>
          <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
            ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್ ಸಮೀಕ್ಷೆಗಾಗಿ ಬೀಟ್ ಅಧಿಕಾರಿಗಳ ಅಧಿಕೃತ ಖಾತೆ ಸೃಷ್ಟಿ.
          </p>
        </div>

        <div className="mt-6 bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl p-6 sm:p-10 relative z-10">
          {successData ? (
            /* Registration Success View */
            <div className="text-center py-6 space-y-5 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto text-3xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">
                  ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಕೆಯಾಗಿದೆ!
                </h3>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-center">
                  <Clock className="w-4 h-4 mr-1.5 animate-pulse" />
                  ನಿರ್ವಾಹಕರ ಅನುಮೋದನೆ ಬಾಕಿ ಇದೆ (Pending Admin Approval)
                </p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2 max-w-md mx-auto text-slate-300">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">ಪೂರ್ಣ ಹೆಸರು:</span>
                  <span className="font-bold text-white">{successData.fullName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">ಸಿಬ್ಬಂದಿ ಐಡಿ / ಬಿಲ್ಲೆ ಸಂಖ್ಯೆ:</span>
                  <span className="font-mono font-bold text-blue-400">{successData.staffId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">ಇಮೇಲ್:</span>
                  <span className="text-white">{successData.email}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">ಖಾತೆಯ ಸ್ಥಿತಿ:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Pending Verification
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/50 text-xs text-blue-300 leading-relaxed max-w-md mx-auto text-left">
                ℹ️ <strong>ಮುಂದಿನ ಹಂತ:</strong> ನಿಮ್ಮ ಠಾಣೆಯ ಮುಖ್ಯ ನಿರ್ವಾಹಕರು (Admin) ಈ ಖಾತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ ಅನುಮೋದಿಸಿ, ನಿಮಗೆ ಸೂಕ್ತ ಬೀಟ್‌ಗಳನ್ನು ನಿಯೋಜಿಸುತ್ತಾರೆ. ಅನುಮೋದನೆಯ ನಂತರ ನೀವು ಲಾಗಿನ್ ಆಗಿ ಮನೆ ಸಮೀಕ್ಷೆ ನಡೆಸಬಹುದು.
              </div>

              <div className="pt-2">
                <Link
                  to="/staff/login"
                  className="inline-flex items-center px-6 py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg transition"
                >
                  ಸಿಬ್ಬಂದಿ ಲಾಗಿನ್‌ಗೆ ಹೋಗಿ / Proceed to Staff Login &rarr;
                </Link>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                  ಪೂರ್ಣ ಹೆಸರು / Full Name *
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. ಮಂಜುನಾಥ್ ಕೆ.ಎಸ್ / Manjunath K.S."
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Staff ID & Mobile Number in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    ಸಿಬ್ಬಂದಿ ಐಡಿ / ಬಿಲ್ಲೆ ಸಂಖ್ಯೆ (Staff / Badge ID) *
                  </label>
                  <div className="relative rounded-xl">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      name="staffId"
                      value={formData.staffId}
                      onChange={handleChange}
                      placeholder="e.g. POL-1082 or HC-45"
                      className="block w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    ಮೊಬೈಲ್ ಸಂಖ್ಯೆ / Mobile Number *
                  </label>
                  <div className="relative rounded-xl">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      maxLength={12}
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      placeholder="e.g. 9876543210"
                      className="block w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                  ಅಧಿಕೃತ ಇಮೇಲ್ / Email Address *
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. beat1.officer@ksp.gov.in"
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Password & Confirm Password in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    ಪಾಸ್‌ವರ್ಡ್ / Password * (ಕನಿಷ್ಠ ೬ ಅಕ್ಷರ)
                  </label>
                  <div className="relative rounded-xl">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••••••"
                      className="block w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಣ / Confirm Password *
                  </label>
                  <div className="relative rounded-xl">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••••••"
                      className="block w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Requested Beat & Village (Optional selection for admin reference) */}
              <div className="pt-2 border-t border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  ಆದ್ಯತೆಯ ಕಾರ್ಯವ್ಯಾಪ್ತಿ / Preferred Jurisdiction (Optional)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      ಆದ್ಯತೆಯ ಬೀಟ್ / Preferred Beat
                    </label>
                    <select
                      name="requestedBeat"
                      value={formData.requestedBeat}
                      onChange={handleBeatChange}
                      className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- ಬೀಟ್ ಆಯ್ಕೆಮಾಡಿ (Optional) --</option>
                      {beatsList.map((b) => (
                        <option key={b.beatNumber} value={b.beatNumber}>
                          {b.beatNumber} ({b.beatNameKannada || b.beatName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      ಆದ್ಯತೆಯ ಗ್ರಾಮ / Preferred Village
                    </label>
                    <select
                      name="requestedVillage"
                      value={formData.requestedVillage}
                      onChange={handleChange}
                      disabled={!formData.requestedBeat || villagesForBeat.length === 0}
                      className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
                    >
                      <option value="">-- ಗ್ರಾಮ ಆಯ್ಕೆಮಾಡಿ (Optional) --</option>
                      {villagesForBeat.map((v) => (
                        <option key={v.villageId || v.name} value={v.nameKannada || v.name}>
                          {v.nameKannada || v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Role disclaimer */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                🛡️ <strong>ಸೂಚನೆ:</strong> ಈ ನೋಂದಣಿಯು ಕೇವಲ <strong>ಬೀಟ್ ಪೊಲೀಸ್ ಸಿಬ್ಬಂದಿಗೆ (Field Staff)</strong> ಮಾತ್ರ ಸೀಮಿತವಾಗಿದೆ. ನೋಂದಣಿಯಾದ ಪ್ರತಿಯೊಂದು ಖಾತೆಯು ನಿರ್ವಾಹಕರ ಅನುಮೋದನೆಯ ನಂತರವೇ ಕಾರ್ಯಗತಗೊಳ್ಳುತ್ತದೆ.
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="inline-flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      ಖಾತೆ ರಚಿಸಲಾಗುತ್ತಿದೆ / Submitting Registration...
                    </span>
                  ) : (
                    <span>ಖಾತೆ ನೋಂದಾಯಿಸಿ / Submit Staff Registration</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffRegisterPage;
