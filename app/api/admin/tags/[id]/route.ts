import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types/database'

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
  
  // 检查用户是否登录
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // 检查用户权限
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: Pick<Profile, 'role'> | null }
  
  if (!profile || !['moderator', 'admin'].includes(profile.role)) {
    return NextResponse.json(
      { error: 'Permission denied: moderator or admin role required' },
      { status: 403 }
    )
  }
  
  try {
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
  } catch (error: any) {
    console.error('Error deleting tag:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
