# Cal.com Design System — Applied to Live Quran Academy

Based on: `awesome-design-md/design-md/cal/DESIGN.md` (v1.0)

## Core Philosophy

White canvas, black CTAs, scheduling-first. This is **Cal** applied verbatim — not adapted, not hybridized. Live Quran Academy reads as if Cal's own team built a live classroom scheduler.

## Tokens

### Colors
- Canvas: #ffffff
- Primary: #111111 (all CTAs, h1/h2 display type)
- Primary-active: #242424
- Primary-disabled: #e5e7eb
- Ink: #111111 (headlines, primary text)
- Body: #374151 (running text)
- Muted: #6b7280 (secondary text, captions, breadcrumbs)
- Muted-soft: #898989 (fine-print, copyright)
- Hairline: #e5e7eb (borders, inputs, table dividers)
- Hairline-soft: #f3f4f6 (section dividers on white)
- Surface-soft: #f8f9fa (pill-group bg, subtle dividers)
- Surface-card: #f5f5f5 (feature cards, testimonial cards, badge bg)
- Surface-strong: #e5e7eb (disabled button bg)
- Surface-dark: #101010 (footer only)
- Surface-dark-elevated: #1a1a1a (dark footer nested cards)
- On-primary: #ffffff
- On-dark: #ffffff
- On-dark-soft: #a1a1aa
- Brand-accent: #3b82f6 (spare — inline links only)
- Success: #10b981
- Warning: #f59e0b
- Error: #ef4444

### Typography — Inter everywhere (Cal Sans substitute per DESIGN.md)
- Display: Inter 600, -0.04em letter-spacing
- Body: Inter 400, 16px, 1.5 leading
- Button: Inter 600, 14px, 1.0 leading
- Nav: Inter 500, 14px, 1.4 leading
- Caption: Inter 500, 13px, 1.4 leading
- Code/mono: JetBrains Mono (PinPad only)

### Spacing (4px base)
- xxs: 4px, xs: 8px, sm: 12px, md: 16px, lg: 24px, xl: 32px, xxl: 48px, section: 96px

### Border Radius
- xs: 4px, sm: 6px, md: 8px (buttons, inputs, tabs), lg: 12px (cards), xl: 16px (hero mockup), pill: 9999px (badges, nav-pill)

### Shadows
- Subtle: `0 1px 2px rgba(0,0,0,0.05)`
- Elevated: `0 4px 12px rgba(0,0,0,0.08)`
- No heavy shadows, no neumorphism, no glassmorphism

## Page Architecture

### BaseLayout (app pages)
- White canvas (no gradient)
- Top nav: 64px, white bg, hairline bottom border, Inter 500 14px
- Logo: "Live Quran Academy" in Inter 600 (logo text only)
- Content: directly on white canvas, max-w-4xl centered, py-xxl
- NO white container card
- NO dark footer on app pages

### AuthLayout (login pages)
- White canvas, centered card max-w-sm
- Card: white bg, hairline border, subtle drop shadow, 32px padding
- No gradient, no header/nav

### Landing Page
- Hero band: 96px top/bottom padding, h1 + subtitle + CTAs
- Dark footer (#101010) to close the page
- Feature cards (3-up, surface-card bg) if needed later

### Components
- button-primary: #111111, 40px h, 8px radius, 12px/20px padding, Inter 600 14px
- button-secondary: white, hairline border, same padding/height/radius
- text-input: 40px h, 8px radius, hairline border, 10px/14px padding, Inter 400 16px
- badge-pill: surface-card bg, pill shape, caption type, 4px/12px padding
- feature-card: surface-card bg, 12px radius, 32px padding
- avatar-circle: 36px, rounded-full, pastel fills with initials

## Per-Page

### Landing (index.astro)
- Hero: h1 "Live Quran Academy" (display, Inter 600, -0.04em), subtitle "Live online Quran classes for kids and adults", 2 CTAs → Teach / Learn login
- Dark footer (surface-dark, 64px padding, on-dark-soft text)
- No feature cards yet (keep simple)

### Teach Login
- AuthLayout card
- PinPad component restyled: Cal inputs (hairline border, 8px radius, mono PIN), Cal button-primary
- Error text in Cal error red + muted style

### Learn Login
- Same card, title "Student Login"

### Admin Login
- Same card, title "Admin"

### Teacher Dashboard
- White canvas
- Top nav with "Live Quran Academy" + user name + logout
- Date in muted text, Inter 14px
- Slot cards: surface-card bg, 12px radius, 32px padding
  - Left: time (Inter 600, 28px display-sm, -0.5em), "X/3 students" (muted caption)
  - Center: student badges (badge-pill, Inter 500 13px) or surface-card muted "Empty"
  - Right: assign + button (Cal icon-circle or text-link), remaining time (muted caption)
  - Live slot → Cal button-primary "Join"
- "Add Slot" → Cal button-primary
- "Manage Students" → Cal button-secondary

### Student Dashboard
- White canvas
- Centered slot card: hairline border, 12px radius, 32px padding
- Time in display-sm (28px, Inter 600, -0.5em)
- "Join Class" → Cal button-primary

### Student Management
- White canvas
- Student cards: surface-card bg, 12px radius, 24px padding (product-mockup-card style)
- Avatar circle (36px, pastel bg with initials)
- Name (title-sm), Title (body-sm muted), PIN (mono, muted)
- Remove → Cal text-button in error color
- "Add Student" → Cal button-primary

### Admin Dashboard
- Stats row: surface-card cards with count + label
- Teacher cards: same student card pattern
- "+ Add Teacher" → Cal button-primary

### Video Room
- Clean iframe chrome
- Top: room title + back link
- iframe in white canvas area with hairline border

### PinPad Restyle
- Cal text-input with hairline border, 40px h, 8px radius
- PIN digits: font-mono (JetBrains Mono), text-ink, large tracking
- Keypad buttons: Cal button-secondary (white, hairline)
- Submit → Cal button-primary
