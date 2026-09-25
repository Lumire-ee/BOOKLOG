export type BookSource = "kakao" | "google" | "naver";

export interface SearchBook {
  title: string;
  author: string;
  image: string;
  publisher: string;
  description?: string;
  isbn?: string;
  source: BookSource;
  pageCount?: number;
}

export interface SearchOptions {
  includeVariants?: boolean;
}
