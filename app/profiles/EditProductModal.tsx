
'use client';

import { useState, useEffect } from 'react';

interface EditProductModalProps {
  product: any;
  onSave: (product: any) => void;
  onClose: () => void;
  profileName?: string;
}

export default function EditProductModal({ product, onSave, onClose, profileName }: EditProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    discount: '',
    surcharge: '',
    description: '',
    supplier: '',
    supplierCountry: '',
    station: '',
    stationGroup: '',
    priceModel: '',
    currency: ''
  });

  const [errors, setErrors] = useState({});

  const categories = [
    'Diesel fuels',
    'Caburetor fuels', 
    'Gas fuels',
    'Adblue',
    'Vehicle cleaning',
    'Vehicle accessories',
    'Moto oil',
    'Repair/breakdown',
    'Parking fee',
    'Tyre service',
    'Vehicle rental',
    'Vehicle services',
    'Workshop services'
  ];

  const suppliers = [
    'Shell',
    'BP',
    'Esso',
    'Total',
    'Texaco',
    'Chevron',
    'Mobil',
    'Petro-Canada',
    'Sunoco',
    'Valero'
  ];

  const supplierCountries = [
    'US',
    'CA',
    'UK',
    'DE',
    'FR',
    'NL',
    'IT',
    'ES'
  ];

  const stations = [
    'Main Station',
    'Highway Station',
    'City Center',
    'Airport Station',
    'Shopping Mall',
    'Industrial Zone'
  ];

  const stationGroups = [
    'Group A',
    'Group B',
    'Group C',
    'Premium',
    'Standard',
    'Express'
  ];

  const priceModels = [
    'List',
    'Pump',
    'Percentage'
  ];

  const currencies = [
    'USD',
    'EUR',
    'GBP',
    'CAD',
    'JPY',
    'AUD',
    'CHF',
    'CNY'
  ];

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price?.toString() || '',
        category: product.category || '',
        discount: product.discount?.toString() || '',
        surcharge: product.surcharge?.toString() || '',
        description: product.description || '',
        supplier: product.supplier || '',
        supplierCountry: product.supplierCountry || '',
        station: product.station || '',
        stationGroup: product.stationGroup || '',
        priceModel: product.priceModel || '',
        currency: product.currency || ''
      });
    }
  }, [product]);

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.discount || isNaN(Number(formData.discount)) || Number(formData.discount) < 0 || Number(formData.discount) > 100) {
      newErrors.discount = 'Valid discount (0-100%) is required';
    }
    if (formData.surcharge && (isNaN(Number(formData.surcharge)) || Number(formData.surcharge) < 0)) {
      newErrors.surcharge = 'Valid surcharge amount is required';
    }
    if (!formData.supplier) newErrors.supplier = 'Supplier is required';
    if (!formData.supplierCountry) newErrors.supplierCountry = 'Supplier country is required';
    if (!formData.station) newErrors.station = 'Station is required';
    if (!formData.stationGroup) newErrors.stationGroup = 'Station group is required';
    if (!formData.priceModel) newErrors.priceModel = 'Price model is required';
    if (!formData.currency) newErrors.currency = 'Currency is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSave({
        ...product,
        ...formData,
        price: Number(formData.price),
        discount: Number(formData.discount),
        surcharge: formData.surcharge ? Number(formData.surcharge) : 0
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Product</h2>
            {profileName && (
              <p className="text-sm text-gray-600 mt-1">Profile: <span className="font-medium">{profileName}</span></p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <i className="ri-close-line w-6 h-6 flex items-center justify-center"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter product name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier Country *
              </label>
              <select
                name="supplierCountry"
                value={formData.supplierCountry}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8 ${
                  errors.supplierCountry ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select country</option>
                {supplierCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              {errors.supplierCountry && <p className="text-red-500 text-xs mt-1">{errors.supplierCountry}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier *
              </label>
              <select
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8 ${
                  errors.supplier ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier} value={supplier}>{supplier}</option>
                ))}
              </select>
              {errors.supplier && <p className="text-red-500 text-xs mt-1">{errors.supplier}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Station *
              </label>
              <select
                name="station"
                value={formData.station}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8 ${
                  errors.station ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select station</option>
                {stations.map(station => (
                  <option key={station} value={station}>{station}</option>
                ))}
              </select>
              {errors.station && <p className="text-red-500 text-xs mt-1">{errors.station}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Station Group *
              </label>
              <select
                name="stationGroup"
                value={formData.stationGroup}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8 ${
                  errors.stationGroup ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select station group</option>
                {stationGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
              {errors.stationGroup && <p className="text-red-500 text-xs mt-1">{errors.stationGroup}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Model *
              </label>
              <select
                name="priceModel"
                value={formData.priceModel}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8 ${
                  errors.priceModel ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select price model</option>
                {priceModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
              {errors.priceModel && <p className="text-red-500 text-xs mt-1">{errors.priceModel}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency *
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8 ${
                  errors.currency ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select currency</option>
                {currencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
              {errors.currency && <p className="text-red-500 text-xs mt-1">{errors.currency}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount (%) *
              </label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                min="0"
                max="100"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                  errors.discount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.discount && <p className="text-red-500 text-xs mt-1">{errors.discount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Surcharge/Fee ($)
              </label>
              <input
                type="number"
                name="surcharge"
                value={formData.surcharge}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                  errors.surcharge ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.surcharge && <p className="text-red-500 text-xs mt-1">{errors.surcharge}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              placeholder="Enter product description (optional)"
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 characters
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
