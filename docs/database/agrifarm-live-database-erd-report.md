# Agrifarm Live Database ERD Report

Generated from the current PostgreSQL `public` schema using `information_schema` and `pg_catalog`.

## Output

- Editable Draw.io XML: `docs/database/agrifarm-live-database-erd.drawio`

## Scope

- Tables inspected: 43
- Foreign keys inspected: 82
- Join/pivot tables detected: CartItem, FarmingAssociationMember, FarmingSiteFarmer, ProductCategory, StoreServiceArea

## Table Groups

- **Identity & Access**: User, RefreshToken, SellerProfile, Address.
- **Geography & Service Areas**: Barangay, StoreServiceArea. Join/pivot tables: StoreServiceArea.
- **Marketplace Catalog**: Store, Category, Product, ProductVariant, ProductCategory, ProductImage, Cart, CartItem, Review. Join/pivot tables: ProductCategory, CartItem.
- **Checkout & Orders**: Order, SellerOrder, OrderItem, Payment, Fulfillment.
- **Finance & Operations**: FinancialTransaction, CommissionPlan, StoreCommission, InventoryLedger, AuditLog, Notification.
- **Urban Agriculture Data**: AgriculturalDataSource, UrbanFarmer, FarmingAssociation, FarmingAssociationMember, FarmingSite, FarmingSiteFarmer, Crop, CultivationRecord, HarvestRecord, SeasonalCropCalendar, MarketPriceObservation, CropAvailabilityObservation, SupplyReport, AgriculturalSaleRecord, AgriculturalStatistic. Join/pivot tables: FarmingAssociationMember, FarmingSiteFarmer.
- **Localization**: TranslationOverride.
- **Prisma Metadata**: _prisma_migrations.

## Key Relationships

| Parent key | Foreign key | Relationship | Required? | On delete |
| --- | --- | --- | --- | --- |
| Barangay.id | Address.barangayId | one-to-many | Optional | RESTRICT |
| User.id | Address.userId | one-to-many | Required | CASCADE |
| Barangay.id | AgriculturalSaleRecord.barangayId | one-to-many | Optional | RESTRICT |
| Crop.id | AgriculturalSaleRecord.cropId | one-to-many | Required | RESTRICT |
| UrbanFarmer.id | AgriculturalSaleRecord.farmerId | one-to-many | Optional | SET NULL |
| FarmingSite.id | AgriculturalSaleRecord.siteId | one-to-many | Optional | SET NULL |
| AgriculturalDataSource.id | AgriculturalSaleRecord.sourceId | one-to-many | Optional | SET NULL |
| Barangay.id | AgriculturalStatistic.barangayId | one-to-many | Optional | RESTRICT |
| Crop.id | AgriculturalStatistic.cropId | one-to-many | Optional | RESTRICT |
| FarmingSite.id | AgriculturalStatistic.siteId | one-to-many | Optional | SET NULL |
| AgriculturalDataSource.id | AgriculturalStatistic.sourceId | one-to-many | Optional | SET NULL |
| User.id | AuditLog.actorId | one-to-many | Optional | SET NULL |
| User.id | Cart.userId | one-to-one | Required | CASCADE |
| Cart.id | CartItem.cartId | one-to-many | Required | CASCADE |
| ProductVariant.id | CartItem.variantId | one-to-many | Required | RESTRICT |
| Category.id | Category.parentId | one-to-many | Optional | SET NULL |
| AgriculturalDataSource.id | Crop.sourceId | one-to-many | Optional | SET NULL |
| Barangay.id | CropAvailabilityObservation.barangayId | one-to-many | Optional | RESTRICT |
| Crop.id | CropAvailabilityObservation.cropId | one-to-many | Required | RESTRICT |
| FarmingSite.id | CropAvailabilityObservation.siteId | one-to-many | Optional | SET NULL |
| AgriculturalDataSource.id | CropAvailabilityObservation.sourceId | one-to-many | Optional | SET NULL |
| Crop.id | CultivationRecord.cropId | one-to-many | Required | RESTRICT |
| UrbanFarmer.id | CultivationRecord.farmerId | one-to-many | Optional | SET NULL |
| FarmingSite.id | CultivationRecord.siteId | one-to-many | Required | RESTRICT |
| AgriculturalDataSource.id | CultivationRecord.sourceId | one-to-many | Optional | SET NULL |
| Barangay.id | FarmingAssociation.barangayId | one-to-many | Optional | RESTRICT |
| AgriculturalDataSource.id | FarmingAssociation.sourceId | one-to-many | Optional | SET NULL |
| FarmingAssociation.id | FarmingAssociationMember.associationId | one-to-many | Required | CASCADE |
| UrbanFarmer.id | FarmingAssociationMember.farmerId | one-to-many | Required | CASCADE |
| FarmingAssociation.id | FarmingSite.associationId | one-to-many | Optional | SET NULL |
| Barangay.id | FarmingSite.barangayId | one-to-many | Required | RESTRICT |
| AgriculturalDataSource.id | FarmingSite.sourceId | one-to-many | Optional | SET NULL |
| UrbanFarmer.id | FarmingSiteFarmer.farmerId | one-to-many | Required | CASCADE |
| FarmingSite.id | FarmingSiteFarmer.siteId | one-to-many | Required | CASCADE |
| Order.id | FinancialTransaction.orderId | one-to-many | Optional | SET NULL |
| SellerOrder.id | FinancialTransaction.sellerOrderId | one-to-many | Optional | SET NULL |
| Store.id | FinancialTransaction.storeId | one-to-many | Required | RESTRICT |
| User.id | Fulfillment.riderId | one-to-many | Optional | SET NULL |
| SellerOrder.id | Fulfillment.sellerOrderId | one-to-one | Required | CASCADE |
| Crop.id | HarvestRecord.cropId | one-to-many | Required | RESTRICT |
| CultivationRecord.id | HarvestRecord.cultivationId | one-to-many | Optional | SET NULL |
| UrbanFarmer.id | HarvestRecord.farmerId | one-to-many | Optional | SET NULL |
| FarmingSite.id | HarvestRecord.siteId | one-to-many | Required | RESTRICT |
| AgriculturalDataSource.id | HarvestRecord.sourceId | one-to-many | Optional | SET NULL |
| User.id | InventoryLedger.changedById | one-to-many | Optional | SET NULL |
| ProductVariant.id | InventoryLedger.variantId | one-to-many | Required | CASCADE |
| Barangay.id | MarketPriceObservation.barangayId | one-to-many | Optional | RESTRICT |
| Crop.id | MarketPriceObservation.cropId | one-to-many | Required | RESTRICT |
| AgriculturalDataSource.id | MarketPriceObservation.sourceId | one-to-many | Optional | SET NULL |
| User.id | Notification.userId | one-to-many | Required | CASCADE |
| User.id | Order.buyerId | one-to-many | Required | RESTRICT |
| Address.id, userId | Order.shippingAddressId, buyerId | one-to-many | Required | RESTRICT |
| Order.id | OrderItem.orderId | one-to-many | Required | CASCADE |
| SellerOrder.id, storeId | OrderItem.sellerOrderId, storeId | one-to-many | Required | CASCADE |
| ProductVariant.id, storeId | OrderItem.variantId, storeId | one-to-many | Required | RESTRICT |
| Order.id | Payment.orderId | one-to-many | Required | CASCADE |
| Store.id | Product.storeId | one-to-many | Required | RESTRICT |
| Category.id | ProductCategory.categoryId | one-to-many | Required | CASCADE |
| Product.id | ProductCategory.productId | one-to-many | Required | CASCADE |
| Product.id | ProductImage.productId | one-to-many | Required | CASCADE |
| Product.id, storeId | ProductVariant.productId, storeId | one-to-many | Required | CASCADE |
| Store.id | ProductVariant.storeId | one-to-many | Required | RESTRICT |
| User.id | RefreshToken.userId | one-to-many | Required | CASCADE |
| Product.id | Review.productId | one-to-many | Required | CASCADE |
| User.id | Review.userId | one-to-many | Required | CASCADE |
| Barangay.id | SeasonalCropCalendar.barangayId | one-to-many | Optional | RESTRICT |
| Crop.id | SeasonalCropCalendar.cropId | one-to-many | Required | RESTRICT |
| FarmingSite.id | SeasonalCropCalendar.siteId | one-to-many | Optional | SET NULL |
| AgriculturalDataSource.id | SeasonalCropCalendar.sourceId | one-to-many | Optional | SET NULL |
| Order.id | SellerOrder.orderId | one-to-many | Required | CASCADE |
| Store.id | SellerOrder.storeId | one-to-many | Required | RESTRICT |
| User.id | SellerProfile.userId | one-to-one | Required | CASCADE |
| SellerProfile.id | Store.sellerProfileId | one-to-many | Required | RESTRICT |
| CommissionPlan.id | StoreCommission.commissionPlanId | one-to-many | Required | RESTRICT |
| Store.id | StoreCommission.storeId | one-to-many | Required | CASCADE |
| Barangay.id | StoreServiceArea.barangayId | one-to-many | Required | RESTRICT |
| Store.id | StoreServiceArea.storeId | one-to-many | Required | CASCADE |
| Barangay.id | SupplyReport.barangayId | one-to-many | Optional | RESTRICT |
| Crop.id | SupplyReport.cropId | one-to-many | Required | RESTRICT |
| AgriculturalDataSource.id | SupplyReport.sourceId | one-to-many | Optional | SET NULL |
| Barangay.id | UrbanFarmer.barangayId | one-to-many | Required | RESTRICT |
| AgriculturalDataSource.id | UrbanFarmer.sourceId | one-to-many | Optional | SET NULL |

## Possible Relationship Issues

- Possible relationship columns without declared foreign keys: AgriculturalSaleRecord.externalRecordId, AgriculturalStatistic.externalRecordId, AuditLog.entityId, Crop.externalRecordId, CropAvailabilityObservation.externalRecordId, CultivationRecord.externalRecordId, FarmingAssociation.externalRecordId, FarmingSite.externalRecordId, HarvestRecord.externalRecordId, InventoryLedger.referenceId, MarketPriceObservation.externalRecordId, SeasonalCropCalendar.externalRecordId, SupplyReport.externalRecordId, TranslationOverride.updatedById, UrbanFarmer.externalRecordId.
- Every inspected table has a declared primary key.
- `_prisma_migrations` is included as an actual database table, but it is Prisma metadata rather than a business-domain table.
