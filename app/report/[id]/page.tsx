"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Copy, Check, ArrowLeft } from "lucide-react";

interface LevelResult {
  verdict: "PASS" | "FAIL";
  reasons: string[];
  hint: string;
}

interface LevelState {
  passed: boolean;
  attempts: number;
  lastInput: string;
  lastResult?: LevelResult;
}

interface GameState {
  ideaName: string;
  ideaDescription: string;
  paid: boolean;
  levels: {
    [key: number]: LevelState;
  };
}

const LEVEL_LABELS: Record<number, { persona: string; task: string }> = {
  1: { persona: "The Skeptic", task: "Problem Statement" },
  2: { persona: "The Devil's Advocate", task: "Value Proposition" },
  3: { persona: "The Cold Visitor", task: "Hero Section" },
  4: { persona: "The Investor", task: "Pricing Model" },
  5: { persona: "The Crisis", task: "Crisis Response" },
};

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    // Try report-specific key first, then fall back to main state
    const stored =
      localStorage.getItem(`gauntlet_report_${id}`) ||
      localStorage.getItem("gauntlet_state");
    if (stored) {
      try {
        setGameState(JSON.parse(stored) as GameState);
      } catch {
        // ignore
      }
    }
  }, [id]);

  const handleCopy = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  if (!hydrated) return null;

  if (!gameState) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 mb-4">Report not found.</p>
          <Link href="/play" className="text-blue-400 hover:text-blue-300 transition-colors">
            Start a new game
          </Link>
        </div>
      </main>
    );
  }

  const passedLevels = Object.entries(gameState.levels)
    .filter(([, state]) => state.passed)
    .map(([num]) => parseInt(num))
    .sort((a, b) => a - b);

  const totalAttempts = Object.values(gameState.levels).reduce(
    (sum, l) => sum + l.attempts,
    0
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Back */}
        <Link
          href="/play"
          className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to game
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="text-xs font-mono text-green-400 mb-2">VALIDATION REPORT</div>
          <h1 className="text-3xl font-black mb-2">{gameState.ideaName}</h1>
          <p className="text-white/50">{gameState.ideaDescription}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-center">
            <div className="text-2xl font-black text-green-400">{passedLevels.length}/5</div>
            <div className="text-xs text-white/40 mt-1">Levels Passed</div>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-center">
            <div className="text-2xl font-black">{totalAttempts}</div>
            <div className="text-xs text-white/40 mt-1">Total Attempts</div>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-center">
            <div className="text-2xl font-black text-blue-400">
              {passedLevels.length === 5 ? "✓" : `${Math.round((passedLevels.length / 5) * 100)}%`}
            </div>
            <div className="text-xs text-white/40 mt-1">
              {passedLevels.length === 5 ? "Survived" : "Completion"}
            </div>
          </div>
        </div>

        {/* Badge */}
        {passedLevels.length === 5 && (
          <div className="mb-8 p-6 rounded-xl border border-green-500/30 bg-green-500/10 flex items-center gap-4">
            <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0" />
            <div>
              <div className="font-black text-lg">Gauntlet Survivor</div>
              <div className="text-white/50 text-sm">
                Your idea survived all 5 AI judges. That puts you in rare company.
              </div>
            </div>
          </div>
        )}

        {/* Level answers */}
        <div className="space-y-6 mb-8">
          {passedLevels.map((levelNum) => {
            const levelState = gameState.levels[levelNum];
            const levelMeta = LEVEL_LABELS[levelNum];

            return (
              <div
                key={levelNum}
                className="p-6 rounded-xl border border-white/10 bg-[#111]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs font-mono text-blue-400 mb-1">
                      LEVEL {levelNum} — {levelMeta.task.toUpperCase()}
                    </div>
                    <div className="font-bold">{levelMeta.persona}</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-green-400 font-mono">
                    <CheckCircle className="w-3 h-3" />
                    PASSED
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white/5 border border-white/5 mb-4">
                  <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                    {levelState.lastInput}
                  </p>
                </div>

                {levelState.lastResult && (
                  <div className="font-mono text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                    JUDGE NOTE: {levelState.lastResult.hint}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Copy link */}
        <div className="flex gap-4 items-center">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy report link
              </>
            )}
          </button>
          <Link
            href="/"
            className="text-sm text-white/30 hover:text-white/60 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-6 text-center mt-8">
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
