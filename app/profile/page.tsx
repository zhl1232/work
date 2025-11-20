"use client";

import { useProjects } from "@/context/project-context";
import { ProjectCard } from "@/components/features/project-card";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Medal, Trophy, Star } from "lucide-react";

export default function ProfilePage() {
    const { projects, likedProjects, completedProjects } = useProjects();
    const [activeTab, setActiveTab] = useState<"my-projects" | "liked" | "completed">("liked");

    // Filter projects
    const myProjects = projects.filter(p => p.author === "我 (Me)");
    const likedProjectsList = projects.filter(p => likedProjects.has(p.id));
    const completedProjectsList = projects.filter(p => completedProjects.has(p.id));

    // Badge Logic
    const badges = [
        {
            id: "explorer",
            name: "初级探索者",
            icon: <Star className="h-6 w-6 text-yellow-500" />,
            description: "完成 1 个项目",
            unlocked: completedProjects.size >= 1,
        },
        {
            id: "scientist",
            name: "小小科学家",
            icon: <Medal className="h-6 w-6 text-blue-500" />,
            description: "完成 3 个项目",
            unlocked: completedProjects.size >= 3,
        },
        {
            id: "master",
            name: "STEAM 大师",
            icon: <Trophy className="h-6 w-6 text-purple-500" />,
            description: "完成 5 个项目",
            unlocked: completedProjects.size >= 5,
        },
    ];

    return (
        <div className="container mx-auto py-8">
            <div className="flex flex-col items-center mb-12">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl mb-4 relative">
                    🧑‍🚀
                    {badges.filter(b => b.unlocked).length > 0 && (
                        <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-background">
                            Lv.{badges.filter(b => b.unlocked).length}
                        </div>
                    )}
                </div>
                <h1 className="text-2xl font-bold">未来的科学家</h1>
                <p className="text-muted-foreground">加入时间: 2024-11-19</p>

                <div className="flex gap-8 mt-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold">{myProjects.length}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">发布</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{likedProjects.size}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">收藏</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{completedProjects.size}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">完成</div>
                    </div>
                </div>

                {/* Enhanced Badges Section */}
                <div className="mt-8 flex gap-4">
                    {badges.map((badge) => (
                        <div
                            key={badge.id}
                            className={cn(
                                "relative flex flex-col items-center p-4 rounded-xl border w-28 text-center transition-all duration-300",
                                badge.unlocked
                                    ? "bg-gradient-to-br from-background to-primary/5 border-primary/50 shadow-lg hover:shadow-xl hover:scale-105"
                                    : "bg-muted/30 border-transparent opacity-40 grayscale hover:opacity-60"
                            )}
                            title={badge.description}
                        >
                            {/* Glow effect for unlocked badges */}
                            {badge.unlocked && (
                                <>
                                    <div className="absolute inset-0 rounded-xl bg-primary/20 blur-xl opacity-50 animate-pulse" />
                                    <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 opacity-30 blur" />
                                </>
                            )}
                            <div className={cn(
                                "relative mb-2 p-3 rounded-full transition-all",
                                badge.unlocked ? "bg-primary/10 shadow-inner" : "bg-muted"
                            )}>
                                {badge.icon}
                            </div>
                            <span className="relative text-xs font-bold">{badge.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-center mb-8">
                <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                    <button
                        onClick={() => setActiveTab("my-projects")}
                        className={cn(
                            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                            activeTab === "my-projects" ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50"
                        )}
                    >
                        我的发布
                    </button>
                    <button
                        onClick={() => setActiveTab("liked")}
                        className={cn(
                            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                            activeTab === "liked" ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50"
                        )}
                    >
                        我的收藏
                    </button>
                    <button
                        onClick={() => setActiveTab("completed")}
                        className={cn(
                            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                            activeTab === "completed" ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50"
                        )}
                    >
                        我做过的
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {activeTab === "my-projects" && (
                    myProjects.length > 0 ? (
                        myProjects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            你还没有发布过任何项目。去<a href="/share" className="underline underline-offset-4 hover:text-primary">分享</a>一个吧！
                        </div>
                    )
                )}

                {activeTab === "liked" && (
                    likedProjectsList.length > 0 ? (
                        likedProjectsList.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            你还没有收藏任何项目。去<a href="/explore" className="underline underline-offset-4 hover:text-primary">探索</a>一下吧！
                        </div>
                    )
                )}

                {activeTab === "completed" && (
                    completedProjectsList.length > 0 ? (
                        completedProjectsList.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            你还没有完成任何项目。快去详情页点击"我做过这个"吧！
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
