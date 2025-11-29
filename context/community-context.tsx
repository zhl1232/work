"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { callRpc } from "@/lib/supabase/rpc";
import { useAuth } from "@/context/auth-context";
import { useGamification } from "@/context/gamification-context";
import { useNotifications } from "@/context/notification-context";
import { mapComment, type DbComment } from "@/lib/mappers/project";
import { Comment, Discussion, Challenge } from "@/lib/types";



type CommunityContextType = {
    discussions: Discussion[];
    challenges: Challenge[];
    addDiscussion: (discussion: Discussion) => void;
    addReply: (discussionId: string | number, reply: Comment, parentId?: number) => Promise<Comment | null>;
    joinChallenge: (challengeId: string | number) => void;
    deleteReply: (replyId: string | number) => Promise<void>;
    deleteDiscussion: (discussionId: string | number) => Promise<void>;
    isLoading: boolean;
};

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function CommunityProvider({ children }: { children: React.ReactNode }) {
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [supabase] = useState(() => createClient());
    const { user, profile } = useAuth();
    const { addXp } = useGamification();
    const { createNotification } = useNotifications();

    // Refs for stable callbacks
    const challengesRef = useRef(challenges);

    useEffect(() => { challengesRef.current = challenges; }, [challenges]);

    const fetchChallenges = useCallback(async () => {
        const { data, error } = await supabase
            .from('challenges')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching challenges:', error);
            return;
        }

        // Check joined status if user is logged in
        let joinedChallengeIds = new Set<number>();
        if (user) {
            const { data: participants } = await supabase
                .from('challenge_participants')
                .select('challenge_id')
                .eq('user_id', user.id);
            
            if (participants) {
                participants.forEach(p => joinedChallengeIds.add(p.challenge_id));
            }
        }

        const mappedChallenges: Challenge[] = data.map((c: any) => ({
            id: c.id,
            title: c.title,
            description: c.description || '',
            image: c.image_url || '',
            participants: c.participants_count,
            daysLeft: c.end_date ? Math.ceil((new Date(c.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0,
            endDate: c.end_date, // 添加原始日期用于倒计时组件
            joined: joinedChallengeIds.has(c.id),
            tags: c.tags || []
        }));

        setChallenges(mappedChallenges);
    }, [supabase, user]);

    useEffect(() => {
        const initData = async () => {
            setIsLoading(true);
            await fetchChallenges();
            setIsLoading(false);
        };
        initData();
    }, [fetchChallenges]);

    const addDiscussion = useCallback(async (discussion: Discussion) => {
        if (!user) return;

        await supabase
            .from('discussions')
            .insert({
                title: discussion.title,
                content: discussion.content,
                author_id: user.id,
                tags: discussion.tags
            });
    }, [supabase, user]);

    const addReply = useCallback(async (discussionId: string | number, reply: Comment, parentId?: number) => {
        if (!user) return null;

        const { data: newReply, error } = await supabase
            .from('discussion_replies')
            .insert({
                discussion_id: discussionId,
                author_id: user.id,
                content: reply.content,
                parent_id: parentId || null,
                reply_to_user_id: reply.reply_to_user_id || null,
                reply_to_username: reply.reply_to_username || null
            })
            .select(`
                *,
                profiles:author_id (display_name, avatar_url)
            `)
            .single();

        if (error || !newReply) {
            console.error('Error adding reply:', error);
            return null;
        }

        // Create notification if replying to someone
        if (reply.reply_to_user_id) {
            await createNotification({
                user_id: reply.reply_to_user_id,
                type: 'mention',
                content: `${profile?.display_name || '某人'} 在讨论中@了你`,
                related_type: 'discussion_reply',
                related_id: newReply.id,
                discussion_id: Number(discussionId),
                from_user_id: user.id,
                from_username: profile?.display_name || user.email?.split('@')[0] || '未知用户',
                from_avatar: profile?.avatar_url || user.user_metadata?.avatar_url
            });
        }

        // Award XP for replying
        addXp(5, "回复讨论");

        // 使用统一的映射函数
        return mapComment(newReply as unknown as DbComment);
    }, [supabase, user, profile, createNotification, addXp]);

    const joinChallenge = useCallback(async (challengeId: string | number) => {
        if (!user) return;
        const cid = Number(challengeId);
        
        // Find current challenge to check status
        const challenge = challengesRef.current.find(c => c.id === cid);
        if (!challenge) return;

        const isJoined = challenge.joined;

        // Optimistic update
        setChallenges(prev => prev.map(c => {
            if (c.id === cid) {
                return { ...c, joined: !isJoined, participants: c.participants + (isJoined ? -1 : 1) };
            }
            return c;
        }));

        if (isJoined) {
            // Leave
            await supabase.from('challenge_participants').delete().eq('user_id', user.id).eq('challenge_id', cid);
            await callRpc(supabase, 'decrement_challenge_participants', { challenge_id: cid });
        } else {
            // Join
            await supabase.from('challenge_participants').insert({ user_id: user.id, challenge_id: cid });
            await callRpc(supabase, 'increment_challenge_participants', { challenge_id: cid });
        }
    }, [supabase, user]);

    const deleteReply = useCallback(async (replyId: string | number) => {
        if (!user) return;
        const rid = replyId;

        // Optimistic update
        setDiscussions(prev => prev.map(d => {
            if (d.replies?.some(r => r.id === rid)) {
                return {
                    ...d,
                    replies: d.replies.filter(r => r.id !== rid)
                };
            }
            return d;
        }));

        const response = await fetch(`/api/replies/${rid}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            console.error('Error deleting reply:', await response.text());
        }
    }, [user]);

    const deleteDiscussion = useCallback(async (discussionId: string | number) => {
        if (!user) return;
        const did = discussionId;

        // Optimistic update
        setDiscussions(prev => prev.filter(d => d.id !== did));

        const response = await fetch(`/api/discussions/${did}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            console.error('Error deleting discussion:', await response.text());
        }
    }, [user]);

    const contextValue = useMemo(() => ({
        discussions,
        challenges,
        addDiscussion,
        addReply,
        joinChallenge,
        deleteReply,
        deleteDiscussion,
        isLoading
    }), [
        discussions,
        challenges,
        addDiscussion,
        addReply,
        joinChallenge,
        deleteReply,
        deleteDiscussion,
        isLoading
    ]);

    return (
        <CommunityContext.Provider value={contextValue}>
            {children}
        </CommunityContext.Provider>
    );
}

export function useCommunity() {
    const context = useContext(CommunityContext);
    if (context === undefined) {
        throw new Error("useCommunity must be used within a CommunityProvider");
    }
    return context;
}
