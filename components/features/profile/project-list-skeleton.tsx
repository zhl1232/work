import { Card, CardContent } from '@/components/ui/card'

export function ProjectListSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          {/* 项目图片骨架 */}
          <div className="h-48 bg-muted animate-pulse" />
          <CardContent className="p-4">
            {/* 标题骨架 */}
            <div className="h-6 w-3/4 bg-muted rounded animate-pulse mb-2" />
            {/* 作者骨架 */}
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse mb-3" />
            {/* 描述骨架 */}
            <div className="space-y-2">
              <div className="h-3 w-full bg-muted rounded animate-pulse" />
              <div className="h-3 w-5/6 bg-muted rounded animate-pulse" />
            </div>
            {/* 底部信息骨架 */}
            <div className="flex justify-between items-center mt-4">
              <div className="h-5 w-16 bg-muted rounded animate-pulse" />
              <div className="h-5 w-12 bg-muted rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
