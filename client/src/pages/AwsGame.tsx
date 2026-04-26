import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

// ─── Types ───────────────────────────────────────────────────────────────────

type QuestionType = "multiple-choice" | "true-false" | "matching";

interface MultipleChoiceQuestion {
  type: "multiple-choice";
  question: string;
  hint: string;
  options: { label: string; icon: string; description: string }[];
  correct: number;
  explanation: string;
  service: string;
}

interface TrueFalseQuestion {
  type: "true-false";
  question: string;
  hint: string;
  correct: boolean;
  explanation: string;
  service: string;
}

interface MatchingQuestion {
  type: "matching";
  question: string;
  hint: string;
  pairs: { service: string; description: string }[];
  explanation: string;
}

type Question = MultipleChoiceQuestion | TrueFalseQuestion | MatchingQuestion;

// ─── Game Data ───────────────────────────────────────────────────────────────

const QUESTIONS: Question[] = [
  {
    type: "multiple-choice",
    question: "A startup needs to store thousands of images and videos for their website. Which AWS service should they use?",
    hint: "Think of this service as a giant, unlimited file cabinet in the cloud ☁️",
    options: [
      { label: "Amazon EC2", icon: "🖥️", description: "Virtual servers in the cloud" },
      { label: "Amazon S3", icon: "🪣", description: "Scalable object storage" },
      { label: "Amazon RDS", icon: "🗄️", description: "Managed relational database" },
      { label: "AWS Lambda", icon: "⚡", description: "Serverless compute functions" },
    ],
    correct: 1,
    explanation: "Amazon S3 (Simple Storage Service) is designed for storing any amount of data — images, videos, backups, and more. It's highly durable, scalable, and cost-effective for static file storage.",
    service: "Amazon S3",
  },
  {
    type: "true-false",
    question: "AWS IAM (Identity and Access Management) controls who can access your AWS account and what actions they can perform.",
    hint: "Think of IAM like a hotel key card system 🏨",
    correct: true,
    explanation: "TRUE! IAM is exactly that — it lets you create users, groups, and roles, then assign specific permissions to each. Just like a hotel key card that only opens certain doors, IAM controls who gets access to which AWS resources.",
    service: "AWS IAM",
  },
  {
    type: "matching",
    question: "Match each AWS service to what it does",
    hint: "Each service has one specific job — match them correctly! 🎯",
    pairs: [
      { service: "EC2", description: "Virtual servers" },
      { service: "S3", description: "File storage" },
      { service: "CloudFront", description: "Global CDN" },
      { service: "SES", description: "Send emails" },
    ],
    explanation: "EC2 provides virtual servers, S3 stores files and objects, CloudFront is a Content Delivery Network that speeds up global delivery, and SES (Simple Email Service) sends transactional emails at scale.",
  },
  {
    type: "multiple-choice",
    question: "An e-commerce site gets 10x more traffic during Black Friday. Which AWS feature automatically adds more servers to handle the load?",
    hint: "Think of a restaurant adding more waiters on a busy Saturday 🍽️",
    options: [
      { label: "AWS CloudTrail", icon: "📋", description: "Logs API activity" },
      { label: "Amazon CloudWatch", icon: "📊", description: "Monitors resources" },
      { label: "AWS Auto Scaling", icon: "📈", description: "Adjusts capacity automatically" },
      { label: "AWS Config", icon: "⚙️", description: "Tracks resource configurations" },
    ],
    correct: 2,
    explanation: "AWS Auto Scaling automatically adjusts the number of EC2 instances based on demand. During traffic spikes it adds servers; when traffic drops it removes them — so you only pay for what you use.",
    service: "AWS Auto Scaling",
  },
  {
    type: "true-false",
    question: "AWS charges a fixed monthly fee regardless of how much you use their services.",
    hint: "Think about how your electricity bill works 💡",
    correct: false,
    explanation: "FALSE! AWS uses a pay-as-you-go model — you only pay for what you actually use, similar to a utility bill. There's no fixed monthly fee. If you use more, you pay more; if you use less, you pay less.",
    service: "AWS Pricing",
  },
  {
    type: "multiple-choice",
    question: "A media company needs to deliver videos to users worldwide with the lowest possible latency. Which service should they use?",
    hint: "Think of convenience stores — copies near you vs. one main warehouse far away 🏪",
    options: [
      { label: "Amazon S3", icon: "🪣", description: "Object storage service" },
      { label: "Amazon CloudFront", icon: "🌐", description: "Global content delivery network" },
      { label: "AWS Direct Connect", icon: "🔌", description: "Dedicated network connection" },
      { label: "Amazon Route 53", icon: "🗺️", description: "DNS web service" },
    ],
    correct: 1,
    explanation: "Amazon CloudFront is a CDN that caches content at 400+ edge locations worldwide. Instead of every user fetching from one central server, they get content from the nearest edge location — dramatically reducing latency.",
    service: "Amazon CloudFront",
  },
];

const STUDY_CARDS = [
  {
    service: "AWS Auto Scaling",
    icon: "📈",
    color: "#58cc02",
    category: "Compute",
    analogy: "Like a restaurant: on a quiet Tuesday you have 2 waiters, but on a busy Saturday you bring in 8. Auto Scaling does the same with servers — adds them when busy, removes them when quiet.",
    facts: [
      "Automatically adjusts EC2 instance count based on demand",
      "Works with CloudWatch metrics to trigger scaling actions",
      "Helps you avoid paying for idle servers during low traffic",
    ],
    keywords: ["elastic", "scale out", "scale in", "capacity", "traffic spikes"],
  },
  {
    service: "Amazon CloudFront",
    icon: "🌐",
    color: "#1cb0f6",
    category: "Networking",
    analogy: "Like a convenience store chain: instead of everyone driving to one main warehouse, copies of popular items are stored at stores near you. CloudFront stores copies of your content at 400+ locations worldwide.",
    facts: [
      "Content Delivery Network (CDN) with 400+ global edge locations",
      "Reduces latency by serving content from the nearest location",
      "Integrates with S3, EC2, and other AWS origins",
    ],
    keywords: ["CDN", "edge locations", "low latency", "global", "cache"],
  },
  {
    service: "AWS IAM",
    icon: "🔑",
    color: "#ff9900",
    category: "Security",
    analogy: "Like a hotel key card system: you decide who gets a key, which doors they can open, and for how long. IAM lets you control exactly who can access which AWS resources and what they can do.",
    facts: [
      "Create users, groups, and roles with specific permissions",
      "Follow the principle of least privilege — only give access that's needed",
      "Free to use — no extra charge for IAM",
    ],
    keywords: ["permissions", "roles", "policies", "least privilege", "access control"],
  },
];

// ─── Owl Mascot ──────────────────────────────────────────────────────────────

function OwlMascot({ state }: { state: "idle" | "correct" | "wrong" }) {
  return (
    <div
      className="owl-mascot"
      style={{
        animation:
          state === "correct"
            ? "owlBounce 0.5s ease"
            : state === "wrong"
            ? "owlShake 0.5s ease"
            : "none",
      }}
    >
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Body */}
        <ellipse cx="40" cy="48" rx="22" ry="24" fill="#ff9900" />
        {/* Head */}
        <circle cx="40" cy="28" r="18" fill="#ffb347" />
        {/* Ears */}
        <polygon points="26,14 22,4 32,12" fill="#ff9900" />
        <polygon points="54,14 58,4 48,12" fill="#ff9900" />
        {/* Eyes */}
        <circle cx="33" cy="26" r="7" fill="white" />
        <circle cx="47" cy="26" r="7" fill="white" />
        <circle cx="34" cy="27" r="4" fill="#1a1a2e" />
        <circle cx="48" cy="27" r="4" fill="#1a1a2e" />
        <circle cx="35" cy="25" r="1.5" fill="white" />
        <circle cx="49" cy="25" r="1.5" fill="white" />
        {/* Beak */}
        <polygon points="40,32 36,37 44,37" fill="#ff6600" />
        {/* AWS Badge on belly */}
        <rect x="30" y="44" width="20" height="12" rx="3" fill="#232f3e" />
        <text x="40" y="53" textAnchor="middle" fill="#ff9900" fontSize="6" fontWeight="bold" fontFamily="Arial">AWS</text>
        {/* Wings */}
        <ellipse cx="20" cy="52" rx="8" ry="12" fill="#e67e00" transform="rotate(-15 20 52)" />
        <ellipse cx="60" cy="52" rx="8" ry="12" fill="#e67e00" transform="rotate(15 60 52)" />
        {/* Feet */}
        <ellipse cx="33" cy="70" rx="7" ry="4" fill="#ff6600" />
        <ellipse cx="47" cy="70" rx="7" ry="4" fill="#ff6600" />
      </svg>
    </div>
  );
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    color: ["#58cc02", "#ff4b4b", "#1cb0f6", "#ff9900", "#a560f8"][i % 5],
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
  }));

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100, overflow: "hidden" }}>
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-10px",
            width: "10px",
            height: "10px",
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Game Component ──────────────────────────────────────────────────────

export default function AwsGame() {
  const [, navigate] = useLocation();
  const [phase, setPhase] = useState<"game" | "complete" | "gameover" | "study">("game");
  const [currentQ, setCurrentQ] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [owlState, setOwlState] = useState<"idle" | "correct" | "wrong">("idle");
  const [wrongServices, setWrongServices] = useState<string[]>([]);

  // Matching state
  const [matchSelected, setMatchSelected] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [wrongMatch, setWrongMatch] = useState<string | null>(null);
  const [matchComplete, setMatchComplete] = useState(false);
  const [shuffledDescriptions, setShuffledDescriptions] = useState<string[]>([]);

  // tRPC hooks for leaderboard
  const submitScore = trpc.game.submitScore.useMutation();
  const { data: leaderboard, refetch: refetchLeaderboard } = trpc.game.getLeaderboard.useQuery(undefined, { enabled: phase === "complete" });
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  const question = QUESTIONS[currentQ];
  const progress = (currentQ / QUESTIONS.length) * 100;

  // Auto-submit score when lesson completes
  useEffect(() => {
    if (phase === "complete" && !scoreSubmitted) {
      setScoreSubmitted(true);
      submitScore.mutate({ xpEarned: xp, streak, lessonsCompleted: 1 }, {
        onSuccess: () => refetchLeaderboard(),
      });
    }
  }, [phase]);

  // Shuffle matching descriptions on mount for each matching question
  useEffect(() => {
    if (question.type === "matching") {
      const descs = [...question.pairs.map((p) => p.description)];
      for (let i = descs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [descs[i], descs[j]] = [descs[j], descs[i]];
      }
      setShuffledDescriptions(descs);
      setMatchSelected(null);
      setMatchedPairs(new Set());
      setWrongMatch(null);
      setMatchComplete(false);
    setScoreSubmitted(false);
    setShowLeaderboard(false);
    }
  }, [currentQ]);

  const handleCorrect = useCallback((service?: string) => {
    const newStreak = streak + 1;
    const bonus = newStreak >= 3 ? 2 : 1;
    const gained = 10 * bonus;
    setStreak(newStreak);
    setXp((x) => x + gained);
    setIsCorrect(true);
    setOwlState("correct");
    setTimeout(() => setOwlState("idle"), 600);
  }, [streak]);

  const handleWrong = useCallback((service?: string) => {
    setHearts((h) => {
      const newH = h - 1;
      if (newH <= 0) {
        setTimeout(() => setPhase("gameover"), 1200);
      }
      return newH;
    });
    setStreak(0);
    setIsCorrect(false);
    setOwlState("wrong");
    setTimeout(() => setOwlState("idle"), 600);
    if (service) {
      setWrongServices((prev) => prev.includes(service) ? prev : [...prev, service]);
    }
  }, []);

  const handleMultipleChoice = (index: number) => {
    if (showFeedback) return;
    setSelectedAnswer(index);
    setShowFeedback(true);
    const q = question as MultipleChoiceQuestion;
    if (index === q.correct) {
      handleCorrect(q.service);
    } else {
      handleWrong(q.service);
    }
  };

  const handleTrueFalse = (answer: boolean) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);
    const q = question as TrueFalseQuestion;
    if (answer === q.correct) {
      handleCorrect(q.service);
    } else {
      handleWrong(q.service);
    }
  };

  const handleMatchSelect = (value: string, isService: boolean) => {
    if (matchedPairs.has(value)) return;

    if (!matchSelected) {
      setMatchSelected(value);
      return;
    }

    // Try to match
    const q = question as MatchingQuestion;
    let matched = false;
    for (const pair of q.pairs) {
      const serviceSelected = isService ? value : matchSelected;
      const descSelected = isService ? matchSelected : value;
      if (pair.service === serviceSelected && pair.description === descSelected) {
        matched = true;
        break;
      }
    }

    if (matched) {
      const newMatched = new Set(matchedPairs);
      newMatched.add(isService ? value : matchSelected!);
      newMatched.add(isService ? matchSelected! : value);
      setMatchedPairs(newMatched);
      setMatchSelected(null);
      handleCorrect();
      if (newMatched.size === q.pairs.length * 2) {
        setMatchComplete(true);
        setShowFeedback(true);
        setIsCorrect(true);
      }
    } else {
      setWrongMatch(value);
      handleWrong();
      setTimeout(() => {
        setWrongMatch(null);
        setMatchSelected(null);
      }, 700);
    }
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    setOwlState("idle");
    if (currentQ + 1 >= QUESTIONS.length) {
      setPhase("complete");
    } else {
      setCurrentQ((q) => q + 1);
    }
  };

  const resetGame = () => {
    setPhase("game");
    setCurrentQ(0);
    setHearts(3);
    setXp(0);
    setStreak(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setOwlState("idle");
    setWrongServices([]);
    setMatchSelected(null);
    setMatchedPairs(new Set());
    setMatchComplete(false);
    setScoreSubmitted(false);
    setShowLeaderboard(false);
  };

  // ─── Render: Game Over ────────────────────────────────────────────────────
  if (phase === "gameover") {
    return (
      <div className="game-screen" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <style>{gameStyles}</style>
        <div className="game-card" style={{ textAlign: "center", padding: "2.5rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>💔</div>
          <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#ff4b4b", marginBottom: "0.5rem" }}>Game Over!</h2>
          <p style={{ color: "#6b7280", marginBottom: "0.5rem" }}>You ran out of hearts.</p>
          <p style={{ color: "#6b7280", marginBottom: "2rem" }}>XP earned this round: <strong style={{ color: "#ff9900" }}>{xp} XP</strong></p>
          <OwlMascot state="idle" />
          <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button className="game-btn game-btn-primary" onClick={() => setPhase("study")}>
              📚 Study weak spots first
            </button>
            <button className="game-btn game-btn-secondary" onClick={resetGame}>
              🔄 Retry lesson
            </button>
            <button className="game-btn game-btn-ghost" onClick={() => navigate("/tutor")}>
              🤖 Ask AI Tutor
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Complete ─────────────────────────────────────────────────────
  if (phase === "complete") {
    const rankEmojis = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
    return (
      <div className="game-screen" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <style>{gameStyles}</style>
        <Confetti />
        <div style={{ maxWidth: "520px", margin: "0 auto", padding: "1.5rem" }}>
          {/* Score card */}
          <div className="game-card" style={{ textAlign: "center", padding: "2rem", position: "relative", zIndex: 10, marginBottom: "1rem" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>🎉</div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#58cc02", marginBottom: "0.25rem" }}>Lesson Complete!</h2>
            <p style={{ color: "#6b7280", marginBottom: "1rem", fontSize: "0.9rem" }}>You finished the AWS Basics lesson!</p>
            <OwlMascot state="correct" />
            <div style={{ display: "flex", justifyContent: "center", gap: "2rem", margin: "1rem 0" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2rem", fontWeight: 900, color: "#ff9900" }}>{xp}</div>
                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>XP Earned</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2rem", fontWeight: 900, color: "#1cb0f6" }}>{hearts}</div>
                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>Hearts Left</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2rem", fontWeight: 900, color: "#a560f8" }}>{streak}</div>
                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>Best Streak</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <button
                className="game-btn"
                style={{ background: "#1cb0f6", color: "white", border: "none", fontWeight: 800 }}
                onClick={() => setShowLeaderboard(!showLeaderboard)}
              >
                🏆 {showLeaderboard ? "Hide Leaderboard" : "View Leaderboard"}
              </button>
              {wrongServices.length > 0 && (
                <button className="game-btn game-btn-primary" onClick={() => setPhase("study")}>
                  📚 Study weak spots
                </button>
              )}
              <button className="game-btn game-btn-secondary" onClick={resetGame}>
                🔄 Play again
              </button>
              <button className="game-btn" style={{ background: "#232f3e", color: "white", border: "none" }} onClick={() => navigate("/practice")}>
                📝 Try Practice Mode
              </button>
            </div>
          </div>

          {/* Leaderboard panel */}
          {showLeaderboard && (
            <div className="game-card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontWeight: 900, fontSize: "1.1rem", textAlign: "center", marginBottom: "1rem" }}>
                🏆 Top 10 Leaderboard
              </h3>
              {!leaderboard ? (
                <p style={{ textAlign: "center", color: "#6b7280", fontSize: "0.9rem" }}>Loading...</p>
              ) : leaderboard.length === 0 ? (
                <p style={{ textAlign: "center", color: "#6b7280", fontSize: "0.9rem" }}>No scores yet — you're the first!</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.userId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.6rem 0.75rem",
                        borderRadius: "12px",
                        background: entry.isCurrentUser ? "#58cc0215" : "#f9fafb",
                        border: entry.isCurrentUser ? "2px solid #58cc02" : "2px solid transparent",
                        fontWeight: entry.isCurrentUser ? 800 : 600,
                      }}
                    >
                      <span style={{ fontSize: "1.2rem", minWidth: "2rem", textAlign: "center" }}>
                        {rankEmojis[entry.rank - 1] ?? `#${entry.rank}`}
                      </span>
                      <span style={{ flex: 1, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {entry.name}{entry.isCurrentUser ? " (You)" : ""}
                      </span>
                      <span style={{ color: "#ff9900", fontWeight: 900, fontSize: "0.9rem" }}>⚡ {entry.totalXp} XP</span>
                      <span style={{ color: "#6b7280", fontSize: "0.75rem" }}>{entry.lessonsCompleted} lessons</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Render: Study Cards ──────────────────────────────────────────────────
  if (phase === "study") {
    const cards = wrongServices.length > 0
      ? STUDY_CARDS.filter((c) => wrongServices.some((s) => s.includes(c.service.split(" ").pop()!)))
      : STUDY_CARDS;
    const displayCards = cards.length > 0 ? cards : STUDY_CARDS;

    return (
      <div className="game-screen" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <style>{gameStyles}</style>
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 900, textAlign: "center", marginBottom: "1.5rem" }}>
            📚 Study These Services
          </h2>
          {displayCards.map((card) => (
            <div key={card.service} className="game-card" style={{ marginBottom: "1.5rem", borderTop: `4px solid ${card.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <span style={{ fontSize: "2rem" }}>{card.icon}</span>
                <div>
                  <div style={{ fontWeight: 900, fontSize: "1.1rem" }}>{card.service}</div>
                  <span style={{ background: card.color + "22", color: card.color, padding: "2px 8px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>{card.category}</span>
                </div>
              </div>
              <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "1rem", marginBottom: "1rem", borderLeft: `4px solid ${card.color}` }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#6b7280", marginBottom: "0.25rem" }}>💡 ANALOGY</div>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>{card.analogy}</p>
              </div>
              <ul style={{ margin: "0 0 1rem", paddingLeft: "1.25rem" }}>
                {card.facts.map((f, i) => (
                  <li key={i} style={{ marginBottom: "0.4rem", fontSize: "0.9rem" }}>{f}</li>
                ))}
              </ul>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", marginBottom: "0.5rem" }}>🎯 EXAM KEYWORDS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {card.keywords.map((kw) => (
                    <span key={kw} style={{ background: "#1cb0f622", color: "#1cb0f6", padding: "2px 10px", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 700 }}>{kw}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div className="game-card" style={{ textAlign: "center", padding: "1.5rem", borderTop: "4px solid #58cc02" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🦉</div>
            <p style={{ fontWeight: 700, marginBottom: "1rem" }}>Ready to try again?</p>
            <button className="game-btn game-btn-primary" onClick={resetGame}>
              🔄 Retry the lesson
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Game ─────────────────────────────────────────────────────────
  return (
    <div className="game-screen" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <style>{gameStyles}</style>

      {/* Top Bar */}
      <div className="game-topbar">
        <button className="game-close-btn" onClick={() => navigate("/dashboard")}>✕</button>
        <div className="game-progress-bar">
          <div className="game-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="game-stats">
          <span className="game-hearts">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} style={{ opacity: i < hearts ? 1 : 0.2 }}>❤️</span>
            ))}
          </span>
          <span className="game-xp">⚡ {xp} XP</span>
          {streak >= 2 && <span className="game-streak">🔥 {streak}</span>}
        </div>
      </div>

      {/* Question Area */}
      <div className="game-content">
        {/* Owl + Speech Bubble */}
        <div className="owl-area">
          <div className="speech-bubble">{question.hint}</div>
          <OwlMascot state={owlState} />
        </div>

        {/* Question Card */}
        <div className="game-card question-card">
          <div className="question-number">Question {currentQ + 1} of {QUESTIONS.length}</div>
          <h3 className="question-text">{question.question}</h3>

          {/* Multiple Choice */}
          {question.type === "multiple-choice" && (
            <div className="options-grid">
              {(question as MultipleChoiceQuestion).options.map((opt, i) => {
                const q = question as MultipleChoiceQuestion;
                let optClass = "option-btn";
                if (showFeedback) {
                  if (i === q.correct) optClass += " option-correct";
                  else if (i === selectedAnswer) optClass += " option-wrong";
                  else optClass += " option-disabled";
                }
                return (
                  <button key={i} className={optClass} onClick={() => handleMultipleChoice(i)} disabled={showFeedback}>
                    <span className="option-icon">{opt.icon}</span>
                    <div>
                      <div className="option-label">{opt.label}</div>
                      <div className="option-desc">{opt.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* True / False */}
          {question.type === "true-false" && (
            <div className="tf-grid">
              {[true, false].map((val) => {
                const q = question as TrueFalseQuestion;
                let btnClass = "tf-btn " + (val ? "tf-true" : "tf-false");
                if (showFeedback) {
                  if (val === q.correct) btnClass += " tf-correct";
                  else if (val === selectedAnswer) btnClass += " tf-wrong-selected";
                  else btnClass += " tf-disabled";
                }
                return (
                  <button key={String(val)} className={btnClass} onClick={() => handleTrueFalse(val)} disabled={showFeedback}>
                    {val ? "✅ True" : "❌ False"}
                  </button>
                );
              })}
            </div>
          )}

          {/* Matching */}
          {question.type === "matching" && (
            <div className="matching-grid">
              <div className="matching-col">
                {(question as MatchingQuestion).pairs.map((pair) => {
                  const isMatched = matchedPairs.has(pair.service);
                  const isSelected = matchSelected === pair.service;
                  const isWrong = wrongMatch === pair.service;
                  return (
                    <button
                      key={pair.service}
                      className={`match-btn ${isMatched ? "match-matched" : ""} ${isSelected ? "match-selected" : ""} ${isWrong ? "match-wrong" : ""}`}
                      onClick={() => !isMatched && handleMatchSelect(pair.service, true)}
                      disabled={isMatched}
                    >
                      {pair.service}
                    </button>
                  );
                })}
              </div>
              <div className="matching-col">
                {shuffledDescriptions.map((desc) => {
                  const isMatched = matchedPairs.has(desc);
                  const isSelected = matchSelected === desc;
                  const isWrong = wrongMatch === desc;
                  return (
                    <button
                      key={desc}
                      className={`match-btn ${isMatched ? "match-matched" : ""} ${isSelected ? "match-selected" : ""} ${isWrong ? "match-wrong" : ""}`}
                      onClick={() => !isMatched && handleMatchSelect(desc, false)}
                      disabled={isMatched}
                    >
                      {desc}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Feedback Bar */}
        {showFeedback && (
          <div className={`feedback-bar ${isCorrect ? "feedback-correct" : "feedback-wrong"}`}>
            <div className="feedback-icon">{isCorrect ? "🎉" : "💡"}</div>
            <div>
              <div className="feedback-title">{isCorrect ? "Correct!" : "Not quite!"}</div>
              <div className="feedback-explanation">
                {question.type === "multiple-choice" && (question as MultipleChoiceQuestion).explanation}
                {question.type === "true-false" && (question as TrueFalseQuestion).explanation}
                {question.type === "matching" && (question as MatchingQuestion).explanation}
              </div>
            </div>
            <button className="feedback-next-btn" onClick={nextQuestion}>
              {currentQ + 1 >= QUESTIONS.length ? "Finish 🎓" : "Continue →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const gameStyles = `
  @keyframes owlBounce {
    0%, 100% { transform: translateY(0); }
    30% { transform: translateY(-16px) scale(1.1); }
    60% { transform: translateY(-6px); }
  }
  @keyframes owlShake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px) rotate(-5deg); }
    40% { transform: translateX(8px) rotate(5deg); }
    60% { transform: translateX(-5px); }
    80% { transform: translateX(5px); }
  }
  @keyframes confettiFall {
    0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
  @keyframes slideUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes popIn {
    0% { transform: scale(0.8); opacity: 0; }
    70% { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
  }

  .game-screen {
    min-height: 100vh;
    background: linear-gradient(135deg, #f0f9ff 0%, #fefce8 100%);
    display: flex;
    flex-direction: column;
  }
  .game-topbar {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: white;
    border-bottom: 2px solid #e5e7eb;
    position: sticky;
    top: 0;
    z-index: 50;
  }
  .game-close-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    color: #9ca3af;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 50%;
    transition: background 0.2s;
  }
  .game-close-btn:hover { background: #f3f4f6; }
  .game-progress-bar {
    flex: 1;
    height: 12px;
    background: #e5e7eb;
    border-radius: 999px;
    overflow: hidden;
  }
  .game-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #58cc02, #89e219);
    border-radius: 999px;
    transition: width 0.5s ease;
  }
  .game-stats {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 800;
    font-size: 0.9rem;
  }
  .game-hearts { display: flex; gap: 2px; }
  .game-xp { color: #ff9900; }
  .game-streak { color: #ff4b4b; }

  .game-content {
    flex: 1;
    max-width: 600px;
    margin: 0 auto;
    padding: 1.5rem;
    width: 100%;
    padding-bottom: 120px;
  }

  .owl-area {
    display: flex;
    align-items: flex-end;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .speech-bubble {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    font-weight: 700;
    color: #374151;
    position: relative;
    flex: 1;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    animation: popIn 0.4s ease;
  }
  .speech-bubble::after {
    content: '';
    position: absolute;
    right: -10px;
    bottom: 12px;
    border: 8px solid transparent;
    border-left-color: white;
    filter: drop-shadow(2px 0 0 #e5e7eb);
  }
  .owl-mascot { flex-shrink: 0; }

  .game-card {
    background: white;
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow: 0 4px 0 #d1d5db, 0 6px 20px rgba(0,0,0,0.08);
    animation: popIn 0.3s ease;
  }
  .question-number {
    font-size: 0.75rem;
    font-weight: 800;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }
  .question-text {
    font-size: 1.05rem;
    font-weight: 800;
    color: #1f2937;
    margin: 0 0 1.25rem;
    line-height: 1.5;
  }

  .options-grid {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .option-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border: 2.5px solid #e5e7eb;
    border-radius: 14px;
    background: white;
    cursor: pointer;
    font-family: 'Nunito', sans-serif;
    font-weight: 700;
    text-align: left;
    transition: all 0.15s;
    box-shadow: 0 2px 0 #d1d5db;
  }
  .option-btn:hover:not(:disabled) {
    border-color: #1cb0f6;
    transform: translateY(-1px);
    box-shadow: 0 3px 0 #1cb0f6;
  }
  .option-btn:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: none;
  }
  .option-icon { font-size: 1.5rem; flex-shrink: 0; }
  .option-label { font-size: 0.95rem; font-weight: 800; color: #1f2937; }
  .option-desc { font-size: 0.78rem; color: #6b7280; font-weight: 600; }
  .option-correct { border-color: #58cc02 !important; background: #f0fdf4 !important; box-shadow: 0 2px 0 #58cc02 !important; }
  .option-wrong { border-color: #ff4b4b !important; background: #fff5f5 !important; box-shadow: 0 2px 0 #ff4b4b !important; }
  .option-disabled { opacity: 0.5; }

  .tf-grid { display: flex; gap: 1rem; }
  .tf-btn {
    flex: 1;
    padding: 1.5rem;
    border-radius: 16px;
    border: 3px solid transparent;
    font-family: 'Nunito', sans-serif;
    font-size: 1.1rem;
    font-weight: 900;
    cursor: pointer;
    transition: all 0.15s;
    box-shadow: 0 4px 0 rgba(0,0,0,0.15);
  }
  .tf-btn:active:not(:disabled) { transform: translateY(3px); box-shadow: none; }
  .tf-true { background: #58cc02; color: white; }
  .tf-true:hover:not(:disabled) { background: #4caf00; }
  .tf-false { background: #ff4b4b; color: white; }
  .tf-false:hover:not(:disabled) { background: #e03e3e; }
  .tf-correct { outline: 4px solid #1f2937; }
  .tf-wrong-selected { opacity: 0.6; }
  .tf-disabled { opacity: 0.5; }

  .matching-grid { display: flex; gap: 0.75rem; }
  .matching-col { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
  .match-btn {
    padding: 0.6rem 0.75rem;
    border: 2.5px solid #e5e7eb;
    border-radius: 12px;
    background: white;
    font-family: 'Nunito', sans-serif;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.15s;
    box-shadow: 0 2px 0 #d1d5db;
    text-align: center;
  }
  .match-btn:hover:not(:disabled) { border-color: #1cb0f6; transform: translateY(-1px); }
  .match-selected { border-color: #1cb0f6 !important; background: #e0f5ff !important; box-shadow: 0 2px 0 #1cb0f6 !important; }
  .match-matched { border-color: #58cc02 !important; background: #f0fdf4 !important; box-shadow: 0 2px 0 #58cc02 !important; opacity: 0.7; cursor: default; }
  .match-wrong { border-color: #ff4b4b !important; background: #fff5f5 !important; animation: owlShake 0.4s ease; }

  .feedback-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1.25rem 1.5rem;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    animation: slideUp 0.3s ease;
    z-index: 40;
  }
  .feedback-correct { background: #f0fdf4; border-top: 3px solid #58cc02; }
  .feedback-wrong { background: #fff5f5; border-top: 3px solid #ff4b4b; }
  .feedback-icon { font-size: 1.5rem; flex-shrink: 0; }
  .feedback-title { font-weight: 900; font-size: 1rem; color: #1f2937; margin-bottom: 0.25rem; }
  .feedback-explanation { font-size: 0.82rem; color: #4b5563; font-weight: 600; line-height: 1.5; max-width: 380px; }
  .feedback-next-btn {
    margin-left: auto;
    flex-shrink: 0;
    background: #58cc02;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 0.6rem 1.25rem;
    font-family: 'Nunito', sans-serif;
    font-weight: 900;
    font-size: 0.95rem;
    cursor: pointer;
    box-shadow: 0 3px 0 #4caf00;
    transition: all 0.15s;
    align-self: center;
  }
  .feedback-next-btn:hover { background: #4caf00; transform: translateY(-1px); }
  .feedback-next-btn:active { transform: translateY(2px); box-shadow: none; }

  .game-btn {
    width: 100%;
    padding: 0.9rem;
    border-radius: 14px;
    border: none;
    font-family: 'Nunito', sans-serif;
    font-weight: 900;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.15s;
    box-shadow: 0 3px 0 rgba(0,0,0,0.15);
  }
  .game-btn:hover { transform: translateY(-1px); }
  .game-btn:active { transform: translateY(2px); box-shadow: none; }
  .game-btn-primary { background: #58cc02; color: white; }
  .game-btn-primary:hover { background: #4caf00; }
  .game-btn-secondary { background: #1cb0f6; color: white; }
  .game-btn-secondary:hover { background: #0ea5e9; }
  .game-btn-ghost { background: #f3f4f6; color: #374151; }
  .game-btn-ghost:hover { background: #e5e7eb; }
`;
