# Dark Scholarly Reading Experience

## Overview
Transform the catalog into a refined dark archival interface with persistent discovery controls, literary typography, tactile card interactions, bookmarks, and a focused reading overlay.

## What will change
- Rework the catalog’s visual system around charcoal surfaces, warm ivory text, restrained gold accents, and a subtle geometric background texture.
- Keep search and all filters in an elevated sticky panel beneath the site header, with the search field receiving a soft gold focus glow.
- Pair a sharp editorial serif with a decorative calligraphic accent used sparingly for category labels, scholar names, and the clear-filter action.
- Update content cards with warm sepia hover states, stronger title hierarchy, varied editorial details such as one ornate drop cap, and a soft amber title glow on the “Combining prayers while travelling” card.
- Add bookmark controls with persistent saved state in the browser, using distinct outlined and glowing gold states.
- Restyle the selected-content dialog as a cinematic focus mode: blur and dim the catalog behind it, emphasize the formatted answer, and keep the source video alongside it on larger screens and below it on mobile.
- Preserve current search, multi-filter behavior, content categories, data, and admin entry flow.

## Technical details
- Extend semantic design tokens and typography in the global stylesheet; load the selected font families through the document head.
- Keep bookmark state local to the browser, keyed by entry ID; no account or database changes.
- Use the existing accessible dialog, buttons, and responsive grid, adjusting their styling and overlay behavior rather than replacing the underlying controls.
- Validate the catalog at desktop and mobile sizes, including sticky controls, card hover/saved states, and focus mode.
