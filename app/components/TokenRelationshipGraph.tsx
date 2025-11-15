'use client';

import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface Token {
  _id: string;
  symbol: string;
  name: string;
  chain: string;
  type: string;
  metadata: {
    isCanonical: boolean;
  };
}

interface TokenRelationshipGraphProps {
  currentToken: Token;
  canonicalToken?: Token;
  relatedTokens: Token[];
  groupedByType: Record<string, Token[]>;
}

const nodeColors = {
  CANONICAL: { bg: '#3b82f6', border: '#1e40af', text: '#ffffff' },
  WRAPPED: { bg: '#10b981', border: '#047857', text: '#ffffff' },
  BRIDGED: { bg: '#f59e0b', border: '#d97706', text: '#ffffff' },
  DERIVATIVE: { bg: '#8b5cf6', border: '#6d28d9', text: '#ffffff' },
  SYNTHETIC: { bg: '#ec4899', border: '#be185d', text: '#ffffff' },
  CURRENT: { bg: '#06b6d4', border: '#0e7490', text: '#ffffff' },
};

export default function TokenRelationshipGraph({
  currentToken,
  canonicalToken,
  relatedTokens,
  groupedByType,
}: TokenRelationshipGraphProps) {
  const createNodes = useMemo(() => {
    const nodes: Node[] = [];
    let yOffset = 0;
    const spacing = 120;
    const horizontalSpacing = 250;

    if (canonicalToken && canonicalToken._id !== currentToken._id) {
      nodes.push({
        id: canonicalToken._id,
        type: 'default',
        position: { x: 400, y: 50 },
        data: {
          label: (
            <div className="px-4 py-3 text-center">
              <div className="font-bold text-lg">{canonicalToken.symbol}</div>
              <div className="text-xs opacity-90 mt-1">{canonicalToken.chain}</div>
              <div className="text-xs opacity-75 mt-1">⭐ CANONICAL</div>
            </div>
          ),
        },
        style: {
          background: nodeColors.CANONICAL.bg,
          color: nodeColors.CANONICAL.text,
          border: `2px solid ${nodeColors.CANONICAL.border}`,
          borderRadius: '12px',
          width: 180,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        },
      });
      yOffset = 200;
    }

    nodes.push({
      id: currentToken._id,
      type: 'default',
      position: { x: 400, y: canonicalToken && canonicalToken._id !== currentToken._id ? yOffset : 50 },
      data: {
        label: (
          <div className="px-4 py-3 text-center">
            <div className="font-bold text-lg">{currentToken.symbol}</div>
            <div className="text-xs opacity-90 mt-1">{currentToken.chain}</div>
            <div className="text-xs opacity-75 mt-1">{currentToken.type}</div>
            <div className="text-xs font-bold mt-1">← YOU ARE HERE</div>
          </div>
        ),
      },
      style: {
        background: nodeColors.CURRENT.bg,
        color: nodeColors.CURRENT.text,
        border: `3px solid ${nodeColors.CURRENT.border}`,
        borderRadius: '12px',
        width: 180,
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.2)',
      },
    });

    yOffset += spacing;

    Object.entries(groupedByType).forEach(([type, tokens], typeIndex) => {
      const typeTokens = tokens.filter((t: Token) => t._id !== currentToken._id);
      if (typeTokens.length === 0) return;

      const startX = 400 - ((typeTokens.length - 1) * horizontalSpacing) / 2;

      typeTokens.forEach((token: Token, index: number) => {
        const color = nodeColors[type as keyof typeof nodeColors] || nodeColors.WRAPPED;
        nodes.push({
          id: token._id,
          type: 'default',
          position: { x: startX + index * horizontalSpacing, y: yOffset },
          data: {
            label: (
              <div className="px-4 py-2 text-center">
                <div className="font-bold">{token.symbol}</div>
                <div className="text-xs opacity-90 mt-1">{token.chain}</div>
                <div className="text-xs opacity-75 mt-0.5">{type}</div>
              </div>
            ),
          },
          style: {
            background: color.bg,
            color: color.text,
            border: `2px solid ${color.border}`,
            borderRadius: '12px',
            width: 160,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          },
        });
      });

      yOffset += spacing;
    });

    return nodes;
  }, [currentToken, canonicalToken, groupedByType]);

  const createEdges = useMemo(() => {
    const edges: Edge[] = [];

    if (canonicalToken && canonicalToken._id !== currentToken._id) {
      edges.push({
        id: `e-${canonicalToken._id}-${currentToken._id}`,
        source: canonicalToken._id,
        target: currentToken._id,
        type: ConnectionLineType.SmoothStep,
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 3 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
      });

      relatedTokens.forEach((token) => {
        if (token._id !== currentToken._id) {
          edges.push({
            id: `e-${canonicalToken._id}-${token._id}`,
            source: canonicalToken._id,
            target: token._id,
            type: ConnectionLineType.SmoothStep,
            style: { stroke: '#94a3b8', strokeWidth: 2, opacity: 0.6 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
          });
        }
      });
    } else {
      relatedTokens.forEach((token) => {
        edges.push({
          id: `e-${currentToken._id}-${token._id}`,
          source: currentToken._id,
          target: token._id,
          type: ConnectionLineType.SmoothStep,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
        });
      });
    }

    return edges;
  }, [currentToken, canonicalToken, relatedTokens]);

  const [nodes] = useNodesState(createNodes);
  const [edges] = useEdgesState(createEdges);

  return (
    <div className="w-full h-[600px] bg-neutral-950 rounded-lg border border-neutral-800 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        attributionPosition="bottom-left"
        minZoom={0.5}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background color="#262626" gap={16} />
        <Controls className="bg-neutral-900 rounded-lg shadow-lg border border-neutral-800 [&_button]:bg-neutral-800 [&_button]:border-neutral-700 [&_button]:text-neutral-200 hover:[&_button]:bg-neutral-700" />
        <MiniMap
          className="bg-neutral-900 rounded-lg shadow-lg border border-neutral-800"
          nodeColor={(node) => {
            if (node.id === currentToken._id) return nodeColors.CURRENT.bg;
            if (canonicalToken && node.id === canonicalToken._id) return nodeColors.CANONICAL.bg;
            return '#525252';
          }}
          maskColor="rgba(0, 0, 0, 0.5)"
        />
      </ReactFlow>
    </div>
  );
}
