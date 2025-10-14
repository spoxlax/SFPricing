
'use client';

import { useState } from 'react';
import ProfileSelector from './profiles/ProfileSelector';
import ProductManager from './profiles/ProductManager';

export default function Home() {
  const [selectedProfiles, setSelectedProfiles] = useState([]);

  const handleSelectProfile = (profile) => {
    const isSelected = selectedProfiles.some(p => p.id === profile.id);
    if (isSelected) {
      setSelectedProfiles(selectedProfiles.filter(p => p.id !== profile.id));
    } else {
      setSelectedProfiles([...selectedProfiles, profile]);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Management</h1>
              <p className="text-gray-600">
                Select multiple profiles to view grouped products
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ProfileSelector 
              selectedProfiles={selectedProfiles}
              onSelectProfile={handleSelectProfile}
              multiSelect={true}
            />
          </div>

          <div className="lg:col-span-2">
            <ProductManager 
              selectedProfiles={selectedProfiles}
              viewMode="multiple"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
