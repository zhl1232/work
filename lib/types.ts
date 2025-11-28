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
