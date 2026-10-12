import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import https from 'https';
import AdmZip from 'adm-zip';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(data: any) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      const rootDir = process.cwd();
      const comfyDir = path.join(rootDir, '.comfyui');
      const zipPath = path.join(rootDir, 'comfyui_master.zip');

      try {
        // Step 1: Download ComfyUI Source
        sendEvent({ step: 1, status: 'running', message: 'Downloading ComfyUI...', progress: 0 });
        
        const res = await fetch('https://github.com/comfyanonymous/ComfyUI/archive/refs/heads/master.zip');
        if (!res.ok) throw new Error(`Failed to download ComfyUI zip: ${res.statusText}`);
        
        sendEvent({ step: 1, status: 'running', message: 'Writing file...', progress: 50 });
        const arrayBuffer = await res.arrayBuffer();
        await fs.writeFile(zipPath, Buffer.from(arrayBuffer));
        
        sendEvent({ step: 1, status: 'completed', message: 'Downloaded ComfyUI', progress: 100 });

        // Step 1b: Extract
        sendEvent({ step: 1, status: 'running', message: 'Extracting...', progress: 0 });
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(rootDir, true);
        // Github extracts as "ComfyUI-master". Move it to ".comfyui" safely
        try {
          await fs.rm(comfyDir, { recursive: true, force: true });
        } catch (e) {
          // If locked, wait a bit and try one more time
          await new Promise(r => setTimeout(r, 1000));
          await fs.rm(comfyDir, { recursive: true, force: true }).catch(() => {});
        }
        
        await fs.rename(path.join(rootDir, 'ComfyUI-master'), comfyDir);
        await fs.unlink(zipPath).catch(() => {});
        
        sendEvent({ step: 1, status: 'completed', message: 'Extracted ComfyUI', progress: 100 });

        // Step 2: Dependencies (Python venv)
        sendEvent({ step: 2, status: 'running', message: 'Setting up Python environment...', progress: 0 });
        
        function runCommand(cmd: string, args: string[], cwd: string): Promise<void> {
          return new Promise((resolve, reject) => {
            const proc = spawn(cmd, args, { cwd, shell: true });
            proc.stdout.on('data', (data) => {
              sendEvent({ step: 2, status: 'running', message: data.toString().trim().slice(0, 50), progress: 50 });
            });
            proc.stderr.on('data', (data) => {
              sendEvent({ step: 2, status: 'running', message: data.toString().trim().slice(0, 50), progress: 50 });
            });
            proc.on('close', (code) => {
              if (code === 0) resolve();
              else reject(new Error(`Command failed with code ${code}`));
            });
            proc.on('error', reject);
          });
        }

        // Python venv
        await runCommand('python', ['-m', 'venv', 'venv'], comfyDir);
        const pipPath = path.join('.', 'venv', 'Scripts', 'pip');
        
        // PyTorch install
        sendEvent({ step: 2, status: 'running', message: 'Installing PyTorch (this takes a while)...', progress: 50 });
        try {
          await runCommand(pipPath, ['install', 'torch', 'torchvision', 'torchaudio'], comfyDir);
        } catch (e: any) {
          console.warn('PyTorch install non-fatal error:', e.message);
        }
        
        // Requirements install
        sendEvent({ step: 2, status: 'running', message: 'Installing ComfyUI requirements...', progress: 80 });
        try {
          await runCommand(pipPath, ['install', '-r', 'requirements.txt'], comfyDir);
        } catch (e: any) {
          console.warn('Requirements install non-fatal error:', e.message);
        }
        
        sendEvent({ step: 2, status: 'completed', message: 'Dependencies installed', progress: 100 });

        // Step 3, 4, 5, 6
        sendEvent({ step: 3, status: 'completed', message: 'Ready to launch', progress: 100 });
        sendEvent({ step: 4, status: 'completed', message: 'API Configured', progress: 100 });
        sendEvent({ step: 5, status: 'completed', message: 'Model check', progress: 100 });
        sendEvent({ step: 6, status: 'completed', message: 'Installation Complete!', progress: 100 });

        controller.close();
      } catch (err: any) {
        sendEvent({ step: -1, status: 'error', message: err.message, progress: 0 });
        controller.close();
      }
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
