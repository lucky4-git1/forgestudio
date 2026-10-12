(async () => {
  const ports = [3000, 3001];
  const endpoints = ['/api/user', '/api/ai-settings', '/api/ai-manager/providers', '/api/ai-manager/analytics'];

  for (const port of ports) {
    console.log(`\n--- Testing port ${port} ---`);
    for (const ep of endpoints) {
      try {
        const res = await fetch(`http://localhost:${port}${ep}`);
        const text = await res.text();
        console.log(`${ep} -> ${res.status}`);
        console.log(text.length > 200 ? text.slice(0,200) + '...':'', '\n');
      } catch (err) {
        console.error(`${ep} -> ERROR`, err.message || err);
      }
    }

    // Try a logo generation POST
    try {
      console.log('\nPOST /api/generate (logo)');
      const body = { type: 'logo', prompt: 'Test logo for a modern startup', options: {} };
      const res = await fetch(`http://localhost:${port}/api/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const txt = await res.text();
      console.log(`/api/generate -> ${res.status}`);
      console.log(txt.length > 1000 ? txt.slice(0,1000) + '... (truncated)' : txt);
    } catch (err) {
      console.error('/api/generate -> ERROR', err.message || err);
    }
  }
})();
