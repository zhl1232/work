import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";

export interface ModeratorEligibility {
    isEligible: boolean;
    score: number;
    requirements: {
        level: { met: boolean; current: number; required: number };
        publishedProjects: { met: boolean; current: number; required: number };
        completedProjects: { met: boolean; current: number; required: number };
        commentsCount: { met: boolean; current: number; required: number };
        badges: { met: boolean; current: number; required: number };
        accountAge: { met: boolean; current: number; required: number };
        violations: { met: boolean };
    };
}

export function useModeratorEligibility() {
    const { user, profile } = useAuth();
    const [eligibility, setEligibility] = useState<ModeratorEligibility | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function checkEligibility() {
            if (!user || !profile) {
                setEligibility(null);
                setIsLoading(false);
                return;
            }

            // 如果已经是审核员或管理员，不能申请
            if (profile.role !== 'user') {
                setEligibility(null);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            try {
                const xp = profile.xp || 0;
                const level = Math.floor(Math.sqrt(xp / 100)) + 1;

                // 查询发布的项目数（已审核通过）
                const { count: publishedCount } = await supabase
                    .from('projects')
                    .select('*', { count: 'exact', head: true })
                    .eq('author_id', user.id)
                    .eq('status', 'approved');

                // 查询完成的项目数（带证明）
                const { count: completedCount } = await supabase
                    .from('completed_projects')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .not('proof_images', 'is', null);

                // 查询评论数
                const { count: commentsCount } = await supabase
                    .from('comments')
                    .select('*', { count: 'exact', head: true })
                    .eq('author_id', user.id);

                // 查询徽章数
                const { count: badgesCount } = await supabase
                    .from('user_badges')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                // 计算账号年龄（天数）
                const accountAge = Math.floor(
                    (Date.now() - new Date(profile.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24)
                );

                // 检查违规记录（被拒绝的项目）
                const { count: rejectedProjects } = await supabase
                    .from('projects')
                    .select('*', { count: 'exact', head: true })
                    .eq('author_id', user.id)
                    .eq('status', 'rejected');

                const hasViolations = (rejectedProjects || 0) > 0;

                // 评分（方案 B - Lv.5 版本）
                const requirements = {
                    level: { met: level >= 5, current: level, required: 5 },
                    publishedProjects: { met: (publishedCount || 0) >= 3, current: publishedCount || 0, required: 3 },
                    completedProjects: { met: (completedCount || 0) >= 5, current: completedCount || 0, required: 5 },
                    commentsCount: { met: (commentsCount || 0) >= 30, current: commentsCount || 0, required: 30 },
                    badges: { met: (badgesCount || 0) >= 2, current: badgesCount || 0, required: 2 },
                    accountAge: { met: accountAge >= 14, current: accountAge, required: 14 },
                    violations: { met: !hasViolations }
                };

                const score = (
                    (requirements.level.met ? 30 : 0) +
                    (requirements.publishedProjects.met ? 25 : 0) +
                    (requirements.completedProjects.met ? 15 : 0) +
                    (requirements.commentsCount.met ? 15 : 0) +
                    (requirements.badges.met ? 10 : 0) +
                    (requirements.accountAge.met ? 5 : 0)
                );

                const isEligible = score >= 80 && !hasViolations;

                setEligibility({ isEligible, score, requirements });
            } catch (error) {
                console.error('Error checking eligibility:', error);
                setEligibility(null);
            } finally {
                setIsLoading(false);
            }
        }

        checkEligibility();
    }, [user, profile, supabase]);

    return { eligibility, isLoading };
}
