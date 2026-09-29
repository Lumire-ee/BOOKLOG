import { useSyncExternalStore } from "react";

/**
 * 단일 책임 원칙(SRP): 미디어 쿼리 상태 감지 및 변경 이벤트 리스너 관리를 전담합니다.
 * React 18/19의 useSyncExternalStore를 활용하여 불필요한 이펙트 렌더링 없이 외부 CSSOM 상태와 동기화합니다.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") {
        return () => {};
      }
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener("change", onStoreChange);
      return () => {
        mediaQuery.removeEventListener("change", onStoreChange);
      };
    },
    () => {
      if (typeof window === "undefined") return false;
      return window.matchMedia(query).matches;
    },
    () => false,
  );
}
