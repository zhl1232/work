"use client";

import { ModeratorApplicationForm } from "@/components/features/moderator/application-form";

export default function ModeratorApplicationPage() {
    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">申请成为审核员</h1>
                <p className="text-muted-foreground mt-2">
                    帮助我们维护一个积极向上的 STEAM 学习社区
                </p>
            </div>

            <ModeratorApplicationForm />
        </div>
    );
}
