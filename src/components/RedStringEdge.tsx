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
  const opacity = status === 'established' ? 0.78 : 0.36;
  const core = status === 'established' ? '#58b889' : '#4aa77c';

  return (
    <>
      <path
        d={edgePath}
        fill="none"
        stroke={core}
        strokeWidth={6}
        strokeOpacity={opacity * 0.3}
        filter="url(#glow)"
      />
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={core}
        strokeWidth={2}
        strokeOpacity={opacity}
        strokeDasharray={status === 'pending' ? '5 5' : undefined}
        className="cursor-pointer transition-colors"
      />
    </>
  );
}

export default memo(RedStringEdge);
