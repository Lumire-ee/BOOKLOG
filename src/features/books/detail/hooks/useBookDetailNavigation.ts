import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useBookDetailModalStore } from "../store/useBookDetailModalStore";

const BOOK_ID_PARAM = "bookId";

/**
 * 단일 책임 원칙(SRP): 책 상세 정보의 URL 네비게이션 및 브라우저 히스토리 동기화만 전담합니다.
 * URL의 `?bookId=...`를 감시하여 브라우저 스와이프 뒤로가기, 직접 접속(딥링크),
 * 히스토리 이동 시 모달/페이지 상태가 완벽하게 동기화되도록 합니다.
 */
export function useBookDetailNavigation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const isOpen = useBookDetailModalStore((state) => state.isOpen);
  const selectedUserBookId = useBookDetailModalStore(
    (state) => state.selectedUserBookId,
  );
  const openStore = useBookDetailModalStore((state) => state.open);
  const closeStore = useBookDetailModalStore((state) => state.close);

  const urlBookId = searchParams.get(BOOK_ID_PARAM);

  // 1. URL 쿼리 파라미터(?bookId=...) 변경 감지 -> 스토어 동기화 (스와이프 뒤로가기, 딥링크 대응)
  useEffect(() => {
    if (urlBookId) {
      if (selectedUserBookId !== urlBookId || !isOpen) {
        openStore(urlBookId);
      }
    } else {
      if (isOpen) {
        closeStore();
      }
    }
  }, [urlBookId, isOpen, selectedUserBookId, openStore, closeStore]);

  // 2. 책 열기 액션: URL에 ?bookId 추가 (브라우저 히스토리 스택 1개 누적)
  function openBook(userBookId: string) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set(BOOK_ID_PARAM, userBookId);
    setSearchParams(nextParams);
  }

  // 3. 책 닫기 액션: 브라우저 뒤로가기 실행 (히스토리 정리)
  function closeBook() {
    if (urlBookId) {
      navigate(-1);
    } else {
      closeStore();
    }
  }

  return {
    isOpen,
    selectedUserBookId: urlBookId ?? selectedUserBookId,
    openBook,
    closeBook,
  };
}
