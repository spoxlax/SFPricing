import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getProfiles from '@salesforce/apex/PricingManagerController.getProfiles';
import getProductsByProfileIds from '@salesforce/apex/PricingManagerController.getProductsByProfileIds';
import savePricingSummary from '@salesforce/apex/PricingManagerController.savePricingSummary';

export default class PricingManager extends LightningElement {
    @track profiles = [];
    @track products = [];
    @track selectedProfileIds = [];
    @track selectedProductIds = [];
    @track searchTerm = '';
    @track profileSearchTerm = '';
    @track sortBy = 'name';
    @track filterCategory = 'all';
    @track showSummary = false;
    @track summaryData = null;
    @track activeTab = 'all';

    // Expansion State
    @track expandedProfileIds = new Set();
    @track expandedCategoryKeys = new Set();

    // Modal state
    @track showFormModal = false;
    @track showDetailsModal = false; // Note: showProductDetailsModal used in template
    @track showProductDetailsModal = false;
    @track showDeleteModal = false;
    @track modalMode = 'add'; // 'add' or 'edit'
    @track pendingDeleteProduct = null;
    @track viewingProduct = null;
    @track activeProduct = null;
    @track formData = this.getEmptyFormData();
    @track formErrors = {};

    // Inline editing state
    @track editingCell = null;
    @track editValue = '';
    @track activeActionProductId = null;

    @wire(getProfiles)
    wiredProfiles({ data, error }) {
        if (data) {
            this.profiles = data;
        } else if (error) {
            this.showError(error);
        }
    }

    // View Getters
    get isProfileView() {
        return !this.hasProfilesSelected && !this.showSummary;
    }

    get isProductView() {
        return this.hasProfilesSelected && !this.showSummary;
    }

    get isSummaryView() {
        return this.showSummary;
    }

    // Profile Getters
    get visibleProfiles() {
        const term = this.profileSearchTerm.toLowerCase();
        return this.profiles
            .filter((profile) => !term || profile.name.toLowerCase().includes(term) || profile.description.toLowerCase().includes(term))
            .map((profile) => {
                const isSelected = this.selectedProfileIds.includes(profile.id);

                // Mock tags for UI parity
                const tags = profile.id === 1
                    ? [
                        { label: 'Generic bundle', class: 'badge-purple' },
                        { label: 'Valid to: 31/12/2026', class: 'badge-yellow' }
                    ]
                    : [
                        { label: 'Framework', class: 'badge-purple' },
                        { label: 'Valid to: 31/12/2026', class: 'badge-yellow' }
                    ];

                return {
                    ...profile,
                    isSelected,
                    tags,
                    containerClass: `profile-card p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border-2 ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-gray-200'
                        }`,
                    dotStyle: `background-color: ${profile.color === 'success' ? '#10B981' : profile.color === 'brand' ? '#3B82F6' : '#6B7280'};`
                };
            });
    }

    get hasProfilesSelected() {
        return this.selectedProfileIds.length > 0;
    }

    get selectedProfileCount() {
        return this.selectedProfileIds.length;
    }

    // Product Getters
    get hasProducts() {
        return this.products.length > 0;
    }

    get categories() {
        const categorySet = new Set(this.products.map((product) => product.category));
        return Array.from(categorySet).sort();
    }

    get visibleProducts() {
        const filtered = this.products.filter((product) => {
            if (this.filterCategory !== 'all' && product.category !== this.filterCategory) {
                return false;
            }
            if (!this.searchTerm) {
                return true;
            }
            const term = this.searchTerm.toLowerCase();
            return (
                product.name.toLowerCase().includes(term) ||
                product.category.toLowerCase().includes(term) ||
                product.supplier.toLowerCase().includes(term) ||
                product.description.toLowerCase().includes(term)
            );
        });
        return [...filtered].sort((a, b) => this.compareBySortField(a, b));
    }

    get groupedProducts() {
        // Group by Profile -> Category
        const groups = new Map();

        this.visibleProducts.forEach(product => {
            const profileId = product.profileId;
            if (!groups.has(profileId)) {
                const profile = this.profiles.find(p => p.id === profileId);
                groups.set(profileId, {
                    profileId: profileId,
                    profileName: profile ? profile.name : `Profile ${profileId}`,
                    dotStyle: `background-color: ${profile?.color === 'success' ? '#10B981' : profile?.color === 'brand' ? '#3B82F6' : '#6B7280'};`,
                    categories: new Map(),
                    totalCount: 0,
                    selectedCount: 0,
                    isExpanded: this.expandedProfileIds.has(profileId),
                    expandIcon: this.expandedProfileIds.has(profileId) ? 'utility:chevrondown' : 'utility:chevronright'
                });
            }

            const group = groups.get(profileId);
            group.totalCount++;
            if (this.selectedProductIds.includes(product.id)) {
                group.selectedCount++;
            }

            const catKey = `${profileId}-${product.category}`;
            if (!group.categories.has(product.category)) {
                group.categories.set(product.category, {
                    key: catKey,
                    name: product.category,
                    products: [],
                    count: 0,
                    isExpanded: this.expandedCategoryKeys.has(catKey),
                    expandIcon: this.expandedCategoryKeys.has(catKey) ? 'utility:chevrondown' : 'utility:chevronright'
                });
            }

            const catGroup = group.categories.get(product.category);
            catGroup.count++;

            // UI Product
            const uiProduct = {
                ...product,
                currency: product.currencyCode || 'USD',
                isSelected: this.selectedProductIds.includes(product.id),
                isEditingDiscount: this.editingCell === `${product.id}-discount`,
                isEditingSurcharge: this.editingCell === `${product.id}-surcharge`,
                editValue: this.editingCell?.startsWith(`${product.id}-`) ? this.editValue : ''
            };
            catGroup.products.push(uiProduct);
        });

        // Convert Maps to Arrays and calculate derived props
        return Array.from(groups.values()).map(group => {
            const categories = Array.from(group.categories.values()).map(catGroup => {
                const isAllSelected = catGroup.products.length > 0 && catGroup.products.every(p => p.isSelected);
                return { ...catGroup, isAllSelected };
            }).sort((a, b) => a.name.localeCompare(b.name));

            const isAllSelected = group.totalCount > 0 && group.selectedCount === group.totalCount;
            return {
                ...group,
                categories,
                isAllSelected,
                selectAllLabel: isAllSelected ? 'Deselect All' : 'Select All'
            };
        });
    }

    get selectedProductCount() {
        return this.selectedProductIds.length;
    }

    get isSaveDisabled() {
        return !this.selectedProductIds.length;
    }

    get modalTitle() {
        return this.modalMode === 'add' ? 'Add New Product' : 'Edit Product';
    }

    // Handlers
    handleProfileSelect(event) {
        const profileId = Number(event.currentTarget.dataset.id);
        const index = this.selectedProfileIds.indexOf(profileId);
        if (index > -1) {
            this.selectedProfileIds = this.selectedProfileIds.filter((id) => id !== profileId);
        } else {
            this.selectedProfileIds = [...this.selectedProfileIds, profileId];
        }

        // Auto-fetch if selecting
        if (this.selectedProfileIds.length > 0) {
            this.fetchProducts();
        } else {
            this.products = [];
            this.selectedProductIds = [];
        }
    }

    handleProfileSearch(event) {
        this.profileSearchTerm = event.target.value;
    }

    async fetchProducts() {
        if (!this.hasProfilesSelected) {
            this.products = [];
            return;
        }
        try {
            const data = await getProductsByProfileIds({ profileIds: this.selectedProfileIds });
            // Deep clone to allow mutation
            this.products = JSON.parse(JSON.stringify(data));
            // Default expand all profiles
            this.selectedProfileIds.forEach(id => this.expandedProfileIds.add(id));
            // Default expand all categories
            this.products.forEach(p => this.expandedCategoryKeys.add(`${p.profileId}-${p.category}`));
        } catch (error) {
            this.showError(error);
        }
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
    }

    handleCategoryChange(event) {
        this.filterCategory = event.target.value;
    }

    handleSortChange(event) {
        this.sortBy = event.target.value;
    }

    handleGlobalClick(event) {
        // No-op for now, kept for future use
    }


    // Expansion Handlers
    toggleProfileExpansion(event) {
        // Prevent bubbling if clicking buttons inside header
        if (event.target.tagName === 'BUTTON' || event.target.closest('button')) return;

        const profileId = Number(event.currentTarget.dataset.id);
        if (this.expandedProfileIds.has(profileId)) {
            this.expandedProfileIds.delete(profileId);
        } else {
            this.expandedProfileIds.add(profileId);
        }
        // Force re-render
        this.expandedProfileIds = new Set(this.expandedProfileIds);
    }

    toggleCategoryExpansion(event) {
        const key = event.currentTarget.dataset.key;
        if (this.expandedCategoryKeys.has(key)) {
            this.expandedCategoryKeys.delete(key);
        } else {
            this.expandedCategoryKeys.add(key);
        }
        // Force re-render
        this.expandedCategoryKeys = new Set(this.expandedCategoryKeys);
    }

    // Selection Handlers
    handleProductSelect(event) {
        const productId = Number(event.currentTarget.dataset.id);
        const isChecked = event.target.checked;
        if (isChecked) {
            if (!this.selectedProductIds.includes(productId)) {
                this.selectedProductIds = [...this.selectedProductIds, productId];
            }
        } else {
            this.selectedProductIds = this.selectedProductIds.filter(id => id !== productId);
        }
    }

    handleSelectAllProfile(event) {
        const profileId = Number(event.currentTarget.dataset.id);
        const group = this.groupedProducts.find(g => g.profileId === profileId);
        if (!group) return;

        const profileProductIds = [];
        group.categories.forEach(cat => {
            cat.products.forEach(p => profileProductIds.push(p.id));
        });

        if (group.isAllSelected) {
            // Deselect all
            this.selectedProductIds = this.selectedProductIds.filter(id => !profileProductIds.includes(id));
        } else {
            // Select all
            const newIds = [...this.selectedProductIds];
            profileProductIds.forEach(id => {
                if (!newIds.includes(id)) newIds.push(id);
            });
            this.selectedProductIds = newIds;
        }
    }

    handleSelectAllCategory(event) {
        const key = event.currentTarget.dataset.key;
        // Find category group
        let targetCatGroup = null;
        for (const group of this.groupedProducts) {
            const found = group.categories.find(c => c.key === key);
            if (found) {
                targetCatGroup = found;
                break;
            }
        }
        if (!targetCatGroup) return;

        const catProductIds = targetCatGroup.products.map(p => p.id);

        if (targetCatGroup.isAllSelected) {
            this.selectedProductIds = this.selectedProductIds.filter(id => !catProductIds.includes(id));
        } else {
            const newIds = [...this.selectedProductIds];
            catProductIds.forEach(id => {
                if (!newIds.includes(id)) newIds.push(id);
            });
            this.selectedProductIds = newIds;
        }
    }

    // Inline Editing
    startEdit(event) {
        const productId = Number(event.currentTarget.dataset.id);
        const field = event.currentTarget.dataset.field;
        // Find product to get current value
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        this.editingCell = `${productId}-${field}`;
        this.editValue = String(product[field]);

        setTimeout(() => {
            const input = this.template.querySelector('input.inline-edit-input');
            if (input) input.focus();
        }, 0);
    }

    handleEditInput(event) {
        this.editValue = event.target.value;
    }

    handleEditKeyDown(event) {
        if (event.key === 'Enter') {
            this.saveEdit();
        } else if (event.key === 'Escape') {
            this.cancelEdit();
        }
    }

    saveEdit() {
        if (!this.editingCell) return;
        const [productIdStr, field] = this.editingCell.split('-');
        const productId = Number(productIdStr);
        const newValue = Number(this.editValue);

        if (isNaN(newValue) || newValue < 0) {
            this.showToast('Error', 'Invalid value', 'error');
            return;
        }

        this.products = this.products.map(p => {
            if (p.id === productId) {
                return { ...p, [field]: newValue };
            }
            return p;
        });

        this.cancelEdit();
    }

    cancelEdit() {
        this.editingCell = null;
        this.editValue = '';
    }

    // Data Lists
    get categoryOptions() {
        return [
            'Diesel fuels', 'Caburetor fuels', 'Gas fuels', 'Adblue',
            'Vehicle cleaning', 'Vehicle accessories', 'Moto oil',
            'Repair/breakdown', 'Parking fee', 'Tyre service',
            'Vehicle rental', 'Vehicle services', 'Workshop services'
        ].map(opt => ({
            label: opt,
            value: opt,
            selected: this.formData.category === opt
        }));
    }

    get supplierOptions() {
        return [
            'Shell', 'BP', 'Esso', 'Total', 'Texaco', 'Chevron',
            'Mobil', 'Petro-Canada', 'Sunoco', 'Valero'
        ].map(opt => ({
            label: opt,
            value: opt,
            selected: this.formData.supplier === opt
        }));
    }

    get countryOptions() {
        return [
            'US', 'CA', 'UK', 'DE', 'FR', 'NL', 'IT', 'ES'
        ].map(opt => ({
            label: opt,
            value: opt,
            selected: this.formData.supplierCountry === opt
        }));
    }

    get stationOptions() {
        return [
            'Main Station', 'Highway Station', 'City Center',
            'Airport Station', 'Shopping Mall', 'Industrial Zone'
        ].map(opt => ({
            label: opt,
            value: opt,
            selected: this.formData.station === opt
        }));
    }

    get stationGroupOptions() {
        return [
            'Group A', 'Group B', 'Group C', 'Premium', 'Standard', 'Express'
        ].map(opt => ({
            label: opt,
            value: opt,
            selected: this.formData.stationGroup === opt
        }));
    }

    get priceModelOptions() {
        return [
            'List', 'Pump', 'Percentage'
        ].map(opt => ({
            label: opt,
            value: opt,
            selected: this.formData.priceModel === opt
        }));
    }

    get currencyOptions() {
        return [
            'USD', 'EUR', 'GBP', 'CAD', 'JPY', 'AUD', 'CHF', 'CNY'
        ].map(opt => ({
            label: opt,
            value: opt,
            selected: this.formData.currencyCode === opt
        }));
    }

    get profileOptions() {
        return this.profiles.map(p => ({
            label: p.name,
            value: p.id,
            selected: this.formData.profileId === p.id
        }));
    }

    // Modal & CRUD Operations
    handleAddProduct() {
        this.modalMode = 'add';
        this.formData = this.getEmptyFormData();
        // Default to first selected profile if any
        if (this.selectedProfileIds.length > 0) {
            this.formData.profileId = this.selectedProfileIds[0];
        }
        this.showFormModal = true;
    }

    handleEditProductModal(event) {
        this.activeActionProductId = null;
        const productId = Number(event.currentTarget.dataset.id);
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        this.modalMode = 'edit';
        this.formData = { ...product };
        this.showFormModal = true;
    }

    handleCloneProductModal(event) {
        this.activeActionProductId = null;
        const productId = Number(event.currentTarget.dataset.id);
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        this.modalMode = 'add';
        this.formData = { ...product, id: null, name: `${product.name} (Copy)` };
        this.showFormModal = true;
    }

    handleDeleteProductModal(event) {
        this.activeActionProductId = null;
        const productId = Number(event.currentTarget.dataset.id);
        this.pendingDeleteProduct = this.products.find(p => p.id === productId);
        this.showDeleteModal = true;
    }

    confirmDelete() {
        if (!this.pendingDeleteProduct) return;

        this.products = this.products.filter(p => p.id !== this.pendingDeleteProduct.id);
        this.selectedProductIds = this.selectedProductIds.filter(id => id !== this.pendingDeleteProduct.id);

        this.showToast('Success', 'Product deleted successfully', 'success');
        this.showDeleteModal = false;
        this.pendingDeleteProduct = null;
    }

    cancelDelete() {
        this.showDeleteModal = false;
        this.pendingDeleteProduct = null;
    }

    closeModal() {
        this.showFormModal = false;
        this.formErrors = {};
    }

    closeModals() {
        this.showProductDetailsModal = false;
        this.viewingProduct = null;
    }

    handleViewProduct(event) {
        const productId = Number(event.currentTarget.dataset.id);
        const product = this.products.find(p => p.id === productId);
        if (product) {
            this.viewingProduct = product;
            this.showProductDetailsModal = true;
        }
    }

    handleModalChange(event) {
        const field = event.target.name;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;

        // Handle number conversions
        let finalValue = value;
        if (['price', 'discount', 'surcharge', 'profileId'].includes(field)) {
            finalValue = value === '' ? '' : Number(value);
        }

        this.formData = { ...this.formData, [field]: finalValue };

        // Clear error for this field
        if (this.formErrors[field]) {
            const newErrors = { ...this.formErrors };
            delete newErrors[field];
            this.formErrors = newErrors;
        }
    }

    validateForm() {
        const errors = {};
        if (!this.formData.name) errors.name = 'Product name is required';
        if (!this.formData.category) errors.category = 'Category is required';
        if (this.formData.price === '' || this.formData.price < 0) errors.price = 'Valid price is required';
        if (!this.formData.profileId) errors.profileId = 'Profile is required';

        this.formErrors = errors;
        return Object.keys(errors).length === 0;
    }

    handleSaveProduct() {
        if (!this.validateForm()) {
            this.showToast('Error', 'Please fix the errors in the form', 'error');
            return;
        }

        if (this.modalMode === 'add') {
            // Generate new ID (mock)
            const maxId = this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) : 0;
            const newProduct = {
                ...this.formData,
                id: maxId + 1,
                // Ensure defaults
                discount: this.formData.discount || 0,
                surcharge: this.formData.surcharge || 0
            };
            this.products = [...this.products, newProduct];
            this.showToast('Success', 'Product created successfully', 'success');
        } else {
            // Edit
            this.products = this.products.map(p => {
                if (p.id === this.formData.id) {
                    return { ...this.formData };
                }
                return p;
            });
            this.showToast('Success', 'Product updated successfully', 'success');
        }

        this.closeModal();
    }

    // Other Actions
    handleViewProduct(event) {
        const productId = Number(event.currentTarget.dataset.id);
        this.activeProduct = this.products.find(p => p.id === productId);
        this.showDetailsModal = true;
    }

    closeDetailsModal() {
        this.showDetailsModal = false;
        this.activeProduct = null;
    }

    handleSaveSummary() {
        if (this.selectedProductIds.length === 0) return;

        savePricingSummary({
            selectedProfileIds: this.selectedProfileIds,
            selectedProductIds: this.selectedProductIds
        })
            .then(result => {
                const parsed = JSON.parse(result);
                this.summaryData = {
                    savedAt: new Date(parsed.savedAt).toLocaleString(),
                    products: this.products.filter(p => this.selectedProductIds.includes(p.id))
                };
                this.showSummary = true;
            })
            .catch(error => this.showError(error));
    }

    handleBackToProfiles() {
        this.showSummary = false;
        this.selectedProfileIds = [];
        this.selectedProductIds = [];
        this.products = [];
        this.summaryData = null;
    }

    // Helpers
    compareBySortField(a, b) {
        if (this.sortBy === 'price') return b.price - a.price;
        if (this.sortBy === 'discount') return b.discount - a.discount;
        if (this.sortBy === 'category') return a.category.localeCompare(b.category);
        return a.name.localeCompare(b.name);
    }

    getEmptyFormData() {
        return {
            id: null, name: '', price: '', category: '', discount: '', surcharge: '',
            profileId: '', description: '', supplier: '', supplierCountry: '',
            station: '', stationGroup: '', priceModel: '', currencyCode: ''
        };
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    showError(error) {
        this.showToast('Error', error.body?.message || error.message, 'error');
    }

    // Summary Helpers
    get summaryGroupedProducts() {
        if (!this.summaryData) return [];
        const groups = new Map();
        this.summaryData.products.forEach(p => {
            if (!groups.has(p.profileId)) {
                const profile = this.profiles.find(prof => prof.id === p.profileId);
                groups.set(p.profileId, {
                    profileId: p.profileId,
                    profileName: profile ? profile.name : `Profile ${p.profileId}`,
                    dotStyle: `background-color: ${profile?.color === 'success' ? '#10B981' : profile?.color === 'brand' ? '#3B82F6' : '#6B7280'};`,
                    count: 0,
                    products: []
                });
            }
            const g = groups.get(p.profileId);
            g.count++;
            g.products.push(p);
        });
        return Array.from(groups.values());
    }

    get totalSummaryProducts() {
        return this.summaryData ? this.summaryData.products.length : 0;
    }

    get savedAt() {
        return this.summaryData ? this.summaryData.savedAt : '';
    }
}