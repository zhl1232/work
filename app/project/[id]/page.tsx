"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Heart, Share2, MessageCircle, Play, ArrowLeft, Send, Trash2 } from "lucide-react";
import { ConfettiButton } from "@/components/ui/confetti-button";
import { useProjects } from "@/context/project-context";
import { Project, Comment as ProjectComment } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import { useLoginPrompt } from "@/context/login-prompt-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { ProjectCard } from "@/components/features/project-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = React.use(params);
    const { projects, toggleLike, isLiked, addComment, toggleProjectCompleted, isCompleted, deleteComment } = useProjects();
    const { user, profile } = useAuth();
    const { promptLogin } = useLoginPrompt();
    const router = useRouter();
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<number | string | null>(null);
    const [replyContent, setReplyContent] = useState("");

    // Local state for project data
    const [project, setProject] = useState<Project | null>(null);
    const [relatedProjects, setRelatedProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    // Fetch project data
    useEffect(() => {
        const supabase = createClient(); // 在 useEffect 内部创建客户端,避免依赖警告

        const fetchProject = async () => {
            setIsLoading(true);

            // First check if it exists in context (optional, but good for cache)
            const cachedProject = projects.find((p) => String(p.id) === unwrappedParams.id);
            if (cachedProject) {
                setProject(cachedProject);
                setIsLoading(false);
                return;
            }

            // If not in context, fetch from Supabase
            const { data, error } = await supabase
                .from('projects')
                .select(`
                    *,
                    profiles:author_id (display_name),
                    project_materials (*),
                    project_steps (*),
                    comments (
                        *,
                        profiles:author_id (display_name, avatar_url)
                    )
                `)
                .eq('id', unwrappedParams.id)
                .single();

            if (error || !data) {
                console.error('Error fetching project:', error);
                setNotFound(true);
                setIsLoading(false);
                return;
            }

            // Map the data to Project type
            const mappedProject: Project = {
                id: data.id,
                title: data.title,
                author: data.profiles?.display_name || 'Unknown',
                author_id: data.author_id,
                image: data.image_url || '',
                category: data.category || '',
                likes: data.likes_count,
                description: data.description || '',
                materials: data.project_materials?.sort((a: any, b: any) => a.sort_order - b.sort_order).map((m: any) => m.material) || [],
                steps: data.project_steps?.sort((a: any, b: any) => a.sort_order - b.sort_order).map((s: any) => ({ title: s.title, description: s.description || '' })) || [],
                comments: data.comments?.map((c: any) => ({
                    id: c.id,
                    author: c.profiles?.display_name || 'Unknown',
                    userId: c.author_id,
                    avatar: c.profiles?.avatar_url,
                    content: c.content,
                    date: new Date(c.created_at).toLocaleString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    parent_id: c.parent_id,
                    reply_to_user_id: c.reply_to_user_id,
                    reply_to_username: c.reply_to_username
                })) || []
            };

            setProject(mappedProject);
            setIsLoading(false);

            // Fetch related projects
            if (mappedProject.category) {
                const { data: relatedData } = await supabase
                    .from('projects')
                    .select('id, title, image_url, category, author_id, profiles:author_id(display_name)')
                    .eq('category', mappedProject.category)
                    .neq('id', mappedProject.id)
                    .limit(3);

                if (relatedData) {
                    setRelatedProjects(relatedData.map((p: any) => ({
                        id: p.id,
                        title: p.title,
                        image: p.image_url,
                        category: p.category,
                        author: p.profiles?.display_name || 'Unknown'
                    })));
                }
            }
        };

        if (unwrappedParams.id) {
            fetchProject();
        }
    }, [unwrappedParams.id, projects]);

    // Scroll to hash anchor on load
    useEffect(() => {
        if (!isLoading && typeof window !== 'undefined' && window.location.hash) {
            const hash = window.location.hash.substring(1);
            // Use requestAnimationFrame for better reliability
            requestAnimationFrame(() => {
                const element = document.getElementById(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'auto', block: 'start' });
                    const headerOffset = 100;
                    window.scrollBy({ top: -headerOffset, behavior: 'smooth' });
                    element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
                    setTimeout(() => element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2'), 2000);
                }
            });
        }
    }, [isLoading]);

    // Handle special case for "color-lab" and "pixel-art"
    if (unwrappedParams.id === "color-lab") {
        if (typeof window !== "undefined") {
            router.replace("/project/color-lab");
            return null;
        }
    }
    if (unwrappedParams.id === "pixel-art") {
        if (typeof window !== "undefined") {
            router.replace("/project/pixel-art");
            return null;
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 max-w-4xl">
                <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
                    <div className="space-y-8">
                        <div className="aspect-video w-full bg-muted animate-pulse rounded-lg" />
                        <div className="space-y-4">
                            <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />
                            <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                            <div className="h-32 w-full bg-muted animate-pulse rounded" />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="h-48 w-full bg-muted animate-pulse rounded-lg" />
                        <div className="h-64 w-full bg-muted animate-pulse rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (notFound || !project) {
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

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const submitComment = async () => {
            const addedComment = await addComment(project.id, {
                id: 0,
                author: "Me",
                content: newComment,
                date: "",
            });

            if (addedComment) {
                setProject((prev) => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        comments: [addedComment, ...(prev.comments || [])]
                    };
                });
                setNewComment("");
            }
        };

        if (!user) {
            promptLogin(() => {
                submitComment();
            }, {
                title: '登录以发表评论',
                description: '登录后即可参与讨论，分享你的想法'
            });
            return;
        }

        submitComment();
    };

    const handleSubmitReply = async (e: React.FormEvent, parentId: number, replyToUserId?: string, replyToUsername?: string) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        const submitReply = async () => {
            const addedReply = await addComment(project.id, {
                id: 0,
                author: "Me",
                content: replyContent,
                date: "",
                reply_to_user_id: replyToUserId,
                reply_to_username: replyToUsername,
            }, parentId);

            if (addedReply) {
                setProject((prev) => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        comments: [addedReply, ...(prev.comments || [])]
                    };
                });
                setReplyContent("");
                setReplyingTo(null);
            }
        };

        if (!user) {
            promptLogin(() => {
                submitReply();
            }, {
                title: '登录以回复评论',
                description: '登录后即可参与讨论，回复其他用户'
            });
            return;
        }

        submitReply();
    };

    const handleCancelReply = () => {
        setReplyContent("");
        setReplyingTo(null);
    };



    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="mb-8">
                <Link href="/explore" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> 返回探索
                </Link>
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted relative group">
                    <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover"
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
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url || ""} />
                                <AvatarFallback>👤</AvatarFallback>
                            </Avatar>
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

                        <div className="space-y-3">
                            {project.comments && project.comments.length > 0 ? (
                                (() => {
                                    const topLevelComments = project.comments!.filter(c => !c.parent_id);
                                    const getNestedComments = (parentId: number | string) => {
                                        return project.comments?.filter(c => c.parent_id === parentId) || [];
                                    };

                                    const renderComment = (comment: ProjectComment, isNested: boolean = false) => {
                                        const nestedComments = getNestedComments(comment.id);
                                        const isReplying = replyingTo === comment.id;

                                        return (
                                            <div key={comment.id} className={isNested ? "ml-8 mt-3" : ""} id={`comment-${comment.id}`}>
                                                <div className={`rounded-lg p-4 border transition-colors ${isNested
                                                        ? "bg-background/50 border-l-2 border-muted-foreground/20"
                                                        : "bg-muted/20 border-l-2 border-primary/30"
                                                    }`}>
                                                    <div className="flex gap-3 group">
                                                        <Avatar className="h-8 w-8 shrink-0">
                                                            <AvatarImage src={comment.avatar || ""} />
                                                            <AvatarFallback>{comment.author[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold text-sm">{comment.author}</span>
                                                                    <span className="text-xs text-muted-foreground">{comment.date}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 px-2 text-xs"
                                                                        onClick={() => setReplyingTo(comment.id)}
                                                                    >
                                                                        <MessageCircle className="h-3 w-3 mr-1" />
                                                                        回复
                                                                    </Button>
                                                                    {(user?.id === comment.userId || profile?.role === 'admin' || profile?.role === 'moderator') && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                                            onClick={async () => {
                                                                                await deleteComment(comment.id);
                                                                                setProject(prev => {
                                                                                    if (!prev) return null;
                                                                                    return {
                                                                                        ...prev,
                                                                                        comments: prev.comments?.filter(c => c.id !== comment.id)
                                                                                    };
                                                                                });
                                                                            }}
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <p className="text-sm leading-relaxed">
                                                                {comment.reply_to_username && (
                                                                    <span className="text-primary font-medium mr-1">
                                                                        @{comment.reply_to_username}
                                                                    </span>
                                                                )}
                                                                {comment.content}
                                                            </p>

                                                            {/* 内嵌回复框 */}
                                                            {isReplying && (
                                                                <form
                                                                    onSubmit={(e) => handleSubmitReply(e, Number(comment.id), comment.userId, comment.author)}
                                                                    className="mt-3 space-y-2 bg-accent/5 rounded-md p-3 border border-accent/20"
                                                                >
                                                                    <div className="text-sm text-muted-foreground">
                                                                        回复 <span className="text-primary font-medium">@{comment.author}</span>
                                                                    </div>
                                                                    <Input
                                                                        value={replyContent}
                                                                        onChange={(e) => setReplyContent(e.target.value)}
                                                                        placeholder="输入你的回复..."
                                                                        autoFocus
                                                                    />
                                                                    <div className="flex justify-end gap-2">
                                                                        <Button type="button" variant="ghost" size="sm" onClick={handleCancelReply}>
                                                                            取消
                                                                        </Button>
                                                                        <Button type="submit" size="sm" disabled={!replyContent.trim()}>
                                                                            发送
                                                                        </Button>
                                                                    </div>
                                                                </form>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 嵌套回复 */}
                                                {nestedComments.length > 0 && (
                                                    <div className="space-y-3 mt-3">
                                                        {nestedComments.map(nestedComment => renderComment(nestedComment, true))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    };

                                    return topLevelComments.map(comment => renderComment(comment, false));
                                })()
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
                                        onClick={() => {
                                            if (!user) {
                                                promptLogin(() => toggleLike(project.id), {
                                                    title: '登录以点赞项目',
                                                    description: '登录后即可点赞并收藏喜欢的项目'
                                                });
                                                return;
                                            }
                                            toggleLike(project.id);
                                        }}
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
                                onClick={() => {
                                    if (!user) {
                                        promptLogin(() => toggleProjectCompleted(project.id), {
                                            title: '登录以标记完成',
                                            description: '登录后可记录你完成的项目，获得成就徽章'
                                        });
                                        return;
                                    }
                                    toggleProjectCompleted(project.id);
                                }}
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
