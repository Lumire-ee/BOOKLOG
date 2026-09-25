import type { SearchBook } from "./types";
import { normalizeCompactText, normalizeText } from "./normalize";
import { isSetBook } from "./edition";
import { qualityScore } from "./merge";

/**
 * 수험서, 은어, 엉뚱한 복합어 등 사용자 의도와 무관한 도서인지 판별합니다.
 */
export function isIrrelevantBook(book: SearchBook, query: string): boolean {
  const title = book.title?.trim() || "";
  const author = book.author?.trim() || "";
  const compactTitle = normalizeCompactText(title);
  const compactAuthor = normalizeCompactText(author);
  const compactQuery = normalizeCompactText(query);

  if (!compactQuery) return true;

  // 1. 제목과 저자 어디에도 검색어가 포함되어 있지 않은 경우 (구글 본문 매칭 등 노이즈 차단)
  if (
    !compactTitle.includes(compactQuery) &&
    !compactAuthor.includes(compactQuery)
  ) {
    return true;
  }

  // 2. 단어 길이가 짧은 쿼리(예: "듄")일 때의 특정 노이즈 필터링
  if (compactQuery.length <= 3) {
    // 수험서 은어(EBS 수능특강을 듄이라 부르는 경우 등) 차단
    if (/(?:EBS|수능특강|교과서|기출|모의고사|변형문제)/i.test(title)) {
      return true;
    }
    // 지명/여행기 안내서(나미비아 사구 '듄45' 등) 차단
    if (
      /(?:아프리카\s*대백과사전|히치하이커를\s*위한\s*안내서|듄\s*45)/i.test(title)
    ) {
      return true;
    }
  }

  return false;
}

/**
 * 도서 제목에서 권수(Volume Number)를 추출합니다.
 * 세트 도서는 0, 권수가 없으면 999를 반환합니다.
 */
export function extractVolumeNumber(title: string): number {
  if (isSetBook(title)) {
    return 0; // 세트 도서는 0순위
  }

  // "제 2권", "시리즈 1권", "듄 2", "2권" 등 권수 추출
  const patterns = [
    /(?:제\s*|시리즈\s*)(\d+)(?:\s*권|\s*부|\s*편|\b)/i,
    /(?:^|[^\w가-힣])(\d+)(?:\s*권|\s*부|\s*편)/i,
    new RegExp(`(?:^|\\s)(?:\\d+|\\D+)\\s*(\\d+)(?:\\s*[:.,\\-\\[(]|$)`),
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match?.[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > 0 && num < 100) {
        return num;
      }
    }
  }

  // 예: "듄 2"
  const directMatch = title.match(/\b\d+\b/);
  if (directMatch) {
    const num = parseInt(directMatch[0], 10);
    if (!isNaN(num) && num > 0 && num < 100) {
      return num;
    }
  }

  return 999;
}

/**
 * 검색어와 도서의 관련도 점수를 계산합니다.
 */
export function calculateRelevanceScore(book: SearchBook, query: string): number {
  if (isIrrelevantBook(book, query)) {
    return -999;
  }

  const title = book.title?.trim() || "";
  const author = book.author?.trim() || "";
  const compactTitle = normalizeCompactText(title);
  const compactAuthor = normalizeCompactText(author);
  const compactQuery = normalizeCompactText(query);
  const normalizedQuery = normalizeText(query);

  let score = 0;

  // 1. 제목 일치도 점수
  if (compactTitle === compactQuery) {
    // 완전 일치 (예: "듄")
    score += 1000;
  } else if (
    new RegExp(
      `^${escapeRegExp(query)}(?:\\s*\\d+|\\s*[:.,\\-\\[(]|\\s*시리즈|\\s*세트|$)`,
      "i",
    ).test(title)
  ) {
    // 검색어로 시작하는 제목 (예: "듄 1", "듄 2: 듄의 메시아", "듄 1~6권 세트")
    score += 600;
  } else if (
    new RegExp(
      `(?:^|[^\\w가-힣])${escapeRegExp(normalizedQuery)}(?:[^\\w가-힣]|$)`,
      "i",
    ).test(title)
  ) {
    // 단어 경계로 포함된 제목 (예: "듄: 메이킹필름북", "듄의 세계")
    score += 300;
  } else if (compactTitle.includes(compactQuery)) {
    // 단순 포함
    score += 150;
  }

  // 2. 저자 매칭 점수
  if (compactAuthor.includes(compactQuery)) {
    score += 250;
  }

  // 3. 시리즈 권수 우선순위 가산점 (앞 권 및 세트 우선)
  const vol = extractVolumeNumber(title);
  if (vol === 0) {
    score += 95; // 세트 도서
  } else if (vol >= 1 && vol <= 6) {
    score += 100 - vol * 10; // 1권(+90), 2권(+80), 3권(+70)...
  } else if (vol < 999) {
    score += Math.max(5, 30 - vol);
  }

  // 4. 원작 작가 가산점 (프랭크 허버트 등 공인 원작자 도서 우대)
  if (/(?:프랭크\s*허버트|Frank\s*Herbert)/i.test(author)) {
    score += 200;
  }

  // 5. 기본 메타데이터 품질 가산점
  score += qualityScore(book);

  return score;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 도서 목록을 검색어와의 관련도 점수(Relevance) 순으로 정렬합니다.
 */
export function sortBooksByRelevance(
  books: ReadonlyArray<SearchBook>,
  query: string,
): SearchBook[] {
  return books
    .filter((book) => !isIrrelevantBook(book, query))
    .map((book) => ({
      book,
      score: calculateRelevanceScore(book, query),
    }))
    .sort((a, b) => b.score - a.score)
    .map((item) => item.book);
}
