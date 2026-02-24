import Link from "next/link";
import { Lock, Target, Zap, Shield, Trophy, ArrowRight } from "lucide-react";

const levels = [
  {
    number: 1,
    persona: "The Skeptic",
    personaDetail: "Reddit Skeptic",
    task: "Write a 3-sentence problem statement",
    locked: false,
  },
  {
    number: 2,
    persona: "The Devil's Advocate",
    personaDetail: "Devil's Advocate",
    task: "Write your value proposition",
    locked: false,
  },
  {
    number: 3,
    persona: "The Cold Visitor",
    personaDetail: "Cold Traffic",
    task: "Write your hero section",
    locked: true,
  },
  {
    number: 4,
    persona: "The Investor",
    personaDetail: "Angel Investor",
    task: "Describe your pricing model",
    locked: true,
  },
  {
    number: 5,
    persona: "The Crisis",
    personaDetail: "Crisis Scenario",
    task: "Write a crisis response",
    locked: true,
  },
];

const leaderboard = [
  { idea: "AI meal planner for athletes", levels: 5, attempts: 12, date: "Feb 2026" },
  { idea: "B2B expense tracking for freelancers", levels: 5, attempts: 8, date: "Feb 2026" },
  { idea: "Async standup tool for remote teams", levels: 4, attempts: 15, date: "Feb 2026" },
  { idea: "Micro-SaaS for Notion power users", levels: 3, attempts: 6, date: "Feb 2026" },
  { idea: "Creator invoice automation", levels: 5, attempts: 21, date: "Feb 2026" },
];

const steps = [
  {
    icon: <Target className="w-6 h-6 text-blue-400" />,
    title: "Describe Your Idea",
    description: "Enter your startup idea name and a one-line description.",
  },
  {
    icon: <Zap className="w-6 h-6 text-blue-400" />,
    title: "Face 5 AI Judges",
    description: "Each judge has a different perspective and will challenge your idea ruthlessly.",
  },
  {
    icon: <Shield className="w-6 h-6 text-blue-400" />,
    title: "Survive the Gauntlet",
    description: "Pass all 5 levels to earn your validation report. Most ideas don't make it.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-block mb-6 px-3 py-1 text-xs font-mono text-blue-400 border border-blue-400/30 rounded-full bg-blue-400/5">
          STARTUP VALIDATION — NO MERCY
        </div>
        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter mb-4 leading-none">
          Your idea won&apos;t survive.
        </h1>
        <h2 className="text-5xl sm:text-7xl font-black tracking-tighter text-blue-500 mb-8 leading-none">
          Prove me wrong.
        </h2>
        <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
          5 AI judges. No mercy. No hand-holding. Just you, your idea, and the gauntlet.
        </p>
        <Link
          href="/play"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-lg text-lg transition-colors"
        >
          Start the Gauntlet <ArrowRight className="w-5 h-5" />
        </Link>
        <p className="mt-4 text-sm text-white/30">First 2 levels free. Unlock all 5 for $9.</p>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/10">
        <h3 className="text-2xl font-bold mb-10 text-center">How It Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-start gap-3 p-6 rounded-xl border border-white/10 bg-white/5">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                {step.icon}
              </div>
              <div>
                <div className="text-xs text-blue-400 font-mono mb-1">STEP {i + 1}</div>
                <h4 className="font-bold mb-1">{step.title}</h4>
                <p className="text-sm text-white/50">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Level Preview */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/10">
        <h3 className="text-2xl font-bold mb-2 text-center">The 5 Levels</h3>
        <p className="text-white/40 text-center text-sm mb-10">Each judge is harder than the last.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((level) => (
            <div
              key={level.number}
              className={`relative p-5 rounded-xl border ${
                level.locked
                  ? "border-white/5 bg-white/[0.02] opacity-60"
                  : "border-blue-500/20 bg-blue-500/5"
              }`}
            >
              {level.locked && (
                <div className="absolute top-4 right-4">
                  <Lock className="w-4 h-4 text-white/30" />
                </div>
              )}
              <div className="text-xs font-mono text-blue-400/80 mb-2">LEVEL {level.number}</div>
              <div className="font-bold mb-1">{level.persona}</div>
              <div className="text-xs text-white/40 mb-3">{level.personaDetail}</div>
              <p className="text-sm text-white/60">{level.task}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Leaderboard */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/10">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h3 className="text-2xl font-bold">Survivors</h3>
        </div>
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-4 py-3 text-white/40 font-medium">#</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium">Idea</th>
                <th className="text-center px-4 py-3 text-white/40 font-medium">Levels</th>
                <th className="text-center px-4 py-3 text-white/40 font-medium">Attempts</th>
                <th className="text-right px-4 py-3 text-white/40 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3 text-white/30 font-mono">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{entry.idea}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono ${
                      entry.levels === 5 ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {entry.levels}/5
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-white/50 font-mono">{entry.attempts}</td>
                  <td className="px-4 py-3 text-right text-white/30">{entry.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center border-t border-white/10">
        <h3 className="text-3xl font-black mb-4">Ready to face the gauntlet?</h3>
        <p className="text-white/50 mb-8">Most ideas don&apos;t survive. Yours might be different.</p>
        <Link
          href="/play"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-lg text-lg transition-colors"
        >
          Start the Gauntlet <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-6 text-center">
        <p className="text-sm text-white/30">
          Built by{" "}
          <a
            href="https://aistudios.pro"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Vanwida
          </a>
        </p>
      </footer>
    </main>
  );
}
