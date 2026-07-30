# Verification Notes - Jan 5, 2026

## Byzantine Council Visualization
- Successfully added to homepage
- Section title: "See Our Byzantine Council in Action"
- Subtitle: "33 AI agents working together for impartial, vendor-independent safety decisions."
- Shows animated SVG visualization with:
  - 33 council nodes in a circular arrangement
  - 4 feature nodes (Public Watchdog, CEASAI Certification, CSOAI Learn, SOAI-PDCA)
  - Animated data particles flowing between nodes
  - Real-time stats: Consensus Reached, Council Agents (33), Active Signals
- Legend shows all 5 categories with color coding
- Dark background section (gray-900 to gray-800 gradient)

## Authentication Error Fix
- Fixed in main.tsx - query and mutation cache subscribers now filter out authentication errors
- Uses `isExpectedUserError` helper to check for UNAUTHED_ERR_MSG
- Prevents "Please login (10001)" errors from being reported to Sentry

## Verification Status
- Homepage loads correctly
- Byzantine visualization section is visible after scrolling past "Four Problems" section
- Animation is working (consensus count incrementing, active signals changing)
