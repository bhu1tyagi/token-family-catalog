'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Token {
  _id: string;
  symbol: string;
  name: string;
  chain: string;
  type: string;
}

interface FamilyTreeVisualizationProps {
  tokens: Token[];
  familyName: string;
}

const TYPE_COLORS: Record<string, string> = {
  CANONICAL: '#3b82f6',
  WRAPPED: '#10b981',
  BRIDGED: '#f59e0b',
  DERIVATIVE: '#8b5cf6',
  SYNTHETIC: '#ec4899',
};

const CHAIN_COLORS: Record<string, string> = {
  ethereum: '#627eea',
  arbitrum: '#28a0f0',
  polygon: '#8247e5',
  optimism: '#ff0420',
  base: '#0052ff',
  bsc: '#f3ba2f',
};

export default function FamilyTreeVisualization({
  tokens,
  familyName,
}: FamilyTreeVisualizationProps) {
  const typeDistribution = useMemo(() => {
    const distribution = tokens.reduce((acc, token) => {
      acc[token.type] = (acc[token.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([type, count]) => ({
      type,
      count,
      color: TYPE_COLORS[type] || '#94a3b8',
    }));
  }, [tokens]);

  const chainDistribution = useMemo(() => {
    const distribution = tokens.reduce((acc, token) => {
      acc[token.chain] = (acc[token.chain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([chain, count]) => ({
      chain: chain.charAt(0).toUpperCase() + chain.slice(1),
      count,
      color: CHAIN_COLORS[chain] || '#94a3b8',
    }));
  }, [tokens]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-900 px-4 py-2 rounded-lg shadow-lg border border-neutral-800">
          <p className="font-semibold text-neutral-100">{payload[0].name || payload[0].payload.type || payload[0].payload.chain}</p>
          <p className="text-sm text-neutral-400">
            {payload[0].value} {payload[0].value === 1 ? 'token' : 'tokens'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-5">
        <h3 className="text-base font-semibold text-neutral-100 mb-5 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Distribution by Type
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
              <XAxis
                dataKey="type"
                tick={{ fill: '#a3a3a3', fontSize: 12 }}
                axisLine={{ stroke: '#525252' }}
              />
              <YAxis
                tick={{ fill: '#a3a3a3', fontSize: 12 }}
                axisLine={{ stroke: '#525252' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {typeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, percent }) =>
                  `${type} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {typeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-5">
        <h3 className="text-base font-semibold text-neutral-100 mb-5 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Distribution by Chain
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chainDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
              <XAxis
                dataKey="chain"
                tick={{ fill: '#a3a3a3', fontSize: 12 }}
                axisLine={{ stroke: '#525252' }}
              />
              <YAxis
                tick={{ fill: '#a3a3a3', fontSize: 12 }}
                axisLine={{ stroke: '#525252' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {chainDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chainDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ chain, percent }) =>
                  `${chain} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {chainDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-5">
        <h3 className="text-base font-semibold text-neutral-100 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          All {familyName} Tokens
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tokens.map((token) => (
            <div
              key={token._id}
              className="bg-neutral-800 rounded-lg p-3 border border-neutral-700 hover:border-neutral-600 hover:bg-neutral-700/50 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: TYPE_COLORS[token.type] || '#94a3b8' }}
                  >
                    {token.symbol.substring(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-100 text-sm">{token.symbol}</p>
                    <p className="text-xs text-neutral-400">{token.chain}</p>
                  </div>
                </div>
                <span
                  className="px-2 py-0.5 text-xs font-medium rounded-full text-white"
                  style={{ backgroundColor: TYPE_COLORS[token.type] || '#94a3b8' }}
                >
                  {token.type}
                </span>
              </div>
              <p className="text-xs text-neutral-400 line-clamp-2">{token.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
