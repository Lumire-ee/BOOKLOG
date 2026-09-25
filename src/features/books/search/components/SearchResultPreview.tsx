import { THUMB_SIZES } from "@/shared/constants/thumbnail";
import { toProxiedThumbnailSrc } from "@/features/books/lib/thumbnailProxy";
import type { SearchBook } from "../lib/types";

interface SearchResultPreviewProps {
  book: SearchBook | null;
}

export default function SearchResultPreview({
  book,
}: SearchResultPreviewProps) {
  if (!book) return null;

  return (
    <div className="flex flex-col gap-4 overflow-hidden">
      <div className="flex justify-center gap-4 py-6">
        <div className="shrink-0">
          <img
            src={toProxiedThumbnailSrc(book.image, THUMB_SIZES.LARGE)}
            alt={book.title}
            className="h-56 w-40 rounded-md object-cover"
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="flex flex-col gap-1 pb-4">
          <h2 className="typo-heading-sm text-text-primary line-clamp-2">
            {book.title}
          </h2>

          <p className="typo-body-sm text-text-secondary line-clamp-1">
            {book.publisher
              ? `${book.author} · ${book.publisher}`
              : book.author}
            {book.pageCount ? ` · ${book.pageCount}쪽` : ""}
          </p>
        </div>

        <div className="border-border-default border-l-2 pl-3">
          {book.description ? (
            <p className="typo-caption text-text-secondary line-clamp-4 break-keep">
              {book.description}
            </p>
          ) : (
            <p className="typo-caption text-text-secondary">
              책 소개가 제공되지 않습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

