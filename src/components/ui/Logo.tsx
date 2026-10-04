'use client';

import { useEffect, useState } from 'react';

/** Fired when a cue list leaves the app (macro downloaded, command line copied): the cue light flashes GO. */
export const CUE_GO_EVENT = 'cuesetter:go';

export function cueGo() {
  window.dispatchEvent(new Event(CUE_GO_EVENT));
}

/**
 * The CueSetter mark: a cue list with a cue light on the first row, like the lamp a stage manager
 * uses to cue the operator. The light breathes slowly on standby and flashes GO when `cueGo()` is
 * called. Same geometry as src/app/icon.svg, apple-icon and the share image.
 */
export function LogoMark({ size = 28, className = '' }: { size?: number; className?: string }) {
  const [go, setGo] = useState(0);
  const [flashing, setFlashing] = useState(false);

  useEffect(() => {
    const onGo = () => {
      setGo((n) => n + 1);
      setFlashing(true);
    };
    window.addEventListener(CUE_GO_EVENT, onGo);
    return () => window.removeEventListener(CUE_GO_EVENT, onGo);
  }, []);

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={`shrink-0 ${className}`}>
      <rect width="32" height="32" rx="8" className="fill-accent" />
      <circle
        // A new key restarts the GO flash each time.
        key={go}
        cx="9"
        cy="10"
        r="2.6"
        // After the GO flash the light goes back to standby.
        onAnimationEnd={() => setFlashing(false)}
        className={`origin-center fill-on-accent [transform-box:fill-box] ${flashing ? 'animate-cue-go' : 'animate-cue-standby'}`}
      />
      <rect x="14" y="8.5" width="11" height="3" rx="1.5" className="fill-on-accent" />
      <rect x="14" y="14.5" width="8" height="3" rx="1.5" className="fill-on-accent" opacity="0.55" />
      <rect x="14" y="20.5" width="10" height="3" rx="1.5" className="fill-on-accent" opacity="0.55" />
    </svg>
  );
}

/** Mark and wordmark, as used in the header. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="text-2xl font-extrabold tracking-tight">CueSetter</span>
    </span>
  );
}
