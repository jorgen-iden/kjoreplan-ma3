import { useTranslations } from 'next-intl';
import { PageSkeleton } from '@/components/ui';

export default function Loading() {
  const t = useTranslations('common');
  return <PageSkeleton label={t('loading')} rows={8} />;
}
