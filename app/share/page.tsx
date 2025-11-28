"use client";

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { useProjects } from "@/context/project-context";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export default function SharePage() {
    const { addProject } = useProjects();
    const { user } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // 检查登录状态
    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const materialsText = formData.get("materials") as string;
        const stepsText = formData.get("description") as string;

        const newProject = {
            id: Date.now(),
            title: formData.get("title") as string,
            author: user?.user_metadata?.display_name || user?.email || "匿名用户",
            author_id: user!.id, // 添加必需的 author_id 字段
            image: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=2070&auto=format&fit=crop", // Random placeholder
            category: "其他",
            likes: 0,
            description: stepsText.slice(0, 50) + "...", // Use first part of steps as description
            materials: materialsText.split("\n").filter(item => item.trim() !== ""),
            steps: stepsText.split("\n").filter(item => item.trim() !== "").map((step, index) => ({
                title: `步骤 ${index + 1}`,
                description: step
            })),
        };

        addProject(newProject);
        setIsLoading(false);
        router.push("/explore");
    };

    // 未登录时不显示内容(将重定向)
    if (!user) {
        return null;
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">分享你的创意</h1>
                <p className="text-muted-foreground">将你的 STEAM 项目展示给全世界。</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            项目标题
                        </label>
                        <Input id="title" name="title" placeholder="例如：自制水火箭" required />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <label htmlFor="image" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            封面图片
                        </label>
                        <div className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex flex-col items-center text-muted-foreground">
                                <Upload className="h-8 w-8 mb-2" />
                                <span className="text-xs">点击上传图片 (模拟)</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">所需材料</label>
                        <Textarea
                            placeholder="列出需要的材料..."
                            name="materials"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">制作步骤</label>
                        <Textarea
                            className="min-h-[150px]"
                            placeholder="详细描述制作过程..."
                            name="description"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={() => router.back()}>取消</Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "发布中..." : "发布项目"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
