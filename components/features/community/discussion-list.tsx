import { useState } from "react";
import Link from "next/link";
import { useProjects, Discussion } from "@/context/project-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Heart, Tag } from "lucide-react";

export function DiscussionList() {
    const { discussions, addDiscussion } = useProjects();
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newTags, setNewTags] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newContent.trim()) return;

        const discussion: Discussion = {
            id: Date.now(),
            title: newTitle,
            author: "我 (Me)",
            content: newContent,
            date: new Date().toLocaleDateString(),
            replies: [],
            likes: 0,
            tags: newTags.split(",").map(t => t.trim()).filter(t => t),
        };

        addDiscussion(discussion);
        setNewTitle("");
        setNewContent("");
        setNewTags("");
        setIsCreating(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">讨论区</h2>
                <Button onClick={() => setIsCreating(!isCreating)}>
                    {isCreating ? "取消" : "发起讨论"}
                </Button>
            </div>

            {isCreating && (
                <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4 bg-muted/30">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">标题</label>
                        <Input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="请输入标题..."
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">内容</label>
                        <Textarea
                            value={newContent}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewContent(e.target.value)}
                            placeholder="详细描述你的问题或想法..."
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">标签 (用逗号分隔)</label>
                        <Input
                            value={newTags}
                            onChange={(e) => setNewTags(e.target.value)}
                            placeholder="例如: 科学, 实验, 求助"
                        />
                    </div>
                    <Button type="submit">发布</Button>
                </form>
            )}

            <div className="space-y-4">
                {discussions.map((discussion) => (
                    <div key={discussion.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white/70 dark:bg-gray-800/70 backdrop-blur-md hover:scale-105 transition-transform cursor-pointer group relative">
                        <Link href={`/community/discussion/${discussion.id}`} className="absolute inset-0" />
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{discussion.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        👤 {discussion.author}
                                    </span>
                                    <span>{discussion.date}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {discussion.tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs flex items-center gap-1">
                                        <Tag className="h-3 w-3" /> {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <p className="text-muted-foreground mb-4">{discussion.content}</p>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground border-t pt-4 relative z-10">
                            <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                                <MessageSquare className="h-4 w-4" />
                                {discussion.replies.length} 回复
                            </Button>
                            <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent hover:text-red-500">
                                <Heart className="h-4 w-4" />
                                {discussion.likes} 赞
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
