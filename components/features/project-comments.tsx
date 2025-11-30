"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Send, Trash2 } from "lucide-react"
import { useProjects } from "@/context/project-context"
import { useAuth } from "@/context/auth-context"
import { useLoginPrompt } from "@/context/login-prompt-context"
import type { Comment } from "@/lib/mappers/types"

interface ProjectCommentsProps {
    projectId: string | number
    initialComments: Comment[]
}

export function ProjectComments({ projectId, initialComments }: ProjectCommentsProps) {
    const { addComment, deleteComment } = useProjects()
    const { user, profile } = useAuth()
    const { promptLogin } = useLoginPrompt()

    const [comments, setComments] = useState<Comment[]>(initialComments)
    const [newComment, setNewComment] = useState("")
    const [replyingTo, setReplyingTo] = useState<number | string | null>(null)
    const [replyContent, setReplyContent] = useState("")

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return

        const submitComment = async () => {
            const addedComment = await addComment(projectId, {
                id: 0,
                author: "Me",
                content: newComment,
                date: "",
            })

            if (addedComment) {
                setComments((prev) => [addedComment, ...prev])
                setNewComment("")
            }
        }

        if (!user) {
            promptLogin(() => {
                submitComment()
            }, {
                title: '登录以发表评论',
                description: '登录后即可参与讨论，分享你的想法'
            })
            return
        }

        submitComment()
    }

    const handleSubmitReply = async (
        e: React.FormEvent,
        parentId: number,
        replyToUserId?: string,
        replyToUsername?: string
    ) => {
        e.preventDefault()
        if (!replyContent.trim()) return

        const submitReply = async () => {
            const addedReply = await addComment(
                projectId,
                {
                    id: 0,
                    author: "Me",
                    content: replyContent,
                    date: "",
                    reply_to_user_id: replyToUserId,
                    reply_to_username: replyToUsername,
                },
                parentId
            )

            if (addedReply) {
                setComments((prev) => [addedReply, ...prev])
                setReplyContent("")
                setReplyingTo(null)
            }
        }

        if (!user) {
            promptLogin(() => {
                submitReply()
            }, {
                title: '登录以回复评论',
                description: '登录后即可参与讨论，回复其他用户'
            })
            return
        }

        submitReply()
    }

    const handleDeleteComment = async (commentId: string | number) => {
        await deleteComment(commentId)
        setComments((prev) => prev.filter((c) => c.id !== commentId))
    }

    const handleCancelReply = () => {
        setReplyContent("")
        setReplyingTo(null)
    }

    const topLevelComments = comments.filter((c) => !c.parent_id)
    const getNestedComments = (parentId: number | string) => {
        return comments.filter((c) => c.parent_id === parentId)
    }

    const renderComment = (comment: Comment, isNested: boolean = false): React.ReactNode => {
        const nestedComments = getNestedComments(comment.id)
        const isReplying = replyingTo === comment.id

        return (
            <div key={comment.id} className={isNested ? "ml-8 mt-3" : ""} id={`comment-${comment.id}`}>
                <div
                    className={`rounded-lg p-4 border transition-colors ${isNested
                            ? "bg-background/50 border-l-2 border-muted-foreground/20"
                            : "bg-muted/20 border-l-2 border-primary/30"
                        }`}
                >
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
                                            onClick={() => handleDeleteComment(comment.id)}
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
                                    onSubmit={(e) =>
                                        handleSubmitReply(e, Number(comment.id), comment.userId, comment.author)
                                    }
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
                        {nestedComments.map((nestedComment) => renderComment(nestedComment, true))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="border-t pt-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                讨论 ({comments.length})
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
                {comments.length > 0 ? (
                    topLevelComments.map((comment) => renderComment(comment, false))
                ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        还没有评论，快来抢沙发吧！
                    </div>
                )}
            </div>
        </div>
    )
}
