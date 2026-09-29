import BookListRow from "@/features/books/components/BookListRow";
import type { UserBookWithInfo } from "@/shared/types/db";
import type { ReactNode } from "react";
import ReadingBookCard from "./ReadingBookCard";
import HomeBookSectionSkeleton from "./HomeBookSectionSkeleton";
import { useReadingQuickActions } from "../hooks/useReadingQuickActions";
import BookItemMenu from "./BookItemMenu";

type HomeBookSectionProps = {
  title: string;
  loading: boolean;
  isError: boolean;
  items: UserBookWithInfo[];
  emptyText: string;
  onOpenBook: (userBookId: string) => void;
  renderRight?: (item: UserBookWithInfo) => ReactNode;
  layout?: "row" | "card";
  showQuickActions?: boolean;
};

export default function HomeBookSection({
  title,
  loading,
  isError,
  items,
  emptyText,
  onOpenBook,
  renderRight,
  layout = "row",
  showQuickActions = false,
}: HomeBookSectionProps) {
  const isCardLayout = layout === "card";
  const {
    updateStatus,
    pendingVariables,
    isUpdatingStatus,
    removeBook,
    deletingBookId,
    isDeleting,
  } = useReadingQuickActions();

  return (
    <div>
      <h2 className="typo-heading-sm text-text-primary">{title}</h2>
      <div className="mt-4">
        {loading ? (
          <HomeBookSectionSkeleton layout={layout} />
        ) : isError ? (
          <p className="typo-label-sm text-status-danger">
            책 목록을 불러오지 못했습니다.
          </p>
        ) : items.length === 0 ? (
          <p className="typo-label-sm text-text-secondary">{emptyText}</p>
        ) : (
          <>
            {isCardLayout ? (
              <div className="grid w-full min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <ReadingBookCard
                    key={item.id}
                    item={item}
                    onOpenBook={onOpenBook}
                    showQuickActions={showQuickActions}
                    isUpdatingStatus={isUpdatingStatus}
                    pendingUserBookId={pendingVariables?.userBookId}
                    onComplete={(userBookId) =>
                      updateStatus({ userBookId, status: "completed" })
                    }
                    onQuit={(userBookId) =>
                      updateStatus({ userBookId, status: "quit" })
                    }
                    onDelete={(userBookId) => removeBook(userBookId)}
                    isDeleting={isDeleting}
                    deletingUserBookId={deletingBookId}
                  />
                ))}
              </div>
            ) : (
              <div className="grid w-full min-w-0 gap-2 md:grid-cols-2">
                {items.map((item) => (
                  <BookListRow
                    key={item.id}
                    thumbnail={item.book.thumbnail!}
                    title={item.book.title}
                    author={item.book.author}
                    onClick={() => onOpenBook(item.id)}
                    right={renderRight?.(item)}
                    topRight={
                      <BookItemMenu
                        bookTitle={item.book.title}
                        onEdit={() => onOpenBook(item.id)}
                        onDelete={() => removeBook(item.id)}
                        isDeleting={isDeleting && deletingBookId === item.id}
                        triggerClassName="opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto"
                      />
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
