import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const DATA_DIR = path.resolve(process.cwd(), 'data');

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // ignore
  }
}

async function readFile(name: string) {
  await ensureDir();
  const p = path.join(DATA_DIR, name);
  try {
    const txt = await fs.readFile(p, 'utf-8');
    return JSON.parse(txt);
  } catch (err) {
    return null;
  }
}

async function writeFile(name: string, data: any) {
  await ensureDir();
  const p = path.join(DATA_DIR, name);
  await fs.writeFile(p, JSON.stringify(data, null, 2), 'utf-8');
}

// Users
export async function getLocalUser() {
  let users = (await readFile('users.json')) ?? [];
  if (users.length === 0) {
    const user = {
      id: 'local-user',
      email: process.env.LOCAL_USER_EMAIL ?? 'local@local',
      name: process.env.LOCAL_USER_NAME ?? 'Local User',
      avatar_url: null,
      created_at: new Date().toISOString(),
    };
    users = [user];
    await writeFile('users.json', users);
    return user;
  }
  return users[0];
}

export async function updateLocalUser(updates: Record<string, any>) {
  let users = (await readFile('users.json')) ?? [];
  if (users.length === 0) {
    const user = {
      id: 'local-user',
      email: process.env.LOCAL_USER_EMAIL ?? 'local@local',
      name: process.env.LOCAL_USER_NAME ?? 'Local User',
      avatar_url: null,
      created_at: new Date().toISOString(),
    };
    users = [user];
  }
  const user = { ...users[0], ...updates };
  users[0] = user;
  await writeFile('users.json', users);
  return user;
}

// AI Settings
export async function getLocalAISettings(userId: string) {
  const rows = (await readFile('ai_settings.json')) ?? [];
  const found = rows.find((r: any) => r.user_id === userId);
  return found ?? null;
}

export async function upsertLocalAISettings(userId: string, payload: any) {
  const rows = (await readFile('ai_settings.json')) ?? [];
  let row = rows.find((r: any) => r.user_id === userId);
  if (!row) {
    row = {
      id: randomUUID(),
      user_id: userId,
      provider: payload.provider ?? 'huggingface',
      image_model: payload.image_model ?? 'black-forest-labs/FLUX.1-schnell',
      video_model: payload.video_model ?? 'meituan-longcat/LongCat-Video',
      default_aspect_ratio: payload.default_aspect_ratio ?? '16:9',
      default_quality: payload.default_quality ?? 'standard',
      default_style: payload.default_style ?? 'none',
      negative_prompt: payload.negative_prompt ?? '',
      provider_api_key: payload.provider_api_key ?? payload.providerApiKey ?? null,
      auto_save: payload.auto_save ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    rows.push(row);
  } else {
    row = { ...row, ...payload, provider_api_key: payload.provider_api_key ?? payload.providerApiKey ?? row.provider_api_key, updated_at: new Date().toISOString() };
    const idx = rows.findIndex((r: any) => r.user_id === userId);
    rows[idx] = row;
  }
  await writeFile('ai_settings.json', rows);
  return row;
}

// Generations
export async function listGenerations() {
  return (await readFile('generations.json')) ?? [];
}

export async function createPendingGeneration(userId: string, generation_type: string) {
  const rows = (await readFile('generations.json')) ?? [];
  const row = {
    id: randomUUID(),
    user_id: userId,
    provider: null,
    generation_type,
    credits_used: 0,
    status: 'pending',
    created_at: new Date().toISOString(),
    completed_at: null,
  };
  rows.push(row);
  await writeFile('generations.json', rows);
  return row;
}

export async function finalizeGeneration(id: string, updates: Partial<any>) {
  const rows = (await readFile('generations.json')) ?? [];
  const idx = rows.findIndex((r: any) => r.id === id);
  if (idx === -1) throw new Error('Generation not found');
  rows[idx] = { ...rows[idx], ...updates, status: updates.status ?? 'completed', completed_at: new Date().toISOString() };
  await writeFile('generations.json', rows);
  return rows[idx];
}

export async function recordFailedLocalGeneration(idOrUser: string, generation_type: string, provider?: string) {
  // if idOrUser looks like a uuid present in list, update it
  const rows = (await readFile('generations.json')) ?? [];
  const byId = rows.find((r: any) => r.id === idOrUser);
  if (byId) {
    byId.status = 'failed';
    byId.completed_at = new Date().toISOString();
    byId.provider = provider ?? byId.provider;
    await writeFile('generations.json', rows);
    return byId;
  }
  const row = {
    id: randomUUID(),
    user_id: idOrUser,
    provider: provider ?? null,
    generation_type,
    credits_used: 0,
    status: 'failed',
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
  };
  rows.push(row);
  await writeFile('generations.json', rows);
  return row;
}

// Assets
export async function listAssets() {
  return (await readFile('assets.json')) ?? [];
}

export async function storeLocalAsset(userId: string, asset: any) {
  const rows = (await readFile('assets.json')) ?? [];
  const row = { id: randomUUID(), ...asset, user_id: userId, created_at: new Date().toISOString() };
  rows.push(row);
  await writeFile('assets.json', rows);
  return row;
}

export async function deleteLocalAsset(id: string) {
  const rows = (await readFile('assets.json')) ?? [];
  const idx = rows.findIndex((r: any) => r.id === id);
  if (idx === -1) return false;
  rows.splice(idx, 1);
  await writeFile('assets.json', rows);
  return true;
}

export async function updateLocalAsset(id: string, updates: Partial<any>) {
  const rows = (await readFile('assets.json')) ?? [];
  const idx = rows.findIndex((r: any) => r.id === id);
  if (idx === -1) throw new Error('Asset not found');
  rows[idx] = { ...rows[idx], ...updates };
  await writeFile('assets.json', rows);
  return rows[idx];
}

// Projects (minimal)
export async function listProjects() {
  return (await readFile('projects.json')) ?? [];
}

export async function createLocalProject(userId: string, payload: any) {
  const rows = (await readFile('projects.json')) ?? [];
  const row = { id: randomUUID(), user_id: userId, ...payload, created_at: new Date().toISOString() };
  rows.push(row);
  await writeFile('projects.json', rows);
  return row;
}

export async function deleteLocalProject(id: string) {
  const rows = (await readFile('projects.json')) ?? [];
  const idx = rows.findIndex((r: any) => r.id === id);
  if (idx === -1) return false;
  rows.splice(idx, 1);
  await writeFile('projects.json', rows);
  return true;
}

export async function updateLocalProject(id: string, updates: Partial<any>) {
  const rows = (await readFile('projects.json')) ?? [];
  const idx = rows.findIndex((r: any) => r.id === id);
  if (idx === -1) throw new Error('Project not found');
  rows[idx] = { ...rows[idx], ...updates };
  await writeFile('projects.json', rows);
  return rows[idx];
}

// Brand kits
export async function listBrandKits() {
  return (await readFile('brand_kits.json')) ?? [];
}

export async function createLocalBrandKit(userId: string, payload: any) {
  const rows = (await readFile('brand_kits.json')) ?? [];
  const row = { id: randomUUID(), user_id: userId, ...payload, created_at: new Date().toISOString() };
  rows.push(row);
  await writeFile('brand_kits.json', rows);
  return row;
}

export async function deleteLocalBrandKit(id: string) {
  const rows = (await readFile('brand_kits.json')) ?? [];
  const idx = rows.findIndex((r: any) => r.id === id);
  if (idx === -1) return false;
  rows.splice(idx, 1);
  await writeFile('brand_kits.json', rows);
  return true;
}

export async function updateLocalBrandKit(id: string, updates: Partial<any>) {
  const rows = (await readFile('brand_kits.json')) ?? [];
  const idx = rows.findIndex((r: any) => r.id === id);
  if (idx === -1) throw new Error('Brand kit not found');
  rows[idx] = { ...rows[idx], ...updates };
  await writeFile('brand_kits.json', rows);
  return rows[idx];
}


// Analytics
export async function getLocalAnalytics() {
  const gens = (await readFile('generations.json')) ?? [];
  const assets = (await readFile('assets.json')) ?? [];
  const totalRequests = gens.length;
  const successfulRequests = gens.filter((g: any) => g.status === 'completed').length;
  const failedRequests = gens.filter((g: any) => g.status === 'failed').length;
  const imagesGenerated = assets.filter((a: any) => a.type === 'image').length;
  const videosGenerated = assets.filter((a: any) => a.type === 'video').length;
  const creditsUsed = gens.reduce((s: number, g: any) => s + (g.credits_used ?? 0), 0);
  const providerUsage: Record<string, number> = {};
  gens.forEach((g: any) => {
    const p = g.provider ?? 'unknown';
    providerUsage[p] = (providerUsage[p] || 0) + 1;
  });
  const durations = gens.filter((g: any) => g.completed_at && g.created_at).map((g: any) => (new Date(g.completed_at).getTime() - new Date(g.created_at).getTime()) / 1000);
  const avgGenerationTime = durations.length ? durations.reduce((a: number, b: number) => a + b, 0) / durations.length : null;
  return {
    totalRequests,
    successfulRequests,
    failedRequests,
    avgGenerationTime,
    imagesGenerated,
    videosGenerated,
    creditsUsed,
    providerUsage,
    recentGenerations: gens.slice(-50).reverse(),
  };
}
