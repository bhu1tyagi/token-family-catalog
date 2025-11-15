import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import connectDB from '@/lib/mongodb';
import Token from '@/lib/models/Token';
import Family from '@/lib/models/Family';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const tokens = await Token.find().limit(100).lean();
    const families = await Family.find().lean();
    const tokenSummary = tokens.slice(0, 20).map(t => ({
      symbol: t.symbol,
      name: t.name,
      chain: t.chain,
      type: t.type,
      baseAsset: t.baseAsset,
    }));

    const familySummary = families.map(f => ({
      name: f.name,
      baseAsset: f.baseAsset,
      totalVariants: f.totalVariants,
      chains: f.chains,
    }));

    const systemMessage = `You're a helpful assistant for a multi-chain token catalog.

Database Info:
- ${families.length} token families
- ${tokens.length} tokens total
- Chains: ethereum, arbitrum, polygon, optimism, base, bsc

Families:
${familySummary.map(f => `${f.name}: ${f.totalVariants} variants across ${f.chains.length} chains`).join('\n')}

Sample Tokens:
${tokenSummary.map(t => `${t.symbol} (${t.name}) on ${t.chain} - ${t.type}`).join('\n')}

Types:
- CANONICAL: Original token on home chain
- WRAPPED: ERC-20 wrapper (WETH wraps ETH)
- BRIDGED: Token moved to another chain
- DERIVATIVE: Staking/yield tokens (stETH, rETH)
- SYNTHETIC: Algorithmic versions

Keep answers short and helpful. If you're not sure, just say so.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'Hmm, I couldn\'t generate a response. Try again?';

    return NextResponse.json({
      response: aiResponse,
      usage: {
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens,
      },
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process AI request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
