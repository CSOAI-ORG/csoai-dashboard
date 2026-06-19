/**
 * CSOAI Layer-0 entity registry — "companies on the map".
 *
 * A seed registry of REAL, publicly-known AI & robotics companies/organisations,
 * spread across regions, with their HQ coordinates, real known systems, and the
 * framework slugs that PLAUSIBLY APPLY to them (`inScope`).
 *
 * POSTURE — help-first. `inScope` is the set of obligations that *apply* to an
 * entity given its jurisdiction + system types. It is a NEUTRAL scope fact, never
 * a "non-compliant" claim, and never a verdict. No compliance status, violations,
 * fines, or judgements are asserted here. Only real companies, real products, and
 * real HQ cities — where a coordinate or product was uncertain it was omitted, not
 * fabricated.
 *
 * Joins:
 *  - `jurisdiction` is an ISO 3166-1 alpha-3 present in NUMERIC_TO_A3 (regulationsGeo.ts).
 *  - every `inScope` slug is a real framework slug in FRAMEWORKS (frameworks.ts).
 *  - `inScope` is seeded from the jurisdiction's COUNTRY_FRAMEWORKS entries, plus
 *    cross-border attachments by system type (e.g. an EU GPAI lab → 'eu-ai-act';
 *    a biometric/face-recognition system → high-risk logic under the local regime).
 */
import type { Entity, AISystem } from './types';
import { COUNTRY_FRAMEWORKS } from '../regulationsGeo';

const T = (kind: AISystem['kind'] = 'other') => kind;

/**
 * Build inScope = the jurisdiction's national/bloc frameworks ∪ any extra
 * cross-border slugs that attach via system type. Deduped, order-stable.
 */
function scope(iso3: string, extra: string[] = []): string[] {
  const national = COUNTRY_FRAMEWORKS[iso3] ?? [];
  return Array.from(new Set([...national, ...extra]));
}

export const ENTITIES: Entity[] = [
  // ───────────────────────────── United Kingdom ─────────────────────────────
  {
    slug: 'gb-deepmind',
    name: 'Google DeepMind',
    jurisdiction: 'GBR',
    geo: { lon: -0.1278, lat: 51.5074 },
    sector: 'AI research lab',
    sizeBand: 'large',
    systems: [
      { name: 'Gemini', kind: 'llm', riskTier: 'gpai', description: 'Frontier multimodal model family.' },
      { name: 'AlphaFold', kind: 'other', description: 'Protein-structure prediction.' },
    ],
    inScope: scope('GBR', ['eu-ai-act']),
    layer0: { id: 'ent:gbr:gb-deepmind' },
  },
  {
    slug: 'gb-wayve',
    name: 'Wayve',
    jurisdiction: 'GBR',
    geo: { lon: -0.1257, lat: 51.5320 },
    sector: 'Autonomous driving',
    sizeBand: 'mid',
    systems: [
      { name: 'AV2.0 driving model', kind: 'autonomous', riskTier: 'high', description: 'End-to-end learned self-driving.' },
    ],
    inScope: scope('GBR', ['eu-ai-act']),
    layer0: { id: 'ent:gbr:gb-wayve' },
  },
  {
    slug: 'gb-stabilityai',
    name: 'Stability AI',
    jurisdiction: 'GBR',
    geo: { lon: -0.1278, lat: 51.5074 },
    sector: 'Generative AI',
    sizeBand: 'sme',
    systems: [
      { name: 'Stable Diffusion', kind: 'vision', riskTier: 'gpai', description: 'Open image-generation model.' },
    ],
    inScope: scope('GBR', ['eu-ai-act']),
    layer0: { id: 'ent:gbr:gb-stabilityai' },
  },
  {
    slug: 'gb-synthesia',
    name: 'Synthesia',
    jurisdiction: 'GBR',
    geo: { lon: -0.1278, lat: 51.5074 },
    sector: 'Generative AI video',
    sizeBand: 'sme',
    systems: [
      { name: 'AI avatar video platform', kind: 'vision', riskTier: 'limited', description: 'Synthetic talking-head video (transparency-relevant).' },
    ],
    inScope: scope('GBR', ['eu-ai-act']),
    layer0: { id: 'ent:gbr:gb-synthesia' },
  },
  {
    slug: 'gb-arm',
    name: 'Arm',
    jurisdiction: 'GBR',
    region: 'GB-CAM',
    geo: { lon: 0.1218, lat: 52.2053 },
    sector: 'Semiconductors / AI compute IP',
    sizeBand: 'large',
    systems: [
      { name: 'Ethos NPU IP', kind: 'other', description: 'ML accelerator IP for edge AI.' },
    ],
    inScope: scope('GBR'),
    layer0: { id: 'ent:gbr:gb-arm' },
  },
  {
    slug: 'gb-darktrace',
    name: 'Darktrace',
    jurisdiction: 'GBR',
    geo: { lon: 0.1218, lat: 52.2053 },
    region: 'GB-CAM',
    sector: 'AI cybersecurity',
    sizeBand: 'mid',
    systems: [
      { name: 'Enterprise Immune System', kind: 'other', description: 'Self-learning anomaly detection.' },
    ],
    inScope: scope('GBR'),
    layer0: { id: 'ent:gbr:gb-darktrace' },
  },

  // ───────────────────────────── United States ─────────────────────────────
  {
    slug: 'us-openai',
    name: 'OpenAI',
    jurisdiction: 'USA',
    region: 'US-CA',
    geo: { lon: -122.4194, lat: 37.7749 },
    sector: 'AI research lab',
    sizeBand: 'large',
    systems: [
      { name: 'GPT-4 / GPT family', kind: 'llm', riskTier: 'gpai', description: 'Frontier large language models.' },
      { name: 'Sora', kind: 'vision', riskTier: 'gpai', description: 'Text-to-video generation.' },
    ],
    inScope: scope('USA', ['eu-ai-act']),
    layer0: { id: 'ent:usa:us-openai' },
  },
  {
    slug: 'us-anthropic',
    name: 'Anthropic',
    jurisdiction: 'USA',
    region: 'US-CA',
    geo: { lon: -122.4194, lat: 37.7749 },
    sector: 'AI research lab',
    sizeBand: 'mid',
    systems: [
      { name: 'Claude', kind: 'llm', riskTier: 'gpai', description: 'Frontier assistant model family.' },
    ],
    inScope: scope('USA', ['eu-ai-act']),
    layer0: { id: 'ent:usa:us-anthropic' },
  },
  {
    slug: 'us-google',
    name: 'Google',
    jurisdiction: 'USA',
    region: 'US-CA',
    geo: { lon: -122.0840, lat: 37.4220 },
    sector: 'Technology / AI',
    sizeBand: 'enterprise',
    systems: [
      { name: 'Gemini', kind: 'llm', riskTier: 'gpai' },
      { name: 'YouTube recommender', kind: 'recommender', riskTier: 'limited' },
    ],
    inScope: scope('USA', ['eu-ai-act']),
    layer0: { id: 'ent:usa:us-google' },
  },
  {
    slug: 'us-meta',
    name: 'Meta',
    jurisdiction: 'USA',
    region: 'US-CA',
    geo: { lon: -122.1483, lat: 37.4848 },
    sector: 'Social / AI',
    sizeBand: 'enterprise',
    systems: [
      { name: 'Llama', kind: 'llm', riskTier: 'gpai', description: 'Open-weight LLM family.' },
      { name: 'Feed & Reels recommender', kind: 'recommender', riskTier: 'limited' },
    ],
    inScope: scope('USA', ['eu-ai-act']),
    layer0: { id: 'ent:usa:us-meta' },
  },
  {
    slug: 'us-xai',
    name: 'xAI',
    jurisdiction: 'USA',
    region: 'US-TX',
    geo: { lon: -97.7431, lat: 30.2672 },
    sector: 'AI research lab',
    sizeBand: 'mid',
    systems: [
      { name: 'Grok', kind: 'llm', riskTier: 'gpai' },
    ],
    inScope: scope('USA', ['eu-ai-act']),
    layer0: { id: 'ent:usa:us-xai' },
  },
  {
    slug: 'us-microsoft',
    name: 'Microsoft',
    jurisdiction: 'USA',
    region: 'US-WA',
    geo: { lon: -122.1215, lat: 47.6740 },
    sector: 'Technology / AI',
    sizeBand: 'enterprise',
    systems: [
      { name: 'Copilot', kind: 'llm', riskTier: 'gpai' },
      { name: 'Azure AI', kind: 'other' },
    ],
    inScope: scope('USA', ['eu-ai-act']),
    layer0: { id: 'ent:usa:us-microsoft' },
  },
  {
    slug: 'us-nvidia',
    name: 'NVIDIA',
    jurisdiction: 'USA',
    region: 'US-CA',
    geo: { lon: -121.9552, lat: 37.3707 },
    sector: 'AI compute / hardware',
    sizeBand: 'enterprise',
    systems: [
      { name: 'CUDA / GPU AI platform', kind: 'other', description: 'Accelerated-compute platform for AI.' },
      { name: 'Isaac robotics platform', kind: 'robotics' },
    ],
    inScope: scope('USA'),
    layer0: { id: 'ent:usa:us-nvidia' },
  },
  {
    slug: 'us-bostondynamics',
    name: 'Boston Dynamics',
    jurisdiction: 'USA',
    region: 'US-MA',
    geo: { lon: -71.2092, lat: 42.3954 },
    sector: 'Robotics',
    sizeBand: 'mid',
    systems: [
      { name: 'Spot', kind: 'robotics', riskTier: 'high', description: 'Quadruped mobile robot.' },
      { name: 'Atlas', kind: 'robotics', riskTier: 'high', description: 'Humanoid robot.' },
    ],
    inScope: scope('USA'),
    layer0: { id: 'ent:usa:us-bostondynamics' },
  },
  {
    slug: 'us-tesla',
    name: 'Tesla',
    jurisdiction: 'USA',
    region: 'US-TX',
    geo: { lon: -97.6200, lat: 30.2240 },
    sector: 'Automotive / robotics',
    sizeBand: 'enterprise',
    systems: [
      { name: 'Full Self-Driving (FSD)', kind: 'autonomous', riskTier: 'high', description: 'Driver-assistance / autonomy stack.' },
      { name: 'Optimus', kind: 'robotics', riskTier: 'high', description: 'Humanoid robot (in development).' },
    ],
    inScope: scope('USA'),
    layer0: { id: 'ent:usa:us-tesla' },
  },
  {
    slug: 'us-waymo',
    name: 'Waymo',
    jurisdiction: 'USA',
    region: 'US-CA',
    geo: { lon: -122.0840, lat: 37.4220 },
    sector: 'Autonomous driving',
    sizeBand: 'mid',
    systems: [
      { name: 'Waymo Driver', kind: 'autonomous', riskTier: 'high', description: 'Robotaxi self-driving system.' },
    ],
    inScope: scope('USA'),
    layer0: { id: 'ent:usa:us-waymo' },
  },
  {
    slug: 'us-figure',
    name: 'Figure AI',
    jurisdiction: 'USA',
    region: 'US-CA',
    geo: { lon: -121.9886, lat: 37.5483 },
    sector: 'Humanoid robotics',
    sizeBand: 'sme',
    systems: [
      { name: 'Figure humanoid', kind: 'robotics', riskTier: 'high', description: 'General-purpose humanoid robot.' },
    ],
    inScope: scope('USA'),
    layer0: { id: 'ent:usa:us-figure' },
  },
  {
    slug: 'us-clearview',
    name: 'Clearview AI',
    jurisdiction: 'USA',
    region: 'US-NY',
    geo: { lon: -74.0060, lat: 40.7128 },
    sector: 'Facial recognition',
    sizeBand: 'sme',
    systems: [
      { name: 'Facial-recognition search', kind: 'biometric', riskTier: 'high', description: 'Face-matching identification service.' },
    ],
    inScope: scope('USA', ['illinois-bipa']),
    layer0: { id: 'ent:usa:us-clearview' },
  },
  {
    slug: 'us-palantir',
    name: 'Palantir',
    jurisdiction: 'USA',
    region: 'US-CO',
    geo: { lon: -104.9903, lat: 39.7392 },
    sector: 'Data / AI analytics',
    sizeBand: 'large',
    systems: [
      { name: 'AIP (AI Platform)', kind: 'other', description: 'Operational AI / decision platform.' },
    ],
    inScope: scope('USA'),
    layer0: { id: 'ent:usa:us-palantir' },
  },
  {
    slug: 'us-scale',
    name: 'Scale AI',
    jurisdiction: 'USA',
    region: 'US-CA',
    geo: { lon: -122.4194, lat: 37.7749 },
    sector: 'AI data infrastructure',
    sizeBand: 'mid',
    systems: [
      { name: 'Data Engine', kind: 'other', description: 'Training-data labelling & evaluation.' },
    ],
    inScope: scope('USA'),
    layer0: { id: 'ent:usa:us-scale' },
  },
  {
    slug: 'us-amazon',
    name: 'Amazon',
    jurisdiction: 'USA',
    region: 'US-WA',
    geo: { lon: -122.3321, lat: 47.6062 },
    sector: 'Technology / AI',
    sizeBand: 'enterprise',
    systems: [
      { name: 'Rekognition', kind: 'biometric', riskTier: 'high', description: 'Image & face analysis API.' },
      { name: 'Amazon recommender', kind: 'recommender', riskTier: 'limited' },
    ],
    inScope: scope('USA', ['illinois-bipa']),
    layer0: { id: 'ent:usa:us-amazon' },
  },

  // ───────────────────────────── France ─────────────────────────────
  {
    slug: 'fr-mistral',
    name: 'Mistral AI',
    jurisdiction: 'FRA',
    geo: { lon: 2.3522, lat: 48.8566 },
    sector: 'AI research lab',
    sizeBand: 'sme',
    systems: [
      { name: 'Mistral / Mixtral', kind: 'llm', riskTier: 'gpai', description: 'Open-weight & frontier LLMs.' },
    ],
    inScope: scope('FRA'),
    layer0: { id: 'ent:fra:fr-mistral' },
  },
  {
    slug: 'fr-huggingface',
    name: 'Hugging Face',
    jurisdiction: 'FRA',
    geo: { lon: 2.3522, lat: 48.8566 },
    sector: 'AI platform / model hub',
    sizeBand: 'sme',
    systems: [
      { name: 'Transformers / Model Hub', kind: 'other', description: 'Open model & dataset hosting.' },
    ],
    inScope: scope('FRA'),
    layer0: { id: 'ent:fra:fr-huggingface' },
  },
  {
    slug: 'fr-dassault',
    name: 'Dassault Systèmes',
    jurisdiction: 'FRA',
    geo: { lon: 2.0833, lat: 48.8920 },
    sector: 'Industrial software / AI',
    sizeBand: 'large',
    systems: [
      { name: '3DEXPERIENCE AI', kind: 'other', description: 'Engineering / simulation AI.' },
    ],
    inScope: scope('FRA'),
    layer0: { id: 'ent:fra:fr-dassault' },
  },

  // ───────────────────────────── Germany ─────────────────────────────
  {
    slug: 'de-alephalpha',
    name: 'Aleph Alpha',
    jurisdiction: 'DEU',
    geo: { lon: 8.6724, lat: 49.3988 },
    sector: 'AI research lab',
    sizeBand: 'sme',
    systems: [
      { name: 'Luminous / Pharia', kind: 'llm', riskTier: 'gpai', description: 'European sovereign LLM stack.' },
    ],
    inScope: scope('DEU'),
    layer0: { id: 'ent:deu:de-alephalpha' },
  },
  {
    slug: 'de-sap',
    name: 'SAP',
    jurisdiction: 'DEU',
    geo: { lon: 8.6447, lat: 49.2933 },
    sector: 'Enterprise software / AI',
    sizeBand: 'enterprise',
    systems: [
      { name: 'Joule', kind: 'llm', description: 'Enterprise AI copilot.' },
      { name: 'SAP Business AI', kind: 'other' },
    ],
    inScope: scope('DEU'),
    layer0: { id: 'ent:deu:de-sap' },
  },
  {
    slug: 'de-kuka',
    name: 'KUKA',
    jurisdiction: 'DEU',
    geo: { lon: 10.8978, lat: 48.3705 },
    sector: 'Industrial robotics',
    sizeBand: 'large',
    systems: [
      { name: 'Industrial robot arms', kind: 'robotics', riskTier: 'high', description: 'Factory automation robots.' },
    ],
    inScope: scope('DEU'),
    layer0: { id: 'ent:deu:de-kuka' },
  },
  {
    slug: 'de-siemens',
    name: 'Siemens',
    jurisdiction: 'DEU',
    geo: { lon: 11.5820, lat: 48.1351 },
    sector: 'Industrial / AI',
    sizeBand: 'enterprise',
    systems: [
      { name: 'Industrial Copilot', kind: 'other', description: 'Industrial automation AI.' },
    ],
    inScope: scope('DEU'),
    layer0: { id: 'ent:deu:de-siemens' },
  },
  {
    slug: 'de-bosch',
    name: 'Bosch',
    jurisdiction: 'DEU',
    geo: { lon: 9.1770, lat: 48.7758 },
    sector: 'Industrial / mobility AI',
    sizeBand: 'enterprise',
    systems: [
      { name: 'ADAS / driver assistance', kind: 'autonomous', riskTier: 'high' },
    ],
    inScope: scope('DEU'),
    layer0: { id: 'ent:deu:de-bosch' },
  },

  // ───────────────────────────── Netherlands / Spain / Sweden / Italy ──────────
  {
    slug: 'nl-asml',
    name: 'ASML',
    jurisdiction: 'NLD',
    geo: { lon: 5.4486, lat: 51.4231 },
    sector: 'Semiconductor lithography',
    sizeBand: 'enterprise',
    systems: [
      { name: 'Computational lithography AI', kind: 'other', description: 'ML-driven chip-fab optimisation.' },
    ],
    inScope: scope('NLD'),
    layer0: { id: 'ent:nld:nl-asml' },
  },
  {
    slug: 'es-erniebot',
    name: 'Sngular',
    jurisdiction: 'ESP',
    geo: { lon: -3.7038, lat: 40.4168 },
    sector: 'AI software services',
    sizeBand: 'sme',
    systems: [
      { name: 'Enterprise AI solutions', kind: 'other' },
    ],
    inScope: scope('ESP'),
    layer0: { id: 'ent:esp:es-erniebot' },
  },
  {
    slug: 'se-einride',
    name: 'Einride',
    jurisdiction: 'SWE',
    geo: { lon: 18.0686, lat: 59.3293 },
    sector: 'Autonomous freight',
    sizeBand: 'sme',
    systems: [
      { name: 'Autonomous electric trucks', kind: 'autonomous', riskTier: 'high', description: 'Driverless freight vehicles.' },
    ],
    inScope: scope('SWE'),
    layer0: { id: 'ent:swe:se-einride' },
  },
  {
    slug: 'it-leonardo',
    name: 'Leonardo',
    jurisdiction: 'ITA',
    geo: { lon: 12.4964, lat: 41.9028 },
    sector: 'Aerospace / defence AI',
    sizeBand: 'enterprise',
    systems: [
      { name: 'Autonomous systems & sensors', kind: 'autonomous', riskTier: 'high' },
    ],
    inScope: scope('ITA'),
    layer0: { id: 'ent:ita:it-leonardo' },
  },

  // ───────────────────────────── Switzerland ─────────────────────────────
  {
    slug: 'ch-abb',
    name: 'ABB Robotics',
    jurisdiction: 'CHE',
    geo: { lon: 8.5417, lat: 47.3769 },
    sector: 'Industrial robotics',
    sizeBand: 'enterprise',
    systems: [
      { name: 'Industrial robot arms', kind: 'robotics', riskTier: 'high', description: 'Factory & logistics automation.' },
    ],
    inScope: scope('CHE'),
    layer0: { id: 'ent:che:ch-abb' },
  },
  {
    slug: 'ch-anybotics',
    name: 'ANYbotics',
    jurisdiction: 'CHE',
    geo: { lon: 8.5417, lat: 47.3769 },
    sector: 'Legged robotics',
    sizeBand: 'sme',
    systems: [
      { name: 'ANYmal', kind: 'robotics', riskTier: 'high', description: 'Autonomous inspection quadruped.' },
    ],
    inScope: scope('CHE'),
    layer0: { id: 'ent:che:ch-anybotics' },
  },

  // ───────────────────────────── Japan ─────────────────────────────
  {
    slug: 'jp-fanuc',
    name: 'FANUC',
    jurisdiction: 'JPN',
    geo: { lon: 138.7274, lat: 35.4878 },
    sector: 'Industrial robotics',
    sizeBand: 'large',
    systems: [
      { name: 'Industrial robots & CNC', kind: 'robotics', riskTier: 'high', description: 'Factory automation robots.' },
    ],
    inScope: scope('JPN'),
    layer0: { id: 'ent:jpn:jp-fanuc' },
  },
  {
    slug: 'jp-preferrednetworks',
    name: 'Preferred Networks',
    jurisdiction: 'JPN',
    geo: { lon: 139.6917, lat: 35.6895 },
    sector: 'AI research / deep learning',
    sizeBand: 'mid',
    systems: [
      { name: 'PLaMo', kind: 'llm', riskTier: 'gpai', description: 'Japanese large language model.' },
    ],
    inScope: scope('JPN'),
    layer0: { id: 'ent:jpn:jp-preferrednetworks' },
  },
  {
    slug: 'jp-softbankrobotics',
    name: 'SoftBank Robotics',
    jurisdiction: 'JPN',
    geo: { lon: 139.7454, lat: 35.6655 },
    sector: 'Service robotics',
    sizeBand: 'mid',
    systems: [
      { name: 'Pepper', kind: 'robotics', riskTier: 'limited', description: 'Humanoid service robot.' },
    ],
    inScope: scope('JPN'),
    layer0: { id: 'ent:jpn:jp-softbankrobotics' },
  },
  {
    slug: 'jp-sakanaai',
    name: 'Sakana AI',
    jurisdiction: 'JPN',
    geo: { lon: 139.6917, lat: 35.6895 },
    sector: 'AI research lab',
    sizeBand: 'sme',
    systems: [
      { name: 'Evolutionary model merging', kind: 'llm', riskTier: 'gpai' },
    ],
    inScope: scope('JPN'),
    layer0: { id: 'ent:jpn:jp-sakanaai' },
  },

  // ───────────────────────────── South Korea ─────────────────────────────
  {
    slug: 'kr-naver',
    name: 'Naver',
    jurisdiction: 'KOR',
    geo: { lon: 127.1052, lat: 37.3595 },
    sector: 'Internet / AI',
    sizeBand: 'enterprise',
    systems: [
      { name: 'HyperCLOVA X', kind: 'llm', riskTier: 'gpai', description: 'Korean large language model.' },
    ],
    inScope: scope('KOR'),
    layer0: { id: 'ent:kor:kr-naver' },
  },
  {
    slug: 'kr-samsung',
    name: 'Samsung Electronics',
    jurisdiction: 'KOR',
    geo: { lon: 127.0444, lat: 37.2580 },
    sector: 'Electronics / AI',
    sizeBand: 'enterprise',
    systems: [
      { name: 'Gauss', kind: 'llm', riskTier: 'gpai', description: 'On-device generative AI.' },
    ],
    inScope: scope('KOR'),
    layer0: { id: 'ent:kor:kr-samsung' },
  },
  {
    slug: 'kr-rainbowrobotics',
    name: 'Rainbow Robotics',
    jurisdiction: 'KOR',
    geo: { lon: 127.3845, lat: 36.3504 },
    sector: 'Robotics',
    sizeBand: 'sme',
    systems: [
      { name: 'Humanoid & collaborative robots', kind: 'robotics', riskTier: 'high' },
    ],
    inScope: scope('KOR'),
    layer0: { id: 'ent:kor:kr-rainbowrobotics' },
  },
  {
    slug: 'kr-upstage',
    name: 'Upstage',
    jurisdiction: 'KOR',
    geo: { lon: 127.1052, lat: 37.4012 },
    sector: 'AI research lab',
    sizeBand: 'sme',
    systems: [
      { name: 'Solar LLM', kind: 'llm', riskTier: 'gpai' },
    ],
    inScope: scope('KOR'),
    layer0: { id: 'ent:kor:kr-upstage' },
  },

  // ───────────────────────────── China ─────────────────────────────
  {
    slug: 'cn-sensetime',
    name: 'SenseTime',
    jurisdiction: 'CHN',
    geo: { lon: 121.4737, lat: 31.2304 },
    sector: 'Computer vision / AI',
    sizeBand: 'large',
    systems: [
      { name: 'SenseFace', kind: 'biometric', riskTier: 'high', description: 'Facial-recognition platform.' },
      { name: 'SenseNova', kind: 'llm', riskTier: 'gpai' },
    ],
    inScope: scope('CHN'),
    layer0: { id: 'ent:chn:cn-sensetime' },
  },
  {
    slug: 'cn-baidu',
    name: 'Baidu',
    jurisdiction: 'CHN',
    geo: { lon: 116.4074, lat: 39.9042 },
    sector: 'Internet / AI',
    sizeBand: 'enterprise',
    systems: [
      { name: 'ERNIE Bot', kind: 'llm', riskTier: 'gpai' },
      { name: 'Apollo', kind: 'autonomous', riskTier: 'high', description: 'Autonomous-driving platform.' },
    ],
    inScope: scope('CHN'),
    layer0: { id: 'ent:chn:cn-baidu' },
  },
  {
    slug: 'cn-deepseek',
    name: 'DeepSeek',
    jurisdiction: 'CHN',
    geo: { lon: 120.1551, lat: 30.2741 },
    sector: 'AI research lab',
    sizeBand: 'sme',
    systems: [
      { name: 'DeepSeek-V / R series', kind: 'llm', riskTier: 'gpai', description: 'Open-weight frontier LLMs.' },
    ],
    inScope: scope('CHN'),
    layer0: { id: 'ent:chn:cn-deepseek' },
  },
  {
    slug: 'cn-unitree',
    name: 'Unitree Robotics',
    jurisdiction: 'CHN',
    geo: { lon: 120.1551, lat: 30.2741 },
    sector: 'Robotics',
    sizeBand: 'sme',
    systems: [
      { name: 'Go2 / H1 robots', kind: 'robotics', riskTier: 'high', description: 'Quadruped & humanoid robots.' },
    ],
    inScope: scope('CHN'),
    layer0: { id: 'ent:chn:cn-unitree' },
  },
  {
    slug: 'cn-ubtech',
    name: 'UBTech Robotics',
    jurisdiction: 'CHN',
    geo: { lon: 114.0579, lat: 22.5431 },
    sector: 'Humanoid robotics',
    sizeBand: 'mid',
    systems: [
      { name: 'Walker humanoid', kind: 'robotics', riskTier: 'high' },
    ],
    inScope: scope('CHN'),
    layer0: { id: 'ent:chn:cn-ubtech' },
  },
  {
    slug: 'cn-alibaba',
    name: 'Alibaba',
    jurisdiction: 'CHN',
    geo: { lon: 120.1551, lat: 30.2741 },
    sector: 'Internet / cloud AI',
    sizeBand: 'enterprise',
    systems: [
      { name: 'Qwen (Tongyi Qianwen)', kind: 'llm', riskTier: 'gpai', description: 'Open-weight LLM family.' },
    ],
    inScope: scope('CHN'),
    layer0: { id: 'ent:chn:cn-alibaba' },
  },
  {
    slug: 'cn-megvii',
    name: 'Megvii',
    jurisdiction: 'CHN',
    geo: { lon: 116.4074, lat: 39.9042 },
    sector: 'Computer vision',
    sizeBand: 'mid',
    systems: [
      { name: 'Face++', kind: 'biometric', riskTier: 'high', description: 'Facial-recognition platform.' },
    ],
    inScope: scope('CHN'),
    layer0: { id: 'ent:chn:cn-megvii' },
  },

  // ───────────────────────────── Taiwan ─────────────────────────────
  {
    slug: 'tw-tsmc',
    name: 'TSMC',
    jurisdiction: 'TWN',
    geo: { lon: 120.9786, lat: 24.7740 },
    sector: 'Semiconductor manufacturing',
    sizeBand: 'enterprise',
    systems: [
      { name: 'Fab process ML', kind: 'other', description: 'ML-driven yield optimisation.' },
    ],
    inScope: scope('TWN'),
    layer0: { id: 'ent:twn:tw-tsmc' },
  },

  // ───────────────────────────── India ─────────────────────────────
  {
    slug: 'in-sarvam',
    name: 'Sarvam AI',
    jurisdiction: 'IND',
    geo: { lon: 77.5946, lat: 12.9716 },
    sector: 'AI research lab',
    sizeBand: 'sme',
    systems: [
      { name: 'Sarvam LLM', kind: 'llm', riskTier: 'gpai', description: 'Indic-language models.' },
    ],
    inScope: scope('IND'),
    layer0: { id: 'ent:ind:in-sarvam' },
  },
  {
    slug: 'in-krutrim',
    name: 'Krutrim',
    jurisdiction: 'IND',
    geo: { lon: 77.5946, lat: 12.9716 },
    sector: 'AI research lab',
    sizeBand: 'sme',
    systems: [
      { name: 'Krutrim LLM', kind: 'llm', riskTier: 'gpai', description: 'Indic multilingual model.' },
    ],
    inScope: scope('IND'),
    layer0: { id: 'ent:ind:in-krutrim' },
  },
  {
    slug: 'in-tcs',
    name: 'Tata Consultancy Services',
    jurisdiction: 'IND',
    geo: { lon: 72.8777, lat: 19.0760 },
    sector: 'IT services / AI',
    sizeBand: 'enterprise',
    systems: [
      { name: 'TCS AI / WisdomNext', kind: 'other', description: 'Enterprise AI integration platform.' },
    ],
    inScope: scope('IND'),
    layer0: { id: 'ent:ind:in-tcs' },
  },

  // ───────────────────────────── Israel ─────────────────────────────
  {
    slug: 'il-ai21',
    name: 'AI21 Labs',
    jurisdiction: 'ISR',
    geo: { lon: 34.7818, lat: 32.0853 },
    sector: 'AI research lab',
    sizeBand: 'sme',
    systems: [
      { name: 'Jurassic / Jamba', kind: 'llm', riskTier: 'gpai' },
    ],
    inScope: scope('ISR', ['eu-ai-act']),
    layer0: { id: 'ent:isr:il-ai21' },
  },
  {
    slug: 'il-mobileye',
    name: 'Mobileye',
    jurisdiction: 'ISR',
    geo: { lon: 35.2137, lat: 31.7683 },
    sector: 'Autonomous driving',
    sizeBand: 'large',
    systems: [
      { name: 'EyeQ / SuperVision', kind: 'autonomous', riskTier: 'high', description: 'ADAS & self-driving vision system.' },
    ],
    inScope: scope('ISR'),
    layer0: { id: 'ent:isr:il-mobileye' },
  },
  {
    slug: 'il-anyvision',
    name: 'Oosto',
    jurisdiction: 'ISR',
    geo: { lon: 34.7818, lat: 32.0853 },
    sector: 'Facial recognition',
    sizeBand: 'sme',
    systems: [
      { name: 'Vision AI face recognition', kind: 'biometric', riskTier: 'high' },
    ],
    inScope: scope('ISR'),
    layer0: { id: 'ent:isr:il-anyvision' },
  },

  // ───────────────────────────── UAE ─────────────────────────────
  {
    slug: 'ae-g42',
    name: 'G42',
    jurisdiction: 'ARE',
    geo: { lon: 54.3773, lat: 24.4539 },
    sector: 'AI / cloud',
    sizeBand: 'large',
    systems: [
      { name: 'Jais', kind: 'llm', riskTier: 'gpai', description: 'Arabic-English large language model.' },
    ],
    inScope: scope('ARE'),
    layer0: { id: 'ent:are:ae-g42' },
  },
  {
    slug: 'ae-ai71',
    name: 'AI71',
    jurisdiction: 'ARE',
    geo: { lon: 54.3773, lat: 24.4539 },
    sector: 'AI research / enterprise',
    sizeBand: 'sme',
    systems: [
      { name: 'Falcon-based models', kind: 'llm', riskTier: 'gpai', description: 'Enterprise LLM products (TII Falcon).' },
    ],
    inScope: scope('ARE'),
    layer0: { id: 'ent:are:ae-ai71' },
  },

  // ───────────────────────────── Saudi Arabia ─────────────────────────────
  {
    slug: 'sa-sdaia',
    name: 'SDAIA',
    jurisdiction: 'SAU',
    geo: { lon: 46.6753, lat: 24.7136 },
    sector: 'National AI authority',
    sizeBand: 'large',
    systems: [
      { name: 'ALLaM', kind: 'llm', riskTier: 'gpai', description: 'Arabic large language model.' },
    ],
    inScope: scope('SAU'),
    layer0: { id: 'ent:sau:sa-sdaia' },
  },

  // ───────────────────────────── Canada ─────────────────────────────
  {
    slug: 'ca-cohere',
    name: 'Cohere',
    jurisdiction: 'CAN',
    region: 'CA-ON',
    geo: { lon: -79.3832, lat: 43.6532 },
    sector: 'AI research lab',
    sizeBand: 'mid',
    systems: [
      { name: 'Command', kind: 'llm', riskTier: 'gpai', description: 'Enterprise-focused LLM family.' },
    ],
    inScope: scope('CAN', ['eu-ai-act']),
    layer0: { id: 'ent:can:ca-cohere' },
  },
  {
    slug: 'ca-elementai',
    name: 'Mila (Quebec AI Institute)',
    jurisdiction: 'CAN',
    region: 'CA-QC',
    geo: { lon: -73.5673, lat: 45.5017 },
    sector: 'AI research institute',
    sizeBand: 'mid',
    systems: [
      { name: 'Deep-learning research', kind: 'other' },
    ],
    inScope: scope('CAN'),
    layer0: { id: 'ent:can:ca-elementai' },
  },
  {
    slug: 'ca-sanctuary',
    name: 'Sanctuary AI',
    jurisdiction: 'CAN',
    region: 'CA-BC',
    geo: { lon: -123.1207, lat: 49.2827 },
    sector: 'Humanoid robotics',
    sizeBand: 'sme',
    systems: [
      { name: 'Phoenix', kind: 'robotics', riskTier: 'high', description: 'General-purpose humanoid robot.' },
    ],
    inScope: scope('CAN'),
    layer0: { id: 'ent:can:ca-sanctuary' },
  },

  // ───────────────────────────── Australia ─────────────────────────────
  {
    slug: 'au-leonardoai',
    name: 'Leonardo.Ai',
    jurisdiction: 'AUS',
    region: 'AU-NSW',
    geo: { lon: 151.2093, lat: -33.8688 },
    sector: 'Generative AI',
    sizeBand: 'sme',
    systems: [
      { name: 'Image-generation platform', kind: 'vision', riskTier: 'gpai', description: 'Creative image generation.' },
    ],
    inScope: scope('AUS'),
    layer0: { id: 'ent:aus:au-leonardoai' },
  },
  {
    slug: 'au-harrison',
    name: 'Harrison.ai',
    jurisdiction: 'AUS',
    region: 'AU-NSW',
    geo: { lon: 151.2093, lat: -33.8688 },
    sector: 'Medical AI',
    sizeBand: 'sme',
    systems: [
      { name: 'Annalise.ai radiology', kind: 'vision', riskTier: 'high', description: 'Clinical imaging decision support.' },
    ],
    inScope: scope('AUS'),
    layer0: { id: 'ent:aus:au-harrison' },
  },

  // ───────────────────────────── Brazil ─────────────────────────────
  {
    slug: 'br-maritaca',
    name: 'Maritaca AI',
    jurisdiction: 'BRA',
    geo: { lon: -47.0608, lat: -22.9056 },
    sector: 'AI research lab',
    sizeBand: 'sme',
    systems: [
      { name: 'Sabiá', kind: 'llm', riskTier: 'gpai', description: 'Portuguese-language LLM.' },
    ],
    inScope: scope('BRA'),
    layer0: { id: 'ent:bra:br-maritaca' },
  },
  {
    slug: 'br-nubank',
    name: 'Nubank',
    jurisdiction: 'BRA',
    geo: { lon: -46.6333, lat: -23.5505 },
    sector: 'Fintech / AI',
    sizeBand: 'large',
    systems: [
      { name: 'Credit & fraud ML', kind: 'other', description: 'Automated decisioning for finance.' },
    ],
    inScope: scope('BRA'),
    layer0: { id: 'ent:bra:br-nubank' },
  },

  // ───────────────────────────── Singapore ─────────────────────────────
  {
    slug: 'sg-aisingapore',
    name: 'AI Singapore',
    jurisdiction: 'SGP',
    geo: { lon: 103.7764, lat: 1.2966 },
    sector: 'National AI programme',
    sizeBand: 'mid',
    systems: [
      { name: 'SEA-LION', kind: 'llm', riskTier: 'gpai', description: 'Southeast-Asian language model.' },
    ],
    inScope: scope('SGP'),
    layer0: { id: 'ent:sgp:sg-aisingapore' },
  },
  {
    slug: 'sg-grab',
    name: 'Grab',
    jurisdiction: 'SGP',
    geo: { lon: 103.7890, lat: 1.2999 },
    sector: 'Superapp / AI',
    sizeBand: 'large',
    systems: [
      { name: 'Ride & matching recommender', kind: 'recommender', riskTier: 'limited' },
    ],
    inScope: scope('SGP'),
    layer0: { id: 'ent:sgp:sg-grab' },
  },

  // ───────────────────────────── Norway ─────────────────────────────
  {
    slug: 'no-cognite',
    name: 'Cognite',
    jurisdiction: 'NOR',
    geo: { lon: 10.5083, lat: 59.8939 },
    sector: 'Industrial DataOps / AI',
    sizeBand: 'mid',
    systems: [
      { name: 'Cognite Data Fusion', kind: 'other', description: 'Industrial AI / digital-twin platform.' },
    ],
    inScope: scope('NOR'),
    layer0: { id: 'ent:nor:no-cognite' },
  },

  // ───────────────────────────── Ireland / Poland / Finland ──────────
  {
    slug: 'ie-accenture-dublin',
    name: 'Intercom',
    jurisdiction: 'IRL',
    geo: { lon: -6.2603, lat: 53.3498 },
    sector: 'AI customer-service software',
    sizeBand: 'mid',
    systems: [
      { name: 'Fin AI agent', kind: 'llm', riskTier: 'limited', description: 'Customer-support AI agent.' },
    ],
    inScope: scope('IRL'),
    layer0: { id: 'ent:irl:ie-accenture-dublin' },
  },
  {
    slug: 'pl-eleuther',
    name: 'ElevenLabs',
    jurisdiction: 'POL',
    geo: { lon: 21.0122, lat: 52.2297 },
    sector: 'Generative voice AI',
    sizeBand: 'sme',
    systems: [
      { name: 'Voice synthesis & cloning', kind: 'other', riskTier: 'limited', description: 'Synthetic speech (transparency-relevant).' },
    ],
    inScope: scope('POL'),
    layer0: { id: 'ent:pol:pl-eleuther' },
  },
  {
    slug: 'fi-silo',
    name: 'Silo AI',
    jurisdiction: 'FIN',
    geo: { lon: 24.9384, lat: 60.1699 },
    sector: 'AI research / models',
    sizeBand: 'sme',
    systems: [
      { name: 'Poro / Viking LLMs', kind: 'llm', riskTier: 'gpai', description: 'Open European-language models.' },
    ],
    inScope: scope('FIN'),
    layer0: { id: 'ent:fin:fi-silo' },
  },

  // ───────────────────────────── Nigeria / Kenya / South Africa ──────────
  {
    slug: 'ng-awarri',
    name: 'Awarri',
    jurisdiction: 'NGA',
    geo: { lon: 3.3792, lat: 6.5244 },
    sector: 'AI research lab',
    sizeBand: 'micro',
    systems: [
      { name: 'LLaM(N)A', kind: 'llm', riskTier: 'gpai', description: 'Nigerian multilingual LLM initiative.' },
    ],
    inScope: scope('NGA'),
    layer0: { id: 'ent:nga:ng-awarri' },
  },
  {
    slug: 'ke-jacaranda',
    name: 'Jacaranda Health',
    jurisdiction: 'KEN',
    geo: { lon: 36.8219, lat: -1.2921 },
    sector: 'Health AI',
    sizeBand: 'sme',
    systems: [
      { name: 'PROMPTS / UlizaLlama', kind: 'llm', riskTier: 'high', description: 'Maternal-health AI assistant.' },
    ],
    inScope: scope('KEN'),
    layer0: { id: 'ent:ken:ke-jacaranda' },
  },
  {
    slug: 'za-lelapa',
    name: 'Lelapa AI',
    jurisdiction: 'ZAF',
    geo: { lon: 28.0473, lat: -26.2041 },
    sector: 'AI research lab',
    sizeBand: 'micro',
    systems: [
      { name: 'InkubaLM', kind: 'llm', riskTier: 'gpai', description: 'African low-resource-language model.' },
    ],
    inScope: scope('ZAF'),
    layer0: { id: 'ent:zaf:za-lelapa' },
  },

  // ───────────────────────────── Indonesia / Malaysia / Vietnam ──────────
  {
    slug: 'id-goto',
    name: 'GoTo (Gojek/Tokopedia)',
    jurisdiction: 'IDN',
    geo: { lon: 106.8456, lat: -6.2088 },
    sector: 'Superapp / AI',
    sizeBand: 'large',
    systems: [
      { name: 'Dispatch & marketplace ML', kind: 'recommender', riskTier: 'limited' },
    ],
    inScope: scope('IDN'),
    layer0: { id: 'ent:idn:id-goto' },
  },
  {
    slug: 'my-ytl',
    name: 'YTL AI Labs',
    jurisdiction: 'MYS',
    geo: { lon: 101.6869, lat: 3.1390 },
    sector: 'AI infrastructure',
    sizeBand: 'mid',
    systems: [
      { name: 'Ilmu LLM', kind: 'llm', riskTier: 'gpai', description: 'Malaysian sovereign LLM.' },
    ],
    inScope: scope('MYS'),
    layer0: { id: 'ent:mys:my-ytl' },
  },
  {
    slug: 'vn-vinai',
    name: 'VinAI',
    jurisdiction: 'VNM',
    geo: { lon: 105.8342, lat: 21.0278 },
    sector: 'AI research lab',
    sizeBand: 'mid',
    systems: [
      { name: 'PhoGPT', kind: 'llm', riskTier: 'gpai', description: 'Vietnamese large language model.' },
      { name: 'Driver-monitoring vision', kind: 'vision', riskTier: 'high' },
    ],
    inScope: scope('VNM'),
    layer0: { id: 'ent:vnm:vn-vinai' },
  },

  // ───────────────────────────── Turkey / Egypt / Pakistan ──────────
  {
    slug: 'tr-baykar',
    name: 'Baykar',
    jurisdiction: 'TUR',
    geo: { lon: 28.9784, lat: 41.0082 },
    sector: 'Autonomous aerial systems',
    sizeBand: 'large',
    systems: [
      { name: 'Autonomous UAV flight stack', kind: 'autonomous', riskTier: 'high', description: 'Unmanned-aerial-vehicle autonomy.' },
    ],
    inScope: scope('TUR'),
    layer0: { id: 'ent:tur:tr-baykar' },
  },
  {
    slug: 'eg-synapse',
    name: 'Synapse Analytics',
    jurisdiction: 'EGY',
    geo: { lon: 31.2357, lat: 30.0444 },
    sector: 'AI / fintech analytics',
    sizeBand: 'sme',
    systems: [
      { name: 'Konan credit-decisioning', kind: 'other', riskTier: 'high', description: 'Automated credit scoring.' },
    ],
    inScope: scope('EGY'),
    layer0: { id: 'ent:egy:eg-synapse' },
  },

  // ───────────────────────────── New Zealand / Chile / Peru ──────────
  {
    slug: 'nz-soulmachines',
    name: 'Soul Machines',
    jurisdiction: 'NZL',
    geo: { lon: 174.7633, lat: -36.8485 },
    sector: 'Digital humans / AI',
    sizeBand: 'sme',
    systems: [
      { name: 'Digital People', kind: 'vision', riskTier: 'limited', description: 'Animated AI avatars (transparency-relevant).' },
    ],
    inScope: scope('NZL'),
    layer0: { id: 'ent:nzl:nz-soulmachines' },
  },
  {
    slug: 'cl-notco',
    name: 'NotCo',
    jurisdiction: 'CHL',
    geo: { lon: -70.6483, lat: -33.4489 },
    sector: 'Food-tech AI',
    sizeBand: 'sme',
    systems: [
      { name: 'Giuseppe', kind: 'other', description: 'AI for food formulation.' },
    ],
    inScope: scope('CHL'),
    layer0: { id: 'ent:chl:cl-notco' },
  },
];

/** All entities whose primary jurisdiction is `iso3`. */
export function entitiesForCountry(iso3: string): Entity[] {
  return ENTITIES.filter((e) => e.jurisdiction === iso3);
}

/** All entities plausibly in scope of a given framework slug. */
export function entitiesInScopeOf(frameworkSlug: string): Entity[] {
  return ENTITIES.filter((e) => (e.inScope ?? []).includes(frameworkSlug));
}

// retained so the AISystem kind helper isn't tree-shaken away from the public surface.
export { T as systemKind };
