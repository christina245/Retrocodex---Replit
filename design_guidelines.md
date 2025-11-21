# Retrocodex Design Guidelines

## Design Philosophy
This is a pre-designed website created in Figma by a UX designer. Follow the specifications exactly as provided. The design is complete and approved - implementation should match the Figma design precisely.

## Typography
- **Serif Font**: Merriweather (Google Fonts) - for fact content text
- **Sans-serif Font**: Public Sans (Google Fonts) - for UI elements, navigation, buttons
- **Text Color**: #2C2C2C (consistent across all black text - verify no accidental variations)

## Color Palette
- **Primary Brand Red**: #FF5353 (footer background, buttons, accents)
- **Text/Dark Elements**: #2C2C2C (all black text and dark backgrounds)
- **Category Colors**: Each fact category has unique icon colors that appear at 5% opacity on card headers
  - History: Yellow
  - Life Sciences: Green
  - Everyday Life: Purple
  - Health & Fitness: Orange
  - Social Sciences: Pink
  - Gender & Sexuality: Red/Pink
  - Other: Black outline
- **Hover State**: #FF5353 at 10% opacity with 10px rounded borders

## Layout & Spacing
- **Fact Cards**: 290px × 460px exactly
- **Paragraph Spacing**: Minimum 40px between paragraphs in fact cards
- **Icon Alignment**: Center-aligned with first line of text
- **Padding Standards**: 
  - Menu hover states: 20px all around
  - Social preview: 30px padding around fact card
  - Border radius: 10px for rounded elements

## Component Structure

### Header
- Social links (Instagram, Reddit, Bluesky) - left aligned
- Donate button
- Retrocodex logo (center)
- Tagline below logo
- Search icon (placeholder, non-functional)
- "Submit a Fact" button (coral/red, links to Typeform)
- Hamburger menu icon (opens slide-out menu)

### Navigation Bar
- Horizontal scrollable category tabs with colorful icons
- Links to future category pages (placeholder destinations)

### Tab Selector
- "Featured facts" / "Recently added" toggle
- Selected state: #2C2C2C background

### Fact Cards
- Category header: 5% opacity color wash matching category icon
- Red X icon (myth) + Green checkmark (truth)
- Myth statement in quotes
- Truth explanation with checkmark
- "Learn more" button (red/gray styling)
- Social actions: Comments, Save, Share icons below card

### Email Signup Banner
- "Be notified when user accounts are available" messaging
- Email input field
- "Update me" button (exact same style as "Submit a fact" button)
- Account benefits list
- Social icons at bottom

### Footer
- Background: #FF5353
- Multi-column layout: About, Fact Categories, Get in Touch, Join the Community
- Active links: Social media and Donate
- Inactive links: Placeholders for future pages

## Modals

### "Save Unavailable" Modal
- Construction barrier illustration
- "Saving facts is currently unavailable in beta mode" message
- Email capture form
- "Update me" button

### Share Modal
- **Active**: Copy link button → shows "Copied link to fact" toast popup
- **Inactive**: Social sharing options (Messenger, Facebook, Discord, Telegram, WhatsApp, Instagram, SMS) with "Unavailable in beta" tooltip on hover
- **Preview Section**: 
  - "PREVIEW" label
  - Header: "Stuff You Might Have Learned Wrong"
  - Dynamic fact card content (myth + truth from specific fact)
  - Retrocodex circle logo (updated version with checkmark and question mark)
  - 30px padding around preview

## Hamburger Menu
- Slides out from right
- White background
- Blurred light gray border (use box-shadow with blur)
- Links: About, Blog, Recommended reading (placeholder destinations)
- Hover state: 10% opacity #FF5353 background, 10px rounded corners, 20px padding

## Technical Constraints
- **NO Tailwind CSS** - Standard CSS only
- React components with separate CSS files
- PostgreSQL database for email capture
- Password-protected admin page at /admin for viewing emails

## Images
- **Logo**: Retrocodex line logo (circle with checkmark and question mark) - used in header and social sharing preview
- **Modal Illustration**: Construction barrier graphic for "unavailable in beta" modal
- **Category Icons**: Colorful icons for each fact category in navigation bar
- **Fact Icons**: Red X for myth, green checkmark for truth

## Interaction Behaviors
- Tab switching between Featured/Recently added (functional)
- Copy link shows temporary "Copied" confirmation
- Inactive beta features show tooltips on hover
- Hamburger menu slides out smoothly
- All external links open appropriately (Typeform, social media, donate)