import type { SearchBook } from "./types";
import { normalizeText } from "./normalize";
import { normalizeIsbn } from "./isbn";

export const KEY_SEPARATOR = "::";

export function generateBookKey(book: SearchBook): string {
  const normalizedIsbn = normalizeIsbn(book.isbn);
  if (normalizedIsbn) {
    return normalizedIsbn;
  }

  const normalizedTitle = normalizeText(book.title);
  const normalizedAuthor = normalizeText(book.author);
  const normalizedPublisher = normalizeText(book.publisher);
  const normalizedSource = normalizeText(book.source);

  const secondary = normalizedAuthor || normalizedPublisher || normalizedSource;

  if (normalizedTitle && secondary) {
    return `${normalizedTitle}${KEY_SEPARATOR}${secondary}`;
  }

  if (normalizedTitle) {
    return normalizedTitle;
  }

  return `${book.title}${KEY_SEPARATOR}${book.author}`.trim();
}

export function qualityScore(book: SearchBook): number {
  let score = 0;
  if (book.isbn?.trim()) score += 5;
  if (book.image?.trim()) score += 2;
  if (book.publisher?.trim()) score += 1;
  if (book.author?.trim()) score += 1;
  return score;
}

export function mergeBooks(books: ReadonlyArray<SearchBook>): SearchBook[] {
  const map = new Map<string, { book: SearchBook; originalIndex: number }>();

  books.forEach((book, index) => {
    const key = generateBookKey(book);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, { book, originalIndex: index });
      return;
    }

    const existingScore = qualityScore(existing.book);
    const candidateScore = qualityScore(book);

    if (candidateScore > existingScore) {
      map.set(key, { book, originalIndex: existing.originalIndex });
    }
  });

  return Array.from(map.values())
    .sort((a, b) => {
      const rankDiff = a.originalIndex - b.originalIndex;
      if (rankDiff !== 0) return rankDiff;
      return qualityScore(b.book) - qualityScore(a.book);
    })
    .map((item) => item.book);
}
