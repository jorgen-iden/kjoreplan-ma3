import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { Converter } from '@/components/converter/Converter';

export default function AppPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale(use(params).locale);
  return (
    <>
      <SiteHeader />
      <Converter />
    </>
  );
}
