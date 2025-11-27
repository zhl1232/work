import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireRole, handleApiError } from '@/lib/api/auth'
import { validateEnum, validateOptionalString } from '@/lib/api/validation'
import { callRpc } from '@/lib/supabase/rpc'

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
  
  try {
    // 检查用户权限
    await requireRole(supabase, ['moderator', 'admin'])
    
    const body = await request.json()
    
    // 验证输入
    const action = validateEnum(body.action, 'Action', ['approve', 'reject'] as const)
    const rejection_reason = validateOptionalString(body.rejection_reason, 'Rejection reason', 500)
    
    if (action === 'reject' && !rejection_reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required when rejecting a project' },
        { status: 400 }
      )
    }
    
    const projectId = parseInt(params.id)
    
    if (action === 'approve') {
      // 调用批准函数
      const { error } = await callRpc(supabase, 'approve_project', {
        project_id: projectId
      })
      
      if (error) {
        throw error
      }
      
      return NextResponse.json({ 
        message: 'Project approved successfully',
        status: 'approved'
      })
    } else {
      // 调用拒绝函数
      const { error } = await callRpc(supabase, 'reject_project', {
        project_id: projectId,
        reason: rejection_reason || ''
      })
      
      if (error) {
        throw error
      }
      
      return NextResponse.json({ 
        message: 'Project rejected',
        status: 'rejected'
      })
    }
  } catch (error) {
    return handleApiError(error)
  }
}
