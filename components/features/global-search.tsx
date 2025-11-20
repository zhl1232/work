"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export function GlobalSearch() {
    const router = useRouter();
    const pathname = usePathname();
    const [query, setQuery] = useState("");

    // Hide global search on explore page to avoid redundancy
    if (pathname === "/explore") {
        return null;
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/explore?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="搜索项目..."
                className="pl-8 w-[200px] lg:w-[300px] bg-muted/50"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </form>
    );
}
