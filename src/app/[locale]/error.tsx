'use client';

import dynamic from 'next/dynamic';

// The error screen is loaded when an error happens, so its code isn't part of every page load.
const ErrorView = dynamic(() => import('@/components/layout/ErrorView'));

/** Error boundary for every page: shows a retry instead of a blank screen. */
export default function ErrorPage(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorView {...props} />;
}
