const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const test = require('node:test');

const { formatDate } = require('./formatDate.ts');

test('formatDate returns an empty string for invalid dates', () => {
  assert.equal(formatDate('not-a-date'), '');
  assert.equal(formatDate(''), '');
});

test('formatDate keeps SSR and client article dates identical across time zones', () => {
  const dates = [
    '2026-06-06T00:00:00.000Z',
    '2026-04-08T00:00:00.000Z',
    '2026-01-01T00:00:00.000Z',
    '2026-12-31T23:59:59.000Z',
    '2024-02-29',
    '2026-06-06T01:00:00+02:00',
  ];
  const expected = [
    '2026-06-06',
    '2026-04-08',
    '2026-01-01',
    '2026-12-31',
    '2024-02-29',
    '2026-06-05',
  ];
  for (const timezone of ['UTC', 'America/Los_Angeles', 'Asia/Shanghai', 'Pacific/Kiritimati']) {
    const output = execFileSync(process.execPath, [
      '--experimental-strip-types',
      '-e',
      `const { formatDate } = require(${JSON.stringify(require.resolve('./formatDate.ts'))});
       process.stdout.write(JSON.stringify(${JSON.stringify(dates)}.map(formatDate)));`,
    ], {
      encoding: 'utf8',
      env: { ...process.env, TZ: timezone },
    });
    assert.deepEqual(JSON.parse(output), expected, timezone);
  }
});
