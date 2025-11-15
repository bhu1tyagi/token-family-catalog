import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Family from '@/lib/models/Family';
import Token, { TokenType } from '@/lib/models/Token';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: familyId } = await params;

    // Get the family
    const family = await Family.findOne({ familyId }).lean();

    if (!family) {
      return NextResponse.json(
        { error: 'Family not found' },
        { status: 404 }
      );
    }

    // Get all tokens in this family
    const allTokens = await Token.find({ familyId })
      .sort({ type: 1, chain: 1 })
      .lean();

    // Get canonical token
    let canonicalToken = null;
    if (family.canonicalTokenId) {
      canonicalToken = await Token.findById(family.canonicalTokenId).lean();
    }

    // Group tokens by type
    const tokensByType = allTokens.reduce((acc: any, token: any) => {
      if (!acc[token.type]) {
        acc[token.type] = [];
      }
      acc[token.type].push(token);
      return acc;
    }, {});

    // Group tokens by chain
    const tokensByChain = allTokens.reduce((acc: any, token: any) => {
      if (!acc[token.chain]) {
        acc[token.chain] = [];
      }
      acc[token.chain].push(token);
      return acc;
    }, {});

    // Build relationship graph data for visualization
    const graphData = {
      nodes: allTokens.map((token: any) => ({
        id: token._id.toString(),
        label: `${token.symbol} (${token.chain})`,
        type: token.type,
        chain: token.chain,
        isCanonical: token.metadata.isCanonical,
      })),
      edges: [] as any[],
    };

    // Create edges from canonical to other tokens
    if (canonicalToken) {
      allTokens.forEach((token: any) => {
        if (token._id.toString() !== canonicalToken._id.toString()) {
          graphData.edges.push({
            from: canonicalToken._id.toString(),
            to: token._id.toString(),
            type: token.type,
          });
        }
      });
    }

    // Statistics
    const stats = {
      totalTokens: allTokens.length,
      byType: Object.keys(tokensByType).reduce((acc: any, type) => {
        acc[type] = tokensByType[type].length;
        return acc;
      }, {}),
      byChain: Object.keys(tokensByChain).reduce((acc: any, chain) => {
        acc[chain] = tokensByChain[chain].length;
        return acc;
      }, {}),
      chains: family.chains.length,
    };

    return NextResponse.json({
      family: {
        ...family,
        canonicalToken,
      },
      tokens: allTokens,
      groupedByType: tokensByType,
      groupedByChain: tokensByChain,
      graphData,
      stats,
    });

  } catch (error) {
    console.error('Family detail fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch family details', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
