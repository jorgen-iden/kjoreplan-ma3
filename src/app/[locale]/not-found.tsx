import { useTranslations } from 'next-intl';
import { SiteHeader } from '@/components/SiteHeader';
import { LINK_PRIMARY, LINK_SECONDARY, StatusScreen } from '@/components/StatusScreen';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('errors');
  return (
    <>
      <SiteHeader />
      <StatusScreen code={t('notFoundCode')} title={t('notFoundTitle')} lead={t('notFoundLead')}>
        <Link href="/" className={LINK_PRIMARY}>
          {t('backHome')}
        </Link>
        <Link href="/app" className={LINK_SECONDARY}>
          {t('openApp')}
        </Link>
      </StatusScreen>
    </>
  );
}
