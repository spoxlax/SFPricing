public with sharing class PricingManagerController {
    public class ProfileDto {
        @AuraEnabled public Integer id;
        @AuraEnabled public String name;
        @AuraEnabled public String description;
        @AuraEnabled public String color;
        @AuraEnabled public Integer productCount;
    }

    public class ProductDto {
        @AuraEnabled public Integer id;
        @AuraEnabled public String name;
        @AuraEnabled public Decimal price;
        @AuraEnabled public String category;
        @AuraEnabled public Decimal discount;
        @AuraEnabled public Decimal surcharge;
        @AuraEnabled public Integer profileId;
        @AuraEnabled public String description;
        @AuraEnabled public String supplier;
        @AuraEnabled public String supplierCountry;
        @AuraEnabled public String station;
        @AuraEnabled public String stationGroup;
        @AuraEnabled public String priceModel;
        @AuraEnabled public String currencyCode;
    }

    public class PricingSummaryDto {
        @AuraEnabled public List<Integer> selectedProfileIds;
        @AuraEnabled public List<Integer> selectedProductIds;
        @AuraEnabled public Datetime savedAt;
    }

    private static List<ProfileDto> buildProfiles() {
        List<ProfileDto> profiles = new List<ProfileDto>();

        ProfileDto superSaver = new ProfileDto();
        superSaver.id = 1;
        superSaver.name = 'SuperSaver';
        superSaver.description = 'Budget-friendly fuel and vehicle services';
        superSaver.color = 'success';
        superSaver.productCount = 6;
        profiles.add(superSaver);

        ProfileDto superFlex = new ProfileDto();
        superFlex.id = 2;
        superFlex.name = 'SuperFlex';
        superFlex.description = 'Premium fuel and comprehensive vehicle care';
        superFlex.color = 'brand';
        superFlex.productCount = 6;
        profiles.add(superFlex);

        return profiles;
    }

    private static List<ProductDto> buildProducts() {
        List<ProductDto> products = new List<ProductDto>();

        ProductDto p1 = new ProductDto();
        p1.id = 1;
        p1.name = 'Premium Diesel';
        p1.price = 1.42;
        p1.category = 'Diesel fuels';
        p1.discount = 12;
        p1.surcharge = 0.05;
        p1.profileId = 1;
        p1.description = 'Premium diesel fuel for commercial and personal vehicles';
        p1.supplier = 'Shell';
        p1.supplierCountry = 'US';
        p1.station = 'Highway Station';
        p1.stationGroup = 'Premium';
        p1.priceModel = 'List';
        p1.currencyCode = 'USD';
        products.add(p1);

        ProductDto p2 = new ProductDto();
        p2.id = 2;
        p2.name = 'Eco Diesel';
        p2.price = 1.38;
        p2.category = 'Diesel fuels';
        p2.discount = 15;
        p2.surcharge = 0.03;
        p2.profileId = 1;
        p2.description = 'Environmentally friendly diesel with low emissions';
        p2.supplier = 'BP';
        p2.supplierCountry = 'UK';
        p2.station = 'City Center';
        p2.stationGroup = 'Standard';
        p2.priceModel = 'Pump';
        p2.currencyCode = 'GBP';
        products.add(p2);

        ProductDto p3 = new ProductDto();
        p3.id = 3;
        p3.name = 'Regular Unleaded';
        p3.price = 1.35;
        p3.category = 'Gas fuels';
        p3.discount = 15;
        p3.surcharge = 0.04;
        p3.profileId = 1;
        p3.description = 'Regular unleaded gasoline for everyday driving';
        p3.supplier = 'Esso';
        p3.supplierCountry = 'CA';
        p3.station = 'Main Station';
        p3.stationGroup = 'Express';
        p3.priceModel = 'Percentage';
        p3.currencyCode = 'CAD';
        products.add(p3);

        ProductDto p4 = new ProductDto();
        p4.id = 4;
        p4.name = 'AdBlue Standard';
        p4.price = 0.89;
        p4.category = 'Adblue';
        p4.discount = 18;
        p4.surcharge = 0.02;
        p4.profileId = 1;
        p4.description = 'Diesel exhaust fluid for SCR systems compliance';
        p4.supplier = 'Total';
        p4.supplierCountry = 'FR';
        p4.station = 'Industrial Zone';
        p4.stationGroup = 'Group A';
        p4.priceModel = 'List';
        p4.currencyCode = 'EUR';
        products.add(p4);

        ProductDto p5 = new ProductDto();
        p5.id = 5;
        p5.name = 'Basic Car Wash';
        p5.price = 24.99;
        p5.category = 'Vehicle cleaning';
        p5.discount = 20;
        p5.surcharge = 2.50;
        p5.profileId = 1;
        p5.description = 'Complete exterior and interior vehicle cleaning service';
        p5.supplier = 'Texaco';
        p5.supplierCountry = 'US';
        p5.station = 'Shopping Mall';
        p5.stationGroup = 'Group B';
        p5.priceModel = 'Pump';
        p5.currencyCode = 'USD';
        products.add(p5);

        ProductDto p6 = new ProductDto();
        p6.id = 6;
        p6.name = 'Emergency Repair';
        p6.price = 189.00;
        p6.category = 'Repair/breakdown';
        p6.discount = 10;
        p6.surcharge = 25.00;
        p6.profileId = 1;
        p6.description = '24/7 roadside assistance and emergency repair services';
        p6.supplier = 'Petro-Canada';
        p6.supplierCountry = 'CA';
        p6.station = 'Main Station';
        p6.stationGroup = 'Express';
        p6.priceModel = 'List';
        p6.currencyCode = 'CAD';
        products.add(p6);

        ProductDto p7 = new ProductDto();
        p7.id = 7;
        p7.name = 'Premium Diesel Plus';
        p7.price = 1.48;
        p7.category = 'Diesel fuels';
        p7.discount = 15;
        p7.surcharge = 0.06;
        p7.profileId = 2;
        p7.description = 'Premium diesel fuel with advanced cleaning additives';
        p7.supplier = 'Total';
        p7.supplierCountry = 'FR';
        p7.station = 'Main Station';
        p7.stationGroup = 'Premium';
        p7.priceModel = 'Percentage';
        p7.currencyCode = 'EUR';
        products.add(p7);

        ProductDto p8 = new ProductDto();
        p8.id = 8;
        p8.name = 'Fleet Diesel';
        p8.price = 1.43;
        p8.category = 'Diesel fuels';
        p8.discount = 22;
        p8.surcharge = 0.04;
        p8.profileId = 2;
        p8.description = 'Bulk diesel pricing for fleet customers';
        p8.supplier = 'Petro-Canada';
        p8.supplierCountry = 'CA';
        p8.station = 'Highway Station';
        p8.stationGroup = 'Express';
        p8.priceModel = 'List';
        p8.currencyCode = 'CAD';
        products.add(p8);

        ProductDto p9 = new ProductDto();
        p9.id = 9;
        p9.name = 'Race Fuel 110';
        p9.price = 2.85;
        p9.category = 'Caburetor fuels';
        p9.discount = 5;
        p9.surcharge = 0.20;
        p9.profileId = 2;
        p9.description = '110 octane race fuel for professional racing';
        p9.supplier = 'Shell';
        p9.supplierCountry = 'US';
        p9.station = 'Highway Station';
        p9.stationGroup = 'Premium';
        p9.priceModel = 'Pump';
        p9.currencyCode = 'USD';
        products.add(p9);

        ProductDto p10 = new ProductDto();
        p10.id = 10;
        p10.name = 'Top Tier Premium';
        p10.price = 1.52;
        p10.category = 'Gas fuels';
        p10.discount = 12;
        p10.surcharge = 0.07;
        p10.profileId = 2;
        p10.description = 'Top Tier premium gasoline with detergent additives';
        p10.supplier = 'Total';
        p10.supplierCountry = 'FR';
        p10.station = 'Airport Station';
        p10.stationGroup = 'Premium';
        p10.priceModel = 'List';
        p10.currencyCode = 'EUR';
        products.add(p10);

        ProductDto p11 = new ProductDto();
        p11.id = 11;
        p11.name = 'Luxury Car Rental';
        p11.price = 89.99;
        p11.category = 'Vehicle rental';
        p11.discount = 16;
        p11.surcharge = 22.00;
        p11.profileId = 2;
        p11.description = 'Premium vehicle rental with luxury and electric options';
        p11.supplier = 'Total';
        p11.supplierCountry = 'FR';
        p11.station = 'Shopping Mall';
        p11.stationGroup = 'Group A';
        p11.priceModel = 'List';
        p11.currencyCode = 'EUR';
        products.add(p11);

        ProductDto p12 = new ProductDto();
        p12.id = 12;
        p12.name = 'Expert Workshop';
        p12.price = 345.00;
        p12.category = 'Workshop services';
        p12.discount = 32;
        p12.surcharge = 28.00;
        p12.profileId = 2;
        p12.description = 'Expert workshop services with certified technicians';
        p12.supplier = 'Chevron';
        p12.supplierCountry = 'US';
        p12.station = 'Main Station';
        p12.stationGroup = 'Express';
        p12.priceModel = 'Pump';
        p12.currencyCode = 'USD';
        products.add(p12);

        return products;
    }

    @AuraEnabled(cacheable=true)
    public static List<ProfileDto> getProfiles() {
        return buildProfiles();
    }

    @AuraEnabled(cacheable=true)
    public static List<ProductDto> getProductsByProfileIds(List<Integer> profileIds) {
        List<Integer> selectedIds = profileIds == null ? new List<Integer>() : profileIds;
        if (selectedIds.isEmpty()) {
            return new List<ProductDto>();
        }

        Set<Integer> selectedSet = new Set<Integer>(selectedIds);
        List<ProductDto> result = new List<ProductDto>();
        for (ProductDto product : buildProducts()) {
            if (selectedSet.contains(product.profileId)) {
                result.add(product);
            }
        }
        return result;
    }

    @AuraEnabled
    public static String savePricingSummary(List<Integer> selectedProfileIds, List<Integer> selectedProductIds) {
        PricingSummaryDto summary = new PricingSummaryDto();
        summary.selectedProfileIds = selectedProfileIds == null ? new List<Integer>() : selectedProfileIds;
        summary.selectedProductIds = selectedProductIds == null ? new List<Integer>() : selectedProductIds;
        summary.savedAt = Datetime.now();
        return JSON.serialize(summary);
    }
}
