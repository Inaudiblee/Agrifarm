# AgriFarm Illustration Asset Library v1

Purpose: define the reusable illustration asset set for AgriFarm before screen design expands.

All assets should be created as separate Figma components and exported as individual files. These are not poster scenes. They are modular building blocks for marketplace, forecasting, onboarding, maps, empty states, recipe suggestions, and simple-mode screens.

## Asset Style Rules

- Cartoon style, friendly but professional.
- Clean vector shapes with simple highlights and soft shadows.
- Consistent stroke weight: 2px for small icons, 3px for larger scene pieces.
- Rounded geometry, no sharp decorative clutter.
- No baked-in text unless the asset is specifically a sign template.
- Default export format is SVG for scalable UI assets.
- Use PNG only for rich character art, textured scene art, or detailed food illustrations.
- Every interactive asset should have a named default, hover, active, and disabled state when relevant.

## Recommended Figma Structure

Page: `05 Illustration Assets`

Sections:

- `Characters`
- `Vegetables`
- `Baskets and Market Objects`
- `Homes and Rooftop Gardens`
- `Market Stalls`
- `Pasig Map Pieces`
- `Nature and Weather`
- `Animals`
- `Signs`
- `Recipe Food`
- `Forecast and Data Visuals`

Naming format:

`asset/[category]/[asset-name]`

Export filename format:

`agrifarm-[category]-[asset-name].[svg|png]`

## Asset Inventory

| File name | Purpose | Format | Hover / active animation idea | Used in |
|---|---|---|---|---|
| `agrifarm-farmer-female-standing.png` | Main friendly farmer character for onboarding and seller identity. | PNG | Hover: small wave. Active: slight bounce. | Seller onboarding, farmer cards, empty states |
| `agrifarm-farmer-male-standing.png` | Alternate farmer character for seller identity. | PNG | Hover: hat tilt. Active: bounce. | Seller dashboard, profile setup |
| `agrifarm-farmer-senior.png` | Senior farmer representation for inclusivity. | PNG | Hover: gentle hand raise. Active: warm glow behind character. | Community screens, training/simple mode |
| `agrifarm-buyer-parent.png` | Adult buyer character. | PNG | Hover: basket lifts slightly. Active: checkmark pop. | Buyer marketplace, checkout |
| `agrifarm-buyer-child.png` | Child/family-friendly buyer support character. | PNG | Hover: smile sparkle. Active: small hop. | Family-oriented empty states |
| `agrifarm-delivery-helper.png` | Delivery assistant with produce bag. | PNG | Hover: wheels/feet nudge forward. Active: route line appears. | Order tracking, delivery status |
| `agrifarm-admin-planner.png` | Civic/admin planner character for forecast/admin screens. | PNG | Hover: chart card lifts. Active: data dot pulses. | Forecast dashboard, admin insights |
| `agrifarm-vegetable-tomato.svg` | Tomato crop icon. | SVG | Hover: leaf wiggle. Active: tiny scale-up. | Product cards, categories, recipes |
| `agrifarm-vegetable-pechay.svg` | Pechay leafy vegetable icon. | SVG | Hover: leaves sway. Active: water droplet pop. | Product cards, leafy greens category |
| `agrifarm-vegetable-eggplant.svg` | Eggplant crop icon. | SVG | Hover: highlight shimmer. Active: bounce. | Product cards, recipe suggestions |
| `agrifarm-vegetable-kangkong.svg` | Water spinach/leafy greens icon. | SVG | Hover: leaf sway. Active: checkmark badge. | Crop categories, forecast recommendations |
| `agrifarm-vegetable-sitaw.svg` | String beans icon. | SVG | Hover: bean curve wiggle. Active: scale pulse. | Crop categories, recipes |
| `agrifarm-vegetable-okra.svg` | Okra icon. | SVG | Hover: rotate 4 degrees. Active: pop. | Product listing, recipe food |
| `agrifarm-vegetable-calamansi.svg` | Calamansi/citrus produce icon. | SVG | Hover: small shine. Active: scent lines appear. | Product listings, recipe add-ons |
| `agrifarm-vegetable-root-crop.svg` | Root crop category icon. | SVG | Hover: soil crumb lift. Active: harvest pull motion. | Categories, seasonal forecast |
| `agrifarm-basket-empty.svg` | Empty basket for cart empty state. | SVG | Hover: basket rocks gently. Active: opens lid/handle. | Empty basket, buyer onboarding |
| `agrifarm-basket-full.svg` | Full harvest basket for success and marketplace. | SVG | Hover: produce bob. Active: checkmark appears. | Cart, order success, homepage |
| `agrifarm-crate-vegetables.svg` | Farm crate with mixed produce. | SVG | Hover: crate lifts. Active: inventory count badge appears. | Seller inventory, stock cards |
| `agrifarm-weighing-scale.svg` | Weighing scale for units and pricing. | SVG | Hover: needle moves. Active: weight badge drops in. | Product variant forms, stock rows |
| `agrifarm-delivery-bag.svg` | Delivery bag for order logistics. | SVG | Hover: handle sway. Active: route line draws. | Delivery status, checkout |
| `agrifarm-house-barangay.svg` | Simple barangay house. | SVG | Hover: window light turns on. Active: location pin pops. | Pasig map, farmer service areas |
| `agrifarm-house-storefront.svg` | Small seller storefront. | SVG | Hover: awning wiggle. Active: open sign flips. | Store cards, marketplace map |
| `agrifarm-rooftop-garden-small.svg` | Small rooftop garden module. | SVG | Hover: plants sway. Active: watering sparkle. | Urban farming intro, map pieces |
| `agrifarm-rooftop-garden-large.svg` | Larger rooftop garden scene piece. | SVG | Hover: cloud shadow moves. Active: harvest badge appears. | Landing/supporting screens |
| `agrifarm-planter-box.svg` | Modular planter box. | SVG | Hover: leaves wiggle. Active: seedling grows slightly. | Simple-mode education, dashboards |
| `agrifarm-market-stall-green.svg` | Primary green market stall. | SVG | Hover: awning lift. Active: product cards slide in. | Marketplace entry, seller cards |
| `agrifarm-market-stall-yellow.svg` | Harvest/yellow stall variant. | SVG | Hover: light sparkle. Active: price tag bounce. | Promo states, featured produce |
| `agrifarm-market-table.svg` | Table display for vegetables. | SVG | Hover: produce bob. Active: sold badge appears. | Product grouping, browse screens |
| `agrifarm-pasig-map-tile.svg` | Generic Pasig map tile. | SVG | Hover: outline brightens. Active: tile raises. | Barangay map, coverage selector |
| `agrifarm-pasig-barangay-pin.svg` | Barangay location pin. | SVG | Hover: pulse ring. Active: pin drops. | Service areas, map filters |
| `agrifarm-pasig-river-piece.svg` | Pasig river modular map piece. | SVG | Hover: subtle wave motion. Active: route highlight follows. | Map background, local identity |
| `agrifarm-road-straight.svg` | Straight road segment. | SVG | Hover: route line glow. Active: delivery dot moves. | Map pieces, order tracking |
| `agrifarm-road-curve.svg` | Curved road segment. | SVG | Hover: route line glow. Active: delivery dot follows curve. | Map pieces |
| `agrifarm-road-intersection.svg` | Intersection road piece. | SVG | Hover: selected route glow. Active: pin appears. | Barangay map assembly |
| `agrifarm-tree-mango.svg` | Fruit tree. | SVG | Hover: leaves sway. Active: fruit drop bounce. | Map, rooftop garden, empty states |
| `agrifarm-tree-small.svg` | Small urban tree. | SVG | Hover: leaf sway. Active: soft shadow pulse. | Map decoration |
| `agrifarm-plant-seedling.svg` | Seedling icon. | SVG | Hover: sprout grows 4px. Active: water droplet appears. | Forecast recommendations, onboarding |
| `agrifarm-plant-potted.svg` | Potted plant. | SVG | Hover: leaf wiggle. Active: checkmark grows. | Simple mode, garden education |
| `agrifarm-cloud-sunny.svg` | Sunny weather asset. | SVG | Hover: sun rays rotate slightly. Active: warm glow. | Forecast dashboard |
| `agrifarm-cloud-rain.svg` | Rainy weather asset. | SVG | Hover: rain drops loop. Active: puddle appears. | Seasonal forecast |
| `agrifarm-cloud-overcast.svg` | Cloudy weather asset. | SVG | Hover: cloud drifts. Active: forecast badge appears. | Forecast cards |
| `agrifarm-bird-small.svg` | Small bird decoration. | SVG | Hover: wing flap. Active: short flight path. | Rooftop garden scenes |
| `agrifarm-birds-group.svg` | Bird group for open-air scene. | SVG | Hover: slight formation drift. Active: fade-in motion. | Landing scene, map atmosphere |
| `agrifarm-cat-sitting.svg` | Friendly cat for neighborhood warmth. | SVG | Hover: tail swish. Active: blink. | Empty states, rooftop garden |
| `agrifarm-dog-walking.svg` | Friendly dog for barangay/community scenes. | SVG | Hover: tail wag. Active: step forward. | Map, onboarding illustration |
| `agrifarm-sign-fresh-today.svg` | Signboard for fresh listings. | SVG | Hover: sign swings. Active: shine line. | Marketplace hero, product lists |
| `agrifarm-sign-low-stock.svg` | Warning sign for low inventory. | SVG | Hover: warning pulse. Active: badge shake once. | Seller dashboard, forecast alerts |
| `agrifarm-sign-pasig-grown.svg` | Local identity sign. | SVG | Hover: pin pulse. Active: underline draw. | Landing, farmer profiles |
| `agrifarm-sign-forecast.svg` | Forecast insight sign. | SVG | Hover: chart line animates. Active: info badge opens. | Forecast dashboard |
| `agrifarm-recipe-ginisang-pechay.png` | Food illustration for pechay recipe suggestion. | PNG | Hover: steam rises. Active: ingredient badges pop. | Recipe cards, meal recommendations |
| `agrifarm-recipe-pinakbet.png` | Pinakbet-style mixed vegetable recipe. | PNG | Hover: steam loop. Active: crop icons appear around dish. | Recipe recommendations |
| `agrifarm-recipe-tortang-talong.png` | Eggplant recipe illustration. | PNG | Hover: plate shine. Active: ingredient checkmarks. | Recipe cards |
| `agrifarm-recipe-vegetable-medley.png` | General mixed vegetable meal. | PNG | Hover: steam rise. Active: basket-to-plate transition. | Meal suggestions |
| `agrifarm-forecast-chart-line.svg` | Friendly line chart element. | SVG | Hover: data point tooltip appears. Active: line draws left to right. | Forecast dashboard, admin |
| `agrifarm-forecast-chart-bars.svg` | Demand/supply bar chart. | SVG | Hover: bars grow slightly. Active: selected bar highlights. | Forecast cards |
| `agrifarm-forecast-confidence-band.svg` | Forecast uncertainty band. | SVG | Hover: band opacity increases. Active: confidence label appears. | SARIMA charts |
| `agrifarm-forecast-demand-rising.svg` | Rising demand symbol. | SVG | Hover: arrow lifts. Active: pulse on final data point. | Forecast summary |
| `agrifarm-forecast-supply-risk.svg` | Supply risk data icon. | SVG | Hover: alert ring pulse. Active: warning card expands. | Admin/seller alerts |
| `agrifarm-forecast-good-time-plant.svg` | Planting recommendation icon. | SVG | Hover: seedling grows. Active: calendar check appears. | Farmer guidance |
| `agrifarm-forecast-good-time-harvest.svg` | Harvest recommendation icon. | SVG | Hover: basket fills. Active: checkmark pop. | Seller dashboard |

## Generated Polished PNG Components

These assets were generated as separate transparent PNGs, uploaded to the Figma file, and wrapped as reusable components on `05 Illustration Assets`.

| Figma component | File name | Purpose | Format | Hover / active animation idea | Used in |
|---|---|---|---|---|---|
| `Generated/Farmer Watering` | `agrifarm-generated-farmer-watering.png` | Hero and story character showing urban rooftop farming in action. | PNG | Hover: watering can tilts and leaf sparkle appears. Active: quick water-drop pop. | Landing hero, Start the Journey, farmer profile |
| `Generated/Harvest Basket` | `agrifarm-generated-harvest-basket.png` | Rich marketplace produce asset for fresh harvest emphasis. | PNG | Hover: produce lifts subtly. Active: check badge appears. | Marketplace, product cards, order success |
| `Generated/Market Stall` | `agrifarm-generated-market-stall.png` | Reusable stall scene for local selling and browsing. | PNG | Hover: awning bounce and price tag wiggle. Active: product cards slide in. | Marketplace, Explore Farmers, seller dashboard |
| `Generated/Rooftop Garden` | `agrifarm-generated-rooftop-garden.png` | Modular rooftop garden scene matching Pasig urban farming identity. | PNG | Hover: leaves sway and cloud drifts. Active: small harvest badge appears. | Landing hero, Start the Journey, Explore Pasig |
| `Generated/Recipe Dish` | `agrifarm-generated-recipe-dish.png` | Food illustration for recipe discovery and meal recommendations. | PNG | Hover: steam rises. Active: ingredient checkmarks pop. | Recipes, product details, meal suggestions |
| `Generated/Forecast Tablet` | `agrifarm-generated-forecast-tablet.png` | Friendly SARIMA/data visual for smart forecast screens. | PNG | Hover: chart line draws. Active: forecast confidence badge pulses. | Forecast, seller planning, admin insights |
| `Generated/Woman Farmer Basket` | `agrifarm-generated-woman-farmer-basket.png` | Friendly farmer character for profile previews and guided onboarding. | PNG | Hover: basket lift and leaf sparkle. Active: gentle bounce. | Farmer profile, Today's Farmer, Explore Farmers |
| `Generated/Delivery Rider` | `agrifarm-generated-delivery-rider.png` | Delivery and logistics visual for marketplace fulfillment. | PNG | Hover: wheel roll and crate bounce. Active: route line appears. | Order tracking, delivery card, success states |
| `Generated/Barangay Officer` | `agrifarm-generated-barangay-officer.png` | Community verification and local support character. | PNG | Hover: clipboard check mark appears. Active: trust badge pulse. | Verified farmer, barangay support, account trust |
| `Generated/Pasig Map Piece` | `agrifarm-generated-pasig-map-piece.png` | Friendly map module showing Pasig river, roads, gardens, houses, and pins. | PNG | Hover: pin pulse and route line draw. Active: selected map tile lift. | Explore Pasig Map, farmer location, pickup points |
| `Generated/Empty Seedling Box` | `agrifarm-generated-empty-seedling-box.png` | Warm empty state for no products, no orders, or no harvest yet. | PNG | Hover: seedling grows one small leaf. Active: helpful CTA glow. | Marketplace empty state, orders, farmer inventory |
| `Generated/Success Harvest Basket` | `agrifarm-generated-success-harvest-basket.png` | Positive completion state for uploads, orders, reviews, and forecast generation. | PNG | Hover: green check pop. Active: tiny confetti leaves. | Order completed, product listed, forecast generated |

## Generated SVG Components

These editable SVG components were created in the Figma file on `05 Illustration Assets`.

Batch 3 created 16 core SVG components:

- `asset/animal/community-pet`
- `asset/forecast/confidence-band`
- `asset/forecast/demand-rising`
- `asset/map/barangay-pin`
- `asset/map/river-piece`
- `asset/map/road-straight`
- `asset/market/basket-empty`
- `asset/market/crate-vegetables`
- `asset/market/weighing-scale`
- `asset/nature/seedling`
- `asset/sign/fresh-today`
- `asset/vegetable/eggplant`
- `asset/vegetable/pechay`
- `asset/vegetable/tomato`
- `asset/weather/rainy`
- `asset/weather/sunny`

Batch 4 created 16 extended SVG components:

- `asset/forecast/good-time-harvest`
- `asset/forecast/good-time-plant`
- `asset/forecast/supply-risk`
- `asset/house/barangay-house`
- `asset/house/storefront`
- `asset/map/map-tile`
- `asset/map/road-curve`
- `asset/map/road-intersection`
- `asset/plant/potted-plant`
- `asset/tree/small-tree`
- `asset/vegetable/calamansi`
- `asset/vegetable/kangkong`
- `asset/vegetable/okra`
- `asset/vegetable/root-crop`
- `asset/vegetable/sitaw`
- `asset/weather/cloudy`

## Generated PNG Components - Batch 5 Characters

These Batch 5 character PNGs were generated, uploaded, and wrapped as reusable `Generated/*` components on `05 Illustration Assets`.

| Figma component | File name | Purpose | Format | Hover / active animation idea | Used in |
|---|---|---|---|---|---|
| `Generated/Senior Farmer` | `agrifarm-generated-senior-farmer.png` | Inclusive senior farmer character for community, training, and simple-mode flows. | PNG | Hover: gentle hand raise and basket lift. | Onboarding, community stories, farmer cards, simple mode |
| `Generated/Male Farmer` | `agrifarm-generated-male-farmer.png` | Young farmer character holding fresh leafy vegetables. | PNG | Hover: leaves sway and subtle body bounce. | Explore Farmers, farmer profile, Today's Farmer |
| `Generated/Buyer Parent` | `agrifarm-generated-buyer-parent.png` | Adult buyer character for marketplace and checkout trust. | PNG | Hover: market tote lifts slightly. | Marketplace, checkout, buyer onboarding |
| `Generated/Buyer Child` | `agrifarm-generated-buyer-child.png` | Friendly child character for family-friendly states and education. | PNG | Hover: tomato pop and small smile sparkle. | Recipes, family empty states, onboarding |
| `Generated/Market Vendor` | `agrifarm-generated-market-vendor.png` | Seller/vendor character beside produce crate. | PNG | Hover: crate bounce and price tag pulse. | Marketplace, seller dashboard, vendor cards |
| `Generated/Admin Planner` | `agrifarm-generated-admin-planner.png` | Forecast/admin planner character holding a tablet chart. | PNG | Hover: chart line draw and data dot pulse. | Forecast dashboard, admin insights, SARIMA explainers |

## Generated PNG Assets - Batch 6 Ready for Figma Upload

These Batch 6 recipe and empty-state PNGs were generated as separate transparent local files and uploaded to the Jessica Valente Figma file as reusable `Generated/*` components.

| Figma component | File name | Purpose | Format | Hover / active animation idea | Used in |
|---|---|---|---|---|---|
| `Generated/Recipe Ginisang Pechay` | `agrifarm-generated-recipe-ginisang-pechay.png` | Recipe illustration for pechay-based meal suggestions. | PNG | Hover: light steam rise. Active: ingredient badges pop. | Recipes, product details, pechay product cards |
| `Generated/Recipe Pinakbet` | `agrifarm-generated-recipe-pinakbet.png` | Mixed local vegetable dish for Filipino recipe recommendations. | PNG | Hover: steam loop. Active: crop icons appear around dish. | Recipes, marketplace recipe pairing |
| `Generated/Recipe Tortang Talong` | `agrifarm-generated-recipe-tortang-talong.png` | Eggplant recipe illustration for talong recipe cards. | PNG | Hover: plate shine. Active: ingredient checkmarks. | Recipes, product details, meal suggestions |
| `Generated/Recipe Vegetable Medley` | `agrifarm-generated-recipe-vegetable-medley.png` | General vegetable meal illustration for broad recipe states. | PNG | Hover: steam rise. Active: basket-to-plate transition. | Recipes, meal recommendations, empty recipe modules |
| `Generated/No Products Empty State` | `agrifarm-generated-no-products-empty-state.png` | Friendly marketplace empty state with seedling basket. | PNG | Hover: seedling grows. Active: helpful CTA glow. | Marketplace empty state, seller inventory, no harvest yet |
| `Generated/No Forecast Empty State` | `agrifarm-generated-no-forecast-empty-state.png` | Friendly no-data forecast state with tablet, chart, magnifier, and sprout. | PNG | Hover: magnifier scan. Active: chart sparkline appears. | Forecast empty state, SARIMA loading/error recovery |

## Generated SVG Assets - Batch 7 Ready for Figma Upload

These Batch 7 Pasig map pieces were created as local SVG source files and added to the Figma file as editable `asset/map/*` components.

| Figma component | File name | Purpose | Format | Hover / active animation idea | Used in |
|---|---|---|---|---|---|
| `asset/map/pasig-river-bend` | `agrifarm-map-pasig-river-bend.svg` | Curved Pasig River segment for assembling local map scenes. | SVG | Hover: subtle wave highlight. Active: route glow follows the bend. | Explore Pasig Map, landing background, barangay coverage map |
| `asset/map/barangay-cluster` | `agrifarm-map-barangay-cluster.svg` | Grouped homes and gardens representing connected Pasig barangays. | SVG | Hover: house windows glow. Active: selected barangay pin pops. | Explore Pasig Map, farmer service areas, community impact cards |
| `asset/map/rooftop-garden-tile` | `agrifarm-map-rooftop-garden-tile.svg` | Reusable urban rooftop garden map tile. | SVG | Hover: leaves sway. Active: harvest badge appears. | Explore Pasig Map, farmer profile location previews, Start the Journey page |
| `asset/map/market-pickup-point` | `agrifarm-map-market-pickup-point.svg` | Map marker for farmer market pickup or collection points. | SVG | Hover: pin pulse. Active: stall awning bounce. | Explore Pasig Map, checkout pickup selector, order tracking |
| `asset/map/bridge-piece` | `agrifarm-map-bridge-piece.svg` | Bridge element for crossing the Pasig River in modular map scenes. | SVG | Hover: route line lights up. Active: delivery dot crosses bridge. | Explore Pasig Map, delivery route visualization, landing scene |
| `asset/map/delivery-route-line` | `agrifarm-map-delivery-route-line.svg` | Dotted route path connecting farms, buyers, and pickup points. | SVG | Hover: route dots pulse in sequence. Active: moving delivery dot. | Explore Pasig Map, delivery tracking, checkout route preview |
| `asset/map/pasig-skyline-marker` | `agrifarm-map-pasig-skyline-marker.svg` | Small city skyline marker to signal urban Pasig context. | SVG | Hover: window lights twinkle. Active: skyline rises 4px. | Landing hero, Explore Pasig Map, community impact sections |
| `asset/map/community-garden-plot` | `agrifarm-map-community-garden-plot.svg` | Small garden plot tile for community farms and rooftop crop areas. | SVG | Hover: seedlings sway. Active: selected crop badge appears. | Explore Pasig Map, farmer profile, forecast crop recommendation cards |

## Generated SVG Assets - Batch 8 Marketplace Transaction States

These Batch 8 marketplace state assets were created as local SVG source files and added to the Figma file as editable `asset/state/*` components.

| Figma component | File name | Purpose | Format | Hover / active animation idea | Used in |
|---|---|---|---|---|---|
| `asset/state/order-completed` | `agrifarm-state-order-completed.svg` | Success state for a completed marketplace order. | SVG | Hover: check badge pop. Active: basket lifts slightly. | Checkout confirmation, order history, buyer dashboard |
| `asset/state/payment-successful` | `agrifarm-state-payment-successful.svg` | Payment success state for receipts and checkout. | SVG | Hover: card shine. Active: peso/check badge pulses. | Checkout, payment modal, order confirmation |
| `asset/state/delivery-completed` | `agrifarm-state-delivery-completed.svg` | Delivery complete state for rider and logistics feedback. | SVG | Hover: wheels roll. Active: route check appears. | Order tracking, delivery completion, seller/buyer notifications |
| `asset/state/review-submitted` | `agrifarm-state-review-submitted.svg` | Review submitted state for rating flows. | SVG | Hover: stars twinkle. Active: review card check pops. | Product reviews, farmer reviews, post-purchase feedback |
| `asset/state/harvest-uploaded` | `agrifarm-state-harvest-uploaded.svg` | Seller success state after uploading harvest inventory. | SVG | Hover: upload arrow rises. Active: produce check badge appears. | Seller dashboard, product listing flow, inventory upload |
| `asset/state/product-listed` | `agrifarm-state-product-listed.svg` | Seller success state after a product is listed in the marketplace. | SVG | Hover: tag wiggle. Active: listing card check appears. | Seller product form, inventory cards, marketplace admin |
| `asset/state/order-cancelled` | `agrifarm-state-order-cancelled.svg` | Gentle cancellation state that avoids alarming non-technical users. | SVG | Hover: soft shake. Active: help CTA glow. | Order history, checkout error recovery, support flows |
| `asset/state/refund-processing` | `agrifarm-state-refund-processing.svg` | Refund processing state for payment support and trust flows. | SVG | Hover: arrows rotate. Active: peso dot pulse. | Refund status, support center, payment history |

## Generated SVG Assets - Batch 9 Forecast and SARIMA Insight States

These Batch 9 forecast assets were created as local SVG source files and added to the Figma file as editable `asset/forecast/*` components.

| Figma component | File name | Purpose | Format | Hover / active animation idea | Used in |
|---|---|---|---|---|---|
| `asset/forecast/demand-rising-card` | `agrifarm-forecast-demand-rising-card.svg` | Forecast insight card showing demand expected to rise. | SVG | Hover: arrow lifts. Active: final data point pulses. | Forecast dashboard, seller planning cards, product demand insights |
| `asset/forecast/demand-falling-card` | `agrifarm-forecast-demand-falling-card.svg` | Forecast insight card showing demand expected to fall. | SVG | Hover: arrow soft-drop. Active: warning badge pulses. | Forecast dashboard, seller pricing warnings, inventory planning |
| `asset/forecast/high-confidence` | `agrifarm-forecast-high-confidence.svg` | Forecast confidence state for reliable SARIMA predictions. | SVG | Hover: confidence ring completes. Active: shield check pulses. | Forecast summary cards, confidence badges, admin forecast table |
| `asset/forecast/low-confidence` | `agrifarm-forecast-low-confidence.svg` | Forecast confidence state for uncertain SARIMA predictions. | SVG | Hover: dashed ring rotates. Active: help hint appears. | Forecast summary cards, confidence badges, warning explanations |
| `asset/forecast/supply-risk-alert` | `agrifarm-forecast-supply-risk-alert.svg` | Supply risk alert for likely shortage or unstable harvest supply. | SVG | Hover: alert ring pulse. Active: warning card expands. | Forecast dashboard, admin alerts, seller crop planning |
| `asset/forecast/good-time-plant-card` | `agrifarm-forecast-good-time-plant-card.svg` | Recommendation state for favorable planting timing. | SVG | Hover: seedling grows. Active: calendar check appears. | Farmer dashboard, crop recommendations, Start the Journey guidance |
| `asset/forecast/good-time-harvest-card` | `agrifarm-forecast-good-time-harvest-card.svg` | Recommendation state for favorable harvest timing. | SVG | Hover: basket fills. Active: checkmark pop. | Farmer dashboard, harvest planner, marketplace supply prompts |
| `asset/forecast/seasonal-peak` | `agrifarm-forecast-seasonal-peak.svg` | Seasonal peak indicator for crop demand or harvest cycles. | SVG | Hover: sun rays rotate. Active: peak marker bounces. | Forecast dashboard, seasonal charts, product planning summaries |

## Generated SVG Assets - Batch 10 Empty, Loading, and Error States

These Batch 10 support-state assets were created as local SVG source files and added to the Figma file as editable `asset/empty/*` components.

| Figma component | File name | Purpose | Format | Hover / active animation idea | Used in |
|---|---|---|---|---|---|
| `asset/empty/offline` | `agrifarm-empty-offline.svg` | Offline state for weak or missing connection. | SVG | Hover: signal dots retry. Active: reconnect pulse. | Offline page, marketplace loading failure, forecast sync errors |
| `asset/empty/search-not-found` | `agrifarm-empty-search-not-found.svg` | Search returned no matching farmers, products, or recipes. | SVG | Hover: magnifier scans. Active: suggested chips appear. | Marketplace search, farmer search, recipe search |
| `asset/empty/maintenance` | `agrifarm-empty-maintenance.svg` | Friendly maintenance state for temporary service work. | SVG | Hover: wrench tilts. Active: progress dot moves. | Maintenance page, admin downtime, forecast service unavailable |
| `asset/empty/loading-sprout` | `agrifarm-empty-loading-sprout.svg` | Gentle loading state while data or recommendations are fetched. | SVG | Loop: sprout grows and three dots pulse. | Forecast loading, marketplace loading, recipes loading |
| `asset/empty/no-orders` | `agrifarm-empty-no-orders.svg` | Empty order history state for buyers or sellers. | SVG | Hover: receipt slides out. Active: marketplace CTA glow. | Orders page, seller dashboard, buyer account |
| `asset/empty/no-favorites` | `agrifarm-empty-no-favorites.svg` | Empty saved/favorites state for products, farmers, or recipes. | SVG | Hover: heart outline fills slightly. Active: favorite sparkle appears. | Favorites page, saved recipes, saved farmers |
| `asset/empty/no-harvest-yet` | `agrifarm-empty-no-harvest-yet.svg` | Empty harvest state for farmers before first inventory upload. | SVG | Hover: seedling grows. Active: upload CTA glow. | Seller inventory, farmer onboarding, harvest dashboard |
| `asset/empty/no-recipes` | `agrifarm-empty-no-recipes.svg` | Empty recipe state when no meal suggestions match. | SVG | Hover: spoon wiggle. Active: ingredient chips appear. | Recipes page, product detail recipe suggestions, search results |

## Generated SVG Assets - Batch 11 Navigation and Utility Icons

These Batch 11 navigation and utility icons were created as local SVG source files and added to the Figma file as editable `asset/icon/*` components.

| Figma component | File name | Purpose | Format | Hover / active animation idea | Used in |
|---|---|---|---|---|---|
| `asset/icon/home` | `agrifarm-icon-home.svg` | Home navigation icon for main landing/dashboard entry. | SVG | Hover: roof lifts 2px. Active: window glow. | Top nav, bottom nav, app sidebar |
| `asset/icon/marketplace` | `agrifarm-icon-marketplace.svg` | Marketplace navigation icon for buying and selling produce. | SVG | Hover: awning wiggle. Active: produce dot pop. | Top nav, quick access cards, bottom nav |
| `asset/icon/farmers` | `agrifarm-icon-farmers.svg` | Farmers navigation icon for farmer listings and profiles. | SVG | Hover: hat tilt. Active: group badge pop. | Explore Farmers, profile tabs, community sections |
| `asset/icon/recipes` | `agrifarm-icon-recipes.svg` | Recipes navigation icon for meal suggestions. | SVG | Hover: steam rises. Active: spoon wiggle. | Recipes page, product details, bottom nav |
| `asset/icon/forecast` | `agrifarm-icon-forecast.svg` | Forecast navigation icon for SARIMA insights. | SVG | Hover: chart line draws. Active: data point pulse. | Forecast tab, dashboard cards, admin nav |
| `asset/icon/map` | `agrifarm-icon-map.svg` | Map navigation icon for exploring Pasig farms and pickup points. | SVG | Hover: pin pulse. Active: route line draws. | Explore Pasig Map, location filters, delivery routes |
| `asset/icon/profile` | `agrifarm-icon-profile.svg` | Profile/account navigation icon. | SVG | Hover: avatar ring glow. Active: check badge appears. | Header account menu, bottom nav, settings page |
| `asset/icon/cart` | `agrifarm-icon-cart.svg` | Cart icon for checkout and shopping bag states. | SVG | Hover: basket nudge. Active: item count pop. | Marketplace header, product cards, checkout |
| `asset/icon/search` | `agrifarm-icon-search.svg` | Search utility icon for finding produce, farmers, and recipes. | SVG | Hover: lens scan. Active: result sparkle. | Search fields, toolbar buttons, empty states |
| `asset/icon/filter` | `agrifarm-icon-filter.svg` | Filter utility icon for refining marketplace/map/forecast lists. | SVG | Hover: sliders shift. Active: selected dot fills. | Product filters, map filters, dashboard filters |
| `asset/icon/notification` | `agrifarm-icon-notification.svg` | Notification icon for alerts and updates. | SVG | Hover: bell ring. Active: alert dot pulse. | Header, dashboard alerts, forecast/seller notifications |
| `asset/icon/settings` | `agrifarm-icon-settings.svg` | Settings utility icon for preferences and account configuration. | SVG | Hover: gear rotates slightly. Active: center dot pulse. | Profile settings, admin tools, dashboard menus |

## Figma Component Requirements

Each asset component should include:

- Component name matching `asset/[category]/[asset-name]`.
- Description field containing purpose and recommended usage.
- Variants when needed:
  - `State=Default`
  - `State=Hover`
  - `State=Active`
  - `State=Disabled`
- Export setting:
  - SVG for vector/UI/map/weather/data assets.
  - PNG 2x for detailed characters and food illustrations.

## Interaction Guidelines

Use small, respectful motion:

- Hover: 100-160ms, subtle scale, sway, glow, or pulse.
- Active: 120-200ms, single bounce/pop/checkmark.
- Avoid constant looping motion except loading, rain, steam, and route progress.
- Motion should never block reading labels or making purchases.

## Usage Rules

- Use farmers and buyers for onboarding, role selection, profile setup, and empty states.
- Use vegetables as product/category markers, not as large page decoration.
- Use baskets/crates/scales in marketplace, cart, stock, and seller inventory flows.
- Use houses, rooftop gardens, roads, river, trees, and map pieces to assemble Pasig/barangay scenes.
- Use clouds/weather and forecast/data elements in SARIMA forecasting views.
- Use recipe food illustrations only in meal suggestion cards and recipe detail states.
- Use cats/dogs/birds sparingly for friendly barangay scenes, not core actions.

## Minimum V1 Build Order

1. Vegetables: tomato, pechay, eggplant, mixed basket.
2. Marketplace objects: basket, crate, scale, stall.
3. Forecast/data: rising demand, supply risk, confidence band, sunny/rainy icons.
4. Pasig map pieces: barangay pin, river, road segments, house.
5. Characters: farmer seller, buyer family, delivery helper.
6. Empty-state and recipe illustrations.
