"use client";

import * as React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";

interface DiscussionSearchProps {
  onSearch: (query: string, tag: string | null, sortBy: SortOption) => void;
  availableTags?: string[];
}

export type SortOption = "newest" | "hottest" | "most_replies" | "latest_reply";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "最新发布" },
  { value: "hottest", label: "最热门" },
  { value: "most_replies", label: "回复最多" },
  { value: "latest_reply", label: "回复最新" },
];

export function DiscussionSearch({ onSearch, availableTags = [] }: DiscussionSearchProps) {
  const [query, setQuery] = React.useState("");
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<SortOption>("newest");
  
  // 防抖搜索查询，500ms延迟
  const debouncedQuery = useDebounce(query, 500);

  // 当防抖后的查询变化时，自动触发搜索
  React.useEffect(() => {
    onSearch(debouncedQuery, selectedTag, sortBy);
  }, [debouncedQuery, selectedTag, sortBy, onSearch]);

  const handleTagClick = (tag: string) => {
    const newTag = selectedTag === tag ? null : tag;
    setSelectedTag(newTag);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedTag(null);
    setSortBy("newest");
  };

  const hasFilters = query || selectedTag || sortBy !== "newest";

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索讨论标题或内容..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            className="pl-8"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setQuery("");
              }}
              className="absolute right-2 top-2 h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[100px]">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {sortOptions.find((opt) => opt.value === sortBy)?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={sortBy === option.value ? "bg-muted" : ""}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tag Filter Chips */}
      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">标签筛选：</span>
          {availableTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/80 transition-colors"
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Active Filters Display */}
      {hasFilters && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">当前筛选：</span>
          {query && (
            <Badge variant="secondary">
              搜索: {query}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => {
                  setQuery("");
                }}
              />
            </Badge>
          )}
          {selectedTag && (
            <Badge variant="secondary">
              标签: {selectedTag}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => {
                  setSelectedTag(null);
                }}
              />
            </Badge>
          )}
          {sortBy !== "newest" && (
            <Badge variant="secondary">
              排序: {sortOptions.find((opt) => opt.value === sortBy)?.label}
            </Badge>
          )}
          <Button variant="link" size="sm" onClick={clearFilters} className="h-auto p-0">
            清除所有筛选
          </Button>
        </div>
      )}
    </div>
  );
}
