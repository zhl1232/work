"use client";

import { useGamification } from "@/context/gamification-context";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Crown } from "lucide-react";
import { LeaderboardItemSkeleton } from "@/components/ui/leaderboard-skeleton";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface LeaderboardUser {
    id: string;
    name: string;
    xp: number;
    level: number;
    badges: number;
    avatar: string | null | undefined;
    isCurrentUser?: boolean;
}

export default function LeaderboardPage() {
    const { user, profile } = useAuth();
    const { xp, level, unlockedBadges } = useGamification();
    const [isLoading, setIsLoading] = useState(true);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
    const supabase = createClient();

    // 获取真实排行榜数据
    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);

            try {
                // 1. 查询 Top 20 用户（按 XP 降序）
                const { data: topProfiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, display_name, avatar_url, xp')
                    .order('xp', { ascending: false })
                    .limit(20);

                if (profilesError) throw profilesError;

                if (!topProfiles || topProfiles.length === 0) {
                    setLeaderboardData([]);
                    setIsLoading(false);
                    return;
                }

                // 2. 批量查询这些用户的徽章数量
                const userIds = topProfiles.map(p => p.id);
                const { data: badgesData, error: badgesError } = await supabase
                    .from('user_badges')
                    .select('user_id, badge_id')
                    .in('user_id', userIds);

                if (badgesError) throw badgesError;

                // 3. 统计每个用户的徽章数
                const badgeCounts = new Map<string, number>();
                badgesData?.forEach(({ user_id }) => {
                    badgeCounts.set(user_id, (badgeCounts.get(user_id) || 0) + 1);
                });

                // 4. 组合数据
                const users: LeaderboardUser[] = topProfiles.map(p => ({
                    id: p.id,
                    name: p.display_name || '匿名用户',
                    xp: p.xp || 0,
                    level: Math.floor(Math.sqrt((p.xp || 0) / 100)) + 1,
                    badges: badgeCounts.get(p.id) || 0,
                    avatar: p.avatar_url,
                    isCurrentUser: user?.id === p.id
                }));

                // 5. 如果当前用户不在 Top 20，添加到列表
                if (user && !users.some(u => u.id === user.id)) {
                    users.push({
                        id: user.id,
                        name: profile?.display_name || '我',
                        xp,
                        level,
                        badges: unlockedBadges.size,
                        avatar: profile?.avatar_url,
                        isCurrentUser: true
                    });
                }

                // 6. 重新按 XP 排序
                users.sort((a, b) => b.xp - a.xp);

                setLeaderboardData(users);
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
                setLeaderboardData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, [user, profile, xp, level, unlockedBadges, supabase]);

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
                        ) : leaderboardData.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                暂无排行榜数据
                            </div>
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
