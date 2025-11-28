"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { callRpc } from "@/lib/supabase/rpc";
import { useAuth } from "@/context/auth-context";
import { useGamification } from "@/context/gamification-context";
import { useNotifications } from "@/context/notification-context";
import { mapComment, type DbComment } from "@/lib/mappers/project";
import { Project, Comment } from "@/lib/types";

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
    deleteComment: (commentId: string | number) => Promise<void>;
    isLoading: boolean;
};



const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [likedProjects, setLikedProjects] = useState<Set<string | number>>(new Set());
    const [completedProjects, setCompletedProjects] = useState<Set<string | number>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    
    const [supabase] = useState(() => createClient());
    const { user, profile } = useAuth();
    const { addXp, checkBadges } = useGamification();
    const { createNotification } = useNotifications();

    // Refs for stable callbacks
    const likedProjectsRef = useRef(likedProjects);
    const completedProjectsRef = useRef(completedProjects);

    useEffect(() => { likedProjectsRef.current = likedProjects; }, [likedProjects]);
    useEffect(() => { completedProjectsRef.current = completedProjects; }, [completedProjects]);







    const fetchUserInteractions = useCallback(async () => {
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
    }, [supabase, user]);

    useEffect(() => {
        const initData = async () => {
            setIsLoading(true);
            // No global fetch needed for projects anymore
            setIsLoading(false);
        };
        initData();
    }, []);

    useEffect(() => {
        if (user?.id) {
            fetchUserInteractions();
        }
    }, [user?.id, fetchUserInteractions]);

    const getUserStats = useCallback(async () => {
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
            projectsLiked: likedProjectsRef.current.size,
            projectsCompleted: completedProjectsRef.current.size,
            commentsCount: commentsCount || 0
        };
    }, [supabase, user]);

    const addProject = useCallback(async (project: Project) => {
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

        // fetchProjects(); // Removed
    }, [supabase, user, addXp, checkBadges, getUserStats]);

    const addComment = useCallback(async (projectId: string | number, comment: Comment, parentId?: number) => {
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
        return mapComment(newComment as unknown as DbComment);
    }, [supabase, user, profile, createNotification, addXp, checkBadges, getUserStats]);

    const toggleLike = useCallback(async (projectId: string | number) => {
        if (!user) return;
        const pid = typeof projectId === 'string' ? parseInt(projectId) : projectId;

        const isLiked = likedProjectsRef.current.has(projectId);
        
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
    }, [supabase, user]);

    const toggleProjectCompleted = useCallback(async (projectId: string | number) => {
        if (!user) return;
        const pid = projectId;
        const isCompleted = completedProjectsRef.current.has(pid);

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
                projectsCompleted: completedProjectsRef.current.size + 1
            });
        }
    }, [supabase, user, addXp, checkBadges, getUserStats]);

    const isLiked = useCallback((projectId: string | number) => likedProjects.has(projectId), [likedProjects]);
    const isCompleted = useCallback((projectId: string | number) => completedProjects.has(projectId), [completedProjects]);



    const deleteComment = useCallback(async (commentId: string | number) => {
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
            // Revert optimistic update if needed
        }
    }, [user]);



    // 使用 useMemo 缓存 Context 值，避免每次渲染都创建新对象
    const contextValue = useMemo(() => ({
        projects,
        likedProjects,
        completedProjects,
        addProject,
        addComment,
        toggleLike,
        isLiked,
        toggleProjectCompleted,
        isCompleted,
        deleteComment,
        isLoading
    }), [
        projects,
        likedProjects,
        completedProjects,
        addProject,
        addComment,
        toggleLike,
        isLiked,
        toggleProjectCompleted,
        isCompleted,
        deleteComment,
        isLoading
    ]);

    return (
        <ProjectContext.Provider value={contextValue}>
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
