import type { SearchBook } from "./types";
import { normalizeCompactText, normalizeText } from "./normalize";
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
  if (book.pageCount && book.pageCount > 0) score += 2;
  return score;
}

/**
 * 구글 북스 등에서 제공되는 페이지 수(pageCount)를
 * 동일한 도서(ISBN 일치 또는 정규화 제목+저자 일치)인 카카오 도서 등에 교차 주입합니다.
 */
export function enrichPageCounts(books: ReadonlyArray<SearchBook>): SearchBook[] {
  const isbnToPageCount = new Map<string, number>();
  const titleAuthorToPageCount = new Map<string, number>();

  for (const b of books) {
    if (b.pageCount && b.pageCount > 0) {
      const normIsbn = normalizeIsbn(b.isbn);
      if (normIsbn) {
        isbnToPageCount.set(normIsbn, b.pageCount);
      }
      const normTitle = normalizeCompactText(b.title);
      const normAuthor = normalizeCompactText(b.author);
      if (normTitle) {
        titleAuthorToPageCount.set(`${normTitle}::${normAuthor}`, b.pageCount);
      }
    }
  }

  return books.map((b) => {
    if (b.pageCount && b.pageCount > 0) return b;

    const normIsbn = normalizeIsbn(b.isbn);
    if (normIsbn && isbnToPageCount.has(normIsbn)) {
      return { ...b, pageCount: isbnToPageCount.get(normIsbn) };
    }

    const normTitle = normalizeCompactText(b.title);
    const normAuthor = normalizeCompactText(b.author);
    const key = `${normTitle}::${normAuthor}`;
    if (titleAuthorToPageCount.has(key)) {
      return { ...b, pageCount: titleAuthorToPageCount.get(key) };
    }

    return b;
  });
}

export function mergeBooks(books: ReadonlyArray<SearchBook>): SearchBook[] {
  const enrichedBooks = enrichPageCounts(books);
  const map = new Map<string, { book: SearchBook; originalIndex: number }>();

  enrichedBooks.forEach((book, index) => {
    const key = generateBookKey(book);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, { book, originalIndex: index });
      return;
    }

    const mergedPageCount = book.pageCount || existing.book.pageCount;
    const existingScore = qualityScore(existing.book);
    const candidateScore = qualityScore(book);

    if (candidateScore > existingScore) {
      map.set(key, {
        book: { ...book, pageCount: mergedPageCount },
        originalIndex: existing.originalIndex,
      });
    } else {
      if (!existing.book.pageCount && mergedPageCount) {
        existing.book.pageCount = mergedPageCount;
      }
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
