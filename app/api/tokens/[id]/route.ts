import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/lib/models/Token';
import Family from '@/lib/models/Family';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid token ID format' },
        { status: 400 }
      );
    }

    const token = await Token.findById(id).lean();

    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }

    const family = await Family.findOne({ familyId: token.familyId }).lean();

    if (!family) {
      return NextResponse.json(
        { error: 'Family not found for this token' },
        { status: 404 }
      );
    }

    const relatedTokens = await Token.find({
      familyId: token.familyId,
      _id: { $ne: token._id },
    })
      .sort({ type: 1, chain: 1 })
      .lean();

    let canonicalToken = null;
    if (family.canonicalTokenId) {
      canonicalToken = await Token.findById(family.canonicalTokenId).lean();
    }

    const tokensByType = relatedTokens.reduce((acc: any, t: any) => {
      if (!acc[t.type]) {
        acc[t.type] = [];
      }
      acc[t.type].push(t);
      return acc;
    }, {});

    const tokensByChain = relatedTokens.reduce((acc: any, t: any) => {
      if (!acc[t.chain]) {
        acc[t.chain] = [];
      }
      acc[t.chain].push(t);
      return acc;
    }, {});

    return NextResponse.json({
      token,
      family: {
        ...family,
        canonicalToken,
      },
      relatedTokens,
      groupedByType: tokensByType,
      groupedByChain: tokensByChain,
      stats: {
        totalVariants: family.totalVariants,
        chains: family.chains.length,
        types: Object.keys(tokensByType).length + 1, // +1 for current token
      },
    });

  } catch (error) {
    console.error('Token detail fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token details', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
