# Design Spec: Remove Landing Page Hero Buttons

## Status
- **Author**: Antigravity
- **Date**: 2026-07-07
- **Status**: Approved by User

## Context & Requirements
The landing page currently contains two action buttons within the main Hero section: "Mulai Eksplorasi" (linking to `/register`) and "Pelajari Fitur" (linking to `/login`). The user wants to remove these buttons to make the UI look cleaner and simpler, prompting users to use the navigation bar's "Masuk" and "Daftar" actions exclusively.

## Proposed Changes
1. **`src/app/page.tsx`**:
   - Locate and delete the button container containing the "Mulai Eksplorasi" and "Pelajari Fitur" `Link` components.
   - Adjust the margin bottom (`mb-10 md:mb-12`) of the hero description paragraph if necessary to keep the card compact and visually balanced.

## Deployment Plan
- Deploy the updated application manually to Vercel using the Vercel CLI (`vercel` or `npx vercel`).

## Test Plan
- Run the dev server locally.
- Verify that the hero section no longer displays the two buttons.
- Verify that the navigation bar still correctly shows "Masuk" and "Daftar Sekarang" links and they remain fully functional.
- Run a production build check (`npm run build`) locally to ensure no compiler/TypeScript errors.
- Deploy to Vercel and verify the live URL works as expected.
