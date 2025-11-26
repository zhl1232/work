import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, handleApiError } from '@/lib/api/auth'
import {
  validateRequiredString,
  validateEnum,
  validateArray,
  sanitizeSearch,
} from '@/lib/api/validation'

const VALID_CATEGORIES = ['科学', '技术', '工程', '艺术', '数学'] as const

 * POST /api/projects
 * 创建新项目
 * 需要认证
 */
export async function POST(request: Request) {
  const supabase = createClient()
  
  try {
    // 检查用户认证
    const user = await requireAuth(supabase)
    
    const body = await request.json()
    
    // 验证输入
    const title = validateRequiredString(body.title, 'Title', 200)
    const description = validateRequiredString(body.description, 'Description', 2000)
    const category = validateEnum(body.category, 'Category', VALID_CATEGORIES)
    const image_url = validateRequiredString(body.image_url, 'Image URL', 500)
    
    // 验证材料和步骤
    const materials = body.materials 
      ? validateArray(body.materials, 'Materials', 50).map((m: any) => 
          validateRequiredString(m, 'Material', 200)
        )
      : []
    
    const steps = body.steps
      ? validateArray(body.steps, 'Steps', 50).map((step: any) => ({
          title: validateRequiredString(step.title, 'Step title', 200),
          description: validateRequiredString(step.description, 'Step description', 1000),
        }))
      : []
    
    // 创建项目（默认状态为待审核）
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        title,
        description,
        category,
        image_url,
        author_id: user.id,
        status: 'pending' as const, // 新项目默认为待审核状态
      })
      .select()
      .single()
    
    if (projectError) {
      throw projectError
    }
    
    // 添加材料
    if (materials.length > 0 && project) {
      const { error: materialsError } = await supabase
        .from('project_materials')
        .insert(
          materials.map((material: string, index: number) => ({
            project_id: project.id,
            material,
            sort_order: index,
          }))
        )
      
      if (materialsError) {
        // 已记录，但不阻止项目创建
        if (process.env.NODE_ENV === 'development') {
          console.error('Error adding materials:', materialsError)
        }
      }
    }
    
    // 添加步骤
    if (steps.length > 0 && project) {
      const { error: stepsError } = await supabase
        .from('project_steps')
        .insert(
          steps.map((step: { title: string; description: string }, index: number) => ({
            project_id: project.id,
            title: step.title,
            description: step.description,
            sort_order: index,
          }))
        )
      
      if (stepsError) {
        // 已记录，但不阻止项目创建
        if (process.env.NODE_ENV === 'development') {
          console.error('Error adding steps:', stepsError)
        }
      }
    }
    
    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
