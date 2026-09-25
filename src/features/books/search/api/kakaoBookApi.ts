import type { SearchBook } from "../lib/types";
import { fetchJson } from "@/shared/utils/fetchJson";
import { normalizeText, stripHtml } from "../lib/normalize";
import { parseKakaoIsbn } from "../lib/isbn";
import { API_BASE_URL } from "@/shared/constants/apiBaseUrl";

interface KakaoBookItem {
  title: string;
  author: string;
  image: string;
  description?: string;
  publisher: string;
  isbn?: string;
}

/**
 * 카카오 책 검색 API를 호출합니다 (백엔드 프록시 경유).
 * @param query 검색어
 * @returns 검색된 책 목록
 */
export async function searchKakaoBooks(query: string): Promise<SearchBook[]> {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return [];

  const url = new URL("/api/books", API_BASE_URL);
  url.searchParams.set("query", query);

  console.log(`[KakaoBookApi] 요청 전송: ${url.toString()}`);
  try {
    const data = await fetchJson<{ items?: KakaoBookItem[] }>(
      url,
      undefined,
      "Kakao API",
    );

    console.log(
      `[KakaoBookApi] 응답 수신 성공: ${data.items?.length ?? 0}건 반환됨`,
    );

    return (
      data.items
        ?.filter((item) => {
          const title = item.title ?? "";
          return Boolean(title.trim());
        })
        .map((item) => ({
          title: stripHtml(item.title),
          author: item.author,
          image: item.image,
          description: item.description ?? undefined,
          publisher: item.publisher,
          isbn: parseKakaoIsbn(item.isbn),
          source: "kakao" as const,
        })) || []
    );
  } catch (err) {
    console.error(`[KakaoBookApi] 요청 실패:`, err);
    throw err;
  }
}
