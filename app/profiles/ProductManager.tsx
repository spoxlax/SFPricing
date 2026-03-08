
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductList from './ProductList';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import ProductDetailsModal from './ProductDetailsModal';

interface ProductManagerProps {
  selectedProfiles: any[];
  viewMode: string;
}

export default function ProductManager({ selectedProfiles, viewMode }: ProductManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [cloningProduct, setCloningProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProfileForAdd, setSelectedProfileForAdd] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const router = useRouter();

  const mockProductsByProfile = {
    1: [
      { id: 1, name: 'Premium Diesel', price: 1.42, category: 'Diesel fuels', discount: 12, surcharge: 0.05, profileId: 1, description: 'Premium diesel fuel for commercial and personal vehicles', supplier: 'Shell', supplierCountry: 'US', station: 'Highway Station', stationGroup: 'Premium', priceModel: 'List', currency: 'USD' },
      { id: 2, name: 'Eco Diesel', price: 1.38, category: 'Diesel fuels', discount: 15, surcharge: 0.03, profileId: 1, description: 'Environmentally friendly diesel with low emissions', supplier: 'BP', supplierCountry: 'UK', station: 'City Center', stationGroup: 'Standard', priceModel: 'Pump', currency: 'GBP' },
      { id: 3, name: 'Ultra Diesel', price: 1.45, category: 'Diesel fuels', discount: 10, surcharge: 0.06, profileId: 1, description: 'High-performance diesel for heavy-duty vehicles', supplier: 'Total', supplierCountry: 'FR', station: 'Industrial Zone', stationGroup: 'Premium', priceModel: 'List', currency: 'EUR' },
      { id: 4, name: 'Standard Diesel', price: 1.35, category: 'Diesel fuels', discount: 18, surcharge: 0.02, profileId: 1, description: 'Regular diesel fuel for everyday use', supplier: 'Esso', supplierCountry: 'CA', station: 'Main Station', stationGroup: 'Standard', priceModel: 'Percentage', currency: 'CAD' },
      { id: 5, name: 'Winter Diesel', price: 1.48, category: 'Diesel fuels', discount: 8, surcharge: 0.07, profileId: 1, description: 'Cold weather diesel with anti-gel additives', supplier: 'Chevron', supplierCountry: 'US', station: 'Highway Station', stationGroup: 'Premium', priceModel: 'List', currency: 'USD' },
      { id: 6, name: 'Bio Diesel B20', price: 1.52, category: 'Diesel fuels', discount: 20, surcharge: 0.08, profileId: 1, description: 'Biodiesel blend with 20% renewable content', supplier: 'Mobil', supplierCountry: 'US', station: 'Airport Station', stationGroup: 'Express', priceModel: 'Pump', currency: 'USD' },
      { id: 7, name: 'Marine Diesel', price: 1.58, category: 'Diesel fuels', discount: 5, surcharge: 0.10, profileId: 1, description: 'Specialized diesel for marine applications', supplier: 'Texaco', supplierCountry: 'US', station: 'Shopping Mall', stationGroup: 'Group A', priceModel: 'List', currency: 'USD' },
      { id: 8, name: 'Agricultural Diesel', price: 1.32, category: 'Diesel fuels', discount: 22, surcharge: 0.04, profileId: 1, description: 'Tax-exempt diesel for agricultural use', supplier: 'Petro-Canada', supplierCountry: 'CA', station: 'Industrial Zone', stationGroup: 'Group B', priceModel: 'Percentage', currency: 'CAD' },
      { id: 9, name: 'Off-Road Diesel', price: 1.28, category: 'Diesel fuels', discount: 25, surcharge: 0.03, profileId: 1, description: 'Dyed diesel for off-road vehicles only', supplier: 'Sunoco', supplierCountry: 'US', station: 'Industrial Zone', stationGroup: 'Group C', priceModel: 'List', currency: 'USD' },
      { id: 10, name: 'Premium Unleaded', price: 1.38, category: 'Caburetor fuels', discount: 8, surcharge: 0.03, profileId: 1, description: 'High-octane carburetor fuel for classic and vintage vehicles', supplier: 'BP', supplierCountry: 'UK', station: 'City Center', stationGroup: 'Standard', priceModel: 'Pump', currency: 'GBP' },
      { id: 11, name: 'Racing Fuel 100', price: 2.15, category: 'Caburetor fuels', discount: 5, surcharge: 0.15, profileId: 1, description: '100 octane racing fuel for high-performance engines', supplier: 'Shell', supplierCountry: 'US', station: 'Highway Station', stationGroup: 'Premium', priceModel: 'List', currency: 'USD' },
      { id: 12, name: 'Classic Car Fuel', price: 1.65, category: 'Caburetor fuels', discount: 12, surcharge: 0.08, profileId: 1, description: 'Ethanol-free gasoline for vintage automobiles', supplier: 'Total', supplierCountry: 'FR', station: 'City Center', stationGroup: 'Express', priceModel: 'Pump', currency: 'EUR' },
      { id: 13, name: 'Aviation Gas 100LL', price: 4.25, category: 'Caburetor fuels', discount: 3, surcharge: 0.25, profileId: 1, description: 'Low-lead aviation gasoline for aircraft engines', supplier: 'Esso', supplierCountry: 'CA', station: 'Airport Station', stationGroup: 'Premium', priceModel: 'List', currency: 'CAD' },
      { id: 14, name: 'Motorcycle Fuel', price: 1.45, category: 'Caburetor fuels', discount: 10, surcharge: 0.05, profileId: 1, description: 'High-performance fuel for motorcycles and ATVs', supplier: 'Chevron', supplierCountry: 'US', station: 'Highway Station', stationGroup: 'Standard', priceModel: 'Percentage', currency: 'USD' },
      { id: 15, name: 'Small Engine Fuel', price: 1.58, category: 'Caburetor fuels', discount: 15, surcharge: 0.06, profileId: 1, description: 'Fuel for lawnmowers, chainsaws, and small engines', supplier: 'Mobil', supplierCountry: 'US', station: 'Shopping Mall', stationGroup: 'Group A', priceModel: 'List', currency: 'USD' },
      { id: 16, name: 'Marine Gasoline', price: 1.68, category: 'Caburetor fuels', discount: 7, surcharge: 0.09, profileId: 1, description: 'Ethanol-free gasoline for marine engines', supplier: 'Texaco', supplierCountry: 'US', station: 'Main Station', stationGroup: 'Group B', priceModel: 'Pump', currency: 'USD' },
      { id: 17, name: 'Premium Plus 93', price: 1.52, category: 'Caburetor fuels', discount: 9, surcharge: 0.04, profileId: 1, description: '93 octane premium gasoline for high-performance cars', supplier: 'Petro-Canada', supplierCountry: 'CA', station: 'City Center', stationGroup: 'Premium', priceModel: 'List', currency: 'CAD' },
      { id: 18, name: 'Ethanol-Free Gas', price: 1.75, category: 'Caburetor fuels', discount: 6, surcharge: 0.12, profileId: 1, description: 'Pure gasoline without ethanol additives', supplier: 'Valero', supplierCountry: 'US', station: 'Industrial Zone', stationGroup: 'Express', priceModel: 'Percentage', currency: 'USD' },
      { id: 19, name: 'Regular Unleaded', price: 1.35, category: 'Gas fuels', discount: 15, surcharge: 0.04, profileId: 1, description: 'Regular unleaded gasoline for everyday driving', supplier: 'Esso', supplierCountry: 'CA', station: 'Main Station', stationGroup: 'Express', priceModel: 'Percentage', currency: 'CAD' },
      { id: 20, name: 'Mid-Grade 89', price: 1.42, category: 'Gas fuels', discount: 12, surcharge: 0.05, profileId: 1, description: '89 octane mid-grade gasoline for better performance', supplier: 'Shell', supplierCountry: 'US', station: 'Highway Station', stationGroup: 'Standard', priceModel: 'List', currency: 'USD' },
      { id: 21, name: 'E85 Ethanol Blend', price: 1.18, category: 'Gas fuels', discount: 20, surcharge: 0.02, profileId: 1, description: '85% ethanol fuel for flex-fuel vehicles', supplier: 'BP', supplierCountry: 'UK', station: 'City Center', stationGroup: 'Group A', priceModel: 'Pump', currency: 'GBP' },
      { id: 22, name: 'Premium 91 Octane', price: 1.48, category: 'Gas fuels', discount: 10, surcharge: 0.06, profileId: 1, description: '91 octane premium gasoline for luxury vehicles', supplier: 'Total', supplierCountry: 'FR', station: 'Shopping Mall', stationGroup: 'Premium', priceModel: 'List', currency: 'EUR' },
      { id: 23, name: 'Top Tier Gasoline', price: 1.39, category: 'Gas fuels', discount: 14, surcharge: 0.04, profileId: 1, description: 'Top Tier certified gasoline with engine cleaning additives', supplier: 'Chevron', supplierCountry: 'US', station: 'Airport Station', stationGroup: 'Express', priceModel: 'Percentage', currency: 'USD' },
      { id: 24, name: 'Winter Blend Gas', price: 1.32, category: 'Gas fuels', discount: 16, surcharge: 0.03, profileId: 1, description: 'Winter-formulated gasoline for cold weather performance', supplier: 'Mobil', supplierCountry: 'US', station: 'Highway Station', stationGroup: 'Standard', priceModel: 'List', currency: 'USD' },
      { id: 25, name: 'Summer Blend Gas', price: 1.37, category: 'Gas fuels', discount: 13, surcharge: 0.05, profileId: 1, description: 'Summer-formulated gasoline to reduce emissions', supplier: 'Texaco', supplierCountry: 'US', station: 'Main Station', stationGroup: 'Group B', priceModel: 'Pump', currency: 'USD' },
      { id: 26, name: 'Reformulated Gas', price: 1.41, category: 'Gas fuels', discount: 11, surcharge: 0.04, profileId: 1, description: 'Reformulated gasoline for clean air compliance', supplier: 'Petro-Canada', supplierCountry: 'CA', station: 'City Center', stationGroup: 'Group C', priceModel: 'List', currency: 'CAD' },
      { id: 27, name: 'Oxygenated Fuel', price: 1.36, category: 'Gas fuels', discount: 17, surcharge: 0.03, profileId: 1, description: 'Oxygenated gasoline for high-altitude areas', supplier: 'Sunoco', supplierCountry: 'US', station: 'Industrial Zone', stationGroup: 'Premium', priceModel: 'Percentage', currency: 'USD' },
      { id: 28, name: 'AdBlue Standard', price: 0.89, category: 'Adblue', discount: 18, surcharge: 0.02, profileId: 1, description: 'Diesel exhaust fluid for SCR systems compliance', supplier: 'Total', supplierCountry: 'FR', station: 'Industrial Zone', stationGroup: 'Group A', priceModel: 'List', currency: 'EUR' },
      { id: 29, name: 'AdBlue Premium', price: 0.95, category: 'Adblue', discount: 15, surcharge: 0.03, profileId: 1, description: 'High-quality AdBlue with extended shelf life', supplier: 'Shell', supplierCountry: 'DE', station: 'Highway Station', stationGroup: 'Premium', priceModel: 'Pump', currency: 'EUR' },
      { id: 30, name: 'AdBlue Bulk', price: 0.82, category: 'Adblue', discount: 22, surcharge: 0.01, profileId: 1, description: 'Bulk AdBlue for fleet and commercial applications', supplier: 'BP', supplierCountry: 'NL', station: 'Industrial Zone', stationGroup: 'Group B', priceModel: 'List', currency: 'EUR' },
      { id: 31, name: 'AdBlue Portable', price: 1.15, category: 'Adblue', discount: 10, surcharge: 0.05, profileId: 1, description: 'Convenient portable AdBlue containers', supplier: 'Esso', supplierCountry: 'IT', station: 'Main Station', stationGroup: 'Express', priceModel: 'Percentage', currency: 'EUR' },
      { id: 32, name: 'AdBlue Winter Grade', price: 0.92, category: 'Adblue', discount: 20, surcharge: 0.04, profileId: 1, description: 'Cold-weather AdBlue formulation', supplier: 'Chevron', supplierCountry: 'CA', station: 'City Center', stationGroup: 'Standard', priceModel: 'List', currency: 'CAD' },
      { id: 33, name: 'AdBlue ISO Certified', price: 0.98, category: 'Adblue', discount: 17, surcharge: 0.03, profileId: 1, description: 'ISO 22241 certified AdBlue for guaranteed quality', supplier: 'Mobil', supplierCountry: 'US', station: 'Airport Station', stationGroup: 'Premium', priceModel: 'Pump', currency: 'USD' },
      { id: 34, name: 'AdBlue Truck Stop', price: 0.85, category: 'Adblue', discount: 25, surcharge: 0.02, profileId: 1, description: 'AdBlue specifically for truck stops and rest areas', supplier: 'Texaco', supplierCountry: 'ES', station: 'Highway Station', stationGroup: 'Group A', priceModel: 'List', currency: 'EUR' },
      { id: 35, name: 'AdBlue Marine', price: 1.05, category: 'Adblue', discount: 12, surcharge: 0.06, profileId: 1, description: 'Marine-grade AdBlue for shipping applications', supplier: 'Petro-Canada', supplierCountry: 'CA', station: 'Shopping Mall', stationGroup: 'Group C', priceModel: 'Percentage', currency: 'CAD' },
      { id: 36, name: 'AdBlue Express', price: 1.08, category: 'Adblue', discount: 8, surcharge: 0.07, profileId: 1, description: 'Fast-dispensing AdBlue for quick service', supplier: 'Valero', supplierCountry: 'US', station: 'Industrial Zone', stationGroup: 'Express', priceModel: 'List', currency: 'USD' },
      { id: 37, name: 'Basic Car Wash', price: 24.99, category: 'Vehicle cleaning', discount: 20, surcharge: 2.50, profileId: 1, description: 'Complete exterior and interior vehicle cleaning service', supplier: 'Texaco', supplierCountry: 'US', station: 'Shopping Mall', stationGroup: 'Group B', priceModel: 'Pump', currency: 'USD' },
      { id: 38, name: 'Floor Mats', price: 156.80, category: 'Vehicle accessories', discount: 25, surcharge: 8.00, profileId: 1, description: 'Automotive parts, tools, and accessories for maintenance', supplier: 'Chevron', supplierCountry: 'US', station: 'Airport Station', stationGroup: 'Premium', priceModel: 'List', currency: 'USD' },
      { id: 39, name: 'Synthetic Oil 5W-30', price: 28.75, category: 'Moto oil', discount: 22, surcharge: 1.50, profileId: 1, description: 'Full synthetic motor oil for optimal engine protection', supplier: 'Mobil', supplierCountry: 'US', station: 'Highway Station', stationGroup: 'Standard', priceModel: 'Percentage', currency: 'USD' },
      { id: 40, name: 'Emergency Repair', price: 189.00, category: 'Repair/breakdown', discount: 10, surcharge: 25.00, profileId: 1, description: '24/7 roadside assistance and emergency repair services', supplier: 'Petro-Canada', supplierCountry: 'CA', station: 'Main Station', stationGroup: 'Express', priceModel: 'List', currency: 'CAD' },
      { id: 41, name: 'Downtown Parking', price: 4.50, category: 'Parking fee', discount: 5, surcharge: 0.25, profileId: 1, description: 'Hourly parking at partner locations and city centers', supplier: 'Sunoco', supplierCountry: 'US', station: 'City Center', stationGroup: 'Group C', priceModel: 'Pump', currency: 'USD' },
      { id: 42, name: 'Tire Installation', price: 89.95, category: 'Tyre service', discount: 30, surcharge: 5.00, profileId: 1, description: 'Tire installation, balancing, rotation, and alignment services', supplier: 'Valero', supplierCountry: 'US', station: 'Industrial Zone', stationGroup: 'Premium', priceModel: 'List', currency: 'USD' },
      { id: 43, name: 'Compact Car Rental', price: 67.50, category: 'Vehicle rental', discount: 12, surcharge: 15.00, profileId: 1, description: 'Daily vehicle rental for business and personal use', supplier: 'Shell', supplierCountry: 'NL', station: 'Airport Station', stationGroup: 'Group A', priceModel: 'Percentage', currency: 'EUR' },
      { id: 44, name: 'Oil Change Service', price: 134.00, category: 'Vehicle services', discount: 18, surcharge: 12.00, profileId: 1, description: 'Comprehensive maintenance including oil change and inspection', supplier: 'BP', supplierCountry: 'UK', station: 'Shopping Mall', stationGroup: 'Standard', priceModel: 'Pump', currency: 'GBP' },
      { id: 45, name: 'Engine Diagnostics', price: 225.00, category: 'Workshop services', discount: 28, surcharge: 18.00, profileId: 1, description: 'Professional automotive repair and maintenance services', supplier: 'Esso', supplierCountry: 'DE', station: 'Highway Station', stationGroup: 'Premium', priceModel: 'List', currency: 'EUR' }
    ],
    2: [
      { id: 46, name: 'Premium Diesel Plus', price: 1.48, category: 'Diesel fuels', discount: 15, surcharge: 0.06, profileId: 2, description: 'Premium diesel fuel with advanced cleaning additives', supplier: 'Total', supplierCountry: 'FR', station: 'Main Station', stationGroup: 'Premium', priceModel: 'Percentage', currency: 'EUR' },
      { id: 47, name: 'Super Diesel', price: 1.52, category: 'Diesel fuels', discount: 12, surcharge: 0.07, profileId: 2, description: 'High-performance diesel with enhanced additives', supplier: 'Shell', supplierCountry: 'DE', station: 'Highway Station', stationGroup: 'Premium', priceModel: 'List', currency: 'EUR' },
      { id: 48, name: 'Turbo Diesel', price: 1.55, category: 'Diesel fuels', discount: 10, surcharge: 0.08, profileId: 2, description: 'Diesel optimized for turbocharged engines', supplier: 'BP', supplierCountry: 'UK', station: 'City Center', stationGroup: 'Express', priceModel: 'Pump', currency: 'GBP' },
      { id: 49, name: 'Commercial Diesel', price: 1.45, category: 'Diesel fuels', discount: 18, surcharge: 0.05, profileId: 2, description: 'Cost-effective diesel for commercial fleets', supplier: 'Esso', supplierCountry: 'NL', station: 'Industrial Zone', stationGroup: 'Standard', priceModel: 'List', currency: 'EUR' },
      { id: 50, name: 'Bio Diesel B30', price: 1.58, category: 'Diesel fuels', discount: 20, surcharge: 0.09, profileId: 2, description: 'Biodiesel blend with 30% renewable content', supplier: 'Chevron', supplierCountry: 'US', station: 'Airport Station', stationGroup: 'Group A', priceModel: 'Percentage', currency: 'USD' },
      { id: 51, name: 'Arctic Diesel', price: 1.62, category: 'Diesel fuels', discount: 8, surcharge: 0.10, profileId: 2, description: 'Extreme cold weather diesel formulation', supplier: 'Mobil', supplierCountry: 'CA', station: 'Main Station', stationGroup: 'Premium', priceModel: 'List', currency: 'CAD' },
      { id: 52, name: 'Low Sulfur Diesel', price: 1.49, category: 'Diesel fuels', discount: 16, surcharge: 0.06, profileId: 2, description: 'Ultra-low sulfur diesel for emissions compliance', supplier: 'Texaco', supplierCountry: 'US', station: 'Shopping Mall', stationGroup: 'Group B', priceModel: 'Pump', currency: 'USD' },
      { id: 53, name: 'Fleet Diesel', price: 1.43, category: 'Diesel fuels', discount: 22, surcharge: 0.04, profileId: 2, description: 'Bulk diesel pricing for fleet customers', supplier: 'Petro-Canada', supplierCountry: 'CA', station: 'Highway Station', stationGroup: 'Express', priceModel: 'List', currency: 'CAD' },
      { id: 54, name: 'Power Diesel', price: 1.51, category: 'Diesel fuels', discount: 14, surcharge: 0.07, profileId: 2, description: 'High-power diesel for heavy machinery', supplier: 'Sunoco', supplierCountry: 'US', station: 'Industrial Zone', stationGroup: 'Group C', priceModel: 'Percentage', currency: 'USD' },
      { id: 55, name: 'Super Premium 94', price: 1.44, category: 'Caburetor fuels', discount: 12, surcharge: 0.04, profileId: 2, description: 'High-performance carburetor fuel for racing and sports cars', supplier: 'Texaco', supplierCountry: 'US', station: 'City Center', stationGroup: 'Express', priceModel: 'List', currency: 'USD' },
      { id: 56, name: 'Race Fuel 110', price: 2.85, category: 'Caburetor fuels', discount: 5, surcharge: 0.20, profileId: 2, description: '110 octane race fuel for professional racing', supplier: 'Shell', supplierCountry: 'US', station: 'Highway Station', stationGroup: 'Premium', priceModel: 'Pump', currency: 'USD' },
      { id: 57, name: 'Vintage Car Gas', price: 1.89, category: 'Caburetor fuels', discount: 8, surcharge: 0.12, profileId: 2, description: 'Lead-substitute gasoline for vintage vehicles', supplier: 'BP', supplierCountry: 'UK', station: 'Main Station', stationGroup: 'Standard', priceModel: 'List', currency: 'GBP' },
      { id: 58, name: 'Aviation Gas 100UL', price: 4.75, category: 'Caburetor fuels', discount: 3, surcharge: 0.30, profileId: 2, description: 'Unleaded aviation gasoline for modern aircraft', supplier: 'Total', supplierCountry: 'FR', station: 'Airport Station', stationGroup: 'Premium', priceModel: 'Percentage', currency: 'EUR' },
      { id: 59, name: 'High Octane Moto', price: 1.68, category: 'Caburetor fuels', discount: 10, surcharge: 0.08, profileId: 2, description: 'Premium fuel for high-performance motorcycles', supplier: 'Esso', supplierCountry: 'IT', station: 'City Center', stationGroup: 'Express', priceModel: 'List', currency: 'EUR' },
      { id: 60, name: 'Marine Premium', price: 1.95, category: 'Caburetor fuels', discount: 6, surcharge: 0.15, profileId: 2, description: 'Premium marine gasoline with stabilizers', supplier: 'Chevron', supplierCountry: 'US', station: 'Shopping Mall', stationGroup: 'Group A', priceModel: 'Pump', currency: 'USD' },
      { id: 61, name: 'Small Engine Premium', price: 1.78, category: 'Caburetor fuels', discount: 12, surcharge: 0.09, profileId: 2, description: 'Premium fuel for professional landscaping equipment', supplier: 'Mobil', supplierCountry: 'US', station: 'Industrial Zone', stationGroup: 'Group B', priceModel: 'List', currency: 'USD' },
      { id: 62, name: 'Track Day Fuel', price: 2.25, category: 'Caburetor fuels', discount: 4, surcharge: 0.18, profileId: 2, description: 'High-octane fuel for track day events', supplier: 'Texaco', supplierCountry: 'US', station: 'Highway Station', stationGroup: 'Premium', priceModel: 'Percentage', currency: 'USD' },
      { id: 63, name: 'Ethanol-Free Premium', price: 1.89, category: 'Caburetor fuels', discount: 7, surcharge: 0.14, profileId: 2, description: 'Premium ethanol-free gasoline', supplier: 'Petro-Canada', supplierCountry: 'CA', station: 'Main Station', stationGroup: 'Standard', priceModel: 'List', currency: 'CAD' },
      { id: 64, name: 'Super Unleaded Plus', price: 1.41, category: 'Gas fuels', discount: 18, surcharge: 0.05, profileId: 2, description: 'Premium unleaded gasoline with enhanced fuel economy', supplier: 'Chevron', supplierCountry: 'US', station: 'Highway Station', stationGroup: 'Standard', priceModel: 'Pump', currency: 'USD' },
      { id: 65, name: 'Premium 93 Plus', price: 1.55, category: 'Gas fuels', discount: 10, surcharge: 0.08, profileId: 2, description: '93 octane premium with performance additives', supplier: 'Shell', supplierCountry: 'US', station: 'City Center', stationGroup: 'Premium', priceModel: 'List', currency: 'USD' },
      { id: 66, name: 'E15 Blend', price: 1.32, category: 'Gas fuels', discount: 22, surcharge: 0.03, profileId: 2, description: '15% ethanol blend for newer vehicles', supplier: 'BP', supplierCountry: 'UK', station: 'Main Station', stationGroup: 'Express', priceModel: 'Percentage', currency: 'GBP' },
      { id: 67, name: 'Top Tier Premium', price: 1.52, category: 'Gas fuels', discount: 12, surcharge: 0.07, profileId: 2, description: 'Top Tier premium gasoline with detergent additives', supplier: 'Total', supplierCountry: 'FR', station: 'Airport Station', stationGroup: 'Premium', priceModel: 'List', currency: 'EUR' },
      { id: 68, name: 'Performance Plus', price: 1.48, category: 'Gas fuels', discount: 15, surcharge: 0.06, profileId: 2, description: 'Performance-enhanced gasoline for sports cars', supplier: 'Esso', supplierCountry: 'DE', station: 'Shopping Mall', stationGroup: 'Group A', priceModel: 'Pump', currency: 'EUR' },
      { id: 69, name: 'Flex Fuel E85 Plus', price: 1.25, category: 'Gas fuels', discount: 25, surcharge: 0.02, profileId: 2, description: 'Enhanced E85 blend with performance additives', supplier: 'Chevron', supplierCountry: 'US', station: 'Industrial Zone', stationGroup: 'Standard', priceModel: 'List', currency: 'USD' },
      { id: 70, name: 'Ultra Clean Gas', price: 1.45, category: 'Gas fuels', discount: 16, surcharge: 0.05, profileId: 2, description: 'Ultra-clean gasoline for environmental compliance', supplier: 'Mobil', supplierCountry: 'CA', station: 'Highway Station', stationGroup: 'Group B', priceModel: 'Percentage', currency: 'CAD' },
      { id: 71, name: 'High Altitude Gas', price: 1.39, category: 'Gas fuels', discount: 19, surcharge: 0.04, profileId: 2, description: 'Oxygenated gasoline for high-altitude performance', supplier: 'Texaco', supplierCountry: 'US', station: 'Main Station', stationGroup: 'Express', priceModel: 'List', currency: 'USD' },
      { id: 72, name: 'Winter Premium', price: 1.42, category: 'Gas fuels', discount: 17, surcharge: 0.05, profileId: 2, description: 'Winter-formulated premium gasoline', supplier: 'Petro-Canada', supplierCountry: 'CA', station: 'City Center', stationGroup: 'Group C', priceModel: 'Pump', currency: 'CAD' },
      { id: 73, name: 'AdBlue Pro', price: 0.95, category: 'Adblue', discount: 20, surcharge: 0.03, profileId: 2, description: 'Premium quality AdBlue for modern diesel engines', supplier: 'Mobil', supplierCountry: 'US', station: 'Industrial Zone', stationGroup: 'Group A', priceModel: 'List', currency: 'USD' },
      { id: 74, name: 'Premium Detail Wash', price: 39.99, category: 'Vehicle cleaning', discount: 25, surcharge: 4.00, profileId: 2, description: 'Premium detailing service with protective wax coating', supplier: 'Petro-Canada', supplierCountry: 'CA', station: 'Shopping Mall', stationGroup: 'Group B', priceModel: 'Percentage', currency: 'CAD' },
      { id: 75, name: 'Performance Parts', price: 298.50, category: 'Vehicle accessories', discount: 30, surcharge: 15.00, profileId: 2, description: 'Premium automotive accessories and performance parts', supplier: 'Sunoco', supplierCountry: 'US', station: 'Airport Station', stationGroup: 'Premium', priceModel: 'Pump', currency: 'USD' },
      { id: 76, name: 'Full Synthetic 0W-20', price: 45.99, category: 'Moto oil', discount: 25, surcharge: 2.50, profileId: 2, description: 'Premium synthetic motor oil for high-performance engines', supplier: 'Valero', supplierCountry: 'US', station: 'Main Station', stationGroup: 'Standard', priceModel: 'List', currency: 'USD' },
      { id: 77, name: 'Priority Roadside', price: 275.00, category: 'Repair/breakdown', discount: 15, surcharge: 35.00, profileId: 2, description: 'Priority roadside assistance with guaranteed response time', supplier: 'Shell', supplierCountry: 'NL', station: 'City Center', stationGroup: 'Express', priceModel: 'Percentage', currency: 'EUR' },
      { id: 78, name: 'VIP Parking', price: 6.75, category: 'Parking fee', discount: 8, surcharge: 0.50, profileId: 2, description: 'Premium parking spaces in downtown and business districts', supplier: 'BP', supplierCountry: 'UK', station: 'Highway Station', stationGroup: 'Group C', priceModel: 'List', currency: 'GBP' },
      { id: 79, name: 'Premium Tire Service', price: 125.99, category: 'Tyre service', discount: 35, surcharge: 8.00, profileId: 2, description: 'Complete tire services including premium brand installation', supplier: 'Esso', supplierCountry: 'IT', station: 'Industrial Zone', stationGroup: 'Premium', priceModel: 'Pump', currency: 'EUR' },
      { id: 80, name: 'Luxury Car Rental', price: 89.99, category: 'Vehicle rental', discount: 16, surcharge: 22.00, profileId: 2, description: 'Premium vehicle rental with luxury and electric options', supplier: 'Total', supplierCountry: 'FR', station: 'Shopping Mall', stationGroup: 'Group A', priceModel: 'List', currency: 'EUR' },
      { id: 81, name: 'Complete Service', price: 189.50, category: 'Vehicle services', discount: 22, surcharge: 18.00, profileId: 2, description: 'Comprehensive maintenance with genuine parts and warranty', supplier: 'Texaco', supplierCountry: 'ES', station: 'Airport Station', stationGroup: 'Standard', priceModel: 'Percentage', currency: 'EUR' },
      { id: 82, name: 'Expert Workshop', price: 345.00, category: 'Workshop services', discount: 32, surcharge: 28.00, profileId: 2, description: 'Expert workshop services with certified technicians', supplier: 'Chevron', supplierCountry: 'US', station: 'Main Station', stationGroup: 'Express', priceModel: 'Pump', currency: 'USD' }
    ]
  };

  useEffect(() => {
    if (selectedProfiles.length > 0) {
      const allProducts = selectedProfiles.flatMap(profile =>
        mockProductsByProfile[profile.id] || []
      );
      setProducts(allProducts);
    } else {
      setProducts([]);
    }
  }, [selectedProfiles]);

  const handleAddProduct = (newProduct) => {
    const product = {
      ...newProduct,
      id: Date.now(),
      profileId: selectedProfileForAdd.id
    };
    setProducts([...products, product]);
    setShowAddModal(false);
    setSelectedProfileForAdd(null);
  };

  const handleEditProduct = (updatedProduct) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setEditingProduct(null);
  };

  const handleCloneProduct = (productToClone) => {
    setCloningProduct({
      ...productToClone,
      name: productToClone.name + ' (Copy)'
    });
  };

  const handleSaveClonedProduct = (clonedProduct) => {
    const product = {
      ...clonedProduct,
      id: Date.now(),
      profileId: clonedProduct.profileId
    };
    setProducts([...products, product]);
    setCloningProduct(null);
  };

  const handleDeleteProduct = (productId) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  const handleViewProduct = (product) => {
    setViewingProduct(product);
  };

  const handleEditFromDetails = () => {
    setEditingProduct(viewingProduct);
    setViewingProduct(null);
  };

  const handleAddProductClick = (profile) => {
    setSelectedProfileForAdd(profile);
    setShowAddModal(true);
  };

  const handleSavePricing = () => {
    // Save selected products to localStorage for the summary page
    localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
    localStorage.setItem('selectedProfiles', JSON.stringify(selectedProfiles));
    localStorage.setItem('savingTimestamp', new Date().toISOString());

    // Navigate to summary page
    router.push('/summary');
  };

  if (selectedProfiles.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-12 text-center h-fit">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
          <i className="ri-box-3-line text-gray-400 w-8 h-8 flex items-center justify-center"></i>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select Profiles</h3>
        <p className="text-gray-600">
          Choose one or more profiles from the left to view their products
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Multiple Profiles View</h2>
            <p className="text-gray-600 mb-4">
              Viewing products from {selectedProfiles.length} profiles
            </p>

            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
              <span className="flex items-center">
                <i className="ri-box-3-line w-4 h-4 flex items-center justify-center mr-1"></i>
                {products.length} total products
              </span>
              <span className="flex items-center">
                <i className="ri-group-line w-4 h-4 flex items-center justify-center mr-1"></i>
                {selectedProfiles.length} profiles
              </span>
            </div>

            {/* Selected Profiles Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Selected Profiles</h3>
              <div className="grid gap-4">
                {selectedProfiles.map(profile => (
                  <div key={profile.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-start space-x-3">
                      <div className={`w-4 h-4 rounded-full ${profile.color} mt-1 flex-shrink-0`}></div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{profile.name}</h4>
                        <p className="text-sm text-gray-600">{profile.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductList
        products={products}
        onEditProduct={setEditingProduct}
        onDeleteProduct={handleDeleteProduct}
        onViewProduct={handleViewProduct}
        onCloneProduct={handleCloneProduct}
        groupByProfile={true}
        profiles={selectedProfiles}
        onAddProduct={handleAddProductClick}
        selectedProducts={selectedProducts}
        onProductSelect={setSelectedProducts}
      />

      {showAddModal && selectedProfileForAdd && (
        <AddProductModal
          onSave={handleAddProduct}
          onClose={() => {
            setShowAddModal(false);
            setSelectedProfileForAdd(null);
          }}
          profileName={selectedProfileForAdd.name}
        />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onSave={handleEditProduct}
          onClose={() => setEditingProduct(null)}
          profileName={selectedProfiles.find(p => p.id === editingProduct.profileId)?.name}
        />
      )}

      {cloningProduct && (
        <EditProductModal
          product={cloningProduct}
          onSave={handleSaveClonedProduct}
          onClose={() => setCloningProduct(null)}
          profileName={selectedProfiles.find(p => p.id === cloningProduct.profileId)?.name}
        />
      )}

      {viewingProduct && (
        <ProductDetailsModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
          onEdit={handleEditFromDetails}
        />
      )}
    </div>
  );
}
