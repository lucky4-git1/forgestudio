// ──────────────────────────────────────────────
// Forge Studio – Shared TypeScript Types
// ──────────────────────────────────────────────

/* ─── Generation Types ─── */

export type GenerationType =
  | 'text-to-image'
  | 'logo'
  | 'marketing-creative'
  | 'text-to-video'
  | 'image-to-video'
  | 'logo-animation';

/* ─── Credit Costs ─── */

export type CreditCostMap = Record<GenerationType, number>;

/* ─── Generation Request / Response ─── */

export interface GenerationOptions {
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  style?: string;
  negativePrompt?: string;
  seed?: number;
  steps?: number;
  cfgScale?: number;
  /** Base-64 encoded source image (image-to-video, logo-animation) */
  sourceImage?: string;
  /** Animation preset for logo animation */
  animationPreset?: 'rotate' | 'pulse' | 'bounce' | 'fade' | 'zoom' | 'slide';
  /** Duration in seconds for video generation */
  duration?: number;
  /** Brand-specific fields */
  brandName?: string;
  industry?: string;
  /** Marketing-specific fields */
  product?: string;
  audience?: string;
  goal?: string;
  /** Project to associate asset with */
  projectId?: string;
  /** Optional per-user provider API key (overrides server env) */
  providerApiKey?: string;
  /** Optional model overrides */
  image_model?: string;
  video_model?: string;
  model?: string;
}

export interface GenerationRequest {
  prompt: string;
  type: GenerationType;
  options?: GenerationOptions;
}

export type GenerationStatus = 'pending' | 'completed' | 'failed';

export interface GenerationResponse {
  id: string;
  status: GenerationStatus;
  fileUrl: string | null;
  thumbnailUrl: string | null;
  creditsUsed: number;
  generationType: GenerationType;
  createdAt: string;
}

/* ─── AI Provider Interface ─── */

export interface AIProviderResult {
  /** Raw binary data or a publicly-accessible URL */
  data: Buffer | string;
  /** MIME type of the generated content */
  mimeType: string;
  /** Optional thumbnail (base64 or URL) */
  thumbnail?: Buffer | string;
  thumbnailMimeType?: string;
}

export interface AIProvider {
  readonly name: string;

  generateImage(prompt: string, options?: GenerationOptions): Promise<AIProviderResult>;
  generateVideo(prompt: string, options?: GenerationOptions): Promise<AIProviderResult>;
  
  upscaleImage?(imageBase64: string, scale?: number, options?: GenerationOptions): Promise<AIProviderResult>;
  editImage?(imageBase64: string, prompt: string, options?: GenerationOptions): Promise<AIProviderResult>;
  generateFromImage?(imageBase64: string, prompt: string, options?: GenerationOptions): Promise<AIProviderResult>;
  generateFromVideo?(videoBase64: string, prompt: string, options?: GenerationOptions): Promise<AIProviderResult>;

  imageToVideo(
    imageBase64: string,
    prompt: string,
    options?: GenerationOptions,
  ): Promise<AIProviderResult>;

  animateLogo(
    logoBase64: string,
    preset: string,
    options?: GenerationOptions,
  ): Promise<AIProviderResult>;
}

/* ─── Database Models ─── */

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  credits: number;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface AssetType {
  type: 'image' | 'video' | 'logo';
}

export interface Asset {
  id: string;
  project_id: string | null;
  user_id: string;
  type: 'image' | 'video' | 'logo';
  prompt: string | null;
  metadata: Record<string, unknown> | null;
  file_url: string;
  thumbnail_url: string | null;
  created_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  provider: string;
  generation_type: string;
  credits_used: number;
  status: GenerationStatus;
  created_at: string;
}

export interface BrandKit {
  id: string;
  user_id: string;
  name: string;
  colors: string[] | null;
  fonts: string[] | null;
  logos: string[] | null;
  created_at: string;
}
