# System Architecture Assessment — AestheticAI Moodboard Builder

## Fit for Purpose
- Linear SPA flow (analyze aesthetic → find inspiration → select references → generate → moodboard) aligns with goal of guiding non-designers through aesthetic curation without prompt-crafting.
- Model choices map to tasks (analysis, brand search, generation, summary, remix) and enforce minimum curation (≥5 refs, ≥5 moodboard images) to keep results grounded in user taste.

## Strengths
- Tight, guided progression reduces cognitive load; automatic transitions keep momentum.
- Role separation across Gemini models matches latency/quality needs (Flash for search, Pro for generation, Lite for summaries).
- In-UI gating (selection counts, aesthetic guide only after moodboard ready) provides basic quality control.

## Gaps & Risks
- No backend/storage layer defined: unclear where uploads, generated images, or search results are stored, how signed URLs are managed, or how sessions persist across refreshes; pure client state risks data loss and large-memory blobs.
- AI ops are described as blocking full-screen overlays; long-running image jobs need async orchestration, retries, and progress rather than single request/response to avoid user drop-off.
- Brand search via Google + AI raises compliance/IP concerns (logo/imagery rights) and needs content safety, deduping, and attribution policies.
- Cost/performance not addressed: multiple heavy Pro calls per iteration could spike spend; no batching, caching, or guardrails on regenerate/remix loops.
- Error/edge cases unspecified: upload validation (size/type), failed analyses/searches, partial batches, model fallbacks, or recovery from lost network.
- Security/privacy: handling of user-uploaded assets and generated images (PII, brand-sensitive renders) is not covered; no mention of auth, rate limiting, or abuse controls.
- Observability absent: no logging/metrics/tracing to tune model prompts, measure conversion, or debug failures.
- State model is ad-hoc React state; lacks explicit state machine to prevent illegal transitions and to centralize side effects.

## Recommendations
- Add a thin backend (e.g., FastAPI/Next API routes) to handle uploads to object storage with signed URLs, cache brand search results, and broker model calls; return job ids for long-running image generations.
- Introduce an explicit client state machine (xstate/reducer) to guard transitions, centralize loading/error states, and make back/redo flows predictable.
- Make AI calls resilient: retries with backoff, timeouts, partial batch handling, and user-facing progress; allow background job polling instead of blocking overlays.
- Implement governance: safe-search filters, copyright/IP checks on scraped references, content moderation on prompts/outputs, and clear usage notices.
- Control cost & quality: cap regenerations per session, cache analyses/searches, reuse product embeddings, and consider lighter models when quality permits.
- Add persistence & sharing: optional session save/export, shareable moodboard links, and audit trail of selected references to support iteration.
- Set up observability: capture metrics on step drop-off, model latency, success/failure codes, and user-rated outputs to iteratively improve prompts and UX.

## Backend Options for Multimodal Imagery

### Option A: Next.js (App Router) + API Routes [BEST FOR HACKATHON]
- Pros: unified JS/TS stack with React UI; easy co-location of client and API; good DX for rapid iteration; built-in edge/server runtime split for low-latency tasks; simple storage upload endpoints with signed URLs; straightforward auth; can pair with serverless/background jobs for long image generations.
- Cons: Node image tooling is weaker than Python for heavy pre/post-processing; long-running jobs need queues/workers beyond basic API routes; type safety depends on discipline; potential cold-start overhead on some hosts.
- Timeline: hackathon-ready in ~1–3 days (API routes, signed uploads, simple polling, happy-path AI calls).

### Option B: FastAPI (Python) + Storage + Queue [PRODUCTION GRADE]
- Pros: rich AI/vision ecosystem (Pillow/OpenCV/torch) for image prep and inspection; clean async APIs; mature queues (Celery/RQ) for durable long-running image jobs; clear separation of concerns with React front-end; strong fit if model experimentation already in Python.
- Cons: introduces second language/runtime; more coordination across repos; SSR is not bundled (front-end stays separate); operational overhead if your platform is JS-first; need to manage deploys/observability separately from the UI.
- Timeline: production-ready in ~4–8+ weeks (storage, auth, rate/cost controls, queues, retries/backoff, observability, compliance, QA).

## State Machine Plan (Hackathon vs. Production)

### Hackathon (fast path)
- Implement a lean reducer or xstate-lite machine in `src/App.tsx` covering steps: `ANALYZE_AESTHETIC → FIND_INSPIRATION → SELECT_REFERENCES → GENERATE → MOODBOARD`.
- Events: `UPLOAD_SUCCESS(productAnalysis)`, `BRAND_SEARCH_SUCCESS(refs)`, `SELECT_REFS_DONE(selected)`, `GEN_BATCH_READY(images)`, `MOODBOARD_READY(summary)`, `RESET`, `BACK_TO_SELECT`.
- Guards: enforce `>=5 references` and `>=5 moodboard images` before advancing; disable generate/synthesize buttons when guard fails.
- Side effects: trigger AI calls as actions; set per-step `isLoading` and `error`; offer simple retry on failure.
- Data: keep current state shape; add `status`/`error` per step to surface failures inline.
- Timeline: ~1–3 days to wire events/guards/loading/error and hook existing AI calls.

### Production (hardening path) [BUILD CHECKLIST INCREMENTALLY IF ALL HACKATHON REQUIREMENTS ARE MET]
- Use full xstate with sub-states for `loading/success/failure` and session `idle/running/completed`.
- Invoke async services for AI/search/generation; handle `onDone/onError` with retries/backoff and support polling long-running job ids.
- Track history (`past/present`) to enable safe undo/redo and “change references” transitions.
- Isolate side effects: dedicated actions for analytics, cost/rate signals, and partial-failure handling (e.g., 3/4 images succeeded) with recovery paths.
- Persistence: optional session hydration from a token/storage to resume machines; test transitions/guards and storybook states for visual QA.
- Checklist (priority + time): 
[ ] Invoked services + retry/backoff + polling job ids (~1–2 weeks)
[ ] History/undo + guard refinements (~0.5–1 week)
[ ] Persistence/resume from tokens/storage (~0.5–1 week)
[ ] A11y/UX polish + analytics/logging + tests (unit/e2e) (~1–2 weeks)
