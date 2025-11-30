import { Skeleton } from "@/components/ui/skeleton"

export function LeaderboardItemSkeleton() {
    return (
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8">
                    <Skeleton className="h-6 w-6 rounded" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
            <div className="text-right space-y-1">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-8" />
            </div>
        </div>
    )
}
