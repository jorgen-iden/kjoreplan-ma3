'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Button, LINK_SECONDARY, StatusScreen } from '@/components/ui';
import { Link } from '@/i18n/navigation';

/** Error boundary for every page: shows a retry instead of a blank screen. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('errors');
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <StatusScreen title={t('errorTitle')} lead={t('errorLead')}>
      <Button variant="primary" size="lg" onClick={reset}>
        {t('retry')}
      </Button>
      <Link href="/" className={LINK_SECONDARY}>
        {t('backHome')}
      </Link>
    </StatusScreen>
  );
}
