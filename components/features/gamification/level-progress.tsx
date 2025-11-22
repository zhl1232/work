"use client";

import { useGamification } from "@/context/gamification-context";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface LevelProgressProps {
    className?: string;
    showLabel?: boolean;
}

export function LevelProgress({ className, showLabel = true }: LevelProgressProps) {
    const { level, progress, xp } = useGamification();

    return (
        <div className={cn("flex flex-col gap-2 w-full max-w-xs", className)}>
            {showLabel && (
                <div className="flex justify-between items-end">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-primary">Lv.{level}</span>
                        <span className="text-xs text-muted-foreground">总经验: {xp}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {Math.floor(progress)}%
                    </span>
                </div>
            )}
            <Progress value={progress} className="h-2" />
        </div>
    );
}
