import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/lib/models/Token';
import Family from '@/lib/models/Family';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;

    const filter: any = {};

    const chain = searchParams.get('chain');
    if (chain) {
      filter.chain = chain;
    }

    const symbol = searchParams.get('symbol');
    if (symbol) {
      filter.symbol = { $regex: symbol, $options: 'i' };
    }

    const type = searchParams.get('type');
    if (type) {
      filter.type = type.toUpperCase();
    }

    const baseAsset = searchParams.get('baseAsset');
    if (baseAsset) {
      filter.baseAsset = { $regex: baseAsset, $options: 'i' };
    }

    const familyId = searchParams.get('familyId');
    if (familyId) {
      filter.familyId = familyId;
    }

    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = parseInt(searchParams.get('skip') || '0');

    const tokens = await Token.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Token.countDocuments(filter);

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
