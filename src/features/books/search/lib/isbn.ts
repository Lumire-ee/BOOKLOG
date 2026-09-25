export function normalizeIsbn(isbn?: string | null): string | undefined {
  if (!isbn) return undefined;
  const cleaned = isbn.replace(/[\s-]+/g, "").trim();
  return cleaned || undefined;
}

export function parseKakaoIsbn(isbn?: string): string | undefined {
  if (!isbn) return undefined;

  const normalizedList = isbn
    .split(/\s+/)
    .map((value) => normalizeIsbn(value))
    .filter((value): value is string => Boolean(value));

  const isbn13 = normalizedList.find((code) => code.length === 13);
  return isbn13 ?? normalizedList[0];
}

export const parseNaverIsbn = parseKakaoIsbn;

export function extractIsbn(
  identifiers?: { type: string; identifier: string }[],
): string | undefined {
  if (!identifiers?.length) return undefined;

  const isbn13 = identifiers.find((item) => item.type === "ISBN_13");
  const cleanedIsbn13 = normalizeIsbn(isbn13?.identifier);
  if (cleanedIsbn13) return cleanedIsbn13;

  for (const item of identifiers) {
    const cleaned = normalizeIsbn(item.identifier);
    if (cleaned) return cleaned;
  }

  return undefined;
}
