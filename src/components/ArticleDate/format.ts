function parseArticleDate(date: unknown): Date | null {
  if (!date) {
    return null;
  }

  const parsed = date instanceof Date ? date : new Date(String(date));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getArticleDateTime(date: unknown): string | undefined {
  const parsed = parseArticleDate(date);
  return parsed?.toISOString().slice(0, 10);
}

export function formatArticleDate(
  date: unknown,
  locale: string
): string | null {
  const parsed = parseArticleDate(date);
  if (!parsed) {
    return null;
  }

  if (locale.startsWith('en')) {
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(parsed);
  }

  return parsed.toISOString().slice(0, 10);
}
