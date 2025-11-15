'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AIChat from '../components/AIChat';

interface Family {
  _id: string;
  familyId: string;
  baseAsset: string;
  name: string;
  description: string;
  imageUrl: string;
  totalVariants: number;
  chains: string[];
  canonicalToken?: {
    symbol: string;
    name: string;
    chain: string;
  };
}

const FAMILY_GRADIENTS: Record<string, string> = {
  'ETH': 'from-purple-500 to-blue-600',
  'BTC': 'from-orange-500 to-yellow-600',
  'USDC': 'from-blue-500 to-cyan-600',
  'USDT': 'from-green-500 to-emerald-600',
  'DAI': 'from-amber-500 to-yellow-600',
  'LINK': 'from-blue-600 to-indigo-700',
  'UNI': 'from-pink-500 to-rose-600',
  'AAVE': 'from-purple-600 to-indigo-700',
};

export default function FamiliesPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/families');
      const data = await response.json();
      setFamilies(data.families);
    } catch (error) {
      console.error('Failed to fetch families:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200 mb-4 text-sm font-medium group transition-all"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Catalog
          </Link>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-neutral-100">
                Token Families
              </h1>
              <p className="text-neutral-400 text-sm">
                Browse {families.length} token families across chains
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && (
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-neutral-700 border-t-blue-500 mb-4"></div>
              <p className="text-neutral-400 text-sm">Loading...</p>
            </div>
          </div>
        )}

        {/* Families Grid */}
        {!loading && families.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {families.map((family, index) => {
              return (
                <Link
                  key={family.familyId}
                  href={`/families/${family.familyId}`}
                  className="group bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden hover:border-neutral-700 hover:bg-neutral-800/50 transition-all duration-200"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Header */}
                  <div className="relative p-5 border-b border-neutral-800 bg-neutral-800/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="inline-block px-2.5 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded border border-blue-500/20 mb-2">
                          {family.baseAsset}
                        </span>
                        <h2 className="text-lg font-semibold text-neutral-100">{family.name}</h2>
                      </div>
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-800/50 flex items-center justify-center">
                        <Image
                          src={family.imageUrl || '/tokens/default.png'}
                          alt={family.baseAsset}
                          width={48}
                          height={48}
                          className="object-contain p-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <p className="text-sm text-neutral-400 mb-4 line-clamp-2 min-h-[40px]">
                      {family.description}
                    </p>

                    {family.canonicalToken && (
                      <div className="mb-4 p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
                        <p className="text-xs text-blue-400 font-medium mb-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          CANONICAL
                        </p>
                        <p className="font-semibold text-neutral-100 text-base">
                          {family.canonicalToken.symbol}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          on {family.canonicalToken.chain.charAt(0).toUpperCase() +
                            family.canonicalToken.chain.slice(1)}
                        </p>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-neutral-800 rounded-lg p-3 border border-neutral-700">
                        <p className="text-xl font-bold text-neutral-100">
                          {family.totalVariants}
                        </p>
                        <p className="text-xs text-neutral-400 font-medium">Variants</p>
                      </div>
                      <div className="bg-neutral-800 rounded-lg p-3 border border-neutral-700">
                        <p className="text-xl font-bold text-neutral-100">{family.chains.length}</p>
                        <p className="text-xs text-neutral-400 font-medium">Chains</p>
                      </div>
                    </div>

                    {/* Chains List */}
                    <div className="flex flex-wrap gap-1.5">
                      {family.chains.slice(0, 3).map((chain) => (
                        <span
                          key={chain}
                          className="px-2 py-0.5 text-xs bg-neutral-800 text-neutral-300 rounded border border-neutral-700 font-medium"
                        >
                          {chain}
                        </span>
                      ))}
                      {family.chains.length > 3 && (
                        <span className="px-2 py-0.5 text-xs bg-blue-500/10 text-blue-400 rounded border border-blue-500/20 font-medium">
                          +{family.chains.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-end">
                      <span className="text-sm text-blue-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        View Details
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && families.length === 0 && (
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
              <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-neutral-200 mb-2">No families yet</h3>
            <p className="text-neutral-400 text-sm">
              No token families available right now
            </p>
          </div>
        )}
      </main>

      <AIChat />
    </div>
  );
}
