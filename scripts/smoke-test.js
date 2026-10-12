async function test() {
  const base = 'http://localhost:3000';
  const endpoints = [
    '/api/user',
    '/api/ai-settings',
    '/api/ai-manager/providers',
    '/api/ai-manager/analytics',
    '/api/generate',
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(base + ep, { method: 'GET' });
      const text = await res.text();
      console.log(`${ep} -> ${res.status} ${res.statusText}`);
      console.log(text.length > 500 ? text.slice(0, 500) + '... (truncated)' : text);
    } catch (err) {
      console.error(`${ep} -> ERROR`, err.message || err);
    }
  }
}

// Node 18+ has global fetch; fallback for older versions is not included.
if (require.main === module) {
  test();
}
