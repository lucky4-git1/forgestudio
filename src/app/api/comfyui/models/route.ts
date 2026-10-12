import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8188/object_info', {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to connect to ComfyUI' }, { status: 502 });
    }

    const data = await res.json();

    // Map common nodes to extract model lists
    const checkpoints = data['CheckpointLoaderSimple']?.input?.required?.ckpt_name?.[0] || [];
    const loras = data['LoraLoader']?.input?.required?.lora_name?.[0] || [];
    const vaes = data['VAELoader']?.input?.required?.vae_name?.[0] || [];
    const controlnets = data['ControlNetLoader']?.input?.required?.control_net_name?.[0] || [];

    return NextResponse.json({
      checkpoints,
      loras,
      vaes,
      controlnets,
      video_models: [], // Need specific video loader node name based on ComfyUI extension
    });
  } catch (error) {
    return NextResponse.json({ error: 'ComfyUI is offline or unreachable' }, { status: 503 });
  }
}
