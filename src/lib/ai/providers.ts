export const AI_PROVIDERS = [
  {
    id: 'nvidia',
    name: 'NVIDIA',
    models: {
      image: [
        { id: 'flux', name: 'FLUX' },
        { id: 'sdxl', name: 'SDXL' },
      ],
      video: [
        { id: 'cosmos', name: 'Cosmos' },
        { id: 'wan', name: 'Wan' },
        { id: 'hunyuan', name: 'Hunyuan' },
      ],
    },
  },
  {
    id: 'openai',
    name: 'OpenAI',
    models: { image: [{ id: 'dalle', name: 'DALL·E' }], video: [] },
  },
  {
    id: 'replicate',
    name: 'Replicate',
    models: { image: [], video: [] },
  },
  {
    id: 'stability',
    name: 'Stability',
    models: { image: [{ id: 'sdxl', name: 'SDXL' }], video: [] },
  },
];
