"use client";

import { useEffect } from "react";

export default function ThemeToggle() {
    // 初始化时读取本地存储的主题偏好
    useEffect(() => {
        const saved = localStorage.getItem("theme");
        if (saved === "dark") {
            document.documentElement.classList.add("dark");
        }
    }, []);

    const toggleTheme = () => {
        const html = document.documentElement;
        if (html.classList.contains("dark")) {
            html.classList.remove("dark");
            localStorage.setItem("theme", "light");
        } else {
            html.classList.add("dark");
            localStorage.setItem("theme", "dark");
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="ml-2 rounded px-2 py-1 text-sm transition-colors hover:bg-muted/30"
        >
            切换明暗
        </button>
    );
}
