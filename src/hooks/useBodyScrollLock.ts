import { useEffect } from "react";

/**
 * 모달, 드로어 등 전체화면 오버레이가 활성화되었을 때
 * document.body의 외부 스크롤을 잠그고 해제하는 훅
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isLocked]);
}
