'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AIChat from './components/AIChat';

interface Token {
  _id: string;
  symbol: string;
  name: string;
  chain: string;
  type: string;
  baseAsset: string;
  familyId: string;
  familyName: string;
  contractAddress: string;
  imageUrl: string;
}

const TYPE_COLORS: Record<string, string> = {
  CANONICAL: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  WRAPPED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  BRIDGED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  DERIVATIVE: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  SYNTHETIC: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

const CHAIN_COLORS: Record<string, string> = {
  bitcoin: 'bg-orange-500/10 text-orange-400',
  ethereum: 'bg-neutral-800 text-neutral-300',
  solana: 'bg-purple-500/10 text-purple-400',
  arbitrum: 'bg-blue-500/10 text-blue-400',
  polygon: 'bg-violet-500/10 text-violet-400',
  optimism: 'bg-red-500/10 text-red-400',
  base: 'bg-indigo-500/10 text-indigo-400',
  bsc: 'bg-yellow-500/10 text-yellow-400',
};

export default function HomePage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [chainFilter, setChainFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [chains, setChains] = useState<string[]>([]);

  useEffect(() => {
    fetchTokens();
  }, [chainFilter, typeFilter]);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (chainFilter) params.append('chain', chainFilter);
      if (typeFilter) params.append('type', typeFilter);

      const response = await fetch(`/api/tokens?${params.toString()}`);
      const data = await response.json();

      setTokens(data.tokens);

      const uniqueChains = [...new Set(data.tokens.map((t: Token) => t.chain))];
      setChains(uniqueChains.sort());
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTokens = tokens.filter((token) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      token.symbol.toLowerCase().includes(searchLower) ||
      token.name.toLowerCase().includes(searchLower) ||
      token.baseAsset.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h1 className="text-2xl font-semibold text-neutral-100">
                  Token Family Catalog
                </h1>
              </div>
              <p className="text-neutral-400 text-sm ml-12">
                Find and explore tokens across different blockchains
              </p>
            </div>
            <Link
              href="/families"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-lg transition-all duration-200 text-sm font-medium border border-neutral-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Browse Families
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-5 animate-scale-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label
                htmlFor="search"
                className="block text-xs font-medium text-neutral-400 mb-1.5"
              >
                Search
              </label>
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  placeholder="Search tokens..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2.5 pl-10 border border-neutral-800 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500/50 transition-all duration-200 bg-neutral-950 text-neutral-100 placeholder:text-neutral-500 text-sm"
                />
                <svg className="absolute left-3 top-3 w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div>
              <label
                htmlFor="chain"
                className="block text-xs font-medium text-neutral-400 mb-1.5"
              >
                Chain
              </label>
              <select
                id="chain"
                value={chainFilter}
                onChange={(e) => setChainFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-neutral-800 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500/50 transition-all duration-200 bg-neutral-950 cursor-pointer text-neutral-100 text-sm"
              >
                <option value="">All Chains</option>
                {chains.map((chain) => (
                  <option key={chain} value={chain}>
                    {chain.charAt(0).toUpperCase() + chain.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-xs font-medium text-neutral-400 mb-1.5"
              >
                Type
              </label>
              <select
                id="type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-neutral-800 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500/50 transition-all duration-200 bg-neutral-950 cursor-pointer text-neutral-100 text-sm"
              >
                <option value="">All Types</option>
                <option value="CANONICAL">Canonical</option>
                <option value="WRAPPED">Wrapped</option>
                <option value="BRIDGED">Bridged</option>
                <option value="DERIVATIVE">Derivative</option>
                <option value="SYNTHETIC">Synthetic</option>
              </select>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-neutral-800 md:hidden">
            <Link
              href="/families"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-lg transition-all duration-200 text-sm font-medium border border-neutral-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              View Families
            </Link>
          </div>
        </div>

        {!loading && tokens.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-neutral-800 text-neutral-200 rounded-md text-sm font-medium border border-neutral-700">
                {filteredTokens.length}
              </div>
              <p className="text-neutral-400 text-sm">
                {filteredTokens.length === 1 ? 'token' : 'tokens'}
                {filteredTokens.length !== tokens.length && (
                  <span className="text-neutral-500 ml-1">of {tokens.length}</span>
                )}
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-neutral-700 border-t-blue-500 mb-4"></div>
              <p className="text-neutral-400 text-sm">Loading...</p>
            </div>
          </div>
        )}

        {!loading && filteredTokens.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
            {filteredTokens.map((token, index) => (
              <Link
                key={token._id}
                href={`/tokens/${token._id}`}
                className="group bg-neutral-900 rounded-lg border border-neutral-800 p-4 hover:border-neutral-700 hover:bg-neutral-800/50 transition-all duration-200 block"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-800/50 flex items-center justify-center">
                      <Image
                        src={token.imageUrl || '/tokens/default.png'}
                        alt={token.symbol}
                        width={40}
                        height={40}
                        className="object-contain p-1"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-100 text-base group-hover:text-blue-400 transition-colors">
                        {token.symbol}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">{token.baseAsset}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded border transition-all ${TYPE_COLORS[token.type] || 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}
                  >
                    {token.type}
                  </span>
                </div>

                <p className="text-sm text-neutral-400 mb-3 line-clamp-1">
                  {token.name}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-0.5 rounded text-xs font-medium ${CHAIN_COLORS[token.chain] || 'bg-neutral-800 text-neutral-400'
                      }`}>
                      {token.chain.charAt(0).toUpperCase() + token.chain.slice(1)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/families/${token.familyId}`;
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
                  >
                    {token.familyName}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredTokens.length === 0 && (
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-neutral-200 mb-2">Nothing found</h3>
              <p className="text-neutral-400 text-sm mb-6">
                Try changing your filters or search term
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setChainFilter('');
                  setTypeFilter('');
                }}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-lg transition-all duration-200 text-sm font-medium border border-neutral-700"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </main>

      <AIChat />
    </div>
  );
}
