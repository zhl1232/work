"use client";

import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/features/project-card";
import { ProjectCardSkeleton } from "@/components/ui/loading-skeleton";

import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { AdvancedSearch } from "@/components/features/advanced-search";
import { createClient } from "@/lib/supabase/client";
import { Project } from "@/context/project-context";
import { useState, useRef, useCallback, useEffect } from "react";



const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const categories = ["全部", "科学", "技术", "工程", "艺术", "数学", "其他"];

import { Suspense } from "react";

function ExploreContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || "";
    const initialCategory = searchParams.get("category") || "全部";

    const [projects, setProjects] = useState<Project[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);
    const supabase = createClient();

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [advancedFilters, setAdvancedFilters] = useState({
        difficulty: "all",
        duration: [0, 120],
        materials: [] as string[]
    });

    const handleSearch = (query: string, filters: any) => {
        setSearchQuery(query);
        setAdvancedFilters(filters);
        // Reset will be triggered by useEffect
    };

    const fetchProjects = async (reset = false) => {
        if (isLoading && !reset) return;
        setIsLoading(true);

        const currentPage = reset ? 0 : page;
        const PAGE_SIZE = 12;
        const from = currentPage * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let query = supabase
            .from('projects')
            .select(`
                *,
                profiles:author_id (display_name),
                project_materials (*),
                project_steps (*)
            `)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (searchQuery) {
            query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }
        if (selectedCategory !== "全部") {
            query = query.eq('category', selectedCategory);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching projects:', error);
            setIsLoading(false);
            return;
        }

        const mappedProjects: Project[] = data.map((p: any) => ({
            id: p.id,
            title: p.title,
            author: p.profiles?.display_name || 'Unknown',
            author_id: p.author_id,
            image: p.image_url || '',
            category: p.category || '',
            likes: p.likes_count,
            description: p.description || '',
            materials: p.project_materials?.map((m: any) => m.material) || [],
            steps: p.project_steps?.map((s: any) => ({ title: s.title, description: s.description || '' })) || [],
            comments: [] // Comments are not needed for the card view
        }));

        if (reset) {
            setProjects(mappedProjects);
            setPage(1);
        } else {
            setProjects(prev => [...prev, ...mappedProjects]);
            setPage(prev => prev + 1);
        }

        setHasMore(data.length === PAGE_SIZE);
        setIsLoading(false);
    };

    // Trigger fetch when filters change
    useEffect(() => {
        fetchProjects(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, selectedCategory, advancedFilters]);

    // Infinite scroll observer
    const lastProjectElementRef = useCallback((node: HTMLDivElement) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchProjects(false);
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, hasMore]);

    return (
        <div className="container mx-auto py-8">
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">探索项目</h1>
                        <p className="text-muted-foreground">发现社区中最酷的 STEAM 创意。</p>
                    </div>
                    <div className="flex w-full items-center space-x-2 md:w-auto md:min-w-[400px]">
                        <AdvancedSearch onSearch={handleSearch} />
                    </div>
                </div>

                {/* Category Filter Chips */}
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                                selectedCategory === category
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background hover:bg-muted text-muted-foreground border-input"
                            )}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project, index) => {
                    if (projects.length === index + 1) {
                        return (
                            <div ref={lastProjectElementRef} key={project.id}>
                                <ProjectCard project={project} variants={item} />
                            </div>
                        );
                    } else {
                        return <ProjectCard key={project.id} project={project} variants={item} />;
                    }
                })}
                
                {isLoading && (
                    <>
                        {[1, 2, 3].map((i) => (
                            <ProjectCardSkeleton key={`skeleton-${i}`} />
                        ))}
                    </>
                )}
            </div>

            {!isLoading && projects.length === 0 && (
                <div className="text-center py-20">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold mb-2">没有找到相关项目</h3>
                    <p className="text-muted-foreground">
                        换个关键词或者类别试试看？
                    </p>
                    <Button
                        variant="link"
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedCategory("全部");
                            setAdvancedFilters({
                                difficulty: "all",
                                duration: [0, 120],
                                materials: []
                            });
                        }}
                        className="mt-4"
                    >
                        清除所有筛选
                    </Button>
                </div>
            )}
        </div>
    );
}

export default function ExplorePage() {
    return (
        <Suspense fallback={<div className="container mx-auto py-8"><ProjectCardSkeleton /></div>}>
            <ExploreContent />
        </Suspense>
    );
}
