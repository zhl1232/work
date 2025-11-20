"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Project, useProjects } from "@/context/project-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface ProjectCardProps {
    project: Project;
    variants?: any;
}

export function ProjectCard({ project, variants }: ProjectCardProps) {
    const { isLiked, toggleLike } = useProjects();
    const { showToast } = useToast();
    const liked = isLiked(project.id);

    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const wasLiked = liked;
        toggleLike(project.id);

        if (!wasLiked) {
            showToast("已添加到收藏", "success");
        }
    };

    return (
        <motion.div
            variants={variants}
            whileHover={{
                y: -8,
                transition: { duration: 0.3 }
            }}
            style={{ transformStyle: "preserve-3d" }}
        >
            <Link
                href={project.id === "color-lab" ? "/project/color-lab" : `/project/${project.id}`}
                className="group relative block overflow-hidden rounded-lg border bg-background transition-all hover:shadow-2xl hover:shadow-primary/20"
            >
                <div className="aspect-video w-full overflow-hidden bg-muted relative">
                    <img
                        src={project.image}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Button
                                size="icon"
                                variant="secondary"
                                className={cn(
                                    "h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg",
                                    liked && "text-red-500"
                                )}
                                onClick={handleLike}
                            >
                                <motion.div
                                    animate={liked ? {
                                        scale: [1, 1.3, 1],
                                    } : {}}
                                    transition={{
                                        duration: 0.3,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <Heart className={cn("h-5 w-5", liked && "fill-current")} />
                                </motion.div>
                            </Button>
                        </motion.div>
                    </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-background to-background/95">
                    <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-primary/10 text-primary border-primary/20">
                            {project.category}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Heart className={cn("h-3 w-3", liked && "fill-red-500 text-red-500")} />
                            {project.likes}
                        </span>
                    </div>
                    <h3 className="font-semibold leading-none tracking-tight mb-1 group-hover:text-primary transition-colors">
                        {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">by {project.author}</p>
                </div>
            </Link>
        </motion.div>
    );
}
