import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token, { IToken, TokenType } from '@/lib/models/Token';
import Family, { IFamily } from '@/lib/models/Family';
import Chain from '@/lib/models/Chain';
import crypto from 'crypto';

// Generate deterministic family ID from base asset
function generateFamilyId(baseAsset: string): string {
  return crypto.createHash('sha256').update(baseAsset.toUpperCase()).digest('hex');
}

// Determine family name from base asset
function getFamilyName(baseAsset: string): string {
  const nameMap: Record<string, string> = {
    'ETH': 'Ethereum Family',
    'BTC': 'Bitcoin Family',
    'SOL': 'Solana Family',
    'USDC': 'USD Coin Family',
    'USDT': 'Tether Family',
    'DAI': 'DAI Family',
    'LINK': 'Chainlink Family',
    'UNI': 'Uniswap Family',
    'AAVE': 'Aave Family',
  };
  return nameMap[baseAsset.toUpperCase()] || `${baseAsset} Family`;
}

// Generate family description
function getFamilyDescription(baseAsset: string): string {
  const descMap: Record<string, string> = {
    'ETH': 'All variants of Ethereum including wrapped, staked, and bridged versions across multiple chains.',
    'BTC': 'Native Bitcoin and all wrapped/bridged variants across multiple blockchains.',
    'SOL': 'Native Solana and all wrapped/bridged variants across multiple blockchains.',
    'USDC': 'Circle\'s USD Coin across multiple chains, including native and bridged versions.',
    'USDT': 'Tether\'s USD stablecoin across multiple blockchains.',
    'DAI': 'MakerDAO\'s decentralized stablecoin and its derivatives.',
    'LINK': 'Chainlink token across multiple chains.',
    'UNI': 'Uniswap governance token across multiple chains.',
    'AAVE': 'Aave governance token across multiple chains.',
  };
  return descMap[baseAsset.toUpperCase()] || `All variants of ${baseAsset} across multiple chains.`;
}

interface TokenInput {
  symbol: string;
  name: string;
  chain: string;
  contractAddress: string;
  decimals: number;
  baseAsset: string;
  type: TokenType;
  imageUrl: string;
  metadata: {
    isCanonical: boolean;
    bridgeProtocol?: string;
    wrappingProtocol?: string;
  };
}

interface IngestRequest {
  tokens: TokenInput[];
  chains?: Array<{
    chainId: string;
    name: string;
    nativeCurrency: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body: IngestRequest = await request.json();

    if (!body.tokens || !Array.isArray(body.tokens)) {
      return NextResponse.json(
        { error: 'Invalid request: tokens array is required' },
        { status: 400 }
      );
    }

    // First, insert chains if provided
    if (body.chains && Array.isArray(body.chains)) {
      for (const chainData of body.chains) {
        await Chain.findOneAndUpdate(
          { chainId: chainData.chainId },
          chainData,
          { upsert: true, new: true }
        );
      }
    }

    let inserted = 0;
    let updated = 0;
    const familiesProcessed = new Set<string>();

    // Process each token
    for (const tokenData of body.tokens) {
      // Generate family ID
      const familyId = generateFamilyId(tokenData.baseAsset);
      familiesProcessed.add(familyId);

      // Create or update token
      const tokenWithFamily = {
        ...tokenData,
        familyId,
      };

      const existingToken = await Token.findOne({
        chain: tokenData.chain,
        contractAddress: tokenData.contractAddress,
      });

      if (existingToken) {
        await Token.updateOne(
          { _id: existingToken._id },
          { $set: tokenWithFamily }
        );
        updated++;
      } else {
        await Token.create(tokenWithFamily);
        inserted++;
      }
    }

    // Update or create families
    const familyIds = Array.from(familiesProcessed);

    for (const familyId of familyIds) {
      // Get all tokens in this family
      const familyTokens = await Token.find({ familyId });

      if (familyTokens.length === 0) continue;

      // Find canonical token
      const canonicalToken = familyTokens.find(
        (t) => t.metadata.isCanonical || t.type === TokenType.CANONICAL
      );

      // Get unique chains
      const chains = [...new Set(familyTokens.map((t) => t.chain))];

      // Get base asset from first token
      const baseAsset = familyTokens[0].baseAsset;

      // Get imageUrl from canonical token or first token
      const imageUrl = canonicalToken?.imageUrl || familyTokens[0].imageUrl;

      // Create or update family
      const familyData = {
        familyId,
        baseAsset,
        canonicalTokenId: canonicalToken?._id || null,
        name: getFamilyName(baseAsset),
        description: getFamilyDescription(baseAsset),
        imageUrl,
        totalVariants: familyTokens.length,
        chains,
      };

      await Family.findOneAndUpdate(
        { familyId },
        familyData,
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({
      success: true,
      inserted,
      updated,
      families: familyIds,
      message: `Successfully processed ${inserted + updated} tokens across ${familyIds.length} families`,
    });

  } catch (error) {
    console.error('Ingest error:', error);
    return NextResponse.json(
      { error: 'Failed to ingest tokens', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
