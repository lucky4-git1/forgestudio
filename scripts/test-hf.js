const fs = require('fs');
const path = require('path');

async function main() {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    console.error('HUGGINGFACE_API_KEY not set in environment');
    process.exit(2);
  }

  const model = process.env.HUGGINGFACE_MODEL || 'FLUX.1-schnell';
  const url = `https://router.huggingface.co/hf-inference/models/${encodeURIComponent(model)}`;

  const body = { inputs: 'Test image generation: a clean product photo on white background', options: { wait_for_model: true } };

  try {
    const https = require('https');
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + (urlObj.search || ''),
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'image/jpeg',
      },
    };

    const req = https.request(reqOptions, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (res.statusCode && res.statusCode >= 400) {
          const txt = buf.toString('utf8') || '<no body>';
          console.error('Hugging Face API error:', res.statusCode, txt);
          process.exit(3);
        }

        const contentType = (res.headers['content-type'] || '').toString();
        if (contentType.startsWith('image/')) {
          const outDir = path.join(__dirname, '..', 'tmp');
          if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
          const outPath = path.join(outDir, 'hf-test.png');
          fs.writeFileSync(outPath, buf);
          console.log('WROTE_IMAGE', outPath);
          return;
        }

        // Otherwise treat as JSON
        let json = null;
        try {
          json = JSON.parse(buf.toString('utf8'));
        } catch (e) {
          console.error('Hugging Face returned non-JSON non-image response');
          process.exit(4);
        }

        let b64 = null;
        if (Array.isArray(json) && typeof json[0] === 'string') b64 = json[0];
        if (!b64 && json?.generated_image) b64 = json.generated_image;
        if (!b64 && json?.image) b64 = json.image;
        if (!b64 && json?.images && Array.isArray(json.images) && json.images[0]) b64 = json.images[0];

        if (!b64) {
          console.error('Hugging Face did not return image data', JSON.stringify(json));
          process.exit(4);
        }

        const outBuf = Buffer.from(b64, 'base64');
        const outDir = path.join(__dirname, '..', 'tmp');
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        const outPath = path.join(outDir, 'hf-test.png');
        fs.writeFileSync(outPath, outBuf);
        console.log('WROTE_IMAGE', outPath);
      });
    });

    req.on('error', (err) => {
      console.error('Request failed:', err && err.message ? err.message : String(err));
      process.exit(5);
    });

    req.write(JSON.stringify(body));
    req.end();
  } catch (err) {
    console.error('Request setup failed:', err instanceof Error ? err.message : String(err));
    process.exit(6);
  }
}

main();
