# Gauntlet — Build Brief for Claude Code

Read PRD.md first for full context.

## Summary
Build a complete Next.js 15 app called "Gauntlet" — a Gandalf-inspired startup validation game.
Tagline: "Your idea won't survive. Prove me wrong."

## IMPORTANT: Use Google Gemini for AI judging (NOT Anthropic)
- Use `@google/generative-ai` npm package
- Model: `gemini-2.0-flash` 
- API key env var: `GOOGLE_AI_API_KEY`
- This is cheaper and keeps Anthropic subscription for personal use

## Tech Stack
- Next.js 15 (App Router, latest stable) — run `npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"` to scaffold
- Tailwind CSS
- TypeScript
- `@google/generative-ai` for AI judging
- No auth (localStorage for session state)
- No database for MVP (localStorage + API routes)
- `lucide-react` for icons

## Pages
1. `/` — Landing page
2. `/play` — Game interface  
3. `/api/judge` — POST endpoint for Gemini judging

## API Route /api/judge
POST body: `{ level: number, userInput: string, ideaName: string }`
- Use `GOOGLE_AI_API_KEY` env var
- Call Gemini with appropriate system prompt for that level
- Parse JSON response, return `{ verdict: 'PASS' | 'FAIL', reasons: string[], hint: string }`

## The 5 Levels

### Level 1: The Skeptic
- Persona: "Reddit Skeptic" — tired, seen 1000 startup ideas fail
- Task: Write a 3-sentence problem statement
- System prompt: `You are a cynical Reddit user who has seen thousands of startup ideas fail. You will receive someone's startup problem statement. Evaluate if this is a REAL, specific, painful problem that real people actually have. If it's vague, too broad, or sounds like wishful thinking, FAIL them. If it's specific and credible, PASS. Respond ONLY with valid JSON (no markdown): {"verdict":"PASS or FAIL","reasons":["reason1","reason2"],"hint":"one actionable tip"}`

### Level 2: The Devil's Advocate
- Persona: "Devil's Advocate" — smart friend who pushes back on everything
- Task: Write your value proposition (who it's for, what it does, why different)
- System prompt: `You are a brutally honest friend with startup experience evaluating a value proposition. Find fatal flaws: Could Amazon/Google do this tomorrow? Does it already exist? Is differentiation real or fluff? FAIL if you find a fatal flaw. PASS only if differentiation is genuine and defensible. Respond ONLY with valid JSON: {"verdict":"PASS or FAIL","reasons":["reason1","reason2"],"hint":"one actionable tip"}`

### Level 3: The Cold Visitor (LOCKED — requires payment)
- Persona: "Cold Traffic" — stranger who clicked a Twitter link
- Task: Write your hero section (headline + subtitle + CTA text)
- System prompt: `You are a random person who clicked a link on Twitter and landed on a startup homepage. You have 5 seconds of patience. Read the hero section they wrote. Do you understand what this does in 5 seconds? Would you click the CTA? If the headline is clever but confusing, FAIL. If the CTA is vague, FAIL. If you get it immediately and want to know more, PASS. Respond ONLY with valid JSON: {"verdict":"PASS or FAIL","reasons":["reason1","reason2"],"hint":"one actionable tip"}`

### Level 4: The Investor (LOCKED)
- Persona: "Angel Investor" — no-BS, 5 minutes to decide
- Task: Describe your pricing model and business case
- System prompt: `You are a sharp angel investor evaluating a startup's pricing model and business case. Probe for: Who actually pays this price? What are the unit economics? Is there a moat? FAIL if no clear path to profitability or pricing makes no sense. PASS if coherent and defensible. Respond ONLY with valid JSON: {"verdict":"PASS or FAIL","reasons":["reason1","reason2"],"hint":"one actionable tip"}`

### Level 5: The Crisis (LOCKED)
- Persona: "The Crisis" — angry customer + public pressure
- Task: Write a public response to this tweet: "@[YourApp] just lost 3 hours of my work because of a bug. This is unacceptable. I want a refund."
- System prompt: `You are evaluating a startup founder's crisis communication. A customer publicly tweeted: "[ProductName] just lost 3 hours of my work because of a bug. This is unacceptable. I want a refund." Evaluate their written response: Is it empathetic? Does it take responsibility without being defensive? Is it professional? Would this calm the customer or go viral for wrong reasons? FAIL if defensive, dismissive, or bad PR. PASS if genuinely good crisis communication. Respond ONLY with valid JSON: {"verdict":"PASS or FAIL","reasons":["reason1","reason2"],"hint":"one actionable tip"}`

## Game UI (/play)
Design: Dark (#0a0a0a bg), white text, electric blue accents (#3b82f6)

Flow:
1. On first visit: modal asking for idea name + one-line description → save to localStorage
2. Level selector showing 5 levels (lock icon on 3-5 if not unlocked)
3. "UNLOCK ALL LEVELS — $9" button → for MVP just set localStorage `gauntlet_paid=true` (add TODO: wire to Stripe)
4. Level interface:
   - Level number + persona name + task description
   - Textarea for user input with placeholder hint
   - "Submit to Gauntlet" button
   - Loading: "The gauntlet judges your work..."
   - Result: PASS (green ✓) or FAIL (red ✗) + bullet reasons + hint in monospace
   - Attempt counter visible
   - On PASS: "Proceed to Level X →" button
5. Save all state to localStorage

## Landing Page (/)
- Hero: Large headline "Your idea won't survive." + "Prove me wrong." on second line
- Subtitle: "5 AI judges. No mercy. No hand-holding. Just you, your idea, and the gauntlet."
- CTA button: "Start the Gauntlet →"
- How it works: 3 steps with icons
- Level preview: 5 cards showing persona + task (locked ones show padlock)
- Leaderboard: seed with 5 fake entries
  ```
  { idea: "AI meal planner for athletes", levels: 5, attempts: 12, date: "Feb 2026" }
  { idea: "B2B expense tracking for freelancers", levels: 5, attempts: 8, date: "Feb 2026" }
  { idea: "Async standup tool for remote teams", levels: 4, attempts: 15, date: "Feb 2026" }
  { idea: "Micro-SaaS for Notion power users", levels: 3, attempts: 6, date: "Feb 2026" }
  { idea: "Creator invoice automation", levels: 5, attempts: 21, date: "Feb 2026" }
  ```
- Footer: "Built by Vanwida" → links to aistudios.pro

## Validation Report
After passing all 5 levels show /report page with all 5 answers compiled cleanly.
"Copy report link" button. Save to localStorage with unique ID.

## .env.local
```
GOOGLE_AI_API_KEY=AIzaSyAhGKdlwj0WHbcC7bqhKugVBM3ES41mVOg
```

## Logo
Use `/public/logo.png` in the navbar (already exists).

## After building
1. `npm run build` — fix ALL TypeScript errors until it passes clean
2. `git add -a && git commit -m "feat: complete Gauntlet build"`
3. `git push origin main`
4. Run: `openclaw system event --text "Gauntlet build complete and pushed to GitHub. Ready for Vercel deploy." --mode now`
