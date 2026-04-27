# VisionForge AI

A self-hosted, open-source AI image and video generation studio. Connect any AI provider, generate stunning media, and own everything — no subscriptions, no limits.

![VisionForge AI](https://picsum.photos/seed/readme/1200/600)

## Features

- **Image Generation** — 8 style presets (Realistic, Anime, Cinematic, Fantasy, Cyberpunk, 3D Render, Watercolor, Oil Painting), aspect ratios, quality control, seed support
- **Video Generation** — Text-to-video and image-to-video with cinematic motion presets, real-time progress tracking, and queue system
- **Gallery** — Masonry layout, search, filter by type/favorites, download, delete
- **Prompt Library** — Save, edit, organize, and reuse prompts with categories
- **Dashboard** — Stats, quick actions, recent generations, favorites
- **3 Themes** — Dark Obsidian, Neon Pink, Emerald Green
- **Cloudinary Storage** — CDN delivery, auto-thumbnails, optimized formats
- **PostgreSQL** — Full generation history and saved prompts via Prisma ORM
- **No Auth** — Open source, personal use, fully local

## Tech Stack

- **Next.js 15** App Router + TypeScript
- **Tailwind CSS** + custom design system (glassmorphism, glow effects, gradients)
- **Framer Motion** — page and component animations
- **shadcn/ui** — toast, dialog, select, tabs
- **Cloudinary** — image/video storage and CDN
- **Prisma** + PostgreSQL — generation history and prompts
- **Zod** — API request validation

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/visionforge-ai
cd visionforge-ai
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Required: Your AI provider API key
AI_API_KEY=your_key_here
AI_API_BASE_URL=https://api.replicate.com/v1

# Optional: Cloudinary for persistent media storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: PostgreSQL for history persistence
DATABASE_URL=postgresql://user:password@localhost:5432/visionforge
```

### 3. Set Up Database (Optional)

```bash
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```

### 4. Connect Your AI Provider

Open `src/lib/ai-api.ts` and replace the placeholder functions with your provider calls.

### 5. Run

```bash
npm run dev
# Open http://localhost:3000
```

---

## Connecting an AI Provider

All AI calls live in **`src/lib/ai-api.ts`**. The file contains detailed instructions and examples for each provider.

### Replicate (Stable Diffusion / SDXL)

```typescript
// In generateImage():
const response = await fetch(`${AI_API_BASE_URL}/predictions`, {
  method: 'POST',
  headers: {
    Authorization: `Token ${AI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    version: 'YOUR_MODEL_VERSION',
    input: {
      prompt: buildPromptWithStyle(prompt, settings.style),
      negative_prompt: negativePrompt,
      width: getWidthFromAspectRatio(settings.aspectRatio),
      height: getHeightFromAspectRatio(settings.aspectRatio),
      num_outputs: settings.numOutputs,
      seed: settings.seed,
      num_inference_steps: getStepsFromQuality(settings.quality),
    },
  }),
})
```

### Stability AI

```typescript
const response = await fetch(
  `${AI_API_BASE_URL}/generation/stable-diffusion-xl-1024-v1-0/text-to-image`,
  {
    method: 'POST',
    headers: { Authorization: `Bearer ${AI_API_KEY}` },
    body: JSON.stringify({
      text_prompts: [{ text: prompt, weight: 1 }],
      cfg_scale: settings.guidanceScale,
      width: getWidthFromAspectRatio(settings.aspectRatio),
      height: getHeightFromAspectRatio(settings.aspectRatio),
      steps: getStepsFromQuality(settings.quality),
    }),
  }
)
```

### RunwayML (Video)

```typescript
// In submitVideoJob():
const response = await fetch(`${AI_API_BASE_URL}/v1/image_to_video`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${AI_API_KEY}` },
  body: JSON.stringify({
    promptText: prompt,
    promptImage: settings.sourceImage,
    model: 'gen3a_turbo',
    duration: settings.duration,
  }),
})
const data = await response.json()
return { jobId: data.id }
```

---

## Project Structure

```
visionforge-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Homepage (marketing)
│   │   ├── dashboard/page.tsx          # Dashboard
│   │   ├── generate/
│   │   │   ├── image/page.tsx          # Image generator
│   │   │   └── video/page.tsx          # Video generator
│   │   ├── gallery/page.tsx            # Media gallery
│   │   ├── library/page.tsx            # Prompt library
│   │   ├── settings/page.tsx           # Settings
│   │   └── api/
│   │       ├── generate/
│   │       │   ├── image/route.ts      # POST /api/generate/image
│   │       │   └── video/
│   │       │       ├── route.ts        # POST /api/generate/video
│   │       │       └── status/route.ts # GET  /api/generate/video/status
│   │       ├── history/
│   │       │   ├── route.ts            # GET  /api/history
│   │       │   └── [id]/route.ts       # DELETE/PATCH /api/history/:id
│   │       ├── prompts/
│   │       │   ├── route.ts            # GET/POST /api/prompts
│   │       │   └── [id]/route.ts       # DELETE/PATCH /api/prompts/:id
│   │       ├── upload/route.ts         # POST /api/upload
│   │       └── stats/route.ts          # GET  /api/stats
│   ├── components/
│   │   ├── shared/
│   │   │   ├── AppLayout.tsx           # App shell (sidebar + navbar)
│   │   │   ├── Sidebar.tsx             # Collapsible sidebar
│   │   │   ├── Navbar.tsx              # Top navbar
│   │   │   ├── MediaCard.tsx           # Gallery card
│   │   │   ├── PromptBox.tsx           # Prompt textarea
│   │   │   ├── StyleSelector.tsx       # Style preset grid
│   │   │   ├── GenerateButton.tsx      # Animated generate button
│   │   │   ├── ProgressTracker.tsx     # Video progress
│   │   │   ├── VideoPlayer.tsx         # Custom video player
│   │   │   ├── ThemeSwitcher.tsx       # Theme selector
│   │   │   └── Loader.tsx              # Skeletons and loaders
│   │   └── ui/
│   │       ├── toast.tsx               # Toast notification
│   │       └── toaster.tsx             # Toast provider
│   ├── lib/
│   │   ├── ai-api.ts                   # AI provider integration
│   │   ├── cloudinary.ts               # Cloudinary helper
│   │   ├── prisma.ts                   # Prisma client
│   │   ├── rate-limit.ts               # In-memory rate limiter
│   │   ├── theme-context.tsx           # Theme provider
│   │   └── utils.ts                    # cn(), formatBytes(), etc.
│   ├── hooks/
│   │   └── use-toast.ts                # Toast hook
│   └── types/
│       └── index.ts                    # TypeScript types
├── prisma/
│   └── schema.prisma                   # Database schema
├── .env.example                        # Environment template
├── vercel.json                         # Vercel deployment config
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/generate/image` | Generate an image |
| `POST` | `/api/generate/video` | Submit a video generation job |
| `GET` | `/api/generate/video/status?jobId=` | Poll video job status |
| `POST` | `/api/upload` | Upload a reference image |
| `GET` | `/api/history` | List all generations |
| `DELETE` | `/api/history/:id` | Delete a generation |
| `PATCH` | `/api/history/:id` | Update (e.g., favorite) |
| `GET` | `/api/prompts` | List saved prompts |
| `POST` | `/api/prompts` | Save a new prompt |
| `DELETE` | `/api/prompts/:id` | Delete a prompt |
| `PATCH` | `/api/prompts/:id` | Edit a prompt |
| `GET` | `/api/stats` | Get dashboard stats |

---

## Deploying to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard, then
vercel --prod
```

The `vercel.json` already configures extended timeouts for video generation (300s) and image generation (60s).

---

## Database Schema

```prisma
model Generation {
  id             String   @id @default(cuid())
  type           String   // "image" | "video"
  prompt         String
  negativePrompt String?
  status         String   @default("pending")
  outputUrl      String?
  thumbnailUrl   String?
  settings       Json?
  favorite       Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model SavedPrompt {
  id        String   @id @default(cuid())
  title     String
  prompt    String
  category  String   @default("general")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## License

MIT — open source, personal use. No auth, no subscriptions, no tracking.
