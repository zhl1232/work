"use client";


import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PixelEditor } from "@/components/features/pixel-editor";
import { ConfettiButton } from "@/components/ui/confetti-button";
import { useProjects } from "@/context/project-context";

export default function PixelArtPage() {
    const { toggleProjectCompleted, isCompleted } = useProjects();
    const projectId = "pixel-art";
    const isProjectCompleted = isCompleted(projectId);

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-8 max-w-5xl">
                <div className="mb-8 flex items-center justify-between">
                    <Link href="/explore" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" /> 返回探索
                    </Link>
                    <div className="flex gap-2">
                        <ConfettiButton
                            isCompleted={isProjectCompleted}
                            onClick={() => toggleProjectCompleted(projectId)}
                        >
                            完成挑战！
                        </ConfettiButton>
                    </div>
                </div>

                <div className="text-center mb-10 space-y-4">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                        像素艺术工坊
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        体验经典的 8-bit 艺术创作！在这里，你可以像早期的游戏设计师一样，用一个个方块构建出精彩的世界。
                        尝试画出你最喜欢的游戏角色，或者设计一个独特的图标。
                    </p>
                </div>

                <PixelEditor />

                <div className="mt-16 grid md:grid-cols-3 gap-8">
                    <div className="p-6 rounded-xl border bg-card">
                        <h3 className="font-bold text-lg mb-2">什么是像素画？</h3>
                        <p className="text-sm text-muted-foreground">
                            像素画（Pixel Art）是一种数字艺术形式，通过逐个像素点（Pixel）的组合来创作图像。它起源于早期的电脑和游戏机时代。
                        </p>
                    </div>
                    <div className="p-6 rounded-xl border bg-card">
                        <h3 className="font-bold text-lg mb-2">如何创作？</h3>
                        <p className="text-sm text-muted-foreground">
                            1. 构思你的图案轮廓。<br />
                            2. 用黑色或深色勾勒线条。<br />
                            3. 填充颜色，注意光影的变化。<br />
                            4. 善用&quot;撤销&quot;功能不断修正。
                        </p>
                    </div>
                    <div className="p-6 rounded-xl border bg-card">
                        <h3 className="font-bold text-lg mb-2">挑战任务</h3>
                        <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                            <li>画一个爱心 ❤️</li>
                            <li>画一个笑脸 🙂</li>
                            <li>画一棵树 🌲</li>
                            <li>画一只小猫 🐱</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
