'use client';

import { useEffect, useState } from 'react';
import type { ConnectionDetail } from '@/lib/types';

interface EvidencePanelProps {
  connectionId: string | null;
  onClose: () => void;
}

export default function EvidencePanel({ connectionId, onClose }: EvidencePanelProps) {
  const [detail, setDetail] = useState<ConnectionDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!connectionId) {
      setDetail(null);
      return;
    }
    setLoading(true);
    fetch(`/api/connections/${connectionId}`)
      .then(r => r.json())
      .then(setDetail)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [connectionId]);

  if (!connectionId) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-800 shadow-2xl z-50 overflow-y-auto">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 text-xl"
      >
        ✕
      </button>

      {loading && (
        <div className="p-8 text-zinc-400">Loading evidence...</div>
      )}

      {detail && (
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="text-xs text-red-500 uppercase tracking-wider mb-2">
              Connection Evidence
            </div>
            <h2 className="text-lg text-zinc-100 font-semibold leading-tight">
              {detail.claim}
            </h2>
            <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
              <span className={`px-2 py-0.5 rounded ${
                detail.status === 'established' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
              }`}>
                {detail.status}
              </span>
            </div>
          </div>

          {/* Entities */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded bg-amber-950/20 border border-amber-800/20">
              <div className="text-[10px] text-amber-600 uppercase">Source</div>
              <div className="text-sm text-amber-200 font-medium">{detail.source_name}</div>
            </div>
            <div className="p-3 rounded bg-zinc-800/50 border border-zinc-700/50">
              <div className="text-[10px] text-zinc-500 uppercase">Modern</div>
              <div className="text-sm text-zinc-200 font-medium">{detail.modern_name}</div>
            </div>
          </div>

          {/* Reasoning */}
          {detail.reasoning && (
            <div className="mb-6">
              <h3 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Reasoning</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">{detail.reasoning}</p>
            </div>
          )}

          {/* Claims */}
          {detail.claims?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Claims & Evidence</h3>
              <div className="space-y-4">
                {detail.claims.map(claim => (
                  <div key={claim.id} className="border border-zinc-800 rounded p-3">
                    <p className="text-sm text-zinc-200 mb-2">{claim.text}</p>

                    {/* Verses */}
                    {claim.verses?.length > 0 && (
                      <div className="mb-2">
                        {claim.verses.map(v => (
                          <div key={v.id} className="text-xs p-2 rounded bg-amber-950/20 border border-amber-900/20 mb-1">
                            <span className="text-amber-500 font-mono">
                              {v.book} {v.chapter}:{v.verse}
                            </span>
                            <p className="text-amber-200/80 mt-1 italic" style={{ fontFamily: 'Georgia, serif' }}>
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
                          <div key={f.id} className="text-xs p-2 rounded bg-zinc-800/50 mb-1">
                            <p className="text-zinc-300">{f.fact_text}</p>
                            <a
                              href={f.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 mt-1 inline-block"
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

          {/* Votes */}
          {detail.votes && Object.keys(detail.votes).length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Community Votes</h3>
              <div className="flex gap-3">
                {Object.entries(detail.votes).map(([axis, v]) => (
                  <div key={axis} className="text-center p-2 rounded bg-zinc-800/50">
                    <div className="text-lg text-zinc-100 font-bold">{v.score}</div>
                    <div className="text-[10px] text-zinc-500 uppercase">{axis}</div>
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
            className="w-full py-2 px-4 rounded bg-red-900/30 border border-red-800/30 text-red-300 text-sm hover:bg-red-900/50 transition-colors"
          >
            Share this prophecy →
          </button>
        </div>
      )}
    </div>
  );
}
