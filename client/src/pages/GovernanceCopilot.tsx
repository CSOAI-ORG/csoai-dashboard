/**
 * AI Governance Copilot — "Ask the Council"
 * Frontend chat interface with graceful degradation when no backend endpoint is active.
 * Matches the dark + emerald Dome aesthetic.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Sparkles,
  Shield,
  Scale,
  FileText,
  Zap,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import DashboardLayout from '@/components/DashboardLayout';

// ---------------------------------------------------------------------------
// Static knowledge base — covers common governance questions until a live
// backend endpoint is wired up.
// ---------------------------------------------------------------------------
const STATIC_RESPONSES: Array<{ keywords: string[]; answer: string; links?: Array<{ label: string; href: string }> }> = [
  {
    keywords: ['eu ai act', 'eu act', 'article 50', 'high risk', 'annex iii'],
    answer: `The EU AI Act entered application in August 2026. High-risk AI systems (Annex III) now require mandatory conformity assessments, registration in the EU AI database, and ongoing post-market monitoring. Article 50 obligations on transparency for general-purpose AI models applied from 2 August 2026.\n\nKey requirements for high-risk systems:\n• Risk management system (Art. 9)\n• Data governance documentation (Art. 10)\n• Technical documentation (Art. 11)\n• Human oversight measures (Art. 14)\n• Accuracy, robustness and cybersecurity (Art. 15)\n\nThe Council recommends completing your conformity route before your next product release cycle.`,
    links: [
      { label: 'EU AI Act Compliance Guide', href: '/compliance/eu-ai-act' },
      { label: 'Risk Classifier', href: '/eu-ai-act-classifier' },
    ],
  },
  {
    keywords: ['nist', 'rmf', 'ai rmf', 'govern', 'map', 'measure', 'manage'],
    answer: `The NIST AI Risk Management Framework (AI RMF 1.0) provides a voluntary, flexible structure for managing AI risks across four core functions:\n\n• **GOVERN** — Establish policies, roles, and accountability structures\n• **MAP** — Categorise AI risks in context\n• **MEASURE** — Analyse and assess risk\n• **MANAGE** — Prioritise, respond to, and monitor risks\n\nCSoAI's compliance module maps your AI systems to all four functions and generates a prioritised remediation roadmap.`,
    links: [
      { label: 'NIST AI RMF Guide', href: '/compliance/nist-ai-rmf' },
      { label: 'Dashboard Roadmap', href: '/dashboard/roadmap' },
    ],
  },
  {
    keywords: ['mcp', 'model context protocol', 'tools', 'servers'],
    answer: `The Council operates 271 compliance MCP (Model Context Protocol) servers — each wrapping a specific governance check, regulatory look-up, or audit task. They are available to any MCP-compatible AI agent, letting you embed compliance workflows directly into your AI development pipeline.\n\nCategories include: EU AI Act checks, NIST AI RMF mapping, bias detection scaffolds, incident-report templates, and conformity-assessment helpers.`,
    links: [
      { label: 'Browse MCP Registry', href: '/mcp' },
    ],
  },
  {
    keywords: ['price', 'pricing', 'cost', 'plan', 'starter', 'professional', 'enterprise'],
    answer: `CSOAI pricing is structured to reflect where compliance cost actually falls:\n\n• **Free** — Public tools (classifier, regulation map, MCP registry) are free for individuals, startups, and government bodies.\n• **Starter — £499/mo** — Compliance monitoring, scorecard, and alert management for one legal entity.\n• **Professional — £999/mo** — Multi-system monitoring, API access, and annual audit export.\n• **Enterprise — £1,999/mo** — Fleet-scale MCP integration, SLA, and dedicated governance review.\n\nLarge AI companies building products that affect millions of people pay; the tools that help almost everyone else stay free.`,
    links: [
      { label: 'See Pricing', href: '/pricing' },
    ],
  },
  {
    keywords: ['risk', 'classify', 'classification', 'unacceptable', 'prohibited', 'limited'],
    answer: `EU AI Act risk classification works on four tiers:\n\n1. **Unacceptable risk** — Prohibited outright (social scoring, real-time biometric surveillance in public)\n2. **High risk** — Annex III list (hiring, credit, education, critical infrastructure, law enforcement) — full conformity assessment required\n3. **Limited risk** — Transparency obligations only (chatbots must identify as AI; deepfakes must be labelled)\n4. **Minimal risk** — No specific obligations, though the Code of Practice recommends voluntary measures\n\nUse the free Risk Classifier to categorise your system in under 5 minutes.`,
    links: [
      { label: 'Free Risk Classifier', href: '/eu-ai-act-classifier' },
      { label: 'Onboarding Wizard', href: '/enterprise-onboarding' },
    ],
  },
  {
    keywords: ['deadline', 'timeline', 'when', 'date', '2026', '2027'],
    answer: `Key EU AI Act milestones:\n\n• **2 Feb 2025** — Prohibited AI practices banned\n• **2 Aug 2025** — GPAI obligations + governance rules apply\n• **2 Aug 2026** — High-risk AI systems (Annex III) fully in scope ← **current**\n• **2 Aug 2027** — Embedded high-risk systems grandfathered in must comply\n\nUse Deadline Radar to track all worldwide AI-law deadlines, not just the EU.`,
    links: [
      { label: 'Deadline Radar', href: '/radar' },
      { label: 'Regulation Feed', href: '/feed' },
    ],
  },
  {
    keywords: ['agent council', 'council', '33', 'guardian', 'arbiter', 'scribe', 'vote', 'consensus'],
    answer: `The CSOAI Agent Council is a 33-agent multi-provider ensemble that evaluates AI governance decisions through a three-leg voting system:\n\n• **Guardian Agents (11)** — Safety, security, and privacy review\n• **Arbiter Agents (11)** — Fairness, transparency, and accountability\n• **Scribe Agents (11)** — Documentation, compliance, and audit trail\n\nA decision requires super-majority consensus across all three legs. No single AI provider controls the outcome — the council spans OpenAI, Anthropic, Google, Kimi, and DeepSeek.\n\nByzantine fault tolerance means up to 10 agents can be compromised without affecting the verdict.`,
    links: [
      { label: 'View the Council', href: '/agent-council' },
      { label: 'Byzantine Consensus', href: '/byzantine-consensus' },
    ],
  },
];

const STARTER_PROMPTS = [
  { icon: Scale, label: 'Am I high risk under the EU AI Act?', color: 'text-emerald-500' },
  { icon: Shield, label: 'What does the Council check for?', color: 'text-purple-500' },
  { icon: FileText, label: 'How do I start a conformity assessment?', color: 'text-blue-500' },
  { icon: Zap, label: 'What MCP tools are available?', color: 'text-amber-500' },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type MessageRole = 'user' | 'assistant' | 'connecting';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  links?: Array<{ label: string; href: string }>;
  timestamp: Date;
}

// ---------------------------------------------------------------------------
// Response lookup
// ---------------------------------------------------------------------------
function resolveResponse(query: string): { content: string; links?: Array<{ label: string; href: string }> } {
  const q = query.toLowerCase();
  for (const entry of STATIC_RESPONSES) {
    if (entry.keywords.some((kw) => q.includes(kw))) {
      return { content: entry.answer, links: entry.links };
    }
  }
  return {
    content: `The Council received your question. Our AI Governance Copilot backend is being provisioned — live multi-agent responses will be available shortly.\n\nIn the meantime, you can:\n• Browse the regulation map covering 177 countries\n• Run a free EU AI Act risk classification in under 5 minutes\n• Review the 271 compliance MCP tools\n\nFor urgent governance questions, our team is reachable via support.`,
    links: [
      { label: 'Regulation Map', href: '/opengridworks' },
      { label: 'Risk Classifier', href: '/eu-ai-act-classifier' },
      { label: 'MCP Registry', href: '/mcp' },
      { label: 'Support', href: '/support' },
    ],
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function GovernanceCopilot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isConnecting) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    const connectingMsg: Message = {
      id: crypto.randomUUID(),
      role: 'connecting',
      content: '',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, connectingMsg]);
    setInput('');
    setIsConnecting(true);

    // Simulate Council deliberation latency
    await new Promise((r) => setTimeout(r, 1600));

    const { content, links } = resolveResponse(trimmed);
    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content,
      links,
      timestamp: new Date(),
    };

    setMessages((prev) => prev.filter((m) => m.role !== 'connecting').concat(assistantMsg));
    setIsConnecting(false);
  };

  const handleSubmit = () => sendMessage(input);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleReset = () => {
    setMessages([]);
    setInput('');
    textareaRef.current?.focus();
  };

  const hasMessages = messages.length > 0;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full max-w-4xl mx-auto px-4 pb-6">
        {/* ------------------------------------------------------------------ */}
        {/* Header                                                              */}
        {/* ------------------------------------------------------------------ */}
        <div className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Sparkles className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  AI Governance Copilot
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Ask the Council — Council for the Safety of AI
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-amber-600 border-amber-500/40 bg-amber-500/10 text-xs"
              >
                <span className="relative flex h-1.5 w-1.5 mr-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                </span>
                Backend provisioning
              </Badge>

              {hasMessages && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  aria-label="Clear conversation"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Status notice */}
          <div className="mt-4 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
            <span>
              The 33-agent Council backend is being provisioned. Until the live endpoint is active,
              responses are drawn from CSOAI's static governance knowledge base.
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Chat area                                                           */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-6" aria-live="polite" aria-label="Conversation">
          {!hasMessages && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="pt-4"
            >
              {/* Welcome */}
              <div className="text-center mb-8">
                <div className="inline-flex p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                  <MessageSquare className="h-8 w-8 text-emerald-500" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  What can the Council help you with?
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                  Ask any question about AI governance, EU AI Act compliance, risk classification,
                  or CSOAI's tools and frameworks.
                </p>
              </div>

              {/* Starter prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.label}
                    onClick={() => sendMessage(prompt.label)}
                    className="flex items-center gap-3 text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group"
                    aria-label={`Ask: ${prompt.label}`}
                  >
                    <prompt.icon className={`h-4 w-4 shrink-0 ${prompt.color}`} />
                    <span className="text-sm text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {prompt.label}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 ml-auto shrink-0 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {msg.role === 'user' && (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-emerald-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                )}

                {msg.role === 'connecting' && (
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3">
                      <span className="text-xs text-slate-500 mr-1">Council deliberating</span>
                      {[0, 0.2, 0.4].map((delay) => (
                        <motion.span
                          key={delay}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 1, delay }}
                          className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {msg.role === 'assistant' && (
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mt-0.5 shrink-0">
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                    </div>
                    <Card className="flex-1 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60">
                      <CardContent className="p-4">
                        <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </div>
                        {msg.links && msg.links.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-2">
                            {msg.links.map((link) => (
                              <a
                                key={link.href}
                                href={link.href}
                                className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors"
                                aria-label={link.label}
                              >
                                {link.label}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Input bar                                                           */}
        {/* ------------------------------------------------------------------ */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
          <div className="flex items-end gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 focus-within:border-emerald-500/50 transition-colors">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the Council a governance question…"
              className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 min-h-[40px] max-h-32"
              rows={1}
              aria-label="Your governance question"
              disabled={isConnecting}
            />
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isConnecting}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-3 py-2 shrink-0 self-end"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2">
            Press Enter to send · Shift+Enter for new line · Council for the Safety of AI
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
