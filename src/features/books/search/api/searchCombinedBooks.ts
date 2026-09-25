import type { SearchBook } from "../lib/types";
import type { SearchOptions } from "../lib/types";
import { searchKakaoBooks } from "./kakaoBookApi";
import { searchGoogleBooks } from "./googleBookApi";
import {
  filterLowQuality,
  filterEditionVariants,
  filterForeignEditions,
} from "../lib/filters";
import { mergeBooks } from "../lib/merge";
import { groupByBaseTitle } from "../lib/edition";
import { sortBooksByRelevance } from "../lib/relevance";

export async function searchCombinedBooks(
  query: string,
  options?: SearchOptions,
): Promise<SearchBook[]> {
  if (!query || !query.trim()) {
    throw new Error("Search query is empty.");
  }

  const [kakaoResult, googleResult] = await Promise.allSettled([
    searchKakaoBooks(query),
    searchGoogleBooks(query),
  ]);

  const allBooks: SearchBook[] = [];

  if (kakaoResult.status === "fulfilled") {
    console.log(`[통합 검색] ✅ 카카오 도서: ${kakaoResult.value.length}건 수신 완료`);
    allBooks.push(...kakaoResult.value);
  } else {
    console.error("[통합 검색] ❌ 카카오 도서 검색 실패:", kakaoResult.reason);
  }

  if (googleResult.status === "fulfilled") {
    console.log(`[통합 검색] ✅ 구글 도서: ${googleResult.value.length}건 수신 완료`);
    allBooks.push(...googleResult.value);
  } else {
    console.error("[통합 검색] ❌ 구글 도서 검색 실패:", googleResult.reason);
  }

  const merged = mergeBooks(allBooks);
  const qualityFiltered = filterLowQuality(merged);
  const editionFiltered = filterEditionVariants(
    qualityFiltered,
    options?.includeVariants,
  );
  const localized = filterForeignEditions(
    editionFiltered,
    query,
    options?.includeVariants,
  );

  const baseResults = options?.includeVariants
    ? localized
    : groupByBaseTitle(localized);

  return sortBooksByRelevance(baseResults, query);
}
