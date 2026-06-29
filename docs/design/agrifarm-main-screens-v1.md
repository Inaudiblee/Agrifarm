# AgriFarm Main Screens v1

Purpose: define the main AgriFarm product screens before building high-fidelity Figma pages.

Each screen should be assembled from the design system and illustration asset library. Avoid drawing one-off UI unless a reusable component is missing.

## 1. Landing Page

Goal:

- Introduce AgriFarm as a Pasig City urban farming marketplace and seasonal forecasting platform.
- Help visitors immediately understand that they can buy local produce, discover farmers, view Pasig coverage, and use forecast-driven crop guidance.

Main user action:

- Choose a path: `Buy fresh produce`, `Start selling`, or `Explore Pasig farmers`.

Sections needed:

- Header with brand, language toggle, login/register.
- Hero with short value proposition and farmer/buyer illustration.
- Live marketplace preview.
- Farmer map preview.
- Seasonal forecast preview.
- Recipe/meal idea preview.
- How AgriFarm works.
- Trust and safety section.
- Footer.

Reusable components used:

- Top Navigation
- Button
- Badge
- Product Card
- Farmer Card
- Forecast Summary Card
- Map Preview Card
- Recipe Card
- Empty/Loading State

Assets needed:

- `agrifarm-farmer-female-standing.png`
- `agrifarm-buyer-parent.png`
- `agrifarm-basket-full.svg`
- `agrifarm-market-stall-green.svg`
- `agrifarm-pasig-barangay-pin.svg`
- `agrifarm-forecast-demand-rising.svg`
- vegetable icons

## 2. Start the Journey Page

Goal:

- Guide first-time users into the correct path without confusion.
- Support non-technical users, older adults, kids, farmers, and buyers with plain-language role choices.

Main user action:

- Select `I want to buy`, `I want to sell`, or `I want to learn/forecast`.

Sections needed:

- Simple welcome header.
- Role selection cards.
- Language selector.
- Simple mode option.
- Short benefit list per role.
- Help/contact prompt.

Reusable components used:

- Role Card
- Button
- Language Toggle
- Empty State Illustration Block
- Step Indicator
- Badge

Assets needed:

- `agrifarm-buyer-parent.png`
- `agrifarm-farmer-male-standing.png`
- `agrifarm-admin-planner.png`
- `agrifarm-sign-pasig-grown.svg`
- `agrifarm-plant-seedling.svg`

## 3. Explore Farmers

Goal:

- Let buyers discover local farmers and stores serving Pasig barangays.
- Build trust through farmer identity, service area, available products, and verification cues.

Main user action:

- Search/filter farmers, then open a farmer profile.

Sections needed:

- Header/navigation.
- Search field.
- Barangay filter.
- Farmer grid/list.
- Featured farmers.
- Service area chips.
- Empty state for no farmers in selected barangay.

Reusable components used:

- Search Field
- Barangay Selector
- Farmer Card
- Badge
- Chip
- Button
- Empty State
- Loading Skeleton

Assets needed:

- farmer character assets
- `agrifarm-pasig-barangay-pin.svg`
- `agrifarm-house-storefront.svg`
- `agrifarm-market-stall-green.svg`
- `agrifarm-tree-small.svg`

## 4. Maria's Garden / Farmer Profile

Goal:

- Present a single farmer/store profile with personality, trust, service coverage, and products.
- Make buying from a specific farmer feel direct and safe.

Main user action:

- Add a product from Maria's Garden to basket or follow/contact the farmer.

Sections needed:

- Farmer profile hero.
- Farmer avatar/illustration.
- Store details and verification.
- Barangays served.
- Product list.
- Seasonal availability.
- Farmer story.
- Reviews or trust notes.
- Related farmers/products.

Reusable components used:

- Farmer Store Header
- Farmer Card
- Product Card
- Product Row
- Badge
- Chip
- Button
- Map Preview Card
- Review/Trust Card

Assets needed:

- `agrifarm-farmer-female-standing.png`
- `agrifarm-rooftop-garden-small.svg`
- `agrifarm-basket-full.svg`
- vegetable icons
- `agrifarm-pasig-barangay-pin.svg`
- `agrifarm-sign-fresh-today.svg`

## 5. Explore Pasig Map

Goal:

- Let users visually explore barangays, farmer coverage, delivery areas, and marketplace availability.
- Make AgriFarm feel local and civic, not generic.

Main user action:

- Select a barangay to see farmers, products, and delivery availability.

Sections needed:

- Map toolbar.
- Barangay map canvas.
- Map legend.
- Barangay details drawer/card.
- Farmer/product list for selected area.
- Forecast overlay toggle.
- Empty state for uncovered barangay.

Reusable components used:

- Map Canvas
- Barangay Pin
- Filter Toggle
- Badge
- Farmer Card
- Product Row
- Forecast Chip
- Empty State

Assets needed:

- `agrifarm-pasig-map-tile.svg`
- `agrifarm-pasig-river-piece.svg`
- road pieces
- `agrifarm-pasig-barangay-pin.svg`
- houses
- trees
- rooftop gardens
- market stalls

## 6. Marketplace

Goal:

- Help buyers browse, search, compare, and add local produce to basket.
- Keep the experience simple enough for non-technical users.

Main user action:

- Add product to basket.

Sections needed:

- Marketplace header.
- Search field.
- Category filters.
- Barangay/location filter.
- Product grid/list.
- Basket summary.
- Sort/filter controls.
- Loading and empty states.

Reusable components used:

- Search Field
- Category Tile
- Product Card
- Price Badge
- Stock Badge
- Add to Basket Control
- Cart Summary
- Button
- Loading Skeleton
- Empty State

Assets needed:

- vegetable icons
- `agrifarm-basket-empty.svg`
- `agrifarm-basket-full.svg`
- `agrifarm-crate-vegetables.svg`
- `agrifarm-weighing-scale.svg`
- `agrifarm-market-table.svg`

## 7. Product Details

Goal:

- Explain one product clearly: price, unit, stock, farm source, delivery area, freshness, and recipe/forecast context.

Main user action:

- Choose quantity and add to basket.

Sections needed:

- Product image/illustration area.
- Product title, price, unit, stock.
- Farmer/store source.
- Quantity selector.
- Add to basket action.
- Delivery/service area.
- Product description.
- Suggested recipes.
- Forecast/seasonal note.
- Related products.

Reusable components used:

- Product Hero
- Quantity Stepper
- Button
- Price Badge
- Stock Badge
- Farmer Store Card
- Recipe Card
- Forecast Summary Card
- Related Product Card

Assets needed:

- crop-specific vegetable icon or product image
- `agrifarm-weighing-scale.svg`
- `agrifarm-basket-full.svg`
- `agrifarm-farmer-female-standing.png`
- forecast icons
- recipe food illustrations

## 8. Recipes

Goal:

- Help buyers turn available marketplace products into simple meal ideas.
- Encourage purchases based on ingredients currently available from local farmers.

Main user action:

- Open a recipe and find/buy available ingredients.

Sections needed:

- Recipe search.
- Available ingredients filter.
- Recipe cards.
- Ingredient availability status.
- Estimated ingredient price.
- Recipe detail drawer/page.
- Add all available ingredients action.
- Empty state when ingredients are missing.

Reusable components used:

- Search Field
- Recipe Card
- Ingredient Chip
- Price Badge
- Product Link Row
- Button
- Empty State
- Loading Skeleton

Assets needed:

- `agrifarm-recipe-ginisang-pechay.png`
- `agrifarm-recipe-pinakbet.png`
- `agrifarm-recipe-tortang-talong.png`
- `agrifarm-recipe-vegetable-medley.png`
- vegetable icons
- `agrifarm-basket-full.svg`

## 9. Forecast

Goal:

- Translate SARIMA-based seasonal forecasting into practical decisions for farmers, buyers, and admins.
- Show demand, supply risk, seasonal guidance, and recommended action in plain language.

Main user action:

- Review forecast recommendation and act: plant, harvest, stock up, promote, or monitor.

Sections needed:

- Forecast overview header.
- Crop selector.
- Barangay/market selector.
- Demand forecast card.
- Supply forecast card.
- Confidence indicator.
- Seasonal recommendation cards.
- Risk alerts.
- Data/chart area.
- Plain-language explanation panel.

Reusable components used:

- Forecast KPI
- Forecast Summary Card
- Season Chip
- Forecast Trend Card
- Confidence Badge
- Risk Alert
- Chart Frame
- Recommended Action Card
- Filter Select

Assets needed:

- `agrifarm-forecast-chart-line.svg`
- `agrifarm-forecast-chart-bars.svg`
- `agrifarm-forecast-confidence-band.svg`
- `agrifarm-forecast-demand-rising.svg`
- `agrifarm-forecast-supply-risk.svg`
- `agrifarm-forecast-good-time-plant.svg`
- `agrifarm-forecast-good-time-harvest.svg`
- weather/cloud assets
- seedling/harvest basket assets

## 10. Login / Register

Goal:

- Let users enter AgriFarm safely and choose the correct role.
- Keep account creation simple, friendly, and understandable.

Main user action:

- Log in or create an account as buyer, seller/farmer, or admin where allowed.

Sections needed:

- Brand header.
- Language toggle.
- Login form.
- Register form.
- Role selector.
- Password helper/error states.
- Trust/safety note.
- Back to landing link.

Reusable components used:

- Auth Card
- Text Field
- Password Field
- Role Card
- Button
- Alert
- Language Toggle
- Loading State

Assets needed:

- `agrifarm-sign-pasig-grown.svg`
- `agrifarm-farmer-male-standing.png`
- `agrifarm-buyer-parent.png`
- `agrifarm-plant-seedling.svg`
- `agrifarm-basket-full.svg`

## Cross-Screen Navigation Model

Primary public navigation:

- Home
- Farmers
- Map
- Marketplace
- Recipes
- Forecast

Authenticated buyer navigation:

- Overview
- Marketplace
- Basket
- Orders
- Recipes

Authenticated seller navigation:

- Overview
- Products
- Orders
- Forecast
- Service Areas
- Profile

Admin/forecast navigation:

- Overview
- Forecast
- Crops
- Barangays
- Sellers
- Reports

## Mobile Rules For All Screens

- Use bottom navigation for primary buyer actions.
- Use large vertical cards for Start the Journey.
- Keep filters inside a bottom sheet or collapsible area.
- Product cards may become product rows on dense marketplace screens.
- Forecast charts should summarize first, then reveal details.
- Never make users pinch/zoom to read a map; selected barangay details should appear in a drawer/card.

## Component Gaps To Add Before High-Fidelity Screens

- Role Card
- Farmer Card
- Recipe Card
- Map Canvas
- Barangay Details Card
- Quantity Stepper
- Forecast KPI
- Forecast Chart Frame
- Recommended Action Card
- Auth Card

