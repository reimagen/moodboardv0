<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AestheticAI Moodboard Builder

Purpose: help non-designers visualize their brand through AI-curated moodboards. Users upload a product image (or use the sample), pick brands they like (e.g., “Apple”), select reference images, and the app generates on-brand variations plus an aesthetic guide—no need to know design jargon.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Set `GEMINI_API_KEY` in `.env.local` (see `.env.example`)
3. Run the app: `npm run dev`

## Notes
- Sample product: click “Use Sample Product” on the upload step to skip analysis (served from `public/stanley.webp`).
- Test Mode toggle (under the logo): switches to cheaper/abridged flows for:
  - **Product Analysis** (Step 1): Uses lighter model/prompt.
  - **Aesthetic Guide** (Step 5): Generates a shorter summary.
  - *Note: Brand Search and Image Generation use production models in both modes.*
- Generation produces 6 images per batch so you can meet the 5-image moodboard minimum. Use like/unlike to curate.
- See `src/services/gemini/geminiModels.ts` for model policy and configuration details.
