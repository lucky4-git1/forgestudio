# ⚡ Forge Studio

> **Next-Generation AI Creative Studio for High-Performance Image, Video, & Brand Asset Generation.**

Forge Studio is a unified, modern web application built for creators, marketers, and developers. It brings together state-of-the-art AI image generation, cinematic video synthesis, brand identity governance, and flexible AI provider routing into a seamless, dark-glassmorphic studio interface.

---

## ✨ Features

### 🎨 Image Studio
- **Text-to-Image**: Generate photorealistic images and digital artwork with models like FLUX.1 and SDXL.
- **Logo Design Studio**: Create modern, minimalist vector-style brand logos with fine-tuned aesthetic controls.
- **Marketing Creatives**: Generate ad creatives, campaign graphics, and social media banners with automated copy and composition guidance.
- **AI Upscaling**: Enhance resolution and details of generated assets.

### 🎬 Video Studio
- **Text-to-Video**: Transform descriptive prompts into dynamic motion clips using cutting-edge video diffusion models.
- **Image-to-Video**: Animate still images and design assets with natural camera trajectories and motion dynamics.
- **Logo Animation**: Bring static logos to life with presets like rotate, pulse, bounce, zoom, and fade.

### 🎯 Brand Identity Kits
- Maintain consistent brand aesthetics across all generated media.
- Store brand colors, typography, logos, and style guidelines.
- Automatically apply brand guidelines to newly generated creatives.

### 📂 Asset & Project Management
- Full media library with tagging, metadata inspection, and instant downloads.
- Group generations by project for campaign-based organization.

### ⚡ Flexible Multi-Engine AI Architecture
- **Cloud Providers**: Hugging Face Inference, Fal.ai, Together AI, NVIDIA NIM, and Replicate.
- **Local AI Nodes**: Connect directly to your local ComfyUI installation for offline, zero-cloud-cost generation.
- **AI Analytics**: Track generation throughput, provider distribution, and model latency in real-time.

### 🔒 Dual-Mode Persistence
- **Cloud Mode**: Full Supabase authentication (Email + Google OAuth) and Supabase Storage.
- **Local Mode**: Zero-configuration local JSON database (`/data`) and public filesystem storage (`/public/generated`) for rapid offline development.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom glassmorphism utilities
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI Clients**: [@huggingface/inference](https://github.com/huggingface/huggingface.js)
- **Backend / Database**: Supabase SSR / Node.js Local File Database

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher recommended
- **npm**: `v10.x` or higher (or `pnpm` / `bun`)

### 1. Clone the Repository

```bash
git clone https://github.com/lucky4-git1/forgestudio.git
cd forgestudio
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory (refer to `.env.example`):

```bash
# Supabase Configuration (Optional for cloud authentication & storage)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI Provider Configuration
AI_PROVIDER=huggingface
HUGGINGFACE_API_KEY=hf_your_huggingface_token
HUGGINGFACE_MODEL=black-forest-labs/FLUX.1-schnell
```

> **Note**: If Supabase variables are omitted, Forge Studio automatically falls back to **Local Development Mode**, utilizing the built-in local JSON database and saving generated assets locally.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start creating.

### 5. Build for Production

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```text
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (dashboard)/          # Dashboard layout & authenticated pages
│   │   │   ├── ai-manager/       # Provider analytics & usage metrics
│   │   │   ├── ai-setup/         # Local ComfyUI setup wizard
│   │   │   ├── assets/           # Media asset library
│   │   │   ├── brand-kits/       # Brand identity management
│   │   │   ├── dashboard/        # Main overview dashboard
│   │   │   ├── image-studio/     # Text-to-image, logo, & marketing studios
│   │   │   ├── model-manager/    # AI model configuration
│   │   │   ├── projects/         # Campaign & project organization
│   │   │   ├── settings/         # User and provider API settings
│   │   │   └── video-studio/     # Text-to-video & animation studios
│   │   ├── api/                  # Serverless REST endpoints
│   │   │   ├── ai-manager/       # Analytics endpoints
│   │   │   ├── assets/           # Asset CRUD APIs
│   │   │   ├── brand-kits/       # Brand kit CRUD APIs
│   │   │   ├── generate/         # Unified generation handlers
│   │   │   └── projects/         # Project CRUD APIs
│   │   ├── login/                # Authentication page
│   │   ├── globals.css           # Global Tailwind CSS and keyframe animations
│   │   └── page.tsx              # Modern landing page
│   ├── components/               # UI & layout components (Sidebar, Topbar)
│   ├── lib/                      # Core backend utilities & providers
│   │   ├── ai/                   # Orchestrator & provider resolution
│   │   ├── providers/            # Provider implementations (HF, Fal, ComfyUI, etc.)
│   │   ├── localdb.server.ts     # Local filesystem JSON storage
│   │   └── api-auth.ts           # Dual-mode authentication resolver
│   └── types/                    # Shared TypeScript interfaces
├── public/                       # Static media and generated local assets
└── supabase/                     # SQL migration scripts for cloud setup
```

---

## 🔌 API Overview

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/generate/image` | `POST` | Generate image from text prompt |
| `/api/generate/video` | `POST` | Generate video clip from text prompt |
| `/api/generate/image-to-video` | `POST` | Animate an input source image |
| `/api/generate/logo` | `POST` | Generate brand logos |
| `/api/generate/logo-animation` | `POST` | Apply motion presets to logos |
| `/api/generate/upscale` | `POST` | Upscale image resolution |
| `/api/assets` | `GET, POST` | Query or save media assets |
| `/api/projects` | `GET, POST` | Retrieve or create projects |
| `/api/brand-kits` | `GET, POST` | Brand kit management |
| `/api/ai-manager/analytics` | `GET` | Generation volume & provider analytics |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/lucky4-git1/forgestudio/issues).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
