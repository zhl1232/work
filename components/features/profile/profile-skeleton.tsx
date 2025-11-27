import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function ProfileSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* 用户信息卡片骨架 */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-background rounded-2xl p-8 mb-8 border">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* 头像骨架 */}
          <div className="h-24 w-24 rounded-full bg-muted animate-pulse" />
          
          {/* 用户信息骨架 */}
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-4">
              <div className="text-center md:text-left">
                <div className="h-9 w-48 bg-muted rounded animate-pulse mb-2" />
                <div className="h-5 w-64 bg-muted rounded animate-pulse" />
              </div>
              <div className="w-full md:w-64 mt-4 md:mt-0">
                <div className="h-20 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* 编辑按钮骨架 */}
          <div className="h-10 w-24 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* 统计仪表盘骨架 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="p-4 pb-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-8 w-12 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 徽章展示骨架 */}
      <div className="bg-card rounded-lg border p-6 mb-8">
        <div className="h-7 w-48 bg-muted rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 rounded-lg border bg-muted/30">
              <div className="h-12 w-12 bg-muted rounded-full animate-pulse mx-auto mb-2" />
              <div className="h-4 w-16 bg-muted rounded animate-pulse mx-auto mb-1" />
              <div className="h-3 w-20 bg-muted rounded animate-pulse mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* 标签页骨架 */}
      <div className="flex gap-2 mb-6 border-b">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 w-32 bg-muted rounded-t animate-pulse" />
        ))}
      </div>

      {/* 项目列表骨架 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>
    </div>
  )
}
