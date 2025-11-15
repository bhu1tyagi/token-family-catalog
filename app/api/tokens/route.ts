import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/lib/models/Token';
import Family from '@/lib/models/Family';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;

    // Build filter query
    const filter: any = {};

    // Filter by chain
    const chain = searchParams.get('chain');
    if (chain) {
      filter.chain = chain;
    }

    // Filter by symbol (case-insensitive partial match)
    const symbol = searchParams.get('symbol');
    if (symbol) {
      filter.symbol = { $regex: symbol, $options: 'i' };
    }

    // Filter by token type
    const type = searchParams.get('type');
    if (type) {
      filter.type = type.toUpperCase();
    }

    // Filter by baseAsset
    const baseAsset = searchParams.get('baseAsset');
    if (baseAsset) {
      filter.baseAsset = { $regex: baseAsset, $options: 'i' };
    }

    // Filter by familyId
    const familyId = searchParams.get('familyId');
    if (familyId) {
      filter.familyId = familyId;
    }

    // Pagination
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = parseInt(searchParams.get('skip') || '0');

    // Execute query
    const tokens = await Token.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Get total count for pagination info
    const total = await Token.countDocuments(filter);

    // Enrich with family info
    const tokensWithFamily = await Promise.all(
      tokens.map(async (token) => {
        const family = await Family.findOne({ familyId: token.familyId }).lean();
        return {
          ...token,
          familyName: family?.name || 'Unknown',
        };
      })
    );

    return NextResponse.json({
      tokens: tokensWithFamily,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + tokens.length < total,
      },
    });

  } catch (error) {
    console.error('Tokens fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tokens', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
