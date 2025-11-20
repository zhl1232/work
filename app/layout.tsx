import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ProjectProvider } from "@/context/project-context";
import Link from "next/link";
import { Rocket, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/features/global-search";
import { ToastProvider } from "@/components/ui/toast";
import ThemeToggle from "@/components/ThemeToggle";


const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "STEAM Explore & Share",
    description: "Discover and share amazing STEAM projects.",
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="zh">
            <body className={inter.className}>
                <ProjectProvider>
                    <ToastProvider>
                        <div className="flex min-h-screen flex-col bg-background">
                            {/* Header */}
                            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                                <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-8">
                                    {/* Logo */}
                                    <div className="mr-4 hidden md:flex items-center">
                                        <Link className="mr-6 flex items-center space-x-2" href="/">
                                            <Rocket className="h-6 w-6 text-primary" />
                                            <span className="hidden font-bold sm:inline-block text-lg">STEAM 探索</span>
                                        </Link>
                                        {/* 主导航 */}
                                        <nav className="flex items-center gap-6 text-sm font-medium">
                                            <Link href="/explore" className="transition-colors hover:text-primary text-foreground/60 hover:bg-accent/50 px-3 py-2 rounded-md">发现</Link>
                                            <Link href="/community" className="transition-colors hover:text-primary text-foreground/60 hover:bg-accent/50 px-3 py-2 rounded-md">社区</Link>
                                            <Link href="/share" className="transition-colors hover:text-primary text-foreground/60 hover:bg-accent/50 px-3 py-2 rounded-md">分享</Link>
                                            <Link href="/profile" className="transition-colors hover:text-primary text-foreground/60 hover:bg-accent/50 px-3 py-2 rounded-md">我的</Link>
                                            <ThemeToggle />
                                        </nav>
                                    </div>
                                    {/* 右侧搜索和通知 */}
                                    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                                        <div className="w-full flex-1 md:w-auto md:flex-none">
                                            <GlobalSearch />
                                        </div>
                                        <nav className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="text-muted-foreground">
                                                <Bell className="h-5 w-5" />
                                            </Button>
                                            <Link href="/profile">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-secondary p-[1px]">
                                                    <div className="h-full w-full rounded-full bg-background" />
                                                </div>
                                            </Link>
                                        </nav>
                                    </div>
                                </div>
                            </header>
                            {/* Main content */}
                            <main className="flex-1">{children}</main>
                        </div>
                    </ToastProvider>
                </ProjectProvider>
            </body>
        </html>
    );
}
