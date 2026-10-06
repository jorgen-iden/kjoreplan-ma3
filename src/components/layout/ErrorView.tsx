'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { LINK_SECONDARY, StatusScreen } from '@/components/ui/StatusScreen';
import { Link } from '@/i18n/navigation';

/** The error screen with a retry, shown by the error boundary in app/[locale]/error.tsx. */
export default function ErrorView({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
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
