import type { SearchBook } from "./types";

export function filterLowQuality(
  books: ReadonlyArray<SearchBook>,
): SearchBook[] {
  return books.filter(
    (book) =>
      Boolean(book.title?.trim()) &&
      Boolean(
        book.author?.trim() ||
        book.publisher?.trim() ||
        book.isbn?.trim()
      ),
  );
}

export function filterEditionVariants(
  books: ReadonlyArray<SearchBook>,
  _includeVariants?: boolean,
): SearchBook[] {
  // 전역 삭제 대신 안전하게 통과시키며, 실제 동일 도서 판본 정리는 groupByBaseTitle에서 처리합니다.
  return [...books];
}

export function filterForeignEditions(
  books: ReadonlyArray<SearchBook>,
  query: string,
  includeVariants?: boolean,
): SearchBook[] {
  if (includeVariants) return [...books];

  const hasKoreanInQuery = /[가-힣]/.test(query);
  if (!hasKoreanInQuery) return [...books];

  const englishEditionRegex = /(영문판|영어판|english\s*edition|english)/i;
  return books.filter((book) => {
    const title = book.title || "";
    if (englishEditionRegex.test(title)) return false;
    if (/[가-힣]/.test(title)) return true;
    return !englishEditionRegex.test(title);
  });
}
