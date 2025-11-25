"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AchievementToast } from "@/components/features/gamification/achievement-toast";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";

// Badge Definitions
export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    condition: (stats: UserStats) => boolean;
}

export interface UserStats {
    projectsPublished: number;
    projectsLiked: number;
    projectsCompleted: number;
    commentsCount: number;
}

export const BADGES: Badge[] = [
    {
        id: "explorer",
        name: "初级探索者",
        description: "完成 1 个项目",
        icon: "🌟",
        condition: (stats) => stats.projectsCompleted >= 1,
    },
    {
        id: "scientist",
        name: "小小科学家",
        description: "完成 3 个项目",
        icon: "⚗️",
        condition: (stats) => stats.projectsCompleted >= 3,
    },
    {
        id: "master",
        name: "STEAM 大师",
        description: "完成 10 个项目",
        icon: "🏆",
        condition: (stats) => stats.projectsCompleted >= 10,
    },
    {
        id: "creator",
        name: "创意达人",
        description: "发布 3 个项目",
        icon: "🎨",
        condition: (stats) => stats.projectsPublished >= 3,
    },
    {
        id: "helpful",
        name: "热心助人",
        description: "发表 10 条评论",
        icon: "💬",
        condition: (stats) => stats.commentsCount >= 10,
    },
];

interface GamificationContextType {
    xp: number;
    level: number;
    unlockedBadges: Set<string>;
    addXp: (amount: number, reason?: string) => void;
    checkBadges: (stats: UserStats) => void;
    nextLevelXp: number;
    progress: number;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
    const [xp, setXp] = useState(0);
    const [unlockedBadges, setUnlockedBadges] = useState<Set<string>>(new Set());
    const { toast } = useToast();
    const supabase = createClient();
    const { user } = useAuth();

    // Load from Supabase
    useEffect(() => {
        if (!user) {
            setXp(0);
            setUnlockedBadges(new Set());
            return;
        }

        const fetchData = async () => {
            // Fetch XP
            const { data: profile } = await supabase
                .from('profiles')
                .select('xp')
                .eq('id', user.id)
                .single();
            
            if (profile) {
                setXp(profile.xp || 0);
            }

            // Fetch Badges
            const { data: badges } = await supabase
                .from('user_badges')
                .select('badge_id')
                .eq('user_id', user.id);
            
            if (badges) {
                setUnlockedBadges(new Set(badges.map(b => b.badge_id)));
            }
        };

        fetchData();
    }, [user]);

    // Level Calculation: Level = floor(sqrt(XP / 100)) + 1
    // XP = 100 * (Level - 1)^2
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;
    const currentLevelBaseXp = 100 * Math.pow(level - 1, 2);
    const nextLevelXp = 100 * Math.pow(level, 2);
    const levelProgress = xp - currentLevelBaseXp;
    const levelTotalNeeded = nextLevelXp - currentLevelBaseXp;
    const progress = (levelProgress / levelTotalNeeded) * 100;

    const addXp = async (amount: number, _reason?: string) => {
        if (!user) return;

        const newXp = xp + amount;
        setXp(newXp); // Optimistic update

        const oldLevel = Math.floor(Math.sqrt(xp / 100)) + 1;
        const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

        if (newLevel > oldLevel) {
            toast({
                description: (
                    <AchievementToast 
                        title="升级啦！" 
                        description={`恭喜你达到了等级 ${newLevel}！`} 
                        icon="🎉" 
                    />
                ),
                duration: 5000,
            });
        }

        // Update Supabase
        const { error } = await supabase
            .from('profiles')
            .update({ xp: newXp })
            .eq('id', user.id);

        if (error) {
            console.error('Failed to update XP:', error);
            // Revert optimistic update if needed, but for XP it might be okay to just log error
        }
    };

    const checkBadges = async (stats: UserStats) => {
        if (!user) return;

        BADGES.forEach(async (badge) => {
            if (!unlockedBadges.has(badge.id) && badge.condition(stats)) {
                // Optimistic update
                setUnlockedBadges((prev) => {
                    const newSet = new Set(prev);
                    newSet.add(badge.id);
                    return newSet;
                });
                
                toast({
                    description: (
                        <AchievementToast 
                            title="解锁新徽章！" 
                            description={`你获得了 "${badge.name}" 徽章`} 
                            icon={badge.icon} 
                        />
                    ),
                    duration: 5000,
                });

                // Update Supabase
                const { error } = await supabase
                    .from('user_badges')
                    .insert({
                        user_id: user.id,
                        badge_id: badge.id
                    });
                
                if (error) {
                    console.error(`Failed to unlock badge ${badge.id}:`, error);
                }
            }
        });
    };

    return (
        <GamificationContext.Provider value={{ 
            xp, 
            level, 
            unlockedBadges, 
            addXp, 
            checkBadges,
            nextLevelXp,
            progress
        }}>
            {children}
        </GamificationContext.Provider>
    );
}

export function useGamification() {
    const context = useContext(GamificationContext);
    if (context === undefined) {
        throw new Error("useGamification must be used within a GamificationProvider");
    }
    return context;
}
