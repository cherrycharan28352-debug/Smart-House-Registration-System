import React from 'react';
import { Plus, Trash2, Users } from 'lucide-react';

const STANDARD_RELATIONSHIPS = [
  { value: 'Husband', label: 'Husband / ಗಂಡ' },
  { value: 'Wife', label: 'Wife / ಹೆಂಡತಿ' },
  { value: 'Son', label: 'Son / ಮಗ' },
  { value: 'Daughter', label: 'Daughter / ಮಗಳು' },
  { value: 'Father', label: 'Father / ತಂದೆ' },
  { value: 'Mother', label: 'Mother / ತಾಯಿ' },
  { value: 'Brother', label: 'Brother / ಸಹೋದರ' },
  { value: 'Sister', label: 'Sister / ಸಹೋದರಿ' },
  { value: 'Grandfather', label: 'Grandfather / ಅಜ್ಜ' },
  { value: 'Grandmother', label: 'Grandmother / ಅಜ್ಜಿ' },
  { value: 'Spouse', label: 'Spouse / ಪತಿ - ಪತ್ನಿ' },
  { value: 'Child', label: 'Child / ಮಗು' },
  { value: 'Parent', label: 'Parent / ಪೋಷಕರು' },
  { value: 'Sibling', label: 'Sibling / ಒಡಹುಟ್ಟಿದವರು' },
  { value: 'Grandparent', label: 'Grandparent / ಹಿರಿಯರು' },
  { value: 'Grandchild', label: 'Grandchild / ಮೊಮ್ಮಕ್ಕಳು' },
  { value: 'Relative', label: 'Relative / ಸಂಬಂಧಿಕರು' },
  { value: 'Tenant', label: 'Tenant / ಬಾಡಿಗೆದಾರರು' },
  { value: 'Other', label: 'Other / ಇತರ' }
];

const FamilyMemberForm = ({ members = [], onChange }) => {
  const handleAddMember = () => {
    onChange([
      ...members,
      {
        fullName: '',
        relationship: 'Wife',
        age: '',
        gender: 'Prefer not to say',
        occupation: '',
        contactNumber: ''
      }
    ]);
  };

  const handleRemoveMember = (index) => {
    const memberName = members[index]?.fullName ? `"${members[index].fullName}"` : `Member #${index + 1}`;
    const confirmed = window.confirm(
      `ಖಂಡಿತವಾಗಿಯೂ ${memberName} ಅವರನ್ನು ಪಟ್ಟಿಯಿಂದ ತೆಗೆದುಹಾಕಲು ಬಯಸುವಿರಾ?\nAre you sure you want to remove ${memberName} from this household?`
    );
    if (!confirmed) return;

    const updated = [...members];
    updated.splice(index, 1);
    onChange(updated);
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...members];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    onChange(updated);
  };

  // Helper to ensure existing saved values that might not be in the list are still displayed
  const getOptionsForMember = (currentValue) => {
    if (!currentValue) return STANDARD_RELATIONSHIPS;
    const exists = STANDARD_RELATIONSHIPS.some(
      (r) => r.value.toLowerCase() === currentValue.toLowerCase()
    );
    if (!exists) {
      return [{ value: currentValue, label: currentValue }, ...STANDARD_RELATIONSHIPS];
    }
    return STANDARD_RELATIONSHIPS;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            ಕುಟುಂಬ ಸದಸ್ಯರ ವಿವರ / Family & Household Members ({members.length})
          </h4>
          <p className="text-[11px] text-slate-400">
            Add individuals residing in the registered household (ಗಂಡ, ಹೆಂಡತಿ, ಮಗ, ಮಗಳು, ತಂದೆ, ತಾಯಿ, ಇತ್ಯಾದಿ).
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddMember}
          className="inline-flex items-center px-3.5 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition shadow-sm active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>Add Member / ಸದಸ್ಯರನ್ನು ಸೇರಿಸಿ</span>
        </button>
      </div>

      {members.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">ಇನ್ನೂ ಯಾವುದೇ ಕುಟುಂಬ ಸದಸ್ಯರನ್ನು ಸೇರಿಸಲಾಗಿಲ್ಲ / No additional family members added yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            ಮನೆಯಲ್ಲಿ ವಾಸಿಸುವ ಇತರ ಸದಸ್ಯರನ್ನು ಸೇರಿಸಲು "Add Member" ಬಟನ್ ಒತ್ತಿ.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member, idx) => {
            const memberOptions = getOptionsForMember(member.relationship);

            return (
              <div
                key={member._id || idx}
                className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl relative space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span>ಸದಸ್ಯ #{idx + 1} / Member #{idx + 1}</span>
                    {member.relationship && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                        {member.relationship}
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(idx)}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold inline-flex items-center px-2 py-1 rounded-lg hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    <span>Remove / ತೆಗೆದುಹಾಕಿ</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name / ಪೂರ್ಣ ಹೆಸರು <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={member.fullName}
                      onChange={(e) => handleFieldChange(idx, 'fullName', e.target.value)}
                      placeholder="ಸದಸ್ಯರ ಪೂರ್ಣ ಹೆಸರು / Full Name"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Relationship / ಸಂಬಂಧ <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={member.relationship}
                      onChange={(e) => handleFieldChange(idx, 'relationship', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                    >
                      {memberOptions.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Age / ವಯಸ್ಸು</label>
                    <input
                      type="number"
                      min="0"
                      max="130"
                      value={member.age}
                      onChange={(e) => handleFieldChange(idx, 'age', e.target.value)}
                      placeholder="ವಯಸ್ಸು / Age"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Gender / ಲಿಂಗ</label>
                    <select
                      value={member.gender}
                      onChange={(e) => handleFieldChange(idx, 'gender', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Male">Male / ಪುರುಷ</option>
                      <option value="Female">Female / ಮಹಿಳೆ</option>
                      <option value="Other">Other / ಇತರ</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Occupation / ಉದ್ಯೋಗ</label>
                    <input
                      type="text"
                      value={member.occupation}
                      onChange={(e) => handleFieldChange(idx, 'occupation', e.target.value)}
                      placeholder="ಉದ್ಯೋಗ / Occupation"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contact Number / ಮೊಬೈಲ್</label>
                    <input
                      type="text"
                      value={member.contactNumber}
                      onChange={(e) => handleFieldChange(idx, 'contactNumber', e.target.value)}
                      placeholder="ಮೊಬೈಲ್ ಸಂಖ್ಯೆ / Mobile"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FamilyMemberForm;
