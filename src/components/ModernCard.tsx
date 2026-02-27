'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface ModernCardData {
  name: string;
  metadata: Record<string, unknown>;
  imageUrl: string | null;
  [key: string]: unknown;
}

function ModernCard({ data }: NodeProps & { data: ModernCardData }) {
  const meta = data.metadata || {};
  const role = meta.role as string | undefined;
  const founded = meta.founded as string | undefined;

  return (
    <div className="relative group">
      {/* Pushpin */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-700 border-2 border-red-900 shadow-md z-10" />

      <div className="w-56 p-4 rounded shadow-lg border border-zinc-700/50 bg-zinc-900 cursor-pointer">
        {data.imageUrl && (
          <img
            src={data.imageUrl}
            alt={data.name}
            className="w-10 h-10 rounded-full mb-2 border border-zinc-600"
          />
        )}
        <div className="text-sm text-zinc-100 font-semibold leading-tight">
          {data.name}
        </div>
        {role && (
          <div className="text-xs text-zinc-400 mt-1">{role}</div>
        )}
        {founded && (
          <div className="text-xs text-zinc-500 mt-0.5">Est. {founded}</div>
        )}
      </div>

      <Handle type="source" position={Position.Left} className="!bg-red-700 !w-2 !h-2" />
      <Handle type="target" position={Position.Left} className="!bg-red-700 !w-2 !h-2" />
    </div>
  );
}

export default memo(ModernCard);
