import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireRole, handleApiError } from '@/lib/api/auth'

/**
 * DELETE /api/admin/tags/[id]
 * 删除标签
 * 需要审核员或管理员权限
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  try {
    // 检查用户权限
    await requireRole(supabase, ['moderator', 'admin'])
    
    const tagId = parseInt(params.id)
    
    const { error } = await (supabase
      .from('tags') as any)
      .delete()
      .eq('id', tagId)
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ 
      message: 'Tag deleted successfully' 
    })
  } catch (error) {
    return handleApiError(error)
  }
}
