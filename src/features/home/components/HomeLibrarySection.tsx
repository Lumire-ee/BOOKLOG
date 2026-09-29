import { useMemo, useState } from "react";
import {
  Check,
  EllipsisVertical,
  Folder,
  FolderOpen,
  ImageOff,
  Pencil,
  Trash2,
} from "lucide-react";
import type { LibraryFolder, UserBookWithInfo } from "@/shared/types/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import BookListRow from "@/features/books/components/BookListRow";
import { THUMB_SIZES } from "@/shared/constants/thumbnail";
import { toProxiedThumbnailSrc } from "@/features/books/lib/thumbnailProxy";
import HomeBookSectionSkeleton from "@/features/home/components/HomeBookSectionSkeleton";
import HomeRatingStars from "@/features/home/components/HomeRatingStars";
import BookItemMenu from "@/features/home/components/BookItemMenu";
import LibraryCreateFolderDialog from "@/features/home/components/LibraryCreateFolderDialog";
import LibraryDeleteBooksDialog from "@/features/home/components/LibraryDeleteBooksDialog";
import LibraryDeleteFolderDialog from "@/features/home/components/LibraryDeleteFolderDialog";
import LibraryMoveBooksDialog from "@/features/home/components/LibraryMoveBooksDialog";
import LibraryRenameFolderDialog from "@/features/home/components/LibraryRenameFolderDialog";
import { useHomeLibraryMutations } from "@/features/home/hooks/useHomeLibraryMutations";
import { useLibraryFolders } from "@/features/home/hooks/useLibraryFolders";
import { useLibraryMultiSelect } from "@/features/home/hooks/useLibraryMultiSelect";
import { useReadingQuickActions } from "@/features/home/hooks/useReadingQuickActions";
import { STATUS_LABEL } from "@/features/home/lib/librarySectionConstants";
import {
  deriveLibraryCollections,
  resolveExpandedFolderId,
} from "@/features/home/lib/librarySectionSelectors";

type HomeLibrarySectionProps = {
  userId: string | null;
  loading: boolean;
  isError: boolean;
  items: UserBookWithInfo[];
  emptyText: string;
  onOpenBook: (userBookId: string) => void;
};

function FolderCover({
  folder,
  books,
}: {
  folder: LibraryFolder;
  books: UserBookWithInfo[];
}) {
  const coverBook = books.find((book) => book.id === folder.cover_user_book_id);
  if (!coverBook?.book.thumbnail) {
    return (
      <div className="bg-bg-surface-subtitle text-text-secondary border-border-default flex h-20 w-16 items-center justify-center rounded-md border">
        <ImageOff className="size-4" />
      </div>
    );
  }

  return (
    <img
      src={toProxiedThumbnailSrc(coverBook.book.thumbnail, THUMB_SIZES.SMALL)}
      alt={folder.name}
      className="bg-bg-surface-subtitle h-20 w-16 rounded-md object-cover"
    />
  );
}

export default function HomeLibrarySection({
  userId,
  loading,
  isError,
  items,
  emptyText,
  onOpenBook,
}: HomeLibrarySectionProps) {
  const {
    removeBook,
    deletingBookId,
    isDeleting: isSingleDeleting,
  } = useReadingQuickActions();
  const {
    data: foldersData,
    isLoading: foldersLoading,
    isError: foldersError,
  } = useLibraryFolders(userId);
  const {
    createFolder,
    moveBooks,
    removeBooks,
    removeFolder,
    renameFolder,
    isCreatingFolder,
    isMovingBooks,
    isDeletingBooks,
    isDeletingFolder,
    isRenamingFolder,
  } = useHomeLibraryMutations();
  const {
    isEditMode,
    selectedBookIds,
    selectedBookIdSet,
    selectedBooks,
    selectedCount,
    toggleBookSelected,
    toggleEditMode,
    clearSelection,
  } = useLibraryMultiSelect(items);

  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [moveDialogSession, setMoveDialogSession] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createDialogSession, setCreateDialogSession] = useState(0);
  const [isDeleteBooksDialogOpen, setIsDeleteBooksDialogOpen] = useState(false);
  const [folderDeleteTarget, setFolderDeleteTarget] =
    useState<LibraryFolder | null>(null);
  const [isFolderDeleteDialogOpen, setIsFolderDeleteDialogOpen] =
    useState(false);
  const [folderRenameTarget, setFolderRenameTarget] =
    useState<LibraryFolder | null>(null);
  const [isFolderRenameDialogOpen, setIsFolderRenameDialogOpen] =
    useState(false);
  const [renameDialogSession, setRenameDialogSession] = useState(0);

  const folders = useMemo(() => foldersData ?? [], [foldersData]);
  const { folderEntries, folderOptions, unfiledBooks } = useMemo(
    () => deriveLibraryCollections(items, folders),
    [items, folders],
  );
  const effectiveExpandedFolderId = useMemo(
    () => resolveExpandedFolderId(expandedFolderId, folderEntries),
    [expandedFolderId, folderEntries],
  );

  async function handleCreateFolder(args: {
    name: string;
    coverUserBookId: string;
  }) {
    try {
      await createFolder({
        name: args.name,
        userBookIds: selectedBookIds,
        coverUserBookId: args.coverUserBookId,
      });
      setIsCreateDialogOpen(false);
      clearSelection();
      return true;
    } catch {
      return false;
    }
  }

  async function handleMoveSelectedBooks(targetFolderId: string | null) {
    try {
      await moveBooks({
        userBookIds: selectedBookIds,
        targetFolderId,
      });
      setIsMoveDialogOpen(false);
      clearSelection();
      return true;
    } catch {
      return false;
    }
  }

  async function handleDeleteSelectedBooks() {
    try {
      await removeBooks(selectedBookIds);
      setIsDeleteBooksDialogOpen(false);
      clearSelection();
    } catch {
      return;
    }
  }

  async function handleDeleteFolder() {
    if (!folderDeleteTarget) return false;

    try {
      await removeFolder({
        folderId: folderDeleteTarget.id,
        deleteBooks: true,
      });
      setIsFolderDeleteDialogOpen(false);
      setFolderDeleteTarget(null);
      return true;
    } catch {
      return false;
    }
  }

  async function handleRenameFolder(name: string) {
    if (!folderRenameTarget) return false;

    try {
      await renameFolder({
        folderId: folderRenameTarget.id,
        name,
      });
      setIsFolderRenameDialogOpen(false);
      setFolderRenameTarget(null);
      return true;
    } catch {
      return false;
    }
  }

  function handleRenameDialogOpenChange(nextOpen: boolean) {
    setIsFolderRenameDialogOpen(nextOpen);
    if (!nextOpen) {
      setFolderRenameTarget(null);
    }
  }

  function handleToggleEditMode() {
    if (isEditMode) {
      clearSelection();
      setIsMoveDialogOpen(false);
      setIsCreateDialogOpen(false);
      setIsDeleteBooksDialogOpen(false);
    }
    toggleEditMode();
  }

  function renderRight(item: UserBookWithInfo) {
    const badge =
      item.status === "reading" ? null : (
        <Badge variant={item.status}>{STATUS_LABEL[item.status]}</Badge>
      );

    if (isEditMode) {
      return badge ? <div className="flex items-center">{badge}</div> : null;
    }

    return badge ? (
      <div className="flex shrink-0 items-center">
        {badge}
      </div>
    ) : null;
  }

  function renderBookRow(item: UserBookWithInfo) {
    const isSelected = selectedBookIdSet.has(item.id);
    return (
      <BookListRow
        key={item.id}
        thumbnail={item.book.thumbnail ?? ""}
        leading={
          isEditMode && isSelected ? (
            <span className="bg-accent-indigo/90 flex size-5 items-center justify-center rounded-sm text-white shadow-sm">
              <Check className="size-3.5" />
            </span>
          ) : undefined
        }
        hideThumbnailOnMobile
        hideAuthorOnMobile
        title={item.book.title}
        author={item.book.author}
        rating={
          item.rating !== null ? (
            <span className="hidden sm:inline-flex">
              <HomeRatingStars value={item.rating} />
            </span>
          ) : undefined
        }
        onClick={
          isEditMode
            ? () => toggleBookSelected(item.id)
            : () => onOpenBook(item.id)
        }
        right={renderRight(item)}
        className={cn(
          isEditMode && isSelected ? "bg-bg-surface-hover" : undefined,
        )}
        topRight={
          !isEditMode ? (
            <div className="hidden sm:block">
              <BookItemMenu
                bookTitle={item.book.title}
                onEdit={() => onOpenBook(item.id)}
                onDelete={() => removeBook(item.id)}
                isDeleting={isSingleDeleting && deletingBookId === item.id}
                triggerClassName="pointer-events-none opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
              />
            </div>
          ) : undefined
        }
      />
    );
  }

  const isSectionLoading = loading || (Boolean(userId) && foldersLoading);
  const isSectionError = isError || foldersError;

  return (
    <>
      <div>
        <div className="flex items-center justify-between gap-2">
          <h2 className="typo-heading-sm text-text-primary">나의 서재</h2>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {isEditMode ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={selectedCount === 0}
                  onClick={() => {
                    setMoveDialogSession((prev) => prev + 1);
                    setIsMoveDialogOpen(true);
                  }}
                >
                  폴더로 이동
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={selectedCount === 0}
                  onClick={() => {
                    setCreateDialogSession((prev) => prev + 1);
                    setIsCreateDialogOpen(true);
                  }}
                >
                  폴더 만들기
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="hover:text-accent-red focus:text-accent-red"
                  variant="outline"
                  disabled={selectedCount === 0}
                  onClick={() => setIsDeleteBooksDialogOpen(true)}
                >
                  책 삭제
                </Button>
              </>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleEditMode}
            >
              {isEditMode ? "저장" : "편집"}
            </Button>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {isSectionLoading ? (
            <HomeBookSectionSkeleton layout="row" />
          ) : isSectionError ? (
            <p className="typo-label-sm text-status-danger">
              서재를 불러오지 못했습니다.
            </p>
          ) : items.length === 0 ? (
            <p className="typo-label-sm text-text-secondary">{emptyText}</p>
          ) : (
            <>
              {folderEntries.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {folderEntries.map(({ folder, books }) => {
                      const isExpanded =
                        effectiveExpandedFolderId === folder.id;

                      return (
                        <div
                          role="button"
                          tabIndex={0}
                          key={folder.id}
                          onClick={() => {
                            setExpandedFolderId((prev) =>
                              prev === folder.id ? null : folder.id,
                            );
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setExpandedFolderId((prev) =>
                                prev === folder.id ? null : folder.id,
                              );
                            }
                          }}
                          className={cn(
                            "border-border-default bg-bg-elevated hover:bg-bg-surface-hover has-[button[data-item-menu='true']:hover]:bg-transparent group relative flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                            isExpanded
                              ? "bg-bg-surface-hover ring-accent-indigo/40 ring-1"
                              : undefined,
                          )}
                        >
                          <FolderCover folder={folder} books={books} />

                          <div className="flex min-w-0 flex-1 items-stretch gap-2">
                            <div
                              aria-hidden
                              className={cn(
                                "w-0.5 shrink-0 rounded-full",
                                isExpanded
                                  ? "bg-accent-indigo"
                                  : "bg-border-default",
                              )}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="typo-label-md text-text-primary truncate">
                                {folder.name}
                              </p>
                              <p className="typo-label-sm text-text-secondary mt-1">
                                {books.length}권
                              </p>
                            </div>
                          </div>

                          <div
                            className={cn(
                              "text-text-secondary ml-auto flex shrink-0 items-center transition-[margin] duration-150 ease-out",
                              !isEditMode
                                ? "mr-10 sm:mr-0 sm:group-focus-within:mr-10 sm:group-hover:mr-10"
                                : undefined,
                            )}
                          >
                            {isExpanded ? (
                              <FolderOpen className="size-4" />
                            ) : (
                              <Folder className="size-4" />
                            )}
                          </div>

                          {!isEditMode ? (
                            <div
                              className="absolute top-1/2 right-1 z-10 -translate-y-1/2"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="iconGhost"
                                    size="icon-sm"
                                    data-item-menu="true"
                                    aria-label={`${folder.name} 메뉴 열기`}
                                    className="hover:bg-bg-surface-hover text-text-primary pointer-events-auto border-0 bg-transparent opacity-100 shadow-none transition-opacity sm:pointer-events-none sm:opacity-0 sm:group-focus-within:pointer-events-auto sm:group-focus-within:opacity-100 sm:group-hover:pointer-events-auto sm:group-hover:opacity-100"
                                  >
                                    <EllipsisVertical className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setFolderRenameTarget(folder);
                                      setRenameDialogSession(
                                        (prev) => prev + 1,
                                      );
                                      setIsFolderRenameDialogOpen(true);
                                    }}
                                  >
                                    <Pencil className="size-4" />
                                    폴더 이름 변경
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="hover:text-accent-red focus:text-accent-red"
                                    onClick={() => {
                                      setFolderDeleteTarget(folder);
                                      setIsFolderDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="size-4" />
                                    폴더 삭제
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-3">
                    {folderEntries.map(({ folder, books }) => {
                      const shouldShow =
                        effectiveExpandedFolderId === folder.id;
                      if (!shouldShow) return null;

                      return (
                        <div
                          key={`${folder.id}-books`}
                          className="border-accent-indigo/40 ring-accent-indigo/40 bg-bg-surface-hover space-y-2 rounded-lg border p-2 ring-1"
                        >
                          <p className="typo-label-sm text-text-primary px-1">
                            {folder.name}
                          </p>
                          <div className="grid gap-2 md:grid-cols-2">
                            {books.map((item) => renderBookRow(item))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div
                className={cn(
                  "space-y-2",
                  folderEntries.length > 0
                    ? "border-border-default mt-6 border-t pt-4"
                    : undefined,
                )}
              >
                <p className="typo-label-sm text-text-primary px-1">미분류</p>
                {unfiledBooks.length > 0 ? (
                  <div className="grid gap-2 md:grid-cols-2">
                    {unfiledBooks.map((item) => renderBookRow(item))}
                  </div>
                ) : (
                  <p className="typo-label-sm text-text-secondary px-1">
                    미분류 책이 없습니다.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <LibraryMoveBooksDialog
        key={`move-${moveDialogSession}`}
        open={isMoveDialogOpen}
        onOpenChange={setIsMoveDialogOpen}
        selectedCount={selectedCount}
        folderOptions={folderOptions}
        isPending={isMovingBooks}
        onConfirm={handleMoveSelectedBooks}
      />

      <LibraryCreateFolderDialog
        key={`create-${createDialogSession}`}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        selectedBooks={selectedBooks}
        selectedCount={selectedCount}
        isPending={isCreatingFolder}
        onConfirm={handleCreateFolder}
      />

      <LibraryDeleteBooksDialog
        open={isDeleteBooksDialogOpen}
        onOpenChange={setIsDeleteBooksDialogOpen}
        selectedCount={selectedCount}
        selectedBookTitle={selectedBooks[0]?.book.title ?? ""}
        isPending={isDeletingBooks}
        onConfirm={handleDeleteSelectedBooks}
      />

      <LibraryDeleteFolderDialog
        open={isFolderDeleteDialogOpen}
        onOpenChange={setIsFolderDeleteDialogOpen}
        targetFolder={folderDeleteTarget}
        isPending={isDeletingFolder}
        onConfirm={handleDeleteFolder}
      />

      <LibraryRenameFolderDialog
        key={`rename-${renameDialogSession}`}
        open={isFolderRenameDialogOpen}
        onOpenChange={handleRenameDialogOpenChange}
        initialName={folderRenameTarget?.name ?? ""}
        isPending={isRenamingFolder}
        onConfirm={handleRenameFolder}
      />
    </>
  );
}
