"use client";

import { Button } from "@/components/ui/button";
import { Heart, Share2, MessageCircle, Play, ArrowLeft, Send } from "lucide-react";
import { ConfettiButton } from "@/components/ui/confetti-button";
import { useProjects } from "@/context/project-context";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ProjectCard } from "@/components/features/project-card";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
    const { projects, toggleLike, isLiked, addComment, toggleProjectCompleted, isCompleted } = useProjects();
    const router = useRouter();
    const [newComment, setNewComment] = useState("");

    // Handle special case for "color-lab" and "pixel-art"
    if (params.id === "color-lab") {
        if (typeof window !== "undefined") {
            router.replace("/project/color-lab");
            return null;
        }
    }
    if (params.id === "pixel-art") {
        if (typeof window !== "undefined") {
            router.replace("/project/pixel-art");
            return null;
        }
    }

    const project = projects.find((p) => String(p.id) === params.id);

    if (!project) {
        return (
            <div className="container mx-auto py-16 text-center">
                <h1 className="text-2xl font-bold mb-4">项目未找到</h1>
                <Link href="/explore">
                    <Button>返回探索</Button>
                </Link>
            </div>
        );
    }

    const isProjectLiked = isLiked(project.id);
    const isProjectCompleted = isCompleted(project.id);

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        addComment(project.id, {
            id: Date.now(),
            author: "我 (Me)",
            content: newComment,
            date: new Date().toLocaleDateString(),
        });
        setNewComment("");
    };

    const relatedProjects = projects
        .filter(p => p.category === project.category && p.id !== project.id)
        .slice(0, 3);

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="mb-8">
                <Link href="/explore" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> 返回探索
                </Link>
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted relative group">
                    <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" className="h-16 w-16 rounded-full bg-white/90 text-black hover:bg-white">
                            <Play className="h-8 w-8 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
                <div className="space-y-12">
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>By {project.author}</span>
                                <span>•</span>
                                <span>{project.category}</span>
                            </div>
                        </div>

                        <div className="prose max-w-none">
                            <h3>项目介绍</h3>
                            <p>{project.description || "暂无介绍"}</p>

                            {project.steps && project.steps.length > 0 && (
                                <>
                                    <h3>制作步骤</h3>
                                    <ol className="list-decimal pl-5 space-y-4">
                                        {project.steps.map((step, index) => (
                                            <li key={index}>
                                                <strong>{step.title}</strong>
                                                <p>{step.description}</p>
                                            </li>
                                        ))}
                                    </ol>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="border-t pt-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            讨论 ({project.comments?.length || 0})
                        </h3>

                        <form onSubmit={handleSubmitComment} className="flex gap-4 mb-8">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                👤
                            </div>
                            <div className="flex-1 flex gap-2">
                                <Input
                                    placeholder="分享你的想法..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <Button type="submit" size="icon" disabled={!newComment.trim()}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </form>

                        <div className="space-y-6">
                            {project.comments && project.comments.length > 0 ? (
                                project.comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-4">
                                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs">
                                            {comment.author[0]}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm">{comment.author}</span>
                                                <span className="text-xs text-muted-foreground">{comment.date}</span>
                                            </div>
                                            <p className="text-sm text-foreground/80">{comment.content}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    还没有评论，快来抢沙发吧！
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="space-y-6">
                        <div className="rounded-lg border p-4 space-y-4 sticky top-24">
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    <Button
                                        variant={isProjectLiked ? "default" : "outline"}
                                        size="icon"
                                        onClick={() => toggleLike(project.id)}
                                        className={isProjectLiked ? "bg-red-500 hover:bg-red-600 text-white border-red-500" : ""}
                                    >
                                        <Heart className={`h-4 w-4 ${isProjectLiked ? "fill-current" : ""}`} />
                                    </Button>
                                    <Button variant="outline" size="icon">
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <span className="font-bold text-lg">{project.likes} 赞</span>
                            </div>
                            <ConfettiButton
                                className="w-full"
                                isCompleted={isProjectCompleted}
                                onClick={() => toggleProjectCompleted(project.id)}
                            >
                                我做过这个！(Mark as Done)
                            </ConfettiButton>
                        </div>

                        <div className="rounded-lg border p-4">
                            <h3 className="font-semibold mb-3">所需材料</h3>
                            {project.materials && project.materials.length > 0 ? (
                                <ul className="space-y-2 text-sm">
                                    {project.materials.map((material, index) => (
                                        <li key={index} className="flex justify-between border-b last:border-0 pb-2 last:pb-0 border-dashed">
                                            <span>{material}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">暂无材料清单</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Projects */}
            {relatedProjects.length > 0 && (
                <div className="mt-16 border-t pt-12">
                    <h2 className="text-2xl font-bold mb-6">你可能也喜欢</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {relatedProjects.map((p) => (
                            <ProjectCard key={p.id} project={p} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
