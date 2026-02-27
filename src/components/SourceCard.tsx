'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface SourceCardData {
  name: string;
  metadata: Record<string, unknown>;
  [key: string]: unknown;
}

function SourceCard({ data }: NodeProps & { data: SourceCardData }) {
  const tags = (data.metadata?.tags as string[]) || [];
  const book = data.metadata?.book as string;
  const chapter = data.metadata?.chapter as number;
  const verse = data.metadata?.verse as number;

  return (
    <div className="relative group">
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-emerald-300 border border-emerald-100/70 shadow-md z-10 matrix-pulse" />

      <div
        className="w-56 p-4 rounded-md matrix-panel border-emerald-500/30 cursor-pointer transition-transform duration-150 group-hover:-translate-y-0.5"
      >
        <div className="text-[10px] text-emerald-200/60 mb-1 tracking-widest uppercase">
          {book} {chapter}:{verse}
        </div>
        <div className="text-sm text-emerald-100 font-semibold leading-tight">
          {data.name}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded matrix-chip"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="!bg-emerald-300 !w-2 !h-2 !border !border-emerald-100" />
      <Handle type="target" position={Position.Right} className="!bg-emerald-300 !w-2 !h-2 !border !border-emerald-100" />
    </div>
  );
}

export default memo(SourceCard);
