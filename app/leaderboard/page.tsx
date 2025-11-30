"use client";

import { useGamification } from "@/context/gamification-context";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Crown } from "lucide-react";
import { LeaderboardItemSkeleton } from "@/components/ui/leaderboard-skeleton";
import { useState, useEffect } from "react";

interface LeaderboardUser {
    id: string;
    name: string;
    xp: number;
    level: number;
    badges: number;
    avatar: string | null | undefined;
    isCurrentUser?: boolean;
}

// Mock data for leaderboard since we don't have a real backend for all users yet
const MOCK_USERS: LeaderboardUser[] = [
    { id: "1", name: "科技小达人", xp: 5400, level: 8, badges: 12, avatar: null },
    { id: "2", name: "STEAM探索者", xp: 4200, level: 7, badges: 9, avatar: null },
    { id: "3", name: "未来发明家", xp: 3800, level: 7, badges: 8, avatar: null },
    { id: "4", name: "创意工坊", xp: 2900, level: 6, badges: 6, avatar: null },
    { id: "5", name: "小小工程师", xp: 2100, level: 5, badges: 5, avatar: null },
];

export default function LeaderboardPage() {
    const { user, profile } = useAuth();
    const { xp, level, unlockedBadges } = useGamification();
    const [isLoading, setIsLoading] = useState(true);

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    // Combine current user with mock users and sort
    const currentUser: LeaderboardUser | null = user ? {
        id: user.id,
        name: profile?.display_name || user.user_metadata?.full_name || "我",
        xp,
        level,
        badges: unlockedBadges.size,
        avatar: profile?.avatar_url || user.user_metadata?.avatar_url,
        isCurrentUser: true
    } : null;

    const leaderboardData = [...MOCK_USERS];
    if (currentUser) {
        leaderboardData.push(currentUser);
    }

    // Sort by XP descending
    leaderboardData.sort((a, b) => b.xp - a.xp);

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Crown className="h-6 w-6 text-yellow-500" />;
            case 1: return <Medal className="h-6 w-6 text-gray-400" />;
            case 2: return <Medal className="h-6 w-6 text-amber-600" />;
            default: return <span className="text-lg font-bold text-muted-foreground w-6 text-center">{index + 1}</span>;
        }
    };

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600">
                    <Trophy className="h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">社区排行榜</h1>
                    <p className="text-muted-foreground">
                        看看谁是 STEAM 社区最活跃的探索者！
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>积分榜</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {isLoading ? (
                            <>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <LeaderboardItemSkeleton key={i} />
                                ))}
                            </>
                        ) : (
                            <>
                                {leaderboardData.map((user, index) => (
                                    <div
                                        key={user.id}
                                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${user.isCurrentUser ? "bg-primary/5 border-primary/50" : "bg-card hover:bg-accent/50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center justify-center w-8">
                                                {getRankIcon(index)}
                                            </div>
                                            <Avatar className="h-10 w-10 border-2 border-background">
                                                <AvatarImage src={user.avatar || undefined} />
                                                <AvatarFallback>{user.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-semibold flex items-center gap-2">
                                                    {user.name}
                                                    {user.isCurrentUser && <Badge variant="secondary" className="text-xs">你</Badge>}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    Lv.{user.level} • {user.badges} 枚徽章
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-primary">{user.xp.toLocaleString()}</div>
                                            <div className="text-xs text-muted-foreground">XP</div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
