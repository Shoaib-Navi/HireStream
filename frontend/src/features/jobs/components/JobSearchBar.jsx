import { useState } from "react";
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Keyword + location search, used on the home page and the jobs page
const JobSearchBar = ({ defaultQuery = "", defaultLocation = "", onSearch, size = "default", className }) => {
  const [query, setQuery] = useState(defaultQuery);
  const [location, setLocation] = useState(defaultLocation);
  const large = size === "lg";

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch({ q: query.trim(), location: location.trim() });
  };

  const inputClassName = cn(
    "w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground",
    large ? "h-12 text-base" : "h-10",
  );

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-col gap-1 rounded-2xl border bg-card p-2 shadow-elevated focus-within:border-primary/40 sm:flex-row sm:items-center",
        className,
      )}
    >
      <label className="flex flex-[1.4] items-center gap-2.5 px-3">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">Job title, skill or keyword</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Job title, skill or keyword"
          maxLength={100}
          className={inputClassName}
        />
      </label>
      <div className="mx-3 h-px bg-border sm:mx-0 sm:h-8 sm:w-px" aria-hidden="true" />
      <label className="flex flex-1 items-center gap-2.5 px-3">
        <MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">Location</span>
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="City or remote"
          maxLength={100}
          className={inputClassName}
        />
      </label>
      <Button type="submit" size={large ? "xl" : "lg"} className="rounded-xl">
        Search jobs
      </Button>
    </form>
  );
};

export default JobSearchBar;
