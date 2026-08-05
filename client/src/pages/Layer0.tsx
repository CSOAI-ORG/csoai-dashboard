/**
 * Layer 0 — CSOAI Trust Infrastructure for the Agentic Economy
 * Consolidated from the csoai.org "Layer 0" protocol site into the AI Governance OS.
 * The 8 trust layers (L0-A … L0-H) + protocol landscape + PDCA runtime engine.
 */

import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Fingerprint,
  ShieldCheck,
  Cpu,
  Globe2,
  CreditCard,
  Lock,
  Users,
  Server,
  ArrowRight,
  Layers,
  Activity,
  CheckCircle2,
} from "lucide-react";

type LayerDef = {
  id: string;
  name: string;
  icon: any;
  spec: string;
  desc: string;
  href?: string;
};

const LAYERS: LayerDef[] = [
  {
    id: "L0-A",
    name: "Identity",
    icon: Fingerprint,
    spec: "W3C DID v1.1 · IETF AIP · did:csoai",
    desc: "Persistent decentralized identity for every agent — did:csoai integrated with MCP, A2A, OAuth/OIDC and SPIFFE. An agent needs an identity before it can be trusted.",
    href: "/certification",
  },
  {
    id: "L0-B",
    name: "Certification",
    icon: ShieldCheck,
    spec: "CSOAI Watchdog Certificates · designed 33-agent council",
    desc: "Ed25519-signed Watchdog Certificates mapping a system to 30+ frameworks, with a public verify URL anyone can check independently.",
    href: "/certification",
  },
  {
    id: "L0-C",
    name: "Policy Engine",
    icon: Cpu,
    spec: "PDCA · OPA/Rego · Microsoft AGT",
    desc: "Sub-millisecond runtime enforcement mapping OWASP Agentic Top 10, the EU AI Act and TC260 to executable Rego policy.",
    href: "/pdca-cycles",
  },
  {
    id: "L0-D",
    name: "Cross-Regional Handoff",
    icon: Globe2,
    spec: "A2A · IETF AIP · Agent Identity Registry",
    desc: "Strict jurisdictional boundary compliance for agents operating across the EU, US, UK, CN, SG and KR — visualised live in OpenGridWorks.",
    href: "/opengridworks",
  },
  {
    id: "L0-E",
    name: "Agentic Finance",
    icon: CreditCard,
    spec: "x402 · ACP · AP2 · MPP",
    desc: "Compliance pre-check BEFORE a payment executes. The settlement layer verifies certification first — the unique CSOAI value across x402, Stripe ACP and Google AP2.",
  },
  {
    id: "L0-F",
    name: "Audit",
    icon: Lock,
    spec: "Blockchain anchoring · IPFS · asqav (ML-DSA-65)",
    desc: "Tamper-evident, quantum-safe audit trails. Every decision is hashed, signed and anchored for independent verification.",
  },
  {
    id: "L0-G",
    name: "Human-in-the-Loop",
    icon: Users,
    spec: "Designed 33-agent council · PDCA escalation",
    desc: "High-risk actions escalate to the designed 33-agent council with approval envelopes — impartial, vendor-independent human oversight.",
    href: "/agent-council",
  },
  {
    id: "L0-H",
    name: "Legacy Bridge",
    icon: Server,
    spec: "COBOL / Mainframe → AI · cobolbridge.ai",
    desc: "Securely tunnel COBOL and mainframe systems to modern AI agents — the missing link for enterprise modernization.",
  },
];

const PROTOCOLS = [
  { name: "MCP", layer: "L1 Tool", note: "Anthropic · 10K+ servers" },
  { name: "A2A", layer: "L2 Coord", note: "Google · 150+ orgs" },
  { name: "AP2", layer: "L3 Authz", note: "Google · Mastercard" },
  { name: "ACP", layer: "L4 Checkout", note: "Stripe · OpenAI · PayPal" },
  { name: "x402", layer: "L3 Settle", note: "Coinbase · 140M+ txns" },
  { name: "MPP", layer: "L3 Streaming", note: "Stripe + Tempo" },
  { name: "W3C DID v1.1", layer: "L0 Identity", note: "W3C · Microsoft" },
  { name: "IETF AIP", layer: "L0 Identity", note: "IETF Internet-Draft" },
];

const PDCA = [
  { k: "Plan", d: "Map 30+ frameworks to executable Rego policies." },
  { k: "Do", d: "Sub-millisecond enforcement via Microsoft AGT & OPA." },
  { k: "Check", d: "Continuous monitoring + real-time trust scoring." },
  { k: "Act", d: "Auto-remediate (low risk) or escalate to the designed 33-agent council (high risk)." },
];

export default function Layer0() {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Layer 0 — CSOAI Trust Infrastructure for the Agentic Economy</title>
        <meta
          name="description"
          content="CSOAI is Layer 0: persistent identity, certification, runtime policy enforcement, cross-regional handoff, agentic-finance pre-checks, audit, human-in-the-loop and legacy bridges — one integrated trust stack for AI agents."
        />
        <link rel="canonical" href="https://csoai.org/layer0" />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            <Layers className="w-4 h-4 mr-2" /> The 8 Trust Layers
          </Badge>
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            CSOAI is <span className="underline decoration-white/40">Layer 0</span>
          </h1>
          <p className="text-xl text-emerald-50 max-w-3xl mb-8">
            Google built coordination. Stripe built checkout. Anthropic built tools.
            <strong> CSOAI built the foundation</strong> — persistent identity and runtime
            policy enforcement for the agentic economy.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/opengridworks">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold">
                Explore OpenGridWorks <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/certification">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                Get Watchdog Certified
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-8 mt-10 text-sm text-emerald-50">
            <div><span className="text-2xl font-bold text-white">290+</span><br/>MCP servers</div>
            <div><span className="text-2xl font-bold text-white">30+</span><br/>Frameworks mapped</div>
            <div><span className="text-2xl font-bold text-white">6</span><br/>Jurisdictions</div>
            <div><span className="text-2xl font-bold text-white">&lt;0.1ms</span><br/>Policy latency</div>
          </div>
        </div>
      </section>

      {/* The critical gap */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <Card className="p-8 border-emerald-200 bg-emerald-50/50">
          <h2 className="text-2xl font-bold mb-3 text-gray-900">The critical gap</h2>
          <p className="text-gray-700 leading-relaxed">
            Every protocol in the agentic stack addresses a <em>piece</em> of Layer 0 — but none
            combine persistent identity, compliance certification, runtime policy, cross-regional
            handoff, human-in-the-loop escalation, blockchain audit, micropayment pre-checks and
            legacy bridges. <strong>CSOAI is the only entity that has all of them in one integrated stack.</strong>
          </p>
        </Card>
      </section>

      {/* The 8 layers */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-3xl font-bold mb-2 text-gray-900">The Layer 0 stack</h2>
        <p className="text-gray-600 mb-8">Eight integrated trust layers — L0-A through L0-H.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {LAYERS.map((l) => {
            const inner = (
              <Card className="p-6 h-full hover:shadow-xl transition-shadow border-gray-200 hover:border-emerald-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <l.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <Badge variant="outline" className="text-emerald-700 border-emerald-200">{l.id}</Badge>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{l.name}</h3>
                <div className="text-xs font-medium text-emerald-600 mb-2">{l.spec}</div>
                <p className="text-sm text-gray-600 leading-relaxed">{l.desc}</p>
                {l.href && (
                  <div className="mt-3 text-sm font-medium text-emerald-700 flex items-center gap-1">
                    Open <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </Card>
            );
            return l.href ? (
              <Link key={l.id} href={l.href}>{inner}</Link>
            ) : (
              <div key={l.id}>{inner}</div>
            );
          })}
        </div>
      </section>

      {/* PDCA engine */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-6 h-6 text-emerald-600" />
            <h2 className="text-3xl font-bold text-gray-900">The PDCA runtime engine</h2>
          </div>
          <p className="text-gray-600 mb-8">The instrument regulators enforce with — continuous Plan / Do / Check / Act over every agent action.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {PDCA.map((p) => (
              <Card key={p.k} className="p-6">
                <div className="text-emerald-600 font-bold text-lg mb-2">{p.k}</div>
                <p className="text-sm text-gray-600">{p.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Protocol landscape */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-2 text-gray-900">Protocol landscape</h2>
        <p className="text-gray-600 mb-8">CSOAI tunnels the external L1–L4 protocols into the Layer 0 trust foundation.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PROTOCOLS.map((p) => (
            <Card key={p.name} className="p-5">
              <div className="font-bold text-gray-900">{p.name}</div>
              <Badge variant="outline" className="my-1 text-xs text-emerald-700 border-emerald-200">{p.layer}</Badge>
              <div className="text-xs text-gray-500">{p.note}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Build on the foundation</h2>
          <p className="text-emerald-50 mb-8 max-w-2xl mx-auto">
            Certify your AI system against every framework that applies to it, enforce policy at
            runtime, and prove it with a signed Watchdog Certificate anyone can verify.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/crosswalks">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Framework Crosswalks
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                Pricing & Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
