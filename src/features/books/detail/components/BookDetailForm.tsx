import { Button } from "@/components/ui/button";
import type { UserBookWithInfo } from "@/shared/types/db";
import { useBookDetailForm } from "@/features/books/detail/hooks/useBookDetailForm";
import { useBookDetailDateFields } from "@/features/books/detail/hooks/useBookDetailDateFields";
import { useUpdateUserBook } from "@/features/books/detail/hooks/useUpdateUserBook";
import { useBookDetailNavigation } from "@/features/books/detail/hooks/useBookDetailNavigation";
import { calculateProgressValue } from "@/features/books/detail/lib/bookDetailFormRules";
import BookDetailDateSection from "./BookDetailDateSection";
import BookDetailNotesSection from "./BookDetailNotesSection";
import BookDetailPageSection from "./BookDetailPageSection";
import BookDetailRatingSection from "./BookDetailRatingSection";
import BookDetailStatusSection from "./BookDetailStatusSection";

type Props = {
  userBookId: string;
  data: UserBookWithInfo;
};

export default function BookDetailForm({ userBookId, data }: Props) {
  const { closeBook: closeModal } = useBookDetailNavigation();
  const {
    form,
    currentPageText,
    pageCountText,
    pageCountError,
    totalPageCount,
    patch,
    isDirty,
    onStatusChange,
    onCurrentPageTextChange,
    onCurrentPageBlur,
    onPageCountTextChange,
    onPageCountBlur,
    validatePageCount,
    onRatingToggle,
    onStartDateChange,
    onEndDateChange,
    onNotesChange,
  } = useBookDetailForm({ data });
  const { mutate, isPending } = useUpdateUserBook(userBookId);

  const progressValue = calculateProgressValue(
    form.current_page,
    totalPageCount,
  );
  const {
    startDate,
    endDate,
    isStartDateOpen,
    isEndDateOpen,
    setIsStartDateOpen,
    setIsEndDateOpen,
    isStartDateDisabled,
    isEndDateDisabled,
  } = useBookDetailDateFields({
    startDateText: form.start_date,
    endDateText: form.end_date,
  });

  return (
    <div className="flex flex-1 flex-col justify-between space-y-6 sm:block sm:space-y-4">
      <div className="space-y-3">
        <BookDetailStatusSection
          status={form.status}
          onStatusChange={onStatusChange}
        />

        <BookDetailPageSection
          currentPageText={currentPageText}
          pageCountText={pageCountText}
          pageCountError={pageCountError}
          progressValue={progressValue}
          onCurrentPageTextChange={onCurrentPageTextChange}
          onCurrentPageBlur={onCurrentPageBlur}
          onPageCountTextChange={onPageCountTextChange}
          onPageCountBlur={onPageCountBlur}
        />

        <BookDetailRatingSection
          rating={form.rating}
          onRatingToggle={onRatingToggle}
        />

        <BookDetailDateSection
          startDate={startDate}
          endDate={endDate}
          isStartDateOpen={isStartDateOpen}
          isEndDateOpen={isEndDateOpen}
          setIsStartDateOpen={setIsStartDateOpen}
          setIsEndDateOpen={setIsEndDateOpen}
          isStartDateDisabled={isStartDateDisabled}
          isEndDateDisabled={isEndDateDisabled}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
        />

        <BookDetailNotesSection
          notes={form.notes_md}
          onNotesChange={onNotesChange}
        />
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 -mb-5 bg-bg-elevated p-4 sm:static sm:m-0 sm:bg-transparent sm:p-0">
        <Button
          type="button"
          className="h-10 w-full sm:h-9"
          disabled={!isDirty || isPending || Boolean(pageCountError)}
          onClick={() => {
            const isValidPageCount = validatePageCount();
            if (!isValidPageCount) return;

            mutate(patch, {
              onSuccess: () => {
                closeModal();
              },
            });
          }}
        >
          저장
        </Button>
      </div>
    </div>
  );
}
