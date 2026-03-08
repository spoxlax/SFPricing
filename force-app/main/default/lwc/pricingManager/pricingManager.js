import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getProfiles from '@salesforce/apex/PricingManagerController.getProfiles';
import getProductsByProfileIds from '@salesforce/apex/PricingManagerController.getProductsByProfileIds';
import savePricingSummary from '@salesforce/apex/PricingManagerController.savePricingSummary';

const PROFILE_COLUMNS = [{ label: 'Profile', fieldName: 'name' }, { label: 'Description', fieldName: 'description' }, { label: 'Products', fieldName: 'productCount', type: 'number' }];
const ROW_ACTIONS = [{ label: 'View', name: 'view' }, { label: 'Edit', name: 'edit' }, { label: 'Clone', name: 'clone' }, { label: 'Delete', name: 'delete' }];
const PRODUCT_COLUMNS = [
    { label: 'Name', fieldName: 'name' },
    { label: 'Category', fieldName: 'category' },
    { label: 'Price', fieldName: 'price', type: 'currency', typeAttributes: { currencyCode: { fieldName: 'currencyCode' } } },
    { label: 'Discount %', fieldName: 'discount', type: 'number' },
    { label: 'Surcharge', fieldName: 'surcharge', type: 'number' },
    { label: 'Supplier', fieldName: 'supplier' },
    { type: 'action', typeAttributes: { rowActions: ROW_ACTIONS } }
];
const CATEGORY_OPTIONS = [
    { label: 'Diesel fuels', value: 'Diesel fuels' },
    { label: 'Caburetor fuels', value: 'Caburetor fuels' },
    { label: 'Gas fuels', value: 'Gas fuels' },
    { label: 'Adblue', value: 'Adblue' },
    { label: 'Vehicle cleaning', value: 'Vehicle cleaning' },
    { label: 'Vehicle accessories', value: 'Vehicle accessories' },
    { label: 'Moto oil', value: 'Moto oil' },
    { label: 'Repair/breakdown', value: 'Repair/breakdown' },
    { label: 'Parking fee', value: 'Parking fee' },
    { label: 'Tyre service', value: 'Tyre service' },
    { label: 'Vehicle rental', value: 'Vehicle rental' },
    { label: 'Vehicle services', value: 'Vehicle services' },
    { label: 'Workshop services', value: 'Workshop services' }
];
const SUPPLIER_OPTIONS = [
    { label: 'Shell', value: 'Shell' },
    { label: 'BP', value: 'BP' },
    { label: 'Esso', value: 'Esso' },
    { label: 'Total', value: 'Total' },
    { label: 'Texaco', value: 'Texaco' },
    { label: 'Chevron', value: 'Chevron' },
    { label: 'Mobil', value: 'Mobil' },
    { label: 'Petro-Canada', value: 'Petro-Canada' },
    { label: 'Sunoco', value: 'Sunoco' },
    { label: 'Valero', value: 'Valero' }
];
const COUNTRY_OPTIONS = [
    { label: 'US', value: 'US' },
    { label: 'CA', value: 'CA' },
    { label: 'UK', value: 'UK' },
    { label: 'DE', value: 'DE' },
    { label: 'FR', value: 'FR' },
    { label: 'NL', value: 'NL' },
    { label: 'IT', value: 'IT' },
    { label: 'ES', value: 'ES' }
];
const STATION_OPTIONS = [
    { label: 'Main Station', value: 'Main Station' },
    { label: 'Highway Station', value: 'Highway Station' },
    { label: 'City Center', value: 'City Center' },
    { label: 'Airport Station', value: 'Airport Station' },
    { label: 'Shopping Mall', value: 'Shopping Mall' },
    { label: 'Industrial Zone', value: 'Industrial Zone' }
];
const STATION_GROUP_OPTIONS = [
    { label: 'Group A', value: 'Group A' },
    { label: 'Group B', value: 'Group B' },
    { label: 'Group C', value: 'Group C' },
    { label: 'Premium', value: 'Premium' },
    { label: 'Standard', value: 'Standard' },
    { label: 'Express', value: 'Express' }
];
const PRICE_MODEL_OPTIONS = [{ label: 'List', value: 'List' }, { label: 'Pump', value: 'Pump' }, { label: 'Percentage', value: 'Percentage' }];
const CURRENCY_OPTIONS = [
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
    { label: 'GBP', value: 'GBP' },
    { label: 'CAD', value: 'CAD' },
    { label: 'JPY', value: 'JPY' },
    { label: 'AUD', value: 'AUD' },
    { label: 'CHF', value: 'CHF' },
    { label: 'CNY', value: 'CNY' }
];

export default class PricingManager extends LightningElement {
    profileColumns = PROFILE_COLUMNS;
    productColumns = PRODUCT_COLUMNS;
    categoryOptions = CATEGORY_OPTIONS;
    supplierOptions = SUPPLIER_OPTIONS;
    countryOptions = COUNTRY_OPTIONS;
    stationOptions = STATION_OPTIONS;
    stationGroupOptions = STATION_GROUP_OPTIONS;
    priceModelOptions = PRICE_MODEL_OPTIONS;
    currencyOptions = CURRENCY_OPTIONS;

    @track profiles = [];
    @track products = [];
    @track selectedProfileIds = [];
    @track selectedProductIds = [];
    @track searchTerm = '';
    @track sortBy = 'name';
    @track filterCategory = 'all';
    @track showSummary = false;
    @track summaryData = null;
    @track showFormModal = false;
    @track showDetailsModal = false;
    @track showDeleteModal = false;
    @track modalMode = 'add';
    @track pendingDeleteProduct = null;
    @track activeProduct = null;
    @track formData = this.getEmptyFormData();
    @track formErrors = {};

    @wire(getProfiles)
    wiredProfiles({ data, error }) {
        if (data) {
            this.profiles = data;
        } else if (error) {
            this.showError(error);
        }
    }

    get hasProfilesSelected() {
        return this.selectedProfileIds.length > 0;
    }

    get hasProducts() {
        return this.products.length > 0;
    }

    get disableSaveSummary() {
        return !this.selectedProductIds.length;
    }

    get selectedProductCount() {
        return this.selectedProductIds.length;
    }

    get profileOptions() {
        return this.profiles.map((profile) => ({ label: profile.name, value: String(profile.id) }));
    }

    get categoryFilterOptions() {
        const options = [{ label: 'All Categories', value: 'all' }];
        const categorySet = new Set(this.products.map((product) => product.category));
        categorySet.forEach((category) => options.push({ label: category, value: category }));
        return options;
    }

    get sortOptions() {
        return [
            { label: 'Name', value: 'name' },
            { label: 'Price', value: 'price' },
            { label: 'Discount', value: 'discount' },
            { label: 'Surcharge', value: 'surcharge' },
            { label: 'Category', value: 'category' }
        ];
    }

    get visibleProducts() {
        const filtered = this.products.filter((product) => {
            const categoryMatch = this.filterCategory === 'all' || product.category === this.filterCategory;
            if (!categoryMatch) {
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
                product.supplierCountry.toLowerCase().includes(term) ||
                product.station.toLowerCase().includes(term) ||
                product.stationGroup.toLowerCase().includes(term) ||
                product.description.toLowerCase().includes(term)
            );
        });
        return [...filtered].sort((a, b) => this.compareBySortField(a, b));
    }

    get selectedProducts() {
        const selectedSet = new Set(this.selectedProductIds);
        return this.products.filter((product) => selectedSet.has(product.id));
    }

    get hasSummary() {
        return this.showSummary && this.summaryData;
    }

    get summaryProfileBreakdown() {
        if (!this.summaryData) {
            return [];
        }
        const grouped = new Map();
        this.summaryData.products.forEach((product) => {
            if (!grouped.has(product.profileId)) {
                grouped.set(product.profileId, []);
            }
            grouped.get(product.profileId).push(product);
        });
        return Array.from(grouped.entries()).map(([profileId, profileProducts]) => ({
            profileId,
            profileName: this.getProfileName(profileId),
            productCount: profileProducts.length,
            products: profileProducts
        }));
    }

    get modalTitle() {
        return this.modalMode === 'add' ? 'Add Product' : this.modalMode === 'edit' ? 'Edit Product' : 'Clone Product';
    }

    get modalSaveLabel() {
        return this.modalMode === 'add' ? 'Add Product' : this.modalMode === 'edit' ? 'Save Changes' : 'Save Clone';
    }

    get detailsRows() {
        if (!this.activeProduct) {
            return [];
        }
        return [
            { key: 'Name', value: this.activeProduct.name },
            { key: 'Category', value: this.activeProduct.category },
            { key: 'Price', value: `${this.activeProduct.price} ${this.activeProduct.currencyCode}` },
            { key: 'Discount', value: `${this.activeProduct.discount}%` },
            { key: 'Surcharge', value: `${this.activeProduct.surcharge}` },
            { key: 'Supplier', value: this.activeProduct.supplier },
            { key: 'Supplier Country', value: this.activeProduct.supplierCountry },
            { key: 'Station', value: this.activeProduct.station },
            { key: 'Station Group', value: this.activeProduct.stationGroup },
            { key: 'Price Model', value: this.activeProduct.priceModel },
            { key: 'Description', value: this.activeProduct.description }
        ];
    }

    get selectedProfileCount() {
        return this.selectedProfileIds.length;
    }

    get visibleProductCount() {
        return this.visibleProducts.length;
    }

    handleProfileSelection(event) {
        this.selectedProfileIds = event.detail.selectedRows.map((row) => row.id);
        this.fetchProducts();
    }

    async fetchProducts() {
        if (!this.hasProfilesSelected) {
            this.products = [];
            this.selectedProductIds = [];
            return;
        }
        try {
            const data = await getProductsByProfileIds({ profileIds: this.selectedProfileIds });
            this.products = data;
            this.selectedProductIds = data.map((item) => item.id);
        } catch (error) {
            this.showError(error);
        }
    }

    handleProductSelection(event) {
        this.selectedProductIds = event.detail.selectedRows.map((row) => row.id);
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
    }

    handleSortChange(event) {
        this.sortBy = event.detail.value;
    }

    handleCategoryFilterChange(event) {
        this.filterCategory = event.detail.value;
    }

    handleSelectAllVisible() {
        this.selectedProductIds = this.visibleProducts.map((product) => product.id);
    }

    handleClearSelection() {
        this.selectedProductIds = [];
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if (actionName === 'view') {
            this.activeProduct = row;
            this.showDetailsModal = true;
            return;
        }
        if (actionName === 'edit') {
            this.openFormModal('edit', row);
            return;
        }
        if (actionName === 'clone') {
            this.openFormModal('clone', { ...row, name: `${row.name} (Copy)` });
            return;
        }
        if (actionName === 'delete') {
            this.pendingDeleteProduct = row;
            this.showDeleteModal = true;
        }
    }

    handleAddProduct() {
        const defaultProfileId = this.selectedProfileIds.length ? String(this.selectedProfileIds[0]) : '';
        this.openFormModal('add', { ...this.getEmptyFormData(), profileId: defaultProfileId });
    }

    openFormModal(mode, source) {
        this.modalMode = mode;
        this.formErrors = {};
        this.formData = {
            id: source.id || null,
            name: source.name || '',
            price: source.price !== undefined ? String(source.price) : '',
            category: source.category || '',
            discount: source.discount !== undefined ? String(source.discount) : '',
            surcharge: source.surcharge !== undefined ? String(source.surcharge) : '',
            profileId: source.profileId !== undefined ? String(source.profileId) : '',
            description: source.description || '',
            supplier: source.supplier || '',
            supplierCountry: source.supplierCountry || '',
            station: source.station || '',
            stationGroup: source.stationGroup || '',
            priceModel: source.priceModel || '',
            currencyCode: source.currencyCode || ''
        };
        this.showFormModal = true;
    }

    handleFormFieldChange(event) {
        const field = event.target.dataset.field;
        this.formData = { ...this.formData, [field]: event.detail ? event.detail.value : event.target.value };
        if (this.formErrors[field]) {
            this.formErrors = { ...this.formErrors, [field]: '' };
        }
    }

    handleCloseFormModal() {
        this.showFormModal = false;
    }

    handleCloseDetailsModal() {
        this.showDetailsModal = false;
        this.activeProduct = null;
    }

    handleCloseDeleteModal() {
        this.showDeleteModal = false;
        this.pendingDeleteProduct = null;
    }

    handleConfirmDelete() {
        if (!this.pendingDeleteProduct) {
            return;
        }
        const removeId = this.pendingDeleteProduct.id;
        this.products = this.products.filter((product) => product.id !== removeId);
        this.selectedProductIds = this.selectedProductIds.filter((id) => id !== removeId);
        this.handleCloseDeleteModal();
    }

    handleEditFromDetails() {
        if (!this.activeProduct) {
            return;
        }
        const product = this.activeProduct;
        this.handleCloseDetailsModal();
        this.openFormModal('edit', product);
    }

    handleSaveForm() {
        if (!this.validateForm()) {
            return;
        }
        const productPayload = {
            id: this.modalMode === 'edit' ? this.formData.id : Date.now(),
            name: this.formData.name.trim(),
            price: Number(this.formData.price),
            category: this.formData.category,
            discount: Number(this.formData.discount),
            surcharge: this.formData.surcharge === '' ? 0 : Number(this.formData.surcharge),
            profileId: Number(this.formData.profileId),
            description: this.formData.description,
            supplier: this.formData.supplier,
            supplierCountry: this.formData.supplierCountry,
            station: this.formData.station,
            stationGroup: this.formData.stationGroup,
            priceModel: this.formData.priceModel,
            currencyCode: this.formData.currencyCode
        };

        if (this.modalMode === 'edit') {
            this.products = this.products.map((product) => (product.id === productPayload.id ? productPayload : product));
        } else {
            this.products = [...this.products, productPayload];
        }
        if (!this.selectedProductIds.includes(productPayload.id)) {
            this.selectedProductIds = [...this.selectedProductIds, productPayload.id];
        }
        this.showFormModal = false;
    }

    async handleSaveSummary() {
        if (!this.selectedProductIds.length) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'No products selected',
                    message: 'Select at least one product before saving.',
                    variant: 'warning'
                })
            );
            return;
        }
        try {
            const result = await savePricingSummary({
                selectedProfileIds: this.selectedProfileIds,
                selectedProductIds: this.selectedProductIds
            });
            const parsed = JSON.parse(result);
            this.summaryData = {
                selectedProfiles: this.profiles.filter((profile) => this.selectedProfileIds.includes(profile.id)),
                products: this.selectedProducts,
                savedAt: parsed.savedAt
            };
            this.showSummary = true;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Summary saved',
                    message: 'Pricing summary was saved successfully.',
                    variant: 'success'
                })
            );
        } catch (error) {
            this.showError(error);
        }
    }

    handleBackToEditor() {
        this.showSummary = false;
    }

    compareBySortField(a, b) {
        if (this.sortBy === 'price') {
            return b.price - a.price;
        }
        if (this.sortBy === 'discount') {
            return b.discount - a.discount;
        }
        if (this.sortBy === 'surcharge') {
            return b.surcharge - a.surcharge;
        }
        if (this.sortBy === 'category') {
            return a.category.localeCompare(b.category);
        }
        return a.name.localeCompare(b.name);
    }

    getProfileName(profileId) {
        const profile = this.profiles.find((item) => item.id === profileId);
        return profile ? profile.name : `Profile ${profileId}`;
    }

    getEmptyFormData() {
        return {
            id: null,
            name: '',
            price: '',
            category: '',
            discount: '',
            surcharge: '',
            profileId: '',
            description: '',
            supplier: '',
            supplierCountry: '',
            station: '',
            stationGroup: '',
            priceModel: '',
            currencyCode: ''
        };
    }

    validateForm() {
        const errors = {};
        if (!this.formData.name.trim()) {
            errors.name = 'Product name is required';
        }
        if (!this.formData.price || isNaN(Number(this.formData.price)) || Number(this.formData.price) <= 0) {
            errors.price = 'Valid price is required';
        }
        if (!this.formData.category) {
            errors.category = 'Category is required';
        }
        if (!this.formData.discount || isNaN(Number(this.formData.discount)) || Number(this.formData.discount) < 0 || Number(this.formData.discount) > 100) {
            errors.discount = 'Valid discount (0-100%) is required';
        }
        if (this.formData.surcharge !== '' && (isNaN(Number(this.formData.surcharge)) || Number(this.formData.surcharge) < 0)) {
            errors.surcharge = 'Valid surcharge amount is required';
        }
        if (!this.formData.profileId) {
            errors.profileId = 'Profile is required';
        }
        if (!this.formData.supplier) {
            errors.supplier = 'Supplier is required';
        }
        if (!this.formData.supplierCountry) {
            errors.supplierCountry = 'Supplier country is required';
        }
        if (!this.formData.station) {
            errors.station = 'Station is required';
        }
        if (!this.formData.stationGroup) {
            errors.stationGroup = 'Station group is required';
        }
        if (!this.formData.priceModel) {
            errors.priceModel = 'Price model is required';
        }
        if (!this.formData.currencyCode) {
            errors.currencyCode = 'Currency is required';
        }
        this.formErrors = errors;
        return Object.keys(errors).length === 0;
    }

    showError(error) {
        const message = error && error.body && error.body.message ? error.body.message : error && error.message ? error.message : 'Unknown error';
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message,
                variant: 'error'
            })
        );
    }
}
