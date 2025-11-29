"use client";

import { useCommunity } from "@/context/community-context";
import { Discussion, Comment as ProjectComment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Heart, Tag, ArrowLeft, User, Calendar, Trash2, Reply } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";
import { useLoginPrompt } from "@/context/login-prompt-context";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/date-utils";

export default function DiscussionDetailPage({ params }: { params: { id: string } }) {
    const { discussions, addReply, deleteReply } = useCommunity();
    const { user, profile } = useAuth(); 
    const { promptLogin } = useLoginPrompt();
    
    const router = useRouter();
    const [replyContent, setReplyContent] = useState("");
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [id, setId] = useState<string | number | null>(null);

    // Local state
    const [discussion, setDiscussion] = useState<Discussion | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const supabase = createClient();

    // Handle params unwrapping
    useEffect(() => {
        if (params.id) {
            setId(params.id);
        }
    }, [params]);

    // Fetch discussion
    useEffect(() => {
        const fetchDiscussion = async () => {
             if (!id) return;
             
             try {
                 setIsLoading(true);

                 const cached = discussions.find(d => d.id.toString() === id.toString());
                 if (cached) {
                     setDiscussion(cached);
                     return;
                 }

                 const { data, error } = await supabase
                    .from('discussions')
                    .select(`
                        *,
                        profiles:author_id (display_name),
                        discussion_replies (
                            *,
                            profiles:author_id (display_name, avatar_url)
                        )
                    `)
                    .eq('id', id)
                    .single();

                 if (error || !data) {
                     console.error('Error fetching discussion:', error);
                     setNotFound(true);
                     return;
                 }

                 const mappedDiscussion: Discussion = {
                    id: data.id,
                    title: data.title,
                    author: data.profiles?.display_name || 'Unknown',
                    content: data.content,
                    date: formatRelativeTime(data.created_at),
                    likes: data.likes_count,
                    tags: data.tags || [],
                    replies: data.discussion_replies?.map((r: any) => ({
                        id: r.id,
                        author: r.profiles?.display_name || 'Unknown',
                        userId: r.author_id,
                        avatar: r.profiles?.avatar_url,
                        content: r.content,
                        date: formatRelativeTime(r.created_at),
                        parent_id: r.parent_id,
                        reply_to_user_id: r.reply_to_user_id,
                        reply_to_username: r.reply_to_username
                    })) || []
                 };

                 setDiscussion(mappedDiscussion);
             } catch (err) {
                 console.error('Exception in fetchDiscussion:', err);
                 setNotFound(true);
             } finally {
                 setIsLoading(false);
             }
        };

        fetchDiscussion();
    }, [id, discussions, supabase]);

    // Scroll to hash anchor on load
    useEffect(() => {
        if (!isLoading && id && typeof window !== 'undefined' && window.location.hash) {
            const hash = window.location.hash.substring(1);
            requestAnimationFrame(() => {
                const element = document.getElementById(hash);
                if (element) {
                    const headerOffset = 100;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - headerOffset;
            
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });

                    element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
                    setTimeout(() => {
                        element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
                    }, 2000);
                }
            });
        }
    }, [isLoading, id]);

    if (!id) return null;

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

    if (notFound || !discussion) {
        return (
            <div className="container mx-auto py-12 text-center">
                <h1 className="text-2xl font-bold mb-4">讨论不存在</h1>
                <Button onClick={() => router.back()}>返回列表</Button>
            </div>
        );
    }

    const handleSubmitReply = async (e: React.FormEvent, parentId?: number, replyToUserId?: string, replyToUsername?: string) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        const submitReply = async () => {
             const addedReply = await addReply(discussion.id, {
                id: 0,
                author: "Me",
                content: replyContent,
                date: "",
                reply_to_user_id: replyToUserId,
                reply_to_username: replyToUsername,
            }, parentId);

            if (addedReply) {
                setDiscussion((prev) => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        replies: [addedReply, ...prev.replies]
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
                title: '登录以发表回复',
                description: '登录后即可参与讨论，分享你的观点'
            });
            return;
        }

        submitReply();
    };

    const handleCancelReply = () => {
        setReplyContent("");
        setReplyingTo(null);
    };

    // 分离顶级回复和嵌套回复
    const topLevelReplies = discussion.replies.filter(r => !r.parent_id);
    const getNestedReplies = (parentId: number | string) => {
        return discussion.replies.filter(r => r.parent_id === parentId);
    };

    // 渲染回复组件（支持嵌套）
    const renderReply = (reply: ProjectComment, isNested: boolean = false) => {
        const nestedReplies = getNestedReplies(reply.id);
        const isReplying = replyingTo === reply.id;

        return (
            <div key={reply.id} className={isNested ? "ml-8 mt-3" : ""} id={`reply-${reply.id}`}>
                <div className={`rounded-lg p-4 border transition-colors ${
                    isNested 
                        ? "bg-background/50 border-l-2 border-muted-foreground/20" 
                        : "bg-muted/20 border-l-2 border-primary/30"
                }`}>
                    <div className="flex gap-3 group">
                        <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={reply.avatar || ""} />
                            <AvatarFallback>{reply.author[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">{reply.author}</span>
                                    <span className="text-xs text-muted-foreground">{reply.date}</span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-xs"
                                        onClick={() => setReplyingTo(Number(reply.id))}
                                    >
                                        <Reply className="h-3 w-3 mr-1" />
                                        回复
                                    </Button>
                                    {(user?.id === reply.userId || profile?.role === 'admin' || profile?.role === 'moderator') && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                await deleteReply(reply.id);
                                                setDiscussion((prev) => {
                                                    if (!prev) return null;
                                                    return {
                                                        ...prev,
                                                        replies: prev.replies.filter((r) => r.id !== reply.id)
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
                                {reply.reply_to_username && (
                                    <span className="text-primary font-medium mr-1">
                                        @{reply.reply_to_username}
                                    </span>
                                )}
                                {reply.content}
                            </p>

                            {/* 内嵌回复框 */}
                            {isReplying && (
                                <form 
                                    onSubmit={(e) => handleSubmitReply(e, Number(reply.id), reply.userId, reply.author)} 
                                    className="mt-3 space-y-2 bg-accent/5 rounded-md p-3 border border-accent/20"
                                >
                                    <div className="text-sm text-muted-foreground">
                                        回复 <span className="text-primary font-medium">@{reply.author}</span>
                                    </div>
                                    <Textarea
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder="输入你的回复..."
                                        className="min-h-[80px] resize-none"
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="ghost" size="sm" onClick={handleCancelReply}>
                                            取消
                                        </Button>
                                        <Button type="submit" size="sm" disabled={!replyContent.trim()}>
                                            发送回复
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* 嵌套回复 */}
                {nestedReplies.length > 0 && (
                    <div className="space-y-3 mt-3">
                        {nestedReplies.map(nestedReply => renderReply(nestedReply, true))}
                    </div>
                )}
            </div>
        );
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

                {/* 顶级回复列表 */}
                {topLevelReplies.length > 0 ? (
                    <div className="space-y-3">
                        {topLevelReplies.map(reply => renderReply(reply))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                        暂无回复，快来抢沙发吧！
                    </div>
                )}

                {/* 全局回复框 */}
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <h4 className="font-semibold mb-4">发表回复</h4>
                    <form onSubmit={(e) => handleSubmitReply(e)} className="space-y-4">
                        <Textarea
                            value={replyingTo === null ? replyContent : ""}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="分享你的观点..."
                            className="min-h-[120px]"
                            disabled={replyingTo !== null}
                        />
                        <div className="flex justify-end">
                            <Button type="submit" disabled={!replyContent.trim() || replyingTo !== null}>
                                发送回复
                            </Button>
                        </div>
                    </form>
                    {replyingTo !== null && (
                        <p className="text-sm text-muted-foreground mt-2">
                            正在回复他人，请在上方对应的回复框中输入内容
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
