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
      <div className="h-screen w-screen flex items-center justify-center matrix-shell">
        <div className="matrix-panel rounded-xl px-5 py-3 text-sm text-emerald-200/80">Booting board matrix...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative matrix-shell">
      {svgDefs}

      {/* digital rain haze */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 15% 15%, rgba(61, 255, 154, 0.13) 0%, transparent 35%), radial-gradient(circle at 82% 30%, rgba(54, 212, 124, 0.1) 0%, transparent 40%), radial-gradient(circle at 52% 85%, rgba(47, 186, 118, 0.07) 0%, transparent 45%)',
        }}
      />

      {/* grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-45"
        style={{
          backgroundImage:
            'linear-gradient(rgba(61,255,154,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(61,255,154,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
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
        <Background color="rgba(61, 255, 154, 0.25)" gap={48} size={1} />
        <Controls
          className="!bg-emerald-950/80 !border-emerald-700/40 !shadow-lg [&>button]:!bg-emerald-900/80 [&>button]:!border-emerald-700/50 [&>button]:!text-emerald-200 [&>button:hover]:!bg-emerald-800"
        />
      </ReactFlow>

      <EvidencePanel
        connectionId={selectedConnection}
        onClose={() => setSelectedConnection(null)}
      />

      {/* Title */}
      <div className="absolute top-4 left-4 z-10 matrix-panel rounded-xl px-4 py-3 max-w-xs">
        <h1
          className="text-xl font-bold matrix-title"
        >
          PROPHECY BOARD
        </h1>
        <p className="text-xs text-emerald-100/60 mt-1">
          {edges.length} links live · tap a vector to inspect
        </p>
      </div>
    </div>
  );
}
