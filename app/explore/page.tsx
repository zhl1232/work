"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useProjects } from "@/context/project-context";
import { ProjectCard } from "@/components/features/project-card";
import { ProjectCardSkeleton } from "@/components/ui/loading-skeleton";
import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { AdvancedSearch } from "@/components/features/advanced-search";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const categories = ["全部", "科学", "技术", "工程", "艺术", "数学", "其他"];

import { Suspense } from "react";

function ExploreContent() {
    const { projects } = useProjects();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || "";

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [selectedCategory, setSelectedCategory] = useState("全部");
    const [isLoading, setIsLoading] = useState(true);
    const [advancedFilters, setAdvancedFilters] = useState({
        difficulty: "all",
        duration: [0, 120],
        materials: [] as string[]
    });

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleSearch = (query: string, filters: any) => {
        setSearchQuery(query);
        setAdvancedFilters(filters);
    };

    const filteredProjects = useMemo(() => {
        return projects.filter((project) => {
            const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === "全部" || project.category === selectedCategory;
            
            // Material filter
            const matchesMaterials = advancedFilters.materials.length === 0 || 
                (project.materials && advancedFilters.materials.some(m => project.materials?.includes(m)));

            return matchesSearch && matchesCategory && matchesMaterials;
        });
    }, [projects, searchQuery, selectedCategory, advancedFilters]);

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
                <div
                    className="flex flex-wrap gap-2"
                >
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

            {isLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <ProjectCardSkeleton key={i} />
                    ))}
                </div>
            ) : filteredProjects.length > 0 ? (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} variants={item} />
                    ))}
                </motion.div>
            ) : (
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
