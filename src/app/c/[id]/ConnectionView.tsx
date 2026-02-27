'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ConnectionDetail } from '@/lib/types';

export default function ConnectionView({ id }: { id: string }) {
  const [detail, setDetail] = useState<ConnectionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/connections/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen matrix-shell flex items-center justify-center">
        <div className="matrix-panel rounded-xl px-4 py-2 text-emerald-200/80">Loading stream...</div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen matrix-shell flex flex-col items-center justify-center">
        <div className="text-emerald-200/70 mb-4">Connection not found</div>
        <Link href="/" className="text-emerald-300 hover:text-emerald-200">← Back to board</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen matrix-shell text-emerald-100">
      {/* Nav */}
      <nav className="border-b border-emerald-800/40 px-4 py-3 matrix-panel">
        <Link href="/" className="text-emerald-300 hover:text-emerald-200 text-sm">
          ← Back to board
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Status badge */}
        <div className={`inline-block text-xs px-2 py-0.5 rounded mb-3 ${
          detail.status === 'established' ? 'matrix-chip' : 'border border-emerald-400/35 bg-emerald-500/10 text-emerald-200'
        }`}>
          {detail.status}
        </div>

        {/* Main claim */}
        <h1 className="text-2xl font-bold leading-tight mb-4 matrix-title">
          {detail.claim}
        </h1>

        {/* Entity cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-lg matrix-panel border border-emerald-600/25">
            <div className="text-[10px] text-emerald-300/70 uppercase tracking-wider">Source Text</div>
            <div className="text-sm text-emerald-100 font-semibold mt-1">{detail.source_name}</div>
          </div>
          <div className="p-4 rounded-lg matrix-panel border border-emerald-600/25">
            <div className="text-[10px] text-emerald-300/70 uppercase tracking-wider">Modern Entity</div>
            <div className="text-sm text-emerald-100 font-semibold mt-1">{detail.modern_name}</div>
          </div>
        </div>

        {/* Reasoning */}
        {detail.reasoning && (
          <div className="mb-8">
            <h2 className="text-xs text-emerald-200/70 uppercase tracking-wider mb-2">The Connection</h2>
            <p className="text-emerald-100/85 leading-relaxed">{detail.reasoning}</p>
          </div>
        )}

        {/* Red string divider */}
        <div className="h-px bg-emerald-700/30 my-8" />

        {/* Claims */}
        {detail.claims?.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xs text-emerald-200/70 uppercase tracking-wider">Evidence Chain</h2>
            {detail.claims.map((claim, i) => (
              <div key={claim.id} className="relative pl-6">
                {/* Number marker */}
                <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-emerald-800/60 text-emerald-200 text-[10px] flex items-center justify-center">
                  {i + 1}
                </div>

                <p className="text-sm text-emerald-100 font-medium mb-3">{claim.text}</p>

                {/* Verses */}
                {claim.verses?.map(v => (
                  <div key={v.id} className="mb-2 p-3 rounded border border-emerald-700/30 bg-emerald-950/20">
                    <div className="text-xs text-emerald-300 font-mono mb-1">
                      {v.book} {v.chapter}:{v.verse}
                    </div>
                    <p className="text-sm text-emerald-100/80 italic">
                      &ldquo;{v.text_kjv}&rdquo;
                    </p>
                  </div>
                ))}

                {/* Facts */}
                {claim.facts?.map(f => (
                  <div key={f.id} className="mb-2 p-3 rounded bg-emerald-950/20 border border-emerald-700/30">
                    <p className="text-sm text-emerald-100/85">{f.fact_text}</p>
                    <a href={f.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-300 hover:text-emerald-200 mt-1 inline-block">
                      Verify source →
                    </a>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Evidence Images */}
        {detail.media?.length > 0 && (
          <div className="mt-8">
            <div className="h-px bg-emerald-700/30 mb-8" />
            <h2 className="text-xs text-emerald-200/70 uppercase tracking-wider mb-4">Evidence Images</h2>
            <div className="space-y-4">
              {detail.media.map(m => (
                <div key={m.id} className="rounded-lg overflow-hidden border border-emerald-700/30 bg-black/30">
                  <div className="w-full h-72 bg-black/40 flex items-center justify-center">
                    <img src={m.url} alt={m.caption || ''} className="max-w-full max-h-full object-contain" />
                  </div>
                  {m.caption && (
                    <div className="text-sm text-emerald-100/70 p-3 bg-emerald-950/35">{m.caption}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share */}
        <div className="mt-12 mb-8">
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="w-full py-3 rounded border border-emerald-400/35 bg-emerald-500/10 text-emerald-200 text-sm hover:bg-emerald-500/20 transition-colors"
          >
            Share Connection
          </button>
        </div>
      </div>
    </div>
  );
}
