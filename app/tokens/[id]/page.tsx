'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import TokenRelationshipGraph from '@/app/components/TokenRelationshipGraph';

interface Token {
  _id: string;
  symbol: string;
  name: string;
  chain: string;
  contractAddress: string;
  decimals: number;
  type: string;
  baseAsset: string;
  metadata: {
    isCanonical: boolean;
    bridgeProtocol?: string;
    wrappingProtocol?: string;
  };
}

interface Family {
  _id: string;
  familyId: string;
  name: string;
  description: string;
  baseAsset: string;
  canonicalToken?: Token;
}

interface TokenDetailData {
  token: Token;
  family: Family;
  relatedTokens: Token[];
  groupedByType: Record<string, Token[]>;
  groupedByChain: Record<string, Token[]>;
  stats: {
    totalVariants: number;
    chains: number;
    types: number;
  };
}

const TYPE_COLORS: Record<string, string> = {
  CANONICAL: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  WRAPPED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  BRIDGED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  DERIVATIVE: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  SYNTHETIC: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

export default function TokenDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<TokenDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTokenDetail();
  }, [resolvedParams.id]);

  const fetchTokenDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/tokens/${resolvedParams.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch token details');
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
          <p className="mt-4 text-neutral-400 text-sm">Loading token details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-base">{error || 'Token not found'}</p>
          <Link href="/" className="mt-4 inline-block text-blue-400 hover:text-blue-300 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const { token, family, relatedTokens, groupedByType, groupedByChain, stats } = data;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="text-neutral-400 hover:text-neutral-200 mb-2 inline-block text-sm">
            ← Back to Catalog
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-neutral-100">{token.symbol}</h1>
            <span
              className={`px-2.5 py-1 text-xs font-medium rounded border ${TYPE_COLORS[token.type] || 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}
            >
              {token.type}
            </span>
          </div>
          <p className="mt-2 text-neutral-400 text-sm">{token.name}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-5">
              <h2 className="text-base font-semibold text-neutral-100 mb-4">Token Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-neutral-400">Chain</label>
                  <p className="mt-1 text-neutral-100 text-sm">
                    {token.chain.charAt(0).toUpperCase() + token.chain.slice(1)}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-400">Contract Address</label>
                  <p className="mt-1 text-neutral-100 font-mono text-xs break-all">
                    {token.contractAddress}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-400">Decimals</label>
                  <p className="mt-1 text-neutral-100 text-sm">{token.decimals}</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-400">Base Asset</label>
                  <p className="mt-1 text-neutral-100 text-sm">{token.baseAsset}</p>
                </div>

                {token.metadata.bridgeProtocol && (
                  <div>
                    <label className="text-xs font-medium text-neutral-400">Bridge Protocol</label>
                    <p className="mt-1 text-neutral-100 text-sm">{token.metadata.bridgeProtocol}</p>
                  </div>
                )}

                {token.metadata.wrappingProtocol && (
                  <div>
                    <label className="text-xs font-medium text-neutral-400">Wrapping Protocol</label>
                    <p className="mt-1 text-neutral-100 text-sm">{token.metadata.wrappingProtocol}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 bg-neutral-900 rounded-lg border border-neutral-800 p-5">
              <h2 className="text-base font-semibold text-neutral-100 mb-2">Part of Family</h2>
              <Link
                href={`/families/${family.familyId}`}
                className="text-lg font-semibold text-blue-400 hover:text-blue-300"
              >
                {family.name}
              </Link>
              <p className="mt-2 text-xs text-neutral-400">{family.description}</p>

              <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-neutral-800">
                <div>
                  <p className="text-xl font-bold text-neutral-100">{stats.totalVariants}</p>
                  <p className="text-xs text-neutral-400">Variants</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-neutral-100">{stats.chains}</p>
                  <p className="text-xs text-neutral-400">Chains</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-neutral-100">{stats.types}</p>
                  <p className="text-xs text-neutral-400">Types</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {family.canonicalToken && (
              <div className="bg-blue-500/5 rounded-lg border border-blue-500/20 p-5 mb-4">
                <h2 className="text-base font-semibold text-neutral-100 mb-3">
                  Canonical Token (Root)
                </h2>
                <div className="bg-neutral-900 rounded-lg p-4 border border-blue-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg text-neutral-100">{family.canonicalToken.symbol}</p>
                      <p className="text-sm text-neutral-400">{family.canonicalToken.name}</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {family.canonicalToken.chain.charAt(0).toUpperCase() +
                          family.canonicalToken.chain.slice(1)}
                      </p>
                    </div>
                    {family.canonicalToken._id !== token._id && (
                      <Link
                        href={`/tokens/${family.canonicalToken._id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        View →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-5 mb-4">
              <h2 className="text-base font-semibold text-neutral-100 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Token Relationship Map
              </h2>
              <TokenRelationshipGraph
                currentToken={token}
                canonicalToken={family.canonicalToken}
                relatedTokens={relatedTokens}
                groupedByType={groupedByType}
              />
            </div>

            <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-5 mb-4">
              <h2 className="text-base font-semibold text-neutral-100 mb-4">
                Related Tokens by Type
              </h2>

              {Object.keys(groupedByType).length === 0 ? (
                <p className="text-neutral-400 text-sm">No related tokens in other types.</p>
              ) : (
                <div className="space-y-5">
                  {Object.entries(groupedByType).map(([type, tokens]) => (
                    <div key={type}>
                      <h3 className="font-medium text-neutral-100 mb-3 flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded border ${TYPE_COLORS[type] || 'bg-neutral-800 text-neutral-400 border-neutral-700'
                            }`}
                        >
                          {type}
                        </span>
                        <span className="text-sm text-neutral-400">({tokens.length})</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tokens.map((t: Token) => (
                          <Link
                            key={t._id}
                            href={`/tokens/${t._id}`}
                            className="block p-3 border border-neutral-800 rounded-lg hover:border-neutral-700 hover:bg-neutral-800/50 transition-all"
                          >
                            <p className="font-medium text-neutral-100 text-sm">{t.symbol}</p>
                            <p className="text-xs text-neutral-400">{t.name}</p>
                            <p className="text-xs text-neutral-500 mt-1">
                              {t.chain.charAt(0).toUpperCase() + t.chain.slice(1)}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-5">
              <h2 className="text-base font-semibold text-neutral-100 mb-4">
                Related Tokens by Chain
              </h2>

              {Object.keys(groupedByChain).length === 0 ? (
                <p className="text-neutral-400 text-sm">No related tokens on other chains.</p>
              ) : (
                <div className="space-y-5">
                  {Object.entries(groupedByChain).map(([chain, tokens]) => (
                    <div key={chain}>
                      <h3 className="font-medium text-neutral-100 mb-3 text-sm">
                        {chain.charAt(0).toUpperCase() + chain.slice(1)}
                        <span className="text-xs text-neutral-400 ml-2">({tokens.length})</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tokens.map((t: Token) => (
                          <Link
                            key={t._id}
                            href={`/tokens/${t._id}`}
                            className="block p-3 border border-neutral-800 rounded-lg hover:border-neutral-700 hover:bg-neutral-800/50 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-neutral-100 text-sm">{t.symbol}</p>
                                <span
                                  className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded border ${TYPE_COLORS[t.type] || 'bg-neutral-800 text-neutral-400 border-neutral-700'
                                    }`}
                                >
                                  {t.type}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
