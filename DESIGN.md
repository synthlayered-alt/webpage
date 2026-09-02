---
name: SYNTH LAYERED — Editorial AI Film Production Design System
version: "2.0.0"
description: Design specification inspired by minimal editorial design systems (Tomoro Sugawara reference) combined with cinematic AI video production aesthetics.

colors:
  primary: "#0C100E"        # Deep Forest Obsidian base
  secondary: "#131916"      # Dark Sage Obsidian card surface
  surface-elevated: "#1A221E"
  accent-pine: "#4E7A5D"    # Key Sage/Pine Green Accent
  accent-sage-light: "#7CA98B"
  neutral-light: "#F5F7F5"  # Warm Off-White Text
  neutral-muted: "#88978E"  # Slate Sage Secondary Text
  border-hairline: "rgba(124, 144, 131, 0.18)"
  border-focus: "rgba(124, 169, 139, 0.45)"
  glass-bg: "rgba(19, 25, 22, 0.78)"

typography:
  headline-display:
    fontFamily: "Montserrat, sans-serif"
    fontWeight: "700"
    letterSpacing: "0.04em"
    lineHeight: "1.2"
  section-index:
    fontFamily: "Montserrat, monospace"
    fontSize: "0.8125rem"
    fontWeight: "600"
    letterSpacing: "0.18em"
  body-editorial:
    fontFamily: "Pretendard, 'IBM Plex Sans KR', sans-serif"
    fontSize: "1rem"
    lineHeight: "1.8"
    letterSpacing: "-0.015em"
  label-bracket:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "0.75rem"
    letterSpacing: "0.1em"

rounded:
  xs: "2px"
  sm: "6px"
  md: "10px"
  lg: "16px"
  full: "9999px"

spacing:
  xs: "6px"
  sm: "12px"
  md: "24px"
  lg: "48px"
  xl: "96px"

components:
  nav:
    height: "80px"
    backgroundColor: "rgba(12, 16, 14, 0.85)"
    backdropBlur: "20px"
    borderBottom: "1px solid {colors.border-hairline}"
  section-header:
    display: "flex"
    alignItems: "baseline"
    gap: "16px"
    marginBottom: "{spacing.lg}"
  card-work:
    backgroundColor: "{colors.secondary}"
    border: "1px solid {colors.border-hairline}"
    rounded: "{rounded.sm}"
    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
  button-primary:
    backgroundColor: "{colors.accent-pine}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    letterSpacing: "0.06em"
---

## Overview
**SYNTH LAYERED** is a premier Commercial AI Video Advertising Production Agency.
The revised design system adopts an **Editorial Gallery Aesthetic** inspired by modern Japanese architectural & web design, balancing rigorous marketing logic with cinematic visual storytelling.

## Design Tenets

### 1. Editorial Section Indexing
- Every major section is identified with precision numbering (`01 / PHILOSOPHY`, `02 / WORKFLOW`, `03 / ARCHIVE`, `04 / CONTACT`).
- Hairline borders (`1px solid rgba(124, 144, 131, 0.18)`) define crisp architectural boundaries without visual clutter.

### 2. Deep Forest Obsidian & Pine Palette
- Natural, deep forest dark tones (`#0C100E`) replace generic pure black for superior visual comfort and high-end prestige.
- Pine Sage Green (`#4E7A5D`) is used strategically for focus points, badges, active states, and call-to-actions.

### 3. Dual-Type Hierarchy
- **Display & Labels**: `Montserrat` gives geometric structure, uppercase elegance, and editorial polish.
- **Body Copy**: `Pretendard` with generous `1.8` line-height guarantees effortless multi-language readability for Korean, English, and Japanese.

### 4. Frame-Oriented Work Cards
- Project cards feature explicit header brackets (`[ 01 ] BRAND FILM · OVENMARU ↗`), clean media viewports, and structured metadata footers.
