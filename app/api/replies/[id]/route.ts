import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, handleApiError } from '@/lib/api/auth'

/**
 * DELETE /api/replies/[id]
 * 删除讨论回复
 * 用户可以删除自己的回复,管理员/版主可以删除任何回复
 * 权限由 RLS 策略控制
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  try {
    // 检查用户认证
    await requireAuth(supabase)
    const replyId = parseInt(params.id)
    
    // 直接执行删除,RLS 策略会自动检查权限
    // 策略会检查是否为作者或管理员/版主
    const { error } = await supabase
      .from('discussion_replies')
      .delete()
      .eq('id', replyId)
    
    if (error) {
      if (error.code === 'PGRST301' || error.message.includes('permission')) {
        return NextResponse.json(
          { error: 'You do not have permission to delete this reply' },
          { status: 403 }
        )
      }
      throw error
    }
    
    return NextResponse.json({ 
      message: 'Reply deleted successfully' 
    })
  } catch (error) {
    return handleApiError(error)
  }
}
