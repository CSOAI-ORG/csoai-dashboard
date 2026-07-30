import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Network, Eye, RefreshCw, FileCheck, GraduationCap,
  Boxes, Radio, Globe, X, ArrowUpRight,
} from 'lucide-react';

/**
 * /system — the CSOAI "Dome": one interactive map showing every component of the
 * platform integrated into a single system, instead of the separate product cards
 * elsewhere on the site. Click any node for what it is + a live link.
 */

type Node = {
  id: string;
  label: string;
  tag: string;
  blurb: string;
  detail: string;
  href: string;
  external?: boolean;
  Icon: typeof ShieldCheck;
};

type Layer = { id: string; title: string; subtitle: string; nodes: Node[] };

const LAYERS: Layer[] = [
  {
    id: 'core',
    title: 'The Dome — CSOAI Core',
    subtitle: 'The 33-Agent Byzantine Council at the centre of everything',
    nodes: [
      {
        id: 'council', label: '33-Agent Byzantine Council', tag: 'consensus core',
        blurb: 'Impartial multi-agent consensus on every AI-safety decision.',
        detail: 'A Byzantine fault-tolerant council of 33 agents + human experts. No single entity controls an outcome — every Watchdog case and compliance verdict is decided by consensus, which is what makes CSOAI rulings defensible.',
        href: '/dashboard', Icon: Network,
      },
    ],
  },
  {
    id: 'governance',
    title: 'Governance Loop',
    subtitle: 'The continuous safety machinery wrapped around the council',
    nodes: [
      {
        id: 'watchdog', label: 'Watchdog', tag: 'incident reporting',
        blurb: 'Transparent, public AI-incident database.',
        detail: 'Anyone can report an AI failure (anonymously). Reports flow into the Council for review and into the SOAI-PDCA improvement cycle — the evidence layer of the whole system.',
        href: '/watchdog', Icon: Eye,
      },
      {
        id: 'pdca', label: 'SOAI-PDCA', tag: 'continuous improvement',
        blurb: 'Plan-Do-Check-Act, adapted for AI governance.',
        detail: 'The Deming cycle for AI safety: identify risks → implement controls → measure → adjust. Ongoing and public, so safety provably improves over time rather than being a one-off audit.',
        href: '/soai-pdca', Icon: RefreshCw,
      },
      {
        id: 'compliance', label: 'Compliance', tag: 'EU AI Act / NIST / ISO 42001',
        blurb: 'Multi-framework compliance tracking.',
        detail: 'Track conformity across the EU AI Act, NIST AI RMF, ISO/IEC 42001 and TC260 simultaneously, with the Council and PDCA loop feeding evidence into each framework.',
        href: '/compliance', Icon: FileCheck,
      },
      {
        id: 'ceasai', label: 'CEASAI Certification', tag: 'people layer',
        blurb: 'Trains & certifies the human AI-Safety Analysts.',
        detail: 'The professional certification built on CSOAI — it staffs the Watchdog and Council with qualified human analysts. The system needs people, and this is where they come from.',
        href: '/certification', Icon: GraduationCap,
      },
    ],
  },
  {
    id: 'protocol',
    title: 'Protocol & Tooling — Layer 0',
    subtitle: 'How agents and machines plug into the system',
    nodes: [
      {
        id: 'mcp', label: '293 MCP Tools', tag: 'callable surface',
        blurb: 'The compliance/governance capabilities as MCP servers.',
        detail: '293 published Model Context Protocol servers expose CSOAI’s tools to any AI agent, IDE or workflow (Claude, Cursor, Kimi, A2A clients). This is how the platform’s intelligence is consumed programmatically.',
        href: '/mcp', Icon: Boxes,
      },
      {
        id: 'layer0', label: 'Layer 0 — A2A / agent.json', tag: 'machine discovery',
        blurb: 'Every surface is machine-discoverable.',
        detail: 'agent.json + /.well-known/mcp.json + llms.txt on every site let AI agents discover and call the system directly — the "Layer 0" protocol fabric that makes the whole estate one addressable network.',
        href: '/.well-known/mcp.json', external: true, Icon: Radio,
      },
    ],
  },
  {
    id: 'edge',
    title: 'The Vertical Estate',
    subtitle: 'Where the system meets real industries',
    nodes: [
      {
        id: 'verticals', label: 'Vertical Sites', tag: 'industry edge',
        blurb: 'Sector front-doors running on the same core.',
        detail: 'Each vertical (fishkeeper.ai, grabhire.ai, optimobile.ai, cobolbridge.ai, and more) is a front-door into the same Council + MCP + Layer-0 core — proving the platform is one integrated system, not separate products.',
        href: 'https://csoai.org', external: true, Icon: Globe,
      },
    ],
  },
];

const SYSTEM_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'CSOAI System Map — the integrated AI-safety platform',
  description:
    'Interactive map of the CSOAI platform: the 33-Agent Byzantine Council, Watchdog, SOAI-PDCA, Compliance, CEASAI, 293 MCP tools, Layer-0 protocol, and the vertical estate — all integrated into one system.',
  url: 'https://csoai.org/system',
  isPartOf: { '@type': 'Organization', name: 'Council for the Safety of AI', url: 'https://csoai.org' },
};

export default function SystemMap() {
  const [selected, setSelected] = useState<Node | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070b14] to-[#0c1322] text-slate-100">
      <Helmet>
        <title>System Map — CSOAI | One integrated AI-safety platform</title>
        <meta name="description" content="The CSOAI Dome: 33-Agent Council, Watchdog, SOAI-PDCA, Compliance, CEASAI, 293 MCP tools and Layer-0 protocol — every component integrated into one system." />
        <link rel="canonical" href="https://csoai.org/system" />
        <meta property="og:title" content="CSOAI System Map — the integrated AI-safety platform" />
        <meta property="og:image" content="https://csoai.org/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(SYSTEM_SCHEMA)}</script>
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4">
            <ShieldCheck className="w-4 h-4" /> One integrated system
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            The CSOAI <span className="text-emerald-400">Dome</span>
          </h1>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Not four separate products — one integrated AI-safety platform. The 33-Agent Council at the
            centre, the governance loop around it, the protocol layer that makes it callable, and the
            verticals at the edge. Click any node to see how it connects.
          </p>
        </motion.div>

        <div className="relative space-y-5">
          {LAYERS.map((layer, li) => (
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.45, delay: li * 0.08 }}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur p-5 sm:p-6"
            >
              <div className="mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400">{layer.title}</h2>
                <p className="text-xs text-slate-500">{layer.subtitle}</p>
              </div>
              <div className={`grid gap-3 ${layer.nodes.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
                {layer.nodes.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setSelected(n)}
                    data-testid={`system-node-${n.id}`}
                    className="group text-left rounded-xl border border-slate-700 bg-slate-800/40 hover:border-emerald-500/60 hover:bg-slate-800/80 transition-all p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 group-hover:scale-105 transition">
                        <n.Icon className="w-5 h-5" />
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-slate-500">{n.tag}</span>
                    </div>
                    <div className="font-semibold text-slate-100">{n.label}</div>
                    <div className="text-xs text-slate-400 mt-1">{n.blurb}</div>
                  </button>
                ))}
              </div>
              {li < LAYERS.length - 1 && (
                <div className="flex justify-center mt-1" aria-hidden>
                  <div className="h-5 w-px bg-gradient-to-b from-emerald-500/60 to-transparent" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4" onClick={() => setSelected(null)}>
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg rounded-2xl border border-emerald-500/30 bg-slate-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400">
                  <selected.Icon className="w-6 h-6" />
                </span>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">{selected.tag}</div>
                  <h3 className="text-xl font-bold">{selected.label}</h3>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-200" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-4 text-slate-300 leading-relaxed">{selected.detail}</p>
            <a
              href={selected.href}
              target={selected.external ? '_blank' : undefined}
              rel={selected.external ? 'noopener noreferrer' : undefined}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
            >
              Open {selected.label} <ArrowUpRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      )}
    </div>
  );
}
