'use client';

import { memo } from 'react';
import { getBezierPath, type EdgeProps } from '@xyflow/react';

function RedStringEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const status = (data?.status as string) || 'established';
  const opacity = status === 'established' ? 0.9 : 0.4;

  return (
    <>
      {/* Glow effect */}
      <path
        d={edgePath}
        fill="none"
        stroke="#dc2626"
        strokeWidth={6}
        strokeOpacity={opacity * 0.3}
        filter="url(#glow)"
      />
      {/* Main string */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke="#dc2626"
        strokeWidth={2}
        strokeOpacity={opacity}
        strokeDasharray={status === 'pending' ? '5 5' : undefined}
        className="cursor-pointer hover:stroke-red-400 transition-colors"
      />
    </>
  );
}

export default memo(RedStringEdge);
