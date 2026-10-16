import React from 'react';
import { Plus, Trash2, Users } from 'lucide-react';

const FamilyMemberForm = ({ members = [], onChange }) => {
  const relationships = [
    'Spouse',
    'Child',
    'Parent',
    'Sibling',
    'Grandparent',
    'Grandchild',
    'Relative',
    'Tenant',
    'Other'
  ];

  const handleAddMember = () => {
    onChange([
      ...members,
      {
        fullName: '',
        relationship: 'Spouse',
        age: '',
        gender: 'Prefer not to say',
        occupation: '',
        contactNumber: ''
      }
    ]);
  };

  const handleRemoveMember = (index) => {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Family & Household Members ({members.length})
          </h4>
          <p className="text-[11px] text-slate-400">
            Add individuals residing in the registered household.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddMember}
          className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Member
        </button>
      </div>

      {members.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">No additional family members added yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Click "Add Member" if other relatives or residents live in this household.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl relative space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-extrabold text-blue-900">
                  Member #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(idx)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold inline-flex items-center"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={member.fullName}
                    onChange={(e) => handleFieldChange(idx, 'fullName', e.target.value)}
                    placeholder="ಸದಸ್ಯರ ಪೂರ್ಣ ಹೆಸರು / Full Name"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Relationship <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={member.relationship}
                    onChange={(e) => handleFieldChange(idx, 'relationship', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    {relationships.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    min="0"
                    max="130"
                    value={member.age}
                    onChange={(e) => handleFieldChange(idx, 'age', e.target.value)}
                    placeholder="ವಯಸ್ಸು / Age"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={member.gender}
                    onChange={(e) => handleFieldChange(idx, 'gender', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Occupation</label>
                  <input
                    type="text"
                    value={member.occupation}
                    onChange={(e) => handleFieldChange(idx, 'occupation', e.target.value)}
                    placeholder="ಉದ್ಯೋಗ / Occupation"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Number</label>
                  <input
                    type="text"
                    value={member.contactNumber}
                    onChange={(e) => handleFieldChange(idx, 'contactNumber', e.target.value)}
                    placeholder="ಮೊಬೈಲ್ ಸಂಖ್ಯೆ / Mobile"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FamilyMemberForm;
