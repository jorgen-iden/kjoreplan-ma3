'use client';

import { track } from '@vercel/analytics';
import type { ReactNode } from 'react';

/** A download link that counts downloads in Vercel Analytics (only the file name is sent). */
export function TrackedDownload({ href, file, className, children }: { href: string; file: string; className?: string; children: ReactNode }) {
  return (
    <a href={href} download className={className} onClick={() => track('Template downloaded', { file })}>
      {children}
    </a>
  );
}
