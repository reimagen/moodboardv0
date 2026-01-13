# Moodboard Application - 3 Week Implementation Plan

## Executive Summary

Transform the POC into a production-ready web application for a small team (5-20 users) with authentication, real brand image search, project persistence, and cost-optimized AI operations.

**Timeline**: 3 weeks
**Deployment**: Self-hosted web app
**Backend**: Firebase (Auth + Firestore + Storage)
**Must-Have Features**: Core workflow, real brand images, project save/load, **Nano Banana AI Agent**

---

## System Architecture

### Technology Stack
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS (unchanged)
- **Backend**: Firebase (Firestore, Auth, Storage)
- **AI**: Google Gemini API (cost-optimized model selection)
- **Image Search**: Google Custom Search API (real brand images)

### High-Level Architecture
```
React Frontend (Client-side)
    ↕ Firebase SDK
Firebase Services (Auth + Firestore + Storage)
    ↕ HTTPS + Real-time Listeners
Nano Banana Agent (Background AI Agent)
    ↕ Orchestrates
External APIs (Gemini + Google Custom Search)
```

### Nano Banana Agent Architecture

**What is Nano Banana?**
- **Background AI agent** that autonomously generates images based on user inputs
- **Runs after** user clicks "Generate" button (can have 0+ references selected)
- **Accepts**: Product images, reference images (optional), conversational context (text descriptions/preferences)
- **Outputs**: Set of generated images (4-8 images per generation)
- **Iterative**: Users can generate multiple times until they have 5+ liked images in moodboard

**How Nano Banana Works:**
```
User Clicks "Generate" (can have 0+ references) →
  Create Agent Job in Firestore →
  Nano Banana Agent Starts →
    1. Analyze product image (understand design, materials, features)
    2. Analyze reference images if provided (extract aesthetic patterns)
    3. Process conversational context (user preferences, text descriptions)
    4. Generate synthesis plan (decide how many images, what variations)
    5. Execute parallel image generations (4-8 images based on plan)
    6. Store results in Firebase Storage + Firestore →
  Update Agent Job Status (progress updates) →
  Notify Frontend (real-time listener) →
User Sees Generated Images →
User Rates Images (like/dislike) →
  IF moodboard has < 5 liked images:
    User can click "Generate" again (iterative generation)
  ELSE:
    User can proceed to summary/finish
```

**Agent Execution Model:**
- **Client-side orchestration** (runs in browser, not server-side)
- Uses Gemini API with agentic prompt engineering
- Real-time progress updates via Firestore
- Generates 4-8 images per job (configurable)
- Estimates cost before execution, respects user quotas

### Key Architectural Decisions

1. **Authentication**: Firebase Auth (email/password) with AuthContext
2. **State Management**: Context API + Custom Hooks (not Redux - simpler for small team)
3. **Data Persistence**: Firestore with real-time listeners
4. **Image Storage**: Firebase Storage with user-specific paths
5. **Nano Banana Agent**: Client-side AI agent for autonomous image generation
6. **Cost Optimization**: Model selection strategy (Flash for text, Pro for images only)
7. **Caching**: 7-day brand reference cache in Firestore to reduce API costs

---

## Critical Issues to Fix from POC

1. ❌ **API key exposed in frontend** → Move to environment variables, use Firebase for auth
2. ❌ **Placeholder brand images** → Integrate Google Custom Search API
3. ❌ **No persistence** → Implement Firestore for projects and images
4. ❌ **No authentication** → Add Firebase Auth with email/password
5. ❌ **Manual image generation** → Replace with Nano Banana AI agent for autonomous generation
6. ❌ **Monolithic component** → Break App.tsx into workflow components
7. ❌ **No error handling** → Comprehensive error boundaries and toast notifications

---

## Database Schema (Firestore)

### Collections

**users/{userId}**
```typescript
{
  email: string;
  displayName: string;
  createdAt: timestamp;
  quotas: {
    imagesGeneratedThisMonth: number;
    maxImagesPerMonth: number;  // 100
  }
}
```

**projects/{projectId}**
```typescript
{
  id: string;
  name: string;
  owner: string;  // userId
  step: 'upload' | 'brand_search' | 'select_references' | 'generate' | 'moodboard';
  product: {
    imageUrl: string;  // Firebase Storage URL
    analysis: string;
  };
  brand: {
    name: string;
    analysis: string;
  };
  referenceImageUrls: string[];  // From Google Custom Search
  selectedReferenceUrls: string[];  // User selections (optional - can generate with 0+)
  generationConfig: { aspectRatio, imageSize };

  // Iterative generation tracking
  generationRounds: number;  // How many times user clicked "generate"
  totalImagesGenerated: number;  // Total across all rounds

  // Moodboard (requires 5+ liked images to complete)
  moodboardImageIds: string[];  // References to generatedImages (liked)
  aestheticSummary: string | null;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**generatedImages/{imageId}**
```typescript
{
  id: string;
  projectId: string;
  owner: string;
  imageUrl: string;  // Firebase Storage URL
  thumbnailUrl: string;
  status: 'liked' | 'disliked' | 'none';
  generatedAt: timestamp;
  isRemix: boolean;
  remixPrompt: string | null;
}
```

**brandReferences/{brandName}** (cache)
```typescript
{
  brandName: string;
  imageUrls: string[];  // From Google Custom Search
  analysis: string;
  cachedAt: timestamp;
  expiresAt: timestamp;  // 7 days
}
```

**agentJobs/{jobId}** (Nano Banana execution tracking)
```typescript
{
  id: string;
  projectId: string;
  owner: string;  // userId
  status: 'pending' | 'analyzing' | 'generating' | 'completed' | 'failed';

  // Input data
  inputs: {
    productImageUrl: string;
    referenceImageUrls: string[];
    conversationalContext: string;  // User text input/preferences
    generationConfig: { aspectRatio, imageSize };
  };

  // Agent plan
  plan: {
    numberOfImages: number;  // Agent decides (typically 4-8)
    variations: string[];  // Description of each variation to generate
    estimatedCost: number;
  };

  // Progress tracking
  progress: {
    stage: string;  // Current stage description
    imagesGenerated: number;
    totalImages: number;
    percentage: number;  // 0-100
  };

  // Results
  generatedImageIds: string[];  // References to generatedImages collection

  // Metadata
  createdAt: timestamp;
  completedAt: timestamp | null;
  errorMessage: string | null;
}
```

---

## Cost Optimization Strategy

### Gemini Model Selection
```typescript
// CHEAP - Use for text analysis
analyzeProduct: 'gemini-3-flash-preview'
analyzeBrand: 'gemini-3-flash-preview'
searchBrandInfo: 'gemini-3-flash-preview'
generateSummary: 'gemini-2.5-flash-lite'  // Cheapest

// NANO BANANA AGENT
agentCoordinator: 'gemini-3-flash-preview'  // Plans generation strategy (cheap)
agentImageGen: 'gemini-3-pro-image-preview'  // Actual image generation (expensive)

// EXPENSIVE - Use ONLY for image generation
generateImages: 'gemini-3-pro-image-preview'  // Main generation
remixImage: 'gemini-2.5-flash-image'  // Cheaper for remixes
```

### Cost Estimates (With Nano Banana Agent)
- **Per workflow**: ~$0.25 (4-8 images + agent planning)
  - Product analysis: $0.0001 (Flash)
  - Brand search/analysis: $0.0002 (Flash)
  - Agent planning: $0.0002 (Flash) *NEW*
  - Image generation (6 avg): $0.30 (Pro Image) *INCREASED*
  - Summary: $0.00001 (Flash Lite)
- **Monthly (20 users, 5 workflows each)**: ~$25 for Gemini API
- **Google Custom Search**: $0 (stay under 100 queries/day free tier)
- **Firebase**: ~$20/month (Storage + Firestore - more images)
- **Total**: ~$45/month

### Rate Limiting
- 100 image generations per user per month
- Brand search caching (7 days) to reduce API calls
- Show quota usage in UI

---

## 3-Week Implementation Timeline

### Week 1: Foundation & Authentication (Days 1-7)

**Days 1-2: Firebase Setup**
- Initialize Firebase project (Firestore, Auth, Storage)
- Configure Firebase in React app
- Implement authentication UI (login, register)
- Create AuthContext and useAuth hook
- Deploy security rules

**Days 3-4: Project Management**
- Implement project CRUD in Firestore
- Build ProjectList and ProjectCard components
- Create useProject and useProjects hooks
- Add real-time project sync

**Days 5-7: Image Storage**
- Implement image upload to Firebase Storage
- Create useImageUpload hook
- Build ImageGrid and ImageCard components
- Add client-side image compression
- Generate thumbnails

**Deliverables**: Auth working, projects persist, images upload to Storage

---

### Week 2: Core Workflow (Days 8-14)

**Days 8-9: Product Analysis**
- Refactor UploadStep component
- Integrate Gemini Flash for product analysis
- Store results in Firestore
- Add WorkflowStepper component

**Days 10-11: Real Brand Images**
- Integrate Google Custom Search API
- Implement brand caching (brandReferences collection)
- Build BrandSearchStep component
- Add Gemini Flash for brand analysis

**Days 12-13: Nano Banana Agent & Iterative Generation**
- Build GenerateStep component with:
  - Conversational context input field
  - "Generate" button (can click multiple times)
  - Generated images grid with like/dislike
  - Moodboard counter (X/5 images)
- **Implement Nano Banana Agent**:
  - Create agent service (analyzes inputs, creates plan)
  - Implement agent job creation in Firestore
  - Build agent execution logic (parallel image generation)
  - Add real-time progress tracking
  - Support iterative generation (multiple rounds)
- Store generated images in Storage + Firestore
- Add progress indicators (real-time updates from agent)
- Implement rate limiting checks (agent respects quotas)
- Enable "Finish" button only when moodboard has 5+ images

**Day 14: Moodboard & Summary**
- Build MoodboardStep component
- Implement like/dislike ratings
- Generate aesthetic summary (Gemini Flash Lite)
- Display final moodboard

**Deliverables**: Complete 5-step workflow with real APIs and persistence

---

### Week 3: Polish & Optimization (Days 15-21)

**Days 15-16: Cost Optimization**
- Implement brand caching strategy
- Add user quota tracking
- Build quota UI (show remaining generations)
- Test rate limits

**Days 17-18: Image Remix**
- Implement remix with Gemini Flash Image
- Build remix UI in moodboard
- Add custom prompt input
- Store remix history

**Days 19-20: UX Polish**
- Add loading skeletons
- Implement Toast notifications
- Build error boundaries
- Add empty states
- Improve mobile responsiveness
- Add image download

**Day 21: Testing & Deployment**
- End-to-end testing
- Test with multiple users
- Test quotas and rate limits
- Deploy to production
- Team documentation

**Deliverables**: Production-ready app with polish and error handling

---

## Critical Files to Create

### Week 1 Files (Foundation)
```
src/config/firebase.config.ts           # Firebase init
src/services/firebase/auth.service.ts   # Auth operations
src/services/firebase/firestore.service.ts  # Firestore CRUD
src/services/firebase/storage.service.ts    # Storage operations
src/contexts/AuthContext.tsx            # Global auth state
src/hooks/useAuth.ts                    # Auth hook
src/components/auth/LoginForm.tsx       # Login UI
src/components/auth/RegisterForm.tsx    # Register UI
src/components/auth/AuthGuard.tsx       # Protected routes
firestore.rules                         # Security rules
storage.rules                           # Storage rules
```

### Week 2 Files (Workflow + Nano Banana Agent)
```
src/services/api/gemini.service.ts      # Refactored Gemini client
src/services/api/googleSearch.service.ts    # Google Search client
src/services/cache/brandCache.service.ts    # Brand caching
src/services/agent/nanoBanana.service.ts    # Nano Banana agent core logic *NEW*
src/services/agent/agentJob.service.ts      # Agent job management *NEW*
src/hooks/useProject.ts                 # Project state management
src/hooks/useImageGeneration.ts         # Generation logic (calls agent)
src/hooks/useAgentJob.ts                # Agent job state + real-time updates *NEW*
src/components/workflow/UploadStep.tsx
src/components/workflow/BrandSearchStep.tsx
src/components/workflow/SelectReferencesStep.tsx    # + context input field
src/components/workflow/GenerateStep.tsx            # Agent progress display
src/components/workflow/MoodboardStep.tsx
src/components/projects/ProjectList.tsx
src/components/shared/AgentProgress.tsx             # Real-time agent progress UI *NEW*
```

### Week 3 Files (Polish)
```
src/hooks/useRateLimiting.ts            # Rate limiting
src/contexts/ToastContext.tsx           # Toast notifications
src/components/shared/Toast.tsx
src/utils/errorHandler.ts               # Error handling
src/components/shared/ErrorBoundary.tsx
```

### Files to Refactor
```
App.tsx → pages/WorkflowPage.tsx        # Break into components
services/gemini.ts → services/api/gemini.service.ts  # Fix API key issue
types.ts → types/* (split into multiple files)
```

---

## Component Architecture

### Directory Structure
```
src/
├── components/
│   ├── auth/                # Login, Register, AuthGuard
│   ├── layout/              # Header, AppLayout
│   ├── workflow/            # 5 workflow steps
│   ├── projects/            # Project list, cards
│   └── shared/              # Button, ImageGrid, Modal, Toast
├── hooks/
│   ├── useAuth.ts           # Authentication
│   ├── useProject.ts        # Current project
│   ├── useProjects.ts       # Projects list
│   ├── useImageGeneration.ts
│   └── useRateLimiting.ts
├── services/
│   ├── firebase/            # Auth, Firestore, Storage
│   ├── api/                 # Gemini, Google Search
│   ├── agent/               # Nano Banana agent logic *NEW*
│   └── cache/               # Brand cache
├── contexts/
│   ├── AuthContext.tsx      # Global auth state
│   ├── ProjectContext.tsx   # Current project state
│   └── ToastContext.tsx     # Notifications
├── types/                   # TypeScript types
├── utils/                   # Validation, error handling
└── pages/                   # LoginPage, DashboardPage, WorkflowPage
```

---

## Firebase Security Rules

### Firestore Rules (firestore.rules)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isOwner(userId);
      allow update, delete: if isOwner(userId);
    }

    match /projects/{projectId} {
      allow read: if isSignedIn() && resource.data.owner == request.auth.uid;
      allow create: if isSignedIn() && request.resource.data.owner == request.auth.uid;
      allow update, delete: if isSignedIn() && resource.data.owner == request.auth.uid;
    }

    match /generatedImages/{imageId} {
      allow read: if isSignedIn() && resource.data.owner == request.auth.uid;
      allow create: if isSignedIn() && request.resource.data.owner == request.auth.uid;
      allow update, delete: if isSignedIn() && resource.data.owner == request.auth.uid;
    }

    match /brandReferences/{brandName} {
      allow read: if isSignedIn();
      allow write: if false;  // Write via cloud functions only
    }

    match /agentJobs/{jobId} {
      allow read: if isSignedIn() && resource.data.owner == request.auth.uid;
      allow create: if isSignedIn() && request.resource.data.owner == request.auth.uid;
      allow update: if isSignedIn() && resource.data.owner == request.auth.uid;
      allow delete: if isSignedIn() && resource.data.owner == request.auth.uid;
    }
  }
}
```

### Storage Rules (storage.rules)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isSignedIn() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    match /users/{userId}/{allPaths=**} {
      allow read, write: if isSignedIn() && isOwner(userId);
    }
  }
}
```

---

## Features Deferred (Post-3 Weeks)

**Do NOT implement initially:**
- Project sharing/collaboration
- Public galleries
- PDF/PPT export
- Advanced image editing (crop, resize)
- Team management/admin panel
- Usage analytics dashboard
- Mobile app
- Real-time collaborative editing
- Additional AI agents beyond Nano Banana

---

## Success Criteria

### Technical
- Page load < 2 seconds
- Nano Banana agent completes < 45 seconds (6 images avg)
- Real-time progress updates every 5 seconds
- Zero API key exposures
- Firebase security rules enforced
- Agent jobs tracked in Firestore with status updates

### Business
- Monthly cost < $50 for 20 users (target: $45)
- Average cost per workflow < $0.30 (target: $0.25 with agent)
- User quota violations < 5%
- Agent success rate > 95%

### User Experience
- Workflow completion time < 5 minutes
- Error rate < 2%
- Average projects per user > 3

---

## Environment Variables

Create `.env.local`:
```bash
# Firebase
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# AI & Search
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GOOGLE_SEARCH_API_KEY=your_google_search_api_key
VITE_GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
```

---

## Verification Plan

### End-to-End Testing
1. **Auth Flow**: Register → Login → Logout → Login again
2. **Create Project**: Create new project → Verify in Firestore
3. **Upload Product**: Upload image → Check Storage → Verify analysis stored
4. **Brand Search**: Search brand → Verify real images from Google → Check cache
5. **Nano Banana Agent Flow (Iterative Generation)**:
   - Select 0+ refs (optional) → Add conversational context → Click "Generate"
   - Verify agent job created in Firestore
   - Watch real-time progress updates (analyzing → generating → completed)
   - Verify 4-8 images generated and stored in Storage
   - Like 2-3 images → Check moodboard counter shows X/5
   - Click "Generate" again → Verify new agent job created
   - Like more images until moodboard has 5+
   - Verify "Finish" button becomes enabled at 5 images
   - Check all generated images linked to project
6. **Build Moodboard**: Rate images → Add to moodboard → Generate summary
7. **Project Persistence**: Refresh page → Verify project loads → Check all data intact
8. **Rate Limits**: Generate 100 images → Verify quota blocks 101st
9. **Multi-User**: Create 2 users → Verify data isolation (User A can't see User B's projects)
10. **Agent Error Handling**: Submit invalid inputs → Verify agent fails gracefully with error message

### Performance Testing
- Upload 10MB image → Should compress and upload in < 5 seconds
- Nano Banana agent (6 images) → Should complete in < 45 seconds (including planning)
- Real-time progress updates → Should update at least every 5 seconds
- Load project with 20 images → Should render in < 3 seconds

### Security Testing
- Check API keys not in browser bundle (inspect Vite build output)
- Try to access another user's project (should fail with Firestore rules)
- Try to upload to another user's Storage path (should fail)

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| API costs spiral | Strict quotas, aggressive caching, model selection discipline |
| Firebase quotas exceeded | Implement client checks, upgrade to Blaze plan early |
| Image generation too slow | Parallel generation (Promise.all), progress indicators |
| Google Search free tier limit | 7-day caching, limit to 90 queries/day, upgrade if needed |
| Complex state management | Simple Context API, Firestore handles sync |

---

## Nano Banana Agent Implementation Details

### Agent Architecture

**Core Concept**: Nano Banana is a multi-step AI agent that autonomously decides what images to generate based on user inputs (product, references, context).

### Implementation Phases

#### Phase 1: Input Analysis (Gemini Flash - cheap)
```typescript
// Agent analyzes all inputs and creates a generation plan
async function createGenerationPlan(inputs: AgentInputs): Promise<GenerationPlan> {
  const prompt = `
    You are Nano Banana, an AI agent that generates product images.

    Inputs:
    - Product: ${inputs.productAnalysis}
    - Brand References: ${inputs.referenceImageUrls.length} images
    - User Context: "${inputs.conversationalContext}"
    - Config: ${inputs.generationConfig.aspectRatio}, ${inputs.generationConfig.imageSize}

    Task: Create a generation plan.

    Output JSON:
    {
      "numberOfImages": <4-8>,
      "variations": [
        "Brief description of variation 1",
        "Brief description of variation 2",
        ...
      ],
      "reasoning": "Why these variations?"
    }
  `;

  const response = await gemini.generateContent({
    model: 'gemini-3-flash-preview',
    prompt: prompt,
  });

  return JSON.parse(response.text());
}
```

#### Phase 2: Parallel Image Generation (Gemini Pro Image - expensive)
```typescript
// Execute the plan in parallel
async function executeGenerationPlan(
  plan: GenerationPlan,
  inputs: AgentInputs,
  jobId: string
): Promise<string[]> {
  const imagePromises = plan.variations.map(async (variation, index) => {
    // Update progress
    await updateAgentJobProgress(jobId, {
      stage: `Generating image ${index + 1}/${plan.numberOfImages}`,
      imagesGenerated: index,
      totalImages: plan.numberOfImages,
      percentage: (index / plan.numberOfImages) * 100,
    });

    // Generate image
    const imagePrompt = `
      Create an inspirational product visualization image to show what's possible:

      Product: ${inputs.productAnalysis}
      Style Variation: ${variation}
      References: ${inputs.referenceImageUrls.length > 0 ? `Use aesthetic from the brand reference images` : 'Create original aesthetic'}
      User Request: ${inputs.conversationalContext || 'No specific request'}

      Config: ${inputs.generationConfig.aspectRatio}, ${inputs.generationConfig.imageSize}

      Goal: Generate creative, inspirational images showing design possibilities.
    `;

    const imageData = await gemini.generateImage({
      model: 'gemini-3-pro-image-preview',
      prompt: imagePrompt,
      referenceImages: inputs.referenceImageUrls,
      config: inputs.generationConfig,
    });

    // Upload to Firebase Storage
    const imageId = uuidv4();
    const imageUrl = await uploadToStorage(imageData, imageId, inputs.projectId, inputs.owner);

    // Save metadata to Firestore
    await saveGeneratedImage({
      id: imageId,
      projectId: inputs.projectId,
      owner: inputs.owner,
      imageUrl: imageUrl,
      thumbnailUrl: await createThumbnail(imageUrl),
      status: 'none',
      generatedAt: new Date(),
      generationContext: variation,
    });

    return imageId;
  });

  // Execute all in parallel
  return await Promise.all(imagePromises);
}
```

#### Phase 3: Real-time Progress Updates
```typescript
// Frontend hook to monitor agent job
export function useAgentJob(jobId: string | null) {
  const [job, setJob] = useState<AgentJob | null>(null);

  useEffect(() => {
    if (!jobId) return;

    // Real-time listener
    const unsubscribe = firestore
      .collection('agentJobs')
      .doc(jobId)
      .onSnapshot((doc) => {
        const data = doc.data() as AgentJob;
        setJob(data);

        // Notify user of completion
        if (data.status === 'completed') {
          toast.success(`Generated ${data.generatedImageIds.length} images!`);
        } else if (data.status === 'failed') {
          toast.error(`Agent failed: ${data.errorMessage}`);
        }
      });

    return () => unsubscribe();
  }, [jobId]);

  return { job };
}
```

### Service Files Structure

**src/services/agent/nanoBanana.service.ts**
```typescript
export class NanoBananaAgent {
  async execute(inputs: AgentInputs): Promise<AgentJob> {
    // 1. Create job in Firestore
    const jobId = uuidv4();
    await createAgentJob(jobId, inputs);

    try {
      // 2. Analyze inputs and create plan (Flash - cheap)
      await updateJobStatus(jobId, 'analyzing');
      const plan = await this.createGenerationPlan(inputs);
      await updateJobPlan(jobId, plan);

      // 3. Check quota
      const canProceed = await checkUserQuota(inputs.owner, plan.numberOfImages);
      if (!canProceed) {
        throw new Error('Quota exceeded');
      }

      // 4. Generate images (Pro Image - expensive, parallel)
      await updateJobStatus(jobId, 'generating');
      const imageIds = await this.executeGenerationPlan(plan, inputs, jobId);

      // 5. Mark complete
      await updateJobStatus(jobId, 'completed');
      await updateJobResults(jobId, imageIds);

      // 6. Update user quota
      await incrementUserQuota(inputs.owner, plan.numberOfImages);

      return await getAgentJob(jobId);
    } catch (error) {
      await updateJobStatus(jobId, 'failed');
      await updateJobError(jobId, error.message);
      throw error;
    }
  }
}
```

**src/services/agent/agentJob.service.ts**
```typescript
// Firestore operations for agent jobs
export async function createAgentJob(jobId: string, inputs: AgentInputs) {
  await firestore.collection('agentJobs').doc(jobId).set({
    id: jobId,
    projectId: inputs.projectId,
    owner: inputs.owner,
    status: 'pending',
    inputs: inputs,
    plan: null,
    progress: { stage: 'Initializing...', imagesGenerated: 0, totalImages: 0, percentage: 0 },
    generatedImageIds: [],
    createdAt: new Date(),
    completedAt: null,
    errorMessage: null,
  });
}

export async function updateAgentJobProgress(jobId: string, progress: Partial<AgentProgress>) {
  await firestore.collection('agentJobs').doc(jobId).update({
    progress: progress,
    'progress.updatedAt': new Date(),
  });
}
```

### UI Components

**src/components/shared/AgentProgress.tsx**
```tsx
export function AgentProgress({ jobId }: { jobId: string }) {
  const { job } = useAgentJob(jobId);

  if (!job) return <LoadingSpinner />;

  return (
    <div className="agent-progress">
      <h3>Nano Banana is working...</h3>

      {/* Progress bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${job.progress.percentage}%` }} />
      </div>

      {/* Status */}
      <p className="stage">{job.progress.stage}</p>
      <p className="images-count">
        {job.progress.imagesGenerated} / {job.progress.totalImages} images
      </p>

      {/* Plan preview (if available) */}
      {job.plan && (
        <div className="plan">
          <h4>Generating {job.plan.numberOfImages} variations:</h4>
          <ul>
            {job.plan.variations.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### Workflow Integration

**In SelectReferencesStep.tsx:**
```tsx
// Add conversational context input
<textarea
  placeholder="Describe what you want... (optional)"
  value={conversationalContext}
  onChange={(e) => setConversationalContext(e.target.value)}
/>

<button onClick={handleSubmit}>
  Generate with Nano Banana
</button>
```

**In GenerateStep.tsx:**
```tsx
// Show agent progress instead of manual generation
{agentJobId ? (
  <AgentProgress jobId={agentJobId} />
) : (
  <p>Waiting for agent to start...</p>
)}
```

### Cost Optimization in Agent

```typescript
// Agent respects user quotas
async function createGenerationPlan(inputs: AgentInputs): Promise<GenerationPlan> {
  const user = await getUser(inputs.owner);
  const remaining = user.quotas.maxImagesPerMonth - user.quotas.imagesGeneratedThisMonth;

  // Adjust plan based on remaining quota
  let numberOfImages = 6;  // Default
  if (remaining < 6) {
    numberOfImages = Math.max(4, remaining);  // Minimum 4 images
  }

  // ... rest of planning logic
}
```

---

## Next Steps After Approval

1. Initialize Firebase project in Firebase Console
2. Set up Google Custom Search Engine
3. Create project structure (directories)
4. Install dependencies (firebase, react-router-dom)
5. Begin Week 1, Day 1 implementation
