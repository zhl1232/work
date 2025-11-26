"use client";

import { useProjects, Comment } from "@/context/project-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Heart, Tag, ArrowLeft, User, Calendar, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function DiscussionDetailPage({ params }: { params: { id: string } }) {
    const { discussions, addReply, deleteReply, isLoading } = useProjects();
    const { user, profile } = useAuth(); 
    // Checking context... context has `addReply` but `toggleLike` takes `projectId`. 
    // The current context definition for `toggleLike` is `(projectId: string | number) => void`.
    // It seems I might need to update context to support liking discussions, or just handle it locally for now/mock it, or update context.
    // Given the plan didn't explicitly say "update context for discussion likes", I'll check if I can easily add it or if I should just implement the UI.
    // Looking at `project-context.tsx`, `toggleLike` updates `likedProjects` set and `projects` state. It doesn't touch `discussions`.
    // However, `Discussion` type has `likes: number`.
    // I will implement `addReply` which is in context. For likes, I might skip interactive liking for discussions in this step or add a specific `likeDiscussion` to context if needed. 
    // Let's stick to `addReply` first as that's the main interaction.
    
    const router = useRouter();
    const [replyContent, setReplyContent] = useState("");
    const [id, setId] = useState<string | number | null>(null);

    // Handle params unwrapping
    useEffect(() => {
        // In Next.js 15 params is a promise, but in 14 it's an object. 
        // Assuming standard usage, but to be safe with types:
        if (params.id) {
            setId(params.id);
        }
    }, [params]);

    if (!id) return null;

    // Find discussion. The ID in URL is string, but in data it might be number.
    const discussion = discussions.find(d => d.id.toString() === id.toString());

    if (isLoading) {
        return (
            <div className="container mx-auto py-12 max-w-4xl">
                <div className="space-y-8">
                    <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                    <div className="bg-card border rounded-xl p-8 shadow-sm">
                        <div className="h-6 w-48 bg-muted animate-pulse rounded mb-4" />
                        <div className="h-10 w-3/4 bg-muted animate-pulse rounded mb-4" />
                        <div className="h-6 w-full bg-muted animate-pulse rounded" />
                    </div>
                </div>
            </div>
        );
    }

    if (!discussion) {
        return (
            <div className="container mx-auto py-12 text-center">
                <h1 className="text-2xl font-bold mb-4">讨论不存在</h1>
                <Button onClick={() => router.back()}>返回列表</Button>
            </div>
        );
    }

    const handleSubmitReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        const newReply: Comment = {
            id: Date.now(),
            author: "我 (Me)",
            content: replyContent,
            date: new Date().toLocaleDateString(),
        };

        addReply(discussion.id, newReply);
        setReplyContent("");
    };

    return (
        <div className="container mx-auto py-12 max-w-4xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0 hover:pl-2 transition-all">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回讨论列表
            </Button>

            <div className="bg-card border rounded-xl p-8 shadow-sm mb-8">
                <div className="flex flex-wrap gap-2 mb-4">
                    {discussion.tags.map(tag => (
                        <span key={tag} className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium flex items-center gap-1">
                            <Tag className="h-3 w-3" /> {tag}
                        </span>
                    ))}
                </div>

                <h1 className="text-3xl font-bold mb-4">{discussion.title}</h1>

                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8 border-b pb-6">
                    <span className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4" />
                        </div>
                        {discussion.author}
                    </span>
                    <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {discussion.date}
                    </span>
                    <span className="flex items-center gap-2 text-red-500">
                        <Heart className="h-4 w-4 fill-current" />
                        {discussion.likes}
                    </span>
                </div>

                <div className="prose dark:prose-invert max-w-none mb-8">
                    <p className="text-lg leading-relaxed whitespace-pre-wrap">{discussion.content}</p>
                </div>
            </div>

            <div className="space-y-8">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                    <MessageSquare className="h-6 w-6" />
                    回复 ({discussion.replies.length})
                </h3>

                <div className="space-y-6">
                    {discussion.replies.map((reply) => (
                        <div key={reply.id} className="bg-muted/30 rounded-lg p-6 border">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={reply.avatar || ""} />
                                        <AvatarFallback>{reply.author[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <span className="font-semibold block text-sm">{reply.author}</span>
                                        <span className="text-xs text-muted-foreground">{reply.date}</span>
                                    </div>
                                </div>
                                {(user?.id === reply.userId || profile?.role === 'admin' || profile?.role === 'moderator') && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                        onClick={() => deleteReply(reply.id)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                            <p className="text-sm pl-11">{reply.content}</p>
                        </div>
                    ))}

                    {discussion.replies.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                            暂无回复，快来抢沙发吧！
                        </div>
                    )}
                </div>

                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <h4 className="font-semibold mb-4">发表回复</h4>
                    <form onSubmit={handleSubmitReply} className="space-y-4">
                        <Textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="分享你的观点..."
                            className="min-h-[120px]"
                        />
                        <div className="flex justify-end">
                            <Button type="submit" disabled={!replyContent.trim()}>
                                发送回复
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
