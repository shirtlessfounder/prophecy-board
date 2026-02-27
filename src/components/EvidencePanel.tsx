'use client';

import { useEffect, useState } from 'react';
import type { ConnectionDetail } from '@/lib/types';

interface EvidencePanelProps {
  connectionId: string | null;
  onClose: () => void;
}

export default function EvidencePanel({ connectionId, onClose }: EvidencePanelProps) {
  const [detail, setDetail] = useState<ConnectionDetail | null>(null);

  useEffect(() => {
    if (!connectionId) {
      return;
    }
    fetch(`/api/connections/${connectionId}`)
      .then(r => r.json())
      .then(setDetail)
      .catch(console.error);
  }, [connectionId]);

  if (!connectionId) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-full max-w-md matrix-panel border-l border-emerald-500/30 shadow-2xl z-50 overflow-y-auto">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-emerald-200/70 hover:text-emerald-100 text-xl"
      >
        ✕
      </button>

      {detail && (
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="text-xs matrix-title mb-2">
              Connection Evidence Stream
            </div>
            <h2 className="text-lg text-emerald-100 font-semibold leading-tight">
              {detail.claim}
            </h2>
            <div className="flex items-center gap-2 mt-2 text-xs text-emerald-100/60">
              <span className={`px-2 py-0.5 rounded ${
                detail.status === 'established' ? 'matrix-chip' : 'border border-emerald-400/35 bg-emerald-500/10 text-emerald-200'
              }`}>
                {detail.status}
              </span>
            </div>
          </div>

          {/* Entities */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded matrix-panel border-emerald-500/25">
              <div className="text-[10px] text-emerald-300/70 uppercase">Source</div>
              <div className="text-sm text-emerald-100 font-medium">{detail.source_name}</div>
            </div>
            <div className="p-3 rounded matrix-panel border-emerald-500/25">
              <div className="text-[10px] text-emerald-300/70 uppercase">Modern</div>
              <div className="text-sm text-emerald-100 font-medium">{detail.modern_name}</div>
            </div>
          </div>

          {/* Reasoning */}
          {detail.reasoning && (
            <div className="mb-6">
              <h3 className="text-xs text-emerald-200/65 uppercase tracking-wider mb-2">Reasoning</h3>
              <p className="text-sm text-emerald-100/80 leading-relaxed">{detail.reasoning}</p>
            </div>
          )}

          {/* Claims */}
          {detail.claims?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs text-emerald-200/65 uppercase tracking-wider mb-3">Claims & Evidence</h3>
              <div className="space-y-4">
                {detail.claims.map(claim => (
                  <div key={claim.id} className="border border-emerald-600/20 rounded p-3 bg-black/20">
                    <p className="text-sm text-emerald-100 mb-2">{claim.text}</p>

                    {/* Verses */}
                    {claim.verses?.length > 0 && (
                      <div className="mb-2">
                        {claim.verses.map(v => (
                          <div key={v.id} className="text-xs p-2 rounded bg-emerald-950/35 border border-emerald-700/30 mb-1">
                            <span className="text-emerald-300 font-mono">
                              {v.book} {v.chapter}:{v.verse}
                            </span>
                            <p className="text-emerald-100/80 mt-1 italic">
                              &ldquo;{v.text_kjv}&rdquo;
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Facts */}
                    {claim.facts?.length > 0 && (
                      <div>
                        {claim.facts.map(f => (
                          <div key={f.id} className="text-xs p-2 rounded bg-emerald-950/20 border border-emerald-800/25 mb-1">
                            <p className="text-emerald-100/85">{f.fact_text}</p>
                            <a
                              href={f.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-300 hover:text-emerald-200 mt-1 inline-block"
                            >
                              Source →
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media */}
          {detail.media?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs text-emerald-200/65 uppercase tracking-wider mb-3">Evidence Images</h3>
              <div className="space-y-3">
                {detail.media.map(m => (
                  <div key={m.id} className="rounded overflow-hidden border border-emerald-700/30 bg-black/30">
                    <div className="w-full h-56 bg-black/40 flex items-center justify-center">
                      <img src={m.url} alt={m.caption || ''} className="max-w-full max-h-full object-contain" />
                    </div>
                    {m.caption && (
                      <div className="text-xs text-emerald-100/70 p-2 bg-emerald-950/40">{m.caption}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Votes */}
          {detail.votes && Object.keys(detail.votes).length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs text-emerald-200/65 uppercase tracking-wider mb-2">Community Votes</h3>
              <div className="flex gap-3">
                {Object.entries(detail.votes).map(([axis, v]) => (
                  <div key={axis} className="text-center p-2 rounded matrix-panel border border-emerald-700/20 min-w-20">
                    <div className="text-lg text-emerald-100 font-bold">{v.score}</div>
                    <div className="text-[10px] text-emerald-200/60 uppercase">{axis}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/c/${connectionId}`);
            }}
            className="w-full py-2 px-4 rounded border border-emerald-400/35 bg-emerald-500/10 text-emerald-200 text-sm hover:bg-emerald-500/20 transition-colors"
          >
            Share Connection →
          </button>
        </div>
      )}
    </div>
  );
}
