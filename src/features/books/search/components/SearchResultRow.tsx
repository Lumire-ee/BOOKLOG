import type { SearchBook } from "../lib/types";
import { Button } from "@/components/ui/button";
import BookListRow from "@/features/books/components/BookListRow";
import { BookPlus } from "lucide-react";

interface SearchResultRowProps {
  book: SearchBook;
  onHover: () => void;
  onSelect: () => void;
}

export default function SearchResultRow({
  book,
  onHover,
  onSelect,
}: SearchResultRowProps) {
  return (
    <BookListRow
      thumbnail={book.image}
      title={book.title}
      author={
        book.publisher
          ? `${book.author} · ${book.publisher}`
          : book.author
      }
      onHover={onHover}
      right={
        <Button variant="iconGhost" size="sm" onClick={onSelect}>
          {/* TODO(Optional): Row에 이벤트 추가 시, 이벤트 버블링 방지 필요 */}
          {/* TODO: shadcn tooltip 추가, border 추가 */}
          <BookPlus />
        </Button>
      }
    />
  );
}
