"use client";

import React, { Suspense } from "react";
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

// 动态导入设计系统组件
const DesignSystemContent = dynamic(() => import('@/components/features/design-system-content'), {
  loading: () => <DesignSystemSkeleton />,
  ssr: false
});

function DesignSystemSkeleton() {
  return (
    <div className="min-h-screen w-full dark bg-background text-foreground p-10 flex flex-col justify-center items-center gap-8">
      <div className="text-center mb-8 space-y-2">
        <Skeleton className="h-10 w-80 mx-auto" />
        <Skeleton className="h-6 w-60 mx-auto" />
      </div>

      <Card className="w-[380px] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2 w-full" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </Card>

      <Card className="w-[380px] p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-full" />
      </Card>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <Suspense fallback={<DesignSystemSkeleton />}>
      <DesignSystemContent />
    </Suspense>
  );
}
