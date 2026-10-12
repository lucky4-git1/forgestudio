import { NextResponse } from 'next/server';

export async function GET() {
  const statuses = {
    comfyui: 'offline',
    ollama: 'offline',
  };

  try {
    // Ping ComfyUI
    const comfyRes = await fetch('http://127.0.0.1:8188/system_stats', {
      method: 'GET',
      signal: AbortSignal.timeout(2000),
    });
    if (comfyRes.ok) {
      statuses.comfyui = 'running';
    }
  } catch (err) {
    // offline or not installed
  }

  try {
    // Ping Ollama
    const ollamaRes = await fetch('http://127.0.0.1:11434/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(2000),
    });
    if (ollamaRes.ok) {
      statuses.ollama = 'running';
    }
  } catch (err) {
    // offline or not installed
  }

  return NextResponse.json(statuses);
}
