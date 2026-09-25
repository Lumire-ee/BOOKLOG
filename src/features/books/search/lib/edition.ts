import type { SearchBook } from "./types";
import { normalizeText } from "./normalize";
import { generateBookKey, qualityScore } from "./merge";

// 1. 세트 도서 판정 정규식 (단권과 분리하여 독립 보존)
export const SET_REGEX =
  /(?:전\s*\d+\s*권(?:\s*세트)?|\b세트\b|박스\s*세트|box(?:ed)?\s*set|합본|완결\s*세트)/i;

// 2. 순수 판본/제본 수식어 키워드 (권수, 숫자, 제목 명사는 보존하고 수식어만 타겟팅)
export const PURE_EDITION_PATTERNS = [
  /\b\d+\s*주년(?:\s*기념(?:판|에디션)?)?/gi,
  /(?:개정증보|개정|증보|한정|특별|스페셜|기념|콜렉터스|딜럭스|리미티드)\s*(?:판|본|에디션)?/gi,
  /(?:양장본|반양장|양장|하드커버|페이퍼백|문고판|보급판|애장판|무선본|무선)/gi,
  /(?:hardcover|paperback|collector'?s|deluxe|anniversary|limited|special)\s*(?:edition)?/gi,
  /(?:전자책|ebook|오디오북|audiobook)/gi,
  /(?:완역본|무삭제판|리커버(?:판)?)/gi,
];

/** 세트 도서 여부 판별 */
export function isSetBook(title: string): boolean {
  return SET_REGEX.test(title);
}

/** 판본 변종 여부 판별 */
export function isEditionVariant(title: string): boolean {
  return PURE_EDITION_PATTERNS.some((pattern) => pattern.test(title));
}

/**
 * 권수(1권, 2권, 상/하권)나 고유 부제는 철저히 보존하고,
 * 순수 판본 수식어(양장본, 개정판 등)만 안전하게 핀셋 제거합니다.
 */
export function stripEditionKeywords(title: string): string {
  let cleaned = title;

  // 1) 괄호 내부에서 판본 키워드만 핀셋 제거 (괄호 안의 권수나 부제는 보존)
  cleaned = cleaned.replace(/\(([^)]+)\)|\[([^\]]+)\]/g, (_match, p1, p2) => {
    const inner = p1 || p2 || "";
    let strippedInner = inner;
    for (const pattern of PURE_EDITION_PATTERNS) {
      strippedInner = strippedInner.replace(pattern, "");
    }
    strippedInner = strippedInner.trim();
    // 괄호 안에 순수 판본 키워드만 있어서 다 비워졌다면 괄호 자체 삭제, 권수/부제가 남았다면 유지
    return strippedInner ? `(${strippedInner})` : "";
  });

  // 2) 괄호 밖의 본문 판본 키워드 제거 (세트 키워드는 지우지 않음)
  for (const pattern of PURE_EDITION_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }

  return cleaned.replace(/\s{2,}/g, " ").trim();
}

/**
 * 도서별 고유 그룹 키 생성
 * - 단권: [정제된제목]::[정규화저자]
 * - 세트: [정제된제목]::[정규화저자]::SET (단권과 절대 충돌하지 않음)
 */
export function baseTitleKey(book: SearchBook): string {
  const isSet = isSetBook(book.title);
  const baseTitle = stripEditionKeywords(book.title);
  const normalizedTitle = normalizeText(baseTitle);
  const normalizedAuthor = normalizeText(book.author);

  const keyParts = [normalizedTitle, normalizedAuthor].filter(Boolean);
  if (isSet) {
    keyParts.push("SET");
  }

  return keyParts.join("::");
}

export function groupByBaseTitle(
  books: ReadonlyArray<SearchBook>,
): SearchBook[] {
  const map = new Map<string, SearchBook[]>();

  for (const book of books) {
    const key = baseTitleKey(book) || generateBookKey(book);
    const list = map.get(key);
    if (!list) {
      map.set(key, [book]);
    } else {
      list.push(book);
    }
  }

  const winners: SearchBook[] = [];

  for (const variants of map.values()) {
    const best = variants.reduce((prev, current) => {
      const diff = qualityScore(current) - qualityScore(prev);
      if (diff === 0) {
        return current.title.length > prev.title.length ? prev : current;
      }
      return diff > 0 ? current : prev;
    });
    winners.push(best);
  }

  return winners;
}
