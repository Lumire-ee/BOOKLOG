import BookDetailForm from "./BookDetailForm";
import { useBookDetail } from "@/hooks/useBookDetail";
import { toProxiedThumbnailSrc } from "@/features/books/lib/thumbnailProxy";
import { THUMB_SIZES } from "@/shared/constants/thumbnail";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader } from "lucide-react";

type BookDetailModalContentProps = {
  userBookId: string;
};

export default function BookDetailModalContent({
  userBookId,
}: BookDetailModalContentProps) {
  const { data, loading, isError, refetch } = useBookDetail(userBookId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader className="text-text-secondary animation-duration-[2s] h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-10">
        <AlertTriangle
          className="text-text-secondary h-10 w-10 stroke-[1.3]"
          aria-hidden="true"
        />
        <div className="space-y-2 text-center">
          <p className="typo-heading-md text-text-primary">
            현재 정보를 불러오지 못했습니다.
          </p>
          <p className="typo-label-xs text-text-secondary">
            잠시 후 다시 시도해주세요.
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="secondary"
          className="text-accent-red border-accent-red border"
        >
          다시 시도하기
        </Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col space-y-4">
      <div className="flex gap-10 px-3">
        {data.book.thumbnail ? (
          <img
            src={toProxiedThumbnailSrc(data.book.thumbnail, THUMB_SIZES.SMALL)}
            alt={data.book.title}
            className="h-20 w-14 rounded-sm object-cover"
          />
        ) : (
          <div className="bg-bg-surface-subtitle h-20 w-14 rounded-sm" />
        )}

        <div className="flex min-w-0 flex-col justify-between py-1">
          <div>
            <p className="typo-heading-md text-text-primary truncate">
              {data.book.title}
            </p>
          </div>
          <div>
            <p className="typo-label-sm text-text-secondary truncate">
              {data.book.author}
            </p>
            <p className="typo-label-sm text-text-secondary truncate">
              {data.book.publisher ?? "출판사 정보 없음"}
            </p>
          </div>
        </div>
      </div>

      <BookDetailForm key={userBookId} userBookId={userBookId} data={data} />
    </div>
  );
}

