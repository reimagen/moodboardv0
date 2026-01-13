# Moodboard Application - System Architecture Diagrams

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  USER BROWSER                                │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    React 19 + TypeScript Frontend                       │ │
│  │                                                                          │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │ │
│  │  │   Auth UI   │  │  Workflow   │  │   Projects   │  │   Agent     │  │ │
│  │  │             │  │  Components │  │   Dashboard  │  │   Progress  │  │ │
│  │  └─────────────┘  └─────────────┘  └──────────────┘  └─────────────┘  │ │
│  │                                                                          │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │ │
│  │  │              Contexts (Auth, Project, Toast)                     │   │ │
│  │  └─────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                          │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │ │
│  │  │   Services (Firebase, Gemini, Google Search, Nano Banana)       │   │ │
│  │  └─────────────────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                         ┌────────────┼────────────┐
                         │            │            │
                         ▼            ▼            ▼
              ┌──────────────┐ ┌───────────┐ ┌──────────────┐
              │   Firebase   │ │  Gemini   │ │Google Search │
              │   Services   │ │    API    │ │     API      │
              └──────────────┘ └───────────┘ └──────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌─────────────┐ ┌──────────┐ ┌──────────┐
│  Firebase   │ │Firestore │ │ Firebase │
│    Auth     │ │ Database │ │ Storage  │
└─────────────┘ └──────────┘ └──────────┘
```

---

## 2. Data Flow Architecture

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                         USER WORKFLOW DATA FLOW                               │
└───────────────────────────────────────────────────────────────────────────────┘

STEP 1: AUTHENTICATION
┌──────────┐
│   User   │──[Login]──▶ Firebase Auth ──▶ JWT Token ──▶ Store in Context
└──────────┘                                                      │
                                                                  ▼
                                                        Enable Access to App

STEP 2: UPLOAD PRODUCT IMAGE
┌──────────┐
│   User   │──[Upload]──▶ Firebase Storage ──▶ Get URL ──▶ Gemini Flash
└──────────┘                     │                              │
                                 │                              ▼
                                 │                      [Analyze Product]
                                 │                              │
                                 ▼                              ▼
                         Store Image URL ◀────────────  Store Analysis
                         in Firestore                    in Firestore


STEP 3: BRAND SEARCH
┌──────────┐
│   User   │──[Search Brand]──▶ Check brandReferences Cache
└──────────┘                              │
                                          ├──[Cache Hit]──▶ Return Cached Data
                                          │
                                          └──[Cache Miss]──▶ Google Custom Search API
                                                                    │
                                                                    ▼
                                                            Get Real Brand Images
                                                                    │
                                                                    ▼
                                                             Gemini Flash
                                                          [Analyze Brand]
                                                                    │
                                                                    ▼
                                                         Store in brandReferences
                                                            (7-day cache)
                                                                    │
                                                                    ▼
                                                        Return Images + Analysis


STEP 4: ITERATIVE GENERATION (NANO BANANA AGENT)
┌──────────┐
│   User   │──[Click Generate]──▶ Create agentJobs/{jobId}
└──────────┘                              │
     ▲                                    ▼
     │                          ┌──────────────────────┐
     │                          │  NANO BANANA AGENT   │
     │                          └──────────────────────┘
     │                                    │
     │              ┌────────────────────┼────────────────────┐
     │              │                    │                    │
     │              ▼                    ▼                    ▼
     │        [Analyzing]          [Generating]         [Completed]
     │        Gemini Flash         Gemini Pro Image     Update Status
     │        Create Plan          Parallel Gen         Store Results
     │              │                    │                    │
     │              │                    │                    │
     │              └────────────────────┴────────────────────┘
     │                                    │
     │                                    ▼
     │                          Update agentJobs Progress
     │                          (Real-time Firestore)
     │                                    │
     │                                    ▼
     │                          Frontend Receives Update
     │                          (onSnapshot listener)
     │                                    │
     │                                    ▼
     │                            Display Progress UI
     │                                    │
     │                                    ▼
     │                        Store Images in Firebase Storage
     │                                    │
     │                                    ▼
     │                    Store Metadata in generatedImages Collection
     │                                    │
     └────────────────────────────────────┘
              User Rates Images (Like/Dislike)
                      │
                      ▼
              IF moodboard.length < 5:
                  Enable "Generate" again (iterative)
              ELSE:
                  Enable "Finish" button


STEP 5: MOODBOARD SUMMARY
┌──────────┐
│   User   │──[Finish]──▶ Collect Liked Images (5+)
└──────────┘                      │
                                  ▼
                           Gemini Flash Lite
                        [Generate Summary]
                                  │
                                  ▼
                      Store aestheticSummary in Project
                                  │
                                  ▼
                         Display Final Moodboard
```

---

## 3. Nano Banana Agent Architecture

```
┌───────────────────────────────────────────────────────────────────────────┐
│                       NANO BANANA AGENT FLOW                               │
└───────────────────────────────────────────────────────────────────────────┘

                            User Clicks "Generate"
                                      │
                                      ▼
                        ┌──────────────────────────┐
                        │  Create Agent Job        │
                        │  (Firestore: agentJobs)  │
                        │  Status: 'pending'       │
                        └──────────────────────────┘
                                      │
                                      ▼
                        ┌──────────────────────────┐
                        │   PHASE 1: PLANNING      │
                        │   (Gemini Flash - $0.0002)│
                        └──────────────────────────┘
                                      │
                ┌─────────────────────┼─────────────────────┐
                │                     │                     │
                ▼                     ▼                     ▼
        Analyze Product       Analyze References    Parse User Context
        (from Firestore)      (image URLs)          (text input)
                │                     │                     │
                └─────────────────────┴─────────────────────┘
                                      │
                                      ▼
                        ┌──────────────────────────┐
                        │  Generate Plan (JSON)    │
                        │  {                       │
                        │    numberOfImages: 6,    │
                        │    variations: [         │
                        │      "variation 1",      │
                        │      "variation 2",      │
                        │      ...                 │
                        │    ],                    │
                        │    estimatedCost: 0.30   │
                        │  }                       │
                        └──────────────────────────┘
                                      │
                                      ▼
                        ┌──────────────────────────┐
                        │  Check User Quota        │
                        │  remaining >= images?    │
                        └──────────────────────────┘
                                      │
                        ┌─────────────┴─────────────┐
                        │                           │
                       NO                          YES
                        │                           │
                        ▼                           ▼
                  Throw Error              Update Status: 'generating'
                  "Quota exceeded"                  │
                                                    ▼
                        ┌──────────────────────────────────────────┐
                        │       PHASE 2: PARALLEL GENERATION       │
                        │       (Gemini Pro Image - $0.05/img)     │
                        └──────────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌─────────────┐               ┌─────────────┐               ┌─────────────┐
│  Generate   │               │  Generate   │               │  Generate   │
│  Image 1    │               │  Image 2    │      ...      │  Image N    │
│  (Parallel) │               │  (Parallel) │               │  (Parallel) │
└─────────────┘               └─────────────┘               └─────────────┘
        │                             │                             │
        └─────────────────────────────┴─────────────────────────────┘
                                      │
                                      ▼
                        ┌──────────────────────────┐
                        │   Update Progress        │
                        │   (Real-time)            │
                        │                          │
                        │   stage: "Generating     │
                        │           image 3/6"     │
                        │   percentage: 50%        │
                        └──────────────────────────┘
                                      │
                                      ▼
                        ┌──────────────────────────┐
                        │  Upload to Firebase      │
                        │  Storage                 │
                        │  - Full size image       │
                        │  - Thumbnail             │
                        └──────────────────────────┘
                                      │
                                      ▼
                        ┌──────────────────────────┐
                        │  Save Metadata to        │
                        │  generatedImages         │
                        │  Collection              │
                        └──────────────────────────┘
                                      │
                                      ▼
                        ┌──────────────────────────┐
                        │   PHASE 3: COMPLETION    │
                        │   Update Status:         │
                        │   'completed'            │
                        └──────────────────────────┘
                                      │
                                      ▼
                        ┌──────────────────────────┐
                        │  Update User Quota       │
                        │  imagesGenerated += N    │
                        └──────────────────────────┘
                                      │
                                      ▼
                        ┌──────────────────────────┐
                        │  Frontend Receives       │
                        │  Notification            │
                        │  (Real-time listener)    │
                        └──────────────────────────┘
```

---

## 4. Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FIRESTORE COLLECTIONS                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  users/{userId}  │
│                  │
│  - email         │
│  - displayName   │
│  - quotas        │
│    - generated   │
│    - maxPerMonth │
└────────┬─────────┘
         │ owner
         │ (1:N)
         │
         ▼
┌────────────────────────┐
│ projects/{projectId}   │───┐
│                        │   │
│ - owner (userId)       │   │
│ - product              │   │
│ - brand                │   │
│ - references           │   │
│ - moodboardImageIds [] │   │ projectId
│ - generationRounds     │   │ (1:N)
└────────────────────────┘   │
         │                   │
         │ projectId         │
         │ (1:N)             │
         │                   │
         ▼                   ▼
┌──────────────────────────┐  ┌─────────────────────────────┐
│ agentJobs/{jobId}        │  │ generatedImages/{imageId}   │
│                          │  │                             │
│ - projectId              │  │ - projectId                 │
│ - owner (userId)         │  │ - owner (userId)            │
│ - status                 │  │ - imageUrl                  │
│ - inputs                 │  │ - thumbnailUrl              │
│ - plan                   │  │ - status (liked/disliked)   │
│ - progress               │  │ - generatedAt               │
│ - generatedImageIds []   │──│ - generationContext         │
└──────────────────────────┘  └─────────────────────────────┘
                                         │
                                         │ imageId
                                         │ (referenced in)
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │ project.moodboard   │
                              │ ImageIds []         │
                              └─────────────────────┘

┌────────────────────────────────┐
│ brandReferences/{brandName}    │  (CACHE - 7 days)
│                                │
│ - brandName                    │
│ - imageUrls []                 │
│ - analysis                     │
│ - cachedAt                     │
│ - expiresAt                    │
└────────────────────────────────┘
```

---

## 5. Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          REACT COMPONENT TREE                                │
└─────────────────────────────────────────────────────────────────────────────┘

App
│
├─── AuthContext.Provider
│    │
│    ├─── ProjectContext.Provider
│    │    │
│    │    └─── ToastContext.Provider
│    │         │
│    │         ├─── Router
│    │         │    │
│    │         │    ├─── LoginPage
│    │         │    │    ├─── LoginForm
│    │         │    │    └─── RegisterForm
│    │         │    │
│    │         │    ├─── DashboardPage (Protected)
│    │         │    │    ├─── Header
│    │         │    │    │    └─── UserMenu
│    │         │    │    ├─── ProjectList
│    │         │    │    │    ├─── ProjectCard (multiple)
│    │         │    │    │    └─── ProjectModal
│    │         │    │    └─── CreateProjectButton
│    │         │    │
│    │         │    └─── WorkflowPage (Protected)
│    │         │         ├─── Header
│    │         │         ├─── WorkflowStepper
│    │         │         │
│    │         │         ├─── UploadStep (step === 'upload')
│    │         │         │    ├─── FileUpload
│    │         │         │    └─── ProductAnalysis Display
│    │         │         │
│    │         │         ├─── BrandSearchStep (step === 'brand_search')
│    │         │         │    ├─── SearchInput
│    │         │         │    ├─── BrandAnalysis Display
│    │         │         │    └─── ImageGrid (reference images)
│    │         │         │
│    │         │         ├─── SelectReferencesStep (step === 'select_references')
│    │         │         │    ├─── ImageGrid
│    │         │         │    │    └─── ImageCard (multiple, selectable)
│    │         │         │    └─── ContextInput (textarea)
│    │         │         │
│    │         │         ├─── GenerateStep (step === 'generate')
│    │         │         │    ├─── GenerateButton
│    │         │         │    ├─── AgentProgress
│    │         │         │    │    ├─── ProgressBar
│    │         │         │    │    ├─── StatusText
│    │         │         │    │    └─── PlanPreview
│    │         │         │    ├─── ImageGrid
│    │         │         │    │    └─── ImageCard (with like/dislike)
│    │         │         │    ├─── MoodboardCounter (X/5)
│    │         │         │    └─── FinishButton (enabled when 5+)
│    │         │         │
│    │         │         └─── MoodboardStep (step === 'moodboard')
│    │         │              ├─── ImageGrid
│    │         │              │    └─── ImageCard (with remix)
│    │         │              ├─── RemixModal
│    │         │              └─── AestheticSummary Display
│    │         │
│    │         └─── Toast (Global notifications)
│    │
│    └─── ErrorBoundary (Wraps entire app)
```

---

## 6. Service Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SERVICE LAYER MODULES                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│ services/firebase/  │
│                     │
│ ┌─────────────────┐ │
│ │ auth.service    │ │──▶ Firebase Auth SDK
│ │ - login()       │ │
│ │ - register()    │ │
│ │ - logout()      │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │firestore.service│ │──▶ Firestore SDK
│ │ - create()      │ │
│ │ - read()        │ │
│ │ - update()      │ │
│ │ - delete()      │ │
│ │ - listen()      │ │    (Real-time listeners)
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ storage.service │ │──▶ Firebase Storage SDK
│ │ - upload()      │ │
│ │ - download()    │ │
│ │ - delete()      │ │
│ └─────────────────┘ │
└─────────────────────┘


┌─────────────────────┐
│  services/api/      │
│                     │
│ ┌─────────────────┐ │
│ │ gemini.service  │ │──▶ Google Generative AI SDK
│ │                 │ │
│ │ Model Strategy: │ │
│ │ ┌─────────────┐ │ │
│ │ │Flash (cheap)│ │ │──▶ Product analysis
│ │ └─────────────┘ │ │──▶ Brand analysis
│ │                 │ │──▶ Agent planning
│ │ ┌─────────────┐ │ │──▶ Summaries
│ │ │Pro Image ($)│ │ │──▶ Image generation
│ │ └─────────────┘ │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │googleSearch.    │ │──▶ Google Custom Search API
│ │   service       │ │
│ │ - searchBrand() │ │
│ │ - getImages()   │ │
│ └─────────────────┘ │
└─────────────────────┘


┌─────────────────────┐
│  services/agent/    │
│                     │
│ ┌─────────────────┐ │
│ │ nanoBanana.     │ │
│ │   service       │ │
│ │                 │ │
│ │ - execute()     │ │──┐
│ │   ├─ analyze   │ │  │
│ │   ├─ plan      │ │  │
│ │   └─ generate  │ │  │
│ └─────────────────┘ │  │
│                     │  │
│ ┌─────────────────┐ │  │
│ │ agentJob.       │ │  │
│ │   service       │ │◀─┘
│ │                 │ │
│ │ - create()      │ │
│ │ - update()      │ │
│ │ - updateProgress()│
│ │ - complete()    │ │
│ └─────────────────┘ │
└─────────────────────┘


┌─────────────────────┐
│  services/cache/    │
│                     │
│ ┌─────────────────┐ │
│ │ brandCache.     │ │
│ │   service       │ │
│ │                 │ │
│ │ - get()         │ │──▶ Check Firestore cache
│ │ - set()         │ │──▶ Store for 7 days
│ │ - isExpired()   │ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

## 7. Authentication & Security Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION & AUTHORIZATION                            │
└─────────────────────────────────────────────────────────────────────────────┘

User Opens App
      │
      ▼
┌─────────────────┐
│ Check Auth      │
│ Status          │
└─────────────────┘
      │
      ├─────────────────┬─────────────────┐
      │                 │                 │
     NO                YES               ERROR
      │                 │                 │
      ▼                 ▼                 ▼
Redirect to       Load User Data    Show Error
Login Page        from Firestore    Redirect to Login
      │                 │
      │                 ▼
      │           ┌──────────────────┐
      │           │ Store in Context │
      │           │ - userId         │
      │           │ - email          │
      │           │ - quotas         │
      │           └──────────────────┘
      │                 │
      │                 ▼
      │           ┌──────────────────┐
      │           │ AuthGuard        │
      │           │ Protects Routes  │
      │           └──────────────────┘
      │                 │
      │                 ▼
      │           Access Granted
      │           to Protected Pages
      │                 │
      │                 │
      └─────────────────┘
      │
      ▼
User Interacts
      │
      ▼
API Call (Firestore, Storage, etc.)
      │
      ▼
┌─────────────────────────┐
│ Firebase Security Rules │
│ Check:                  │
│ 1. isSignedIn()?        │
│ 2. isOwner(resource)?   │
│ 3. Valid operation?     │
└─────────────────────────┘
      │
      ├─────────────┬─────────────┐
      │             │             │
   ALLOW         DENY          ERROR
      │             │             │
      ▼             ▼             ▼
  Execute       Return 403    Return Error
  Operation     Forbidden     Message
      │
      ▼
Success Response
```

---

## 8. Cost Optimization Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      COST OPTIMIZATION STRATEGY                              │
└─────────────────────────────────────────────────────────────────────────────┘

                         User Action Triggers API Call
                                      │
                                      ▼
                          ┌───────────────────────┐
                          │  Which Operation?     │
                          └───────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────┐            ┌────────────────┐           ┌─────────────────┐
│ TEXT ANALYSIS │            │ BRAND SEARCH   │           │ IMAGE GENERATION│
│ (Cheap)       │            │ (Cache First)  │           │ (Expensive)     │
└───────────────┘            └────────────────┘           └─────────────────┘
        │                             │                             │
        ▼                             ▼                             ▼
Use Flash Model          Check brandReferences          Check User Quota
($0.0001)                Cache in Firestore                   │
        │                             │                    ┌────┴────┐
        ▼                    ┌────────┴────────┐          │         │
Execute Immediately         │                  │         YES       NO
                            ▼                  ▼          │         │
                       Cache Hit          Cache Miss      │         ▼
                            │                  │          │    Block & Notify
                            │                  ▼          │    "Quota Exceeded"
                            │         Call Google API     │
                            │         ($0 - free tier)    │
                            │                  │          │
                            │                  ▼          │
                            │         Store in Cache      │
                            │         (7 days)            │
                            │                  │          │
                            └──────────────────┘          │
                                      │                   │
                                      ▼                   ▼
                              Return Results      Use Pro Image Model
                                                  ($0.05 per image)
                                                          │
                                                          ▼
                                                  Generate in Parallel
                                                  (4-8 images)
                                                          │
                                                          ▼
                                                  Update User Quota
                                                  imagesGenerated += N
                                                          │
                                                          ▼
                                                  If quota >= 80%:
                                                    Show Warning


┌─────────────────────────────────────────────────────────────────────────────┐
│                         MONTHLY COST BREAKDOWN                               │
│                         (20 users, 5 workflows each)                         │
└─────────────────────────────────────────────────────────────────────────────┘

Gemini API:
  Product Analysis:     100 workflows × $0.0001 = $0.01
  Brand Analysis:       100 workflows × $0.0002 = $0.02
  Agent Planning:       100 workflows × $0.0002 = $0.02
  Image Generation:     100 workflows × 6 images × $0.05 = $30.00
  Summaries:            100 workflows × $0.00001 = $0.001
  ─────────────────────────────────────────────────────
  Total Gemini:                                   ~$30.05

Google Custom Search:
  Brand Searches:       ~50/month (cache reduces calls)
  Cost:                 $0 (under 100/day free tier)
  ─────────────────────────────────────────────────────
  Total Search:                                   $0.00

Firebase:
  Firestore:            ~5,000 reads, ~1,000 writes = $5.00
  Storage:              ~50GB stored, ~100GB bandwidth = $10.00
  Auth:                 20 users (free tier)       = $0.00
  ─────────────────────────────────────────────────────
  Total Firebase:                                 ~$15.00

═══════════════════════════════════════════════════════
GRAND TOTAL:                                      ~$45/month
Per User:                                         ~$2.25/month
Per Workflow:                                     ~$0.45/workflow
```

---

## 9. Iterative Generation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   ITERATIVE GENERATION WORKFLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

                         User in Generate Step
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │ Moodboard Count: 0/5     │
                    │ "Generate" Button Active │
                    └──────────────────────────┘
                                  │
                                  ▼
                    User Clicks "Generate" (Round 1)
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │ Nano Banana Agent Runs   │
                    │ Generates 6 images       │
                    └──────────────────────────┘
                                  │
                                  ▼
                    Display Images with Like/Dislike
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
            User Likes 2            User Dislikes 4
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │ Moodboard Count: 2/5     │
                    │ "Generate" Still Active  │
                    │ "Finish" Disabled        │
                    └──────────────────────────┘
                                  │
                                  ▼
                    User Clicks "Generate" (Round 2)
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │ Nano Banana Agent Runs   │
                    │ Generates 5 images       │
                    │ (adjusted for quota)     │
                    └──────────────────────────┘
                                  │
                                  ▼
                    Display NEW Images
                    (Previous 2 liked still visible)
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
            User Likes 3            User Dislikes 2
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │ Moodboard Count: 5/5 ✓   │
                    │ "Generate" Still Active  │
                    │ "Finish" NOW ENABLED     │
                    └──────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
         User Continues Generating    User Clicks "Finish"
         (can add more to moodboard)            │
                                                 ▼
                                    Proceed to Moodboard Step
                                    Generate Aesthetic Summary


Key Points:
- User can generate with 0+ reference images selected
- Each generation creates a new agent job
- Liked images accumulate across rounds
- "Finish" only enabled when 5+ images liked
- No limit on generation rounds (respects quota)
- Each round tracked in project.generationRounds
```

---

## 10. Real-Time Progress Updates

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    REAL-TIME PROGRESS ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────────────────┘

BACKEND (Agent Execution)                    FRONTEND (React Component)
─────────────────────────────────────────────────────────────────────────────

Agent Starts
    │
    ▼
Create agentJobs/{jobId}                     useAgentJob(jobId) Hook
status: 'pending'                             └─ Setup Firestore listener
    │                                              onSnapshot(jobId)
    │                                                   │
    ▼                                                   │
Update: status = 'analyzing'  ──────────▶  Listener Fires
progress: {                                      │
  stage: "Analyzing inputs",                     ▼
  percentage: 10                           Update Local State
}                                                │
    │                                            ▼
    │                                       Re-render Component
    ▼                                       Show: "Analyzing inputs"
Plan Created                                Progress: 10%
    │
    ▼
Update: status = 'generating' ──────────▶  Listener Fires
progress: {                                      │
  stage: "Generating image 1/6",                 ▼
  percentage: 20,                          Update Local State
  imagesGenerated: 0,                            │
  totalImages: 6                                 ▼
}                                          Re-render Component
    │                                       Show: "Generating image 1/6"
    │                                       Progress Bar: 20%
    ▼
Generate Image 1
    │
    ▼
Update: progress = { ... }    ──────────▶  Listener Fires
  imagesGenerated: 1,                            │
  percentage: 35                                 ▼
    │                                       Update State → Re-render
    │
    ▼
Generate Image 2
    │
    ▼
Update: progress = { ... }    ──────────▶  Listener Fires → Re-render
  imagesGenerated: 2,
  percentage: 50
    │
    │
    ... (continues for all images)
    │
    ▼
All Images Generated
    │
    ▼
Update: status = 'completed'  ──────────▶  Listener Fires
generatedImageIds: [...]                       │
completedAt: timestamp                         ▼
    │                                      Update State
    │                                           │
    │                                           ▼
    │                                      Show Toast Notification
    │                                      "Generated 6 images!"
    │                                           │
    │                                           ▼
    │                                      Load & Display Images
    │                                      from Storage
    │
    ▼
Agent Complete


LATENCY ANALYSIS:
─────────────────
Firestore Update → Frontend Notification: ~100-500ms
Update Frequency: Every image completion (~5-10 seconds per image)
Total Updates per Job: ~8-12 progress updates
User Experience: Smooth, real-time progress without polling
```

This comprehensive system diagram provides multiple views of the architecture to help visualize data flow, component relationships, and system interactions.
