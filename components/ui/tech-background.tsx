"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

export const TechBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const mouseRef = useRef({ x: 0, y: 0 });

    // Track theme in a ref to avoid re-triggering the main effect
    const themeRef = useRef(resolvedTheme);

    useEffect(() => {
        themeRef.current = resolvedTheme;
    }, [resolvedTheme]);

    useEffect(() => {
        setMounted(true);
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = {
                x: e.clientX,
                y: e.clientY,
            };
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let width = window.innerWidth;
        let height = window.innerHeight;

        // Configuration
        const gridSize = 40;
        let offset = 0;

        // Particles
        const particles: { x: number; y: number; size: number; speed: number; color: string }[] = [];
        const particleCount = 60;

        const resizeCanvas = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            initParticles();
        };

        const initParticles = () => {
            particles.length = 0;
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 2 + 1,
                    speed: Math.random() * 0.5 + 0.2,
                    color: Math.random() > 0.5 ? "#06b6d4" : "#8b5cf6", // Cyan or Purple
                });
            }
        };

        const drawGrid = (isDark: boolean) => {
            // Reduced opacity for a more subtle look
            const strokeColor = isDark ? "rgba(6, 182, 212, 0.1)" : "rgba(0, 0, 0, 0.05)";

            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1;

            // Perspective Grid
            const centerX = width / 2;

            // Moving floor (Horizontal lines)
            for (let y = offset % gridSize; y < height; y += gridSize) {
                const perspectiveY = y + (height / 2); // Start from middle
                if (perspectiveY > height) continue;

                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Vertical lines with parallax based on mouse
            const mouseOffsetX = (mouseRef.current.x - centerX) * 0.05;

            for (let x = -width; x < width * 2; x += gridSize * 2) {
                ctx.beginPath();
                ctx.moveTo(x + mouseOffsetX, 0);
                ctx.lineTo((x - centerX) * 4 + centerX + mouseOffsetX, height);
                ctx.stroke();
            }

            offset += 0.5;
        };

        const drawParticles = (isDark: boolean) => {
            particles.forEach(p => {
                ctx.fillStyle = isDark ? p.color : "#64748b";
                ctx.globalAlpha = isDark ? 0.8 : 0.4;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                p.y -= p.speed;
                if (p.y < 0) {
                    p.y = height;
                    p.x = Math.random() * width;
                }
            });
            ctx.globalAlpha = 1;
        };

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            // Read theme from ref to avoid dependency cycle
            const isDark = themeRef.current === 'dark';

            // Background Gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            if (isDark) {
                gradient.addColorStop(0, "#020617"); // Slate 950
                gradient.addColorStop(0.5, "#0f172a"); // Slate 900
                gradient.addColorStop(1, "#1e1b4b"); // Indigo 950
            } else {
                gradient.addColorStop(0, "#f8fafc"); // Slate 50
                gradient.addColorStop(1, "#e2e8f0"); // Slate 200
            }
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            drawGrid(isDark);
            drawParticles(isDark);

            // Ambient Glow
            if (isDark) {
                const glow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
                glow.addColorStop(0, "rgba(139, 92, 246, 0.08)"); // Purple glow
                glow.addColorStop(1, "transparent");
                ctx.fillStyle = glow;
                ctx.fillRect(0, 0, width, height);
            }

            animationFrameId = requestAnimationFrame(render);
        };

        resizeCanvas();
        render();

        window.addEventListener("resize", resizeCanvas);

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [mounted]); // Only depend on mounted state

    if (!mounted) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none"
        />
    );
};
