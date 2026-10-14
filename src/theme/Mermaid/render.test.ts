import assert from 'node:assert/strict';
import { test } from 'node:test';
// Node's built-in type-stripping test runner requires the source extension.
// @ts-expect-error The app tsconfig does not enable TypeScript import extensions.
import { createMermaidRenderer } from './render.ts';
import type { MermaidConfig } from 'mermaid';

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => { resolve = done; });
  return { promise, resolve };
}
const current = () => true;

test('nine diagrams survive overlapping initial light and persisted-dark renders', async () => {
  const started = deferred();
  const finish = deferred();
  const committed = new Map<string, string>();
  const ids: string[] = [];
  const configs: string[] = [];
  let theme: MermaidConfig['theme'];
  let initial = true;
  const render = createMermaidRenderer(async () => ({
    initialize(config) { theme = config.theme; },
    async render(id, text) {
      // Reproduce Mermaid's removal of existing SVGs before each render.
      committed.delete(id);
      ids.push(id);
      if (initial) { initial = false; started.resolve(); await finish.promise; }
      configs.push(`${text}:${theme}`);
      return { svg: `<svg id="${id}" data-theme="${theme}"></svg>`, diagramType: 'flowchart' };
    },
  }), () => {});
  let lightCurrent = true;
  const light = Array.from({ length: 9 }, (_, i) => render({
    text: `${i}`, config: { theme: 'default' }, isCurrent: () => lightCurrent,
  }));
  await started.promise;
  lightCurrent = false;
  const dark = Array.from({ length: 9 }, (_, i) => render({
    text: `${i}`, config: { theme: 'dark' }, isCurrent: current,
  }).then((result) => { assert.ok(result);
    const id = result.svg.match(/id="([^"]+)"/)?.[1];
    assert.ok(id);
    committed.set(id, result.svg); }));
  finish.resolve();
  assert.deepEqual(await Promise.all(light), Array(9).fill(null));
  await Promise.all(dark);
  assert.equal(committed.size, 9);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(configs, ['0:default', ...Array.from({ length: 9 }, (_, i) => `${i}:dark`)]);
  assert.ok([...committed.values()].every((svg) => svg.includes('data-theme="dark"')));
});

test('rerenders never remove a committed SVG while preserving each queued config', async () => {
  const dom = new Map<string, string>();
  const seen: string[] = [];
  let theme: MermaidConfig['theme'];
  const render = createMermaidRenderer(async () => ({
    initialize(config) { theme = config.theme; },
    async render(id) {
      dom.delete(id);
      await Promise.resolve();
      seen.push(String(theme));
      return { svg: id, diagramType: 'flowchart' };
    },
  }), () => {});
  const first = await render({ text: 'graph', config: { theme: 'default' }, isCurrent: current });
  assert.ok(first);
  dom.set(first.svg, 'mounted');
  const results = await Promise.all(['dark', 'default', 'dark'].map((theme) => render({
    text: 'graph', config: { theme: theme as MermaidConfig['theme'] }, isCurrent: current,
  })));
  assert.equal(dom.get(first.svg), 'mounted');
  assert.equal(new Set([first, ...results].map((result) => result?.svg)).size, 4);
  assert.deepEqual(seen, ['default', 'dark', 'default', 'dark']);
});

test('cancelled load does not initialize or render after navigation away', async () => {
  const started = deferred();
  const loaded = deferred();
  let active = true;
  const render = createMermaidRenderer(async () => {
    started.resolve(); await loaded.promise;
    return { initialize() { assert.fail('stale initialize'); }, render() { assert.fail('stale render'); } };
  }, () => {});
  const result = render({ text: 'graph', config: {}, isCurrent: () => active });
  await started.promise;
  active = false;
  loaded.resolve();
  assert.equal(await result, null);
});

test('render failure cleans temporary DOM and does not poison the queue', async () => {
  const cleaned: string[] = [];
  const render = createMermaidRenderer(async () => ({
    initialize() {},
    async render(id, text) {
      if (text === 'invalid') throw new Error('parse failed');
      return { svg: id, diagramType: 'flowchart' };
    },
  }), (id) => { cleaned.push(id); });
  const failed = render({ text: 'invalid', config: {}, isCurrent: current });
  const valid = render({ text: 'graph', config: {}, isCurrent: current });
  await assert.rejects(failed, /parse failed/);
  assert.ok(await valid);
  assert.equal(cleaned.length, 2);
  assert.notEqual(cleaned[0], cleaned[1]);
});
