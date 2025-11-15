'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import FamilyTreeVisualization from '@/app/components/FamilyTreeVisualization';

interface Token {
  _id: string;
  symbol: string;
  name: string;
  chain: string;
  contractAddress: string;
  type: string;
  metadata: {
    isCanonical: boolean;
    bridgeProtocol?: string;
    wrappingProtocol?: string;
  };
}

interface Family {
  _id: string;
  familyId: string;
  baseAsset: string;
  name: string;
  description: string;
  totalVariants: number;
  chains: string[];
  canonicalToken?: Token;
}

interface FamilyDetailData {
  family: Family;
  tokens: Token[];
  groupedByType: Record<string, Token[]>;
  groupedByChain: Record<string, Token[]>;
  stats: {
    totalTokens: number;
    byType: Record<string, number>;
    byChain: Record<string, number>;
    chains: number;
  };
}

const TYPE_COLORS: Record<string, string> = {
  CANONICAL: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  WRAPPED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  BRIDGED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  DERIVATIVE: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  SYNTHETIC: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

export default function FamilyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<FamilyDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'type' | 'chain'>('type');

  useEffect(() => {
    fetchFamilyDetail();
  }, [resolvedParams.id]);

  const fetchFamilyDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/families/${resolvedParams.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch family details');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-neutral-700 border-t-blue-500"></div>
          <p className="mt-4 text-neutral-400 text-sm">Loading family details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-base">{error || 'Family not found'}</p>
          <Link href="/families" className="mt-4 inline-block text-blue-400 hover:text-blue-300 text-sm">
            ← Back to Families
          </Link>
        </div>
      </div>
    );
  }

  const { family, tokens, groupedByType, groupedByChain, stats } = data;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/families" className="text-neutral-400 hover:text-neutral-200 mb-2 inline-block text-sm">
            ← Back to Families
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-neutral-100">{family.name}</h1>
            <span className="px-2.5 py-1 text-xs font-medium bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
              {family.baseAsset}
            </span>
          </div>
          <p className="mt-2 text-neutral-400 text-sm">{family.description}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
            <p className="text-2xl font-bold text-neutral-100">{stats.totalTokens}</p>
            <p className="text-xs text-neutral-400 mt-1">Total Tokens</p>
          </div>
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
            <p className="text-2xl font-bold text-neutral-100">{stats.chains}</p>
            <p className="text-xs text-neutral-400 mt-1">Chains</p>
          </div>
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
            <p className="text-2xl font-bold text-neutral-100">
              {Object.keys(stats.byType).length}
            </p>
            <p className="text-xs text-neutral-400 mt-1">Token Types</p>
          </div>
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
            <p className="text-2xl font-bold text-neutral-100">
              {family.canonicalToken ? '1' : '0'}
            </p>
            <p className="text-xs text-neutral-400 mt-1">Canonical</p>
          </div>
        </div>

        {family.canonicalToken && (
          <div className="bg-blue-500/5 rounded-lg border border-blue-500/20 p-5 mb-6">
            <h2 className="text-base font-semibold text-neutral-100 mb-3">
              Canonical Token (Root Asset)
            </h2>
            <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-neutral-100">
                    {family.canonicalToken.symbol}
                  </p>
                  <p className="text-neutral-400 text-sm mt-1">{family.canonicalToken.name}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-neutral-500">
                      {family.canonicalToken.chain.charAt(0).toUpperCase() +
                        family.canonicalToken.chain.slice(1)}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded border ${TYPE_COLORS[family.canonicalToken.type]
                        }`}
                    >
                      {family.canonicalToken.type}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/tokens/${family.canonicalToken._id}`}
                  className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-5 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-neutral-100">All Variants</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('type')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === 'type'
                    ? 'bg-blue-500 text-white'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700'
                  }`}
              >
                By Type
              </button>
              <button
                onClick={() => setViewMode('chain')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === 'chain'
                    ? 'bg-blue-500 text-white'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700'
                  }`}
              >
                By Chain
              </button>
            </div>
          </div>

          {viewMode === 'type' && (
            <div className="space-y-6">
              {Object.entries(groupedByType).map(([type, typeTokens]) => (
                <div key={type}>
                  <h3 className="font-semibold text-neutral-100 mb-3 flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded border ${TYPE_COLORS[type] || 'bg-neutral-800 text-neutral-400 border-neutral-700'
                        }`}
                    >
                      {type}
                    </span>
                    <span className="text-sm text-neutral-400">
                      ({typeTokens.length} token{typeTokens.length !== 1 ? 's' : ''})
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {typeTokens.map((token) => (
                      <Link
                        key={token._id}
                        href={`/tokens/${token._id}`}
                        className="block p-3 border border-neutral-800 rounded-lg hover:border-neutral-700 hover:bg-neutral-800/50 transition-all"
                      >
                        <p className="font-semibold text-neutral-100 text-sm">{token.symbol}</p>
                        <p className="text-xs text-neutral-400 mt-1">{token.name}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-neutral-500">
                            {token.chain.charAt(0).toUpperCase() + token.chain.slice(1)}
                          </span>
                          {(token.metadata.bridgeProtocol || token.metadata.wrappingProtocol) && (
                            <span className="text-xs text-neutral-500">
                              {token.metadata.bridgeProtocol || token.metadata.wrappingProtocol}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'chain' && (
            <div className="space-y-6">
              {Object.entries(groupedByChain).map(([chain, chainTokens]) => (
                <div key={chain}>
                  <h3 className="font-semibold text-neutral-100 mb-3 text-base">
                    {chain.charAt(0).toUpperCase() + chain.slice(1)}
                    <span className="text-sm text-neutral-400 ml-3 font-normal">
                      ({chainTokens.length} token{chainTokens.length !== 1 ? 's' : ''})
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {chainTokens.map((token) => (
                      <Link
                        key={token._id}
                        href={`/tokens/${token._id}`}
                        className="block p-3 border border-neutral-800 rounded-lg hover:border-neutral-700 hover:bg-neutral-800/50 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-neutral-100 text-sm">{token.symbol}</p>
                            <p className="text-xs text-neutral-400 mt-1">{token.name}</p>
                          </div>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded border ${TYPE_COLORS[token.type]
                              }`}
                          >
                            {token.type}
                          </span>
                        </div>
                        {(token.metadata.bridgeProtocol || token.metadata.wrappingProtocol) && (
                          <p className="text-xs text-neutral-500 mt-2">
                            {token.metadata.bridgeProtocol || token.metadata.wrappingProtocol}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <FamilyTreeVisualization tokens={tokens} familyName={family.name} />
      </main>
    </div>
  );
}
