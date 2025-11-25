import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types/database'

/**
 * POST /api/admin/projects/[id]/review
 * 审核项目（批准或拒绝）
 * 需要审核员或管理员权限
 */
export async function POST(
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
    const body = await request.json()
    const { action, rejection_reason } = body as { action: string; rejection_reason?: string }
    
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      )
    }
    
    if (action === 'reject' && !rejection_reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required when rejecting a project' },
        { status: 400 }
      )
    }
    
    const projectId = parseInt(params.id)
    
    if (action === 'approve') {
      // 调用批准函数
      const { error } = await supabase.rpc('approve_project', {
        project_id: projectId
      } as any)
      
      if (error) {
        throw error
      }
      
      return NextResponse.json({ 
        message: 'Project approved successfully',
        status: 'approved'
      })
    } else {
      // 调用拒绝函数
      const { error } = await supabase.rpc('reject_project', {
        project_id: projectId,
        reason: rejection_reason
      } as any)
      
      if (error) {
        throw error
      }
      
      return NextResponse.json({ 
        message: 'Project rejected',
        status: 'rejected'
      })
    }
  } catch (error: any) {
    console.error('Error reviewing project:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
