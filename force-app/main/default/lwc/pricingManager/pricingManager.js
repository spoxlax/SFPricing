import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getProfiles from '@salesforce/apex/PricingManagerController.getProfiles';
import getProductsByProfileIds from '@salesforce/apex/PricingManagerController.getProductsByProfileIds';
import savePricingSummary from '@salesforce/apex/PricingManagerController.savePricingSummary';

const PROFILE_COLUMNS = [
    { label: 'Profile', fieldName: 'name' },
    { label: 'Description', fieldName: 'description' },
    { label: 'Products', fieldName: 'productCount', type: 'number' }
];

const PRODUCT_COLUMNS = [
    { label: 'Name', fieldName: 'name', editable: true },
    { label: 'Category', fieldName: 'category' },
    { label: 'Price', fieldName: 'price', type: 'currency', typeAttributes: { currencyCode: { fieldName: 'currency' } }, editable: true },
    { label: 'Discount %', fieldName: 'discount', type: 'number', editable: true },
    { label: 'Surcharge', fieldName: 'surcharge', type: 'number', editable: true },
    { label: 'Supplier', fieldName: 'supplier' }
];

export default class PricingManager extends LightningElement {
    profileColumns = PROFILE_COLUMNS;
    productColumns = PRODUCT_COLUMNS;

    @track profiles = [];
    @track products = [];
    @track selectedProfileIds = [];
    @track selectedProductIds = [];
    @track summaryText = '';
    @track searchTerm = '';
    @track draftValues = [];

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
        return this.filteredProducts.length > 0;
    }

    get selectedProductCount() {
        return this.selectedProductIds.length;
    }

    get filteredProducts() {
        if (!this.searchTerm) {
            return this.products;
        }
        const term = this.searchTerm.toLowerCase();
        return this.products.filter((product) =>
            product.name.toLowerCase().includes(term) ||
            product.category.toLowerCase().includes(term) ||
            product.supplier.toLowerCase().includes(term)
        );
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
            this.draftValues = [];
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

    handleDraftChange(event) {
        this.draftValues = event.detail.draftValues;
    }

    handleSaveDrafts() {
        if (!this.draftValues.length) {
            return;
        }

        const updates = new Map();
        this.draftValues.forEach((draft) => updates.set(draft.id, draft));
        this.products = this.products.map((product) => {
            const draft = updates.get(product.id);
            return draft ? { ...product, ...draft } : product;
        });
        this.draftValues = [];
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Products updated',
                message: 'Inline changes were applied in the current session.',
                variant: 'success'
            })
        );
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
            this.summaryText = `Saved ${parsed.selectedProductIds.length} products across ${parsed.selectedProfileIds.length} profiles at ${parsed.savedAt}`;
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

    showError(error) {
        const message = error?.body?.message || error?.message || 'Unknown error';
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message,
                variant: 'error'
            })
        );
    }
}
