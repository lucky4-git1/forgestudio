import type { AIProvider, AIProviderResult, GenerationOptions } from '@/types';

function buildT2IWorkflow(prompt: string, options?: GenerationOptions) {
  return {
    "3": {
      "class_type": "KSampler",
      "inputs": {
        "seed": options?.seed ?? Math.floor(Math.random() * 1000000000),
        "steps": options?.steps ?? 20,
        "cfg": options?.cfgScale ?? 8,
        "sampler_name": "euler",
        "scheduler": "normal",
        "denoise": 1,
        "model": [ "4", 0 ],
        "positive": [ "6", 0 ],
        "negative": [ "7", 0 ],
        "latent_image": [ "5", 0 ]
      }
    },
    "4": {
      "class_type": "CheckpointLoaderSimple",
      "inputs": {
        "ckpt_name": "v1-5-pruned-emaonly.ckpt"
      }
    },
    "5": {
      "class_type": "EmptyLatentImage",
      "inputs": {
        "batch_size": 1,
        "width": 1024,
        "height": 1024
      }
    },
    "6": {
      "class_type": "CLIPTextEncode",
      "inputs": {
        "text": prompt,
        "clip": [ "4", 1 ]
      }
    },
    "7": {
      "class_type": "CLIPTextEncode",
      "inputs": {
        "text": options?.negativePrompt ?? "text, watermark, bad anatomy",
        "clip": [ "4", 1 ]
      }
    },
    "8": {
      "class_type": "VAEDecode",
      "inputs": {
        "samples": [ "3", 0 ],
        "vae": [ "4", 2 ]
      }
    },
    "9": {
      "class_type": "SaveImage",
      "inputs": {
        "filename_prefix": "forgestudio",
        "images": [ "8", 0 ]
      }
    }
  };
}

function buildT2VWorkflow(prompt: string, options?: GenerationOptions) {
  // Simplified AnimateDiff Text-to-Video Workflow
  return {
    "3": { "class_type": "KSampler", "inputs": { "seed": Math.floor(Math.random() * 1e9), "steps": 20, "cfg": 8, "sampler_name": "euler", "scheduler": "normal", "denoise": 1, "model": ["10", 0], "positive": ["6", 0], "negative": ["7", 0], "latent_image": ["5", 0] } },
    "4": { "class_type": "CheckpointLoaderSimple", "inputs": { "ckpt_name": "v1-5-pruned-emaonly.ckpt" } },
    "5": { "class_type": "EmptyLatentImage", "inputs": { "batch_size": 16, "width": 512, "height": 512 } },
    "6": { "class_type": "CLIPTextEncode", "inputs": { "text": prompt, "clip": ["4", 1] } },
    "7": { "class_type": "CLIPTextEncode", "inputs": { "text": "watermark, text, bad anatomy", "clip": ["4", 1] } },
    "8": { "class_type": "VAEDecode", "inputs": { "samples": ["3", 0], "vae": ["4", 2] } },
    "10": { "class_type": "AnimateDiffLoaderV1", "inputs": { "model_name": "mm_sd_v15_v2.ckpt", "beta_schedule": "sqrt_linear", "model": ["4", 0] } },
    "11": { "class_type": "VHS_VideoCombine", "inputs": { "frame_rate": 8, "loop_count": 0, "filename_prefix": "AnimateDiff", "format": "video/h264-mp4", "pix_fmt": "yuv420p", "crf": 19, "save_metadata": true, "pingpong": false, "save_output": true, "images": ["8", 0] } }
  };
}

function buildI2VWorkflow(filename: string, prompt: string, options?: GenerationOptions, motionOverrides?: any) {
  // Simplified AnimateDiff Image-to-Video Workflow
  return {
    "3": { "class_type": "KSampler", "inputs": { "seed": Math.floor(Math.random() * 1e9), "steps": 20, "cfg": 8, "sampler_name": "euler", "scheduler": "normal", "denoise": motionOverrides?.denoise ?? 0.85, "model": ["10", 0], "positive": ["6", 0], "negative": ["7", 0], "latent_image": ["13", 0] } },
    "4": { "class_type": "CheckpointLoaderSimple", "inputs": { "ckpt_name": "v1-5-pruned-emaonly.ckpt" } },
    "6": { "class_type": "CLIPTextEncode", "inputs": { "text": prompt, "clip": ["4", 1] } },
    "7": { "class_type": "CLIPTextEncode", "inputs": { "text": "watermark, text", "clip": ["4", 1] } },
    "8": { "class_type": "VAEDecode", "inputs": { "samples": ["3", 0], "vae": ["4", 2] } },
    "10": { "class_type": "AnimateDiffLoaderV1", "inputs": { "model_name": "mm_sd_v15_v2.ckpt", "beta_schedule": "sqrt_linear", "model": ["4", 0] } },
    "11": { "class_type": "VHS_VideoCombine", "inputs": { "frame_rate": 8, "loop_count": 0, "filename_prefix": "AnimateDiff", "format": "video/h264-mp4", "pix_fmt": "yuv420p", "crf": 19, "save_metadata": true, "pingpong": false, "save_output": true, "images": ["8", 0] } },
    "12": { "class_type": "LoadImage", "inputs": { "image": filename } },
    "13": { "class_type": "VAEEncode", "inputs": { "pixels": ["12", 0], "vae": ["4", 2] } } // Needs to be batched in real usage but simple for mock
  };
}

function buildUpscaleWorkflow(filename: string, scale = 2) {
  return {
    "1": { "class_type": "LoadImage", "inputs": { "image": filename } },
    "2": { "class_type": "UpscaleModelLoader", "inputs": { "model_name": "RealESRGAN_x4plus.pth" } },
    "3": { "class_type": "ImageUpscaleWithModel", "inputs": { "upscale_model": ["2", 0], "image": ["1", 0] } },
    "4": { "class_type": "SaveImage", "inputs": { "filename_prefix": "upscaled", "images": ["3", 0] } }
  };
}

async function uploadImageToComfyUI(base64: string, filename: string): Promise<string> {
  const buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
  const blob = new Blob([buffer], { type: 'image/png' });
  const formData = new FormData();
  formData.append('image', blob, filename);
  formData.append('overwrite', 'true');
  
  const res = await fetch('http://127.0.0.1:8188/upload/image', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload image to ComfyUI');
  const data = await res.json();
  return data.name;
}

async function fetchOutputFromComfyUI(filename: string, subfolder = '', type = 'output'): Promise<Buffer> {
  const url = `http://127.0.0.1:8188/view?filename=${encodeURIComponent(filename)}&type=${type}&subfolder=${encodeURIComponent(subfolder)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch file from ComfyUI: ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function fetchImageFromComfyUI(filename: string): Promise<Buffer> {
  const res = await fetch(`http://127.0.0.1:8188/view?filename=${filename}&type=output`);
  if (!res.ok) throw new Error('Failed to fetch generated image from ComfyUI');
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export const comfyuiProvider: AIProvider = {
  name: 'comfyui',

  async generateImage(prompt: string, options?: GenerationOptions): Promise<AIProviderResult> {
    const workflow = buildT2IWorkflow(prompt, options);

    // 1. Submit Prompt
    const res = await fetch('http://127.0.0.1:8188/prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: workflow }),
    });

    if (!res.ok) {
      throw new Error('ComfyUI prompt submission failed');
    }

    const { prompt_id } = await res.json();

    // 2. Poll History
    let historyData = null;
    while (!historyData) {
      await new Promise((r) => setTimeout(r, 2000));
      const histRes = await fetch(`http://127.0.0.1:8188/history/${prompt_id}`);
      const historyJson = await histRes.json();
      if (historyJson[prompt_id]) {
        historyData = historyJson[prompt_id];
      }
    }

    // 3. Extract Image
    const outputs = historyData.outputs;
    const nodeIds = Object.keys(outputs);
    let outputFilename = '';
    
    for (const nodeId of nodeIds) {
      if (outputs[nodeId].images && outputs[nodeId].images.length > 0) {
        outputFilename = outputs[nodeId].images[0].filename;
        break;
      }
    }

    if (!outputFilename) {
      throw new Error('No output image found in ComfyUI history');
    }

    const buffer = await fetchImageFromComfyUI(outputFilename);

    return {
      data: buffer,
      mimeType: 'image/png',
    };
  },

  async generateVideo(prompt: string, options?: GenerationOptions): Promise<AIProviderResult> {
    const workflow = buildT2VWorkflow(prompt, options);

    // 1. Submit Prompt
    const res = await fetch('http://127.0.0.1:8188/prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: workflow }),
    });

    if (!res.ok) {
      throw new Error('ComfyUI prompt submission failed for text-to-video');
    }

    const { prompt_id } = await res.json();

    // 2. Poll History (video generation takes longer, poll every 3s)
    let historyData = null;
    while (!historyData) {
      await new Promise((r) => setTimeout(r, 3000));
      const histRes = await fetch(`http://127.0.0.1:8188/history/${prompt_id}`);
      const historyJson = await histRes.json();
      if (historyJson[prompt_id]) {
        historyData = historyJson[prompt_id];
      }
    }

    // 3. Extract Video — AnimateDiffCombine outputs gifs/videos
    const outputs = historyData.outputs;
    const nodeIds = Object.keys(outputs);
    let outputFilename = '';
    let subfolder = '';

    for (const nodeId of nodeIds) {
      const nodeOut = outputs[nodeId];
      // AnimateDiffCombine puts results in "gifs" array
      if (nodeOut.gifs && nodeOut.gifs.length > 0) {
        outputFilename = nodeOut.gifs[0].filename;
        subfolder = nodeOut.gifs[0].subfolder ?? '';
        break;
      }
      // VideoCombine / VHS_VideoCombine may also use "videos"
      if (nodeOut.videos && nodeOut.videos.length > 0) {
        outputFilename = nodeOut.videos[0].filename;
        subfolder = nodeOut.videos[0].subfolder ?? '';
        break;
      }
      // Fallback: check images (some nodes output frames as images)
      if (nodeOut.images && nodeOut.images.length > 0) {
        outputFilename = nodeOut.images[0].filename;
        subfolder = nodeOut.images[0].subfolder ?? '';
        break;
      }
    }

    if (!outputFilename) {
      throw new Error('No output video found in ComfyUI history');
    }

    const buffer = await fetchOutputFromComfyUI(outputFilename, subfolder);
    const ext = outputFilename.split('.').pop()?.toLowerCase();
    const mimeType = ext === 'mp4' ? 'video/mp4' : ext === 'webm' ? 'video/webm' : 'image/gif';

    return {
      data: buffer,
      mimeType,
    };
  },

  async imageToVideo(imageBase64: string, prompt: string, options?: GenerationOptions): Promise<AIProviderResult> {
    // 1. Upload image to ComfyUI
    const uploadedFilename = await uploadImageToComfyUI(imageBase64, 'i2v_input.png');

    // 2. Build I2V workflow
    const workflow = buildI2VWorkflow(uploadedFilename, prompt, options);

    // 3. Submit Prompt
    const res = await fetch('http://127.0.0.1:8188/prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: workflow }),
    });

    if (!res.ok) {
      throw new Error('ComfyUI prompt submission failed for image-to-video');
    }

    const { prompt_id } = await res.json();

    // 4. Poll History
    let historyData = null;
    while (!historyData) {
      await new Promise((r) => setTimeout(r, 3000));
      const histRes = await fetch(`http://127.0.0.1:8188/history/${prompt_id}`);
      const historyJson = await histRes.json();
      if (historyJson[prompt_id]) {
        historyData = historyJson[prompt_id];
      }
    }

    // 5. Extract Video
    const outputs = historyData.outputs;
    const nodeIds = Object.keys(outputs);
    let outputFilename = '';
    let subfolder = '';

    for (const nodeId of nodeIds) {
      const nodeOut = outputs[nodeId];
      if (nodeOut.gifs && nodeOut.gifs.length > 0) {
        outputFilename = nodeOut.gifs[0].filename;
        subfolder = nodeOut.gifs[0].subfolder ?? '';
        break;
      }
      if (nodeOut.videos && nodeOut.videos.length > 0) {
        outputFilename = nodeOut.videos[0].filename;
        subfolder = nodeOut.videos[0].subfolder ?? '';
        break;
      }
      if (nodeOut.images && nodeOut.images.length > 0) {
        outputFilename = nodeOut.images[0].filename;
        subfolder = nodeOut.images[0].subfolder ?? '';
        break;
      }
    }

    if (!outputFilename) {
      throw new Error('No output video found in ComfyUI history');
    }

    const buffer = await fetchOutputFromComfyUI(outputFilename, subfolder);
    const ext = outputFilename.split('.').pop()?.toLowerCase();
    const mimeType = ext === 'mp4' ? 'video/mp4' : ext === 'webm' ? 'video/webm' : 'image/gif';

    return {
      data: buffer,
      mimeType,
    };
  },

  async animateLogo(logoBase64: string, preset: string, options?: GenerationOptions): Promise<AIProviderResult> {
    // Reuse the imageToVideo pipeline with a motion-oriented prompt
    const motionPrompts: Record<string, string> = {
      rotate: 'smooth 360 degree rotation animation, spinning logo, seamless loop',
      pulse: 'pulsating scale animation, breathing effect, rhythmic zoom in and out',
      bounce: 'bouncing animation, elastic movement, playful motion up and down',
      fade: 'fade in and out animation, smooth opacity transition, elegant reveal',
      zoom: 'dramatic zoom in animation, cinematic scale up, dynamic entrance',
      slide: 'smooth sliding animation, lateral movement, gliding motion left to right',
    };

    const motionPrompt = motionPrompts[preset] ?? motionPrompts['pulse'];
    const fullPrompt = `logo animation, ${motionPrompt}, clean background, professional motion graphics`;

    // Upload logo to ComfyUI
    const uploadedFilename = await uploadImageToComfyUI(logoBase64, 'logo_input.png');

    // Build workflow with stronger motion parameters for logo animation
    const workflow = buildI2VWorkflow(uploadedFilename, fullPrompt, options, {
      motionScale: 1.2,
      frames: 24,
      denoise: 0.65,
    });

    // Submit Prompt
    const res = await fetch('http://127.0.0.1:8188/prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: workflow }),
    });

    if (!res.ok) {
      throw new Error('ComfyUI prompt submission failed for logo animation');
    }

    const { prompt_id } = await res.json();

    // Poll History
    let historyData = null;
    while (!historyData) {
      await new Promise((r) => setTimeout(r, 3000));
      const histRes = await fetch(`http://127.0.0.1:8188/history/${prompt_id}`);
      const historyJson = await histRes.json();
      if (historyJson[prompt_id]) {
        historyData = historyJson[prompt_id];
      }
    }

    // Extract Video
    const outputs = historyData.outputs;
    const nodeIds = Object.keys(outputs);
    let outputFilename = '';
    let subfolder = '';

    for (const nodeId of nodeIds) {
      const nodeOut = outputs[nodeId];
      if (nodeOut.gifs && nodeOut.gifs.length > 0) {
        outputFilename = nodeOut.gifs[0].filename;
        subfolder = nodeOut.gifs[0].subfolder ?? '';
        break;
      }
      if (nodeOut.videos && nodeOut.videos.length > 0) {
        outputFilename = nodeOut.videos[0].filename;
        subfolder = nodeOut.videos[0].subfolder ?? '';
        break;
      }
      if (nodeOut.images && nodeOut.images.length > 0) {
        outputFilename = nodeOut.images[0].filename;
        subfolder = nodeOut.images[0].subfolder ?? '';
        break;
      }
    }

    if (!outputFilename) {
      throw new Error('No output video found in ComfyUI history');
    }

    const buffer = await fetchOutputFromComfyUI(outputFilename, subfolder);
    const ext = outputFilename.split('.').pop()?.toLowerCase();
    const mimeType = ext === 'mp4' ? 'video/mp4' : ext === 'webm' ? 'video/webm' : 'image/gif';

    return {
      data: buffer,
      mimeType,
    };
  },

  async upscaleImage(imageBase64: string, scale?: number, options?: GenerationOptions): Promise<AIProviderResult> {
    // 1. Upload image to ComfyUI
    const uploadedFilename = await uploadImageToComfyUI(imageBase64, 'upscale_input.png');

    // 2. Build Upscale workflow
    const workflow = buildUpscaleWorkflow(uploadedFilename, scale);

    // 3. Submit Prompt
    const res = await fetch('http://127.0.0.1:8188/prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: workflow }),
    });

    if (!res.ok) {
      throw new Error('ComfyUI prompt submission failed for upscale');
    }

    const { prompt_id } = await res.json();

    // 4. Poll History
    let historyData = null;
    while (!historyData) {
      await new Promise((r) => setTimeout(r, 2000));
      const histRes = await fetch(`http://127.0.0.1:8188/history/${prompt_id}`);
      const historyJson = await histRes.json();
      if (historyJson[prompt_id]) {
        historyData = historyJson[prompt_id];
      }
    }

    // 5. Extract upscaled image
    const outputs = historyData.outputs;
    const nodeIds = Object.keys(outputs);
    let outputFilename = '';

    for (const nodeId of nodeIds) {
      if (outputs[nodeId].images && outputs[nodeId].images.length > 0) {
        outputFilename = outputs[nodeId].images[0].filename;
        break;
      }
    }

    if (!outputFilename) {
      throw new Error('No output image found in ComfyUI history');
    }

    const buffer = await fetchImageFromComfyUI(outputFilename);

    return {
      data: buffer,
      mimeType: 'image/png',
    };
  },
};
