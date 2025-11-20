"use client";

import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { useState } from "react";
import { Check } from "lucide-react";

interface ConfettiButtonProps extends React.ComponentProps<typeof Button> {
    isCompleted?: boolean;
}

import { useEffect } from "react";

export function ConfettiButton({ children, className, isCompleted, ...props }: ConfettiButtonProps) {
    const [isDone, setIsDone] = useState(isCompleted || false);

    useEffect(() => {
        if (isCompleted !== undefined) {
            setIsDone(isCompleted);
        }
    }, [isCompleted]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        // Allow clicking even if done (to toggle off)

        if (!isDone) {
            // Only show confetti if we are marking as done (turning ON)
            const rect = event.currentTarget.getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { x, y },
                colors: ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b'],
            });
        }

        // Optimistic update for UI responsiveness
        setIsDone(!isDone);

        if (props.onClick) {
            props.onClick(event);
        }
    };

    return (
        <Button
            onClick={handleClick}
            className={className}
            variant={isDone ? "secondary" : "default"}
            {...props}
        >
            {isDone ? <><Check className="mr-2 h-4 w-4" /> 已完成</> : children}
        </Button>
    );
}
