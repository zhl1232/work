import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * DELETE /api/comments/[id]
 * 删除评论
 * 用户可以删除自己的评论，管理员可以删除任何评论
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  // 检查用户是否登录
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  try {
    const commentId = parseInt(params.id)
    
    // RLS 策略会自动处理权限检查
    // 只有评论作者或管理员才能删除
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ 
      message: 'Comment deleted successfully' 
    })
  } catch (error: any) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
