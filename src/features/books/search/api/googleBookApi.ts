import type { SearchBook } from "../lib/types";
import { fetchJson } from "@/shared/utils/fetchJson";
import { normalizeCompactText, normalizeText } from "../lib/normalize";
import { extractIsbn } from "../lib/isbn";

interface GoogleBookItem {
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    description?: string;
    imageLinks?: {
      thumbnail?: string;
    };
    industryIdentifiers?: { type: string; identifier: string }[];
    pageCount?: number;
  };
}

/**
 * 구글 책 검색 API를 호출합니다.
 * @param query 검색어
 * @returns 검색된 책 목록
 */
export async function searchGoogleBooks(query: string): Promise<SearchBook[]> {
  const normalizedQuery = normalizeText(query);
  const compactQuery = normalizeCompactText(query);
  if (!normalizedQuery) return [];

  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("구글 API 키 설정이 필요합니다.");
  }

  const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(
    query,
  )}&maxResults=40&key=${apiKey}`;

  const data = await fetchJson<{ items?: GoogleBookItem[] }>(
    url,
    undefined,
    "Google Books API",
  );

  return (
    data.items
      ?.filter((item) => {
        const title = item.volumeInfo.title ?? "";
        if (!title.trim()) return false;
        const compactTitle = normalizeCompactText(title);
        const authors = (item.volumeInfo.authors || []).join("");
        const compactAuthors = normalizeCompactText(authors);
        return (
          compactTitle.includes(compactQuery) ||
          compactAuthors.includes(compactQuery)
        );
      })
      .map((item) => ({
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors?.join(", ") || "",
        image: item.volumeInfo.imageLinks?.thumbnail || "",
        publisher: item.volumeInfo.publisher || "",
        description: item.volumeInfo.description || undefined,
        isbn: extractIsbn(item.volumeInfo.industryIdentifiers),
        source: "google",
        pageCount: item.volumeInfo.pageCount || undefined,
      })) || []
  );
}
