"use client";

import { motion } from "framer-motion";

interface AchievementToastProps {
    title: string;
    description: string;
    icon: string;
}

export function AchievementToast({ title, description, icon }: AchievementToastProps) {
    return (
        <div className="flex items-center gap-4 w-full">
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 text-2xl border-2 border-yellow-400"
            >
                {icon}
            </motion.div>
            <div className="flex flex-col">
                <motion.h4 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="font-bold text-lg text-foreground"
                >
                    {title}
                </motion.h4>
                <motion.p 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-muted-foreground"
                >
                    {description}
                </motion.p>
            </div>
        </div>
    );
}
