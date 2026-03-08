
'use client';

import { useState } from 'react';

const mockProfiles = [
  {
    id: 1,
    name: 'SuperSaver',
    description: 'Budget-friendly fuel and vehicle services',
    productCount: 13,
    color: 'bg-green-500'
  },
  {
    id: 2,
    name: 'SuperFlex',
    description: 'Premium fuel and comprehensive vehicle care',
    productCount: 13,
    color: 'bg-blue-500'
  }
];

interface ProfileSelectorProps {
  selectedProfiles: any[];
  onSelectProfile: (profile: any) => void;
  multiSelect?: boolean;
}

export default function ProfileSelector({ selectedProfiles, onSelectProfile, multiSelect = false }: ProfileSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProfiles = mockProfiles.filter(profile =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSelected = (profile) => {
    return selectedProfiles.some(selected => selected.id === profile.id);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 h-fit">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {multiSelect ? 'Select Profiles' : 'Select Profile'}
        </h2>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="ri-search-line text-gray-400 w-5 h-5 flex items-center justify-center"></i>
          </div>
          <input
            type="text"
            placeholder="Search profiles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {multiSelect && selectedProfiles.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 font-medium mb-2">
            Selected Profiles ({selectedProfiles.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedProfiles.map(profile => (
              <span key={profile.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <div className={`w-2 h-2 rounded-full ${profile.color} mr-1`}></div>
                {profile.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredProfiles.map((profile) => (
          <div
            key={profile.id}
            onClick={() => onSelectProfile(profile)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
              isSelected(profile)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className={`w-3 h-3 rounded-full ${profile.color} mr-2`}></div>
                  <h3 className="font-medium text-gray-900">{profile.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">{profile.description}</p>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className="flex items-center">
                    <i className="ri-box-3-line w-4 h-4 flex items-center justify-center mr-1"></i>
                    {profile.productCount} products
                  </span>
                </div>
              </div>

              {isSelected(profile) && (
                <i className="ri-check-line text-blue-500 w-5 h-5 flex items-center justify-center ml-2"></i>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
