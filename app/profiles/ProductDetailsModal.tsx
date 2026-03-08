
'use client';

interface ProductDetailsModalProps {
  product: any;
  onClose: () => void;
  onEdit: () => void;
}

export default function ProductDetailsModal({ product, onClose, onEdit }: ProductDetailsModalProps) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <i className="ri-close-line w-6 h-6 flex items-center justify-center"></i>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name
            </label>
            <div className="p-3 bg-gray-50 rounded-md border">
              <p className="text-gray-900 font-medium">{product.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price
              </label>
              <div className="p-3 bg-gray-50 rounded-md border">
                <p className="text-green-600 font-semibold">${product.price}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount
              </label>
              <div className="p-3 bg-gray-50 rounded-md border">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  {product.discount}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Surcharge/Fee
              </label>
              <div className="p-3 bg-gray-50 rounded-md border">
                <p className="text-blue-600 font-semibold">${product.surcharge || '0.00'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <div className="p-3 bg-gray-50 rounded-md border">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  {product.currency || 'USD'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="p-3 bg-gray-50 rounded-md border">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {product.category}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="p-3 bg-gray-50 rounded-md border min-h-[80px]">
              <p className="text-gray-900">
                {product.description || 'No description provided'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supplier Details
            </label>
            <div className="p-3 bg-gray-50 rounded-md border space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Country</p>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {product.supplierCountry || 'US'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Supplier</p>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                    {product.supplier || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Station</p>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    {product.station || 'Main Station'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Station Group</p>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                    {product.stationGroup || 'Group A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product ID
              </label>
              <div className="p-3 bg-gray-50 rounded-md border">
                <p className="text-gray-600 font-mono text-sm">#{product.id}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile ID
              </label>
              <div className="p-3 bg-gray-50 rounded-md border">
                <p className="text-gray-600 font-mono text-sm">#{product.profileId}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center whitespace-nowrap cursor-pointer"
          >
            <i className="ri-edit-line w-4 h-4 flex items-center justify-center mr-2"></i>
            Edit Product
          </button>
        </div>
      </div>
    </div>
  );
}
