'use client';

import { useState } from 'react';

/**
 * The demo video, loaded only when played: until then a thumbnail and a play button, so YouTube
 * sets no cookies and costs no load time. Uses youtube-nocookie.com.
 */
export function DemoVideo({ youtubeId, title, play }: { youtubeId: string; title: string; play: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl bg-console shadow-2xl">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 grid size-full place-items-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- YouTube thumbnail, no need for image optimisation */}
          <img src={`https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-80" />
          <span className="relative flex items-center gap-3 rounded-full bg-accent px-6 py-3 font-bold text-on-accent shadow-xl transition duration-300 ease-out-back group-hover:scale-105">
            <span aria-hidden="true">▶</span>
            {play}
          </span>
        </button>
      )}
    </div>
  );
}
