import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import { ErrorBoundaryErrorMessageFallback } from '@docusaurus/theme-common';
import {
  MermaidContainerClassName,
  useMermaidConfig,
} from '@docusaurus/theme-mermaid/client';
import { loadMermaid } from '@docusaurus/theme-mermaid/lib/client/loadMermaid.js';
import type { RenderResult } from 'mermaid';
import { createMermaidRenderer } from './render';
import styles from './styles.module.css';

const renderMermaid = createMermaidRenderer(loadMermaid, (id) => {
  document.getElementById(`d${id}`)?.remove();
  document.getElementById(`i${id}`)?.remove();
});

function MermaidRenderer({ value }: { value: string }): ReactNode {
  const config = useMermaidConfig();
  const [result, setResult] = useState<RenderResult | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let current = true;
    void renderMermaid({ text: value, config, isCurrent: () => current })
      .then((nextResult) => {
        if (current && nextResult) setResult(nextResult);
      })
      .catch((error: unknown) => {
        if (current) setResult(() => { throw error; });
      });
    return () => { current = false; };
  }, [value, config]);

  useEffect(() => {
    if (result && ref.current) result.bindFunctions?.(ref.current);
  }, [result]);

  if (!result) return null;
  return (
    <div
      ref={ref}
      className={`${MermaidContainerClassName} ${styles.container}`}
      dangerouslySetInnerHTML={{ __html: result.svg }}
    />
  );
}

// Docusaurus theme overrides require a default export.
export default function Mermaid(props: { value: string }): ReactNode {
  return (
    <ErrorBoundary fallback={(params) => <ErrorBoundaryErrorMessageFallback {...params} />}>
      <MermaidRenderer {...props} />
    </ErrorBoundary>
  );
}
