export function sortArticlesNewestFirst<
  T extends { id: string; date: string },
>(articles: readonly T[]): T[];
