# Agrifarm Database Architecture Diagram

Generated from `apps/api/prisma/schema.prisma`.

## Files

- `agrifarm-database-erd.mmd` is the editable Mermaid ERD source.
- `agrifarm-database-erd.svg` is the presentation-ready visual layout.

## Logical Groups

| Area | Tables |
| --- | --- |
| Identity & Access | User, RefreshToken, SellerProfile, Address |
| Geography & Service Areas | Barangay, StoreServiceArea |
| Marketplace Catalog | Store, Category, Product, ProductVariant, ProductCategory, ProductImage, Cart, CartItem, Review |
| Checkout & Orders | Order, SellerOrder, OrderItem, Payment, Fulfillment |
| Finance & Operations | FinancialTransaction, CommissionPlan, StoreCommission, InventoryLedger, AuditLog, Notification |
| Urban Agriculture Data | AgriculturalDataSource, UrbanFarmer, FarmingAssociation, FarmingAssociationMember, FarmingSite, FarmingSiteFarmer, Crop, CultivationRecord, HarvestRecord, SeasonalCropCalendar, MarketPriceObservation, CropAvailabilityObservation, SupplyReport, AgriculturalSaleRecord, AgriculturalStatistic |
| Localization | TranslationOverride |

## Relationship Register

This register lists every primary key to foreign key relationship represented in the diagram.

| Parent key | Foreign key | Required? | On delete |
| --- | --- | --- | --- |
| User.id | RefreshToken.userId | Required | Cascade |
| User.id | SellerProfile.userId | Required | Cascade |
| SellerProfile.id | Store.sellerProfileId | Required | Restrict |
| Store.id | StoreServiceArea.storeId | Required | Cascade |
| Barangay.id | StoreServiceArea.barangayId | Required | Restrict |
| Category.id | Category.parentId | Optional | SetNull |
| Store.id | Product.storeId | Required | Restrict |
| Store.id | ProductVariant.storeId | Required | Restrict |
| Product.id, storeId | ProductVariant.productId, storeId | Required | Cascade |
| Product.id | ProductCategory.productId | Required | Cascade |
| Category.id | ProductCategory.categoryId | Required | Cascade |
| Product.id | ProductImage.productId | Required | Cascade |
| User.id | Address.userId | Required | Cascade |
| Barangay.id | Address.barangayId | Optional | Restrict |
| User.id | Cart.userId | Required | Cascade |
| Cart.id | CartItem.cartId | Required | Cascade |
| ProductVariant.id | CartItem.variantId | Required | Restrict |
| User.id | Order.buyerId | Required | Restrict |
| Address.id, userId | Order.shippingAddressId, buyerId | Required | Restrict |
| Order.id | SellerOrder.orderId | Required | Cascade |
| Store.id | SellerOrder.storeId | Required | Restrict |
| Order.id | OrderItem.orderId | Required | Cascade |
| SellerOrder.id, storeId | OrderItem.sellerOrderId, storeId | Required | Cascade |
| ProductVariant.id, storeId | OrderItem.variantId, storeId | Required | Restrict |
| Order.id | Payment.orderId | Required | Cascade |
| SellerOrder.id | Fulfillment.sellerOrderId | Required | Cascade |
| User.id | Fulfillment.riderId | Optional | SetNull |
| Store.id | FinancialTransaction.storeId | Required | Restrict |
| Order.id | FinancialTransaction.orderId | Optional | SetNull |
| SellerOrder.id | FinancialTransaction.sellerOrderId | Optional | SetNull |
| Store.id | StoreCommission.storeId | Required | Cascade |
| CommissionPlan.id | StoreCommission.commissionPlanId | Required | Restrict |
| ProductVariant.id | InventoryLedger.variantId | Required | Cascade |
| User.id | InventoryLedger.changedById | Optional | SetNull |
| User.id | Review.userId | Required | Cascade |
| Product.id | Review.productId | Required | Cascade |
| User.id | AuditLog.actorId | Optional | SetNull |
| User.id | Notification.userId | Required | Cascade |
| Barangay.id | UrbanFarmer.barangayId | Required | Restrict |
| AgriculturalDataSource.id | UrbanFarmer.sourceId | Optional | SetNull |
| Barangay.id | FarmingAssociation.barangayId | Optional | Restrict |
| AgriculturalDataSource.id | FarmingAssociation.sourceId | Optional | SetNull |
| FarmingAssociation.id | FarmingAssociationMember.associationId | Required | Cascade |
| UrbanFarmer.id | FarmingAssociationMember.farmerId | Required | Cascade |
| Barangay.id | FarmingSite.barangayId | Required | Restrict |
| FarmingAssociation.id | FarmingSite.associationId | Optional | SetNull |
| AgriculturalDataSource.id | FarmingSite.sourceId | Optional | SetNull |
| FarmingSite.id | FarmingSiteFarmer.siteId | Required | Cascade |
| UrbanFarmer.id | FarmingSiteFarmer.farmerId | Required | Cascade |
| AgriculturalDataSource.id | Crop.sourceId | Optional | SetNull |
| FarmingSite.id | CultivationRecord.siteId | Required | Restrict |
| Crop.id | CultivationRecord.cropId | Required | Restrict |
| UrbanFarmer.id | CultivationRecord.farmerId | Optional | SetNull |
| AgriculturalDataSource.id | CultivationRecord.sourceId | Optional | SetNull |
| CultivationRecord.id | HarvestRecord.cultivationId | Optional | SetNull |
| FarmingSite.id | HarvestRecord.siteId | Required | Restrict |
| Crop.id | HarvestRecord.cropId | Required | Restrict |
| UrbanFarmer.id | HarvestRecord.farmerId | Optional | SetNull |
| AgriculturalDataSource.id | HarvestRecord.sourceId | Optional | SetNull |
| Crop.id | SeasonalCropCalendar.cropId | Required | Restrict |
| Barangay.id | SeasonalCropCalendar.barangayId | Optional | Restrict |
| FarmingSite.id | SeasonalCropCalendar.siteId | Optional | SetNull |
| AgriculturalDataSource.id | SeasonalCropCalendar.sourceId | Optional | SetNull |
| Crop.id | MarketPriceObservation.cropId | Required | Restrict |
| Barangay.id | MarketPriceObservation.barangayId | Optional | Restrict |
| AgriculturalDataSource.id | MarketPriceObservation.sourceId | Optional | SetNull |
| Crop.id | CropAvailabilityObservation.cropId | Required | Restrict |
| Barangay.id | CropAvailabilityObservation.barangayId | Optional | Restrict |
| FarmingSite.id | CropAvailabilityObservation.siteId | Optional | SetNull |
| AgriculturalDataSource.id | CropAvailabilityObservation.sourceId | Optional | SetNull |
| Crop.id | SupplyReport.cropId | Required | Restrict |
| Barangay.id | SupplyReport.barangayId | Optional | Restrict |
| AgriculturalDataSource.id | SupplyReport.sourceId | Optional | SetNull |
| Crop.id | AgriculturalSaleRecord.cropId | Required | Restrict |
| Barangay.id | AgriculturalSaleRecord.barangayId | Optional | Restrict |
| FarmingSite.id | AgriculturalSaleRecord.siteId | Optional | SetNull |
| UrbanFarmer.id | AgriculturalSaleRecord.farmerId | Optional | SetNull |
| AgriculturalDataSource.id | AgriculturalSaleRecord.sourceId | Optional | SetNull |
| Crop.id | AgriculturalStatistic.cropId | Optional | Restrict |
| Barangay.id | AgriculturalStatistic.barangayId | Optional | Restrict |
| FarmingSite.id | AgriculturalStatistic.siteId | Optional | SetNull |
| AgriculturalDataSource.id | AgriculturalStatistic.sourceId | Optional | SetNull |
