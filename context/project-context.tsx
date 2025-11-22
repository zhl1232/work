"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Comment = {
    id: string | number;
    author: string;
    userId?: string;
    content: string;
    date: string;
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
    addComment: (projectId: string | number, comment: Comment) => void;
    toggleLike: (projectId: string | number) => void;
    isLiked: (projectId: string | number) => boolean;
    toggleProjectCompleted: (projectId: string | number) => void;
    isCompleted: (projectId: string | number) => boolean;
    discussions: Discussion[];
    challenges: Challenge[];
    addDiscussion: (discussion: Discussion) => void;
    addReply: (discussionId: string | number, reply: Comment) => void;
    joinChallenge: (challengeId: string | number) => void;
};

const defaultProjects: Project[] = [
    {
        id: "pixel-art",
        title: "像素艺术工坊",
        author: "STEAM 官方",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop",
        category: "艺术",
        likes: 888,
        description: "体验 8-bit 艺术创作的乐趣！在这个数字画布上，你可以像早期的游戏设计师一样，用一个个方块构建出精彩的世界。",
        materials: ["电脑或平板", "创意"],
        steps: [
            { title: "选择颜色", description: "从左侧调色板中选择你喜欢的颜色。" },
            { title: "绘制图案", description: "在网格上点击或拖动鼠标来填充像素。" },
            { title: "保存作品", description: "完成创作后，记得截图保存你的杰作！" }
        ]
    },
    {
        id: "color-lab",
        title: "光的三原色实验室",
        author: "STEAM 官方",
        image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop",
        category: "科学",
        likes: 999,
        description: "探索 RGB 颜色模型，看看红、绿、蓝三种光是如何混合出千万种颜色的。",
        materials: ["电脑或平板", "好奇心"],
        steps: [
            { title: "打开实验室", description: "点击进入光的三原色实验室页面。" },
            { title: "调节滑块", description: "拖动红、绿、蓝三个滑块，观察颜色的变化。" },
            { title: "完成挑战", description: "尝试调出指定的颜色，完成挑战任务。" }
        ]
    },
    {
        id: 1,
        title: "自制火山爆发",
        author: "科学小达人",
        image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?q=80&w=2070&auto=format&fit=crop",
        category: "科学",
        likes: 128,
        description: "这是一个经典的科学实验，利用小苏打和醋的化学反应来模拟火山爆发。非常适合在家和小朋友一起动手制作！",
        materials: ["小苏打 2勺", "白醋 100ml", "红色食用色素 适量", "空塑料瓶 1个", "橡皮泥或粘土"],
        steps: [
            { title: "准备火山主体", description: "用橡皮泥或粘土围绕一个塑料瓶捏出火山的形状。" },
            { title: "加入反应物", description: "在瓶中加入两勺小苏打和几滴红色食用色素。" },
            { title: "引发爆发", description: "迅速倒入白醋，观察火山喷发！" }
        ]
    },
    {
        id: 2,
        title: "柠檬电池实验",
        author: "极客实验室",
        image: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?q=80&w=2070&auto=format&fit=crop",
        category: "技术",
        likes: 85,
        description: "利用柠檬中的酸性物质作为电解质，制作一个能点亮 LED 灯的电池。",
        materials: ["柠檬 2-3个", "铜片 (硬币)", "锌片 (镀锌钉子)", "导线", "LED 灯珠"],
        steps: [
            { title: "准备电极", description: "在每个柠檬上切两个口，分别插入铜片和锌片。" },
            { title: "串联电池", description: "用导线将一个柠檬的铜片连接到下一个柠檬的锌片。" },
            { title: "连接 LED", description: "将最后剩下的铜片和锌片分别连接到 LED 灯的长脚和短脚。" }
        ]
    },
    {
        id: 3,
        title: "纸板机械臂",
        author: "造物主",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop",
        category: "工程",
        likes: 256,
        description: "利用液压原理，用针筒和纸板制作一个可以控制抓取的机械臂。",
        materials: ["废旧纸板", "针筒 4-8个", "软管", "扎带", "热熔胶"],
        steps: [
            { title: "制作骨架", description: "根据图纸裁剪纸板，制作机械臂的各个关节。" },
            { title: "安装液压系统", description: "将针筒固定在关节处，用软管连接控制端的针筒。" },
            { title: "注水调试", description: "在系统中注水，推动控制端针筒，测试机械臂动作。" }
        ]
    },
    {
        id: 4,
        title: "光影艺术装置",
        author: "光之子",
        image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop",
        category: "艺术",
        likes: 92,
        description: "利用光线的反射和折射，创造出梦幻的投影效果。",
        materials: ["手电筒", "彩色玻璃纸", "镜子", "透明塑料片"],
        steps: [
            { title: "设计图案", description: "在透明塑料片上绘制或粘贴图案。" },
            { title: "布置光源", description: "固定手电筒位置，调整照射角度。" },
            { title: "调整投影", description: "利用镜子和玻璃纸改变光路和颜色，创造艺术效果。" }
        ]
    },
    {
        id: 5,
        title: "斐波那契螺旋画",
        author: "数学之美",
        image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=2070&auto=format&fit=crop",
        category: "数学",
        likes: 150,
        description: "用圆规和直尺画出完美的黄金螺旋，感受数学的几何之美。",
        materials: ["画纸", "圆规", "直尺", "铅笔", "彩色笔"],
        steps: [
            { title: "画正方形", description: "按照斐波那契数列 (1, 1, 2, 3, 5, 8...) 的边长画正方形。" },
            { title: "连接圆弧", description: "在每个正方形内画四分之一圆弧，连接起来形成螺旋。" },
            { title: "上色装饰", description: "发挥创意，为螺旋填充颜色或图案。" }
        ]
    },
    {
        id: 6,
        title: "水火箭发射",
        author: "航天梦",
        image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=2070&auto=format&fit=crop",
        category: "科学",
        likes: 300,
        description: "利用压缩空气的动力，将塑料瓶制作的火箭发射上天。",
        materials: ["大号碳酸饮料瓶 2个", "硬纸板 (尾翼)", "橡胶塞", "气门芯", "打气筒"],
        steps: [
            { title: "制作箭体", description: "将一个瓶子作为箭体，安装尾翼保持平衡。" },
            { title: "制作发射塞", description: "在橡胶塞上打孔，安装气门芯。" },
            { title: "发射准备", description: "加入约 1/3 的水，塞紧塞子，连接打气筒，打气发射！" }
        ]
    },
];



const defaultDiscussions: Discussion[] = [
    {
        id: 1,
        title: "如何让水火箭飞得更高？",
        author: "小小宇航员",
        content: "我做的水火箭只能飞 10 米高，有没有什么改进的建议？是不是水加太多了？",
        date: "2024-11-19",
        likes: 12,
        tags: ["科学", "求助"],
        replies: [
            { id: 101, author: "物理老师", content: "试着调整水和空气的比例，通常 1/3 的水效果最好。另外检查一下气密性。", date: "2024-11-19" },
            { id: 102, author: "火箭迷", content: "尾翼的形状也很重要，尽量做成流线型。", date: "2024-11-20" }
        ]
    },
    {
        id: 2,
        title: "分享一个有趣的静电实验",
        author: "闪电侠",
        content: "只需要一个气球和一些碎纸屑。摩擦气球后，它能吸起纸屑，甚至能让水流弯曲！太神奇了。",
        date: "2024-11-18",
        likes: 45,
        tags: ["科学", "分享"],
        replies: []
    }
];

const defaultChallenges: Challenge[] = [
    {
        id: 1,
        title: "环保小发明挑战",
        description: "利用废旧物品制作一个有用的装置。变废为宝，保护地球！",
        image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop",
        participants: 128,
        daysLeft: 15,
        joined: false,
        tags: ["工程", "环保"]
    },
    {
        id: 2,
        title: "未来城市设计",
        description: "画出或搭建你心目中的未来城市。它会有会飞的汽车吗？还是漂浮在空中的花园？",
        image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2070&auto=format&fit=crop",
        participants: 85,
        daysLeft: 7,
        joined: false,
        tags: ["艺术", "设计"]
    },
    {
        id: 3,
        title: "家庭机械臂制作",
        description: "只用纸板和针筒，制作一个液压机械臂。比比谁的机械臂力气大！",
        image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop",
        participants: 203,
        daysLeft: 20,
        joined: false,
        tags: ["工程", "物理"]
    }
];

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [projects, setProjects] = useState<Project[]>(defaultProjects);
    const [likedProjects, setLikedProjects] = useState<Set<string | number>>(new Set());
    const [completedProjects, setCompletedProjects] = useState<Set<string | number>>(new Set());
    const [discussions, setDiscussions] = useState<Discussion[]>(defaultDiscussions);
    const [challenges, setChallenges] = useState<Challenge[]>(defaultChallenges);

    // Load state from localStorage on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            // Load liked projects
            const savedLikes = localStorage.getItem('steam-liked-projects');
            if (savedLikes) {
                setLikedProjects(new Set(JSON.parse(savedLikes)));
            }

            // Load completed projects
            const savedCompleted = localStorage.getItem('steam-completed-projects');
            if (savedCompleted) {
                setCompletedProjects(new Set(JSON.parse(savedCompleted)));
            }

            // Load user projects and comments
            const savedProjects = localStorage.getItem('steam-projects');
            if (savedProjects) {
                const parsedProjects = JSON.parse(savedProjects);
                // Merge saved projects with default projects
                const mergedProjects = defaultProjects.map(defaultProject => {
                    const savedProject = parsedProjects.find((p: Project) => p.id === defaultProject.id);
                    return savedProject ? { ...defaultProject, comments: savedProject.comments, likes: savedProject.likes } : defaultProject;
                });
                // Add user-created projects
                const userProjects = parsedProjects.filter((p: Project) =>
                    !defaultProjects.some(dp => dp.id === p.id)
                );
                setProjects([...userProjects, ...mergedProjects]);
            }


            // Load discussions
            const savedDiscussions = localStorage.getItem('steam-discussions');
            if (savedDiscussions) {
                setDiscussions(JSON.parse(savedDiscussions));
            }

            // Load challenges
            const savedChallenges = localStorage.getItem('steam-challenges');
            if (savedChallenges) {
                setChallenges(JSON.parse(savedChallenges));
            }
        } catch (error) {
            console.error('Failed to load data from localStorage:', error);
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem('steam-liked-projects', JSON.stringify(Array.from(likedProjects)));
        } catch (error) {
            console.error('Failed to save liked projects:', error);
        }
    }, [likedProjects]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem('steam-completed-projects', JSON.stringify(Array.from(completedProjects)));
        } catch (error) {
            console.error('Failed to save completed projects:', error);
        }
    }, [completedProjects]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem('steam-projects', JSON.stringify(projects));
        } catch (error) {
            console.error('Failed to save projects:', error);
        }
    }, [projects]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem('steam-discussions', JSON.stringify(discussions));
        } catch (error) {
            console.error('Failed to save discussions:', error);
        }
    }, [discussions]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem('steam-challenges', JSON.stringify(challenges));
        } catch (error) {
            console.error('Failed to save challenges:', error);
        }
    }, [challenges]);

    const addProject = (project: Project) => {
        setProjects((prev) => [project, ...prev]);
    };

    const addComment = (projectId: string | number, comment: Comment) => {
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                return { ...p, comments: [comment, ...(p.comments || [])] };
            }
            return p;
        }));
    };

    const toggleLike = (projectId: string | number) => {
        setLikedProjects((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) {
                newSet.delete(projectId);
            } else {
                newSet.add(projectId);
            }
            return newSet;
        });

        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                return { ...p, likes: p.likes + (likedProjects.has(projectId) ? -1 : 1) };
            }
            return p;
        }));
    };

    const toggleProjectCompleted = (projectId: string | number) => {
        setCompletedProjects((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) {
                newSet.delete(projectId);
            } else {
                newSet.add(projectId);
            }
            return newSet;
        });
    };

    const isLiked = (projectId: string | number) => likedProjects.has(projectId);
    const isCompleted = (projectId: string | number) => completedProjects.has(projectId);

    const addDiscussion = (discussion: Discussion) => {
        setDiscussions(prev => [discussion, ...prev]);
    };

    const addReply = (discussionId: string | number, reply: Comment) => {
        setDiscussions(prev => prev.map(d => {
            if (d.id === discussionId) {
                return { ...d, replies: [...d.replies, reply] };
            }
            return d;
        }));
    };

    const joinChallenge = (challengeId: string | number) => {
        setChallenges(prev => prev.map(c => {
            if (c.id === challengeId) {
                return { ...c, joined: !c.joined, participants: c.participants + (c.joined ? -1 : 1) };
            }
            return c;
        }));
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
            joinChallenge
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
