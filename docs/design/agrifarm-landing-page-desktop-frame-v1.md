# AgriFarm Landing Page Desktop Frame v1

Purpose: define the first high-fidelity desktop landing page frame for Figma.

Scope: desktop landing page only. Do not design the other AgriFarm pages in this step.

Figma frame name:

`Landing Page / Desktop`

Frame:

- Width: `1440`
- Height: `2400`
- Background: `Cream 200 / #F6ECD8`
- Layout grid: 12 columns
- Margin: `80`
- Gutter: `24`
- Max content width: `1280`
- Base spacing: 8px grid

## Page Structure

Use one vertical Auto Layout page frame:

Component/frame name:

`Page/Landing/Desktop`

Auto Layout:

- Direction: Vertical
- Width: Fixed `1440`
- Height: Hug after content
- Gap: `0`
- Padding: `0`
- Fill: `#F6ECD8`

Sections in order:

1. `Landing/Nav/Sticky`
2. `Landing/Hero`
3. `Landing/Story`
4. `Landing/QuickAccess`
5. `Landing/Impact`
6. `Landing/Footer`

## 1. Sticky Navigation

Frame name:

`Landing/Nav/Sticky`

Placement:

- X: `0`
- Y: `0`
- Width: `1440`
- Height: `88`
- Position behavior in prototype: Sticky while scrolling

Auto Layout:

- Direction: Horizontal
- Align: Center
- Space between
- Padding left/right: `80`
- Padding top/bottom: `16`
- Gap: `32`

Style:

- Fill: `Leaf 900 / #14260E`
- Bottom border: `1px #D99A3A` at 24% opacity
- Shadow: `shadow/md`

Content:

- Left: `Brand/Logo Lockup`
- Center: `Nav/Menu/Desktop`
- Right: `Nav/Actions`

Component names:

- `Brand/Logo Lockup`
- `Nav/Menu Item`
- `Button/Secondary Small`
- `Language Toggle`

Typography:

- Brand wordmark: `24px`, Bold
- Brand subtitle: `11px`, Bold, uppercase
- Navigation labels: `14px`, Bold
- Buttons: `14px`, Bold

Navigation labels:

- Farmers
- Marketplace
- Recipes
- Forecast
- Explore Pasig

Buttons:

- `Log in`
- `Start`

Asset placement:

- Use `Icon/Leaf` or `agrifarm-plant-seedling.svg` inside the logo mark.

## 2. Emotional Hero Section

Frame name:

`Landing/Hero`

Placement:

- Y: `88`
- Width: `1440`
- Height: `760`

Auto Layout:

- Direction: Horizontal
- Align: Center
- Padding left/right: `80`
- Padding top: `72`
- Padding bottom: `56`
- Gap: `56`

Columns:

- Left content column: `600px`
- Right illustration column: fill remaining width, max `600px`

Left column frame:

`Landing/Hero/Copy`

Auto Layout:

- Direction: Vertical
- Width: `600`
- Gap: `24`
- Align left

Content:

- Eyebrow badge: `Barangay-grown harvests in Pasig City`
- H1: `Fresh food, local farmers, smarter seasons.`
- Body: `AgriFarm connects Pasig families with nearby urban farmers, fresh marketplace produce, recipe ideas, and seasonal forecasts that help every harvest find a home.`
- CTA row
- Trust row

Typography:

- Eyebrow: `14px`, Bold, uppercase, color `Leaf 700`
- H1: `64px`, Bold, line height `68px`, color `Soil 900`
- Body: `20px`, Regular, line height `32px`, color `Soil 700`
- Trust row: `14px`, Medium, color `Soil 500`

CTA row:

Frame name:

`Landing/Hero/CTA Row`

Auto Layout:

- Direction: Horizontal
- Gap: `16`

Buttons:

- `Button/Primary Large`: `Start the Journey`
- `Button/Secondary Large`: `Browse Marketplace`

Button specs:

- Height: `56`
- Padding left/right: `24`
- Radius: `999`
- Label: `16px`, Bold

Right illustration frame:

`Landing/Hero/Rooftop Garden Feature`

Size:

- Width: `600`
- Height: `560`

Style:

- No card wrapper around the whole scene.
- Use layered separate assets.
- Ground/roof base anchored at bottom.

Asset placement:

- `agrifarm-rooftop-garden-large.svg`
  - X: `24`
  - Y: `156`
  - W: `540`
  - H: `300`
- `agrifarm-farmer-female-standing.png`
  - X: `84`
  - Y: `252`
  - W: `180`
  - H: `240`
- `agrifarm-buyer-child.png`
  - X: `360`
  - Y: `292`
  - W: `140`
  - H: `190`
- `agrifarm-cloud-sunny.svg`
  - X: `390`
  - Y: `40`
  - W: `120`
  - H: `90`
- `agrifarm-birds-group.svg`
  - X: `72`
  - Y: `72`
  - W: `110`
  - H: `44`
- `agrifarm-vegetable-pechay.svg`
  - X: `290`
  - Y: `350`
  - W: `72`
  - H: `72`

Hero note:

- This section should feel emotional and human, not like a dashboard.
- The product name/offer must be visible in the first viewport.
- The next section should peek below the fold at desktop height.

## 3. “Every Harvest Has a Story”

Frame name:

`Landing/Story`

Placement:

- Width: `1440`
- Height: `520`

Auto Layout:

- Direction: Horizontal
- Padding left/right: `80`
- Padding top/bottom: `72`
- Gap: `40`

Left block:

`Landing/Story/Text`

- Width: `500`
- Direction: Vertical
- Gap: `18`

Content:

- Eyebrow: `Every harvest has a story`
- H2: `From rooftop gardens to family tables.`
- Body: `Behind every bundle of pechay or basket of tomatoes is a Pasig grower planning around weather, demand, and daily family needs. AgriFarm helps those stories become easier to discover and support.`

Typography:

- Eyebrow: `14px`, Bold, uppercase, color `Harvest 700`
- H2: `44px`, Bold, line height `50px`
- Body: `18px`, Regular, line height `30px`

Right block:

`Landing/Story/Today Farmer Preview`

Size:

- Width: `640`
- Height: `360`

Use component:

- `Card/Today Farmer Preview`

Card style:

- Fill: `Cream 50`
- Radius: `20`
- Border: `1px Soil 200`
- Padding: `24`
- Auto Layout: Horizontal
- Gap: `24`

Content:

- Image/avatar area: `220 x 280`
- Text area: fill
- Badge: `Today’s Farmer`
- Name: `Maria’s Garden`
- Description: `Rooftop vegetables grown for nearby Pasig families.`
- Stats row:
  - `12 crops`
  - `5 barangays`
  - `Forecast ready`
- Button: `Meet Maria`

Assets:

- `agrifarm-farmer-female-standing.png`
- `agrifarm-rooftop-garden-small.svg`
- `agrifarm-sign-fresh-today.svg`

## 4. Quick Access Cards

Frame name:

`Landing/QuickAccess`

Placement:

- Width: `1440`
- Height: `520`

Auto Layout:

- Direction: Vertical
- Padding left/right: `80`
- Padding top/bottom: `72`
- Gap: `32`

Header:

- H2: `What would you like to explore?`
- Body: `Choose a path. Every card is built for quick, simple action.`

Typography:

- H2: `36px`, Bold
- Body: `17px`, Regular

Cards grid:

Frame name:

`Landing/QuickAccess/Card Grid`

Auto Layout:

- Direction: Horizontal
- Wrap: Enabled
- Gap: `20`
- Row gap: `20`

Card component:

`Card/Quick Access`

Each card:

- Width: `240`
- Height: `220`
- Padding: `20`
- Radius: `18`
- Fill: `Cream 50`
- Border: `1px Soil 200`
- Auto Layout: Vertical
- Gap: `14`

Cards:

1. Farmers
   - Title: `Farmers`
   - Body: `Meet Pasig growers.`
   - Asset: `agrifarm-farmer-male-standing.png`
2. Marketplace
   - Title: `Marketplace`
   - Body: `Shop fresh local produce.`
   - Asset: `agrifarm-basket-full.svg`
3. Recipes
   - Title: `Recipes`
   - Body: `Cook with what is available.`
   - Asset: `agrifarm-recipe-ginisang-pechay.png`
4. Forecast
   - Title: `Forecast`
   - Body: `See demand and season guidance.`
   - Asset: `agrifarm-forecast-chart-line.svg`
5. Explore Pasig
   - Title: `Explore Pasig`
   - Body: `Find barangay farms and delivery areas.`
   - Asset: `agrifarm-pasig-barangay-pin.svg`

Typography:

- Card title: `22px`, Bold
- Card body: `14px`, Regular, line height `21px`

Interaction-ready notes:

- Hover: card lifts `-4px`, shadow changes from `sm` to `md`.
- Active: icon scales to `0.96`, card border becomes `Leaf 500`.

## 5. Community Impact Strip

Frame name:

`Landing/Impact`

Placement:

- Width: `1440`
- Height: `260`

Auto Layout:

- Direction: Horizontal
- Align: Center
- Padding left/right: `80`
- Padding top/bottom: `56`
- Gap: `24`

Style:

- Fill: `Leaf 900`
- Text inverse: `Cream 50`

Component:

`Strip/Community Impact`

Metrics:

1. `30+`
   - Label: `Pasig barangays`
2. `120+`
   - Label: `fresh listings`
3. `5`
   - Label: `forecast crop groups`
4. `2`
   - Label: `languages supported`

Each metric block:

- Width: Fill
- Auto Layout: Vertical
- Gap: `8`
- Align: Center

Typography:

- Number: `48px`, Bold, color `Harvest 200`
- Label: `16px`, Medium, color `Cream 50`

Assets:

- Small inline icons:
  - `agrifarm-pasig-barangay-pin.svg`
  - `agrifarm-basket-full.svg`
  - `agrifarm-forecast-demand-rising.svg`
  - language/globe icon from component set

## 6. Footer

Frame name:

`Landing/Footer`

Placement:

- Width: `1440`
- Height: `300`

Auto Layout:

- Direction: Horizontal
- Padding left/right: `80`
- Padding top/bottom: `56`
- Gap: `64`

Style:

- Fill: `Soil 900`
- Top border: `1px Harvest 500` at 32% opacity

Columns:

1. Brand column
   - Width: `360`
   - Logo
   - Short description
2. Explore column
   - Farmers
   - Marketplace
   - Recipes
   - Forecast
3. Community column
   - Explore Pasig
   - Start the Journey
   - Login
4. Support column
   - Language
   - Help
   - Safety

Typography:

- Footer heading: `14px`, Bold, uppercase
- Footer links: `15px`, Medium
- Footer body: `14px`, Regular, line height `22px`

Assets:

- `Icon/Leaf`
- `agrifarm-plant-seedling.svg`

## Component Names To Create Or Reuse

Create/reuse these Figma components:

- `Brand/Logo Lockup`
- `Nav/Menu/Desktop`
- `Nav/Menu Item`
- `Language Toggle`
- `Button/Primary Large`
- `Button/Secondary Large`
- `Badge/Eyebrow`
- `Card/Today Farmer Preview`
- `Card/Quick Access`
- `Strip/Community Impact`
- `Footer/Column`

## Desktop Coordinates Summary

| Section | X | Y | W | H |
|---|---:|---:|---:|---:|
| Sticky navigation | 0 | 0 | 1440 | 88 |
| Hero | 0 | 88 | 1440 | 760 |
| Story | 0 | 848 | 1440 | 520 |
| Quick access | 0 | 1368 | 1440 | 520 |
| Impact | 0 | 1888 | 1440 | 260 |
| Footer | 0 | 2148 | 1440 | 300 |

Total page content height:

- `2448`

Recommended Figma frame height:

- `2500`

## Accessibility Notes

- H1 must be unique and first major heading.
- Buttons must be at least `56px` tall in hero.
- Quick access cards must have visible title text, not icon-only meaning.
- Color contrast must pass for all body text.
- Hover state cannot be the only indication of action.
- Forecast text must be plain-language and action-first.

