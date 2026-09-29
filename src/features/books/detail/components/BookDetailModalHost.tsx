import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useBookDetailNavigation } from "../hooks/useBookDetailNavigation";
import BookDetailMobileHeader from "./BookDetailMobileHeader";
import BookDetailModalContent from "./BookDetailModalContent";

export default function BookDetailModalHost() {
  const { isOpen, selectedUserBookId, closeBook } = useBookDetailNavigation();
  const isDesktopOrTablet = useMediaQuery("(min-width: 640px)");

  // 모바일 전체화면 뷰가 열렸을 때 외부(body) 스크롤 차단 (이중 스크롤 방지)
  useBodyScrollLock(isOpen && !isDesktopOrTablet);

  if (!isOpen) return null;

  // 1. PC 및 태블릿: 원래의 스크롤 없는 컴팩트 모달 다이얼로그 100% 유지
  if (isDesktopOrTablet) {
    return (
      <Dialog
        open={isOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeBook();
        }}
      >
        <DialogContent className="bg-bg-elevated sm:max-w-[420px] md:max-w-[560px] lg:max-w-[640px]">
          <DialogTitle className="sr-only">책 상세 정보</DialogTitle>
          <DialogDescription className="sr-only">
            선택한 책의 상태와 메모를 확인하거나 수정합니다.
          </DialogDescription>

          {selectedUserBookId ? (
            <BookDetailModalContent userBookId={selectedUserBookId} />
          ) : (
            <p className="typo-label-sm text-text-secondary">
              선택된 책이 없습니다.
            </p>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // 2. 모바일: 전체 화면 페이지 (이중 카드/외곽 여백 제거, 단일 전체화면 페이지로 통일)
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex h-dvh w-full flex-col overflow-y-auto overscroll-contain bg-bg-elevated"
    >
      <BookDetailMobileHeader onBack={closeBook} />

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-4 pb-5">
        {selectedUserBookId ? (
          <BookDetailModalContent userBookId={selectedUserBookId} />
        ) : (
          <p className="typo-label-sm text-text-secondary">
            선택된 책이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
