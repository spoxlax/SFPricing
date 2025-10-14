'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProductListProps {
  products: any[];
  onEditProduct: (product: any) => void;
  onDeleteProduct: (productId: number) => void;
  onViewProduct: (product: any) => void;
  onCloneProduct: (product: any) => void;
  groupByProfile?: boolean;
  profiles?: any[];
  onAddProduct: (profile: any) => void;
}

export default function ProductList({ products, onEditProduct, onDeleteProduct, onViewProduct, onCloneProduct, groupByProfile = false, profiles = [], onAddProduct }: ProductListProps) {
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [openDropdown, setOpenDropdown] = useState(null);
  const [expandedProfiles, setExpandedProfiles] = useState(new Set());
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const router = useRouter();

  // Initialize all profiles and categories as collapsed by default, all products still selected
  useEffect(() => {
    if (groupByProfile && products.length > 0) {
      // Keep profiles collapsed by default
      setExpandedProfiles(new Set());

      // Select all products by default
      setSelectedProducts(new Set(products.map(p => p.id)));

      // Keep all categories collapsed by default
      setExpandedCategories(new Set());
    }
  }, [products, groupByProfile]);

  const handleSavePricing = () => {
    const selectedProductsList = products.filter(product => selectedProducts.has(product.id));

    if (selectedProductsList.length === 0) {
      console.log('Please select at least one product to save pricing summary.');
      return;
    }

    const summaryData = {
      selectedProfiles: profiles,
      products: selectedProductsList,
      savedAt: new Date().toISOString()
    };

    localStorage.setItem('pricingSummary', JSON.stringify(summaryData));
    router.push('/summary');
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.supplierCountry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.station?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.stationGroup?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return b.price - a.price;
        case 'discount':
          return b.discount - a.discount;
        case 'category':
          return a.category.localeCompare(b.category);
        case 'surcharge':
          return b.surcharge - a.surcharge;
        default:
          return 0;
      }
    });

  // Group products by profile, then by category within each profile
  const groupedProducts = groupByProfile 
    ? filteredAndSortedProducts.reduce((acc, product) => {
        const profileId = product.profileId;
        const category = product.category;

        if (!acc[profileId]) {
          acc[profileId] = {};
        }
        if (!acc[profileId][category]) {
          acc[profileId][category] = [];
        }
        acc[profileId][category].push(product);
        return acc;
      }, {})
    : { all: { all: filteredAndSortedProducts } };

  const handleDeleteConfirm = (productId) => {
    onDeleteProduct(productId);
    setShowDeleteConfirm(null);
  };

  const handleCheckboxChange = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredAndSortedProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredAndSortedProducts.map(p => p.id)));
    }
  };

  // New function to handle select all for specific category within a profile
  const handleSelectAllInCategory = (categoryProducts) => {
    const categoryProductIds = categoryProducts.map(p => p.id);
    const newSelected = new Set(selectedProducts);

    // Check if all products in this category are selected
    const allCategoryProductsSelected = categoryProductIds.every(id => newSelected.has(id));

    if (allCategoryProductsSelected) {
      // Unselect all products in this category
      categoryProductIds.forEach(id => newSelected.delete(id));
    } else {
      // Select all products in this category
      categoryProductIds.forEach(id => newSelected.add(id));
    }

    setSelectedProducts(newSelected);
  };

  // Function to handle select all for entire profile
  const handleSelectAllInProfile = (profileId) => {
    const profileProducts = products.filter(p => p.profileId === profileId);
    const profileProductIds = profileProducts.map(p => p.id);
    const newSelected = new Set(selectedProducts);

    // Check if all products in this profile are selected
    const allProfileProductsSelected = profileProductIds.every(id => newSelected.has(id));

    if (allProfileProductsSelected) {
      // Unselect all products in this profile
      profileProductIds.forEach(id => newSelected.delete(id));
    } else {
      // Select all products in this profile
      profileProductIds.forEach(id => newSelected.add(id));
    }

    setSelectedProducts(newSelected);
  };

  const toggleDropdown = (productId) => {
    setOpenDropdown(openDropdown === productId ? null : productId);
  };

  const toggleProfileExpansion = (profileId) => {
    const newExpanded = new Set(expandedProfiles);
    if (newExpanded.has(profileId)) {
      newExpanded.delete(profileId);
    } else {
      newExpanded.add(profileId);
    }
    setExpandedProfiles(newExpanded);
  };

  const toggleCategoryExpansion = (profileId, category) => {
    const categoryKey = `${profileId}-${category}`;
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryKey)) {
      newExpanded.delete(categoryKey);
    } else {
      newExpanded.add(categoryKey);
    }
    setExpandedCategories(newExpanded);
  };

  const getProfileName = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    return profile ? profile.name : `Profile ${profileId}`;
  };

  const getProfileColor = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    return profile ? profile.color : 'bg-gray-500';
  };

  const getProfileByProfileId = (profileId) => {
    return profiles.find(p => p.id === profileId);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Diesel fuels': 'bg-blue-500',
      'Caburetor fuels': 'bg-red-500',
      'Gas fuels': 'bg-green-500',
      'Adblue': 'bg-cyan-500',
      'Vehicle cleaning': 'bg-purple-500',
      'Vehicle accessories': 'bg-orange-500',
      'Moto oil': 'bg-yellow-500',
      'Repair/breakdown': 'bg-pink-500',
      'Parking fee': 'bg-indigo-500',
      'Tyre service': 'bg-teal-500',
      'Vehicle rental': 'bg-lime-500',
      'Vehicle services': 'bg-amber-500',
      'Workshop services': 'bg-emerald-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  // Get total products count for a profile
  const getTotalProductsInProfile = (profileId) => {
    return products.filter(p => p.profileId === profileId).length;
  };

  // Get selected products count for a profile
  const getSelectedProductsInProfile = (profileId) => {
    return products.filter(p => p.profileId === profileId && selectedProducts.has(p.id)).length;
  };

  // Get total products count for a category within a profile
  const getTotalProductsInCategory = (profileId, category) => {
    return products.filter(p => p.profileId === profileId && p.category === category).length;
  };

  // Get selected products count for a category within a profile
  const getSelectedProductsInCategory = (profileId, category) => {
    return products.filter(p => p.profileId === profileId && p.category === category && selectedProducts.has(p.id)).length;
  };

  // Check if all products in a category are selected
  const areAllCategoryProductsSelected = (categoryProducts) => {
    return categoryProducts.length > 0 && categoryProducts.every(p => selectedProducts.has(p.id));
  };

  // Inline editing functions
  const handleCellEdit = (productId, field, currentValue) => {
    setEditingCell(`${productId}-${field}`);
    setEditValue(currentValue.toString());
  };

  const handleCellSave = (productId, field) => {
    const updatedProduct = products.find(p => p.id === productId);
    if (updatedProduct) {
      let newValue = editValue;

      // Type conversion based on field
      if (field === 'discount' || field === 'surcharge') {
        newValue = parseFloat(editValue) || 0;
        if (field === 'discount' && (newValue < 0 || newValue > 100)) {
          console.log('Discount must be between 0 and 100%');
          setEditingCell(null);
          return;
        }
        if (field === 'surcharge' && newValue < 0) {
          console.log('Surcharge cannot be negative');
          setEditingCell(null);
          return;
        }
      }

      const updated = { ...updatedProduct, [field]: newValue };
      onEditProduct(updated);
    }
    setEditingCell(null);
    setEditValue('');
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyPress = (e, productId, field) => {
    if (e.key === 'Enter') {
      handleCellSave(productId, field);
    } else if (e.key === 'Escape') {
      handleCellCancel();
    }
  };

  const renderEditableCell = (product, field, displayValue, className = '') => {
    const cellKey = `${product.id}-${field}`;
    const isEditing = editingCell === cellKey;
    
    // Store initial value when first editing (if not already stored)
    if (!product[`initial_${field}`] && product[`initial_${field}`] !== 0) {
      product[`initial_${field}`] = product[field];
    }
    
    const initialValue = product[`initial_${field}`];
    const currentValue = product[field];
    const hasChanged = initialValue !== currentValue;

    if (isEditing) {
      return (
        <div className="flex items-center space-x-1 w-full">
          <input
            type={field === 'discount' || field === 'surcharge' ? 'number' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, product.id, field)}
            onBlur={() => handleCellCancel()}
            className="flex-1 text-xs px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
            style={{ minWidth: '60px', maxWidth: '100px' }}
            autoFocus
            min={field === 'discount' ? '0' : field === 'surcharge' ? '0' : undefined}
            max={field === 'discount' ? '100' : undefined}
            step={field === 'discount' || field === 'surcharge' ? '0.01' : undefined}
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCellSave(product.id, field);
            }}
            className="p-1 text-green-600 hover:text-green-700 cursor-pointer flex-shrink-0"
            title="Save"
          >
            <i className="ri-check-line w-3 h-3 flex items-center justify-center"></i>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCellCancel();
            }}
            className="p-1 text-red-600 hover:text-red-700 cursor-pointer flex-shrink-0"
            title="Cancel"
          >
            <i className="ri-close-line w-3 h-3 flex items-center justify-center"></i>
          </button>
        </div>
      );
    }

    return (
      <div 
        className={`${className} cursor-pointer hover:bg-gray-100 rounded px-2 py-1 transition-colors group flex flex-col`}
        onClick={(e) => {
          e.stopPropagation();
          handleCellEdit(product.id, field, product[field]);
        }}
        title={`Click to edit ${field}`}
      >
        <div className="flex items-center">
          <span className="flex-1">{displayValue}</span>
          <i className="ri-edit-line w-3 h-3 flex items-center justify-center ml-1 opacity-0 group-hover:opacity-50"></i>
        </div>
        {hasChanged && (
          <div className="text-xs text-gray-400 mt-1">
            Initial: {field === 'discount' ? `${initialValue}%` : field === 'surcharge' ? `$${initialValue}` : initialValue}
          </div>
        )}
      </div>
    );
  };

  const renderProductTable = (productsToRender) => (
    <div className="w-full">
      <table className="w-full table-fixed">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-2 font-semibold text-gray-900 w-10">
              <input
                type="checkbox"
                checked={areAllCategoryProductsSelected(productsToRender)}
                onChange={() => handleSelectAllInCategory(productsToRender)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
            </th>
            <th className="text-left py-3 px-2 font-semibold text-gray-900 w-32">Product ID</th>
            <th className="text-left py-3 px-2 font-semibold text-gray-900 w-32">Supplier Details</th>
            <th className="text-left py-3 px-2 font-semibold text-gray-900 w-28">Category</th>
            <th className="text-left py-3 px-2 font-semibold text-gray-900 w-20">Currency</th>
            <th className="text-left py-3 px-2 font-semibold text-gray-900 w-20">Discount</th>
            <th className="text-left py-3 px-2 font-semibold text-gray-900 w-24">Surcharge/Fee</th>
            <th className="text-right py-3 px-2 font-semibold text-gray-900 w-16">Actions</th>
          </tr>
        </thead>
        <tbody>
          {productsToRender.map((product) => (
            <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-4 px-2">
                <input
                  type="checkbox"
                  checked={selectedProducts.has(product.id)}
                  onChange={() => handleCheckboxChange(product.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </td>
              <td className="py-4 px-2">
                <div>
                  <h4 
                    className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer transition-colors text-sm"
                    onClick={() => onViewProduct(product)}
                    title={product.name}
                  >
                    #{product.id}
                  </h4>
                </div>
              </td>
              <td className="py-4 px-2">
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
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 truncate">
                      {product.station || 'Main Station'}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 truncate">
                      {product.stationGroup || 'Group A'}
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-4 px-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 truncate">
                  {product.category}
                </span>
              </td>
              <td className="py-4 px-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {product.currency || 'USD'}
                </span>
              </td>
              <td className="py-4 px-2">
                {renderEditableCell(
                  product,
                  'discount',
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {product.discount}%
                  </span>
                )}
              </td>
              <td className="py-4 px-2">
                {renderEditableCell(
                  product,
                  'surcharge',
                  <span className="font-semibold text-blue-600 text-sm">${product.surcharge || '0.00'}</span>
                )}
              </td>
              <td className="py-4 px-2">
                <div className="flex justify-end">
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(product.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      <i className="ri-more-2-line w-4 h-4 flex items-center justify-center"></i>
                    </button>
                    
                    {openDropdown === product.id && (
                      <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <button
                          onClick={() => {
                            onEditProduct(product);
                            setOpenDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center cursor-pointer"
                        >
                          <i className="ri-edit-line w-4 h-4 flex items-center justify-center mr-2"></i>
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            onCloneProduct(product);
                            setOpenDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center cursor-pointer"
                        >
                          <i className="ri-file-copy-line w-4 h-4 flex items-center justify-center mr-2"></i>
                          Clone
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(product.id);
                            setOpenDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center cursor-pointer"
                        >
                          <i className="ri-delete-bin-line w-4 h-4 flex items-center justify-center mr-2"></i>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900">Products</h3>
          </div>
          <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-search-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
                </div>
                <input
                  type="text"
                  placeholder="Search products by name, category, supplier, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  >
                    <i className="ri-close-line text-gray-400 hover:text-gray-600 w-4 h-4 flex items-center justify-center"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="discount">Sort by Discount</option>
                <option value="surcharge">Sort by Surcharge</option>
                <option value="category">Sort by Category</option>
              </select>
            </div>
          </div>

          {searchTerm && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {filteredAndSortedProducts.length} results for "{searchTerm}"
              </span>
              {filteredAndSortedProducts.length > 0 && (
                <span className="text-blue-600">
                  {Object.keys(groupedProducts).length} profile{Object.keys(groupedProducts).length !== 1 ? 's' : ''} match
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <i className={`${searchTerm ? 'ri-search-line' : 'ri-shopping-bag-line'} text-gray-400 w-8 h-8 flex items-center justify-center`}></i>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No products found' : 'No products found'}
            </h4>
            <p className="text-gray-600">
              {searchTerm ? `No products match "${searchTerm}". Try a different search term.` : 'Add products to profiles to get started'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 text-blue-600 hover:text-blue-700 text-sm cursor-pointer"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedProducts).map(([profileId, categoriesData]) => {
              const isProfileExpanded = expandedProfiles.has(parseInt(profileId));
              const selectedInProfile = getSelectedProductsInProfile(parseInt(profileId));
              const totalInProfile = getTotalProductsInProfile(parseInt(profileId));

              return (
                <div key={profileId} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Profile Header */}
                  <div className="bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center cursor-pointer hover:text-gray-600 transition-colors"
                        onClick={() => toggleProfileExpansion(parseInt(profileId))}
                      >
                        <div className={`w-4 h-4 rounded-full ${getProfileColor(parseInt(profileId))} mr-3`}></div>
                        <h4 className="font-semibold text-gray-900">
                          {getProfileName(parseInt(profileId))}
                        </h4>
                        <span className="ml-3 text-sm text-gray-500">
                          ({selectedInProfile}/{totalInProfile} selected)
                        </span>
                        <i className={`ri-arrow-${isProfileExpanded ? 'up' : 'down'}-s-line w-5 h-5 flex items-center justify-center text-gray-400 ml-2`}></i>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedInProfile === totalInProfile && totalInProfile > 0}
                          onChange={() => handleSelectAllInProfile(parseInt(profileId))}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <button
                          onClick={() => onAddProduct(getProfileByProfileId(parseInt(profileId)))}
                          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm whitespace-nowrap cursor-pointer"
                        >
                          <i className="ri-add-line w-4 h-4 flex items-center justify-center mr-2"></i>
                          Add Product
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Categories within Profile */}
                  {isProfileExpanded && (
                    <div className="space-y-0">
                      {Object.entries(categoriesData).map(([category, categoryProducts]) => {
                        const categoryKey = `${profileId}-${category}`;
                        const isCategoryExpanded = expandedCategories.has(categoryKey);
                        const selectedInCategory = getSelectedProductsInCategory(parseInt(profileId), category);
                        const totalInCategory = getTotalProductsInCategory(parseInt(profileId), category);

                        return (
                          <div key={categoryKey} className="border-t border-gray-100">
                            {/* Category Header */}
                            <div className="bg-gray-25 p-3 pl-8">
                              <div className="flex items-center justify-between">
                                <div 
                                  className="flex items-center cursor-pointer hover:text-gray-600 transition-colors"
                                  onClick={() => toggleCategoryExpansion(parseInt(profileId), category)}
                                >
                                  <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)} mr-2`}></div>
                                  <h5 className="font-medium text-gray-800 text-sm">
                                    {category}
                                  </h5>
                                  <span className="ml-2 text-xs text-gray-500">
                                    ({selectedInCategory}/{totalInCategory} selected)
                                  </span>
                                  <i className={`ri-arrow-${isCategoryExpanded ? 'up' : 'down'}-s-line w-4 h-4 flex items-center justify-center text-gray-400 ml-1`}></i>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={selectedInCategory === totalInCategory && totalInCategory > 0}
                                  onChange={() => handleSelectAllInCategory(categoryProducts)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                              </div>
                            </div>

                            {/* Products in Category */}
                            {isCategoryExpanded && (
                              <div className="p-0">
                                {renderProductTable(categoryProducts)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedProducts.size > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-sm text-blue-800">
              {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
            </p>
            <button
              onClick={handleSavePricing}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm whitespace-nowrap cursor-pointer"
            >
              <i className="ri-save-line w-4 h-4 flex items-center justify-center mr-2"></i>
              Save Selected
            </button>
          </div>
        </div>
      )}

      {openDropdown && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setOpenDropdown(null)}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <i className="ri-delete-bin-line text-red-600 w-5 h-5 flex items-center justify-center"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Delete Product</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}