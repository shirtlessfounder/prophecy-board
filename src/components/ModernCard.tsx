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
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-emerald-300 border border-emerald-100/70 shadow-md z-10 matrix-pulse" />

      <div className="w-56 p-4 rounded-md matrix-panel border-emerald-500/30 cursor-pointer transition-transform duration-150 group-hover:-translate-y-0.5">
        {data.imageUrl && (
          <img
            src={data.imageUrl}
            alt={data.name}
            className="w-10 h-10 rounded-sm mb-2 border border-emerald-300/45 object-cover"
          />
        )}
        <div className="text-sm text-emerald-100 font-semibold leading-tight">
          {data.name}
        </div>
        {role && (
          <div className="text-xs text-emerald-100/65 mt-1">{role}</div>
        )}
        {founded && (
          <div className="text-xs text-emerald-100/45 mt-0.5">EST {founded}</div>
        )}
      </div>

      <Handle type="source" position={Position.Left} className="!bg-emerald-300 !w-2 !h-2 !border !border-emerald-100" />
      <Handle type="target" position={Position.Left} className="!bg-emerald-300 !w-2 !h-2 !border !border-emerald-100" />
    </div>
  );
}

export default memo(ModernCard);
