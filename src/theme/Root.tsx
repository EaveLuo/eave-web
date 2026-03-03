import React from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { LanguageRedirect } from '@site/src/components/LanguageRedirect';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LanguageRedirect />
      {children}
      <SpeedInsights />
    </>
  );
}
