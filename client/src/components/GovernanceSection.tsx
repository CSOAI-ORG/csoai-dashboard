import { Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { GovernanceEcosystemVisualization } from "@/components/GovernanceEcosystemVisualization";

export function GovernanceSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-800" id="governance">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Public Open Sourced AI Safety
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            AI Safety Governance Ecosystem
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            A comprehensive, integrated governance framework showing how CSOAI, human councils, legislations, 
            the PDCA cycle, specialized analysts, and all major pipelines work together in perfect synergy to 
            create transparent, accountable AI safety infrastructure.
          </p>
        </div>

        {/* Visualization */}
        <div className="h-[600px] rounded-xl overflow-hidden border border-slate-700 shadow-2xl mb-12">
          <GovernanceEcosystemVisualization />
        </div>

        {/* Explanation Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                Integrated Governance Layers
              </h3>
              <ul className="space-y-3 text-slate-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold mt-0.5">•</span>
                  <span><strong className="text-white">Center:</strong> CSOAI AI Byzantine Council - 33 agents with Byzantine fault-tolerant voting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold mt-0.5">•</span>
                  <span><strong className="text-white">Ring 1:</strong> Human Councils (EU, US, Asia-Pacific) with distinct legislations (EU AI Act, NIST AI RMF, TC260, UK AI Bill, Canada AI Act, Australia AI Governance)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold mt-0.5">•</span>
                  <span><strong className="text-white">Ring 2:</strong> PDCA Cycle (Plan, Do, Check, Act) + Public Watchdog, Incident Reporting, Transparency, and Accountability mechanisms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 font-bold mt-0.5">•</span>
                  <span><strong className="text-white">Ring 3:</strong> Specialized AI Analysts trained in specific legislations (EUAI-trained, NIST-trained, TC260-trained, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold mt-0.5">•</span>
                  <span><strong className="text-white">Ring 4:</strong> CSOAI Pipelines (Byzantine Council, Training, Dashboard, Compliance, Analysis, Open Source)</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                Synergy and Communication
              </h3>
              <ul className="space-y-3 text-slate-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold mt-0.5">✓</span>
                  <span><strong className="text-white">All Layers Connected:</strong> Every element communicates with every other element through visual flows</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold mt-0.5">✓</span>
                  <span><strong className="text-white">Real-Time Interaction:</strong> Animated visual flows show continuous communication between councils, legislations, and analysts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold mt-0.5">✓</span>
                  <span><strong className="text-white">Specialized Expertise:</strong> Analysts are color-coded by their legislative specialization for clear identification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold mt-0.5">✓</span>
                  <span><strong className="text-white">Transparent Governance:</strong> All voting, decisions, and incident reports are visible and traceable</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold mt-0.5">✓</span>
                  <span><strong className="text-white">Continuous Improvement:</strong> PDCA cycle ensures ongoing refinement of safety measures</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
