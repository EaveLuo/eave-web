function sortArticlesNewestFirst(articles) {
  return [...articles].sort(
    (a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime() ||
      a.id.localeCompare(b.id),
  );
}

module.exports = { sortArticlesNewestFirst };
