import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

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
    <div className="border-accent-indigo/65 bg-bg-surface flex items-center rounded-full border-2 px-3 py-1.5 sm:px-4 sm:py-2">
      <Input
        className="text-text-primary placeholder:text-text-secondary text-base sm:typo-label-sm border-none bg-transparent focus-visible:ring-0 [&::-webkit-search-cancel-button]:hidden"
        type="text"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
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
      {query.length > 0 && (
        <Button
          type="button"
          onClick={() => onChange("")}
          variant="iconGhost"
          size="icon-sm"
          aria-label="검색어 지우기"
          className="text-text-tertiary hover:text-text-primary mr-1 size-7 shrink-0 rounded-full sm:size-8"
        >
          <X className="size-4" />
        </Button>
      )}
      <Button
        type="button"
        onClick={onSubmit}
        variant="iconRound"
        aria-label="검색"
        className="shrink-0"
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
}

