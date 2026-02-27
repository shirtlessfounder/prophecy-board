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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <div className="text-zinc-400 mb-4">Connection not found</div>
        <Link href="/" className="text-red-400 hover:text-red-300">← Back to board</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <nav className="border-b border-zinc-800 px-4 py-3">
        <Link href="/" className="text-red-400 hover:text-red-300 text-sm">
          ← Back to board
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Status badge */}
        <div className={`inline-block text-xs px-2 py-0.5 rounded mb-3 ${
          detail.status === 'established' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
        }`}>
          {detail.status}
        </div>

        {/* Main claim */}
        <h1 className="text-2xl font-bold leading-tight mb-4" style={{ fontFamily: 'Georgia, serif' }}>
          {detail.claim}
        </h1>

        {/* Entity cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-lg border border-amber-800/30" style={{ background: 'linear-gradient(135deg, #f5e6c8 0%, #dbc694 100%)' }}>
            <div className="text-[10px] text-amber-900/60 uppercase tracking-wider">Source Text</div>
            <div className="text-sm text-amber-950 font-semibold mt-1">{detail.source_name}</div>
          </div>
          <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Modern Entity</div>
            <div className="text-sm text-zinc-100 font-semibold mt-1">{detail.modern_name}</div>
          </div>
        </div>

        {/* Reasoning */}
        {detail.reasoning && (
          <div className="mb-8">
            <h2 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">The Connection</h2>
            <p className="text-zinc-300 leading-relaxed">{detail.reasoning}</p>
          </div>
        )}

        {/* Red string divider */}
        <div className="h-px bg-red-900/30 my-8" />

        {/* Claims */}
        {detail.claims?.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xs text-zinc-500 uppercase tracking-wider">Evidence Chain</h2>
            {detail.claims.map((claim, i) => (
              <div key={claim.id} className="relative pl-6">
                {/* Number marker */}
                <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-red-900/50 text-red-300 text-[10px] flex items-center justify-center">
                  {i + 1}
                </div>

                <p className="text-sm text-zinc-200 font-medium mb-3">{claim.text}</p>

                {/* Verses */}
                {claim.verses?.map(v => (
                  <div key={v.id} className="mb-2 p-3 rounded border border-amber-900/20 bg-amber-950/10">
                    <div className="text-xs text-amber-500 font-mono mb-1">
                      {v.book} {v.chapter}:{v.verse}
                    </div>
                    <p className="text-sm text-amber-200/80 italic" style={{ fontFamily: 'Georgia, serif' }}>
                      &ldquo;{v.text_kjv}&rdquo;
                    </p>
                  </div>
                ))}

                {/* Facts */}
                {claim.facts?.map(f => (
                  <div key={f.id} className="mb-2 p-3 rounded bg-zinc-800/50 border border-zinc-700/50">
                    <p className="text-sm text-zinc-300">{f.fact_text}</p>
                    <a href={f.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block">
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
            <div className="h-px bg-red-900/30 mb-8" />
            <h2 className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Evidence Images</h2>
            <div className="space-y-4">
              {detail.media.map(m => (
                <div key={m.id} className="rounded-lg overflow-hidden border border-zinc-800">
                  <img src={m.url} alt={m.caption || ''} className="w-full" />
                  {m.caption && (
                    <div className="text-sm text-zinc-400 p-3 bg-zinc-900/50">{m.caption}</div>
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
            className="w-full py-3 rounded bg-red-900/20 border border-red-800/30 text-red-300 text-sm hover:bg-red-900/40 transition-colors"
          >
            Share this prophecy
          </button>
        </div>
      </div>
    </div>
  );
}
