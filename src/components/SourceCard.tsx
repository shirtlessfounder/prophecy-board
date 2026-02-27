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
      {/* Pushpin */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-700 border-2 border-red-900 shadow-md z-10" />

      <div
        className="w-56 p-4 rounded shadow-lg border border-amber-800/30 cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #f5e6c8 0%, #e8d5a8 50%, #dbc694 100%)',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div className="text-xs text-amber-900/60 mb-1 tracking-wide uppercase">
          {book} {chapter}:{verse}
        </div>
        <div className="text-sm text-amber-950 font-semibold leading-tight">
          {data.name}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/10 text-amber-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="!bg-red-700 !w-2 !h-2" />
      <Handle type="target" position={Position.Right} className="!bg-red-700 !w-2 !h-2" />
    </div>
  );
}

export default memo(SourceCard);
