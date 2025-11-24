import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/projects/[id]/like
 * 点赞/取消点赞项目
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const projectId = parseInt(params.id)
  
  // 检查用户是否登录
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  try {
    // 检查是否已点赞
    const { data: existingLike } = await supabase
      .from('likes')
      .select()
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .single()
    
    if (existingLike) {
      // 取消点赞
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('project_id', projectId)
      
      if (deleteError) {
        throw deleteError
      }
      
      // 减少点赞数
      // @ts-expect-error - Supabase type inference issue
      await supabase.rpc('decrement_project_likes', { project_id: projectId })
      
      return NextResponse.json({ liked: false, action: 'unliked' })
    } else {
      // 添加点赞
      const { error: insertError } = await supabase
        .from('likes')
        // @ts-expect-error - Supabase type inference issue
        .insert({ user_id: user.id, project_id: projectId })
      
      if (insertError) {
        throw insertError
      }
      
      // 增加点赞数
      // @ts-expect-error - Supabase type inference issue
      await supabase.rpc('increment_project_likes', { project_id: projectId })
      
      return NextResponse.json({ liked: true, action: 'liked' })
    }
  } catch (error: any) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/projects/[id]/like
 * 检查当前用户是否已点赞
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const projectId = parseInt(params.id)
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ liked: false })
  }
  
  const { data } = await supabase
    .from('likes')
    .select()
    .eq('user_id', user.id)
    .eq('project_id', projectId)
    .single()
  
  return NextResponse.json({ liked: !!data })
}
