---
name: Amber Terminal Modern
colors:
  surface: '#191209'
  surface-dim: '#191209'
  surface-bright: '#40382d'
  surface-container-lowest: '#130d05'
  surface-container-low: '#211a11'
  surface-container: '#251e15'
  surface-container-high: '#30291e'
  surface-container-highest: '#3c3429'
  on-surface: '#eee0d0'
  on-surface-variant: '#d7c4ac'
  inverse-surface: '#eee0d0'
  inverse-on-surface: '#372f25'
  outline: '#9f8e78'
  outline-variant: '#524533'
  surface-tint: '#ffba43'
  primary: '#ffd597'
  on-primary: '#432c00'
  primary-container: '#ffb000'
  on-primary-container: '#6a4700'
  inverse-primary: '#805600'
  secondary: '#c7c6c7'
  on-secondary: '#303032'
  secondary-container: '#464748'
  on-secondary-container: '#b6b5b6'
  tertiary: '#dbdbdb'
  on-tertiary: '#2f3131'
  tertiary-container: '#bebfbf'
  on-tertiary-container: '#4c4e4e'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddaf'
  primary-fixed-dim: '#ffba43'
  on-primary-fixed: '#281800'
  on-primary-fixed-variant: '#614000'
  secondary-fixed: '#e3e2e3'
  secondary-fixed-dim: '#c7c6c7'
  on-secondary-fixed: '#1b1c1d'
  on-secondary-fixed-variant: '#464748'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#191209'
  on-background: '#eee0d0'
  surface-variant: '#3c3429'
typography:
  display-xl:
    fontFamily: Space Grotesk
    fontSize: 80px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.15em
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  section-padding: 120px
  grid-columns: '12'
---

## Brand & Style

This design system is built on a foundation of **Technical Minimalism** infused with a high-end, editorial sensibility. It evokes the feeling of a sophisticated command center—one that is intentional, unhurried, and precise. The aesthetic leverages the stark, high-contrast relationship between a deep atmospheric void and a singular, radiant warmth.

The style combines the structural rigour of a modular grid with atmospheric depth. It utilizes refined borders and subtle luminescence to create a sense of focused energy. This is not a "noisy" interface; it is a quiet, powerful environment designed for high-impact storytelling where every element serves a structural or narrative purpose.

## Colors

The palette is restricted to three core pillars to maintain maximum impact and premium restraint.

- **The Void (#08090A):** A near-black that provides infinite depth. It is the canvas for all interactions and serves as the primary background.
- **The Amber (#FFB000):** A warm, high-visibility accent used sparingly for primary actions, critical data points, and intentional focus. It carries a subtle inner glow to mimic a high-end terminal phosphor.
- **The Structure (White/10):** Semi-transparent white is used for borders, grid lines, and secondary dividers. This creates a "glass-etched" effect without the heavy blur of traditional glassmorphism.
- **Neutrality:** Grays are avoided in favor of varying opacities of white against the black background to maintain color purity.

## Typography

This design system exclusively uses **Space Grotesk**. Its geometric quirks and technical roots provide the "terminal" feel while remaining highly legible for long-form marketing copy. 

Headlines utilize tight letter-spacing and heavy weights to create a sense of density and gravity. Body text is set with generous line height to ensure an unhurried reading experience. Labels and utility text are always set in uppercase with increased letter spacing, mimicking the metadata found in professional technical interfaces.

## Layout & Spacing

The layout is governed by a **fixed 12-column grid** centered within a maximum width container. To achieve a high-end feel, whitespace is used aggressively between major sections (120px+). 

Internal spacing follows an 8px linear scale. Elements are often "boxed" into the grid using the 1px white/10 borders, creating a structured, architectural look. Alignment is strictly adhered to; text should often align to the vertical lines of the grid to reinforce the "terminal" structure. Margin and padding should feel spacious, never cramped.

## Elevation & Depth

Depth is conveyed through **Light Emission** rather than shadows. In a near-black environment, traditional shadows are invisible; instead, we use "glows" and "borders" to define hierarchy.

- **Level 0 (Floor):** The #08090A background.
- **Level 1 (Panels):** Defined by a 1px border of `rgba(255, 255, 255, 0.1)`. No background color change is necessary, keeping the interface light and "hollow."
- **Level 2 (Active/Hover):** Background fills with a subtle `rgba(255, 255, 255, 0.03)` and a soft external glow in Amber for interactive elements.
- **Accents:** Use a 20px-40px blur radius for Amber glows behind key cards or CTA areas to create a "bloom" effect common in high-end lenses.

## Shapes

The shape language is **Sharp (0px)**. To maintain a modern, technical, and sophisticated vibe, corners are kept perfectly square. This reinforces the "grid" and "terminal" narrative, moving away from the consumer-friendly roundness of standard SaaS apps. 

Decorative elements may include 45-degree chamfered corners on specific UI components like buttons or tags to add a "military-grade" or "aerospace" aesthetic without introducing curves.

## Components

- **Buttons:** Primary buttons are solid Amber (#FFB000) with black text. Secondary buttons are transparent with a 1px White/10 border. All buttons use sharp corners and hover states that increase the intensity of the Amber glow.
- **Inputs:** Minimalist bottom-border only or full-box with 1px White/10 borders. Focus state shifts the border to Amber with a subtle outer bloom.
- **Cards:** Defined by their 1px White/10 borders. They do not have background fills unless they are being hovered. 
- **Chips/Tags:** Small, uppercase labels with a subtle border. Used for categorizing technical specifications.
- **Data Visualizations:** Use the Amber color for all data points. Background grid lines for charts should use White/05 (half the opacity of standard borders) to remain background-level.
- **Grid Dividers:** Horizontal and vertical lines that span the full width of the container, used to separate sections with mathematical precision.