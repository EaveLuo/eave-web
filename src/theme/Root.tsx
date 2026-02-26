import React from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SpeedInsights />
    </>
  );
}
