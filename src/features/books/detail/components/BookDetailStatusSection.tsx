import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookDetailFormContent,
  BookDetailFormLabel,
  BookDetailFormRow,
} from "@/features/books/detail/components/BookDetailFormLayout";
import type { EditableUserBookFields } from "@/features/books/detail/lib/types";
import { BookOpen, CircleCheck, CircleSlash, Clock, Tag } from "lucide-react";

type Props = {
  status: EditableUserBookFields["status"];
  onStatusChange: (status: EditableUserBookFields["status"]) => void;
};

const STATUS_CONFIG = {
  to_read: { label: "읽기 전", variant: "to_read" as const, icon: Clock },
  reading: { label: "읽는 중", variant: "reading" as const, icon: BookOpen },
  completed: { label: "완독", variant: "completed" as const, icon: CircleCheck },
  quit: { label: "중단", variant: "quit" as const, icon: CircleSlash },
} as const;

export default function BookDetailStatusSection({
  status,
  onStatusChange,
}: Props) {
  const currentStatus = STATUS_CONFIG[status];

  return (
    <BookDetailFormRow>
      <BookDetailFormLabel
        htmlFor="status"
        className="inline-flex items-center gap-1.5"
      >
        <Tag className="size-3.5" aria-hidden="true" />
        상태
      </BookDetailFormLabel>
      <BookDetailFormContent>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger id="status" className="h-10 w-full px-3">
            <SelectValue placeholder="상태">
              {currentStatus ? (
                <Badge variant={currentStatus.variant}>
                  <currentStatus.icon />
                  {currentStatus.label}
                </Badge>
              ) : null}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="to_read">
              <Badge variant="to_read">
                <Clock />
                읽기 전
              </Badge>
            </SelectItem>
            <SelectItem value="reading">
              <Badge variant="reading">
                <BookOpen />
                읽는 중
              </Badge>
            </SelectItem>
            <SelectItem value="completed">
              <Badge variant="completed">
                <CircleCheck />
                완독
              </Badge>
            </SelectItem>
            <SelectItem value="quit">
              <Badge variant="quit">
                <CircleSlash />
                중단
              </Badge>
            </SelectItem>
          </SelectContent>
        </Select>
      </BookDetailFormContent>
    </BookDetailFormRow>
  );
}
