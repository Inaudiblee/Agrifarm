# AgriFarm Figma Design System v1

Purpose: define a professional Figma system for AgriFarm, an urban farming marketplace and SARIMA-based seasonal forecasting platform for Pasig City.

This is a design-system blueprint, not implementation code. It is intended to be built in Figma as reusable variables, styles, components, illustration assets, and responsive screen patterns.

## Product Direction

AgriFarm should feel like a friendly civic marketplace for local harvests.

The interface should be:

- Clean enough for marketplace transactions and forecasting decisions.
- Friendly enough for kids, older adults, farmers, buyers, and non-technical users.
- Cartoon-styled through reusable illustrations, not through cluttered UI.
- Locally grounded in Pasig City, barangays, urban gardens, seller farms, local delivery, and Filipino food.
- Accessible by default, with large controls, plain language, clear contrast, and forgiving layouts.

Design principle:

> A calm marketplace interface with warm farm illustrations, simple forecasting visuals, and barangay-first navigation.

Avoid:

- One giant generated image.
- Poster-like landing pages.
- Random decorative screens.
- Overly dark fantasy/wood themes.
- Tiny dashboard text.
- Icon-only critical actions.
- Monochrome green UI.

## Phase 0 Discovery Summary

Observed product surfaces:

- Buyer marketplace dashboard.
- Seller dashboard shell and panels.
- Landing page with live products, farmer map, meal ideas, and process sections.
- Login/register/auth surfaces.
- Settings page.
- Existing cartoon farmer character assets.
- Existing crop/catalog images.
- Pasig barangay map asset.

Existing visual signals:

- Primary brand family: farm green, harvest gold, cream, soil brown.
- Current app leans warm and rustic. Figma v1 should keep warmth but make the system cleaner and easier to scan.
- Current controls already respect many accessible target sizes around 44-64 px.
- Existing UI uses rounded panels, pills, sidebar navigation, product rows, metric cards, and large dashboard heroes.

Design correction for v1:

- Reduce heavy parchment/wood styling in system components.
- Keep the green/gold brand, but introduce sky blue, tomato coral, and neutral gray to support forecasting and status states.
- Use friendly cartoon assets as separated reusable illustrations, not as backgrounds behind every control.

## Figma File Structure

Create these Figma pages in order:

1. `00 Cover`
2. `01 Getting Started`
3. `02 Foundations - Color`
4. `03 Foundations - Typography`
5. `04 Foundations - Layout`
6. `05 Illustration Assets`
7. `--- Components`
8. `Button`
9. `Input and Search`
10. `Navigation`
11. `Cards`
12. `Marketplace Components`
13. `Forecast Components`
14. `Feedback and Status`
15. `--- Patterns`
16. `Buyer Marketplace Pattern`
17. `Farmer Dashboard Pattern`
18. `Forecast Dashboard Pattern`
19. `Simple Mode Pattern`
20. `--- Utilities`

## Foundations

### Color Collections

Use separate primitive and semantic variable collections.

Primitive color variables:

| Variable | Hex | Purpose |
|---|---:|---|
| `leaf/900` | `#14260E` | Dark green surfaces |
| `leaf/700` | `#29471A` | Strong green text |
| `leaf/600` | `#355F24` | Primary green |
| `leaf/500` | `#476D2E` | Primary action |
| `leaf/100` | `#E6EFD9` | Soft green background |
| `leaf/50` | `#F2F8EA` | Pale green tint |
| `harvest/700` | `#7E4614` | Deep harvest accent |
| `harvest/500` | `#D99A3A` | Gold action accent |
| `harvest/200` | `#FFF1BF` | Soft gold surface |
| `cream/50` | `#FFFDF4` | Main card surface |
| `cream/100` | `#FFFAF0` | App surface |
| `cream/200` | `#F6ECD8` | Page background |
| `soil/900` | `#241409` | Primary text |
| `soil/700` | `#3B2511` | Strong body text |
| `soil/500` | `#66533F` | Muted text |
| `soil/200` | `#D9C9AE` | Border/subtle divider |
| `sky/600` | `#2E75B6` | Forecast and weather primary |
| `sky/100` | `#DCEEFF` | Forecast tint |
| `tomato/600` | `#C45D24` | Warning/error |
| `tomato/100` | `#FFEBD6` | Warning surface |
| `mint/500` | `#2FA36B` | Success |
| `gray/900` | `#172019` | Neutral text |
| `gray/500` | `#66736B` | Neutral muted text |
| `gray/100` | `#EEF2EC` | Neutral surface |
| `white` | `#FFFFFF` | Base |

Semantic color variables:

| Variable | Light value |
|---|---|
| `color/bg/app` | `cream/200` |
| `color/bg/surface` | `cream/50` |
| `color/bg/surface-alt` | `cream/100` |
| `color/bg/brand` | `leaf/900` |
| `color/bg/brand-soft` | `leaf/100` |
| `color/bg/forecast` | `sky/100` |
| `color/text/primary` | `soil/900` |
| `color/text/secondary` | `soil/700` |
| `color/text/muted` | `soil/500` |
| `color/text/inverse` | `cream/50` |
| `color/text/brand` | `leaf/700` |
| `color/border/default` | `soil/200` |
| `color/border/strong` | `leaf/500` |
| `color/action/primary` | `leaf/500` |
| `color/action/primary-hover` | `leaf/600` |
| `color/action/secondary` | `cream/100` |
| `color/action/accent` | `harvest/500` |
| `color/status/success` | `mint/500` |
| `color/status/warning` | `harvest/500` |
| `color/status/error` | `tomato/600` |
| `color/status/info` | `sky/600` |

Dark mode can be deferred for v1 unless the team confirms it is required. If created, dark mode should be for admin/forecast dashboards only, not the default public/buyer experience.

### Typography

Use an accessible, ordinary type pairing.

Recommended Figma text styles:

| Style | Font | Size | Line | Weight | Use |
|---|---|---:|---:|---|---|
| `display/lg` | Inter or Arial | 56 | 60 | 800 | Landing/product hero only |
| `display/md` | Inter or Arial | 44 | 50 | 800 | Dashboard hero |
| `heading/lg` | Inter or Arial | 32 | 40 | 800 | Page heading |
| `heading/md` | Inter or Arial | 24 | 32 | 800 | Panel heading |
| `heading/sm` | Inter or Arial | 20 | 28 | 800 | Card title |
| `body/lg` | Inter or Arial | 18 | 30 | 500 | Helpful copy, older-user mode |
| `body/md` | Inter or Arial | 16 | 26 | 500 | Default body |
| `body/sm` | Inter or Arial | 14 | 22 | 600 | Secondary copy |
| `label/lg` | Inter or Arial | 16 | 20 | 800 | Large controls |
| `label/md` | Inter or Arial | 14 | 18 | 800 | Buttons, chips |
| `caption` | Inter or Arial | 12 | 16 | 700 | Metadata only |
| `number/lg` | Inter or Arial | 36 | 40 | 800 | Metrics and prices |

Rule: do not use negative letter spacing. Decorative serif wordmarks can exist in brand assets only; app UI should use the readable sans stack.

### Spacing

Variables:

- `spacing/0`: 0
- `spacing/2xs`: 4
- `spacing/xs`: 8
- `spacing/sm`: 12
- `spacing/md`: 16
- `spacing/lg`: 24
- `spacing/xl`: 32
- `spacing/2xl`: 48
- `spacing/3xl`: 64

### Radius

Variables:

- `radius/none`: 0
- `radius/xs`: 4
- `radius/sm`: 6
- `radius/md`: 8
- `radius/lg`: 12
- `radius/xl`: 16
- `radius/2xl`: 20
- `radius/full`: 999

Rule: keep component cards at 8-16 px radius. Use full radius only for pills, chips, avatars, and badges.

### Elevation

Effect styles:

- `shadow/sm`: subtle card separation.
- `shadow/md`: dropdowns and elevated panels.
- `shadow/lg`: modal and sticky sidebar.
- `shadow/focus`: 3 px accessible focus ring using `leaf/500` or `sky/600`.

Use shadows softly. Do not make every panel float.

## Illustration System

Create page: `05 Illustration Assets`.

Asset groups:

1. `Characters/Farmer`
   - Male farmer variants.
   - Female farmer variants.
   - Neutral helper/delivery character.
   - Senior buyer character.
   - Child/family buyer character.

2. `Crops`
   - Tomato.
   - Pechay.
   - Eggplant.
   - Leafy greens.
   - Root crops.
   - Tropical fruits.
   - Mixed harvest basket.

3. `Forecast`
   - Sunny.
   - Rainy.
   - Cloudy.
   - Hot season.
   - Wet season.
   - Harvest-ready.
   - Low-stock risk.
   - Price-rise alert.

4. `Marketplace Objects`
   - Basket.
   - Crate.
   - Weighing scale.
   - Delivery bag.
   - Store stall.
   - Seedling.
   - Barangay pin.

Art direction:

- Flat cartoon shapes.
- Clean outlines or edge shadows, one consistent line weight.
- Rounded friendly proportions.
- Simple faces and gestures.
- No text baked into illustrations.
- No full-screen poster compositions.
- Every asset should be separable and reusable.

Existing assets to import as image components:

- `/apps/web/public/assets/farmer-characters/*.png`
- `/apps/api/uploads/catalog/*.webp`
- `/apps/api/uploads/catalog/crops/*.webp`
- `/apps/web/public/assets/agrifarm-story/barangay-map.png`
- `/apps/web/public/assets/agrifarm-ui-pack/13-background-texture.png` as optional texture only, not a required component fill.

## Component Library Scope v1

### Button

Component set: `Button`

Variant axes:

- `Intent`: Primary, Secondary, Accent, Danger, Ghost
- `Size`: Large, Medium, Small
- `State`: Default, Hover, Pressed, Disabled
- `Icon`: None, Leading, Trailing

Rules:

- Large: 56 px height, for seniors/simple mode.
- Medium: 48 px height, default.
- Small: 40 px height, dense dashboards only.
- Minimum tap target: 44 px.
- Always support text labels. Icon-only buttons are allowed only for utility actions with tooltip labels.

### Input and Search

Component sets:

- `Text Field`
- `Select`
- `Search Field`
- `Textarea`
- `Quantity Stepper`

States:

- Default
- Focus
- Filled
- Error
- Disabled

Rules:

- Labels above inputs.
- Helper text below.
- Error text always paired with error icon.
- Search field should support large simple mode and compact dashboard mode.

### Navigation

Components:

- `Top Bar`
- `Sidebar`
- `Bottom Nav`
- `Account Menu`
- `Language Toggle`
- `Barangay Selector`

Navigation labels:

- Overview
- Marketplace
- Forecast
- Basket
- Orders
- Products
- Farmers
- Settings

Responsive behavior:

- Desktop: sidebar or topbar.
- Tablet: compact sidebar or topbar.
- Mobile: bottom nav for primary sections plus menu for secondary sections.
- Simple mode: large vertical menu tiles.

### Cards

Components:

- `Metric Card`
- `Product Card`
- `Product Row`
- `Order Card`
- `Farmer Card`
- `Barangay Card`
- `Meal Recommendation Card`
- `Forecast Summary Card`
- `Seasonal Recommendation Card`
- `Alert Card`
- `Empty State`

Shared rules:

- Use surface fill, subtle border, one clear title.
- Put price/quantity/status in the same visual position across cards.
- Never nest cards inside cards.
- Card content must fit at mobile widths without clipped text.

### Marketplace Components

Components:

- `Product Listing`
- `Crop Category Tile`
- `Price Badge`
- `Stock Badge`
- `Unit Badge`
- `Add to Basket Control`
- `Cart Item Row`
- `Order Status Timeline`
- `Farmer Store Header`

Marketplace statuses:

- In stock
- Low stock
- Out of stock
- Available today
- Pre-order
- Delivery available
- Pickup only

### Forecast Components

Components:

- `Forecast KPI`
- `SARIMA Confidence Badge`
- `Season Chip`
- `Forecast Trend Card`
- `Demand Forecast Chart Frame`
- `Supply Forecast Chart Frame`
- `Recommended Action Card`
- `Risk Alert`

Forecast language must be plain:

- Prefer "Expected demand next week" over "SARIMA prediction interval".
- Show model details only in secondary text or admin views.
- Use visual confidence bands and simple status labels.

Forecast statuses:

- Stable demand
- Demand rising
- Demand dropping
- Supply risk
- Price may rise
- Good time to plant
- Good time to harvest

## Responsive Layout Rules

Breakpoints for Figma frames:

- Mobile: 390 x 844
- Mobile large: 430 x 932
- Tablet: 768 x 1024
- Desktop: 1440 x 1024
- Simple kiosk/tablet: 1024 x 768

Layout grid:

- Mobile: 4 columns, 16 px margins, 12 px gutters.
- Tablet: 8 columns, 24 px margins, 16 px gutters.
- Desktop: 12 columns, 40 px margins, 24 px gutters.

Accessibility:

- Body copy minimum 16 px.
- Simple mode body copy minimum 18 px.
- Touch targets minimum 44 x 44 px.
- Important actions 48-56 px tall.
- Prices should be large and high contrast.
- Filipino/English language controls must be visible and plain.

## Pattern Screens To Build After Components

Do not start by designing these pages. Build them only after foundations and components exist.

### Buyer Marketplace Pattern

Frame goals:

- Search crops or farms.
- Browse product cards/rows.
- Add item to basket.
- View basket summary.
- Track recent orders.

Key components:

- `Top Bar` or `Bottom Nav`
- `Search Field`
- `Crop Category Tile`
- `Product Card`
- `Price Badge`
- `Stock Badge`
- `Add to Basket Control`
- `Cart Item Row`
- `Order Card`

### Farmer Dashboard Pattern

Frame goals:

- See stock, products, orders, and delivery area.
- Add/update crop listing with simple guided steps.
- Choose cartoon farmer avatar.

Key components:

- `Sidebar`
- `Metric Card`
- `Product Row`
- `Text Field`
- `Select`
- `Quantity Stepper`
- `Barangay Selector`
- `Alert Card`

### Forecast Dashboard Pattern

Frame goals:

- Explain seasonal demand and supply.
- Show SARIMA forecast confidence in a non-technical way.
- Recommend actions for farmers/admin.

Key components:

- `Forecast KPI`
- `Season Chip`
- `Forecast Trend Card`
- `Demand Forecast Chart Frame`
- `Recommended Action Card`
- `Risk Alert`

### Simple Mode Pattern

Frame goals:

- Make AgriFarm usable for older adults and low-confidence users.
- Reduce choices per screen.
- Use large controls and illustrations.

Rules:

- Large buttons only.
- One primary action per screen.
- No dense tables.
- Use step-by-step flows.
- Confirm destructive actions with plain language.

## Content Tone

Use direct, friendly language.

Good labels:

- Search crops or farms
- Add to basket
- View orders
- Choose barangay
- Forecast for next week
- Demand is rising
- Good time to harvest
- Low stock soon

Avoid:

- Submit
- Execute
- Prediction output
- SARIMA residual variance
- CRUD labels visible to users

SARIMA can appear in admin/technical context:

- "SARIMA model"
- "Confidence"
- "Forecast interval"
- "Last trained"

But user-facing buyer/farmer views should translate the model into action.

## Figma Acceptance Checklist

The system is ready when:

- Foundations pages exist and show color, type, spacing, radius, and elevation.
- Variables use clear slash-separated names.
- Components use variants instead of duplicated one-off frames.
- Product, farmer, forecast, and status components are reusable.
- Illustration assets are separate components/assets, not flattened into posters.
- Mobile, tablet, desktop, and simple-mode reference frames exist.
- All primary controls meet 44 px minimum tap target.
- Buyer, farmer, and forecasting patterns can be assembled from the library without drawing custom UI.
- The design clearly looks like AgriFarm in the first viewport.

## V1 Component Build Order

1. Color, spacing, radius, shadow, and typography variables.
2. Text styles and effect styles.
3. Button.
4. Text Field, Select, Search Field.
5. Badge and Chip.
6. Metric Card.
7. Product Card and Product Row.
8. Forecast Summary Card.
9. Alert and Empty State.
10. Navigation components.
11. Buyer Marketplace Pattern.
12. Farmer Dashboard Pattern.
13. Forecast Dashboard Pattern.
14. Simple Mode Pattern.

## Immediate Figma Work Queue

When Figma write access is available, create the file in this exact order:

1. Create all pages listed in `Figma File Structure`.
2. Create primitive and semantic color variables.
3. Create spacing, radius, and shadow styles.
4. Create typography styles.
5. Import existing farmer/crop/barangay assets into `05 Illustration Assets`.
6. Build `Button` variants and validate.
7. Build `Input and Search` variants and validate.
8. Build `Cards` variants and validate.
9. Build marketplace and forecast components.
10. Assemble the four reference pattern frames.

