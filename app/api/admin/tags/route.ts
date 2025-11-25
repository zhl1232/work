import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types/database'

/**
 * GET /api/admin/tags
 * 获取所有标签
 */
export async function GET() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true })
  
  if (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
  
  return NextResponse.json(data)
}

/**
 * POST /api/admin/tags
 * 创建新标签
 * 需要审核员或管理员权限
 */
export async function POST(request: NextRequest) {
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
    const { name, category } = body as { name: string; category?: string }
    
    if (!name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      )
    }
    
    const { data, error } = await (supabase
      .from('tags') as any)
      .insert({
        name,
        category,
        created_by: user.id
      })
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('Error creating tag:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
