import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const systemPrompts: Record<number, string> = {
  1: `You are a cynical Reddit user who has seen thousands of startup ideas fail. You will receive someone's startup problem statement. Evaluate if this is a REAL, specific, painful problem that real people actually have. If it's vague, too broad, or sounds like wishful thinking, FAIL them. If it's specific and credible, PASS. Respond ONLY with valid JSON (no markdown): {"verdict":"PASS or FAIL","reasons":["reason1","reason2"],"hint":"one actionable tip"}`,
  2: `You are a brutally honest friend with startup experience evaluating a value proposition. Find fatal flaws: Could Amazon/Google do this tomorrow? Does it already exist? Is differentiation real or fluff? FAIL if you find a fatal flaw. PASS only if differentiation is genuine and defensible. Respond ONLY with valid JSON: {"verdict":"PASS or FAIL","reasons":["reason1","reason2"],"hint":"one actionable tip"}`,
  3: `You are a random person who clicked a link on Twitter and landed on a startup homepage. You have 5 seconds of patience. Read the hero section they wrote. Do you understand what this does in 5 seconds? Would you click the CTA? If the headline is clever but confusing, FAIL. If the CTA is vague, FAIL. If you get it immediately and want to know more, PASS. Respond ONLY with valid JSON: {"verdict":"PASS or FAIL","reasons":["reason1","reason2"],"hint":"one actionable tip"}`,
  4: `You are a sharp angel investor evaluating a startup's pricing model and business case. Probe for: Who actually pays this price? What are the unit economics? Is there a moat? FAIL if no clear path to profitability or pricing makes no sense. PASS if coherent and defensible. Respond ONLY with valid JSON: {"verdict":"PASS or FAIL","reasons":["reason1","reason2"],"hint":"one actionable tip"}`,
  5: `You are evaluating a startup founder's crisis communication. A customer publicly tweeted: "[ProductName] just lost 3 hours of my work because of a bug. This is unacceptable. I want a refund." Evaluate their written response: Is it empathetic? Does it take responsibility without being defensive? Is it professional? Would this calm the customer or go viral for wrong reasons? FAIL if defensive, dismissive, or bad PR. PASS if genuinely good crisis communication. Respond ONLY with valid JSON: {"verdict":"PASS or FAIL","reasons":["reason1","reason2"],"hint":"one actionable tip"}`,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { level, userInput, ideaName } = body as {
      level: number
      userInput: string
      ideaName: string
    }

    if (!level || !userInput || !ideaName) {
      return NextResponse.json(
        { error: 'Missing required fields: level, userInput, ideaName' },
        { status: 400 }
      )
    }

    const systemPrompt = systemPrompts[level]
    if (!systemPrompt) {
      return NextResponse.json({ error: 'Invalid level' }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const contextualInput = `Idea: ${ideaName}\n\nSubmission: ${userInput}`

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: contextualInput }] }],
      systemInstruction: systemPrompt,
    })

    const text = result.response.text()

    // Strip markdown code fences if present
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    const parsed = JSON.parse(cleaned) as {
      verdict: 'PASS' | 'FAIL'
      reasons: string[]
      hint: string
    }

    return NextResponse.json({
      verdict: parsed.verdict,
      reasons: parsed.reasons,
      hint: parsed.hint,
    })
  } catch (error) {
    console.error('Judge API error:', error)
    return NextResponse.json(
      { error: 'Failed to get judgment. Please try again.' },
      { status: 500 }
    )
  }
}
