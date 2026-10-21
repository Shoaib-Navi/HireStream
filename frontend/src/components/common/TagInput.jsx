import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Type a value and press Enter or comma to add it; Backspace on an empty field removes the last one
const TagInput = ({ id, value = [], onChange, placeholder, maxItems = 30, invalid, className }) => {
  const [draft, setDraft] = useState("");

  const addTags = (text) => {
    const next = [...value];
    for (const tag of text.split(",").map((item) => item.trim()).filter(Boolean)) {
      const exists = next.some((existing) => existing.toLowerCase() === tag.toLowerCase());
      if (!exists && next.length < maxItems) next.push(tag);
    }
    if (next.length !== value.length) onChange(next);
    setDraft("");
  };

  const removeTag = (tag) => onChange(value.filter((item) => item !== tag));

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTags(draft);
    } else if (event.key === "Backspace" && !draft && value.length > 0) {
      removeTag(value.at(-1));
    }
  };

  return (
    <div
      className={cn(
        "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30",
        invalid && "border-destructive",
        className,
      )}
    >
      {value.map((tag) => (
        <Badge key={tag} variant="brand" className="gap-1 pr-1">
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="rounded-full p-0.5 hover:bg-primary/15"
            aria-label={`Remove ${tag}`}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTags(draft)}
        placeholder={value.length === 0 ? placeholder : ""}
        aria-invalid={invalid || undefined}
        className="min-w-[8rem] flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
};

export default TagInput;
