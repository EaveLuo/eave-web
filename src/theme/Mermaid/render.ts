import type { Mermaid, MermaidConfig, RenderResult } from 'mermaid';

type RenderRequest = {
  text: string;
  config: MermaidConfig;
  isCurrent: () => boolean;
};

// initialize() mutates Mermaid's singleton, so it must share render's queue.
// IDs belong to render attempts, not components: Mermaid removes existing DOM
// with the supplied ID, including a previously committed React-owned SVG.
export function createMermaidRenderer(
  load: () => Promise<Pick<Mermaid, 'initialize' | 'render'>>,
  cleanup: (id: string) => void,
): (request: RenderRequest) => Promise<RenderResult | null> {
  let queue: Promise<unknown> = Promise.resolve();
  let nextId = 0;

  return (request) => {
    const id = `eave-mermaid-${++nextId}`;
    const task = queue.then(async () => {
      if (!request.isCurrent()) return null;
      const mermaid = await load();
      if (!request.isCurrent()) return null;
      mermaid.initialize(request.config);
      try {
        const result = await mermaid.render(id, request.text);
        return request.isCurrent() ? result : null;
      } finally {
        cleanup(id);
      }
    });
    // A malformed diagram must not poison subsequent diagrams or theme changes.
    queue = task.catch(() => undefined);
    return task;
  };
}
