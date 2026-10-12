const fs = require('fs');
const path = require('path');

async function main() {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    console.error('NVIDIA_API_KEY not set in environment');
    process.exit(2);
  }

  const url = 'https://integrate.api.nvidia.com/v1/images/generations';
  const model = process.env.NVIDIA_MODEL || 'stabilityai/stable-diffusion-xl';
  const body = {
    model,
    prompt: 'Test generation for local dev - plain background, centered subject, 1:1',
    width: 1024,
    height: 1024,
    steps: 20,
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '<no body>');
      console.error('NVIDIA API error:', res.status, txt);
      process.exit(3);
    }

    const json = await res.json();
    const artifact = json.artifacts?.[0] ?? json.data?.[0];
    if (!artifact) {
      console.error('No artifact in NVIDIA response', JSON.stringify(json));
      process.exit(4);
    }

    const b64 = artifact.base64 ?? artifact.b64_json;
    if (!b64) {
      console.error('No base64 image data in artifact', JSON.stringify(artifact));
      process.exit(5);
    }

    const outDir = path.join(__dirname, '..', 'tmp');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'nvidia-test.png');
    fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
    console.log('WROTE_IMAGE', outPath);
  } catch (err) {
    console.error('Request failed:', err instanceof Error ? err.message : String(err));
    process.exit(6);
  }
}

main();
