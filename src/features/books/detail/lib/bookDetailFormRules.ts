import type {
  EditableUserBookFields,
  UpdateUserBookPatch,
} from "@/features/books/detail/lib/types";
import type { UserBookWithInfo } from "@/shared/types/db";

function isDoneStatus(status: EditableUserBookFields["status"]): boolean {
  return status === "completed" || status === "quit";
}

export function toIntOrNull(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

export function todayKST(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(
    new Date(),
  );
}

export function createInitialForm(data: UserBookWithInfo): EditableUserBookFields {
  return {
    status: data.status,
    current_page: data.current_page,
    page_count_override: data.page_count_override,
    rating: data.rating,
    notes_md: data.notes_md,
    start_date: data.start_date,
    end_date: data.end_date,
  };
}

export function createCurrentPageText(
  initial: EditableUserBookFields,
): string {
  return initial.current_page == 0 || initial.current_page === null
    ? ""
    : String(initial.current_page);
}

export function createPageCountText(
  initial: EditableUserBookFields,
  bookPageCount: number | null,
): string {
  const initialDisplay = initial.page_count_override ?? bookPageCount;
  return initialDisplay == null ? "" : String(initialDisplay);
}

export function getTotalPageCount(
  form: EditableUserBookFields,
  bookPageCount: number | null,
): number | null {
  return form.page_count_override ?? bookPageCount ?? null;
}

export function applyStatusChange(
  prev: EditableUserBookFields,
  nextStatus: EditableUserBookFields["status"],
): EditableUserBookFields {
  const next: EditableUserBookFields = { ...prev, status: nextStatus };

  if (nextStatus === "reading") {
    // 1. reading이 되는 시점에 start_date가 null이면 현재 일자 자동 입력
    if (!next.start_date) {
      next.start_date = todayKST();
    }
    next.end_date = null;
  } else if (isDoneStatus(nextStatus)) {
    // 2. 완독(completed) 또는 중단(quit) 상태가 될 때 시작일과 종료일 보장
    if (!next.start_date) {
      next.start_date = todayKST();
    }
    if (!next.end_date) {
      next.end_date = todayKST();
    }
  } else if (nextStatus === "to_read") {
    next.end_date = null;
  }

  return next;
}

export function applyCurrentPageChange(
  prev: EditableUserBookFields,
  nextPage: number | null,
  totalPageCount: number | null,
): EditableUserBookFields {
  const next: EditableUserBookFields = { ...prev, current_page: nextPage };
  const cp = nextPage ?? 0;

  // 1. 현재 페이지 쪽수가 1 이상인 경우 시작일 자동 입력 및 reading 상태 전환
  if (cp >= 1) {
    if (!next.start_date) {
      next.start_date = todayKST();
    }
    if (next.status === "to_read") {
      next.status = "reading";
    }
  }

  // 2. 읽은 페이지 = 전체 페이지 (완독) 판정 시 end_date 및 completed 상태 자동 입력
  if (totalPageCount !== null && totalPageCount > 0 && cp >= totalPageCount) {
    next.status = "completed";
    if (!next.end_date) {
      next.end_date = todayKST();
    }
    if (!next.start_date) {
      next.start_date = todayKST();
    }
  } else if (
    prev.status === "completed" &&
    totalPageCount !== null &&
    cp < totalPageCount
  ) {
    // 완독 상태에서 페이지를 전체 페이지 미만으로 내린 경우 다시 reading으로 복귀
    next.status = "reading";
    next.end_date = null;
  }

  return next;
}

export function buildUpdateUserBookPatch(
  form: EditableUserBookFields,
  initial: EditableUserBookFields,
): UpdateUserBookPatch {
  const patch: UpdateUserBookPatch = {};

  if (form.status !== initial.status) patch.status = form.status;
  if (form.current_page !== initial.current_page) patch.current_page = form.current_page;
  if (form.page_count_override !== initial.page_count_override) {
    patch.page_count_override = form.page_count_override;
  }
  if (form.rating !== initial.rating) patch.rating = form.rating;
  if (form.notes_md !== initial.notes_md) patch.notes_md = form.notes_md;
  if (form.start_date !== initial.start_date) patch.start_date = form.start_date;
  if (form.end_date !== initial.end_date) patch.end_date = form.end_date;

  return patch;
}

export function calculateProgressValue(
  currentPage: number | null,
  totalPageCount: number | null,
): number {
  const safeCurrentPage = Math.max(currentPage ?? 0, 0);
  const safeTotalPageCount = totalPageCount ?? 0;
  const boundedCurrentPage =
    safeTotalPageCount > 0 ? Math.min(safeCurrentPage, safeTotalPageCount) : 0;

  return safeTotalPageCount > 0
    ? Math.round((boundedCurrentPage / safeTotalPageCount) * 100)
    : 0;
}


