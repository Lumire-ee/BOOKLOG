import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface BookDetailMobileHeaderProps {
  onBack: () => void;
  title?: string;
}

/**
 * 단일 책임 원칙(SRP): 모바일 전체화면 페이지 상단의 뒤로가기 네비게이션 헤더 렌더링을 전담합니다.
 */
export default function BookDetailMobileHeader({
  onBack,
  title = "책 상세 정보",
}: BookDetailMobileHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-border-default bg-bg-elevated/95 px-2 backdrop-blur-md">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="iconGhost"
          size="icon-lg"
          onClick={onBack}
          aria-label="뒤로 가기"
          className="size-10 rounded-full"
        >
          <ChevronLeft className="size-6 text-text-primary" />
        </Button>
        <h1 className="typo-heading-sm text-text-primary">{title}</h1>
      </div>
    </header>
  );
}
