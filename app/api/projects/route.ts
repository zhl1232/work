import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/projects
 * 获取项目列表
 * 支持参数：
 * - category: 分类筛选
 * - search: 搜索关键词
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  
  const supabase = createClient()
  
  // 构建查询
  let query = supabase
    .from('projects')
    .select(`
      *,
      profiles:author_id (
        username,
        display_name,
        avatar_url
      ),
      project_materials (*),
      project_steps (*)
    `)
    .order('created_at', { ascending: false })
  
  // 应用筛选
  if (category && category !== '全部') {
    query = query.eq('category', category)
  }
  
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
  
  return NextResponse.json(data)
}

/**
 * POST /api/projects
 * 创建新项目
 * 需要认证
 */
export async function POST(request: Request) {
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
    const body = await request.json()
    const { title, description, category, materials, steps, image_url } = body
    
    // 创建项目（默认状态为待审核）
    const { data: project, error: projectError } = await supabase
      .from('projects')
      // @ts-expect-error - Supabase type inference issue
      .insert({
        title,
        description,
        category,
        image_url,
        author_id: user.id,
        status: 'pending', // 新项目默认为待审核状态
      })
      .select()
      .single()
    
    if (projectError) {
      throw projectError
    }
    
    // 添加材料
    if (materials && materials.length > 0) {
      const { error: materialsError } = await supabase
        .from('project_materials')
        .insert(
          materials.map((material: string, index: number) => ({
            project_id: (project as any).id,
            material,
            sort_order: index,
          }))
        )
      
      if (materialsError) {
        console.error('Error adding materials:', materialsError)
      }
    }
    
    // 添加步骤
    if (steps && steps.length > 0) {
      const { error: stepsError } = await supabase
        .from('project_steps')
        .insert(
          steps.map((step: { title: string; description: string }, index: number) => ({
            project_id: (project as any).id,
            title: step.title,
            description: step.description,
            sort_order: index,
          }))
        )
      
      if (stepsError) {
        console.error('Error adding steps:', stepsError)
      }
    }
    
    return NextResponse.json(project, { status: 201 })
  } catch (error: any) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
