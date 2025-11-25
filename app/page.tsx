"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FlaskConical, Rocket, Palette, Calculator, Cpu } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
    return (
        <div className="flex-1">
            <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
                <div className="container mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
                    >
                        激发好奇心，<br />创造你的世界
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8"
                    >
                        加入最大的 STEAM 创意社区。探索科学实验、工程挑战和艺术创作。分享你的作品，启发他人。
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="space-x-4"
                    >
                        <Link href="/explore"><Button size="lg">开始探索</Button></Link>
                        <Link href="/share"><Button size="lg" variant="outline">分享创意</Button></Link>
                    </motion.div>
                </div>
            </section>

            <section className="container mx-auto space-y-6 py-8 md:py-12 lg:py-24">
                <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                    <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl font-bold">
                        按类别探索
                    </h2>
                    <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                        无论你对什么感兴趣，这里都有适合你的项目。
                    </p>
                </div>
                <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
                    <Link href="/explore?category=科学">
                        <CategoryCard icon={<FlaskConical className="h-10 w-10 text-blue-500" />} title="科学" description="化学反应、生物观察、物理现象" delay={0.1} />
                    </Link>
                    <Link href="/explore?category=技术">
                        <CategoryCard icon={<Cpu className="h-10 w-10 text-indigo-500" />} title="技术" description="编程、机器人、电子电路" delay={0.2} />
                    </Link>
                    <Link href="/explore?category=工程">
                        <CategoryCard icon={<Rocket className="h-10 w-10 text-orange-500" />} title="工程" description="结构搭建、机械装置、3D打印" delay={0.3} />
                    </Link>
                    <Link href="/explore?category=艺术">
                        <CategoryCard icon={<Palette className="h-10 w-10 text-pink-500" />} title="艺术" description="数字艺术、手工制作、创意设计" delay={0.4} />
                    </Link>
                    <Link href="/explore?category=数学">
                        <CategoryCard icon={<Calculator className="h-10 w-10 text-green-500" />} title="数学" description="几何图形、逻辑谜题、数据可视化" delay={0.5} />
                    </Link>
                </div>
            </section>
        </div>
    );
}

function CategoryCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay }}
            whileHover={{ scale: 1.05 }}
            className="relative overflow-hidden rounded-lg border bg-background p-2"
        >
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                {icon}
                <div className="space-y-2">
                    <h3 className="font-bold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
        </motion.div>
    )
}
