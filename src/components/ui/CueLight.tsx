'use client';

import { useEffect, useState } from 'react';

/** Fired when a cue list leaves the app (macro downloaded): the cue light flashes GO. */
export const CUE_GO_EVENT = 'cuesetter:go';

export function cueGo() {
  window.dispatchEvent(new Event(CUE_GO_EVENT));
}

/**
 * The dot after "Cuesetter": a cue light, like the lamp a stage manager uses to cue the operator.
 * It breathes slowly on standby and flashes GO when `cueGo()` is called. Decorative only.
 */
export function CueLight({ className = '' }: { className?: string }) {
  const [go, setGo] = useState(0);

  useEffect(() => {
    const onGo = () => setGo((n) => n + 1);
    window.addEventListener(CUE_GO_EVENT, onGo);
    return () => window.removeEventListener(CUE_GO_EVENT, onGo);
  }, []);

  return (
    <span
      // A new key restarts the GO flash each time.
      key={go}
      aria-hidden="true"
      className={`inline-block size-2 rounded-full bg-accent ${go ? 'animate-cue-go' : 'animate-cue-standby'} ${className}`}
    />
  );
}
