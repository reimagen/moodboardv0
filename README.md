<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AestheticAI Moodboard Builder

Purpose: help non-designers visualize their brand through AI-curated moodboards. The application guides users through a 5-step process:
1. **Analyze Aesthetic:** Upload a product image (or use the sample) and get a detailed AI analysis of its key design features, materials, and aesthetic. You'll also receive initial brand suggestions based on the analysis.
2. **Find Inspiration:** Explore suggested brands (from the analysis or via search) to find inspiration that aligns with your desired aesthetic.
3. **Select References:** Curate a set of reference images from the chosen brands to guide the AI's image generation.
4. **Generate Moodboard:** Generate new, on-brand image variations based on your product and selected references.
5. **Aesthetics Guide:** Synthesize an aesthetic guide, detailing the visual language and principles of your moodboard.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Set `GEMINI_API_KEY` in `.env.local` (see `.env.example`)
3. Run the app: `npm run dev`

## Notes
- Sample product: click “Use Sample Product” on the Analyze Aesthetic step to skip analysis (served from `public/stanley.webp`).
- Test Mode toggle (under the logo): switches to cheaper/abridged flows for:
  - **Analyze Aesthetic** (Step 1): Uses lighter model/prompt.
  - **Aesthetic Guide** (Step 5): Generates a shorter summary.
  - *Note: Find Inspiration (Step 2), Select References (Step 3), and Generate Moodboard (Step 4) use production models in both modes.*
- Generation produces 6 images per batch so you can meet the 5-image moodboard minimum. Use like/unlike to curate.
- See `src/services/gemini/geminiModels.ts` for model policy and configuration details.
