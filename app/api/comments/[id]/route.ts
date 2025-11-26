import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, handleApiError } from '@/lib/api/auth'

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
  
  try {
    // 检查用户认证
    await requireAuth(supabase)
    
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
  } catch (error) {
    return handleApiError(error)
  }
}
