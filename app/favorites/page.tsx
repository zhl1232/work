"use client";

import { useProjects } from "@/context/project-context";
import { ProjectCard } from "@/components/features/project-card";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

export default function FavoritesPage() {
    const { projects, isLiked } = useProjects();

    const favoriteProjects = projects.filter(project => isLiked(project.id));

    return (
        <div className="container mx-auto py-8">
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500">
                        <Heart className="h-6 w-6 fill-current" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">我的收藏</h1>
                        <p className="text-muted-foreground">
                            这里是你收藏的所有精彩项目 ({favoriteProjects.length})
                        </p>
                    </div>
                </div>
            </div>

            {favoriteProjects.length > 0 ? (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {favoriteProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} variants={item} />
                    ))}
                </motion.div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="rounded-full bg-muted p-6 mb-4">
                        <Heart className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">还没有收藏任何项目</h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                        浏览发现页面，点击心形图标收藏你喜欢的项目，它们就会出现在这里。
                    </p>
                    <Button asChild>
                        <Link href="/explore">去发现</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
