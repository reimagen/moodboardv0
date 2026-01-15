# Moodboard Application - Architecture Plan (v2)

## Goal
Build a **filter-driven moodboard builder** for the Gemini 3 hackathon. No user prompts - users select preset filters and the AI generates/curates images under the hood until they save 5+ images.

## User Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. FILTER SELECTION (or skip for Explore Mode)             │
│     ┌─────────┐  ┌─────────┐  ┌─────────┐                   │
│     │  Mood   │  │  Color  │  │Industry │                   │
│     │Aesthetic│  │ Palette │  │ Purpose │                   │
│     └─────────┘  └─────────┘  └─────────┘                   │
├─────────────────────────────────────────────────────────────┤
│  2. IMAGE SUGGESTIONS (swipe/save interface)                │
│     ┌─────────────────────┐                                 │
│     │                     │    [Skip]  [Save]               │
│     │   Suggested Image   │                                 │
│     │   (AI-generated or  │    Saved: 2/5                   │
│     │    curated)         │                                 │
│     └─────────────────────┘                                 │
├─────────────────────────────────────────────────────────────┤
│  3. MOODBOARD COMPLETE (5+ images saved)                    │
│     ┌───┐ ┌───┐ ┌───┐                                       │
│     │ 1 │ │ 2 │ │ 3 │  → View/Export Moodboard              │
│     └───┘ └───┘ └───┘                                       │
│     ┌───┐ ┌───┐                                             │
│     │ 4 │ │ 5 │                                             │
│     └───┘ └───┘                                             │
└─────────────────────────────────────────────────────────────┘
```

## Filter Categories

### Mood/Aesthetic
- Minimalist, Cozy, Bold, Vintage, Futuristic, Elegant, Playful, Dark, Earthy, Luxurious

### Color Palette
- Warm Tones, Cool Tones, Monochrome, Pastel, Vibrant, Muted, Earth Tones, Jewel Tones

### Industry/Purpose
- Fashion, Interior Design, Branding, Travel, Food, Tech, Wedding, Art, Architecture

### Explore Mode
- No filters selected = varied/random suggestions

## Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | Next.js 15 (App Router) | Full-stack React |
| AI | @google/genai | Direct Gemini API calls |
| Image Gen | Gemini 3 Pro Image / Imagen 3 | Generate moodboard images |
| Styling | Tailwind CSS | UI styling |
| State | React useState + localStorage | Session persistence |

**Note:** Simplified from ADK to direct Gemini API calls - no agent orchestration needed for filter-based prompting.

## Architecture

```
src/
├── app/
│   ├── page.tsx                 # Filter selection screen
│   ├── build/page.tsx           # Image suggestion/save screen
│   ├── moodboard/page.tsx       # Final moodboard view
│   └── api/
│       └── suggest/route.ts     # Image generation endpoint
├── lib/
│   ├── prompts.ts               # Filter → prompt templates
│   ├── filters.ts               # Filter definitions
│   └── gemini.ts                # Gemini client setup
└── components/
    ├── FilterSelector.tsx       # Filter chips UI
    ├── ImageCard.tsx            # Suggestion card with save/skip
    └── MoodboardGrid.tsx        # Final moodboard display
```

## Prompt Engineering

The key is converting filter selections into effective image generation prompts:

```typescript
// Example: filters → prompt
const filters = {
  mood: 'minimalist',
  color: 'warm-tones',
  industry: 'interior-design'
};

const prompt = `Generate a moodboard image:
A minimalist interior design photograph with warm tones.
Style: clean, sophisticated, aspirational.
Mood: calm, inviting, modern.`;
```

## API Endpoint: /api/suggest

```typescript
POST /api/suggest
Body: { filters: FilterSelection, excludeIds?: string[] }
Response: {
  imageUrl: string,      // base64 or URL
  id: string,            // unique ID
  source: 'generated' | 'curated'
}
```

## Implementation Phases

### Phase 1: Project Setup ✅
- [x] Next.js 15 + TypeScript + Tailwind
- [x] Dependencies installed
- [ ] Update structure for new architecture

### Phase 2: Filter System
1. Define filter categories and options in `lib/filters.ts`
2. Build prompt templates in `lib/prompts.ts`
3. Create FilterSelector component
4. Build filter selection page

### Phase 3: Image Generation
1. Set up Gemini client in `lib/gemini.ts`
2. Create `/api/suggest` endpoint
3. Implement prompt building from filters
4. Handle image generation responses

### Phase 4: Suggestion UI
1. Build ImageCard component (save/skip buttons)
2. Create build page with suggestion flow
3. Track saved images (minimum 5)
4. Handle "keep suggesting" loop

### Phase 5: Moodboard View
1. Build MoodboardGrid component
2. Create final moodboard page
3. Add localStorage persistence
4. Optional: export/share functionality

## Verification Plan

1. **Filter Test**: Select filters → verify prompt generated correctly
2. **Generation Test**: Call `/api/suggest` → verify image returned
3. **Flow Test**: Select filters → save 5 images → view moodboard
4. **Explore Test**: Skip filters → verify varied suggestions

## Files to Modify/Create

- `src/app/page.tsx` - Replace with filter selection UI
- `src/app/build/page.tsx` - New suggestion screen
- `src/app/moodboard/page.tsx` - New final view
- `src/app/api/suggest/route.ts` - New endpoint (replace /api/chat)
- `src/lib/filters.ts` - New filter definitions
- `src/lib/prompts.ts` - New prompt templates
- `src/lib/gemini.ts` - New Gemini client
- `src/components/FilterSelector.tsx` - New component
- `src/components/ImageCard.tsx` - New component
- `src/components/MoodboardGrid.tsx` - New component
- Remove: `src/lib/agents/`, `src/lib/tools/`, `src/app/api/chat/`
