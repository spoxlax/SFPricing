
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SummaryPage() {
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('pricingSummary');
    if (data) {
      setSummaryData(JSON.parse(data));
    }
  }, []);

  if (!summaryData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <i className="ri-file-list-line text-gray-400 w-8 h-8 flex items-center justify-center"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Summary Data</h2>
          <p className="text-gray-600 mb-4">No pricing data has been saved yet.</p>
          <Link 
            href="/"
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center mr-2"></i>
            Back to Profiles
          </Link>
        </div>
      </div>
    );
  }

  const { selectedProfiles, products, savedAt } = summaryData;

  const totalProducts = products.length;

  const productsByProfile = products.reduce((acc, product) => {
    const profileId = product.profileId;
    if (!acc[profileId]) {
      acc[profileId] = [];
    }
    acc[profileId].push(product);
    return acc;
  }, {});

  const getProfileName = (profileId) => {
    const profile = selectedProfiles.find(p => p.id === profileId);
    return profile ? profile.name : `Profile ${profileId}`;
  };

  const getProfileColor = (profileId) => {
    const profile = selectedProfiles.find(p => p.id === profileId);
    return profile ? profile.color : 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Pricing Summary</h1>
              <p className="text-gray-600">
                Summary of selected products and pricing from {selectedProfiles.length} profiles
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Saved on {new Date(savedAt).toLocaleString()}
              </p>
            </div>
            <Link 
              href="/"
              className="inline-flex items-center bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              <i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center mr-2"></i>
              Back to Profiles
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-1 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <i className="ri-box-3-line text-blue-600 w-5 h-5 flex items-center justify-center"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Profile Breakdown</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {Object.entries(productsByProfile).map(([profileId, profileProducts]) => {
                return (
                  <div key={profileId} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full ${getProfileColor(parseInt(profileId))} mr-3`}></div>
                        <h3 className="font-semibold text-gray-900">{getProfileName(parseInt(profileId))}</h3>
                        <span className="ml-3 text-sm text-gray-500">
                          ({profileProducts.length} product{profileProducts.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2 font-medium text-gray-900">Product</th>
                              <th className="text-left py-2 font-medium text-gray-900">Supplier Details</th>
                              <th className="text-left py-2 font-medium text-gray-900">Category</th>
                              <th className="text-right py-2 font-medium text-gray-900">Discount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {profileProducts.map((product) => (
                              <tr key={product.id} className="border-b border-gray-100">
                                <td className="py-3">
                                  <div>
                                    <p className="font-medium text-gray-900">{product.name}</p>
                                    <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                                  </div>
                                </td>
                                <td className="py-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                        {product.supplierCountry || 'US'}
                                      </span>
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                        {product.supplier || 'N/A'}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                        {product.station || 'Main Station'}
                                      </span>
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                        {product.stationGroup || 'Group A'}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {product.category}
                                  </span>
                                </td>
                                <td className="py-3 text-right">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    {product.discount}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
