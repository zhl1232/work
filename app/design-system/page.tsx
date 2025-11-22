"use client";

import React from "react";

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen w-full dark bg-background text-foreground p-10 flex flex-col justify-center items-center gap-8 font-sans">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Design System v1.2 Demo</h1>
        <p className="text-muted-foreground">Deep Space Nebula - Interactive Components</p>
      </div>

      <div className="group relative w-[380px] rounded-xl bg-card text-card-foreground transition-all duration-500 hover:-translate-y-1">
        
        {/* Ghost Border Glow */}
        <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-b from-border to-transparent opacity-50 transition-all duration-500 group-hover:from-primary/50 group-hover:to-accent/20 group-hover:opacity-100 group-hover:blur-[1px]"></div>
        
        <div className="relative h-full w-full rounded-xl bg-card p-6 border border-white/5 shadow-xl">
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_10px_-3px_hsl(var(--primary))]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m16 6-4 4-4-4"/><path d="M16 18a4 4 0 0 0-8 0"/></svg>
              </div>
              <div>
                <h3 className="font-bold text-lg tracking-wide">量子核心 V2</h3>
                <p className="text-xs text-muted-foreground">节点 ID: #8X-29A</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent shadow-[0_0_8px_1px_hsl(var(--accent))]"></span>
              </span>
              <span className="text-xs font-medium text-accent">Online</span>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">算力负载</span>
                <span className="font-mono text-primary">78%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-background/50 border border-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-accent w-[78%] shadow-[0_0_10px_0px_hsl(var(--primary))]"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="h-9 rounded-md border border-input bg-transparent px-4 text-sm font-medium hover:bg-accent/10 hover:text-accent hover:border-accent/50 transition-colors">
              查看日志
            </button>
            
            <button className="group/btn relative h-9 overflow-hidden rounded-md bg-primary text-primary-foreground shadow-[0_0_20px_-8px_hsl(var(--primary))] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.8)]">
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover/btn:translate-x-full"></div>
              <span className="relative text-sm font-bold">重启节点</span>
            </button>
          </div>
        </div>
      </div>

      {/* New Data Card Demo */}
      <div className="w-[380px] rounded-xl border border-border bg-card text-card-foreground shadow-2xl">
        <div className="p-6 flex flex-col space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold tracking-tight text-xl">系统负载监控</h3>
            <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent shadow-[0_0_10px_-3px_hsl(var(--accent))]">
              运行中
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            实时监控服务器节点状态与吞吐量
          </p>
        </div>

        <div className="p-6 pt-0 space-y-4">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
            </div>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">CPU 核心利用率</p>
              <p className="text-xs text-muted-foreground">4 核心 / 3.2 GHz</p>
            </div>
            <div className="ml-auto font-medium text-primary">+24.5%</div>
          </div>

          <div className="flex items-center">
            <div className="h-9 w-9 rounded-lg bg-accent/20 flex items-center justify-center text-accent border border-accent/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">网络吞吐量</p>
              <p className="text-xs text-muted-foreground">入站流量监控</p>
            </div>
            <div className="ml-auto font-medium text-accent">1.2 GB/s</div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full shadow-[0_0_20px_-5px_hsl(var(--primary))]">
            查看完整报告
          </button>
        </div>
      </div>

    </div>
  );
}
