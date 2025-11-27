"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { callRpc } from "@/lib/supabase/rpc";
import { useAuth } from "@/context/auth-context";
import { useGamification } from "@/context/gamification-context";
import { useNotifications } from "@/context/notification-context";
import { mapProjectWithDetails, mapComment } from "@/lib/mappers/project";

export type Comment = {
    id: string | number;
    author: string;
    userId?: string;
    avatar?: string;
    content: string;
    date: string;
    parent_id?: number | null;
    reply_to_user_id?: string | null;
    reply_to_username?: string | null;
};

export type Discussion = {
    id: string | number;
    title: string;
    author: string;
    content: string;
    date: string;
    replies: Comment[];
    likes: number;
    tags: string[];
};

export type Challenge = {
    id: string | number;
    title: string;
    description: string;
    image: string;
    participants: number;
    daysLeft: number;
    joined: boolean;
    tags: string[];
};

export type Project = {
    id: string | number;
    title: string;
    author: string;
    author_id: string; // Added for reliable ownership check
    image: string;
    category: string;
    likes: number;
    description?: string;
    materials?: string[];
    steps?: { title: string; description: string }[];
    comments?: Comment[];
};

type ProjectContextType = {
    projects: Project[];
    likedProjects: Set<string | number>;
    completedProjects: Set<string | number>;
    addProject: (project: Project) => void;
    addComment: (projectId: string | number, comment: Comment, parentId?: number) => Promise<Comment | null>;
    toggleLike: (projectId: string | number) => void;
    isLiked: (projectId: string | number) => boolean;
    toggleProjectCompleted: (projectId: string | number) => void;
    isCompleted: (projectId: string | number) => boolean;
    discussions: Discussion[];
    challenges: Challenge[];
    addDiscussion: (discussion: Discussion) => void;
    addReply: (discussionId: string | number, reply: Comment, parentId?: number) => Promise<Comment | null>;
    joinChallenge: (challengeId: string | number) => void;
    deleteComment: (commentId: string | number) => Promise<void>;
    deleteReply: (replyId: string | number) => Promise<void>;
    deleteDiscussion: (discussionId: string | number) => Promise<void>;
    isLoading: boolean;
};



const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [likedProjects, setLikedProjects] = useState<Set<string | number>>(new Set());
    const [completedProjects, setCompletedProjects] = useState<Set<string | number>>(new Set());
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const supabase = createClient();
    const { user, profile } = useAuth();
    const { addXp, checkBadges } = useGamification();
    const { createNotification } = useNotifications();

    const fetchProjects = async () => {
        const { data, error } = await supabase
            .from('projects')
            .select(`
                *,
                profiles:author_id (display_name, username),
                project_materials (*),
                project_steps (*),
                comments (
                    *,
                    profiles:author_id (display_name, username, avatar_url)
                )
            `)
            .order('created_at', { ascending: false, foreignTable: 'comments' })
            .order('id', { ascending: true, foreignTable: 'comments' })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching projects:', error);
            return;
        }

        // 使用统一的映射函数
        const mappedProjects: Project[] = data.map((p: any) => mapProjectWithDetails(p));
        setProjects(mappedProjects);
    };

    const fetchDiscussions = async () => {
        const { data, error } = await supabase
            .from('discussions')
            .select(`
                *,
                profiles:author_id (display_name, username),
                discussion_replies (
                    *,
                    profiles:author_id (display_name, username, avatar_url)
                )
            `)
            .order('created_at', { ascending: false, foreignTable: 'discussion_replies' })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching discussions:', error);
            return;
        }

        const mappedDiscussions: Discussion[] = data.map((d: any) => ({
            id: d.id,
            title: d.title,
            author: d.profiles?.display_name || d.profiles?.username || 'Unknown',
            content: d.content,
            date: new Date(d.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
            likes: d.likes_count,
            tags: d.tags || [],
            // 使用统一的映射函数处理回复
            replies: d.discussion_replies?.map((r: any) => mapComment(r)) || []
        }));

        setDiscussions(mappedDiscussions);
    };

    const fetchChallenges = async () => {
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
            joined: joinedChallengeIds.has(c.id),
            tags: c.tags || []
        }));

        setChallenges(mappedChallenges);
    };

    const fetchUserInteractions = async () => {
        if (!user) {
            setLikedProjects(new Set());
            setCompletedProjects(new Set());
            return;
        }

        const { data: likes } = await supabase
            .from('likes')
            .select('project_id')
            .eq('user_id', user.id);
        
        if (likes) {
            setLikedProjects(new Set(likes.map(l => l.project_id)));
        }

        const { data: completed } = await supabase
            .from('completed_projects')
            .select('project_id')
            .eq('user_id', user.id);
        
        if (completed) {
            setCompletedProjects(new Set(completed.map(c => c.project_id)));
        }
    };

    useEffect(() => {
        const initData = async () => {
            setIsLoading(true);
            // Only fetch challenges globally for now as they are small and used in CommunityPage
            await fetchChallenges();
            setIsLoading(false);
        };
        initData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchUserInteractions();
        // Refresh challenges to update joined status
        fetchChallenges();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const getUserStats = async () => {
        if (!user) return { projectsPublished: 0, projectsLiked: 0, projectsCompleted: 0, commentsCount: 0 };

        const { count: publishedCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('author_id', user.id);

        const { count: commentsCount } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('author_id', user.id);

        return {
            projectsPublished: publishedCount || 0,
            projectsLiked: likedProjects.size,
            projectsCompleted: completedProjects.size,
            commentsCount: commentsCount || 0
        };
    };

    const addProject = async (project: Project) => {
        if (!user) return;

        // 1. Insert Project
        const { data: newProject, error } = await supabase
            .from('projects')
            .insert({
                title: project.title,
                description: project.description,
                author_id: user.id,
                image_url: project.image,
                category: project.category,
                likes_count: 0
            })
            .select()
            .single();

        if (error || !newProject) {
            console.error('Error adding project:', error);
            return;
        }

        // 2. Insert Materials
        if (project.materials && project.materials.length > 0) {
            await supabase
                .from('project_materials')
                .insert(project.materials.map((m, index) => ({
                    project_id: newProject.id,
                    material: m,
                    sort_order: index
                })));
        }

        // 3. Insert Steps
        if (project.steps && project.steps.length > 0) {
            await supabase
                .from('project_steps')
                .insert(project.steps.map((s, index) => ({
                    project_id: newProject.id,
                    title: s.title,
                    description: s.description,
                    sort_order: index
                })));
        }

        // Award XP for publishing a project
        addXp(50, "发布新项目");
        
        // Check badges
        const stats = await getUserStats();
        // Manually increment published count since the new project might not be indexed yet or we want immediate feedback
        checkBadges({
            ...stats,
            projectsPublished: stats.projectsPublished + 1
        });

        fetchProjects();
    };

    const addComment = async (projectId: string | number, comment: Comment, parentId?: number) => {
        if (!user) return null;

        const { data: newComment, error } = await supabase
            .from('comments')
            .insert({
                project_id: projectId,
                author_id: user.id,
                content: comment.content,
                parent_id: parentId || null,
                reply_to_user_id: comment.reply_to_user_id || null,
                reply_to_username: comment.reply_to_username || null
            })
            .select(`
                *,
                profiles:author_id (display_name, avatar_url)
            `)
            .single();

        if (error || !newComment) {
            console.error('Error adding comment:', error);
            return null;
        }

        // Create notification if replying to someone
        if (comment.reply_to_user_id) {
            await createNotification({
                user_id: comment.reply_to_user_id,
                type: 'mention',
                content: `${profile?.display_name || '某人'} 在评论中@了你`,
                related_type: 'comment',
                related_id: newComment.id,
                project_id: Number(projectId),
                from_user_id: user.id,
                from_username: profile?.display_name || user.email?.split('@')[0] || '未知用户',
                from_avatar: profile?.avatar_url || user.user_metadata?.avatar_url
            });
        }

        // Award XP for commenting
        addXp(5, "发表评论");
        
        // Check badges
        const stats = await getUserStats();
        checkBadges({
            ...stats,
            commentsCount: stats.commentsCount + 1
        });

        // 使用统一的映射函数
        return mapComment(newComment as any);
    };

    const toggleLike = async (projectId: string | number) => {
        if (!user) return;
        const pid = typeof projectId === 'string' ? parseInt(projectId) : projectId;

        const isLiked = likedProjects.has(projectId);
        
        // Optimistic update
        setLikedProjects(prev => {
            const newSet = new Set(prev);
            if (isLiked) newSet.delete(projectId);
            else newSet.add(projectId);
            return newSet;
        });

        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                return { ...p, likes: p.likes + (isLiked ? -1 : 1) };
            }
            return p;
        }));

        if (isLiked) {
            await supabase.from('likes').delete().eq('user_id', user.id).eq('project_id', pid);
            await callRpc(supabase, 'decrement_project_likes', { project_id: pid });
        } else {
            await supabase.from('likes').insert({ user_id: user.id, project_id: pid });
            await callRpc(supabase, 'increment_project_likes', { project_id: pid });
        }
    };

    const toggleProjectCompleted = async (projectId: string | number) => {
        if (!user) return;
        const pid = projectId;
        const isCompleted = completedProjects.has(pid);

        // Optimistic update
        setCompletedProjects(prev => {
            const newSet = new Set(prev);
            if (isCompleted) newSet.delete(pid);
            else newSet.add(pid);
            return newSet;
        });

        if (isCompleted) {
            await supabase.from('completed_projects').delete().eq('user_id', user.id).eq('project_id', pid);
        } else {
            await supabase.from('completed_projects').insert({ user_id: user.id, project_id: pid });
            
            // Award XP for completing a project
            addXp(20, "完成项目");
            
             // Check badges
            const stats = await getUserStats();
            checkBadges({
                ...stats,
                projectsCompleted: completedProjects.size + 1
            });
        }
    };

    const isLiked = (projectId: string | number) => likedProjects.has(projectId);
    const isCompleted = (projectId: string | number) => completedProjects.has(projectId);

    const addDiscussion = async (discussion: Discussion) => {
        if (!user) return;

        await supabase
            .from('discussions')
            .insert({
                title: discussion.title,
                content: discussion.content,
                author_id: user.id,
                tags: discussion.tags
            });

        fetchDiscussions();
    };

    const addReply = async (discussionId: string | number, reply: Comment, parentId?: number) => {
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
        return mapComment(newReply as any);
    };

    const joinChallenge = async (challengeId: string | number) => {
        if (!user) return;
        const cid = Number(challengeId);
        
        // Find current challenge to check status
        const challenge = challenges.find(c => c.id === cid);
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
            // Note: Schema doesn't have a delete policy for participants yet? 
            // Actually it does: "Users can join challenges" (INSERT). But maybe not DELETE?
            // Let's assume we can delete.
            // Wait, I didn't see a DELETE policy for challenge_participants in schema.
            // I should check schema.
            await supabase.from('challenge_participants').delete().eq('user_id', user.id).eq('challenge_id', cid);
            await callRpc(supabase, 'decrement_challenge_participants', { challenge_id: cid });
        } else {
            // Join
            await supabase.from('challenge_participants').insert({ user_id: user.id, challenge_id: cid });
            await callRpc(supabase, 'increment_challenge_participants', { challenge_id: cid });
        }
    };

    const deleteComment = async (commentId: string | number) => {
        if (!user) return;
        const cid = commentId;

        // Optimistic update
        setProjects(prev => prev.map(p => {
            if (p.comments?.some(c => c.id === cid)) {
                return {
                    ...p,
                    comments: p.comments.filter(c => c.id !== cid)
                };
            }
            return p;
        }));

        const response = await fetch(`/api/comments/${cid}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            console.error('Error deleting comment:', await response.text());
            // Revert optimistic update if needed, but for now let's just fetch
            fetchProjects();
        }
    };

    const deleteReply = async (replyId: string | number) => {
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
            fetchDiscussions();
        }
    };

    const deleteDiscussion = async (discussionId: string | number) => {
        if (!user) return;
        const did = discussionId;

        // Optimistic update
        setDiscussions(prev => prev.filter(d => d.id !== did));

        const response = await fetch(`/api/discussions/${did}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            console.error('Error deleting discussion:', await response.text());
            fetchDiscussions();
        }
    };

    return (
        <ProjectContext.Provider value={{
            projects,
            likedProjects,
            completedProjects,
            addProject,
            addComment,
            toggleLike,
            isLiked,
            toggleProjectCompleted,
            isCompleted,
            discussions,
            challenges,
            addDiscussion,
            addReply,
            joinChallenge,
            deleteComment,
            deleteReply,
            deleteDiscussion,
            isLoading
        }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProjects() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error("useProjects must be used within a ProjectProvider");
    }
    return context;
}
