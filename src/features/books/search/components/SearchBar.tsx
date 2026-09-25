import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  query: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onFocus: () => void;
}

export default function SearchBar({
  query,
  onChange,
  onSubmit,
  onFocus,
}: SearchBarProps) {
  return (
    <div className="border-accent-indigo/65 bg-bg-surface flex items-center rounded-full border-2 px-4 py-2">
      <Input
        className="text-text-primary placeholder:text-text-secondary typo-label-sm border-none bg-transparent focus-visible:ring-0"
        type="text"
        placeholder="책 제목 또는 저자를 입력해주세요."
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (e.nativeEvent.isComposing) return;
            onSubmit();
          }
        }}
        onFocus={onFocus}
      />
      <Button
        type="button"
        onClick={onSubmit}
        variant="iconRound"
        aria-label="검색"
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
}

