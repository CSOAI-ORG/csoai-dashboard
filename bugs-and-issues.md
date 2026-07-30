# CSOAI Dashboard - Comprehensive Bug & Design Issues Report

## CRITICAL BUGS

### 1. Database Query Error - system_incidents table
**Severity**: CRITICAL
**Location**: Backend - system_incidents query
**Error**: `Unknown column 'nan' in 'where clause'`
**Details**: 
```
DrizzleQueryError: Failed query: select `id`, `title`, `description`, `status`, `severity`, `affectedServices`, `startedAt`, `identifiedAt`, `monitoringAt`, `resolvedAt`, `createdAt`, `updatedAt`, `reportedBy`, `reporterEmail`, `reporterName`, `isPublic` from `system_incidents` where `system_incidents`.`id` = ? limit ?
cause: Error: Unknown column 'nan' in 'where clause'
code: 'ER_BAD_FIELD_ERROR'
```
**Impact**: Application fails to load incident data, likely breaking Watchdog functionality
**Fix Required**: Check where `id` parameter is being passed as `NaN` instead of a valid number

### 2. Browser Automation Artifacts Visible
**Severity**: HIGH
**Location**: All pages - navigation and interactive elements
**Issue**: Numbered boxes (1-82) are visible overlaying all interactive elements
**Impact**: Unprofessional appearance, confuses users, makes UI look broken
**Fix Required**: These are browser automation markers that should never be visible in production. Need to ensure they're only rendered during testing/automation.

## DESIGN ISSUES

### Navigation & Header

1. **Navigation Overcrowding**
   - Too many top-level navigation items (11+ items)
   - Dropdowns not clearly indicated
   - Mobile responsiveness likely problematic
   - **Recommendation**: Consolidate into 5-6 main categories with better dropdown organization

2. **Language Selector**
   - Uses flag emoji (🇺🇸) which may not render consistently
   - **Recommendation**: Use proper flag icons or text-only approach

3. **Sidebar Navigation (Dashboard)**
   - Very long list of items (40+ links)
   - No visual grouping or hierarchy
   - Difficult to scan and find items
   - **Recommendation**: Add section headers, collapsible groups, better visual hierarchy

### Color & Contrast Issues

1. **Homepage Countdown Banner**
   - Light pink background with light text = poor contrast
   - Red countdown numbers clash with overall color scheme
   - Border too subtle
   - **WCAG Compliance Risk**: May fail contrast ratio requirements
   - **Fix**: Increase contrast, use darker text or darker background

2. **Overall Color Palette**
   - Light mint/teal background lacks depth and sophistication
   - No clear color hierarchy or semantic meaning
   - Needs more sophisticated color system
   - **Recommendation**: 
     - Define primary, secondary, accent colors
     - Add proper semantic tokens (success, warning, error, info)
     - Use subtle gradients and shadows for depth

3. **Hero Section Typography**
   - Green text ("The Solution to AI Safety...") may have contrast issues
   - Mixed case in headlines lacks consistency
   - **Fix**: Ensure 4.5:1 contrast ratio minimum, standardize headline casing

### Typography Issues

1. **Font Hierarchy Weak**
   - Not enough weight differentiation between headings and body
   - All text appears to use similar weights
   - **Recommendation**: 
     - Use bold display font (700-800) for main headlines
     - Use medium (500-600) for subheadings
     - Use regular (400) for body text
     - Consider adding a display font family for hero sections

2. **Text Readability**
   - Some sections have insufficient line-height
   - Paragraph widths too wide in some areas
   - **Fix**: Increase line-height to 1.6-1.8, limit paragraph width to 65-75 characters

### Layout & Spacing

1. **Hero Section Cramped**
   - Countdown banner needs more padding
   - Hero headline needs more vertical breathing room
   - **Fix**: Increase padding/margin values by 1.5-2x

2. **Dashboard Stat Cards**
   - Cards appear cut off or incomplete (showing partial text like "iew", "dog", "ing", "ation", "tory")
   - Layout breaking or text truncation issues
   - **Fix**: Review card component layout, ensure proper text overflow handling

3. **Footer Overcrowded**
   - Too many links in footer
   - Poor visual hierarchy
   - Legal text blocks too dense
   - **Recommendation**: Better grouping, more whitespace, collapsible sections

### Button & Interactive Elements

1. **CTA Button Design**
   - "Start Free Training Now" button is aggressive bright red
   - Lacks depth/shadow for prominence
   - No clear hover state indication
   - **Recommendation**:
     - Use more sophisticated color (e.g., deep blue, teal, or purple)
     - Add subtle shadow and hover lift effect
     - Ensure consistent button styling across site

2. **Button Hierarchy Unclear**
   - Primary vs secondary buttons not clearly differentiated
   - **Fix**: Define clear button variants (primary, secondary, outline, ghost)

### Component-Specific Issues

1. **PDCA Cycle Visualization**
   - Status badges show "Pending", "Active" but visual hierarchy unclear
   - Progress indicators (0%, 50%) need better visual representation
   - **Recommendation**: Add progress bars, use color coding for status

2. **Compliance Cards**
   - Progress percentages shown but no visual progress bar
   - Deadline dates not prominently displayed
   - **Fix**: Add circular or linear progress indicators

3. **Stat Cards (Dashboard)**
   - Text appears truncated or cut off
   - Icons and text alignment issues
   - **Fix**: Review flexbox/grid layout, ensure proper text wrapping

4. **Welcome Tour Dialog**
   - Appears on every page load (annoying UX)
   - Should only show once or have "Don't show again" option
   - **Fix**: Add localStorage flag to track if user has seen tour

## ACCESSIBILITY ISSUES

1. **Color Contrast**
   - Multiple areas likely fail WCAG AA standards (4.5:1 ratio)
   - Need to audit all text/background combinations

2. **Keyboard Navigation**
   - Need to verify all interactive elements are keyboard accessible
   - Focus indicators may not be visible enough

3. **Screen Reader Support**
   - Emoji usage (🎁, 🇺🇸) may not have proper aria-labels
   - Complex visualizations may need better descriptions

## PERFORMANCE ISSUES

1. **Page Load**
   - Very long page (11122px below viewport on homepage)
   - May impact initial load performance
   - **Recommendation**: Implement lazy loading for below-fold content

2. **Image Optimization**
   - Need to check if images are optimized
   - Consider using modern formats (WebP, AVIF)

## FUNCTIONAL BUGS TO INVESTIGATE

1. **Referral Program**
   - Shows "0+ people have signed up" (should be actual number)
   - May be data loading issue

2. **Dashboard Tabs**
   - Multiple tabs (Overview, Watchdog, Training, Certification, Regulatory)
   - Need to verify all tabs load correctly and show appropriate content

3. **Authentication State**
   - Shows both "Sign In" and "Get Started" buttons
   - Shows "Admin User" avatar in dashboard
   - Need to verify auth flow is working correctly

## MOBILE RESPONSIVENESS (TO TEST)

- [ ] Navigation collapses properly on mobile
- [ ] Sidebar becomes hamburger menu
- [ ] Stat cards stack vertically
- [ ] Tables become scrollable
- [ ] Footer links reorganize
- [ ] Countdown timer remains readable

## PRIORITY RANKING

### P0 (Critical - Fix Immediately)
1. Database query error (system_incidents)
2. Browser automation artifacts visible
3. Stat card text truncation on dashboard

### P1 (High - Fix Soon)
1. Countdown banner contrast issues
2. Navigation overcrowding
3. Sidebar organization
4. Welcome tour persistence

### P2 (Medium - Design Improvements)
1. Color palette refinement
2. Typography hierarchy
3. Button styling consistency
4. Spacing improvements

### P3 (Low - Polish)
1. Micro-interactions
2. Loading states
3. Empty states
4. Visual assets generation

## TESTING CHECKLIST

- [ ] Fix database error and verify Watchdog page loads
- [ ] Remove browser automation artifacts
- [ ] Test all navigation dropdowns
- [ ] Verify dashboard stat cards display correctly
- [ ] Test mobile responsive layout
- [ ] Verify color contrast ratios
- [ ] Test keyboard navigation
- [ ] Verify all CTAs work correctly
- [ ] Test authentication flow
- [ ] Verify PDCA cycle visualization
- [ ] Test compliance framework pages
- [ ] Verify training/certification pages
