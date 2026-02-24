"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle, XCircle, Loader2, ChevronRight } from "lucide-react";

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

const LEVEL_DATA = [
  {
    number: 1,
    persona: "The Skeptic",
    personaDetail: "Reddit Skeptic",
    task: "Write a 3-sentence problem statement describing the problem your idea solves.",
    placeholder:
      "People who [target audience] struggle with [specific problem] because [root cause]. This leads to [painful consequence]. Existing solutions fail because [gap].",
    locked: false,
  },
  {
    number: 2,
    persona: "The Devil's Advocate",
    personaDetail: "Devil's Advocate",
    task: "Write your value proposition: who it's for, what it does, why it's different.",
    placeholder:
      "For [target customer] who [need/want], [product name] is a [category] that [key benefit]. Unlike [alternatives], we [differentiator].",
    locked: false,
  },
  {
    number: 3,
    persona: "The Cold Visitor",
    personaDetail: "Cold Traffic",
    task: "Write your hero section: headline + subtitle + CTA text.",
    placeholder:
      "Headline: [bold claim]\nSubtitle: [one sentence explanation]\nCTA: [action button text]",
    locked: true,
  },
  {
    number: 4,
    persona: "The Investor",
    personaDetail: "Angel Investor",
    task: "Describe your pricing model and business case.",
    placeholder:
      "We charge [price] per [unit/month] for [customer type]. Unit economics: CAC ~$[X], LTV ~$[Y]. Moat: [why competitors can't copy us easily].",
    locked: true,
  },
  {
    number: 5,
    persona: "The Crisis",
    personaDetail: "Crisis Scenario",
    task: 'Write a public response to this tweet: "@[YourApp] just lost 3 hours of my work because of a bug. This is unacceptable. I want a refund."',
    placeholder: "Write your actual tweet/response here...",
    locked: true,
  },
];

const DEFAULT_LEVEL_STATE: LevelState = {
  passed: false,
  attempts: 0,
  lastInput: "",
};

function IdeaModal({
  onSave,
}: {
  onSave: (name: string, description: string) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && description.trim()) {
      onSave(name.trim(), description.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl p-8 max-w-md w-full">
        <div className="text-xs font-mono text-blue-400 mb-2">BEFORE YOU BEGIN</div>
        <h2 className="text-2xl font-black mb-2">What&apos;s your idea?</h2>
        <p className="text-white/50 text-sm mb-6">
          The judges need to know what they&apos;re destroying — I mean, evaluating.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-white/40 font-mono block mb-1">IDEA NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. TaskMaster, BudgetBuddy, DevFlow..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-white/40 font-mono block mb-1">
              ONE-LINE DESCRIPTION
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does it do, for whom?"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim() || !description.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors mt-2"
          >
            Enter the Gauntlet →
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PlayPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [activeLevel, setActiveLevel] = useState<number>(1);
  const [inputText, setInputText] = useState("");
  const [isJudging, setIsJudging] = useState(false);
  const [currentResult, setCurrentResult] = useState<LevelResult | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const stored = localStorage.getItem("gauntlet_state");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as GameState;
        setGameState(parsed);
        // Set active level to first incomplete level
        for (let i = 1; i <= 5; i++) {
          if (!parsed.levels[i]?.passed) {
            setActiveLevel(i);
            break;
          }
        }
      } catch {
        setShowIdeaModal(true);
      }
    } else {
      setShowIdeaModal(true);
    }
  }, []);

  const saveGameState = (state: GameState) => {
    localStorage.setItem("gauntlet_state", JSON.stringify(state));
    setGameState(state);
  };

  const handleIdeaSave = (name: string, description: string) => {
    const newState: GameState = {
      ideaName: name,
      ideaDescription: description,
      paid: false,
      levels: {},
    };
    saveGameState(newState);
    setShowIdeaModal(false);
    setActiveLevel(1);
  };

  const handleUnlock = () => {
    if (!gameState) return;
    // TODO: wire to Stripe
    const updated = { ...gameState, paid: true };
    saveGameState(updated);
  };

  const handleSubmit = async () => {
    if (!gameState || !inputText.trim()) return;

    const levelConfig = LEVEL_DATA[activeLevel - 1];
    const isPaid = gameState.paid;

    if (levelConfig.locked && !isPaid) return;

    setIsJudging(true);
    setCurrentResult(null);

    try {
      const response = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: activeLevel,
          userInput: inputText,
          ideaName: gameState.ideaName,
        }),
      });

      if (!response.ok) {
        throw new Error("API error");
      }

      const result = (await response.json()) as LevelResult;
      setCurrentResult(result);

      // Update game state
      const currentLevelState = gameState.levels[activeLevel] || DEFAULT_LEVEL_STATE;
      const updatedLevelState: LevelState = {
        passed: result.verdict === "PASS",
        attempts: currentLevelState.attempts + 1,
        lastInput: inputText,
        lastResult: result,
      };

      const updated: GameState = {
        ...gameState,
        levels: {
          ...gameState.levels,
          [activeLevel]: updatedLevelState,
        },
      };
      saveGameState(updated);
    } catch {
      setCurrentResult({
        verdict: "FAIL",
        reasons: ["Unable to connect to the judges. Please try again."],
        hint: "Check your connection and retry.",
      });
    } finally {
      setIsJudging(false);
    }
  };

  const handleProceed = (nextLevel: number) => {
    setActiveLevel(nextLevel);
    setInputText("");
    setCurrentResult(null);
  };

  const handleViewReport = () => {
    if (!gameState) return;
    const reportId = btoa(gameState.ideaName + Date.now()).replace(/[^a-zA-Z0-9]/g, "").slice(0, 16);
    localStorage.setItem(`gauntlet_report_${reportId}`, JSON.stringify(gameState));
    router.push(`/report/${reportId}`);
  };

  if (!hydrated) return null;

  const levelPassedCount = gameState
    ? Object.values(gameState.levels).filter((l) => l.passed).length
    : 0;

  const activeLevelData = LEVEL_DATA[activeLevel - 1];
  const activeLevelState = gameState?.levels[activeLevel] || DEFAULT_LEVEL_STATE;
  const isLevelLocked = activeLevelData.locked && !gameState?.paid;
  const allPassed = levelPassedCount === 5;

  return (
    <>
      {showIdeaModal && <IdeaModal onSave={handleIdeaSave} />}

      <main className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          {gameState && (
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-xl font-black">{gameState.ideaName}</h1>
                  <p className="text-white/40 text-sm">{gameState.ideaDescription}</p>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem("gauntlet_state");
                    setGameState(null);
                    setShowIdeaModal(true);
                  }}
                  className="text-xs text-white/20 hover:text-white/50 transition-colors whitespace-nowrap"
                >
                  Start over
                </button>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 bg-white/10 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(levelPassedCount / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-white/40">{levelPassedCount}/5</span>
              </div>
            </div>
          )}

          {/* Level selector */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {LEVEL_DATA.map((level) => {
              const levelState = gameState?.levels[level.number];
              const isPaid = gameState?.paid;
              const isLocked = level.locked && !isPaid;
              const isPassed = levelState?.passed;
              const isActive = activeLevel === level.number;

              // A level is accessible if it's the first, or the previous level was passed
              const prevPassed = level.number === 1 || gameState?.levels[level.number - 1]?.passed;
              const isAccessible = !isLocked && prevPassed;

              return (
                <button
                  key={level.number}
                  onClick={() => {
                    if (isLocked || !prevPassed) return;
                    setActiveLevel(level.number);
                    setInputText(levelState?.lastInput || "");
                    setCurrentResult(levelState?.lastResult || null);
                  }}
                  disabled={isLocked || !prevPassed}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : isPassed
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : isAccessible
                      ? "bg-white/10 text-white/70 hover:bg-white/15"
                      : "bg-white/5 text-white/20 cursor-not-allowed"
                  }`}
                >
                  {isLocked ? (
                    <Lock className="w-3 h-3" />
                  ) : isPassed ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : null}
                  Level {level.number}
                </button>
              );
            })}
          </div>

          {/* Unlock banner */}
          {gameState && !gameState.paid && (
            <div className="mb-6 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-bold">Levels 3–5 are locked</div>
                <div className="text-xs text-white/40">Unlock all 5 levels to complete your validation</div>
              </div>
              <button
                onClick={handleUnlock}
                className="flex-shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
              >
                UNLOCK ALL — $9
              </button>
            </div>
          )}

          {/* All passed */}
          {allPassed && (
            <div className="mb-6 p-6 rounded-xl border border-green-500/30 bg-green-500/10 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h2 className="text-xl font-black mb-2">You survived the gauntlet.</h2>
              <p className="text-white/50 text-sm mb-4">
                Against all odds, your idea made it through all 5 judges.
              </p>
              <button
                onClick={handleViewReport}
                className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-lg transition-colors"
              >
                View Your Validation Report →
              </button>
            </div>
          )}

          {/* Level interface */}
          {gameState && (
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
              {/* Level header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-xs font-mono text-blue-400 mb-1">
                    LEVEL {activeLevelData.number}
                  </div>
                  <h2 className="text-xl font-black">{activeLevelData.persona}</h2>
                  <p className="text-white/40 text-sm">{activeLevelData.personaDetail}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/30 font-mono">ATTEMPTS</div>
                  <div className="text-2xl font-black text-white/40">
                    {activeLevelState.attempts}
                  </div>
                </div>
              </div>

              {/* Task */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 mb-6">
                <div className="text-xs text-white/30 font-mono mb-2">YOUR TASK</div>
                <p className="text-sm leading-relaxed">{activeLevelData.task}</p>
              </div>

              {/* Locked state */}
              {isLevelLocked ? (
                <div className="text-center py-8">
                  <Lock className="w-8 h-8 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm mb-4">
                    This level requires unlocking all levels.
                  </p>
                  <button
                    onClick={handleUnlock}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-lg transition-colors"
                  >
                    UNLOCK ALL LEVELS — $9
                  </button>
                </div>
              ) : (
                <>
                  {/* Input */}
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={activeLevelData.placeholder}
                    rows={6}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors resize-none font-mono text-sm mb-4"
                    disabled={isJudging || activeLevelState.passed}
                  />

                  {/* Result */}
                  {currentResult && (
                    <div
                      className={`p-5 rounded-xl border mb-4 ${
                        currentResult.verdict === "PASS"
                          ? "border-green-500/30 bg-green-500/10"
                          : "border-red-500/30 bg-red-500/10"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {currentResult.verdict === "PASS" ? (
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        )}
                        <span
                          className={`font-black text-lg ${
                            currentResult.verdict === "PASS" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {currentResult.verdict}
                        </span>
                      </div>
                      <ul className="space-y-1 mb-3">
                        {currentResult.reasons.map((reason, i) => (
                          <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                            <span className="text-white/30 mt-0.5">—</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                      <div className="font-mono text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                        HINT: {currentResult.hint}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    {activeLevelState.passed ? (
                      activeLevel < 5 ? (
                        <button
                          onClick={() => handleProceed(activeLevel + 1)}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-lg transition-colors"
                        >
                          Proceed to Level {activeLevel + 1} <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handleViewReport}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-lg transition-colors"
                        >
                          View Report <ChevronRight className="w-4 h-4" />
                        </button>
                      )
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={isJudging || !inputText.trim()}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-lg transition-colors"
                      >
                        {isJudging ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            The gauntlet judges your work...
                          </>
                        ) : (
                          "Submit to Gauntlet →"
                        )}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
