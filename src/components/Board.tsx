'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import SourceCard from './SourceCard';
import ModernCard from './ModernCard';
import RedStringEdge from './RedStringEdge';
import EvidencePanel from './EvidencePanel';
import type { Connection, Entity } from '@/lib/types';

const nodeTypes = {
  source: SourceCard,
  modern: ModernCard,
};

const edgeTypes = {
  redString: RedStringEdge,
};

export default function Board() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBoard() {
      try {
        const [entitiesRes, connectionsRes] = await Promise.all([
          fetch('/api/entities'),
          fetch('/api/connections?status=established'),
        ]);
        const entities: Entity[] = await entitiesRes.json();
        const connections: Connection[] = await connectionsRes.json();

        // Layout: source cards on left, modern cards on right
        const sourceEntities = entities.filter(e => e.type === 'source');
        const modernEntities = entities.filter(e => e.type === 'modern');

        // Dedupe modern entities that appear in connections
        const connectedModernIds = new Set(connections.map(c => c.modern_entity_id));
        const connectedSourceIds = new Set(connections.map(c => c.source_entity_id));
        const relevantModern = modernEntities.filter(e => connectedModernIds.has(e.id));
        const relevantSource = sourceEntities.filter(e => connectedSourceIds.has(e.id));

        const sourceNodes: Node[] = relevantSource.map((e, i) => ({
          id: e.id,
          type: 'source',
          position: { x: 50 + (i % 2) * 280, y: 80 + Math.floor(i / 2) * 160 },
          data: { name: e.name, metadata: e.metadata_json, imageUrl: e.image_url },
        }));

        const modernNodes: Node[] = relevantModern.map((e, i) => ({
          id: e.id,
          type: 'modern',
          position: { x: 750 + (i % 2) * 280, y: 80 + Math.floor(i / 2) * 160 },
          data: { name: e.name, metadata: e.metadata_json, imageUrl: e.image_url },
        }));

        const edgeList: Edge[] = connections.map(c => ({
          id: c.id,
          source: c.source_entity_id,
          target: c.modern_entity_id,
          type: 'redString',
          data: { status: c.status, claim: c.claim },
        }));

        setNodes([...sourceNodes, ...modernNodes]);
        setEdges(edgeList);
      } catch (err) {
        console.error('Failed to load board:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBoard();
  }, [setNodes, setEdges]);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedConnection(edge.id);
  }, []);

  // SVG filter for glow effect
  const svgDefs = useMemo(() => (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  ), []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-950">
        <div className="text-zinc-400 text-sm">Loading the board...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative" style={{ background: '#1a1510' }}>
      {svgDefs}

      {/* Cork board texture overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(139, 90, 43, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(139, 90, 43, 0.2) 0%, transparent 50%)`,
        }}
      />

      {/* Desk lamp glow */}
      <div
        className="absolute top-0 left-0 w-96 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 10% 10%, rgba(255, 200, 100, 0.08) 0%, transparent 60%)',
        }}
      />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#3d2e1a" gap={40} size={1} />
        <Controls
          className="!bg-zinc-900 !border-zinc-700 !shadow-lg [&>button]:!bg-zinc-800 [&>button]:!border-zinc-700 [&>button]:!text-zinc-300 [&>button:hover]:!bg-zinc-700"
        />
      </ReactFlow>

      <EvidencePanel
        connectionId={selectedConnection}
        onClose={() => setSelectedConnection(null)}
      />

      {/* Title */}
      <div className="absolute top-4 left-4 z-10">
        <h1
          className="text-2xl text-amber-200/80 font-bold tracking-tight"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          PROPHECY BOARD
        </h1>
        <p className="text-xs text-amber-200/30 mt-1">
          {edges.length} connections · click a red string to view evidence
        </p>
      </div>
    </div>
  );
}
