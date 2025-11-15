import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Family from '@/lib/models/Family';
import Token from '@/lib/models/Token';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;

    // Build filter query
    const filter: any = {};

    // Filter by baseAsset
    const baseAsset = searchParams.get('baseAsset');
    if (baseAsset) {
      filter.baseAsset = { $regex: baseAsset, $options: 'i' };
    }

    // Pagination
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = parseInt(searchParams.get('skip') || '0');

    // Execute query
    const families = await Family.find(filter)
      .sort({ totalVariants: -1, baseAsset: 1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Get total count
    const total = await Family.countDocuments(filter);

    // Enrich with canonical token info
    const familiesWithDetails = await Promise.all(
      families.map(async (family) => {
        let canonicalToken = null;
        if (family.canonicalTokenId) {
          canonicalToken = await Token.findById(family.canonicalTokenId)
            .select('symbol name chain contractAddress')
            .lean();
        }

        return {
          ...family,
          canonicalToken,
        };
      })
    );

    return NextResponse.json({
      families: familiesWithDetails,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + families.length < total,
      },
    });

  } catch (error) {
    console.error('Families fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch families', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
